import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { createId } from '@paralleldrive/cuid2';

// Attend an event
export async function POST(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const eventId = params.id;
		const userId = session.user.id;

		// Check if event exists
		const events = await prisma.$queryRaw`
      SELECT * FROM Event WHERE id = ${eventId}
    `;

		if (!events || events.length === 0) {
			return NextResponse.json({ error: 'Event not found' }, { status: 404 });
		}

		// Check if user is already attending
		const existingAttendances = await prisma.$queryRaw`
      SELECT * FROM Attendee 
      WHERE userId = ${userId} AND eventId = ${eventId}
    `;

		if (existingAttendances && existingAttendances.length > 0) {
			return NextResponse.json(
				{ error: 'Already attending this event' },
				{ status: 400 }
			);
		}

		// Use cuid2 instead of random string
		const attendeeId = createId();
		const now = new Date().toISOString();

		// Create attendee record using raw SQL
		await prisma.$executeRaw`
      INSERT INTO Attendee (id, userId, eventId, joinedAt)
      VALUES (${attendeeId}, ${userId}, ${eventId}, ${now})
    `;

		// Get the created record
		const attendees = await prisma.$queryRaw`
      SELECT a.*, u.fullName, u.email
      FROM Attendee a
      JOIN User u ON a.userId = u.id
      WHERE a.id = ${attendeeId}
    `;

		return NextResponse.json(attendees[0], { status: 201 });
	} catch (error) {
		console.error('Failed to attend event:', error);
		return NextResponse.json(
			{ error: 'Failed to attend event' },
			{ status: 500 }
		);
	}
}

// Cancel attendance
export async function DELETE(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const eventId = params.id;
		const userId = session.user.id;

		// Check if user is attending
		const attendances = await prisma.$queryRaw`
      SELECT * FROM Attendee 
      WHERE userId = ${userId} AND eventId = ${eventId}
    `;

		if (!attendances || attendances.length === 0) {
			return NextResponse.json(
				{ error: 'Not attending this event' },
				{ status: 404 }
			);
		}

		// Remove attendance record
		await prisma.$executeRaw`
      DELETE FROM Attendee 
      WHERE userId = ${userId} AND eventId = ${eventId}
    `;

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Failed to cancel attendance:', error);
		return NextResponse.json(
			{ error: 'Failed to cancel attendance' },
			{ status: 500 }
		);
	}
}
