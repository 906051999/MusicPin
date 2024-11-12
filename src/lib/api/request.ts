import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { APIError } from './base'
import type { APISource } from './config'

interface RequestConfig extends AxiosRequestConfig {
  source?: APISource
}

export class APIRequest {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // 响应拦截器
    this.client.interceptors.response.use(
      response => response.data,
      error => {
        throw new APIError(
          error.response?.data?.msg || error.message,
          error.response?.status || 500,
          error.config?.source || 'UNKNOWN'
        )
      }
    )
  }

  // GET请求
  async get<T>(url: string, config?: RequestConfig): Promise<T> {
    console.log('[APIRequest] GET request:', { url, config })
    try {
        const data = await this.client.get<unknown, T>(url, config)
      console.log('[APIRequest] Response:', data)
      return data
    } catch (error) {
      console.error('[APIRequest] Request failed:', error)
      throw error
    }
  }

  // POST请求
  async post<T, D = unknown>(url: string, data?: D, config?: RequestConfig): Promise<T> {
    return this.client.post(url, data, config)
  }

  // 统一搜索请求
  async searchRequest<T>(url: string, source: APISource): Promise<T> {
    return this.get<T>(url, { source })
  }

  // 统一详情请求
  async detailRequest<T>(url: string, source: APISource): Promise<T> {
    return this.get<T>(url, { source })
  }

  // 统一并行搜索请求
  async parallelSearch<T>(urls: string[], source: APISource): Promise<T[]> {
    return Promise.all(
      urls.map(url => this.searchRequest<T>(url, source))
    )
  }
}

// 导出单例
export const apiRequest = new APIRequest()