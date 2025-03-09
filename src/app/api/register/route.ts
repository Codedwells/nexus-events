import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Define types for user data
interface UserCreationResult {
	id: string;
	fullName: string;
	email: string;
}

export async function POST(request: Request): Promise<NextResponse> {
	try {
		const body = await request.json();
		const { fullName, email, password } = body;

		// Check if user already exists
		const existingUser = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM "User" WHERE email = ${email} LIMIT 1
    `;

		if (existingUser.length > 0) {
			return NextResponse.json(
				{ error: 'User with this email already exists' },
				{ status: 400 }
			);
		}

		// Hash the password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create user with raw SQL that matches our schema
		const result = await prisma.$queryRaw<UserCreationResult[]>`
      INSERT INTO "User" (
        id,
        "fullName", 
        email, 
        password,
        role,
        "createdAt"
      )
      VALUES (
        LOWER(HEX(RANDOMBLOB(16))), 
        ${fullName},
        ${email},
        ${hashedPassword},
        'ATTENDEE',
        datetime('now')
      )
      RETURNING id, "fullName", email
    `;

		const newUser = result[0];

		return NextResponse.json({
			user: {
				id: newUser.id,
				fullName: newUser.fullName,
				email: newUser.email
			}
		});
	} catch (error) {
		console.error('Error registering user:', error);
		return NextResponse.json(
			{
				error: 'An error occurred during registration',
				details: String(error)
			},
			{ status: 500 }
		);
	}
}
