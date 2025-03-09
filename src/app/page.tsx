import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import EventCard from '@/components/EventCard';
import Hero from '@/components/home/hero';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export default async function Home() {
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
		<main className="flex min-h-screen flex-col items-center  p-6 md:p-24">
			<div className="w-full max-w-7xl">
				<Hero />

				<section className="mb-16 mt-24">
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
						<div className="rounded-lg border bg-gray-50 py-12 text-center">
							<p className="text-gray-500">No upcoming events yet</p>
							<Link
								href="/events/create"
								className={cn(buttonVariants({ size: 'lg' }), 'mt-4')}
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
