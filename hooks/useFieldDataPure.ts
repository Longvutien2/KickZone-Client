// 🚀 Pure Redux approach - Simple, hiệu quả, không duplicate calls
import { useEffect, useState, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { getListTimeSlotsByFootballFieldId } from '@/features/timeSlot.slice';
import { getListOrdersSlice } from '@/features/order.slice';
import { getListFieldsSlice } from '@/features/field.slice';

// 🚀 Hook tổng hợp với Pure Redux + Smart Polling
export function useFieldPageData(footballFieldId: string | undefined) {
  const dispatch = useAppDispatch();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const isActiveRef = useRef(true);

  // 🚀 Redux data - Single source of truth
  const reduxFields = useAppSelector(state => state.field.value);
  const reduxTimeSlots = useAppSelector(state => state.timeSlot.value);
  const reduxOrders = useAppSelector(state => state.order.value);

  // 🚀 Smart polling chỉ orders (nhẹ nhất) - DEFINE FIRST
  const refreshOrders = useCallback(async () => {
    if (!footballFieldId || !isActiveRef.current) return;
    await dispatch(getListOrdersSlice());
  }, [footballFieldId, dispatch]);

  // 🚀 Simple - Call API mỗi khi vào page
  useEffect(() => {
    const loadData = async () => {
      if (!footballFieldId) {
        setIsInitialLoading(false);
        return;
      }

      try {
        // Kiểm tra xem dữ liệu đã có trong Redux chưa
        if (reduxFields.length === 0) {
          await dispatch(getListFieldsSlice(footballFieldId));
        }

        // Chỉ tải timeSlots khi cần
        if (reduxTimeSlots.length === 0) {
          await dispatch(getListTimeSlotsByFootballFieldId(footballFieldId));
        }

        // Chỉ tải orders khi cần
        if (reduxOrders.length === 0) {
          await dispatch(getListOrdersSlice());
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadData();
  }, [footballFieldId]); // ✅ Chỉ depend vào footballFieldId để tránh infinite re-renders

  // 🚀 Visibility API - pause polling khi user không active
  useEffect(() => {
    const handleVisibilityChange = () => {
      isActiveRef.current = document.visibilityState === 'visible';

      // Refresh ngay khi user quay lại tab
      if (isActiveRef.current) {
        refreshOrders();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshOrders]);


  // 🚀 Return data từ Redux
  const fields = reduxFields || [];
  const timeSlots = reduxTimeSlots || [];
  const orders = reduxOrders || [];

  const isLoading = isInitialLoading;

  // 🚀 Manual refetch function
  const refetchAll = async () => {
    if (!footballFieldId) return;

    setIsInitialLoading(true);
    try {
      console.log('🔄 Manual refresh...');
      await Promise.all([
        dispatch(getListFieldsSlice(footballFieldId)),
        dispatch(getListTimeSlotsByFootballFieldId(footballFieldId)),
        dispatch(getListOrdersSlice())
      ]);
    } catch (error) {
      console.error('Error refetching data:', error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  return {
    // Data
    fields,
    timeSlots,
    orders,

    // States
    isLoading,
    hasError: false, // Redux không có built-in error state

    // Functions
    refetchAll,
  };
}

// 🚀 Individual hooks nếu cần
export function useFields(footballFieldId: string | undefined) {
  const dispatch = useAppDispatch();
  const fields = useAppSelector(state => state.field.value);
  const [isLoading, setIsLoading] = useState(false);

  const loadFields = async () => {
    if (!footballFieldId) return;
    setIsLoading(true);
    try {
      await dispatch(getListFieldsSlice(footballFieldId));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (footballFieldId && (!fields || fields.length === 0)) {
      loadFields();
    }
  }, [footballFieldId]);

  return {
    fields: fields || [],
    isLoading,
    refetch: loadFields
  };
}

export function useTimeSlots(footballFieldId: string | undefined) {
  const dispatch = useAppDispatch();
  const timeSlots = useAppSelector(state => state.timeSlot.value);
  const [isLoading, setIsLoading] = useState(false);

  const loadTimeSlots = async () => {
    if (!footballFieldId) return;
    setIsLoading(true);
    try {
      await dispatch(getListTimeSlotsByFootballFieldId(footballFieldId));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (footballFieldId && (!timeSlots || timeSlots.length === 0)) {
      loadTimeSlots();
    }
  }, [footballFieldId]);

  return {
    timeSlots: timeSlots || [],
    isLoading,
    refetch: loadTimeSlots
  };
}

export function useOrders() {
  const dispatch = useAppDispatch();
  const orders = useAppSelector(state => state.order.value);
  const [isLoading, setIsLoading] = useState(false);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      await dispatch(getListOrdersSlice());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!orders || orders.length === 0) {
      loadOrders();
    }
  }, []);

  return {
    orders: orders || [],
    isLoading,
    refetch: loadOrders
  };
}

