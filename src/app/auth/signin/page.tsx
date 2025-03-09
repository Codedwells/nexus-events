'use client';

import Link from 'next/link';
import { Loader } from 'lucide-react';
import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '@/components/ui/card';

export default function SignIn() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		const result = await signIn('credentials', {
			redirect: false,
			email,
			password
		});

		setLoading(false);

		if (result?.error) {
			setError('Invalid email or password');
		} else {
			router.push('/');
			router.refresh();
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<CardTitle className="text-center text-2xl font-bold">
						Sign in
					</CardTitle>
					<CardDescription className="text-center">
						Enter your credentials to access your account
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
							<div className="flex items-center justify-between">
								<Label htmlFor="password">Password</Label>
							</div>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="••••••••"
								required
							/>
						</div>
						<Button type="submit" className="w-full" disabled={loading}>
							{loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
							Sign In
						</Button>
					</form>
				</CardContent>
				<CardFooter className="flex justify-center">
					<p className="text-sm text-gray-500">
						Don&apos;t have an account?{' '}
						<Link
							href="/auth/signup"
							className="font-medium text-blue-600 hover:text-blue-500"
						>
							Sign up
						</Link>
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}
