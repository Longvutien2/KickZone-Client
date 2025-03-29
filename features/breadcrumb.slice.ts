import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    breadcrumb: [
        { name: 'Home', url: '/' },
    ],
};

const breadcrumbSlice = createSlice({
    name: 'breadcrumb',
    initialState,
    reducers: {
        setBreadcrumb: (state, action) => {
            state.breadcrumb = action.payload;
        },
        addBreadcrumb: (state, action) => {
            if (!state.breadcrumb.some(item => item.url === action.payload.url)) {
                state.breadcrumb.push(action.payload);
            }
        },
        resetBreadcrumb: (state) => {
            state.breadcrumb = [{ name: 'Home', url: '/' }];
        },
    },
});

export const { setBreadcrumb, addBreadcrumb, resetBreadcrumb } = breadcrumbSlice.actions;
export default breadcrumbSlice.reducer;
