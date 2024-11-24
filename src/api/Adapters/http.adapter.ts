export interface HttpResponse<T> {
    statusCode: number;
    statusMessage: string;
    data: T;
}

export abstract class HttpAdapter {
    abstract get<T>(url: string, options?: Record<string, unknown>): Promise<HttpResponse<T>>;
    abstract Post<Response>(url: string, data: any): Promise<Response>;
    abstract Put<Response>(url: string, data: any): Promise<Response>
    abstract Delete<Response>(url: string, data: any): Promise<Response>
}