import { z } from "zod";

export type InvoiceStatus = 'pending' | 'paid';

export type Invoice = {
    id: string;
    customer_id: string;
    amount: number;
    date: string;
    // In TypeScript, this is called a string union type.
    // It means that the "status" property can only be one of the two strings: 'pending' or 'paid'.
    status: InvoiceStatus;
};

export type CreateInvoice = {
    customerId: string;
    amount: number;
    status: string;
    date: string;
}

export type UpdateInvoice = {
    id: string;
    customerId: string;
    amount: number;
    status: string;
}

export type LatestInvoice = {
    id: string;
    name: string;
    image_url: string;
    email: string;
    amount: string;
};

// The database returns a number for amount, but we later format it to a string with the formatCurrency function
export type LatestInvoiceRaw = Omit<LatestInvoice, 'amount'> & {
    amount: number;
};
  
export type InvoicesTable = {
    id: string;
    customer_id: string;
    name: string;
    email: string;
    image_url: string | null;
    date: string;
    amount: number;
    status: InvoiceStatus;
};

export type InvoiceForm = {
    id: string;
    customer_id: string;
    amount: number;
    status: InvoiceStatus;
};

export const FormSchema = z.object({
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

export const CreateInvoiceFormSchema = FormSchema.omit({ id: true, date: true })
export const UpdateInvoiceFormSchema = FormSchema.omit({ id: true, date: true })