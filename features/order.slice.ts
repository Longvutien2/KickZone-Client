import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getListOrders, getOrderDetails, getOrdersByUserId } from '@/api/payment';


// Lấy thông tin chi tiết đơn hàng
export const getOrderDetailsSlice = createAsyncThunk(
  'order/getOrderDetailsSlice',
  async (orderId: string) => {
    const { data } = await getOrderDetails(orderId);
    return data;
  }
);

// Lấy danh sách đơn hàng (giả định API này tồn tại)
export const getListOrdersSlice = createAsyncThunk(
  'order/getListOrdersSlice',
  async () => {
    const { data }:any = await getListOrders();
    return data;
  }
);

// Lấy danh sách đơn hàng theo userId (tối ưu hơn)
export const getOrdersByUserIdSlice = createAsyncThunk(
  'order/getOrdersByUserIdSlice',
  async (userId: string) => {
    const { data }:any = await getOrdersByUserId(userId);
    // Trả về orders array từ response mới
    return data.orders || data;
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    value: [], // Danh sách đơn hàng
    detail: {}, // Chi tiết đơn hàng
    currentOrder: null, // Đơn hàng hiện tại đang xử lý
    loading: false,
    error: null
  },
  reducers: {
  },
  extraReducers: (builder) => {
    builder.addCase(getOrderDetailsSlice.fulfilled, (state, action) => {
      state.detail = action.payload.order;
    });

    builder.addCase(getListOrdersSlice.fulfilled, (state, action) => {
      state.value = action.payload;
    });

    builder.addCase(getOrdersByUserIdSlice.fulfilled, (state, action) => {
      state.value = action.payload;
    });
  },
});

// export const { clearCurrentOrder, setCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;