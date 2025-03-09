import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const id = params.id;

		// Using raw SQL to fetch event with details including creator's name and email
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
      WHERE e.id = ${id}
    `;

		if (!events || events.length === 0) {
			return NextResponse.json({ error: 'Event not found' }, { status: 404 });
		}

		// Get attendees for this event
		const attendees = await prisma.$queryRaw`
      SELECT 
        a.id, a.joinedAt, 
        u.id as userId, u.fullName, u.email
      FROM Attendee a
      JOIN User u ON a.userId = u.id
      WHERE a.eventId = ${id}
      ORDER BY a.joinedAt DESC
    `;

		const event = events[0];

		// Convert BigInt values to regular numbers before JSON serialization
		const serializedEvent = {
			...event,
			attendeeCount: Number(event.attendeeCount)
		};

		return NextResponse.json({ ...serializedEvent, attendees });
	} catch (error) {
		console.error('Failed to fetch event:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch event' },
			{ status: 500 }
		);
	}
}

export async function PUT(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const id = params.id;
		const userId = session.user.id;
		const { title, description, dateTime, venue, categoryId } =
			await request.json();

		// Validate required fields
		if (!title || !description || !dateTime || !venue || !categoryId) {
			return NextResponse.json(
				{ error: 'Missing required fields' },
				{ status: 400 }
			);
		}

		// Check if event exists and belongs to the user
		const events = await prisma.$queryRaw`
      SELECT * FROM Event WHERE id = ${id}
    `;

		if (!events || events.length === 0) {
			return NextResponse.json({ error: 'Event not found' }, { status: 404 });
		}

		const event = events[0];

		// Check if user is the organizer or an admin
		if (event.organizerId !== userId && session.user.role !== 'ADMIN') {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		const formattedDateTime = new Date(dateTime).toISOString();

		// Update the event using raw SQL
		await prisma.$executeRaw`
      UPDATE Event
      SET 
        title = ${title},
        description = ${description},
        dateTime = ${formattedDateTime},
        venue = ${venue},
        categoryId = ${categoryId}
      WHERE id = ${id}
    `;

		// Fetch the updated event
		const updatedEvents = await prisma.$queryRaw`
      SELECT 
        e.id, e.title, e.description, e.dateTime, e.venue, e.organizerId, e.categoryId, e.createdAt,
        u.fullName as organizerName,
        c.name as categoryName
      FROM Event e
      JOIN User u ON e.organizerId = u.id
      JOIN Category c ON e.categoryId = c.id
      WHERE e.id = ${id}
    `;

		return NextResponse.json(updatedEvents[0]);
	} catch (error) {
		console.error('Failed to update event:', error);
		return NextResponse.json(
			{ error: 'Failed to update event' },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const id = params.id;
		const userId = session.user.id;

		// Check if event exists
		const events = await prisma.$queryRaw`
      SELECT * FROM Event WHERE id = ${id}
    `;

		if (!events || events.length === 0) {
			return NextResponse.json({ error: 'Event not found' }, { status: 404 });
		}

		const event = events[0];

		// Check if user is the organizer or an admin
		if (event.organizerId !== userId && session.user.role !== 'ADMIN') {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		// Delete event using raw SQL
		// The related attendees will be automatically deleted due to onDelete: Cascade in the schema
		await prisma.$executeRaw`DELETE FROM Event WHERE id = ${id}`;

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Failed to delete event:', error);
		return NextResponse.json(
			{ error: 'Failed to delete event' },
			{ status: 500 }
		);
	}
}
