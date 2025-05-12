'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { CreateInvoiceFormSchema, UpdateInvoiceFormSchema } from '@/lib/types/invoice';
import { createInvoice, deleteInvoice, updateInvoice } from '@/lib/db/invoice';

export type State = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    };
    message?: string | null;
}

async function validateForm(prevState: State | undefined, formData: FormData, mode: "add" | "edit") {
    const schema = mode === "add" ? CreateInvoiceFormSchema : UpdateInvoiceFormSchema;

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

export async function createInvoiceAction(prevState: State | undefined, formData: FormData) {
    const validationResult = await validateForm(prevState, formData, 'add');
    if ('error' in validationResult) {
        return validationResult.error;
    }

    const { customerId, amount, status, date } = validationResult.data;

    try {
        createInvoice({ customerId, amount, status, date });
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

export async function updateInvoiceAction(id: string, prevState: State | undefined, formData: FormData) {
    const validationResult = await validateForm(prevState, formData, 'edit');
    if ('error' in validationResult) {
        return validationResult.error;
    }

    const { customerId, amount, status } = validationResult.data;
   
    try {
        updateInvoice({ id, customerId, amount, status });
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

export async function deleteInvoiceAction(id: string) {
    try {
        deleteInvoice(id);
    } catch(error) {
        console.log(error);
    }

    revalidatePath('/dashboard/invoices');
}