import { createTimeSlot, deleteTimeSlot, deleteTimeSlotByFieldId, getTimeSlot, getTimeSlotByIdFootballField, updateTimeSlot } from "@/api/field"
import { Field, TimeSlot } from "@/models/field"
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"


export const getListTimeSlots = createAsyncThunk(
    "timeSlot/getListTimeSlots",
    async () => {
        const { data } = await getTimeSlot()
        return data
    }
)

export const getListTimeSlotsByFootballFieldId = createAsyncThunk(
    "timeSlot/getListTimeSlotsByFootballFieldId",
    async (id: string) => {
        const { data } = await getTimeSlotByIdFootballField(id)
        return data
    }
)

export const addTimeSlotSlice = createAsyncThunk(
    "timeSlot/addTimeSlotSlice",
    async (timeSlot: TimeSlot) => {
        const { data } = await createTimeSlot(timeSlot)
        return data
    }
)

export const updateTimeSlotSlice = createAsyncThunk(
    "timeSlot/updateTimeSlotSlice",
    async (timeSlot: any) => {
        const { data } = await updateTimeSlot(timeSlot._id, timeSlot)
        return data
    }
)


export const removeTimeSlot = createAsyncThunk(
    "timeSlot/deleteTimeSlot",
    async (id: string) => {
        const { data } = await deleteTimeSlot(id)
        return data
    }
)

export const removeTimeSlotByFieldId = createAsyncThunk(
    "timeSlot/removeTimeSlotByFieldId",
    async (id: string) => {
        const { data } = await deleteTimeSlotByFieldId(id)
        return data
    }
)



const timeSlotSlice = createSlice({
    name: "timeSlot",
    initialState: {
        value: [],
        detail: {},
        breadcrumb: ""
    },
    reducers: {}
    ,
    extraReducers: (builder) => {
        builder.addCase(getListTimeSlots.fulfilled, (state: any, action) => {
            state.value = action.payload
        })
        builder.addCase(getListTimeSlotsByFootballFieldId.fulfilled, (state: any, action) => {
            state.value = action.payload
        })
        builder.addCase(addTimeSlotSlice.fulfilled, (state: any, action) => {
            state.value = [...state.value, action.payload]
        })
        builder.addCase(updateTimeSlotSlice.fulfilled, (state: any, action) => {
            state.value = state.value.map((item: TimeSlot) => item._id === action.payload._id ? action.payload : item)
        })
        builder.addCase(removeTimeSlot.fulfilled, (state: any, action: any) => {
            state.value = state.value.filter((item: any) => item._id !== action.payload._id)
        })
        builder.addCase(removeTimeSlotByFieldId.fulfilled, (state: any, action: any) => {
            state.value = state.value.filter((item: any) => item._id !== action.payload._id)
        })


    }
}
)

export default timeSlotSlice.reducer