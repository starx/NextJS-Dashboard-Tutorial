import { prisma } from "./prisma";
import type { Revenue } from '@prisma/client';

export async function fetchRevenue(): Promise<Revenue[]>  {
  try {
    // Artificially delay a response for demo purposes.
    // Don't do this in production :)

    console.log('Fetching revenue data...');
    const randomDelay = Math.floor(Math.random() * (30 - 5 + 1) + 5) * 100; 
    await new Promise((resolve) => setTimeout(resolve, randomDelay));

    const data = await prisma.revenue.findMany();

    console.log('Revenue data fetch completed.');

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}