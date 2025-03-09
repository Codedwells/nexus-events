'use client';

import React, { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { buttonVariants } from '../ui/button';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const Hero = () => {
	const { status, data: session } = useSession();

	console.log(status);

	useEffect(() => {
		const observerOptions = {
			root: null,
			rootMargin: '0px',
			threshold: 0.1
		};

		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add('in-view');
					observer.unobserve(entry.target);
				}
			});
		}, observerOptions);

		document.querySelectorAll('[data-animate]').forEach((el) => {
			observer.observe(el);
		});

		return () => {
			document.querySelectorAll('[data-animate]').forEach((el) => {
				observer.unobserve(el);
			});
		};
	}, []);

	return (
		<section className="relative mb-16 overflow-hidden">
			{/* Background decorative elements */}
			<div className="pointer-events-none absolute left-0 top-0 h-full w-full overflow-hidden">
				<div className="bg-event-softBlue absolute right-10 top-10 h-64 w-64 rounded-full opacity-50 blur-3xl"></div>
				<div className="absolute bottom-10 left-10 h-40 w-40 rounded-full bg-blue-100 opacity-40 blur-2xl"></div>
			</div>

			<div className="container-padded relative z-10 grid items-center gap-12 md:grid-cols-2 md:gap-8">
				<div className="order-2 md:order-1">
					<div className="max-w-xl space-y-6">
						<div
							data-animate="fade-in"
							className="w-fit rounded-full border border-blue-700 bg-blue-100 px-4 py-1 text-sm text-blue-700"
						>
							Event Management Made Simple
						</div>

						<h1
							data-animate="fade-in"
							className="text-event-darkGray/90 text-4xl font-bold leading-tight lg:text-6xl"
						>
							Create & Discover <span className="text-event-blue">Amazing</span>{' '}
							Events
						</h1>

						<p
							data-animate="fade-in"
							className="text-event-darkGray/80 text-lg leading-relaxed"
						>
							Whether you&apos;re organizing a conference, workshop, or social
							gathering, our platform provides everything you need to create,
							manage, and join memorable events.
						</p>

						<div
							data-animate="fade-in"
							className="flex flex-col gap-4 pt-4 sm:flex-row"
						>
							{!session ? (
								<>
									<Link
										href="/auth/signin"
										className={cn(buttonVariants({ size: 'lg' }))}
									>
										<ArrowRight size={18} />
										Sign In
									</Link>
									<Link
										href="/auth/signup"
										className={cn(
											buttonVariants({ variant: 'outline', size: 'lg' })
										)}
									>
										Create Account
									</Link>
								</>
							) : (
								<>
									<Link
										href="/events"
										className={cn(buttonVariants({ size: 'lg' }))}
									>
										<ArrowRight size={18} />
										Browse Events
									</Link>
									<Link
										href="/events/create"
										className={cn(
											buttonVariants({ variant: 'outline', size: 'lg' })
										)}
									>
										Create Event
									</Link>
								</>
							)}
						</div>

						<div
							data-animate="fade-in"
							className="flex items-center space-x-6 pt-4"
						>
							<div className="flex -space-x-2">
								<div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white">
									JD
								</div>
								<div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-xs font-medium text-white">
									KL
								</div>
								<div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-xs font-medium text-white">
									MR
								</div>
								<div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-xs font-medium text-white">
									SB
								</div>
							</div>
							<p className="text-event-darkGray/80 text-sm">
								Joined by <span className="font-semibold">10,000+</span> event
								organizers
							</p>
						</div>
					</div>
				</div>

				<div className="relative order-1 md:order-2">
					<div data-animate="scale-in" className="relative">
						<div className="relative z-10 overflow-hidden rounded-2xl shadow-xl">
							<img
								src="https://images.unsplash.com/photo-1519389950473-47ba0277781c"
								alt="Event Management Platform"
								className="h-auto w-full object-cover"
							/>
						</div>

						{/* Decorative elements */}
						<div className="bg-event-blue/10 animate-float absolute -right-4 -top-4 h-24 w-24 rounded-full"></div>
						<div
							className="bg-event-blue/10 animate-float absolute -bottom-6 -left-6 h-32 w-32 rounded-full"
							style={{ animationDelay: '1s' }}
						></div>

						{/* Stats cards */}
						<div
							className="glass-effect animate-float absolute -right-10 top-14 rounded-lg p-4 shadow-sm"
							style={{ animationDelay: '2s' }}
						>
							<div className="flex items-center gap-3">
								<div className="bg-event-blue/10 flex h-10 w-10 items-center justify-center rounded-full">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="20"
										height="20"
										viewBox="0 0 24 24"
										fill="none"
										stroke="#33C3F0"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
										<circle cx="9" cy="7" r="4"></circle>
										<path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
										<path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
									</svg>
								</div>
								<div>
									<p className="text-event-darkGray text-sm font-medium">
										Active Users
									</p>
									<p className="text-event-blue text-xl font-bold">25.3K</p>
								</div>
							</div>
						</div>

						<div
							className="glass-effect animate-float absolute -left-10 bottom-20 rounded-lg p-4 shadow-sm"
							style={{ animationDelay: '3s' }}
						>
							<div className="flex items-center gap-3">
								<div className="bg-event-blue/10 flex h-10 w-10 items-center justify-center rounded-full">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="20"
										height="20"
										viewBox="0 0 24 24"
										fill="none"
										stroke="#33C3F0"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<rect
											x="3"
											y="4"
											width="18"
											height="18"
											rx="2"
											ry="2"
										></rect>
										<line x1="16" y1="2" x2="16" y2="6"></line>
										<line x1="8" y1="2" x2="8" y2="6"></line>
										<line x1="3" y1="10" x2="21" y2="10"></line>
									</svg>
								</div>
								<div>
									<p className="text-event-darkGray text-sm font-medium">
										Events Created
									</p>
									<p className="text-event-blue text-xl font-bold">8.4K</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Hero;
