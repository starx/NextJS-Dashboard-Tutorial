import Form from '@/ui/components/invoices/create-form';
import Breadcrumbs from '@/ui/components/invoices/breadcrumbs';
import { fetchCustomers } from '@/lib/data';
 
import { Metadata } from 'next';
 
export const metadata: Metadata = {
  title: 'Create new Invoice',
};

export default async function Page() {
  const customers = await fetchCustomers();
 
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Create Invoice',
            href: '/dashboard/invoices/create',
            active: true,
          },
        ]}
      />
      <Form customers={customers} />
    </main>
  );
}