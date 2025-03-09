import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../../../auth/[...nextauth]/route';

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
		const event = await prisma.event.findUnique({
			where: { id: eventId }
		});

		if (!event) {
			return NextResponse.json({ error: 'Event not found' }, { status: 404 });
		}

		// Check if user is already attending
		const existingAttendance = await prisma.attendee.findFirst({
			where: {
				userId,
				eventId
			}
		});

		if (existingAttendance) {
			return NextResponse.json(
				{ error: 'Already attending this event' },
				{ status: 400 }
			);
		}

		// Create attendee record
		const attendee = await prisma.attendee.create({
			data: {
				userId,
				eventId
			}
		});

		return NextResponse.json({ attendee }, { status: 201 });
	} catch (error) {
		console.error('Error attending event:', error);
		return NextResponse.json(
			{ error: 'Error attending event' },
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

		// Check if attendance exists
		const attendance = await prisma.attendee.findFirst({
			where: {
				userId,
				eventId
			}
		});

		if (!attendance) {
			return NextResponse.json(
				{ error: 'Not attending this event' },
				{ status: 404 }
			);
		}

		// Delete attendance
		await prisma.attendee.delete({
			where: {
				id: attendance.id
			}
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error cancelling attendance:', error);
		return NextResponse.json(
			{ error: 'Error cancelling attendance' },
			{ status: 500 }
		);
	}
}
