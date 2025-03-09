import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/route';

// Get a single event by id
export async function GET(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const event = await prisma.event.findUnique({
			where: { id: params.id },
			include: {
				category: true,
				organizer: {
					select: { id: true, fullName: true, email: true }
				},
				attendees: {
					include: {
						user: {
							select: { id: true, fullName: true, email: true }
						}
					}
				}
			}
		});

		if (!event) {
			return NextResponse.json({ error: 'Event not found' }, { status: 404 });
		}

		return NextResponse.json({ event });
	} catch (error) {
		console.error('Error fetching event:', error);
		return NextResponse.json(
			{ error: 'Error fetching event' },
			{ status: 500 }
		);
	}
}

// Update an event
export async function PUT(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const event = await prisma.event.findUnique({
			where: { id: params.id }
		});

		if (!event) {
			return NextResponse.json({ error: 'Event not found' }, { status: 404 });
		}

		// Check if user is the organizer or admin
		if (
			event.organizerId !== session.user.id &&
			session.user.role !== 'ADMIN'
		) {
			return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
		}

		const { title, description, dateTime, venue, categoryId } =
			await request.json();

		const updatedEvent = await prisma.event.update({
			where: { id: params.id },
			data: {
				title,
				description,
				dateTime: new Date(dateTime),
				venue,
				categoryId
			},
			include: {
				category: true,
				organizer: {
					select: { id: true, fullName: true, email: true }
				}
			}
		});

		return NextResponse.json({ event: updatedEvent });
	} catch (error) {
		console.error('Error updating event:', error);
		return NextResponse.json(
			{ error: 'Error updating event' },
			{ status: 500 }
		);
	}
}

// Delete an event
export async function DELETE(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const event = await prisma.event.findUnique({
			where: { id: params.id }
		});

		if (!event) {
			return NextResponse.json({ error: 'Event not found' }, { status: 404 });
		}

		// Check if user is the organizer or admin
		if (
			event.organizerId !== session.user.id &&
			session.user.role !== 'ADMIN'
		) {
			return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
		}

		await prisma.event.delete({
			where: { id: params.id }
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting event:', error);
		return NextResponse.json(
			{ error: 'Error deleting event' },
			{ status: 500 }
		);
	}
}
