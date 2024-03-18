# React

## Data fetching demo using Tanstack Query (formerly React Query) demo

### Advanced concepts:

- Auto-refresh when user revisited the fetched data page (by setting up how long data should be stored by React Query),
- queryKey stores fetched data cache information
- Cache Invalidation,
- Optimistic Updating & More

### Tanstack Query v5 (formerly React Query)

- 3rd party library for sending HTTP requests
- useQuery hook to fetch data (usually GET) and following props for config -
  - queryKey prop stores fetched data cache information
  - Important!!!: Note that, by default, useQuery would trigger a refetch each time the consumer component gets focus. It would use the cached data first and query http again to fetch updated data and replace the cache
  - queryFn to set the HTTP fetch function
  - staleTime set time in milliseconds to use the catch and send the request after the staleTime is exhausted
  - gcTime clear cache (garbage collect) data after gcTime is over
  - enabled enable/disable useQuery
- useMutation hook to send HTTP data (POST, PUT, PATCH, DELETE) -
  - mutationFn prop to set the HTTP send function
  - mutate to send request programmatically
  - onMutate prop, ideally used for optimistic update. Receives the same params as mutationFn
  - onSuccess prop to execute any desired code after mutation is successful
  - onError prop to execute any desired code after mutation is failed
  - onSettled prop to execute any desired code regardless of whether mutation is failed or succeded
- QueryClient >
  - invalidateQueries to clear use query cache by passing the queryKey
  - refetchType: ‘none’ disable automatic refetching after invalidations
  - getQueryData get cached data passing the queryKey
  - setQueryData update cached data for the passed queryKey
  - cancelQueries cancel any ongoing http requests for the queryKey
