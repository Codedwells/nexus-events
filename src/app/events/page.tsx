'use client';

import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Card, CardFooter } from '@/components/ui/card';
import EventCard from '@/components/EventCard';
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
	category: Category;
	organizer: {
		id: string;
		fullName: string;
	};
	_count?: {
		attendees: number;
	};
}

export default function Events() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [events, setEvents] = useState<Event[]>([]);
	const [categories, setCategories] = useState<Category[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState(
		searchParams.get('search') || ''
	);
	const [selectedCategory, setSelectedCategory] = useState(
		searchParams.get('categoryId') || ''
	);

	useEffect(() => {
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
	}, []);

	useEffect(() => {
		const fetchEvents = async () => {
			setLoading(true);
			try {
				let url = '/api/events';
				const params = new URLSearchParams();

				if (searchTerm) {
					params.append('search', searchTerm);
				}

				if (selectedCategory) {
					params.append('categoryId', selectedCategory);
				}

				if (params.toString()) {
					url += `?${params.toString()}`;
				}

				const response = await fetch(url);
				if (response.ok) {
					const data = await response.json();
					setEvents(data.events);
				}
			} catch (error) {
				console.error('Error fetching events:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchEvents();
	}, [searchTerm, selectedCategory]);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();

		const params = new URLSearchParams();
		if (searchTerm) params.append('search', searchTerm);
		if (selectedCategory) params.append('categoryId', selectedCategory);

		router.push(`/events${params.toString() ? '?' + params.toString() : ''}`);
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-8 space-y-4">
				<h1 className="text-3xl font-bold">Events</h1>

				<form
					onSubmit={handleSearch}
					className="flex flex-col gap-4 sm:flex-row"
				>
					<div className="flex-1">
						<Input
							type="text"
							placeholder="Search events..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
					<div className="w-full sm:w-64">
						<Select
							value={selectedCategory}
							onValueChange={setSelectedCategory}
						>
							<SelectTrigger>
								<SelectValue placeholder="All Categories" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="">All Categories</SelectItem>
								{categories.map((category) => (
									<SelectItem key={category.id} value={category.id}>
										{category.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<Button type="submit">Search</Button>
				</form>
			</div>

			{loading ? (
				<div className="flex justify-center py-20">
					<Loader className="h-10 w-10 animate-spin text-gray-400" />
				</div>
			) : (
				<>
					{events.length > 0 ? (
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
							{events.map((event) => (
								<EventCard key={event.id} event={event} />
							))}
						</div>
					) : (
						<Card className="p-12 text-center">
							<p className="mb-4 text-gray-500">No events found</p>
							<CardFooter className="justify-center">
								<Link href="/events/create">
									<Button>Create an Event</Button>
								</Link>
							</CardFooter>
						</Card>
					)}
				</>
			)}
		</div>
	);
}
