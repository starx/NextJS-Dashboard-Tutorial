'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { sql } from '@/app/lib/db';

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'Please select a customer.',
    }),
    amount: z.coerce
        .number()
        .gt(0, { message: 'Please enter an amount greater than $0.' }),
    status: z.enum(['pending', 'paid'], {
        invalid_type_error: 'Please select an invoice status.',
    }),
    date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true })
const UpdateInvoice = FormSchema.omit({ id: true, date: true })

export type State = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    };
    message?: string | null;
}

async function validateForm(prevState: State | undefined, formData: FormData, mode: "add" | "edit") {
    const schema = mode === "add" ? CreateInvoice : UpdateInvoice;

    const parsedData = {
        customerId: formData.get("customerId"),
        amount: formData.get("amount"),
        status: formData.get("status"),
      };
    
    const validatedFields = schema.safeParse(parsedData);
      

    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        return {
            error: {
                errors: validatedFields.error.flatten().fieldErrors,
                message:
                    mode === "add"
                        ? "Missing Fields. Failed to Create Invoice."
                        : "Invalid Fields. Failed to Update Invoice.",
            }
        };
    }

    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = Number(amount) * 100;
    const date = new Date().toISOString().split('T')[0];

    return { data: { customerId, amount: amountInCents, status, date } };

}

export async function createInvoice(prevState: State | undefined, formData: FormData) {
    const validationResult = await validateForm(prevState, formData, 'add');
    if ('error' in validationResult) {
        return validationResult.error;
    }

    const { customerId, amount, status, date } = validationResult.data;

    try {
        await sql`
            INSERT INTO invoices (customer_id, amount, status, date)
            VALUES (${customerId}, ${amount}, ${status}, ${date})
        `;
    } catch(error) {
        console.log(error);
        // If a database error occurs, return a more specific error.
        return {
            message: 'Database Error: Failed to Create Invoice.',
            errors: {}
        };
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function updateInvoice(id: string, prevState: State | undefined, formData: FormData) {
    const validationResult = await validateForm(prevState, formData, 'edit');
    if ('error' in validationResult) {
        return validationResult.error;
    }

    const { customerId, amount, status } = validationResult.data;
   
    try {
        await sql`
          UPDATE invoices
          SET customer_id = ${customerId}, amount = ${amount}, status = ${status}
          WHERE id = ${id}
        `;
    } catch(error) {
        console.log(error);
        // If a database error occurs, return a more specific error.

        return {
            message: 'Database Error: Failed to Update Invoice.',
            errors: {}
        };
    }
   
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
    try {
        await sql`DELETE FROM invoices WHERE id = ${id}`;
    } catch(error) {
        console.log(error);
    }

    revalidatePath('/dashboard/invoices');
}