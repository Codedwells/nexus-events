'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog';
import Link from 'next/link';
import { Calendar, Check, Loader, MapPin, UserRound, X } from 'lucide-react';

interface Attendee {
	id: string;
	user: {
		id: string;
		fullName: string;
		email: string;
	};
}

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
		email: string;
	};
	attendees: Attendee[];
}

export default function EventDetails({ params }: { params: { id: string } }) {
	const router = useRouter();
	const { data: session, status } = useSession();

	const [event, setEvent] = useState<Event | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [attending, setAttending] = useState(false);
	const [attendingActionLoading, setAttendingActionLoading] = useState(false);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);

	useEffect(() => {
		const fetchEvent = async () => {
			try {
				const response = await fetch(`/api/events/${params.id}`);

				if (!response.ok) {
					if (response.status === 404) {
						router.push('/events');
						return;
					}
					throw new Error('Failed to fetch event');
				}

				const data = await response.json();
				setEvent(data.event);

				// Check if current user is attending
				if (session?.user?.id) {
					const isUserAttending = data.event.attendees.some(
						(attendee: Attendee) => attendee.user.id === session.user.id
					);
					setAttending(isUserAttending);
				}
			} catch (error) {
				setError('Error loading event details');
				console.error(error);
			} finally {
				setLoading(false);
			}
		};

		if (params.id) {
			fetchEvent();
		}
	}, [params.id, router, session?.user?.id]);

	const handleAttend = async () => {
		if (!session) {
			router.push(`/auth/signin?callback=/events/${params.id}`);
			return;
		}

		setAttendingActionLoading(true);

		try {
			const response = await fetch(`/api/events/${params.id}/attend`, {
				method: 'POST'
			});

			if (!response.ok) {
				throw new Error('Failed to register attendance');
			}

			setAttending(true);
		} catch (error) {
			setError('Error registering attendance');
			console.error(error);
		} finally {
			setAttendingActionLoading(false);
		}
	};

	const handleCancelAttendance = async () => {
		setAttendingActionLoading(true);

		try {
			const response = await fetch(`/api/events/${params.id}/attend`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				throw new Error('Failed to cancel attendance');
			}

			setAttending(false);
		} catch (error) {
			setError('Error cancelling attendance');
			console.error(error);
		} finally {
			setAttendingActionLoading(false);
		}
	};

	const handleDeleteEvent = async () => {
		try {
			const response = await fetch(`/api/events/${params.id}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				throw new Error('Failed to delete event');
			}

			router.push('/events');
		} catch (error) {
			setError('Error deleting event');
			console.error(error);
		}
	};

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader className="h-10 w-10 animate-spin text-gray-400" />
			</div>
		);
	}

	if (!event) {
		return (
			<div className="container mx-auto px-4 py-8">
				<Alert variant="destructive">
					<AlertDescription>Event not found</AlertDescription>
				</Alert>
				<div className="mt-4">
					<Button asChild>
						<Link href="/events">Back to Events</Link>
					</Button>
				</div>
			</div>
		);
	}

	const formattedDate = format(new Date(event.dateTime), 'EEEE, MMMM d, yyyy');
	const formattedTime = format(new Date(event.dateTime), 'h:mm a');
	const isOrganizer = session?.user?.id === event.organizer.id;
	const isAdmin = session?.user?.role === 'ADMIN';

	return (
		<div className="container mx-auto max-w-5xl px-4 py-8">
			{error && (
				<Alert variant="destructive" className="mb-4">
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			<Button variant="outline" asChild className="mb-6">
				<Link href="/events">← Back to Events</Link>
			</Button>

			<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
				<div className="md:col-span-2">
					<Card>
						<CardHeader>
							<div className="flex items-start justify-between">
								<div>
									<span className="mb-2 inline-block rounded-md bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
										{event.category.name}
									</span>
									<CardTitle className="text-2xl md:text-3xl">
										{event.title}
									</CardTitle>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<div className="flex flex-col space-y-4">
								<div className="flex items-center text-gray-500">
									<Calendar className="mr-2 h-5 w-5" />
									<span>
										{formattedDate} at {formattedTime}
									</span>
								</div>
								<div className="flex items-center text-gray-500">
									<MapPin className="mr-2 h-5 w-5" />
									<span>{event.venue}</span>
								</div>
								<div className="flex items-center text-gray-500">
									<UserRound className="mr-2 h-5 w-5" />
									<span>Organized by {event.organizer.fullName}</span>
								</div>

								<Separator className="my-4" />

								<div>
									<h3 className="mb-2 text-lg font-semibold">
										About this event
									</h3>
									<p className="whitespace-pre-line">{event.description}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{(isOrganizer || isAdmin) && (
						<div className="mt-4 flex space-x-2">
							<Button variant="outline" asChild>
								<Link href={`/events/${event.id}/edit`}>Edit Event</Link>
							</Button>
							<Button
								variant="destructive"
								onClick={() => setDeleteModalOpen(true)}
							>
								Delete Event
							</Button>
						</div>
					)}
				</div>

				<div>
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Registration</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="mb-4">
								{event.attendees.length} people are attending this event
							</p>

							{!isOrganizer && (
								<>
									{attending ? (
										<Button
											variant="outline"
											className="mb-4 w-full"
											onClick={handleCancelAttendance}
											disabled={attendingActionLoading}
										>
											{attendingActionLoading ? (
												<Loader className="mr-2 h-4 w-4 animate-spin" />
											) : (
												<X className="mr-2 h-4 w-4" />
											)}
											Cancel Registration
										</Button>
									) : (
										<Button
											className="mb-4 w-full"
											onClick={handleAttend}
											disabled={attendingActionLoading}
										>
											{attendingActionLoading ? (
												<Loader className="mr-2 h-4 w-4 animate-spin" />
											) : (
												<Check className="mr-2 h-4 w-4" />
											)}
											Attend Event
										</Button>
									)}
								</>
							)}

							<div>
								<h4 className="mb-2 text-sm font-medium">Attendees</h4>
								<div className="space-y-2">
									{event.attendees.length > 0 ? (
										<div className="flex flex-wrap gap-2">
											{event.attendees.map((attendee) => (
												<div
													key={attendee.id}
													className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1"
												>
													<Avatar className="h-6 w-6">
														<AvatarFallback>
															{attendee.user.fullName.charAt(0)}
														</AvatarFallback>
													</Avatar>
													<span className="text-sm">
														{attendee.user.fullName}
													</span>
												</div>
											))}
										</div>
									) : (
										<p className="text-sm text-gray-500">No attendees yet</p>
									)}
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			<Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Event</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this event? This action cannot be
							undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
							Cancel
						</Button>
						<Button variant="destructive" onClick={handleDeleteEvent}>
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
