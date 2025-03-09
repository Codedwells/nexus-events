'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import EventCard from '@/components/EventCard';
import { Loader } from 'lucide-react';

interface Event {
	id: string;
	title: string;
	description: string;
	dateTime: string;
	venue: string;
	category: {
		id: string;
		name: string;
	};
	organizer: {
		id: string;
		fullName: string;
	};
	_count?: {
		attendees: number;
	};
}

export default function Dashboard() {
	const router = useRouter();
	const { data: session, status } = useSession();
	const [organizedEvents, setOrganizedEvents] = useState<Event[]>([]);
	const [attendingEvents, setAttendingEvents] = useState<Event[]>([]);
	const [loadingOrganized, setLoadingOrganized] = useState(true);
	const [loadingAttending, setLoadingAttending] = useState(true);

	useEffect(() => {
		if (status === 'unauthenticated') {
			router.replace('/auth/signin?callback=/dashboard');
			return;
		}

		const fetchOrganizedEvents = async () => {
			try {
				const response = await fetch('/api/users/me/events?type=organized');
				if (response.ok) {
					const data = await response.json();
					setOrganizedEvents(data.events);
				}
			} catch (error) {
				console.error('Error fetching organized events:', error);
			} finally {
				setLoadingOrganized(false);
			}
		};

		const fetchAttendingEvents = async () => {
			try {
				const response = await fetch('/api/users/me/events?type=attending');
				if (response.ok) {
					const data = await response.json();
					setAttendingEvents(data.events);
				}
			} catch (error) {
				console.error('Error fetching attending events:', error);
			} finally {
				setLoadingAttending(false);
			}
		};

		if (session) {
			fetchOrganizedEvents();
			fetchAttendingEvents();
		}
	}, [router, session, status]);

	if (status === 'loading') {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader className="h-10 w-10 animate-spin text-gray-400" />
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="mb-6 text-3xl font-bold">Dashboard</h1>

			<Tabs defaultValue="organized" className="space-y-4">
				<TabsList>
					<TabsTrigger value="organized">My Events</TabsTrigger>
					<TabsTrigger value="attending">Events I&apos;m Attending</TabsTrigger>
				</TabsList>

				<TabsContent value="organized">
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<CardTitle>Events You&apos;ve Organized</CardTitle>
								<Button asChild>
									<Link href="/events/create">Create Event</Link>
								</Button>
							</div>
							<CardDescription>
								Manage the events you have created
							</CardDescription>
						</CardHeader>
						<CardContent>
							{loadingOrganized ? (
								<div className="flex justify-center py-10">
									<Loader className="h-6 w-6 animate-spin text-gray-400" />
								</div>
							) : organizedEvents.length > 0 ? (
								<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
									{organizedEvents.map((event) => (
										<EventCard key={event.id} event={event} />
									))}
								</div>
							) : (
								<div className="py-10 text-center">
									<p className="mb-4 text-gray-500">
										You haven&apos;t created any events yet
									</p>
									<Button asChild>
										<Link href="/events/create">Create Your First Event</Link>
									</Button>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="attending">
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<CardTitle>Events You&apos;re Attending</CardTitle>
								<Button asChild variant="outline">
									<Link href="/events">Browse Events</Link>
								</Button>
							</div>
							<CardDescription>
								Events you&apos;ve registered to attend
							</CardDescription>
						</CardHeader>
						<CardContent>
							{loadingAttending ? (
								<div className="flex justify-center py-10">
									<Loader className="h-6 w-6 animate-spin text-gray-400" />
								</div>
							) : attendingEvents.length > 0 ? (
								<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
									{attendingEvents.map((event) => (
										<EventCard key={event.id} event={event} />
									))}
								</div>
							) : (
								<div className="py-10 text-center">
									<p className="mb-4 text-gray-500">
										You&apos;re not attending any events yet
									</p>
									<Button asChild>
										<Link href="/events">Find Events to Attend</Link>
									</Button>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
