// API client for backend communication
class ApiClient {
  constructor() {
    // In production, this would be your backend API URL
    this.baseURL = process.env.VITE_API_URL || 'http://localhost:3001/api';
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Station operations
  async getStations() {
    return this.request('/stations');
  }

  async createStation(stationData) {
    return this.request('/stations', {
      method: 'POST',
      body: stationData,
    });
  }

  async updateStation(id, stationData) {
    return this.request(`/stations/${id}`, {
      method: 'PUT',
      body: stationData,
    });
  }

  async deleteStation(id) {
    return this.request(`/stations/${id}`, {
      method: 'DELETE',
    });
  }

  // Equipment operations
  async getEquipment() {
    return this.request('/equipment');
  }

  async createEquipment(equipmentData) {
    return this.request('/equipment', {
      method: 'POST',
      body: equipmentData,
    });
  }

  async updateEquipment(id, equipmentData) {
    return this.request(`/equipment/${id}`, {
      method: 'PUT',
      body: equipmentData,
    });
  }

  async deleteEquipment(id) {
    return this.request(`/equipment/${id}`, {
      method: 'DELETE',
    });
  }

  // Inspection operations
  async getInspections() {
    return this.request('/inspections');
  }

  async createInspection(inspectionData) {
    return this.request('/inspections', {
      method: 'POST',
      body: inspectionData,
    });
  }

  async updateInspection(id, inspectionData) {
    return this.request(`/inspections/${id}`, {
      method: 'PUT',
      body: inspectionData,
    });
  }

  async deleteInspection(id) {
    return this.request(`/inspections/${id}`, {
      method: 'DELETE',
    });
  }

  // Database health check
  async checkDatabaseConnection() {
    return this.request('/health/database');
  }
}

export default new ApiClient();