import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import EventCard from '@/components/EventCard';

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
				<section className="mb-16 text-center">
					<h1 className="mb-6 bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-4xl font-bold text-transparent md:text-6xl">
						Nexus Events
					</h1>
					<p className="mb-8 text-lg text-gray-600 md:text-xl">
						Discover, create, and join amazing events in your area
					</p>

					<div className="flex flex-wrap justify-center gap-4">
						{!session ? (
							<>
								<Link
									href="/auth/signin"
									className="rounded-md bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700"
								>
									Sign In
								</Link>
								<Link
									href="/auth/signup"
									className="rounded-md border border-blue-600 bg-white px-6 py-3 text-blue-600 transition hover:bg-blue-50"
								>
									Create Account
								</Link>
							</>
						) : (
							<>
								<Link
									href="/events"
									className="rounded-md bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700"
								>
									Browse Events
								</Link>
								<Link
									href="/events/create"
									className="rounded-md border border-blue-600 bg-white px-6 py-3 text-blue-600 transition hover:bg-blue-50"
								>
									Create Event
								</Link>
							</>
						)}
					</div>
				</section>

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
