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
					</div>
				</div>
			</div>
		</section>
	);
};

export default Hero;
