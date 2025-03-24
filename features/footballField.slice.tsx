import { createFootballField, getFootballField, getFootballFieldByIdUser } from "@/api/football_fields"
import { FootballField } from "@/models/football_field"
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"


export const getListFootballFieldSlice = createAsyncThunk(
    "footballField/getListFootballField",
    async () => {
        const { data } = await getFootballField()
        return data
    }
)

export const getFootballFieldByIdSlice = createAsyncThunk(
    "footballField/getFootballFieldByIdSlice",
    async (id:string) => {
        const { data } = await getFootballFieldByIdUser(id)
        return data
    }
)

export const getFootballFieldByIdUserSlice = createAsyncThunk(
    "footballField/getFootballFieldByIdUserSlice",
    async (id:string) => {
        const { data } = await getFootballFieldByIdUser(id)
        return data
    }
)

export const addFootBallFieldSlice = createAsyncThunk(
    "footballField/addFootballField",
    async (field: FootballField) => {
        const { data } = await createFootballField(field)
        return data
    }
)


const footballFieldSlice = createSlice({
    name: "footballField",
    initialState: {
        value: [],
        detail: {},
        breadcrumb: ""
    },
    reducers: {}
    ,
    extraReducers: (builder) => {
        builder.addCase(getListFootballFieldSlice.fulfilled, (state: any, action) => {
            state.value = action.payload
        })
        builder.addCase(getFootballFieldByIdUserSlice.fulfilled, (state: any, action) => {
            state.value = action.payload
        })
        builder.addCase(getFootballFieldByIdSlice.fulfilled, (state: any, action) => {
            state.value = action.payload
        })
        builder.addCase(addFootBallFieldSlice.fulfilled, (state: any, action) => {
            state.value = [...state.value, action.payload]
        })
    }
}
)

export default footballFieldSlice.reducer