'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { Event, Category, User } from '@prisma/client';

type EventWithDetails = Event & {
	category: Category;
	organizer: { fullName: string };
	_count?: { attendees: number };
};

export default function EventCard({ event }: { event: EventWithDetails }) {
	const formattedDate = format(new Date(event.dateTime), 'MMM d, yyyy');
	const formattedTime = format(new Date(event.dateTime), 'h:mm a');

	return (
		<Link href={`/events/${event.id}`}>
			<div className="flex h-full cursor-pointer flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md">
				<div className="flex flex-grow flex-col p-6">
					<div className="mb-2 flex items-start justify-between">
						<span className="inline-block rounded-md bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
							{event.category.name}
						</span>
						<div className="text-sm text-gray-500">
							{event._count?.attendees || 0} attending
						</div>
					</div>

					<h3 className="mb-2 text-xl font-semibold">{event.title}</h3>

					<p className="mb-4 line-clamp-2 flex-grow text-gray-600">
						{event.description}
					</p>

					<div className="mt-auto flex flex-col text-sm text-gray-500">
						<div className="mb-1 flex items-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="mr-1 h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
								/>
							</svg>
							{formattedDate} at {formattedTime}
						</div>
						<div className="mb-1 flex items-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="mr-1 h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
								/>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
								/>
							</svg>
							{event.venue}
						</div>
						<div className="flex items-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="mr-1 h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
								/>
							</svg>
							{event.organizer.fullName}
						</div>
					</div>
				</div>
			</div>
		</Link>
	);
}
