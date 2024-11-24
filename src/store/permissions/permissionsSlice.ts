import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PermissionStatus } from "../../types";

interface PermissionStatusProps {
    permissionStorageStatus: PermissionStatus
}

const initialState: PermissionStatusProps = {
    permissionStorageStatus: 'undetermined'
};

export const permissionsSlice = createSlice({
    name: "backpack",
    initialState: initialState,
    reducers: {
       onChangePermissionStorageStatus: (state,action: PayloadAction<PermissionStatus> ) => {
        state.permissionStorageStatus = action.payload;     
       }
       
    }
});

export const { onChangePermissionStorageStatus } = permissionsSlice.actions;