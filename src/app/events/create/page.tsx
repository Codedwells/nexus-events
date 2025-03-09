'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
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
import { Loader } from 'lucide-react';

interface Category {
	id: string;
	name: string;
}

export default function CreateEvent() {
	const { data: session, status } = useSession();
	const router = useRouter();

	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [dateTime, setDateTime] = useState('');
	const [venue, setVenue] = useState('');
	const [categoryId, setCategoryId] = useState('');
	const [categories, setCategories] = useState<Category[]>([]);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (status === 'unauthenticated') {
			router.replace('/auth/signin?callback=/events/create');
			return;
		}

		const fetchCategories = async () => {
			try {
				const response = await fetch('/api/categories');
				if (response.ok) {
					const data = await response.json();
					setCategories(data.categories);
				}
			} catch (error) {
				console.error('Error fetching categories:', error);
			}
		};

		fetchCategories();
	}, [status, router]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		try {
			const response = await fetch('/api/events', {
				method: 'POST',
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
				throw new Error(data.error || 'Failed to create event');
			}

			router.push(`/events/${data.event.id}`);
		} catch (error) {
			setError(error instanceof Error ? error.message : 'Something went wrong');
			setLoading(false);
		}
	};

	if (status === 'loading') {
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
					<CardTitle className="text-2xl font-bold">Create New Event</CardTitle>
					<CardDescription>
						Fill in the details to create your event
					</CardDescription>
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

						<Button type="submit" className="w-full" disabled={loading}>
							{loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
							Create Event
						</Button>
					</form>
				</CardContent>
				<CardFooter>
					<div className="flex w-full justify-center">
						<Button variant="outline" asChild>
							<Link href="/events">Cancel</Link>
						</Button>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
