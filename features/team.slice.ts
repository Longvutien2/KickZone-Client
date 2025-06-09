import { createTeam, deleteTeam, getTeamById, getTeamByUserId, getTeams, updateTeam } from "@/api/team";
import { Team } from "@/models/team";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// Action để lấy danh sách các đội
export const getListTeamsSlice = createAsyncThunk(
    "team/getListTeams",
    async () => {
        const { data } = await getTeams();
        return data;
    }
);

// Action để lấy thông tin đội theo ID
export const getTeamByIdSlice = createAsyncThunk(
    "team/getTeamByIdSlice",
    async (id: string) => {
        const { data } = await getTeamById(id);
        return data;
    }
);

// Action để lấy thông tin đội theo ID
export const getTeamByUserIdSlice = createAsyncThunk(
    "team/getTeamByUserIdSlice",
    async (userId: string) => {
        const { data } = await getTeamByUserId(userId);
        return data;
    }
);

// Action để thêm đội mới
export const addTeamSlice = createAsyncThunk(
    "team/addTeamSlice",
    async (team: Team) => {
        const { data } = await createTeam(team);
        return data;
    }
);

// Action để cập nhật thông tin đội
export const updateTeamSlice = createAsyncThunk(
    "team/updateTeamSlice",
    async (team: any) => {
        const { data } = await updateTeam(team._id, team);
        return data;
    }
);

// Action để xóa đội
export const removeTeamSlice = createAsyncThunk(
    "team/removeTeamSlice",
    async (id: string) => {
        const { data } = await deleteTeam(id);
        return data;
    }
);

const teamSlice = createSlice({
    name: "team",
    initialState: {
        value: [],
        detail: {},
        breadcrumb: ""
    },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getListTeamsSlice.fulfilled, (state: any, action) => {
            state.value = action.payload;
        });
        builder.addCase(getTeamByIdSlice.fulfilled, (state, action) => {
            state.detail = action.payload;
        });
        builder.addCase(getTeamByUserIdSlice.fulfilled, (state, action) => {
            state.detail = action.payload;
        });
        builder.addCase(addTeamSlice.fulfilled, (state: any, action) => {
            state.value = [...state.value, action.payload];
        });
        builder.addCase(updateTeamSlice.fulfilled, (state: any, action) => {
            state.value = state.value.map((item: Team) =>
                item._id === action.payload._id ? action.payload : item
            );
        });
        builder.addCase(removeTeamSlice.fulfilled, (state: any, action) => {
            state.value = state.value.filter((item: Team) => item._id !== action.payload._id);
        });
    }
});

export default teamSlice.reducer;