'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { sql } from '@/app/lib/db';

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true })

export async function createInvoice(formData: FormData) {
    const { customerId, amount, status } = CreateInvoice.parse(Object.fromEntries(formData));
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];
    
    await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;

    revalidatePath('/dashboard/invoices');
}