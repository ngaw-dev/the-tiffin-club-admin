// app/(admin)/customers/page.tsx
'use client';

// Customers list: amolsw ServerDataTable in manual (server) mode over
// GET /customers. Filter/sort/page/per_page state lives in the URL and is
// serialized to Spatie query-builder params (filter[...], sort, page,
// per_page). The API has no free-text search — the live search box maps to
// the name filter.

import { useCallback, useMemo } from 'react';
import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import {
  ServerDataTable,
  useServerTableQuery,
  type ServerTableState,
} from '@/components/amolsw/data-table/server-data-table';
import { api, type ListEnvelope } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Customer = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  suburb: string | null;
  order_count: number;
};

export default function CustomersPage() {
  const query = useServerTableQuery({
    filterKeys: [],
    defaultSortField: 'name',
    defaultSortDirection: 'asc',
    defaultPerPage: 15,
  });

  const fetchPage = useCallback(
    async (state: ServerTableState, params: Record<string, string | undefined>) => {
      const { sort, page, per_page } = params;
      return api.get<ListEnvelope<Customer>>('/customers', {
        sort,
        page,
        per_page,
        'filter[name]': state.search || undefined,
      });
    },
    [],
  );

  const columns = useMemo<ColumnDef<Customer>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <Link
            href={`/customers/${row.original.id}`}
            className='font-medium text-primary underline-offset-4 hover:underline'
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => row.original.email,
      },
      {
        accessorKey: 'phone',
        header: 'Phone',
        enableSorting: false,
        cell: ({ row }) => row.original.phone || '—',
      },
      {
        accessorKey: 'suburb',
        header: 'Suburb',
        cell: ({ row }) => row.original.suburb || '—',
      },
      {
        accessorKey: 'order_count',
        header: 'Orders',
        meta: { className: 'text-right' },
        cell: ({ row }) => <Badge variant='secondary'>{row.original.order_count}</Badge>,
      },
    ],
    [],
  );

  return (
    <div className='mx-auto flex w-full max-w-6xl flex-col gap-6'>
      <div className='flex flex-col gap-1'>
        <h1 className='text-3xl font-bold tracking-tight'>Customers</h1>
        <p className='text-sm text-muted-foreground'>
          Browse subscribers, look up delivery details, and see how many orders each customer has
          placed.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Directory</CardTitle>
          <CardDescription>Search by name; sort with the column headers.</CardDescription>
        </CardHeader>
        <CardContent>
          <ServerDataTable
            columns={columns}
            query={query}
            fetchPage={fetchPage}
            searchPlaceholder='Search by name...'
            emptyTitle='No customers found'
            emptyDescription='No customers match this search. Try a different name or clear the search.'
          />
        </CardContent>
      </Card>
    </div>
  );
}
