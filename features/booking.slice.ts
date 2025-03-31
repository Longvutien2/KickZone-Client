import { createBooking, deleteBooking, getBookingById, getBookings, getBookingsByFootballFieldAndDate, updateBooking } from '@/api/booking';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// Lấy danh sách booking theo id sân bóng
export const getListBookingsSlice = createAsyncThunk(
    'booking/getListBookingsSlice',
    async () => {
        const { data } = await getBookings();
        return data;
    }
);

export const getBookingsByFootballFieldAndDateSlice = createAsyncThunk(
    'booking/getBookingsByFootballFieldAndDateSlice',
    async (data2: { id: string, date: string }) => {
        const { data } = await getBookingsByFootballFieldAndDate(data2.id, data2.date);
        return data;
    }
);

export const getListBookingByIdSlice = createAsyncThunk(
    'booking/getListBookingByIdSlice',
    async (id: string) => {
        const { data } = await getBookingById(id);
        return data;
    }
);

// Thêm mới một booking
export const addBookingSlice = createAsyncThunk(
    'booking/addBookingSlice',
    async (booking: any) => {
        const { data } = await createBooking(booking);
        return data;
    }
);

// Cập nhật booking
export const updateBookingSlice = createAsyncThunk(
    'booking/updateBookingSlice',
    async (booking: any) => {
        const { data } = await updateBooking(booking._id, booking);
        return data;
    }
);

// Xoá booking
export const removeBookingSlice = createAsyncThunk(
    'booking/removeBookingSlice',
    async (id: string) => {
        const { data } = await deleteBooking(id);
        return data;
    }
);


const bookingSlice = createSlice({
    name: 'booking',
    initialState: {
        value: [],
        detail: {},
        breadcrumb: ""
    },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getListBookingsSlice.fulfilled, (state: any, action) => {
            state.value = action.payload;
        });
        builder.addCase(getListBookingByIdSlice.fulfilled, (state: any, action) => {
            state.detail = action.payload;
        });

        builder.addCase(getBookingsByFootballFieldAndDateSlice.fulfilled, (state: any, action) => {
            state.value = action.payload;
        });

        builder.addCase(addBookingSlice.fulfilled, (state: any, action) => {
            state.value = [...state.value, action.payload];
        });

        builder.addCase(updateBookingSlice.fulfilled, (state: any, action) => {
            state.value = state.value.map((item: any) =>
                item._id === action.payload._id ? action.payload : item
            );
        });

        builder.addCase(removeBookingSlice.fulfilled, (state, action) => {
            state.value = state.value.filter((item: any) => item._id !== action.payload._id);
        });
    },
});

export default bookingSlice.reducer;
