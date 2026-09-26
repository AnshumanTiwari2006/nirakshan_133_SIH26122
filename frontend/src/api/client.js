import { create } from 'zustand'
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

export const useStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))

export default api