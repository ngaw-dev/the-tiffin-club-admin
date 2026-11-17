'use client';

// Server-mode DataTable wrapper: URL-synced filter/sort/page/per_page state,
// debounced live text search, instant SingleSelect filters, and Spatie
// query-builder param serialization (`filter[...]`, `sort`, `page`,
// `per_page`). Clone this into other list pages (customers, payments).

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useDebounce } from '@/hooks/amolsw/use-debounce';
import { EmptyState } from '@/components/amolsw/empty-state/empty-state';
import { SearchInput } from '@/components/amolsw/search-input/search-input';
import { SingleSelect } from '@/components/amolsw/single-select/single-select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ListEnvelope } from '@/lib/api';
import { DataTable } from './data-table';

export type ServerSortDirection = 'asc' | 'desc';

export interface ServerTableState {
  /** Debounced live text-search value. */
  search: string;
  filters: Record<string, string>;
  sortField: string;
  sortDirection: ServerSortDirection;
  page: number;
  perPage: number;
}

export interface UseServerTableQueryOptions {
  filterKeys: string[];
  defaultSortField: string;
  defaultSortDirection?: ServerSortDirection;
  defaultPerPage?: number;
}

function readParam(key: string): string {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get(key) ?? '';
}

/** Serialize table state to Spatie query-builder list params. */
export function serializeServerTableState(state: ServerTableState): Record<string, string | undefined> {
  const params: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(state.filters)) {
    if (value) params[`filter[${key}]`] = value;
  }
  params.sort = state.sortDirection === 'desc' ? `-${state.sortField}` : state.sortField;
  params.page = String(state.page);
  params.per_page = String(state.perPage);
  return params;
}

