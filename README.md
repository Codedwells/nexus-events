# Nexus Events

A Next.js application for event management with authentication, event creation, and attendee registration.

## Technologies

- Next.js 15
- React 19
- Prisma ORM
- SQLite Database
- TypeScript
- Tailwind CSS
- NextAuth for authentication
- Radix UI for accessible components

## Prerequisites

- Node.js 18+ recommended
- pnpm package manager

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/Codedwells/nexus-events
cd nexus-events
pnpm install
```

## Environment Setup

Create a `.env` file in the project root:

```bash
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```

## Database Setup

Run the following Prisma commands to set up and seed the database:

```bash
pnpm prisma migrate dev --name init
pnpm prisma db seed
```
**An admin will be seeded with the following credentials**
- Email : `admin@mails.com`
- Password : `helloadmin1`

## Running the Application

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
