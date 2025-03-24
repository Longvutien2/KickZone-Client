import { combineReducers } from "@reduxjs/toolkit";
import authSlice from '../features/auth.slice';
import notificationSlice from '../features/notification.slice';
import footballFieldSlice from '../features/footballField.slice';
import fieldSlice from '../features/field.slice';
import timeSlotSlice from '../features/timeSlot.slice';


const rootReducer = combineReducers({
    auth: authSlice,
    notification: notificationSlice,
    footballField: footballFieldSlice,
    field: fieldSlice,
    timeSlot: timeSlotSlice

});

export default rootReducer;