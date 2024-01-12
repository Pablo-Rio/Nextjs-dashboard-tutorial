import Image from 'next/image';
import { lusitana } from '@/app/ui/fonts';
import Search from '@/app/ui/search';
import { CustomersTable, FormattedCustomersTable } from '@/app/lib/definitions';
import {fetchFilteredCustomers, fetchFilteredInvoices} from "@/app/lib/data";

export default async function CustomersTable({
                                               query,
                                               currentPage,
                                             }: {
  query: string;
  currentPage: number;
}) {
  const customers = await fetchFilteredCustomers(query, currentPage);

  return (
    <div className="w-full">
      <div className="mt-6 flow-root">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-md bg-gray-50 p-2 md:pt-0">
              <table className="hidden min-w-full rounded-md text-gray-900 md:table">
                <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
                <tr>
                  <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                    Id
                  </th>
                  <th scope="col" className="px-3 py-5 font-medium">
                    Image
                  </th>
                  <th scope="col" className="px-3 py-5 font-medium">
                    Name
                  </th>
                  <th scope="col" className="px-3 py-5 font-medium">
                    Email
                  </th>
                </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 text-gray-900">
                {customers.map((customer) => (
                    <tr key={customer.id} className="group">
                      <td className="whitespace-nowrap bg-white py-5 pl-4 pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                        {customer.id}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        <Image
                            src={customer.image_url}
                            className="rounded-full"
                            alt={`${customer.name}'s profile picture`}
                            width={28}
                            height={28}
                        />
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {customer.name}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {customer.email}
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
