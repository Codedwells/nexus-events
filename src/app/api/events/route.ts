import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../auth/[...nextauth]/route';
import { Prisma } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

export async function GET() {
	try {
		// Using raw SQL query for fetching events with creator email
		const events = await prisma.$queryRaw`
      SELECT 
        e.id, e.title, e.description, e.dateTime, e.venue, e.organizerId, e.categoryId, e.createdAt,
        u.fullName as organizerName,
        u.email as organizerEmail,
        c.name as categoryName,
        (SELECT COUNT(*) FROM Attendee a WHERE a.eventId = e.id) as attendeeCount
      FROM Event e
      JOIN User u ON e.organizerId = u.id
      JOIN Category c ON e.categoryId = c.id
      ORDER BY e.dateTime DESC
    `;

		// Convert BigInt values to regular numbers before JSON serialization
		const serializedEvents = events.map((event: any) => ({
			...event,
			attendeeCount: Number(event.attendeeCount)
		}));

		return NextResponse.json(serializedEvents);
	} catch (error) {
		console.error('Failed to fetch events:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch events' },
			{ status: 500 }
		);
	}
}

export async function POST(request: Request) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { title, description, dateTime, venue, categoryId } =
			await request.json();

		// Validate required fields
		if (!title || !description || !dateTime || !venue || !categoryId) {
			return NextResponse.json(
				{ error: 'Missing required fields' },
				{ status: 400 }
			);
		}

		// Using raw SQL for creating an event that matches schema
		const userId = session.user.id;
		const formattedDateTime = new Date(dateTime).toISOString();
		const eventId = createId(); // Use cuid2 instead of random string

		await prisma.$executeRaw`
      INSERT INTO "Event" (
        id, 
        title, 
        description, 
        "dateTime", 
        venue, 
        "organizerId", 
        "categoryId", 
        "createdAt"
      )
      VALUES (
        ${eventId}, 
        ${title}, 
        ${description}, 
        ${formattedDateTime}, 
        ${venue}, 
        ${userId}, 
        ${categoryId}, 
        datetime('now')
      )
    `;

		// Fetch the created event with updated column names
		const createdEvent = await prisma.$queryRaw`
      SELECT 
        e.id, 
        e.title, 
        e.description, 
        e."dateTime", 
        e.venue, 
        e."organizerId", 
        e."categoryId", 
        e."createdAt",
        u."fullName" as organizerName,
        c.name as categoryName
      FROM "Event" e
      JOIN "User" u ON e."organizerId" = u.id
      JOIN "Category" c ON e."categoryId" = c.id
      WHERE e.id = ${eventId}
    `;

		return NextResponse.json(createdEvent[0], { status: 201 });
	} catch (error) {
		console.error('Failed to create event:', error);
		return NextResponse.json(
			{
				error: 'Failed to create event',
				details: String(error)
			},
			{ status: 500 }
		);
	}
}
