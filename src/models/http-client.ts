import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

class HttpClient {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',  // User-Agent di default
        'Accept': 'application/json',
        'Connection': 'keep-alive',
      }
    });
  }

  public setCookies(cookies: string): void {
    this.axiosInstance.defaults.headers['Cookie'] = cookies;
  }

  public async get<T>(url: string, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
    try {
      const response = await this.axiosInstance.get(url, config);
      return response;
    } catch (error) {
      console.error('Error in GET request:', error);
      throw error;
    }
  }

  public async post<T>(url: string, data: any, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
    try {
      const response = await this.axiosInstance.post(url, data, config);
      return response;
    } catch (error) {
      console.error('Error in POST request:', error);
      throw error;
    }
  }

}

export default HttpClient;
