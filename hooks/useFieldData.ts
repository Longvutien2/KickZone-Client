// 🚀 Custom hooks với SWR - Đơn giản và mạnh mẽ
import useSWR from 'swr';
import { getFieldsByIdFootball } from '@/api/field';
import { useAppDispatch } from '@/store/hook';
import { getListTimeSlotsByFootballFieldId } from '@/features/timeSlot.slice';
import { getListOrdersSlice } from '@/features/order.slice';

// 🚀 Hook để lấy danh sách sân
export function useFields(footballFieldId: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR(
    footballFieldId ? `fields-${footballFieldId}` : null,
    () => getFieldsByIdFootball(footballFieldId!),
    {
      revalidateOnFocus: false, // Không reload khi focus window
      revalidateOnReconnect: true, // Reload khi reconnect internet
      dedupingInterval: 60000, // Cache 1 phút
      errorRetryCount: 2, // Retry 2 lần khi lỗi
      errorRetryInterval: 1000, // Retry sau 1 giây
    }
  );

  return {
    fields: data?.data || [],
    isLoading,
    error,
    refetch: mutate
  };
}

// 🚀 Hook để lấy time slots
export function useTimeSlots(footballFieldId: string | undefined) {
  const dispatch = useAppDispatch();

  const { data, error, isLoading, mutate } = useSWR(
    footballFieldId ? `timeslots-${footballFieldId}` : null,
    async () => {
      const result = await dispatch(getListTimeSlotsByFootballFieldId(footballFieldId!));
      return result.payload;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 120000, // Cache 2 phút
      errorRetryCount: 1,
      errorRetryInterval: 1500,
    }
  );

  return {
    timeSlots: data || [],
    isLoading,
    error,
    refetch: mutate
  };
}

// 🚀 Hook để lấy orders
export function useOrders() {
  const dispatch = useAppDispatch();

  const { data, error, isLoading, mutate } = useSWR(
    'orders-list',
    async () => {
      const result = await dispatch(getListOrdersSlice());
      return result.payload;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 90000, // Cache 1.5 phút
      errorRetryCount: 1,
      errorRetryInterval: 2000,
      refreshInterval: 300000, // Auto refresh mỗi 5 phút
    }
  );

  return {
    orders: data || [],
    isLoading,
    error,
    refetch: mutate
  };
}

// 🚀 Hook tổng hợp để lấy tất cả data cần thiết
export function useFieldPageData(footballFieldId: string | undefined) {
  const fieldsQuery = useFields(footballFieldId);
  const timeSlotsQuery = useTimeSlots(footballFieldId);
  const ordersQuery = useOrders();

  // Tính toán loading state tổng thể
  const isLoading = fieldsQuery.isLoading || timeSlotsQuery.isLoading || ordersQuery.isLoading;

  // Tính toán error state
  const hasError = fieldsQuery.error || timeSlotsQuery.error || ordersQuery.error;

  // Function để refetch tất cả data
  const refetchAll = () => {
    fieldsQuery.refetch();
    timeSlotsQuery.refetch();
    ordersQuery.refetch();
  };

  return {
    // Data
    fields: fieldsQuery.fields,
    timeSlots: timeSlotsQuery.timeSlots,
    orders: ordersQuery.orders,

    // States
    isLoading,
    hasError,

    // Individual loading states
    fieldsLoading: fieldsQuery.isLoading,
    timeSlotsLoading: timeSlotsQuery.isLoading,
    ordersLoading: ordersQuery.isLoading,

    // Individual errors
    fieldsError: fieldsQuery.error,
    timeSlotsError: timeSlotsQuery.error,
    ordersError: ordersQuery.error,

    // Refetch functions
    refetchAll,
    refetchFields: fieldsQuery.refetch,
    refetchTimeSlots: timeSlotsQuery.refetch,
    refetchOrders: ordersQuery.refetch,
  };
}
