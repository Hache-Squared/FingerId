import axios from "axios";
import { HttpAdapter, HttpResponse } from "../../api/Adapters/http.adapter";
import { backpackDBFetcher } from "../../api/fetcher/backpackDBFetcher";
import { BackpackListItem, CurrentSheetShowing, InitNotebookState, NotebookListItem, SheetContent, SheetItem } from "../../types";
import { BackpackResponse, BackpackWithNotebooksResponse, NotebookResponse, SheetContentResponse, SheetResponse, SheetWithSheetContentsResponse } from "../Interfaces/ResponsesApi";
import { BackpackMapper } from "../mappers/backpack.mapper";
import { NotebookMapper } from "../mappers/notebook.mapper";
import { SheetMapper } from "../mappers/sheet.mapper";

export class BackpackDB {
    private fetcher: HttpAdapter;
    constructor(){
        this.fetcher = backpackDBFetcher;
    }
     async getBackpacks(): Promise<HttpResponse<BackpackListItem[]>>{
        try{
            const {data, statusCode, statusMessage} = await this.fetcher.get<BackpackResponse[]>("/backpacks");
            console.log({data, statusCode, statusMessage});
            const backpacks = data?.map(res => BackpackMapper.backpackResponseJsonToModel(res));
            return {
                data: backpacks,
                statusCode,
                statusMessage
            };
        }catch(error){
            console.log("err: ", JSON.stringify(error));
            return {
                data: [],
                statusCode: 400,
                statusMessage: "Error en fetch getBackpacks"
            };
        }
    }
    async getBackpackById(backpackId: string): Promise<HttpResponse<BackpackListItem | null>>{
        try{
            const {data, statusCode, statusMessage} = await this.fetcher.get<BackpackResponse>(`/backpacks/${backpackId}`);
            console.log({data, statusCode, statusMessage});
            const backpack = BackpackMapper.backpackResponseJsonToModel(data);
            return {
                data: backpack,
                statusCode,
                statusMessage
            };
        }catch(error){
            console.log("err: ", JSON.stringify(error));
            return {
                data: null,
                statusCode: 400,
                statusMessage: "Error en fetch getBackpacks"
            };
        }
    }
    async getNotebooksForBackpack(backpackId: string): Promise<HttpResponse<NotebookListItem[]>>{
        try{
            const {data, statusCode, statusMessage} = await this.fetcher.get<BackpackWithNotebooksResponse>(`/backpacks/${backpackId}/getWithNotebooks`);
            console.log({data, statusCode, statusMessage});
            const notebooks = data?.notebooks?.map(n => NotebookMapper.notebookResponseJsonToModel(n));
            return {
                data: notebooks ?? [],
                statusCode,
                statusMessage
            };
        }catch(error){
            console.log("err: ", JSON.stringify(error));
            return {
                data: [],
                statusCode: 400,
                statusMessage: "Error en fetch getNotebooksForBackpack"
            };
        }
    }

    async getInfoForNotebook(backpackId: string, notebookId: string): Promise<HttpResponse<InitNotebookState | null>>{
        try{
            const {data, statusCode, statusMessage} = await this.fetcher.get<NotebookResponse>(`/backpacks/${backpackId}/notebooks/${notebookId}`);
            console.log({data, statusCode, statusMessage});
            const stateForNotebook = NotebookMapper.notebookWithDataResponseJsonToNotebookState(data);
            return {
                data: stateForNotebook,
                statusCode,
                statusMessage
            };
        }catch(error){
            console.log("err: ", JSON.stringify(error));
            return {
                data: null,
                statusCode: 400,
                statusMessage: "Error en fetch getSheetsForNotebook"
            };
        }
    }

    async getContentForSheet(backpackId: string, notebookId: string, sheetId: string): Promise<HttpResponse<CurrentSheetShowing | null>>{
        try{
            const {data, statusCode, statusMessage} = await this.fetcher.get<SheetWithSheetContentsResponse>(`/backpacks/${backpackId}/notebooks/${notebookId}/sheets/${sheetId}/contents`);
            console.log({data, statusCode, statusMessage});
            const sheetWithContents = SheetMapper.sheetWithDataResponseToCurrentSheetShowing(data);
            return {
                data: sheetWithContents ?? null,
                statusCode,
                statusMessage
            };
        }catch(error){
            console.log("err: ", JSON.stringify(error));
            return {
                data: null,
                statusCode: 400,
                statusMessage: "Error en fetch getContentForSheet"
            };
        }
    }


}