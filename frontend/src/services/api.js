import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const api = axios.create({
  baseURL: API_BASE_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

const getErrorMessage = (error) => {
  if (error?.response?.data?.message) {
    return error.response.data.message
  }

  if (error?.response?.data?.error) {
    return error.response.data.error
  }

  return error?.message || 'Something went wrong'
}

export const signup = async (payload) => {
  try {
    const response = await api.post('/api/auth/signup', payload)
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const login = async (payload) => {
  try {
    const response = await api.post('/api/auth/login', payload)
    const data = response.data

    if (typeof data === 'string') {
      return data
    }

    if (data?.token) {
      return data.token
    }

    throw new Error('Token not found in login response')
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const getExpenses = async () => {
  try {
    const response = await api.get('/api/expenses')
    const data = response.data

    if (Array.isArray(data)) {
      return data
    }

    return data?.content || []
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const addExpense = async (payload) => {
  try {
    const response = await api.post('/api/expenses', payload)
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const updateExpense = async (id, payload) => {
  try {
    const response = await api.put(`/api/expenses/${id}`, payload)
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const removeExpense = async (id) => {
  try {
    await api.delete(`/api/expenses/${id}`)
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const getProfile = async () => {
  try {
    const response = await api.get('/api/auth/me')
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const changePassword = async (payload) => {
  try {
    const response = await api.post('/api/auth/change-password', payload)
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}
