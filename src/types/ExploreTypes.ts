import { BackpackContents, BackpackListItem } from "./BackpackTypes";

export interface ExploreState {
    backpackList: BackpackListItem[],
    backpackContents: BackpackContents[],
    isLoadingExplore: boolean,
    isUserAdmin: boolean,
    username: string,
    password: string,
}

export interface UserLoginState {
    user: string,
    password: string,
    isAdmin: boolean
}