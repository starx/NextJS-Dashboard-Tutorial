'use client';

import { CustomerField } from '@/lib/types/customer';
import { InvoiceForm } from '@/lib/types/invoice';
import Link from 'next/link';
import { Button } from '@/ui/components/button';
import { updateInvoice, State } from '@/app/dashboard/invoices/actions';
import { useActionState } from 'react';
import FormFields from './form-fields';

export default function EditInvoiceForm({
  invoice,
  customers,
}: {
  invoice: InvoiceForm;
  customers: CustomerField[];
}) {
  const initialState: State = { message: null, errors: {} };

  const updateInvoiceWithId = updateInvoice.bind(null, invoice.id);
  const [state, formAction] = useActionState(updateInvoiceWithId, initialState);

  return (
    <form action={formAction}>
      <FormFields customers={customers} defaultValues={invoice} errors={state?.errors} />
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/invoices"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Edit Invoice</Button>
      </div>
    </form>
  );
}
