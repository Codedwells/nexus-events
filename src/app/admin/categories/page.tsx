'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '../../../components/ui/table';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '../../../components/ui/dialog';
import { Loader, TrashIcon } from 'lucide-react';

interface Category {
	id: string;
	name: string;
}

export default function CategoriesAdmin() {
	const { data: session, status } = useSession();
	const router = useRouter();

	const [categories, setCategories] = useState<Category[]>([]);
	const [loading, setLoading] = useState(true);
	const [newCategoryName, setNewCategoryName] = useState('');
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

	useEffect(() => {
		if (status === 'unauthenticated') {
			router.replace('/auth/signin?callback=/admin/categories');
			return;
		}

		if (status === 'authenticated' && session.user?.role !== 'ADMIN') {
			router.replace('/');
			return;
		}

		fetchCategories();
	}, [status, session, router]);

	const fetchCategories = async () => {
		try {
			const response = await fetch('/api/categories');
			if (response.ok) {
				const data = await response.json();
				setCategories(data.categories);
			}
		} catch (error) {
			setError('Failed to fetch categories');
		} finally {
			setLoading(false);
		}
	};

	const handleAddCategory = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setSuccess('');
		setSubmitting(true);

		try {
			const response = await fetch('/api/categories', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: newCategoryName })
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to add category');
			}

			setCategories([...categories, data.category]);
			setSuccess('Category added successfully');
			setNewCategoryName('');
		} catch (error) {
			setError(error instanceof Error ? error.message : 'Something went wrong');
		} finally {
			setSubmitting(false);
		}
	};

	const handleDeleteCategory = async (id: string) => {
		try {
			const response = await fetch(`/api/categories/${id}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				throw new Error('Failed to delete category');
			}

			setCategories(categories.filter((category) => category.id !== id));
			setSuccess('Category deleted successfully');
			setCategoryToDelete(null);
		} catch (error) {
			setError(
				error instanceof Error ? error.message : 'Failed to delete category'
			);
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
		<div className="container mx-auto px-4 py-8">
			<h1 className="mb-6 text-3xl font-bold">Manage Categories</h1>

			<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
				<div className="md:col-span-1">
					<Card>
						<CardHeader>
							<CardTitle>Add New Category</CardTitle>
							<CardDescription>Create a new event category</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleAddCategory} className="space-y-4">
								{error && (
									<Alert variant="destructive">
										<AlertDescription>{error}</AlertDescription>
									</Alert>
								)}

								{success && (
									<Alert
										variant="default"
										className="border-green-200 bg-green-50 text-green-800"
									>
										<AlertDescription>{success}</AlertDescription>
									</Alert>
								)}

								<div className="space-y-2">
									<Input
										placeholder="Category name"
										value={newCategoryName}
										onChange={(e) => setNewCategoryName(e.target.value)}
										required
									/>
								</div>

								<Button type="submit" disabled={submitting} className="w-full">
									{submitting && (
										<Loader className="mr-2 h-4 w-4 animate-spin" />
									)}
									Add Category
								</Button>
							</form>
						</CardContent>
					</Card>
				</div>

				<div className="md:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle>Categories</CardTitle>
							<CardDescription>
								Manage existing event categories
							</CardDescription>
						</CardHeader>
						<CardContent>
							{categories.length > 0 ? (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Name</TableHead>
											<TableHead className="w-24">Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{categories.map((category) => (
											<TableRow key={category.id}>
												<TableCell>{category.name}</TableCell>
												<TableCell>
													<Dialog>
														<DialogTrigger asChild>
															<Button
																variant="ghost"
																size="icon"
																onClick={() => setCategoryToDelete(category.id)}
															>
																<TrashIcon className="h-4 w-4 text-red-500" />
															</Button>
														</DialogTrigger>
														<DialogContent>
															<DialogHeader>
																<DialogTitle>Delete Category</DialogTitle>
																<DialogDescription>
																	Are you sure you want to delete the category
																	&ldquo;
																	{
																		categories.find(
																			(c) => c.id === categoryToDelete
																		)?.name
																	}
																	&rdquo;? This action cannot be undone and may
																	affect events using this category.
																</DialogDescription>
															</DialogHeader>
															<DialogFooter>
																<Button
																	variant="outline"
																	onClick={() => setCategoryToDelete(null)}
																>
																	Cancel
																</Button>
																<Button
																	variant="destructive"
																	onClick={() =>
																		categoryToDelete &&
																		handleDeleteCategory(categoryToDelete)
																	}
																>
																	Delete
																</Button>
															</DialogFooter>
														</DialogContent>
													</Dialog>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							) : (
								<div className="py-6 text-center">
									<p className="text-gray-500">No categories found</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
