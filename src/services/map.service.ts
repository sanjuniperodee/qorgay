import axios from 'axios'
import type { ObjectCoordinatesType } from '@/types/Map'

class MapService {
  baseUrl: string
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  async getMarkers(): Promise<ObjectCoordinatesType[]> {
    const token = localStorage.getItem('token')!
    const { data } = await axios.get(`${this.baseUrl}/api/v1/building/coordinates/`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      }
    })
    return data
  }

  async getMarkersId(id: number): Promise<ObjectCoordinatesType[]> {
    const token = localStorage.getItem('token')!
    const { data } = await axios.get(`${this.baseUrl}/api/v1/building/coordinates/${id}/`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      }
    })
    return data
  }

  async getMarkersByBuildingId(buildingId: number): Promise<ObjectCoordinatesType[]> {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('No token found')

    const { data } = await axios.get(`${this.baseUrl}/api/v1/building/coordinates/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    // Убедимся, что building преобразован в число при сравнении
    return data.filter((marker: ObjectCoordinatesType) => Number(marker.building.id) === buildingId)
  }
}

export const mapService = new MapService(import.meta.env.VITE_BACKEND_URL)
