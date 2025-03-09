import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
	try {
		const { email, password, fullName, role } = await request.json();

		// Check if user already exists
		const existingUser = await prisma.user.findUnique({
			where: { email }
		});

		if (existingUser) {
			return NextResponse.json(
				{ error: 'User already exists' },
				{ status: 400 }
			);
		}

		// Hash password
		const hashedPassword = await hash(password, 10);

		// Create user
		const user = await prisma.user.create({
			data: {
				email,
				password: hashedPassword,
				fullName,
				role: role || 'ATTENDEE'
			}
		});

		// Return the created user without the password
		const { password: _, ...userWithoutPassword } = user;

		return NextResponse.json({ user: userWithoutPassword }, { status: 201 });
	} catch (error) {
		console.error('Registration error:', error);
		return NextResponse.json(
			{ error: 'An error occurred during registration' },
			{ status: 500 }
		);
	}
}
