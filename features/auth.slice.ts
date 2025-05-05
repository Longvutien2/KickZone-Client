import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
// import { signOut } from "next-auth/react";
import { IUser } from "@/models/auth";
import { changepassword, changeprofile, signin } from "@/api/auth";
// import { signOut } from "next-auth/react";

interface IUserState {
  value: { token: string; user: IUser };
  error: any;
  isLoggedIn: boolean;
}

export const initialState: IUserState = {
  value: { token: "", user: { email: "", password: "" } },
  error: {},
  isLoggedIn: false,
};

// Action
export const login = createAsyncThunk("user/login", async (user: IUser) => {
  const { data } = await signin(user);
  return data;
});

// export const loginwithnextauth = createAsyncThunk(
//   "auth/loginwithnextauth",
//   async (user: any) => {
//     try {
//       const { data } = await signinwithnextauth(user);
//       toast.success("Đăng nhập thành công");
//       return data;
//     } catch (error: any) {
//       toast.error(error.response.message.data);
//     }
//   }
// );

export const changepass = createAsyncThunk(
  "auth/changepass",
  async (user: any) => {
    const { data } = await changepassword(user);
    return data;
  }
);

export const changeuserprofile = createAsyncThunk(
  "auth/changeuserprofile",
  async (user: any) => {
    const { data } = await changeprofile(user);
    return data;
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signout: (state) => {
      localStorage.removeItem("persist:root");
      // signOut({redirect: false});
      state.isLoggedIn = false;
      state.value = initialState.value
      toast.success("Đăng xuất thành công");
    },
  },
  extraReducers: (builder) => {
    builder.addCase(login.fulfilled, (state, action) => {
      state.value = action.payload;
      state.isLoggedIn = true;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.error = action.error;
      state.isLoggedIn = false;
    });
    // builder.addCase(changepass.fulfilled, (state, action) => {
    //   state.value = initialState.value;
    //   state.error = initialState.error
    //   state.isLoggedIn = false
    //   localStorage.removeItem("persist:root");
    // });
    builder.addCase(changepass.rejected, (state, action) => {
      state.error = action.error;
      state.isLoggedIn = true;
    });
    builder.addCase(changeuserprofile.fulfilled, (state, action) => {
      state.value = action.payload;
      state.isLoggedIn = true;
    });
    builder.addCase(changeuserprofile.rejected, (state, action) => {
      state.error = action.error;
      state.isLoggedIn = true;
    });
    // builder.addCase(loginwithnextauth.fulfilled, (state, action) => {
    //   state.value = action.payload;
    //   state.isLoggedIn = true;
    // });
  },
});

export const { signout } = authSlice.actions;

export default authSlice.reducer;
