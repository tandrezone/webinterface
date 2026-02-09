/**
 * Main Application Logic for House Control Interface
 */

// Initialize API client
const api = new HouseControlAPI();

// Application state
let rooms = [];
let refreshInterval = null;

/**
 * Initialize the application
 */
async function init() {
    console.log('Initializing House Control Interface...');
    
    // Load settings
    loadSettings();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load initial data
    await loadRooms();
    
    // Start auto-refresh
    startAutoRefresh();
}

/**
 * Load settings from localStorage
 */
function loadSettings() {
    const savedInterval = localStorage.getItem('refreshInterval');
    if (savedInterval) {
        document.getElementById('refresh-interval').value = savedInterval;
    }
    
    const savedAPIURL = api.getStoredAPIURL();
    if (savedAPIURL) {
        document.getElementById('api-url').value = savedAPIURL;
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Settings button
    document.getElementById('settings-btn').addEventListener('click', openSettings);
    
    // Settings modal buttons
    document.getElementById('close-settings-btn').addEventListener('click', closeSettings);
    document.getElementById('cancel-settings-btn').addEventListener('click', closeSettings);
    document.getElementById('save-settings-btn').addEventListener('click', saveSettings);
    
    // Retry button
    document.getElementById('retry-btn').addEventListener('click', () => {
        location.reload();
    });
    
    // Close modal on background click
    document.getElementById('settings-modal').addEventListener('click', (e) => {
        if (e.target.id === 'settings-modal') {
            closeSettings();
        }
    });
    
    // Event delegation for device toggle buttons
    document.addEventListener('click', (e) => {
        const toggleButton = e.target.closest('.toggle-switch');
        if (toggleButton) {
            const roomId = parseInt(toggleButton.dataset.roomId);
            const deviceId = parseInt(toggleButton.dataset.deviceId);
            if (roomId && deviceId) {
                toggleDevice(roomId, deviceId);
            }
        }
    });
}

/**
 * Load all rooms and devices
 */
async function loadRooms() {
    try {
        showLoading(true);
        hideError();
        
        // Fetch rooms from API
        rooms = await api.getRooms();
        
        // Update connection status
        updateConnectionStatus(true);
        
        // Render rooms
        renderRooms(rooms);
        
        showLoading(false);
    } catch (error) {
        console.error('Failed to load rooms:', error);
        updateConnectionStatus(false);
        showError('Failed to load rooms. Please check your API connection.');
        showLoading(false);
    }
}

/**
 * Render rooms and devices
 */
function renderRooms(rooms) {
    const container = document.getElementById('rooms-container');
    container.innerHTML = '';
    
    if (!rooms || rooms.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--text-secondary);">No rooms found. Configure your API endpoint in settings.</p>';
        container.classList.remove('hidden');
        return;
    }
    
    rooms.forEach(room => {
        const roomElement = createRoomElement(room);
        container.appendChild(roomElement);
    });
    
    container.classList.remove('hidden');
}

/**
 * Create a room element
 */
function createRoomElement(room) {
    const roomDiv = document.createElement('div');
    roomDiv.className = 'room';
    roomDiv.dataset.roomId = room.id;
    
    // Calculate room status
    const devicesOn = room.devices.filter(d => d.state === 'on').length;
    const totalDevices = room.devices.length;
    const statusText = devicesOn > 0 ? `${devicesOn} of ${totalDevices} on` : 'All off';
    
    roomDiv.innerHTML = `
        <div class="room-header">
            <h2 class="room-title">
                <span>${room.icon || '📦'}</span>
                ${room.name}
            </h2>
            <span class="room-status">${statusText}</span>
        </div>
        <div class="devices-grid" id="devices-${room.id}">
            ${room.devices.map(device => createDeviceHTML(room.id, device)).join('')}
        </div>
    `;
    
    return roomDiv;
}

/**
 * Create device HTML
 */
