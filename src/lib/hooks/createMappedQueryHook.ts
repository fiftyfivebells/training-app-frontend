import { UseBaseQueryOptions, useQuery, UseQueryResult } from "@tanstack/react-query";

export function createMappedQueryHook<
  ApiType,
  DomainType,
  KeyType extends readonly unknown[]
>(
  queryKey: KeyType,
  queryFn: () => Promise<ApiType>,
  mapper: (data: ApiType) => DomainType
) {
  return function useMappedQuery(
    options? : Omit<
    UseBaseQueryOptions<ApiType, Error, DomainType>,
    'queryKey' | 'queryFn' | 'select'
    >
  ): UseQueryResult<DomainType, Error> {
    return useQuery<ApiType, Error, DomainType>({
      queryKey,
      queryFn,
      select: mapper,
      staleTime: 5 * 60 * 1000, // TODO: replace this with a constant value?
      refetchOnWindowFocus: false,
      ...options,
    });
  };
}