import CardWrapper from '@/app/dashboard/components/cards';
import RevenueChart from '@/app/dashboard/components/revenue-chart';
import LatestInvoices from '@/app/dashboard/components/latest-invoices';
import { lusitana } from '@/ui/styles/fonts';
import { Suspense } from 'react';
import { 
  RevenueChartSkeleton, 
  LatestInvoicesSkeleton
} from '@/ui/components/skeletons';
 
export default async function Page() {
  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<CardWrapper />}>
          <CardWrapper />
        </Suspense>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <Suspense fallback={<RevenueChartSkeleton />}>
          <RevenueChart />
        </Suspense>
        <Suspense fallback={<LatestInvoicesSkeleton />}>
          <LatestInvoices />
        </Suspense>
      </div>
    </main>
  );
}