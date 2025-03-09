import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../auth/[...nextauth]/route';

// Get all categories
export async function GET() {
	try {
		const categories = await prisma.category.findMany({
			orderBy: { name: 'asc' }
		});

		return NextResponse.json({ categories });
	} catch (error) {
		console.error('Error fetching categories:', error);
		return NextResponse.json(
			{ error: 'Error fetching categories' },
			{ status: 500 }
		);
	}
}

// Create a new category
export async function POST(request: Request) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user || session.user.role !== 'ADMIN') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { name } = await request.json();

		// Check if category already exists
		const existingCategory = await prisma.category.findUnique({
			where: { name }
		});

		if (existingCategory) {
			return NextResponse.json(
				{ error: 'Category already exists' },
				{ status: 400 }
			);
		}

		const category = await prisma.category.create({
			data: { name }
		});

		return NextResponse.json({ category }, { status: 201 });
	} catch (error) {
		console.error('Error creating category:', error);
		return NextResponse.json(
			{ error: 'Error creating category' },
			{ status: 500 }
		);
	}
}
