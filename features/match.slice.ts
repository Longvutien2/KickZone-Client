import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Match } from '@/models/match';
import { createMatch, deleteMatch, deleteMatchByUserId, getMatchByFootballFieldId, getMatchById, getMatches, updateMatch } from '@/api/match';

// Action để lấy tất cả trận đấu
export const getListMatchesSlice = createAsyncThunk(
    "match/getListMatches",
    async () => {
        const { data } = await getMatches();
        return data;
    }
);

export const getListMatchByFootballFieldIdSlice = createAsyncThunk(
    "match/getListMatchByFootballFieldIdSlice",
    async (id: string) => {
        const { data } = await getMatchByFootballFieldId(id);
        return data;
    }
);

// Action để lấy thông tin trận đấu theo ID
export const getMatchByIdSlice = createAsyncThunk(
    "match/getMatchById",
    async (id: string) => {
        const { data } = await getMatchById(id);
        return data;
    }
);

// Action để tạo trận đấu mới
export const addMatchSlice = createAsyncThunk(
    "match/addMatch",
    async (match: Match) => {
        const { data } = await createMatch(match);
        return data;
    }
);

// Action để cập nhật trận đấu
export const updateMatchSlice = createAsyncThunk(
    "match/updateMatch",
    async (match: Match) => {
        const { data } = await updateMatch(match._id, match);
        return data;
    }
);

// Action để xóa trận đấu theo ID
export const removeMatchSlice = createAsyncThunk(
    "match/removeMatch",
    async (id: string) => {
        await deleteMatch(id);
        return id;
    }
);

// Action để xóa trận đấu theo userId
export const removeMatchByUserIdSlice = createAsyncThunk(
    "match/removeMatchByUserId",
    async (userId: string) => {
        await deleteMatchByUserId(userId);
        return userId;
    }
);

// Tạo slice cho match
const matchSlice = createSlice({
    name: "match",
    initialState: {
        value: [],    // Danh sách các trận đấu
        detail: {},   // Chi tiết trận đấu
        breadcrumb: "", // Breadcrumb (dẫn đường)
    },
    reducers: {},
    extraReducers: (builder) => {
        // 1. Xử lý khi lấy danh sách trận đấu thành công
        builder.addCase(getListMatchesSlice.fulfilled, (state: any, action) => {
            state.value = action.payload;
        });

        builder.addCase(getListMatchByFootballFieldIdSlice.fulfilled, (state: any, action) => {
            state.value = action.payload;
        });

        // 2. Xử lý khi lấy thông tin trận đấu theo ID thành công
        builder.addCase(getMatchByIdSlice.fulfilled, (state, action) => {
            state.detail = action.payload;
        });

        // 3. Xử lý khi thêm trận đấu thành công
        builder.addCase(addMatchSlice.fulfilled, (state: any, action) => {
            state.value = [...state.value, action.payload]
        });

        // 4. Xử lý khi cập nhật trận đấu thành công
        builder.addCase(updateMatchSlice.fulfilled, (state: any, action) => {
            state.value = state.value.map((item: Match) =>
                item._id === action.payload._id ? action.payload : item
            );
        });

        // 5. Xử lý khi xóa trận đấu thành công
        builder.addCase(removeMatchSlice.fulfilled, (state, action) => {
            state.value = state.value.filter((item: any) => item._id !== action.payload);
        });

        // 6. Xử lý khi xóa trận đấu theo userId thành công
        builder.addCase(removeMatchByUserIdSlice.fulfilled, (state, action) => {
            state.value = state.value.filter((item: any) => item.user !== action.payload);
        });
    },
});

export default matchSlice.reducer;
