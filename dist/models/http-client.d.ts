import { AxiosRequestConfig, AxiosResponse } from 'axios';
declare class HttpClient {
    private axiosInstance;
    constructor(baseURL: string);
    setCookies(cookies: string): void;
    get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    post<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
}
export default HttpClient;
//# sourceMappingURL=http-client.d.ts.map