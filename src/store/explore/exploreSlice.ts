import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {  BackpackListItem } from "../../types";
import { ExploreState, UserLoginState } from "../../types/ExploreTypes";
import { backpackListContentExample } from "../../data/fixtures";


const initialState: ExploreState = {
    backpackList: [],
    backpackContents: backpackListContentExample,
    isLoadingExplore: true,
    isUserAdmin: false, 
    username: "",
    password: "",
};

export const exploreSlice = createSlice({
    name: "explore",
    initialState: initialState,
    reducers: {
       onLoadBackpackList: (state, action: PayloadAction<BackpackListItem[]>) => {
          state.backpackList = [ ...action.payload ]
          state.isLoadingExplore = false;
       },
       onLoadingExplore: (state) => {
        state.isLoadingExplore = true;
       },
       onFinishedLoadingExplore: (state) => {
        state.isLoadingExplore = false;
       },
       onUserState: (state,action: PayloadAction<UserLoginState> ) => {
        state.username = action.payload.user;
        state.password = action.payload.password;
        state.isUserAdmin = action.payload.isAdmin ?? true;
        state.isLoadingExplore = false;
       },

       onBackpackAdded: (state,action: PayloadAction<BackpackListItem> ) => {
        state.backpackList = [...state.backpackList, action.payload];
        state.backpackContents = [
            ...state.backpackContents,
            {
             currentBackpack: action.payload,
             currentBackpackBookList: [],
             currentBackpackPublicationList:[],
             currentBackpackNotebookList: []
            }
        ];
        state.isLoadingExplore = false;
       },
       
       
    }
});

export const { 
     onLoadBackpackList,
     onFinishedLoadingExplore, 
     onLoadingExplore,
     onUserState,
     onBackpackAdded

    } = exploreSlice.actions;