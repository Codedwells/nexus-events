'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import Link from 'next/link';
import { format } from 'date-fns';
import { Loader } from 'lucide-react';

interface Category {
	id: string;
	name: string;
}

interface Event {
	id: string;
	title: string;
	description: string;
	dateTime: string;
	venue: string;
	categoryId: string;
	organizer: {
		id: string;
	};
}

export default function EditEvent() {
	const params = useParams<{ id: string }>();

	const { data: session, status } = useSession();
	const router = useRouter();

	const [event, setEvent] = useState<Event | null>(null);
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [dateTime, setDateTime] = useState('');
	const [venue, setVenue] = useState('');
	const [categoryId, setCategoryId] = useState('');
	const [categories, setCategories] = useState<Category[]>([]);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

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
				setEvent({
					id: data.id,
					title: data.title,
					description: data.description,
					dateTime: data.dateTime,
					venue: data.venue,
					categoryId: data.categoryId,
					organizer: {
						id: data.organizerId
					}
				});

				// Format the date for datetime-local input
				const eventDate = new Date(data.dateTime);
				const formattedDate = format(eventDate, "yyyy-MM-dd'T'HH:mm");

				setTitle(data.title);
				setDescription(data.description);
				setDateTime(formattedDate);
				setVenue(data.venue);
				setCategoryId(data.categoryId);
			} catch (error) {
				setError('Error loading event');
				console.error(error);
			}
		};

		const fetchCategories = async () => {
			try {
				const response = await fetch('/api/categories');
				if (response.ok) {
					const data = await response.json();
					setCategories(data);
				}
			} catch (error) {
				console.error('Error fetching categories:', error);
			} finally {
				setLoading(false);
			}
		};

		if (status === 'unauthenticated') {
			router.replace(`/auth/signin?callback=/events/${params.id}/edit`);
			return;
		}

		if (params.id) {
			fetchEvent();
			fetchCategories();
		}
	}, [params.id, router, status]);

	useEffect(() => {
		if (event && session && !loading) {
			// Check if user is authorized to edit this event
			const isOrganizer = session.user?.id === event.organizer.id;
			const isAdmin = session.user?.role === 'ADMIN';

			if (!isOrganizer && !isAdmin) {
				router.push(`/events/${params.id}`);
			}
		}
	}, [event, session, loading, params.id, router]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		setError('');

		try {
			const response = await fetch(`/api/events/${params.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					title,
					description,
					dateTime,
					venue,
					categoryId
				})
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to update event');
			}

			router.push(`/events/${params.id}`);
		} catch (error) {
			setError(error instanceof Error ? error.message : 'Something went wrong');
			setSaving(false);
		}
	};

	if (status === 'loading' || loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader className="h-10 w-10 animate-spin text-gray-400" />
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
			<Card className="w-full max-w-2xl">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold">Edit Event</CardTitle>
					<CardDescription>Update the details of your event</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						{error && (
							<Alert variant="destructive">
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

						<div className="space-y-2">
							<Label htmlFor="title">Event Title</Label>
							<Input
								id="title"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="Enter event title"
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Describe your event"
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="dateTime">Date and Time</Label>
							<Input
								id="dateTime"
								type="datetime-local"
								value={dateTime}
								onChange={(e) => setDateTime(e.target.value)}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="venue">Venue</Label>
							<Input
								id="venue"
								value={venue}
								onChange={(e) => setVenue(e.target.value)}
								placeholder="Event location"
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="category">Category</Label>
							<Select value={categoryId} onValueChange={setCategoryId} required>
								<SelectTrigger>
									<SelectValue placeholder="Select a category" />
								</SelectTrigger>
								<SelectContent>
									{categories.map((category) => (
										<SelectItem key={category.id} value={category.id}>
											{category.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="flex gap-2 pt-4">
							<Button type="submit" className="flex-1" disabled={saving}>
								{saving && <Loader className="mr-2 h-4 w-4 animate-spin" />}
								Update Event
							</Button>
							<Button variant="outline" asChild>
								<Link href={`/events/${params.id}`}>Cancel</Link>
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
