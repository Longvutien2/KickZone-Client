import { combineReducers } from "@reduxjs/toolkit";
import authSlice from '../features/auth.slice';
import notificationSlice from '../features/notification.slice';
import footballFieldSlice from '../features/footballField.slice';
import fieldSlice from '../features/field.slice';
import timeSlotSlice from '../features/timeSlot.slice';
import teamSlice from '../features/team.slice';
import matchSlice from '../features/match.slice';
import breadcrumbSlice from '../features/breadcrumb.slice';
import userSlice from '../features/user.slice';
import orderSlice from '../features/order.slice';
import matchRequestSlice from '../features/matchRequest.slice';
import commentSlice from '../features/comment.slice';


const rootReducer = combineReducers({
    auth: authSlice,
    notification: notificationSlice,
    footballField: footballFieldSlice,
    field: fieldSlice,
    timeSlot: timeSlotSlice,
    team: teamSlice,
    match: matchSlice,
    matchRequest: matchRequestSlice,
    comment: commentSlice,
    breadcrumb: breadcrumbSlice,
    user: userSlice,
    order: orderSlice
});

export default rootReducer;