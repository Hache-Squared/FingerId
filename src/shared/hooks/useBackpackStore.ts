import { onLoadCurrentBackpack, onLoadBooks, onLoadNotebooks, onLoadPublications, useAppDispatch, useAppSelector, onResetBackpackState, onLoadingBackpack, onFinishedLoadingBackpack, onAddNotebook, onAddBook, onAddPublication } from '../../store';
import {  backpackListContentExample, backpackListExample } from '../../data/fixtures';
import { useEffect } from 'react';
import { BookListItem, NotebookListItem, PublicationListItem } from '../../types';
import { BackpackDB } from '../../data/BackpackDB/BackpackDB';

export const useBackpackStore = () => {
    const { currentBackpack, currentBackpackNotebookList,currentBackpackBookList, currentBackpackPublicationList, isLoadingBackpack } = useAppSelector(state => state.backpack);
    const { backpackList, backpackContents } = useAppSelector(state => state.explore);
    const dispatch = useAppDispatch();
    const backpackDB = new BackpackDB();
    // useEffect(() => {
    //     console.log('Re-render usebackpack');
        
    // },[currentBackpack]);

    const startLoadingCurrentBackpack = async (id: string) => {
        const { data } = await backpackDB.getBackpackById(id);
        const backpackItem = data
        if (backpackItem) {
            dispatch(onLoadCurrentBackpack({
                ...backpackItem
            }));
        }
        
    };

    const startLoadingNotebooks = async (backpackId: string) => {
        dispatch( onLoadingBackpack() );
        const { data } = await backpackDB.getNotebooksForBackpack(backpackId);
        /*
        await new Promise((resolve, reject) => { setTimeout(() => resolve(true), 700) })
        const backpack = backpackContents.find(backpack => backpack.currentBackpack?.id === backpackId);
        if(backpack) {
            dispatch(onLoadNotebooks(backpack.currentBackpackNotebookList));
        }
        */
        dispatch(onLoadNotebooks(data));
        // dispatch( onFinishedLoadingBackpack() );
    };

    const startLoadingBooks = async (backpackId: string) => {
        dispatch( onLoadingBackpack() );
        await new Promise((resolve, reject) => { setTimeout(() => resolve(true), 700) })
        const backpack = backpackContents.find(backpack => backpack.currentBackpack?.id === backpackId);
        if(backpack) {
            dispatch(onLoadBooks(backpack.currentBackpackBookList));
        }
        // dispatch( onFinishedLoadingBackpack() );
    };

    const startLoadingPublications = async (backpackId: string) => {
        dispatch( onLoadingBackpack() );
        await new Promise((resolve, reject) => { setTimeout(() => resolve(true), 700) })
        const backpack = backpackContents.find(backpack => backpack.currentBackpack?.id === backpackId);
        if(backpack) {
            dispatch(onLoadPublications(backpack.currentBackpackPublicationList));
        }
        // dispatch( onFinishedLoadingBackpack() );
    };
    
    const startResetingBackpack = async () => {
        dispatch( onLoadingBackpack() );
        dispatch( onResetBackpackState() );
        // dispatch( onFinishedLoadingBackpack() );
    };
    const startAddingNotebookItem = async (item: Partial<NotebookListItem>) => {
        // console.log("Hola iniciando carga de mochila");
        let data: NotebookListItem = {
            id: '' + currentBackpackNotebookList.length +  1,
            title: item.title || 'Nueva Mochila',
        }
        dispatch( onLoadingBackpack() );
        await new Promise((resolve, reject) => { setTimeout(() => resolve(true), 700) })
        dispatch(onAddNotebook(data));
    };

    const startAddingBookItem = async (item: Partial<BookListItem>) => {
        // console.log("Hola iniciando carga de mochila");
        let data: BookListItem = {
            id: '' + currentBackpackBookList.length +  1,
            title: item.title || 'Nueva Mochila',
            uriDocument: item.uriDocument || ''
        }
        dispatch( onLoadingBackpack() );
        await new Promise((resolve, reject) => { setTimeout(() => resolve(true), 700) })
        dispatch(onAddBook(data));
    };

    const startAddingPublicationItem = async (item: Partial<PublicationListItem>) => {
        // console.log("Hola iniciando carga de mochila");
        let data: PublicationListItem = {
            id: '' + currentBackpackPublicationList.length +  1,
            title: item.title || 'Nueva Mochila',
            image: item.image || '',
            link: item.link || ''
        }
        dispatch( onLoadingBackpack() );
        await new Promise((resolve, reject) => { setTimeout(() => resolve(true), 700) })
        dispatch(onAddPublication(data));
    };

    return {
        // props
        isLoadingBackpack,
        currentBackpack,
        currentBackpackBookList,
        currentBackpackPublicationList,
        currentBackpackNotebookList,
        

        // actions
        startLoadingCurrentBackpack,
        startLoadingNotebooks,
        startLoadingBooks,
        startLoadingPublications,
        startResetingBackpack,
        startAddingNotebookItem,
        startAddingBookItem,
        startAddingPublicationItem,
    };
};
