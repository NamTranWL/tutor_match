import { useMutation, UseMutationOptions, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useId } from 'react';

type AsyncFunctionReturnType<T extends AsyncFunction> = Awaited<ReturnType<T>>;

type AsyncFunction = (...args: never[]) => Promise<unknown>;

/**
 * Generates a type-safe React Query hook from an API service. Reduce code duplication and boilerplate code while still being type-safe.
 *
 * @template T The async function type (typically a service method)
 * @param {T} fn The service method to be used as the query function
 * @param {string} queryKey The base query key for caching and invalidation
 *
 * @returns {Function} The useQuery hook from @tanstack/react-query
 *
 * @description
 * This utility function creates a reusable query hook that:
 * - Automatically extracts data from Axios responses
 * - Supports queries with or without parameters
 * - Provides type-safe query generation
 * - Abstracts the query creation logic that binds to the API service
 *
 * @example
 * // With a service method that requires a parameter
 * const useDeviceQuery = generateQuery(DeviceService.getDeviceById, 'device');
 * const deviceQuery = useDeviceQuery('deviceId', {
 *   enabled: true,
 *   staleTime: 5000
 * });
 *
 * @example
 * // With a service method that doesn't require a parameter
 * const useCompaniesQuery = generateQuery(CompanyService.getCompanies, 'companies');
 * const companiesQuery = useCompaniesQuery({
 *   enabled: true,
 * });
 *
 * @example
 * // Type-safe data access
 * const device: DeviceDto | undefined = deviceQuery.data;
 * const companies: CompanyDto[] | undefined = companiesQuery.data;
 *
 * @see https://tanstack.com/query/latest/docs/react/overview
 */
export function generateUseQueryHook<T extends AsyncFunction>(fn: T, queryKey: string | string[]) {
  type ResponseType = AsyncFunctionReturnType<T>;

  type MultiParams = Parameters<T>;
  type Params = MultiParams[0];
  type Options = Omit<UseQueryOptions<ResponseType, AxiosError, ResponseType>, 'queryKey' | 'queryFn'>;

  // Variant 1: With variables and options
  type QueryFnWithVariables = Params extends undefined
    ? (options?: Options) => ReturnType<typeof useQuery<ResponseType, AxiosError>>
    : (...args: [...MultiParams, Options?]) => ReturnType<typeof useQuery<ResponseType, AxiosError>>;

  // Variant 2: With only options
  type QueryFnWithoutVariables = (options?: Options) => ReturnType<typeof useQuery<ResponseType, AxiosError>>;

  const queryFn = ((...args: Params extends undefined ? [Options?] : [...MultiParams, Options?]) => {
    const argsLength = args.length;

    const fnArgumentLength = fn.length;

    let firstArgs: unknown[] = [];
    let options: Options | undefined = undefined;

    /**
     * If the number of arguments is the same as the number of arguments the function takes, that means the user do not pass any options to the query.
     * We can then pass all the arguments to the query.
     */
    if (argsLength === fnArgumentLength) {
      firstArgs = args;
    } else {
      firstArgs = args.slice(0, argsLength - 1);
      options = args[argsLength - 1];
    }

    // const [firstArgs, options] =
    //   args.length >= 1 ? [args.slice(0, argsLength - 1), args[argsLength - 1]] : [[undefined], undefined];

    const keys = Array.isArray(queryKey) ? queryKey : [queryKey];

    return useQuery<ResponseType, AxiosError>({
      queryKey: [...keys, ...firstArgs],
      queryFn: () => fn(...(firstArgs as never[])) as Promise<ResponseType>,
      ...(options as Options),
    });
  }) as Params extends undefined ? QueryFnWithoutVariables : QueryFnWithVariables;
  return queryFn;
}

// Mutation

type MutationAsyncFunctionReturnType<T extends MutationAsyncFunction> = Awaited<ReturnType<T>>;

// The function must only have one parameter
type MutationAsyncFunction = (arg: never) => Promise<unknown>;

/**
 * Generates a type-safe React Query mutation hook from an API service method.
 * Reduces code duplication and boilerplate while maintaining type safety.
 *
 * @template T The async function type (typically a service method)
 * @param {T} fn The service method to be used as the mutation function
 * @param {string} mutationKey The base mutation key for identification
 *
 * @returns {Function} The useMutation hook from @tanstack/react-query
 *
 * @description
 * This utility function creates a reusable mutation hook that:
 * - Supports mutations with or without parameters
 * - Provides type-safe mutation generation
 * - Abstracts the mutation creation logic
 *
 * @example
 * // With a service method that requires a parameter
 * const useCreateDeviceMutation = generateMutation(DeviceService.createDevice, 'create-device');
 * const createDeviceMutation = useCreateDeviceMutation(deviceData, {
 *   onSuccess: () => {
 *     // Handle success
 *   }
 * });
 *
 * @example
 * // With a service method that doesn't require a parameter
 * const useResetPasswordMutation = generateMutation(AuthService.resetPassword, 'reset-password');
 * const resetPasswordMutation = useResetPasswordMutation({
 *   onSuccess: () => {
 *     // Handle success
 *   }
 * });
 */
export function generateUseMutationHook<T extends MutationAsyncFunction>(fn: T, mutationKey?: string | string[]) {
  type ResponseType = MutationAsyncFunctionReturnType<T>;
  type MultiParams = Parameters<T>;
  type Params = MultiParams[0];
  type Options = Omit<UseMutationOptions<ResponseType, AxiosError, Params>, 'mutationFn'>;

  // Variant 1: With variables and options
  type MutationFnWithVariables = Params extends undefined
    ? (options?: Options) => ReturnType<typeof useMutation<ResponseType, AxiosError, Params>>
    : (...args: [Params, Options?]) => ReturnType<typeof useMutation<ResponseType, AxiosError, Params>>;

  // Variant 2: With only options
  type MutationFnWithoutVariables = (
    options?: Options,
  ) => ReturnType<typeof useMutation<ResponseType, AxiosError, Params>>;

  const mutationFn = ((...args: Params extends undefined ? [Options?] : [Params, Options?]) => {
    const [firstArg, options] = args.length === 2 ? [args[0], args[1]] : [undefined, args[0]];

    // If the mutationKey is not provided, generate a random id
    const autoId = useId();
    const keys = Array.isArray(mutationKey) ? mutationKey : [mutationKey ?? autoId];

    return useMutation<ResponseType, AxiosError, Params>({
      mutationKey: [...keys, firstArg],
      mutationFn: (request) => fn(request) as Promise<ResponseType>,
      ...(options as Options),
    });
  }) as MutationFnWithVariables & MutationFnWithoutVariables;

  return mutationFn;
}
