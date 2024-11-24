import React from 'react'
import { onAddContentToSheet, onAddMenuSheetItemList, onAddSheetContentListItem, onFinishedLoadingNotebook, onLoadingNotebook, onLoadNotebook, onLoadSheet, onResetNotebookState, useAppDispatch, useAppSelector } from '../../store'
import { currentSheetShowingExample, menuSheetItemNotebookListExample } from '../../data/fixtures'
import { CurrentSheetShowing, SheetContent, SheetContentType, SheetItem } from '../../types'
import { BackpackDB } from '../../data/BackpackDB/BackpackDB'



export const useNotebookStore = () => {
    const { currentSheetShowing, currentSheetContentList,menuSheetItemList, title, id, isLoadingNotebook } = useAppSelector(state => state.notebook)
    const { currentBackpack } = useAppSelector(state => state.backpack)
    const { id: notebookId } = useAppSelector(state => state.notebook)
    const dispatch = useAppDispatch()
    const backpackDB = new BackpackDB();

    const startLoadingNotebook = async(id: string) => {
        dispatch( onLoadingNotebook() );
        const {data} =  await backpackDB.getInfoForNotebook("" + currentBackpack?.id, id);
        //await new Promise((resolve, reject) => { setTimeout(() => resolve(true), 700) })
        //const notebook = menuSheetItemNotebookListExample.find(notebook => notebook.id === id)
        //if(notebook) {
        //    dispatch( onLoadNotebook(notebook) ) 
        //}
        if(data){
            dispatch( onLoadNotebook(data) ) 
        }
        dispatch( onFinishedLoadingNotebook() );
    }

    const startAddingMenuSheetItemList = async(sheet: Partial<SheetItem>) => {
        let newSheet: SheetItem = {
            id: '' + menuSheetItemList.length +  1,
            title: sheet.title || 'Nueva Sección',
        }
        dispatch( onLoadingNotebook() );
        await new Promise((resolve, reject) => { setTimeout(() => resolve(true), 700) })
        dispatch( onAddMenuSheetItemList(newSheet) ) 
        dispatch( onAddSheetContentListItem({
            id: '' + newSheet.id,
            title: newSheet.title || 'Nueva Sección',
            content: [],
            prev: null,
            next: null
        }) ) 

        dispatch( onFinishedLoadingNotebook() );
    }

    const startLoadingSheet = async(id: string) => {
        dispatch( onLoadingNotebook() );
        const {data} =  await backpackDB.getContentForSheet("" + currentBackpack?.id, "" + notebookId, id);
        console.log("Contenido: ", JSON.stringify(data));
        
        /*
        await new Promise((resolve, reject) => { setTimeout(() => resolve(true), 700) })
        const sheetIndex = currentSheetContentList.findIndex(sheet => sheet.id === id)

        const previous = sheetIndex > 0 ? currentSheetContentList[sheetIndex - 1] : null;
        const current = currentSheetContentList[sheetIndex];
        const next = sheetIndex < currentSheetContentList.length - 1 ? currentSheetShowingExample[sheetIndex + 1] : null;

        const sheet:CurrentSheetShowing  = {
            id: current.id,
            title: current.title,
            content: current.content,
            prev: previous,
            next: next
        }
            */

        if(data) dispatch( onLoadSheet(data) ) 
        dispatch( onFinishedLoadingNotebook() );
        
    }
    const startAddingContentToSheet = async(item: Partial<SheetContent>) => {
        dispatch( onLoadingNotebook() );
        await new Promise((resolve, reject) => { setTimeout(() => resolve(true), 700) })
        let content: SheetContent = {
            id: '' + (currentSheetShowing?.content.length ?? 0) + 1,
            numOrder: (currentSheetShowing?.content.length ?? 0) + 1,
            content: item.content ?? '',
            type: item.type ?? SheetContentType.Text,
            
            
        }
        dispatch(onAddContentToSheet(content) )
        
        dispatch( onFinishedLoadingNotebook() );
    }

    const startResetingNotebook = async() => { 
        dispatch( onLoadingNotebook() );
        dispatch( onResetNotebookState() )
        dispatch( onFinishedLoadingNotebook() );
    }

    const startSearchNotebooks = async(searchText: string) => {
        dispatch( onLoadingNotebook() );
        await new Promise((resolve, reject) => { setTimeout(() => resolve(true), 700) })
        // Convertir el texto de búsqueda en un array de palabras
        const searchWords = searchText.trim().toLowerCase().split(/\s+/);

        // Filtrar todos los elementos que contengan todas las palabras de búsqueda en el título
        const filteredItems = menuSheetItemNotebookListExample.filter((notebook) => {
            const titleWords = notebook.title.toLowerCase().split(/\s+/);
            return searchWords.some((word) => titleWords.some((titleWord) => titleWord.includes(word)));
        });

        
        dispatch( onFinishedLoadingNotebook() );
        return filteredItems;
    }
    
    return {
        //props
        isLoadingNotebook,
        id,
        title,
        currentSheetShowing,
        menuSheetItemList,
        
        //actions
        startLoadingNotebook,
        startLoadingSheet,
        startResetingNotebook,
        startSearchNotebooks,
        startAddingMenuSheetItemList,
        startAddingContentToSheet
    }
}
