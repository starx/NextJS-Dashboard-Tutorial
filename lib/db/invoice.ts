import { InvoiceStatus, InvoiceForm, InvoicesTable, LatestInvoiceRaw, CreateInvoice, UpdateInvoice } from "../types/invoice";
import { formatCurrency } from "../utils";
import { prisma } from "./prisma";

export async function createInvoice({
  customerId,
  amount,
  status,
  date,
}: CreateInvoice) {
  try {
    await prisma.invoice.create({
      data: {
        customerId,
        amount,
        status,
        date: new Date(date).toISOString(),
      },
    });
  } catch (error) {
    console.error(error);
    throw new Error('Database Error: Failed to Create Invoice.');
  }
}

export async function updateInvoice({
  id,
  customerId,
  amount,
  status,
}: UpdateInvoice) {
  try {
    await prisma.invoice.update({
      where: { id },
      data: {
        customerId,
        amount,
        status,
      },
    });
  } catch (error) {
    console.error(error);
    throw new Error('Database Error: Failed to update Invoice.');
  }
}

export async function deleteInvoice(id: string) {
  try {
    await prisma.invoice.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Failed to delete invoice:', error);
    throw new Error('Database Error: Failed to delete invoices.');
  }
}

export async function fetchLatestInvoices() {
  try {
    console.log('Fetching invoice data...');

    const randomDelay = Math.floor(Math.random() * (30 - 5 + 1) + 5) * 100;
    await new Promise((resolve) => setTimeout(resolve, randomDelay));

    const invoices = await prisma.invoice.findMany({
      orderBy: { date: 'desc' },
      take: 5,
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            imageUrl: true,
          },
        },
      },
    });

    const latestInvoices = invoices.map((invoice) => ({
      id: invoice.id,
      amount: formatCurrency(invoice.amount),
      name: invoice.customer.name,
      email: invoice.customer.email,
      image_url: invoice.customer.imageUrl,
    }));

    console.log('Invoice data fetch completed.');

    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(query: string, currentPage: number): Promise<InvoicesTable[]> {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const q = `%${query}%`;

    const invoices = await prisma.$queryRaw<InvoicesTable[]>`
      SELECT
        invoice.id,
        invoice.amount,
        invoice.date,
        invoice.status,
        customer.name,
        customer.email,
        customer.imageUrl as 'image_url'
      FROM invoice
      JOIN customer ON invoice.customerId = customer.id
      WHERE
        LOWER(customer.name) LIKE LOWER(${q}) OR
        LOWER(customer.email) LIKE LOWER(${q}) OR
        CAST(invoice.amount AS TEXT) LIKE ${q} OR
        LOWER(invoice.status) LIKE LOWER(${q}) OR
        strftime('%Y-%m-%d', invoice.date / 1000, 'unixepoch') LIKE ${q}
      ORDER BY invoice.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
      `;

    return invoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const q = `%${query}%`;

    const data = await prisma.$queryRaw<{ count: number }[]>`
      SELECT
        count(invoice.id) AS count
      FROM invoice
      JOIN customer ON invoice.customerId = customer.id
      WHERE
        LOWER(customer.name) LIKE LOWER(${q}) OR
        LOWER(customer.email) LIKE LOWER(${q}) OR
        CAST(invoice.amount AS TEXT) LIKE ${q} OR
        LOWER(invoice.status) LIKE LOWER(${q}) OR
        strftime('%Y-%m-%d', invoice.date / 1000, 'unixepoch') LIKE ${q}
    `;

    const totalCount = Number(data[0]?.count ?? 0); // Safely convert BigInt → number
    return Math.ceil(totalCount / ITEMS_PER_PAGE);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string): Promise<InvoiceForm | null> {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      select: {
        id: true,
        customerId: true,
        amount: true,
        status: true,
      },
    });

    if (!invoice) return null;

    return {
      id: invoice.id,
      customer_id: invoice.customerId,

      // Convert cents to dollars
      amount: invoice.amount / 100,
      status: invoice.status as InvoiceStatus
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}