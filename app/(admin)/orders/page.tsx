'use client';

// app/(admin)/orders/page.tsx
// Orders list: amolsw ServerDataTable in manual (server) mode over GET /orders.
// Filter/sort/page/per_page state lives in the URL and is serialized to
// Spatie query-builder params (filter[...], sort, page, per_page).

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { ServerDataTable, useServerTableQuery, type ServerTableState } from '@/components/amolsw/data-table/server-data-table';
import { api } from '@/lib/api';
import { formatNzd } from '@/lib/money';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { ColumnDef } from '@tanstack/react-table';
import {
  FULFILMENTS,
  ORDER_STATUSES,
  STATUS_LABELS,
  nextStatusTransition,
  type Order,
  type OrderStatus,
  type Paginated,
  normalizeOrder,
} from './types';

const DEFAULT_PER_PAGE = 15;

function statusVariant(status: OrderStatus) {
  switch (status) {
    case 'completed':
      return 'default' as const;
    case 'cancelled':
      return 'destructive' as const;
    case 'out_for_delivery':
    case 'ready_for_pickup':
      return 'secondary' as const;
    default:
      return 'outline' as const;
  }
}

export default function OrdersPage() {
  const [busyOrderId, setBusyOrderId] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const query = useServerTableQuery({
    filterKeys: ['status', 'fulfilment', 'customer_id', 'menu_id'],
    defaultSortField: 'placed_at',
    defaultSortDirection: 'desc',
    defaultPerPage: DEFAULT_PER_PAGE,
  });

  const selectFilters = useMemo(
    () => [
      {
        key: 'status',
        label: 'Order Status',
        placeholder: 'All statuses',
        options: ORDER_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] })),
      },
      {
        key: 'fulfilment',
        label: 'Fulfilment',
        placeholder: 'All',
        options: FULFILMENTS.map((f) => ({ value: f, label: f === 'pickup' ? 'Pickup' : 'Delivery' })),
      },
      {
        key: 'customer_id',
        label: 'Customer ID',
        placeholder: 'e.g. 12',
        options: [],
      },
      {
        key: 'menu_id',
        label: 'Menu ID',
        placeholder: 'e.g. 3',
        options: [],
      },
    ],
    []
  );

  // The API has no free-text order search — the search box maps to the
  // numeric customer_id filter (ignored when non-numeric).
  const fetchPage = useCallback(
    async (state: ServerTableState, params: Record<string, string | undefined>) => {
      const { 'filter[customer_id]': _selectCustomerId, ...rest } = params;
      const customerId =
        state.filters.customer_id || (/^\d+$/.test(state.search) ? state.search : undefined);
      const result = await api.get<Paginated<Order>>('/orders', {
        ...rest,
        'filter[customer_id]': customerId,
      });
      return { ...result, data: (result.data ?? []).map(normalizeOrder) };
    },
    []
  );

  const advanceStatus = useCallback(
    async (order: Order) => {
      const next = nextStatusTransition(order.status, order.fulfilment);
      if (!next || busyOrderId === order.id) return;
      setBusyOrderId(order.id);
      try {
        await api.patch(`/orders/${order.id}`, { status: next.to });
        setReloadKey((k) => k + 1);
      } finally {
        setBusyOrderId(null);
      }
    },
    [busyOrderId]
  );

  const columns = useMemo<ColumnDef<Order>[]>(() => {
    const actionColumn: ColumnDef<Order> = {
      id: 'action',
      header: 'Action',
      enableSorting: false,
      meta: { className: 'text-right' },
      cell: ({ row }) => {
        const next = nextStatusTransition(row.original.status, row.original.fulfilment);
        if (!next) return null;
        return (
          <Button
            variant='outline'
            size='sm'
            disabled={busyOrderId === row.original.id}
            onClick={(e) => {
              e.stopPropagation();
              void advanceStatus(row.original);
            }}
          >
            {busyOrderId === row.original.id ? 'Updating…' : next.label}
          </Button>
        );
      },
    };

    return [
      {
        accessorKey: 'id',
        header: 'Order',
        cell: ({ row }) => (
          <Link
            href={`/orders/${row.original.id}`}
            className='font-medium hover:underline'
            onClick={(e) => e.stopPropagation()}
          >
            #{row.original.id}
          </Link>
        ),
      },
      {
        accessorKey: 'customer',
        header: 'Customer',
        cell: ({ row }) => row.original.customer?.name ?? '—',
      },
      {
        accessorKey: 'placed_at',
        header: 'Placed',
        cell: ({ row }) => (
          <span className='text-muted-foreground'>
            {row.original.placed_at ? new Date(row.original.placed_at).toLocaleString() : '—'}
          </span>
        ),
      },
      {
        accessorKey: 'total',
        header: 'Total',
        meta: { className: 'text-right' },
        cell: ({ row }) => <span className='font-medium tabular-nums'>{formatNzd(row.original.total)}</span>,
      },
      {
        accessorKey: 'paid_sum',
        header: 'Paid',
        enableSorting: false,
        meta: { className: 'text-right' },
        cell: ({ row }) => (
          <span className='tabular-nums text-muted-foreground'>{formatNzd(row.original.paid_sum)}</span>
        ),
      },
      {
        accessorKey: 'fulfilment',
        header: 'Fulfilment',
        cell: ({ row }) => <span className='capitalize'>{row.original.fulfilment}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={statusVariant(row.original.status)}>
            {STATUS_LABELS[row.original.status] ?? row.original.status}
          </Badge>
        ),
      },
      actionColumn,
    ];
  }, [advanceStatus, busyOrderId]);

  return (
    <div className='mx-auto flex w-full max-w-6xl flex-col gap-6'>
      <div className='flex flex-col gap-1'>
        <h1 className='text-3xl font-bold tracking-tight'>Orders</h1>
        <p className='text-sm text-muted-foreground'>
          Track tiffin orders from placement through delivery, flag issues, and keep the day&apos;s delivery
          run on schedule.
        </p>
      </div>

      <Card>
        <CardContent>
          <ServerDataTable
            columns={columns}
            query={query}
            fetchPage={fetchPage}
            selectFilters={selectFilters}
            searchPlaceholder='Search by customer ID...'
            emptyTitle='No orders found'
            emptyDescription='No orders match these filters. Try adjusting or clearing the filters.'
            reloadKey={reloadKey}
          />
        </CardContent>
      </Card>
    </div>
  );
}