function createDeviceHTML(roomId, device) {
    const isOn = device.state === 'on';
    const deviceClass = isOn ? 'device-card device-on' : 'device-card';
    
    return `
        <div class="${deviceClass}" data-device-id="${device.id}" data-room-id="${roomId}">
            <div class="device-header">
                <div>
                    <div class="device-name">${device.name}</div>
                    <div class="device-type">${device.type}</div>
                </div>
                <div class="device-icon">${device.icon || '📱'}</div>
            </div>
            <div class="device-status ${isOn ? 'status-on' : 'status-off'}">
                <span class="device-status-dot"></span>
                <span>${isOn ? 'On' : 'Off'}</span>
            </div>
            <div class="device-controls">
                <button class="toggle-switch" data-room-id="${roomId}" data-device-id="${device.id}">
                    <span>${isOn ? 'Turn Off' : 'Turn On'}</span>
                    <div class="switch"></div>
                </button>
            </div>
        </div>
    `;
}

/**
 * Toggle a device on/off
 */
async function toggleDevice(roomId, deviceId) {
    try {
        // Find the device in current state
        const room = rooms.find(r => r.id === roomId);
        if (!room) return;
        
        const device = room.devices.find(d => d.id === deviceId);
        if (!device) return;
        
        // Optimistically update UI
        const newState = device.state === 'on' ? 'off' : 'on';
        device.state = newState;
        renderRooms(rooms);
        
        // Call API
        try {
            await api.toggleDevice(roomId, deviceId);
            updateConnectionStatus(true);
        } catch (error) {
            console.error('Failed to toggle device:', error);
            // Revert on error
            device.state = device.state === 'on' ? 'off' : 'on';
            renderRooms(rooms);
            updateConnectionStatus(false);
            
            // Show brief error notification
            showBriefNotification('Failed to toggle device', 'error');
        }
    } catch (error) {
        console.error('Toggle device error:', error);
    }
}

/**
 * Show/hide loading indicator
 */
function showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.classList.remove('hidden');
    } else {
        loading.classList.add('hidden');
    }
}

/**
 * Show error message
 */
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    errorText.textContent = message;
    errorDiv.classList.remove('hidden');
}

/**
 * Hide error message
 */
function hideError() {
    const errorDiv = document.getElementById('error-message');
    errorDiv.classList.add('hidden');
}

/**
 * Update connection status indicator
 */
function updateConnectionStatus(connected) {
    const statusIndicator = document.getElementById('connection-status');
    const statusText = document.getElementById('status-text');
    
    if (connected) {
        statusIndicator.classList.add('connected');
        statusIndicator.classList.remove('error');
        statusText.textContent = 'Connected';
    } else {
        statusIndicator.classList.remove('connected');
        statusIndicator.classList.add('error');
        statusText.textContent = 'Disconnected';
    }
}

/**
 * Show brief notification
 */
function showBriefNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'error' ? '#ef4444' : '#2563eb'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 2000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Open settings modal
 */
function openSettings() {
    const modal = document.getElementById('settings-modal');
    modal.classList.remove('hidden');
}

/**
 * Close settings modal
 */
function closeSettings() {
    const modal = document.getElementById('settings-modal');
    modal.classList.add('hidden');
}

/**
 * Save settings
 */
function saveSettings() {
    const apiURL = document.getElementById('api-url').value.trim();
    const refreshIntervalValue = document.getElementById('refresh-interval').value;
    
    // Validate inputs
    if (apiURL) {
        api.setAPIURL(apiURL);
    }
    
    if (refreshIntervalValue) {
        localStorage.setItem('refreshInterval', refreshIntervalValue);
        // Restart auto-refresh with new interval
        startAutoRefresh();
    }
    
    closeSettings();
    
    // Reload data with new settings
    loadRooms();
    
    showBriefNotification('Settings saved successfully', 'info');
}

/**
 * Start auto-refresh
 */
function startAutoRefresh() {
    // Clear existing interval
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
    
    // Get refresh interval from settings
    const intervalSeconds = parseInt(localStorage.getItem('refreshInterval') || '30');
    const intervalMs = intervalSeconds * 1000;
    
    // Set new interval
    refreshInterval = setInterval(() => {
        console.log('Auto-refreshing data...');
        loadRooms();
    }, intervalMs);
}

/**
 * Stop auto-refresh
 */
function stopAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    stopAutoRefresh();
});

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
