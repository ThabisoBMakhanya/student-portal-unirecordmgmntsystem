import { apiClient, buildQueryString } from './api';
import { ApiResponse } from '@/types';
import { CampusBuilding, CampusMapLayer, NavigationRoute } from '@/types';

export const campusMapService = {
  // Get all campus buildings
  getBuildings: async (category?: string): Promise<CampusBuilding[]> => {
    const queryString = buildQueryString({ category });
    const response = await apiClient.get<ApiResponse<{ buildings: CampusBuilding[] }>>(
      `/student/campus-map/buildings${queryString}`
    );
    return response.data.data.buildings;
  },

  // Get building by ID
  getBuildingById: async (buildingId: string): Promise<CampusBuilding> => {
    const response = await apiClient.get<ApiResponse<{ building: CampusBuilding }>>(
      `/student/campus-map/buildings/${buildingId}`
    );
    return response.data.data.building;
  },

  // Search buildings
  searchBuildings: async (query: string): Promise<CampusBuilding[]> => {
    const queryString = buildQueryString({ q: query });
    const response = await apiClient.get<ApiResponse<{ buildings: CampusBuilding[] }>>(
      `/student/campus-map/buildings/search${queryString}`
    );
    return response.data.data.buildings;
  },

  // Get map layers
  getLayers: async (): Promise<CampusMapLayer[]> => {
    const response = await apiClient.get<ApiResponse<{ layers: CampusMapLayer[] }>>(
      '/student/campus-map/layers'
    );
    return response.data.data.layers;
  },

  // Get important places for new students
  getImportantPlaces: async (): Promise<CampusBuilding[]> => {
    const response = await apiClient.get<ApiResponse<{ places: CampusBuilding[] }>>(
      '/student/campus-map/important-places'
    );
    return response.data.data.places;
  },

  // Get navigation route between two points
  getRoute: async (
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number,
    mode: 'walking' | 'driving' | 'transit' = 'walking'
  ): Promise<NavigationRoute> => {
    const queryString = buildQueryString({
      fromLat,
      fromLng,
      toLat,
      toLng,
      mode,
    });
    const response = await apiClient.get<ApiResponse<{ route: NavigationRoute }>>(
      `/student/campus-map/route${queryString}`
    );
    return response.data.data.route;
  },

  // Get route from current location to building
  getRouteToBuilding: async (
    buildingId: string,
    userLat: number,
    userLng: number,
    mode: 'walking' | 'driving' | 'transit' = 'walking'
  ): Promise<NavigationRoute> => {
    const queryString = buildQueryString({
      buildingId,
      userLat,
      userLng,
      mode,
    });
    const response = await apiClient.get<ApiResponse<{ route: NavigationRoute }>>(
      `/student/campus-map/route-to-building${queryString}`
    );
    return response.data.data.route;
  },

  // Get nearby buildings
  getNearbyBuildings: async (
    latitude: number,
    longitude: number,
    radius: number = 500 // meters
  ): Promise<CampusBuilding[]> => {
    const queryString = buildQueryString({ latitude, longitude, radius });
    const response = await apiClient.get<ApiResponse<{ buildings: CampusBuilding[] }>>(
      `/student/campus-map/nearby${queryString}`
    );
    return response.data.data.buildings;
  },

  // Get campus bounds for map initialization
  getCampusBounds: async (): Promise<{
    north: number;
    south: number;
    east: number;
    west: number;
    center: { latitude: number; longitude: number };
    zoom: number;
  }> => {
    const response = await apiClient.get<ApiResponse<any>>(
      '/student/campus-map/bounds'
    );
    return response.data.data;
  },
};

export default campusMapService;