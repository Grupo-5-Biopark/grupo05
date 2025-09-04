'use client'

import { useState, useCallback } from 'react'

interface ApiConfig {
  baseURL?: string
  headers?: Record<string, string>
}

interface ApiResponse<T = any> {
  data: T
  status: number
  message?: string
}

export function useApi(config?: ApiConfig) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const baseURL = config?.baseURL || process.env.NEXT_PUBLIC_API_URL || '/api'
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...config?.headers,
  }

  const makeRequest = useCallback(async <T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    setIsLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch(`${baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      return {
        data,
        status: response.status,
        message: data.message,
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [baseURL, defaultHeaders])

  const get = useCallback(<T = any>(endpoint: string) => 
    makeRequest<T>(endpoint, { method: 'GET' }), [makeRequest])

  const post = useCallback(<T = any>(endpoint: string, data?: any) =>
    makeRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }), [makeRequest])

  const put = useCallback(<T = any>(endpoint: string, data?: any) =>
    makeRequest<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }), [makeRequest])

  const del = useCallback(<T = any>(endpoint: string) =>
    makeRequest<T>(endpoint, { method: 'DELETE' }), [makeRequest])

  return {
    isLoading,
    error,
    get,
    post,
    put,
    delete: del,
    makeRequest,
  }
}
