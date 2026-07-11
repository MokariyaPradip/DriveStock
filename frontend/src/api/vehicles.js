import apiClient from './client'

export async function fetchVehicles() {
  const { data } = await apiClient.get('/api/vehicles')
  return data
}