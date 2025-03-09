import type { Metadata, Viewport } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';
import { SessionProvider } from '@/components/SessionProvider';
import Navbar from '@/components/ui/navbar';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';

const dmSans = DM_Sans({
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-dm-sans',
	weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900']
});

export const metadata: Metadata = {
	title: 'Your wesite title | Goes here for now',
	description: 'This is a custom description for your website',
	metadataBase: new URL('https://yourwebsite.com'),
	openGraph: {
		type: 'website',
		locale: 'en_US',
		url: '/',
		images: '/opengraph-image.png' // TODO: Update extension for your image
	},
	robots: {
		index: true,
		follow: true,
		nocache: true,
		googleBot: {
			'index': true,
			'follow': true,
			'noimageindex': false,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1
		}
	},
	keywords: ['Add', 'your', 'keywords', 'here'],
	category: 'Add your category here'
};

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	maximumScale: 1
};

export default async function RootLayout({
	children
}: {
	children: React.ReactNode;
}) {
	const session = await getServerSession(authOptions);

	return (
		<html lang="en">
			<body className={dmSans.className}>
				<SessionProvider session={session}>
					<div className="flex min-h-screen flex-col">
						<Navbar />
						<main className="flex-grow">{children}</main>
						<footer className="mt-12 bg-gray-100 py-6">
							<div className="container mx-auto px-4 text-center text-sm text-gray-600">
								<p>
									&copy; {new Date().getFullYear()} Nexus Events. All rights
									reserved.
								</p>
							</div>
						</footer>
					</div>
				</SessionProvider>
			</body>
		</html>
	);
}
