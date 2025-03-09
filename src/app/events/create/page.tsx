'use client';

import { useEffect, useState } from 'react';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Link from 'next/link';
import {
	AlertCircle,
	Calendar,
	Clock,
	Info,
	Loader2,
	MapPin,
	Tag
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Category {
	id: string;
	name: string;
}

// Form validation schema
const eventFormSchema = z.object({
	title: z
		.string()
		.min(3, {
			message: 'Event title must be at least 3 characters.'
		})
		.max(100, {
			message: 'Event title must not exceed 100 characters.'
		}),
	description: z
		.string()
		.min(10, {
			message: 'Description must be at least 10 characters.'
		})
		.max(1000, {
			message: 'Description must not exceed 1000 characters.'
		}),
	date: z.string().refine((val) => val.length > 0, {
		message: 'Please select a date.'
	}),
	time: z.string().refine((val) => val.length > 0, {
		message: 'Please select a time.'
	}),
	venue: z
		.string()
		.min(3, {
			message: 'Venue must be at least 3 characters.'
		})
		.max(200, {
			message: 'Venue must not exceed 200 characters.'
		}),
	categoryId: z.string().min(1, {
		message: 'Please select a category.'
	})
});

type EventFormValues = z.infer<typeof eventFormSchema>;

export default function CreateEvent() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [categories, setCategories] = useState<Category[]>([]);
	const [error, setError] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Initialize form with react-hook-form and zod validation
	const form = useForm<EventFormValues>({
		resolver: zodResolver(eventFormSchema),
		defaultValues: {
			title: '',
			description: '',
			date: '',
			time: '',
			venue: '',
			categoryId: ''
		}
	});

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
					setCategories(data);
				}
			} catch (error) {
				console.error('Error fetching categories:', error);
				setError('Failed to load categories. Please try again later.');
			}
		};

		fetchCategories();
	}, [status, router]);

	const onSubmit = async (values: EventFormValues) => {
		setIsSubmitting(true);
		setError('');

		try {
			// Combine date and time into a single ISO string
			const dateTimeString = `${values.date}T${values.time}`;
			const dateTime = new Date(dateTimeString).toISOString();

			const response = await fetch('/api/events', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					title: values.title,
					description: values.description,
					dateTime,
					venue: values.venue,
					categoryId: values.categoryId
				})
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to create event');
			}

			router.push(`/events/${data.event.id}`);
		} catch (error) {
			setError(error instanceof Error ? error.message : 'Something went wrong');
			setIsSubmitting(false);
		}
	};

	if (status === 'loading') {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="flex flex-col items-center gap-2">
					<Loader2 className="h-10 w-10 animate-spin text-primary" />
					<p className="text-sm text-muted-foreground">Loading...</p>
				</div>
			</div>
		);
	}

	// Get today's date in YYYY-MM-DD format for min date attribute
	const today = new Date().toISOString().split('T')[0];

	return (
		<div className="container mx-auto px-4 py-10 md:px-6">
			<div className="mx-auto max-w-3xl">
				<div className="mb-8 text-center">
					<h1 className="text-3xl font-bold tracking-tight">
						Create New Event
					</h1>
					<p className="mt-2 text-muted-foreground">
						Fill in the details below to create and publish your event
					</p>
				</div>

				<Tabs defaultValue="details" className="w-full">
					<TabsList className="mb-8 grid w-full grid-cols-2">
						<TabsTrigger value="details">Event Details</TabsTrigger>
						<TabsTrigger value="preview">Preview</TabsTrigger>
					</TabsList>

					<TabsContent value="details">
						<Card>
							<CardHeader>
								<CardTitle>Event Information</CardTitle>
								<CardDescription>
									Provide the basic information about your event
								</CardDescription>
							</CardHeader>
							<CardContent>
								{error && (
									<Alert variant="destructive" className="mb-6">
										<AlertCircle className="h-4 w-4" />
										<AlertTitle>Error</AlertTitle>
										<AlertDescription>{error}</AlertDescription>
									</Alert>
								)}

								<Form {...form}>
									<form
										onSubmit={form.handleSubmit(onSubmit)}
										className="space-y-6"
									>
										<FormField
											control={form.control}
											name="title"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Event Title</FormLabel>
													<FormControl>
														<Input
															placeholder="Enter a catchy title for your event"
															{...field}
														/>
													</FormControl>
													<FormDescription>
														This will be the main title displayed for your
														event.
													</FormDescription>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="description"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Description</FormLabel>
													<FormControl>
														<Textarea
															placeholder="Describe what your event is about, what attendees can expect, etc."
															className="min-h-32 resize-y"
															{...field}
														/>
													</FormControl>
													<FormDescription>
														Provide details about your event to attract
														attendees.
													</FormDescription>
													<FormMessage />
												</FormItem>
											)}
										/>

										<div className="grid gap-6 md:grid-cols-2">
											<FormField
												control={form.control}
												name="date"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Date</FormLabel>
														<FormControl>
															<div className="relative">
																<Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
																<Input
																	type="date"
																	min={today}
																	className="pl-10"
																	{...field}
																/>
															</div>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name="time"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Time</FormLabel>
														<FormControl>
															<div className="relative">
																<Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
																<Input
																	type="time"
																	className="pl-10"
																	{...field}
																/>
															</div>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>

										<FormField
											control={form.control}
											name="venue"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Venue</FormLabel>
													<FormControl>
														<div className="relative">
															<MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
															<Input
																placeholder="Enter the location of your event"
																className="pl-10"
																{...field}
															/>
														</div>
													</FormControl>
													<FormDescription>
														Provide the physical address or online meeting link.
													</FormDescription>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="categoryId"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Category</FormLabel>
													<Select
														onValueChange={field.onChange}
														value={field.value}
													>
														<FormControl>
															<div className="relative">
																<SelectTrigger className="pl-10">
																	<SelectValue placeholder="Select a category" />
																</SelectTrigger>
																<Tag className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
															</div>
														</FormControl>
														<SelectContent>
															{categories?.length > 0 ? (
																categories.map((category) => (
																	<SelectItem
																		key={category.id}
																		value={category.id}
																	>
																		{category.name}
																	</SelectItem>
																))
															) : (
																<div className="flex items-center justify-center p-2 text-sm text-muted-foreground">
																	No categories available
																</div>
															)}
														</SelectContent>
													</Select>
													<FormDescription>
														Categorizing your event helps attendees find it more
														easily.
													</FormDescription>
													<FormMessage />
												</FormItem>
											)}
										/>

										<div className="flex gap-4 pt-4">
											<Button
												type="submit"
												className="flex-1"
												disabled={isSubmitting}
											>
												{isSubmitting ? (
													<>
														<Loader2 className="mr-2 h-4 w-4 animate-spin" />
														Creating...
													</>
												) : (
													'Create Event'
												)}
											</Button>
											<Button variant="outline" asChild>
												<Link href="/events">Cancel</Link>
											</Button>
										</div>
									</form>
								</Form>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="preview">
						<Card>
							<CardHeader>
								<CardTitle>Event Preview</CardTitle>
								<CardDescription>
									This is how your event will appear to attendees
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="rounded-lg border bg-card p-6">
									{form.watch('title') ? (
										<>
											<div className="mb-6">
												<h2 className="text-2xl font-bold">
													{form.watch('title')}
												</h2>
												{form.watch('categoryId') && categories.length > 0 && (
													<div className="mt-2">
														<span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
															{
																categories.find(
																	(c) => c.id === form.watch('categoryId')
																)?.name
															}
														</span>
													</div>
												)}
											</div>

											{(form.watch('date') ||
												form.watch('time') ||
												form.watch('venue')) && (
												<div className="mb-6 space-y-2 text-sm">
													{form.watch('date') && form.watch('time') && (
														<div className="flex items-center gap-2">
															<Calendar className="h-4 w-4 text-primary" />
															<span>
																{form.watch('date') &&
																	new Date(
																		form.watch('date')
																	).toLocaleDateString('en-US', {
																		weekday: 'long',
																		year: 'numeric',
																		month: 'long',
																		day: 'numeric'
																	})}
																{form.watch('time') &&
																	` at ${form.watch('time')}`}
															</span>
														</div>
													)}

													{form.watch('venue') && (
														<div className="flex items-center gap-2">
															<MapPin className="h-4 w-4 text-primary" />
															<span>{form.watch('venue')}</span>
														</div>
													)}
												</div>
											)}

											{form.watch('description') && (
												<div className="prose max-w-none">
													<h3 className="text-lg font-medium">
														About this event
													</h3>
													<p className="whitespace-pre-line">
														{form.watch('description')}
													</p>
												</div>
											)}
										</>
									) : (
										<div className="flex flex-col items-center justify-center py-12 text-center">
											<Info className="h-12 w-12 text-muted-foreground opacity-50" />
											<h3 className="mt-4 text-lg font-medium">
												No preview available
											</h3>
											<p className="mt-2 text-sm text-muted-foreground">
												Fill in the event details to see a preview of your event
											</p>
										</div>
									)}
								</div>
							</CardContent>
							<CardFooter className="flex justify-between">
								<Button variant="outline" onClick={() => form.reset()}>
									Reset Form
								</Button>
								<Button onClick={() => form.handleSubmit(onSubmit)()}>
									{isSubmitting ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Creating...
										</>
									) : (
										'Create Event'
									)}
								</Button>
							</CardFooter>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
