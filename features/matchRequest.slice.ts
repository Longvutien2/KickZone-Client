import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { createMatchRequest, deleteMatchRequest, getMatchRequestsByMatchId, getMatchRequestsByUserId, updateMatchRequestStatus } from '@/api/matchRequest';

export const createMatchRequestSlice = createAsyncThunk(
    'matchRequest/create',
    async (requestData: any) => {
        const { data } = await createMatchRequest(requestData);
        return data;
    }
);
export const updateMatchRequestStatusSlice = createAsyncThunk(
    'matchRequest/updateStatus',
    async (requestData: any) => {
        const { data } = await updateMatchRequestStatus(requestData.requestId, requestData.status);
        return data;
    }
);

export const getMatchRequestsByMatchSlice = createAsyncThunk(
    'matchRequest/getByMatch',
    async (matchId: string) => {
        const { data } = await getMatchRequestsByMatchId(matchId);
        return data;
    }
);

export const getMatchRequestsByUserSlice = createAsyncThunk(
    'matchRequest/getByUser',
    async (userId: string) => {
        const { data } = await getMatchRequestsByUserId(userId);
        return data;
    }
);
export const deleteMatchRequestSlice = createAsyncThunk(
    'matchRequest/delete',
    async (requestId: string) => {
        const { data } = await deleteMatchRequest(requestId);
        return { ...data, _id: requestId }; // Đảm bảo trả về _id để filter
    }
);



const matchRequestSlice = createSlice({
    name: 'matchRequest',
    initialState: {
        value: [],
        detail: {}
    },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(createMatchRequestSlice.fulfilled, (state: any, action) => {
            state.value = [...state.value, action.payload];
        });
        builder.addCase(getMatchRequestsByMatchSlice.fulfilled, (state, action) => {
            state.value = action.payload;
        });
        builder.addCase(getMatchRequestsByUserSlice.fulfilled, (state, action) => {
            state.value = action.payload;
        });
        builder.addCase(updateMatchRequestStatusSlice.fulfilled, (state: any, action) => {
            state.value = state.value.map((item: any) => item._id === action.payload._id ? action.payload : item);
        });
        builder.addCase(deleteMatchRequestSlice.fulfilled, (state: any, action) => {
            state.value = state.value.filter((item: any) => item._id !== action.payload._id);
        });
    },
});

export default matchRequestSlice.reducer;