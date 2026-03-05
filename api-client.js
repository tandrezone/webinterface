/**
 * API Client for House Control Interface
 * Handles all communication with the backend API
 */

class HouseControlAPI {
    constructor(baseURL) {
        this.baseURL = baseURL || this.getStoredAPIURL() || 'http://localhost:3000/api';
        this.isConnected = false;
    }

    /**
     * Get stored API URL from localStorage
     */
    getStoredAPIURL() {
        return localStorage.getItem('apiURL');
    }

    /**
     * Set and store API URL
     */
    setAPIURL(url) {
        this.baseURL = url;
        localStorage.setItem('apiURL', url);
    }

    /**
     * Make HTTP request with error handling
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        try {
            const response = await fetch(url, { ...defaultOptions, ...options });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            this.isConnected = true;
            return await response.json();
        } catch (error) {
            this.isConnected = false;
            console.error('API request failed:', error);
            throw error;
        }
    }

    /**
     * Get all rooms with their devices
     */
    async getRooms() {
        try {
            return await this.request('/rooms');
        } catch (error) {
            // Return mock data if API is not available (for development/testing)
            console.warn('Using mock data - API not available');
            return this.getMockRooms();
        }
    }

    /**
     * Get a specific room by ID
     */
    async getRoom(roomId) {
        try {
            return await this.request(`/rooms/${roomId}`);
        } catch (error) {
            throw new Error(`Failed to get room ${roomId}: ${error.message}`);
        }
    }

    /**
     * Get all devices in a room
     */
    async getDevices(roomId) {
        try {
            return await this.request(`/rooms/${roomId}/devices`);
        } catch (error) {
            throw new Error(`Failed to get devices for room ${roomId}: ${error.message}`);
        }
    }

    /**
     * Toggle device state (on/off)
     */
    async toggleDevice(roomId, deviceId) {
        try {
            return await this.request(`/rooms/${roomId}/devices/${deviceId}/toggle`, {
                method: 'POST',
            });
        } catch (error) {
            throw new Error(`Failed to toggle device ${deviceId}: ${error.message}`);
        }
    }

    /**
     * Set device state explicitly
     */
    async setDeviceState(roomId, deviceId, state) {
        try {
            return await this.request(`/rooms/${roomId}/devices/${deviceId}`, {
                method: 'PUT',
                body: JSON.stringify({ state }),
            });
        } catch (error) {
            throw new Error(`Failed to set device state: ${error.message}`);
        }
    }

    /**
     * Update device settings
     */
    async updateDeviceSettings(roomId, deviceId, settings) {
        try {
            return await this.request(`/rooms/${roomId}/devices/${deviceId}`, {
                method: 'PATCH',
                body: JSON.stringify(settings),
            });
        } catch (error) {
            throw new Error(`Failed to update device settings: ${error.message}`);
        }
    }

    /**
     * Check API health/connectivity
     */
    async checkHealth() {
        try {
            await this.request('/health');
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Mock data for development/testing when API is not available
     */
    getMockRooms() {
        return [
            {
                id: 1,
                name: 'Living Room',
                icon: '🛋️',
                devices: [
                    {
                        id: 101,
                        name: 'Main Light',
                        type: 'light',
                        icon: '💡',
                        state: 'on',
                        brightness: 75
                    },
                    {
                        id: 102,
                        name: 'TV',
                        type: 'tv',
                        icon: '📺',
                        state: 'off'
                    },
                    {
                        id: 103,
                        name: 'Thermostat',
                        type: 'thermostat',
                        icon: '🌡️',
                        state: 'on',
                        temperature: 22
                    }
                ]
            },
            {
                id: 2,
                name: 'Bedroom',
                icon: '🛏️',
                devices: [
                    {
                        id: 201,
                        name: 'Ceiling Light',
                        type: 'light',
                        icon: '💡',
                        state: 'off'
                    },
                    {
                        id: 202,
                        name: 'Bedside Lamp',
                        type: 'light',
                        icon: '🔦',
                        state: 'on',
                        brightness: 30
                    },
                    {
                        id: 203,
                        name: 'Fan',
                        type: 'fan',
                        icon: '🌀',
                        state: 'off'
                    }
                ]
            },
            {
                id: 3,
                name: 'Kitchen',
                icon: '🍳',
                devices: [
                    {
                        id: 301,
                        name: 'Main Light',
                        type: 'light',
                        icon: '💡',
                        state: 'on'
                    },
                    {
                        id: 302,
                        name: 'Under Cabinet',
                        type: 'light',
                        icon: '💡',
                        state: 'off'
                    },
                    {
                        id: 303,
                        name: 'Smart Plug',
                        type: 'plug',
                        icon: '🔌',
                        state: 'on'
                    }
                ]
            },
            {
                id: 4,
                name: 'Bathroom',
                icon: '🚿',
                devices: [
                    {
                        id: 401,
                        name: 'Mirror Light',
                        type: 'light',
                        icon: '💡',
                        state: 'off'
                    },
                    {
                        id: 402,
                        name: 'Exhaust Fan',
                        type: 'fan',
                        icon: '💨',
                        state: 'off'
                    }
                ]
            }
        ];
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HouseControlAPI;
}