export function useServerTableQuery({
  filterKeys,
  defaultSortField,
  defaultSortDirection = 'asc',
  defaultPerPage = 15,
}: UseServerTableQueryOptions) {
  const readState = useCallback((): ServerTableState => {
    const filters: Record<string, string> = {};
    for (const key of filterKeys) filters[key] = readParam(key);
    const sortParam = readParam('sort');
    const isDesc = sortParam.startsWith('-');
    const sortField = isDesc ? sortParam.slice(1) : sortParam;
    const pageParam = readParam('page');
    const perPageParam = readParam('per_page');
    return {
      search: readParam('q'),
      filters,
      sortField: sortField || defaultSortField,
      sortDirection: sortParam ? (isDesc ? 'desc' : 'asc') : defaultSortDirection,
      page: pageParam ? Math.max(1, parseInt(pageParam, 10) || 1) : 1,
      perPage: perPageParam ? parseInt(perPageParam, 10) || defaultPerPage : defaultPerPage,
    };
  }, [filterKeys, defaultSortField, defaultSortDirection, defaultPerPage]);

  const defaults = useMemo(
    () => ({
      sortField: defaultSortField,
      sortDirection: defaultSortDirection,
      perPage: defaultPerPage,
    }),
    [defaultSortField, defaultSortDirection, defaultPerPage]
  );

  const [state, setState] = useState<ServerTableState>(readState);
  const [rawSearch, setRawSearch] = useState(() => readState().search);
  const search = useDebounce(rawSearch, 300);

  const defaultsRef = useRef(defaults);
  defaultsRef.current = defaults;

  // Push non-default state to the URL (shareable, replace-only so filtering
  // doesn't spam history; back/forward is handled via popstate below).
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete('q');
    for (const key of filterKeys) searchParams.delete(key);
    searchParams.delete('sort');
    searchParams.delete('page');
    searchParams.delete('per_page');
    if (state.search) searchParams.set('q', state.search);
    for (const [key, value] of Object.entries(state.filters)) {
      if (value) searchParams.set(key, value);
    }
    if (state.sortField !== defaultsRef.current.sortField || state.sortDirection !== defaultsRef.current.sortDirection) {
      searchParams.set('sort', state.sortDirection === 'desc' ? `-${state.sortField}` : state.sortField);
    }
    if (state.page > 1) searchParams.set('page', String(state.page));
    if (state.perPage !== defaultsRef.current.perPage) searchParams.set('per_page', String(state.perPage));
    const qs = searchParams.toString();
    window.history.replaceState(null, '', qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
  }, [state, search, filterKeys]);

  // Debounced search joins the state (and resets to page 1).
  useEffect(() => {
    setState((prev) => (prev.search === search ? prev : { ...prev, search, page: 1 }));
  }, [search]);

  // Back/forward re-reads the URL.
  useEffect(() => {
    const handlePopState = () => {
      const next = readState();
      setState(next);
      setRawSearch(next.search);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [readState]);

  const setFilter = useCallback((key: string, value: string) => {
    setState((prev) => ({ ...prev, filters: { ...prev.filters, [key]: value }, page: 1 }));
  }, []);

  const setSorting = useCallback((field: string, direction: ServerSortDirection) => {
    setState((prev) => ({ ...prev, sortField: field, sortDirection: direction, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setState((prev) => ({ ...prev, page: Math.max(1, page) }));
  }, []);

  const setPerPage = useCallback((perPage: number) => {
    setState((prev) => ({ ...prev, perPage, page: 1 }));
  }, []);

  const clear = useCallback(() => {
    setRawSearch('');
    setState((prev) => ({
      ...prev,
      search: '',
      filters: {},
      sortField: defaultsRef.current.sortField,
      sortDirection: defaultsRef.current.sortDirection,
      perPage: defaultsRef.current.perPage,
      page: 1,
    }));
  }, []);

  return { state, rawSearch, setRawSearch, setFilter, setSorting, setPage, setPerPage, clear };
}

export type ServerTableQuery = ReturnType<typeof useServerTableQuery>;

export interface ServerDataTableSelectFilter {
  key: string;
  label: string;
  placeholder?: string;
  options: { value: string; label: string }[];
}

export interface ServerDataTableProps<TData> {
  columns: ColumnDef<TData>[];
  query: ServerTableQuery;
  /** Fetch one page; receives the full table state plus serialized Spatie params. */
  fetchPage: (state: ServerTableState, params: Record<string, string | undefined>) => Promise<ListEnvelope<TData>>;
  selectFilters?: ServerDataTableSelectFilter[];
  searchPlaceholder?: string;
  perPageOptions?: number[];
  emptyTitle?: string;
  emptyDescription?: string;
  /** Bump to force a refetch (e.g. after a row mutation). */
  reloadKey?: number;
  className?: string;
}

export function ServerDataTable<TData>({
  columns,
  query,
  fetchPage,
  selectFilters = [],
  searchPlaceholder = 'Search...',
  perPageOptions = [15, 25, 50],
  emptyTitle = 'No results',
  emptyDescription = 'No results found.',
  reloadKey = 0,
  className,
}: ServerDataTableProps<TData>) {
  const { state, rawSearch, setRawSearch, setFilter, setSorting, setPage, setPerPage, clear } = query;
  const [data, setData] = useState<TData[]>([]);
  const [meta, setMeta] = useState<ListEnvelope<TData>['meta']>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const requestCounter = useRef(0);

  useEffect(() => {
    const requestId = ++requestCounter.current;
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    fetchPage(state, serializeServerTableState(state))
      .then((result) => {
        if (cancelled || requestId !== requestCounter.current) return;
        setData(result.data ?? []);
        setMeta(result.meta);
      })
      .catch((err: unknown) => {
        if (cancelled || requestId !== requestCounter.current) return;
        const message = err instanceof Error ? err.message : 'Something went wrong loading results.';
        setError(message);
        toast.error(message);
      })
      .finally(() => {
        if (!cancelled && requestId === requestCounter.current) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, reloadToken, reloadKey]);

  const sorting: SortingState = useMemo(
    () => [{ id: state.sortField, desc: state.sortDirection === 'desc' }],
    [state.sortField, state.sortDirection]
  );

  const hasActiveFilters =
    Boolean(state.search) || Object.values(state.filters).some(Boolean) || state.perPage !== perPageOptions[0];

  return (
    <div className={className}>
      <div className='mb-6 space-y-4'>
        <div className='flex items-center gap-2'>
          <div className='min-w-0 flex-1'>
            <SearchInput
              value={rawSearch}
              onChange={setRawSearch}
              loading={isLoading && Boolean(rawSearch)}
              placeholder={searchPlaceholder}
            />
          </div>
          {hasActiveFilters && (
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={clear}
              className='h-8 cursor-pointer px-2 text-xs'
            >
              <X className='mr-1 h-3 w-3' />
              Clear filters
            </Button>
          )}
        </div>
        <div className='flex flex-wrap items-end gap-4'>
          {selectFilters.map((filter) => (
            <div key={filter.key} className='w-56 space-y-2'>
              <Label className='block'>{filter.label}</Label>
              <SingleSelect
                options={filter.options}
                value={state.filters[filter.key] ?? ''}
                onChange={(value) => setFilter(filter.key, value)}
                placeholder={filter.placeholder ?? 'All'}
                aria-label={filter.label}
              />
            </div>
          ))}
          <div className='ml-auto space-y-2'>
            <Label className='block'>Per page</Label>
            <Select value={String(state.perPage)} onValueChange={(v) => setPerPage(parseInt(v, 10))}>
              <SelectTrigger className='w-20'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {perPageOptions.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {error ? (
        <EmptyState
          title='Could not load results'
          description={error}
          action={{ label: 'Retry', onClick: () => setReloadToken((t) => t + 1) }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={data}
          isLoading={isLoading}
          meta={meta ? { current_page: meta.current_page ?? 1, last_page: meta.last_page ?? 1, from: meta.from ?? null, to: meta.to ?? null, total: meta.total ?? 0, per_page: meta.per_page ?? state.perPage } : undefined}
          onPageChange={setPage}
          sorting={sorting}
          onSortingChange={(next) => {
            const first = next[0];
            if (!first) {
              // TanStack cycles asc → desc → none; treat none as a flip back.
              setSorting(state.sortField, state.sortDirection === 'desc' ? 'asc' : 'desc');
            } else {
              setSorting(first.id, first.desc ? 'desc' : 'asc');
            }
          }}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
        />
      )}
    </div>
  );
}
