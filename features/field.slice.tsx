import { createField, deleteField, getFields, getFieldsByIdFootball, updateField } from "@/api/field"
import { Field } from "@/models/field"
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"


export const getListFields = createAsyncThunk(
    "field/getListFields",
    async () => {
        const { data } = await getFields()
        return data
    }
)

export const getListFieldsSlice = createAsyncThunk(
    "field/getListFieldsSlice",
    async (id:string) => {
        const { data } = await getFieldsByIdFootball(id)
        return data
    }
)

export const addFieldSlice = createAsyncThunk(
    "field/addFieldSlice",
    async (field: Field) => {
        const { data } = await createField(field)
        return data
    }
)

export const updateFieldSlice = createAsyncThunk(
    "field/updateField",
    async (field: Field) => {
        const { data } = await updateField(field._id, field)
        return data
    }
)

export const removeFieldSlice = createAsyncThunk(
    "field/removeFieldSice",
    async (id: string) => {
        const { data } = await deleteField(id)
        return data
    }
)



const fieldSlice = createSlice({
    name: "field",
    initialState: {
        value: [],
        detail: {},
        breadcrumb: ""
    },
    reducers: {}
    ,
    extraReducers: (builder) => {
        builder.addCase(getListFields.fulfilled, (state: any, action) => {
            state.value = action.payload
        })
        builder.addCase(getListFieldsSlice.fulfilled, (state: any, action) => {
            state.value = action.payload
        })
        builder.addCase(addFieldSlice.fulfilled, (state: any, action) => {
            state.value = [...state.value, action.payload]
        })
        builder.addCase(updateFieldSlice.fulfilled, (state: any, action) => {
            state.value = state.value.map((item: Field) => item._id === action.payload._id ? action.payload : item)
        })
        builder.addCase(removeFieldSlice.fulfilled, (state: any, action: any) => {
            state.value = state.value.filter((item: any) => item._id !== action.payload._id)
        })
    }
}
)

export default fieldSlice.reducer