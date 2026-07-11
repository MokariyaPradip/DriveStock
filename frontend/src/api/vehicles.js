import apiClient from './client'

export async function fetchVehicles() {
  const { data } = await apiClient.get('/api/vehicles')
  return data
}

export async function searchVehicles(params) {
  const { data } = await apiClient.get('/api/vehicles/search', { params })
  return data
}

export async function createVehicle(payload) {
  const { data } = await apiClient.post('/api/vehicles', payload)
  return data
}

export async function updateVehicle(id, payload) {
  const { data } = await apiClient.put(`/api/vehicles/${id}`, payload)
  return data
}

export async function deleteVehicle(id) {
  const { data } = await apiClient.delete(`/api/vehicles/${id}`)
  return data
}

export async function purchaseVehicle(id) {
  const { data } = await apiClient.post(`/api/vehicles/${id}/purchase`)
  return data
}

export async function restockVehicle(id) {
  const { data } = await apiClient.post(`/api/vehicles/${id}/restock`)
  return data
}