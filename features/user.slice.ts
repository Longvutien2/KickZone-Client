
import { createUser, deleteUser, getUserById, getUsers, updateUser } from '@/api/user';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// Lấy danh sách người dùng
export const getListUsersSlice = createAsyncThunk(
    'user/getListUsersSlice',
    async () => {
        const { data } = await getUsers();
        return data;
    }
);

// Lấy thông tin người dùng theo ID
export const getUserByIdSlice = createAsyncThunk(
    'user/getUserByIdSlice',
    async (id: string) => {
        const { data } = await getUserById(id);
        return data;
    }
);

// Thêm mới một người dùng
export const addUserSlice = createAsyncThunk(
    'user/addUserSlice',
    async (user: any) => {
        const { data } = await createUser(user);
        return data;
    }
);

// Cập nhật thông tin người dùng
export const updateUserSlice = createAsyncThunk(
    'user/updateUserSlice',
    async (user: any) => {
        const { data } = await updateUser(user._id, user);
        return data;
    }
);

// Xoá người dùng
export const removeUserSlice = createAsyncThunk(
    'user/removeUserSlice',
    async (id: string) => {
        const { data } = await deleteUser(id);
        return data;
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState: {
        value: [],
        detail: {},
        breadcrumb: ""
    },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getListUsersSlice.fulfilled, (state: any, action) => {
            state.value = action.payload;
        });
        builder.addCase(getUserByIdSlice.fulfilled, (state: any, action) => {
            state.detail = action.payload;
        });
        builder.addCase(addUserSlice.fulfilled, (state: any, action) => {
            state.value = [...state.value, action.payload];
        });
        builder.addCase(updateUserSlice.fulfilled, (state: any, action) => {
            state.value = state.value.map((item: any) =>
                item._id === action.payload._id ? action.payload : item
            );
        });
        builder.addCase(removeUserSlice.fulfilled, (state, action) => {
            state.value = state.value.filter((item: any) => item._id !== action.payload._id);
        });
    },
});

export default userSlice.reducer;
