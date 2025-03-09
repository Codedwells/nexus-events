import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/route';

// Delete a category
export async function DELETE(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user || session.user.role !== 'ADMIN') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Check if category exists
		const category = await prisma.category.findUnique({
			where: { id: params.id },
			include: {
				events: {
					select: { id: true }
				}
			}
		});

		if (!category) {
			return NextResponse.json(
				{ error: 'Category not found' },
				{ status: 404 }
			);
		}

		// Check if category is in use
		if (category.events.length > 0) {
			return NextResponse.json(
				{ error: 'Cannot delete category that is being used by events' },
				{ status: 400 }
			);
		}

		// Delete the category
		await prisma.category.delete({
			where: { id: params.id }
		});

		return NextResponse.json({ success: true }, { status: 200 });
	} catch (error) {
		console.error('Error deleting category:', error);
		return NextResponse.json(
			{ error: 'An error occurred while deleting the category' },
			{ status: 500 }
		);
	}
}
