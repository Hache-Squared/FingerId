import axios, { AxiosInstance } from "axios";
import { HttpAdapter, HttpResponse } from "./http.adapter";

interface Options {
    baseUrl: string;
    params: Record<string, string>;
}



export class AxiosAdapter implements HttpAdapter{
    private axiosIntance: AxiosInstance;
 
    constructor(options: Options) {
        this.axiosIntance = axios.create({
            baseURL: options.baseUrl,
            params: options.params
        });
    }

    async get<T>(url: string, options?: Record<string, unknown>): Promise<HttpResponse<T>> {
        try {
            const { data, status, statusText } = await this.axiosIntance.get<T>(url, options);
            return {
                statusCode: status,
                statusMessage: statusText,
                data
            };
        } catch (error) {
            console.log("Error: ", JSON.stringify(error));
            
            throw new Error("Error fetching get: " + url);
        }
    }

    async Post<Response>(url: string, data: any): Promise<Response> {
        try {
            const { status, statusText } = await this.axiosIntance.post(url, data);
            return {
                status,
                statusText
            } as Response;
        } catch (error) {
            throw new Error("Error Posting post: " + url);
        }
    }

    async Put<Response>(url: string, data: any): Promise<Response> {
        try {
            const { status, statusText } = await this.axiosIntance.put(url, data);
            return {
                status,
                statusText
            } as Response;
        } catch (error) {
            throw new Error("Error Posting put: " + url);
        }
    }

    async Delete<Response>(url: string, data: any): Promise<Response> {
        try {
            const { status, statusText } = await this.axiosIntance.delete(url, data);
            return {
                status,
                statusText
            } as Response;
        } catch (error) {
            throw new Error("Error Posting delete: " + url);
        }
    }

}