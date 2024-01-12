import { Metadata } from 'next';
import {fetchCustomers, fetchCustomersPages, fetchFilteredInvoices, fetchInvoicesPages} from "@/app/lib/data";
import {lusitana} from "@/app/ui/fonts";
import {Suspense} from "react";
import {InvoicesTableSkeleton} from "@/app/ui/skeletons";
import Table from "@/app/ui/customers/table";
import Pagination from "@/app/ui/customers/pagination";
import Search from "@/app/ui/search";
import {CreateCustomer} from "@/app/ui/customers/buttons";

export const metadata: Metadata = {
    title: 'Customers',
};

export default async function Page({
                                       searchParams,
                                   }: {
    searchParams?: {
        query?: string;
        page?: string;
    };
}) {
    // Pour pagination
    const query = searchParams?.query || '';
    const currentPage = Number(searchParams?.page) || 1;
    const totalPages = await fetchCustomersPages(query);

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>Customers Page</h1>
            </div>
            <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
                <CreateCustomer/>
            </div>
            <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton/>}>
                <Table query={query} currentPage={currentPage}/>
            </Suspense>
            <div className="mt-5 flex w-full justify-center">
                <Pagination totalPages={totalPages}/>
            </div>
        </div>
    );
}
