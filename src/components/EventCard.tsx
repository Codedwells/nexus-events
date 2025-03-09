'use client';

import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import type { Event, Category } from '@prisma/client';
import { Calendar, MapPin, Users, Clock, UserRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader
} from '@/components/ui/card';

type EventWithDetails = Event & {
	category: Category;
	organizer: { fullName: string };
	_count?: { attendees: number };
	imageUrl?: string;
};

export default function EventCard({ event }: { event: EventWithDetails }) {
	const formattedDate = format(new Date(event.dateTime), 'EEE, MMM d, yyyy');
	const formattedTime = format(new Date(event.dateTime), 'h:mm a');

	// Calculate if the event is upcoming, happening today, or past
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const eventDate = new Date(event.dateTime);
	const eventDay = new Date(eventDate);
	eventDay.setHours(0, 0, 0, 0);

	const isToday = eventDay.getTime() === today.getTime();
	const isPast = eventDate < new Date();

	return (
		<Link href={`/events/${event.id}`} className="block h-full">
			<Card className="group h-full overflow-hidden border-gray-200 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg">
				<div className="relative h-48 w-full overflow-hidden bg-gray-100">
					{event.imageUrl ? (
						<Image
							src={'/event-placeholder.svg'}
							alt={event.title}
							fill
							className="object-cover transition-transform duration-500 group-hover:scale-110"
						/>
					) : (
						<Image
							src={'/event-placeholder.svg'}
							alt={event.title}
							fill
							className="object-cover transition-transform duration-500 group-hover:scale-110"
						/>
					)}

					<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

					{isPast ? (
						<div className="absolute right-3 top-3 rounded-full bg-gray-800/80 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
							Past Event
						</div>
					) : isToday ? (
						<div className="absolute right-3 top-3 rounded-full bg-green-500/80 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
							Today
						</div>
					) : (
						<div className="absolute right-3 top-3 rounded-full bg-blue-500/80 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
							Upcoming
						</div>
					)}
				</div>

				<CardHeader className="p-4 pb-0">
					<div className="mb-2 flex items-center justify-between">
						<Badge
							variant="secondary"
							className="bg-blue-100 text-blue-800 hover:bg-blue-200"
						>
							{event.category.name}
						</Badge>
						<div className="flex items-center text-sm text-gray-500">
							<Users className="mr-1 h-4 w-4" />
							<span>{event._count?.attendees || 0}</span>
						</div>
					</div>
					<h3 className="line-clamp-1 text-xl font-semibold transition-colors group-hover:text-blue-600">
						{event.title}
					</h3>
				</CardHeader>

				<CardContent className="p-4 pt-2">
					<p className="mb-4 line-clamp-2 text-sm text-gray-600">
						{event.description}
					</p>

					<div className="space-y-2 text-sm">
						<div className="flex items-center text-gray-600">
							<Calendar className="mr-2 h-4 w-4 flex-shrink-0 text-blue-500" />
							<span>{formattedDate}</span>
						</div>

						<div className="flex items-center text-gray-600">
							<Clock className="mr-2 h-4 w-4 flex-shrink-0 text-blue-500" />
							<span>{formattedTime}</span>
						</div>

						<div className="flex items-center text-gray-600">
							<MapPin className="mr-2 h-4 w-4 flex-shrink-0 text-blue-500" />
							<span className="line-clamp-1">{event.venue}</span>
						</div>
					</div>
				</CardContent>

				<CardFooter className="mt-auto border-t border-gray-100 p-4">
					<div className="flex items-center text-sm">
						<UserRound className="mr-2 h-4 w-4 text-gray-500" />
						<span className="font-medium text-gray-700">
							{event.organizer.fullName}
						</span>
					</div>
				</CardFooter>
			</Card>
		</Link>
	);
}
