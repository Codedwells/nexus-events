const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
	// Check if admin user exists
	const adminExists = await prisma.user.findFirst({
		where: {
			email: 'admin@mails.com'
		}
	});

	// If admin doesn't exist, create one
	if (!adminExists) {
		const hashedPassword = await bcrypt.hash('helloadmin1', 10);

		const admin = await prisma.user.create({
			data: {
				email: 'admin@mails.com',
				fullName: 'Admin User',
				password: hashedPassword,
				role: 'ADMIN' // Assuming you have a role field in your User model
			}
		});

		console.log('Admin user created:');
	} else {
		console.log('Admin user already exists');
	}

	// Seed categories
	await seedCategories();
}

async function seedCategories() {
	const categories = [
		'Technology',
		'Business',
		'Science',
		'Health',
		'Arts',
		'Education',
		'Entertainment',
		'Sports',
		'Social',
		'Networking'
	];

	console.log('Seeding categories...');

	for (const categoryName of categories) {
		// Check if category exists before creating
		const existingCategory = await prisma.category.findFirst({
			where: {
				name: categoryName
			}
		});

		if (!existingCategory) {
			await prisma.category.create({
				data: {
					name: categoryName
				}
			});
			console.log(`Category created: ${categoryName}`);
		} else {
			console.log(`Category already exists: ${categoryName}`);
		}
	}

	console.log('Categories seeding completed.');
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
