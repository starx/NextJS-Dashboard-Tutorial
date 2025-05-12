import { prisma } from "./prisma";
import { formatCurrency } from "../utils";

export async function fetchCardData() {
  try {
    const invoiceCountPromise = prisma.invoice.count();
    const customerCountPromise = prisma.customer.count();


    const [numberOfInvoices, numberOfCustomers ] = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
    ]);

    // Prisma doesn't do conditional sums in aggregate, so we need to fallback to raw SQL for that part
    const [statusSums] = await prisma.$queryRawUnsafe<{ paid: number; pending: number }[]>(`
      SELECT
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS paid,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS pending
      FROM invoice
    `);

    const totalPaidInvoices = formatCurrency(Number(statusSums.paid) ?? 0);
    const totalPendingInvoices = formatCurrency(Number(statusSums.pending) ?? 0);

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}