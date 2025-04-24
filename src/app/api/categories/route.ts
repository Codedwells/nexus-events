import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../auth/[...nextauth]/route';
import { createId } from '@paralleldrive/cuid2';

export async function GET() {
	try {
		// Using raw SQL to fetch all categories
		const categories = await prisma.$queryRaw`
      SELECT
        c.id, c.name,
        (SELECT COUNT(*) FROM Event e WHERE e.categoryId = c.id) as eventCount
      FROM Category c
    `;

		// Convert BigInt values to regular numbers before JSON serialization
		const serializedCategories = categories.map((category: any) => ({
			...category,
			eventCount: Number(category.eventCount)
		}));

		return NextResponse.json(serializedCategories);
	} catch (error) {
		console.error('Failed to fetch categories:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch categories' },
			{ status: 500 }
		);
	}
}

export async function POST(request: Request) {
	try {
		const session = await getServerSession(authOptions);

		// Only admins can create categories
		if (!session || !session.user || session.user.role !== 'ADMIN') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { name } = await request.json();

		if (!name) {
			return NextResponse.json({ error: 'Name is required' }, { status: 400 });
		}

		// Check if category already exists
		const existingCategories = await prisma.$queryRaw`
      SELECT * FROM Category WHERE name = ${name}
    `;

		if (existingCategories && existingCategories.length > 0) {
			return NextResponse.json(
				{ error: 'Category already exists' },
				{ status: 409 }
			);
		}

		// Use cuid2 instead of random string
		const categoryId = createId();

		// Create category using raw SQL
		await prisma.$executeRaw`
      INSERT INTO Category (id, name)
      VALUES (${categoryId}, ${name})
    `;

		// Fetch the created category
		const createdCategories = await prisma.$queryRaw`
      SELECT * FROM Category WHERE id = ${categoryId}
    `;

		return NextResponse.json(createdCategories[0], { status: 201 });
	} catch (error) {
		console.error('Failed to create category:', error);
		return NextResponse.json(
			{ error: 'Failed to create category' },
			{ status: 500 }
		);
	}
}
