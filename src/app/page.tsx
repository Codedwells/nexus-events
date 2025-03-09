import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import EventCard from '@/components/EventCard';
import Hero from '@/components/home/hero';

export default async function Home() {
	const session = await getServerSession(authOptions);

	const upcomingEvents = await prisma.event.findMany({
		where: {
			dateTime: {
				gte: new Date()
			}
		},
		include: {
			category: true,
			organizer: {
				select: { fullName: true }
			},
			_count: {
				select: { attendees: true }
			}
		},
		orderBy: { dateTime: 'asc' },
		take: 6
	});

	return (
		<main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-blue-50 to-white p-6 md:p-24">
			<div className="w-full max-w-6xl">
				<Hero />

				<section className="mb-16">
					<div className="mb-6 flex items-center justify-between">
						<h2 className="text-2xl font-bold">Upcoming Events</h2>
						<Link href="/events" className="text-blue-600 hover:underline">
							View All
						</Link>
					</div>

					{upcomingEvents.length > 0 ? (
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
							{upcomingEvents.map((event) => (
								<EventCard key={event.id} event={event} />
							))}
						</div>
					) : (
						<div className="rounded-lg bg-gray-50 py-12 text-center">
							<p className="text-gray-500">No upcoming events yet</p>
							<Link
								href="/events/create"
								className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
							>
								Create First Event
							</Link>
						</div>
					)}
				</section>
			</div>
		</main>
	);
}
