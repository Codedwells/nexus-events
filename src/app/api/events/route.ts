import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../auth/[...nextauth]/route';

// Get all events
export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const categoryId = searchParams.get('categoryId');
		const search = searchParams.get('search');

		let whereClause = {};

		if (categoryId) {
			whereClause = { ...whereClause, categoryId };
		}

		if (search) {
			whereClause = {
				...whereClause,
				OR: [
					{ title: { contains: search, mode: 'insensitive' } },
					{ description: { contains: search, mode: 'insensitive' } }
				]
			};
		}

		const events = await prisma.event.findMany({
			where: whereClause,
			include: {
				category: true,
				organizer: {
					select: { id: true, fullName: true, email: true }
				},
				_count: {
					select: { attendees: true }
				}
			},
			orderBy: { dateTime: 'asc' }
		});

		return NextResponse.json({ events });
	} catch (error) {
		console.error('Error fetching events:', error);
		return NextResponse.json(
			{ error: 'Error fetching events' },
			{ status: 500 }
		);
	}
}

// Create a new event
export async function POST(request: Request) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { title, description, dateTime, venue, categoryId } =
			await request.json();

		const event = await prisma.event.create({
			data: {
				title,
				description,
				dateTime: new Date(dateTime),
				venue,
				categoryId,
				organizerId: session.user.id
			},
			include: {
				category: true,
				organizer: {
					select: { id: true, fullName: true, email: true }
				}
			}
		});

		return NextResponse.json({ event }, { status: 201 });
	} catch (error) {
		console.error('Error creating event:', error);
		return NextResponse.json(
			{ error: 'Error creating event' },
			{ status: 500 }
		);
	}
}
