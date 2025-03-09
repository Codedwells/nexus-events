'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { signIn } from 'next-auth/react';
import { Loader } from 'lucide-react';

export default function SignUp() {
	const [fullName, setFullName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [role, setRole] = useState('ATTENDEE');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		if (password !== confirmPassword) {
			setError('Passwords do not match');
			setLoading(false);
			return;
		}

		try {
			const response = await fetch('/api/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ fullName, email, password, role })
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Registration failed');
			}

			// Auto sign in
			const result = await signIn('credentials', {
				redirect: false,
				email,
				password
			});

			if (result?.error) {
				throw new Error('Auto sign-in failed');
			}

			router.push('/');
			router.refresh();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Something went wrong');
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<CardTitle className="text-center text-2xl font-bold">
						Create an account
					</CardTitle>
					<CardDescription className="text-center">
						Enter your information to create an account
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
							<Label htmlFor="fullName">Full Name</Label>
							<Input
								id="fullName"
								value={fullName}
								onChange={(e) => setFullName(e.target.value)}
								placeholder="John Doe"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="name@example.com"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="••••••••"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="confirmPassword">Confirm Password</Label>
							<Input
								id="confirmPassword"
								type="password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								placeholder="••••••••"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="role">I want to</Label>
							<Select value={role} onValueChange={setRole}>
								<SelectTrigger>
									<SelectValue placeholder="Select a role" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="ATTENDEE">Attend events</SelectItem>
									<SelectItem value="ORGANIZER">Organize events</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<Button type="submit" className="w-full" disabled={loading}>
							{loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
							Sign Up
						</Button>
					</form>
				</CardContent>
				<CardFooter className="flex justify-center">
					<p className="text-sm text-gray-500">
						Already have an account?{' '}
						<Link
							href="/auth/signin"
							className="font-medium text-blue-600 hover:text-blue-500"
						>
							Sign in
						</Link>
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}
