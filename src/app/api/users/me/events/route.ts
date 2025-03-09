import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../../../auth/[...nextauth]/route';

// Get events organized by the current user
export async function GET(request: Request) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const type = searchParams.get('type') || 'organized';

		if (type === 'organized') {
			const events = await prisma.event.findMany({
				where: {
					organizerId: session.user.id
				},
				include: {
					category: true,
					organizer: {
						select: { id: true, fullName: true }
					},
					_count: {
						select: { attendees: true }
					}
				},
				orderBy: { dateTime: 'asc' }
			});

			return NextResponse.json({ events });
		} else if (type === 'attending') {
			const attendances = await prisma.attendee.findMany({
				where: {
					userId: session.user.id
				},
				include: {
					event: {
						include: {
							category: true,
							organizer: {
								select: { id: true, fullName: true }
							},
							_count: {
								select: { attendees: true }
							}
						}
					}
				},
				orderBy: {
					event: {
						dateTime: 'asc'
					}
				}
			});

			const events = attendances.map((a) => a.event);
			return NextResponse.json({ events });
		}

		return NextResponse.json(
			{ error: 'Invalid type parameter' },
			{ status: 400 }
		);
	} catch (error) {
		console.error('Error fetching user events:', error);
		return NextResponse.json(
			{ error: 'Error fetching user events' },
			{ status: 500 }
		);
	}
}
