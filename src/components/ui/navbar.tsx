'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button } from './button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from './dropdown-menu';
import { Calendar, Home, LogOut, Menu, UserRound } from 'lucide-react';

export default function Navbar() {
	const { data: session } = useSession();
	const pathname = usePathname();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const isActive = (path: string) => pathname === path;

	return (
		<nav className="bg-white shadow-sm">
			<div className="container mx-auto px-4">
				<div className="flex h-16 justify-between">
					<div className="flex">
						<div className="flex flex-shrink-0 items-center">
							<Link href="/" className="text-xl font-bold text-blue-600">
								Nexus Events
							</Link>
						</div>
						<div className="hidden sm:ml-6 sm:flex sm:space-x-8">
							<Link
								href="/"
								className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
									isActive('/')
										? 'border-blue-500 text-gray-900'
										: 'border-transparent text-gray-500 hover:border-gray-300'
								}`}
							>
								Home
							</Link>
							<Link
								href="/events"
								className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
									isActive('/events') || pathname?.startsWith('/events/')
										? 'border-blue-500 text-gray-900'
										: 'border-transparent text-gray-500 hover:border-gray-300'
								}`}
							>
								Events
							</Link>
							{session && (
								<Link
									href="/dashboard"
									className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
										isActive('/dashboard')
											? 'border-blue-500 text-gray-900'
											: 'border-transparent text-gray-500 hover:border-gray-300'
									}`}
								>
									Dashboard
								</Link>
							)}
						</div>
					</div>

					<div className="hidden sm:ml-6 sm:flex sm:items-center">
						{!session ? (
							<div className="space-x-2">
								<Button variant="outline" asChild>
									<Link href="/auth/signin">Sign In</Link>
								</Button>
								<Button asChild>
									<Link href="/auth/signup">Sign Up</Link>
								</Button>
							</div>
						) : (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline">
										<UserRound className="mr-2 h-4 w-4" />
										{session.user?.name}
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem asChild>
										<Link href="/dashboard" className="w-full cursor-pointer">
											<Home className="mr-2 h-4 w-4" />
											<span>Dashboard</span>
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link
											href="/events/create"
											className="w-full cursor-pointer"
										>
											<Calendar className="mr-2 h-4 w-4" />
											<span>Create Event</span>
										</Link>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={() => signOut({ callbackUrl: '/' })}
										className="cursor-pointer"
									>
										<LogOut className="mr-2 h-4 w-4" />
										<span>Sign Out</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						)}
					</div>

					<div className="flex items-center sm:hidden">
						<button
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
						>
							<span className="sr-only">Open main menu</span>
							<Menu className="h-6 w-6" />
						</button>
					</div>
				</div>
			</div>

			{/* Mobile menu, toggle visibility based on menu state */}
			{mobileMenuOpen && (
				<div className="sm:hidden">
					<div className="space-y-1 pb-3 pt-2">
						<Link
							href="/"
							className={`block border-l-4 py-2 pl-3 pr-4 text-base font-medium ${
								isActive('/')
									? 'border-blue-500 bg-blue-50 text-blue-700'
									: 'border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50'
							}`}
							onClick={() => setMobileMenuOpen(false)}
						>
							Home
						</Link>
						<Link
							href="/events"
							className={`block border-l-4 py-2 pl-3 pr-4 text-base font-medium ${
								isActive('/events') || pathname?.startsWith('/events/')
									? 'border-blue-500 bg-blue-50 text-blue-700'
									: 'border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50'
							}`}
							onClick={() => setMobileMenuOpen(false)}
						>
							Events
						</Link>
						{session && (
							<Link
								href="/dashboard"
								className={`block border-l-4 py-2 pl-3 pr-4 text-base font-medium ${
									isActive('/dashboard')
										? 'border-blue-500 bg-blue-50 text-blue-700'
										: 'border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50'
								}`}
								onClick={() => setMobileMenuOpen(false)}
							>
								Dashboard
							</Link>
						)}

						{!session ? (
							<div className="flex flex-col space-y-2 border-t border-gray-200 px-4 pb-3 pt-4">
								<Button variant="outline" asChild className="w-full">
									<Link
										href="/auth/signin"
										onClick={() => setMobileMenuOpen(false)}
									>
										Sign In
									</Link>
								</Button>
								<Button asChild className="w-full">
									<Link
										href="/auth/signup"
										onClick={() => setMobileMenuOpen(false)}
									>
										Sign Up
									</Link>
								</Button>
							</div>
						) : (
							<div className="border-t border-gray-200 pb-3 pt-4">
								<div className="flex items-center px-4">
									<div className="flex-shrink-0">
										<span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
											<span className="text-sm font-medium leading-none text-gray-500">
												{session.user?.name?.charAt(0) || 'U'}
											</span>
										</span>
									</div>
									<div className="ml-3">
										<div className="text-base font-medium text-gray-800">
											{session.user?.name}
										</div>
										<div className="text-sm font-medium text-gray-500">
											{session.user?.email}
										</div>
									</div>
								</div>
								<div className="mt-3 space-y-1 px-2">
									<Link
										href="/dashboard"
										className="block rounded-md px-3 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900"
										onClick={() => setMobileMenuOpen(false)}
									>
										Dashboard
									</Link>
									<Link
										href="/events/create"
										className="block rounded-md px-3 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900"
										onClick={() => setMobileMenuOpen(false)}
									>
										Create Event
									</Link>
									<button
										onClick={() => {
											setMobileMenuOpen(false);
											signOut({ callbackUrl: '/' });
										}}
										className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900"
									>
										Sign Out
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			)}
		</nav>
	);
}
