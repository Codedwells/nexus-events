'use client';

import { useState, useEffect } from 'react';
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
import {
	Calendar,
	Home,
	LogOut,
	Menu,
	UserRound,
	X,
	ChevronDown,
	PlusCircle
} from 'lucide-react';

export default function Navbar() {
	const { data: session } = useSession();
	const pathname = usePathname();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);

	// Add scroll effect
	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 10);
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	const isActive = (path: string) => pathname === path;
	const isActiveOrChild = (path: string) =>
		pathname === path || pathname?.startsWith(`${path}/`);

	return (
		<nav
			className={`sticky top-0 z-50 w-full transition-all duration-200 ${
				scrolled ? 'border-b bg-white/95 backdrop-blur-sm' : 'bg-white'
			}`}
		>
			<div className="container mx-auto px-4">
				<div className="flex h-16 items-center justify-between">
					{/* Logo and Desktop Navigation */}
					<div className="flex items-center gap-8">
						<Link
							href="/"
							className="flex items-center gap-2 text-xl font-bold"
						>
							<div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-500 font-bold text-white">
								NE
							</div>
							<span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
								Nexus Events
							</span>
						</Link>

						<div className="hidden md:flex md:items-center md:gap-1">
							<Link
								href="/"
								className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ${
									isActive('/')
										? 'bg-blue-100 text-blue-700'
										: 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
								}`}
							>
								<Home className="h-4 w-4" />
								Home
							</Link>

							<Link
								href="/events"
								className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ${
									isActiveOrChild('/events')
										? 'bg-blue-100 text-blue-700'
										: 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
								}`}
							>
								<Calendar className="h-4 w-4" />
								Events
							</Link>

							{session && (
								<Link
									href="/dashboard"
									className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ${
										isActive('/dashboard')
											? 'bg-blue-100 text-blue-700'
											: 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
									}`}
								>
									<UserRound className="h-4 w-4" />
									Dashboard
								</Link>
							)}
						</div>
					</div>

					{/* Desktop Auth Buttons */}
					<div className="hidden md:flex md:items-center md:gap-3">
						{!session ? (
							<>
								<Button
									variant="outline"
									size="sm"
									asChild
									className="h-9 px-4"
								>
									<Link href="/auth/signin">Sign In</Link>
								</Button>
								<Button
									size="sm"
									asChild
									className="h-9 bg-gradient-to-r from-blue-600 to-blue-500 px-4 hover:from-blue-700 hover:to-blue-600"
								>
									<Link href="/auth/signup">Sign Up</Link>
								</Button>
							</>
						) : (
							<div className="flex items-center gap-3">
								<Button
									variant="outline"
									size="sm"
									asChild
									className="h-9 gap-1.5 border-blue-100 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
								>
									<Link href="/events/create">
										<PlusCircle className="h-4 w-4" />
										Create Event
									</Link>
								</Button>

								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											size="sm"
											className="h-9 gap-2 border border-gray-200 hover:bg-blue-50 hover:text-blue-600"
										>
											<div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700">
												{session.user?.name?.charAt(0) || 'U'}
											</div>
											<span className="max-w-[100px] truncate">
												{session.user?.name}
											</span>
											<ChevronDown className="h-4 w-4 opacity-50" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-56">
										<div className="flex items-center gap-2 p-2">
											<div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700">
												{session.user?.name?.charAt(0) || 'U'}
											</div>
											<div className="flex flex-col">
												<p className="text-sm font-medium">
													{session.user?.name}
												</p>
												<p className="truncate text-xs text-gray-500">
													{session.user?.email}
												</p>
											</div>
										</div>
										<DropdownMenuSeparator />
										<DropdownMenuItem asChild>
											<Link
												href="/dashboard"
												className="flex w-full cursor-pointer items-center"
											>
												<UserRound className="mr-2 h-4 w-4" />
												<span>Dashboard</span>
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem asChild>
											<Link
												href="/events/create"
												className="flex w-full cursor-pointer items-center"
											>
												<Calendar className="mr-2 h-4 w-4" />
												<span>Create Event</span>
											</Link>
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											onClick={() => signOut({ callbackUrl: '/' })}
											className="flex cursor-pointer items-center text-red-500 focus:text-red-500"
										>
											<LogOut className="mr-2 h-4 w-4" />
											<span>Sign Out</span>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						)}
					</div>

					{/* Mobile Menu Button */}
					<div className="flex items-center md:hidden">
						<button
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 transition-colors duration-200 hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<span className="sr-only">Toggle menu</span>
							{mobileMenuOpen ? (
								<X className="h-6 w-6" />
							) : (
								<Menu className="h-6 w-6" />
							)}
						</button>
					</div>
				</div>
			</div>

			{/* Mobile Menu */}
			{mobileMenuOpen && (
				<div className="duration-200 animate-in slide-in-from-top-5 md:hidden">
					<div className="space-y-1 px-4 py-3">
						<Link
							href="/"
							className={`flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium ${
								isActive('/')
									? 'bg-blue-100 text-blue-700'
									: 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
							}`}
							onClick={() => setMobileMenuOpen(false)}
						>
							<Home className="h-4 w-4" />
							Home
						</Link>

						<Link
							href="/events"
							className={`flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium ${
								isActiveOrChild('/events')
									? 'bg-blue-100 text-blue-700'
									: 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
							}`}
							onClick={() => setMobileMenuOpen(false)}
						>
							<Calendar className="h-4 w-4" />
							Events
						</Link>

						{session && (
							<Link
								href="/dashboard"
								className={`flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium ${
									isActive('/dashboard')
										? 'bg-blue-100 text-blue-700'
										: 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
								}`}
								onClick={() => setMobileMenuOpen(false)}
							>
								<UserRound className="h-4 w-4" />
								Dashboard
							</Link>
						)}

						{session && (
							<Link
								href="/events/create"
								className={`flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium ${
									isActive('/events/create')
										? 'bg-blue-100 text-blue-700'
										: 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
								}`}
								onClick={() => setMobileMenuOpen(false)}
							>
								<PlusCircle className="h-4 w-4" />
								Create Event
							</Link>
						)}
					</div>

					{!session ? (
						<div className="space-y-2 border-t border-gray-200 p-4">
							<Button
								variant="outline"
								asChild
								className="w-full justify-center"
							>
								<Link
									href="/auth/signin"
									onClick={() => setMobileMenuOpen(false)}
								>
									Sign In
								</Link>
							</Button>
							<Button
								asChild
								className="w-full justify-center bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
							>
								<Link
									href="/auth/signup"
									onClick={() => setMobileMenuOpen(false)}
								>
									Sign Up
								</Link>
							</Button>
						</div>
					) : (
						<div className="border-t border-gray-200 p-4">
							<div className="mb-4 flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-medium text-blue-700">
									{session.user?.name?.charAt(0) || 'U'}
								</div>
								<div>
									<p className="font-medium">{session.user?.name}</p>
									<p className="truncate text-sm text-gray-500">
										{session.user?.email}
									</p>
								</div>
							</div>

							<Button
								variant="outline"
								onClick={() => {
									setMobileMenuOpen(false);
									signOut({ callbackUrl: '/' });
								}}
								className="w-full justify-center border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600"
							>
								<LogOut className="mr-2 h-4 w-4" />
								Sign Out
							</Button>
						</div>
					)}
				</div>
			)}
		</nav>
	);
}
