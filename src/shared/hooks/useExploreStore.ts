import React from 'react'
import { useAppDispatch, useAppSelector } from '../../store'
import { backpackListExample} from '../../data/fixtures'
import { onFinishedLoadingExplore, onBackpackAdded,onLoadBackpackList, onLoadingExplore, onUserState } from '../../store/explore'
import { BackpackListItem } from '../../types'
import { UserLoginState } from '../../types/ExploreTypes'
import { BackpackDB } from '../../data/BackpackDB/BackpackDB'



export const useExploreStore = () => {
    const { backpackList, isLoadingExplore, isUserAdmin} = useAppSelector(state => state.explore)
    const dispatch = useAppDispatch()
    const backpackDB = new BackpackDB();

    const startLoadingBackpackList = async () => {
        // console.log("Hola iniciando carga de mochila");
        dispatch( onLoadingExplore() );
        const { data } = await backpackDB.getBackpacks();
        
        //await new Promise((resolve, reject) => { setTimeout(() => resolve(true), 700) })
        dispatch(onLoadBackpackList(data));
        // dispatch( onFinishedLoadingExplore() );
    };

    const startAddingBackpackItem = async (item: Partial<BackpackListItem>) => {
        // console.log("Hola iniciando carga de mochila");
        let data: BackpackListItem = {
            id: '' + backpackList.length +  1,
            title: item.title || 'Nueva Mochila',
            image: item.image || ''
        }
        dispatch( onLoadingExplore() );
        await new Promise((resolve, reject) => { setTimeout(() => resolve(true), 700) })
        dispatch(onBackpackAdded(data));
        // dispatch( onFinishedLoadingExplore() );
    };

    const startLoginUser = async (user: UserLoginState) => {
        dispatch( onLoadingExplore() );
        await new Promise((resolve, reject) => { setTimeout(() => resolve(true), 700) })
        dispatch(onUserState(user));
    }
    
    return {
        //props
        isLoadingExplore,
        backpackList,
        isUserAdmin,
        
        //actions
        startLoadingBackpackList,
        startAddingBackpackItem,
        startLoginUser
    }
}
