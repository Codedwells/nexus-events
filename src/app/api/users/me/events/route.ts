import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { Session } from 'next-auth';

// Define a type for the raw event data returned from SQL
interface RawEventData {
	id: string;
	title: string;
	description: string;
	venue: string; // Changed from location to venue to match schema
	dateTime: Date; // Changed from date_time to dateTime to match schema
	categoryId: string | null;
	categoryName: string | null;
	organizerId: string;
	organizerFullName: string;
	attendeeCount: string | number;
	// Removed fields not in schema: image_url, price, capacity, categorySlug, categoryImageUrl
}

// Define a type for the transformed event
interface TransformedEvent {
	id: string;
	title: string;
	description: string;
	venue: string; // Changed from location to venue to match schema
	dateTime: Date; // Changed from dateTime to match schema direct property
	category: {
		id: string;
		name: string;
	} | null;
	organizer: {
		id: string;
		fullName: string;
	};
	_count: {
		attendees: number;
	};
}

// Get events organized by the current user
export async function GET(request: Request): Promise<NextResponse> {
	try {
		const session = (await getServerSession(authOptions)) as Session | null;

		console.log('Session data:', JSON.stringify(session, null, 2));

		if (!session || !session.user || !session.user.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const type = searchParams.get('type') || 'organized';

		if (type === 'organized') {
			try {
				// Using raw SQL query instead of Prisma query builder
				const events = await prisma.$queryRaw`
          SELECT 
            e.id,
            e.title,
            e.description,
            e.venue, 
            e."dateTime",
            e."categoryId", 
            e."organizerId",
            c.id as "categoryId", 
            c.name as "categoryName",
            u.id as "organizerId", 
            u."fullName" as "organizerFullName",
            COALESCE(COUNT(a.id), 0) as "attendeeCount"
          FROM "Event" e
          LEFT JOIN "Category" c ON e."categoryId" = c.id
          LEFT JOIN "User" u ON e."organizerId" = u.id
          LEFT JOIN "Attendee" a ON a."eventId" = e.id
          WHERE e."organizerId" = ${session.user.id}
          GROUP BY e.id, c.id, u.id
          ORDER BY e."dateTime" ASC
        `;

				console.log('Fetched events count:', events.length);

				// Transform the raw SQL result to match the structure expected by the frontend
				const transformedEvents: TransformedEvent[] = events.map((event) => ({
					id: event.id,
					title: event.title,
					description: event.description,
					venue: event.venue, // Changed from location to venue
					dateTime: event.dateTime, // Changed from date_time to dateTime
					category: event.categoryId
						? {
								id: event.categoryId,
								name: event.categoryName!
							}
						: null,
					organizer: {
						id: event.organizerId,
						fullName: event.organizerFullName
					},
					_count: {
						attendees:
							typeof event.attendeeCount === 'string'
								? parseInt(event.attendeeCount, 10)
								: Number(event.attendeeCount)
					}
				}));

				return NextResponse.json({ events: transformedEvents });
			} catch (sqlError) {
				console.error('SQL Error in organized events:', sqlError);
				return NextResponse.json(
					{
						error: 'Database error while fetching organized events',
						details: String(sqlError)
					},
					{ status: 500 }
				);
			}
		} else if (type === 'attending') {
			try {
				// Using raw SQL query for events the user is attending
				const events = await prisma.$queryRaw`
          SELECT 
            e.id,
            e.title,
            e.description,
            e.venue, 
            e."dateTime",
            e."categoryId", 
            e."organizerId",
            c.id as "categoryId", 
            c.name as "categoryName",
            u.id as "organizerId", 
            u."fullName" as "organizerFullName",
            COALESCE(COUNT(a2.id), 0) as "attendeeCount"
          FROM "Event" e
          JOIN "Attendee" att ON e.id = att."eventId"
          LEFT JOIN "Category" c ON e."categoryId" = c.id
          LEFT JOIN "User" u ON e."organizerId" = u.id
          LEFT JOIN "Attendee" a2 ON a2."eventId" = e.id
          WHERE att."userId" = ${session.user.id}
          GROUP BY e.id, c.id, u.id
          ORDER BY e."dateTime" ASC
        `;

				// Transform the raw SQL result
				const transformedEvents: TransformedEvent[] = events.map((event) => ({
					id: event.id,
					title: event.title,
					description: event.description,
					venue: event.venue,
					dateTime: event.dateTime,
					category: event.categoryId
						? {
								id: event.categoryId,
								name: event.categoryName!
							}
						: null,
					organizer: {
						id: event.organizerId,
						fullName: event.organizerFullName
					},
					_count: {
						attendees:
							typeof event.attendeeCount === 'string'
								? parseInt(event.attendeeCount, 10)
								: Number(event.attendeeCount)
					}
				}));

				return NextResponse.json({ events: transformedEvents });
			} catch (sqlError) {
				console.error('SQL Error in attending events:', sqlError);
				return NextResponse.json(
					{
						error: 'Database error while fetching attending events',
						details: String(sqlError)
					},
					{ status: 500 }
				);
			}
		}
		return NextResponse.json(
			{ error: 'Invalid type parameter' },
			{ status: 400 }
		);
	} catch (error) {
		console.error('Error fetching events:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch events', details: String(error) },
			{ status: 500 }
		);
	}
}
