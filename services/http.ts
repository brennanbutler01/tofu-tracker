import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

export enum Methods {
    POST = 'POST',
    GET = 'GET',
    PUT = 'PUT',
    DELETE = 'DELETE',
}

const headers: Readonly<Record<string, string | boolean>> = {
    Accept: 'application/json',
    'Content-Type': 'application/json; charset=utf-8',
    'X-Requested-With': 'XMLHttpRequest',
}

class Http {
    private instance: AxiosInstance | null = null

    private get http(): AxiosInstance {
        return this.instance != null ? this.instance : this.initHttp()
    }

    initHttp() {
        const http = axios.create({
            baseURL: '/api',
            headers,
            withCredentials: true,
        })

        this.instance = http
        return http
    }

    request<T = unknown>(
        config: AxiosRequestConfig
    ): Promise<AxiosResponse<T>> {
        return this.http.request<T>(config)
    }

    get<T = unknown>(
        url: string,
        config?: AxiosRequestConfig
    ): Promise<AxiosResponse<T>> {
        return this.http.get<T>(url, config)
    }

    post<T = unknown>(
        url: string,
        data?: T,
        config?: AxiosRequestConfig
    ): Promise<AxiosResponse<T>> {
        return this.http.post<T>(url, data, config)
    }

    put<T = unknown>(
        url: string,
        data?: T,
        config?: AxiosRequestConfig
    ): Promise<AxiosResponse<T>> {
        return this.http.put<T>(url, data, config)
    }

    delete<T = unknown>(
        url: string,
        config?: AxiosRequestConfig
    ): Promise<AxiosResponse<T>> {
        return this.http.delete<T>(url, config)
    }
}

export const http = new Http()
