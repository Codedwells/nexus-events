import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { Session } from 'next-auth';

// Define types for attendee data
interface AttendeeData {
	id: string;
	registeredAt: Date;
	userId: string;
	fullName: string;
	email: string;
}

interface EventCapacityData {
	capacity: number;
	currentAttendees: string | number;
}

interface AttendeeCreationResult {
	id: string;
	registeredAt: Date;
}

interface AttendanceDeleteResult {
	id: string;
}

// GET attendees for an event
export async function GET(
	request: Request,
	{ params }: { params: { id: string } }
): Promise<NextResponse> {
	try {
		// Correct way to access params in asynchronous context
		const { id } = await params;
		const eventId = id;

		// Using raw SQL query
		const attendees = await prisma.$queryRaw<AttendeeData[]>`
      SELECT 
        a.id,
        a.created_at as "registeredAt",
        u.id as "userId",
        u.full_name as "fullName",
        u.email
      FROM "Attendee" a
      JOIN "User" u ON a.user_id = u.id
      WHERE a.event_id = ${eventId}
      ORDER BY a.created_at ASC
    `;

		return NextResponse.json({ attendees });
	} catch (error) {
		console.error('Error fetching attendees:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch attendees' },
			{ status: 500 }
		);
	}
}

// POST register for an event
export async function POST(
	request: Request,
	{ params }: { params: { id: string } }
): Promise<NextResponse> {
	try {
		const session = (await getServerSession(authOptions)) as Session | null;
		// Correct way to access params in asynchronous context
		const { id } = await params;
		const eventId = id;

		if (!session || !session.user || !session.user.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Check if event exists and has capacity
		const event = await prisma.$queryRaw<EventCapacityData[]>`
      SELECT 
        e.capacity,
        (SELECT COUNT(*) FROM "Attendee" a WHERE a.event_id = e.id) as "currentAttendees"
      FROM "Event" e
      WHERE e.id = ${eventId}
      LIMIT 1
    `;

		if (event.length === 0) {
			return NextResponse.json({ error: 'Event not found' }, { status: 404 });
		}

		if (Number(event[0].currentAttendees) >= event[0].capacity) {
			return NextResponse.json(
				{ error: 'Event is at full capacity' },
				{ status: 400 }
			);
		}

		// Check if user is already registered
		const existingRegistration = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id 
      FROM "Attendee"
      WHERE user_id = ${session.user.id} AND event_id = ${eventId}
      LIMIT 1
    `;

		if (existingRegistration.length > 0) {
			return NextResponse.json(
				{ error: 'You are already registered for this event' },
				{ status: 400 }
			);
		}

		// Register user for the event
		const result = await prisma.$queryRaw<AttendeeCreationResult[]>`
      INSERT INTO "Attendee" (
        user_id,
        event_id,
        created_at,
        updated_at
      )
      VALUES (
        ${session.user.id},
        ${eventId},
        NOW(),
        NOW()
      )
      RETURNING id, created_at as "registeredAt"
    `;

		return NextResponse.json({
			attendance: {
				id: result[0].id,
				registeredAt: result[0].registeredAt,
				user: {
					id: session.user.id,
					fullName: session.user.name || '',
					email: session.user.email || ''
				}
			}
		});
	} catch (error) {
		console.error('Error registering for event:', error);
		return NextResponse.json(
			{ error: 'Failed to register for event' },
			{ status: 500 }
		);
	}
}

// DELETE cancel registration
export async function DELETE(
	request: Request,
	{ params }: { params: { id: string } }
): Promise<NextResponse> {
	try {
		const session = (await getServerSession(authOptions)) as Session | null;
		// Correct way to access params in asynchronous context
		const { id } = await params;
		const eventId = id;

		if (!session || !session.user || !session.user.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Find and delete the registration
		const result = await prisma.$queryRaw<AttendanceDeleteResult[]>`
      DELETE FROM "Attendee"
      WHERE user_id = ${session.user.id} AND event_id = ${eventId}
      RETURNING id
    `;

		if (result.length === 0) {
			return NextResponse.json(
				{ error: 'Registration not found' },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			message: 'Registration cancelled successfully'
		});
	} catch (error) {
		console.error('Error cancelling registration:', error);
		return NextResponse.json(
			{ error: 'Failed to cancel registration' },
			{ status: 500 }
		);
	}
}
