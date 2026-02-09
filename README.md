# House Control Web Interface

A lightweight web interface for controlling smart home devices on Raspberry Pi Zero. This interface allows you to manage rooms and devices through a simple, responsive UI that communicates with your house control API.

## Features

- 🏠 **Room-based organization** - Organize devices by rooms
- 💡 **Device control** - Toggle devices on/off with visual feedback
- 🔄 **Auto-refresh** - Automatically sync with your API
- ⚙️ **Configurable** - Set custom API endpoint and refresh intervals
- 📱 **Responsive design** - Works on desktop, tablet, and mobile
- 🚀 **Lightweight** - Optimized for Raspberry Pi Zero
- 🎨 **Modern UI** - Clean, intuitive interface with visual indicators

## Quick Start

### 1. Installation

Simply clone or download this repository to your Raspberry Pi Zero:

```bash
git clone https://github.com/tandrezone/webinterface.git
cd webinterface
```

### 2. Serve the Interface

You can use any web server to serve the files. Here are a few options:

#### Option A: Python HTTP Server (Simplest)
```bash
# Python 3
python3 -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

#### Option B: Node.js HTTP Server
```bash
# Install http-server globally
npm install -g http-server

# Serve the directory
http-server -p 8080
```

#### Option C: Nginx
```bash
# Install nginx
sudo apt-get install nginx

# Copy files to web root
sudo cp -r * /var/www/html/

# Nginx will serve on port 80 by default
```

### 3. Access the Interface

Open your browser and navigate to:
- Local: `http://localhost:8080`
- From another device: `http://<raspberry-pi-ip>:8080`

### 4. Configure API Endpoint

1. Click the ⚙️ settings icon in the footer
2. Enter your API URL (e.g., `http://localhost:3000/api`)
3. Set the refresh interval (default: 30 seconds)
4. Click "Save"

## API Documentation

The interface expects your backend API to implement the following endpoints:

### Get All Rooms
```http
GET /api/rooms
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Living Room",
    "icon": "🛋️",
    "devices": [
      {
        "id": 101,
        "name": "Main Light",
        "type": "light",
        "icon": "💡",
        "state": "on",
        "brightness": 75
      }
    ]
  }
]
```

### Get Specific Room
```http
GET /api/rooms/:roomId
```

### Get Room Devices
```http
GET /api/rooms/:roomId/devices
```

### Toggle Device
```http
POST /api/rooms/:roomId/devices/:deviceId/toggle
```

**Response:**
```json
{
  "id": 101,
  "state": "on"
}
```

### Set Device State
```http
PUT /api/rooms/:roomId/devices/:deviceId
```

**Request Body:**
```json
{
  "state": "on"
}
```

### Update Device Settings
```http
PATCH /api/rooms/:roomId/devices/:deviceId
```

**Request Body:**
```json
{
  "brightness": 75,
  "color": "#ffffff"
}
```

### Health Check
```http
GET /api/health
```

## Development Mode

The interface includes mock data for development and testing. If the API is not available, it will automatically use mock data showing example rooms and devices.

To test without an API:
1. Open `index.html` in your browser
2. The interface will show sample rooms (Living Room, Bedroom, Kitchen, Bathroom)
3. You can interact with the UI, but changes won't persist

## File Structure

```
webinterface/
├── index.html          # Main HTML file
├── styles.css          # All styling and responsive design
├── app.js             # Main application logic
├── api-client.js      # API communication layer
├── README.md          # This file
└── LICENSE            # License information
```

## Configuration

Settings are stored in the browser's localStorage:
- `apiURL` - Your API endpoint URL
- `refreshInterval` - Auto-refresh interval in seconds

## Customization

### Adding New Device Types

Edit `api-client.js` to add new device types to the mock data or handle different device types from your API.

### Styling

All styles are in `styles.css`. The interface uses CSS variables for easy theming:

```css
:root {
    --primary-color: #2563eb;
    --success-color: #22c55e;
    --danger-color: #ef4444;
    /* ... more variables */
}
```

### Device Icons

Device icons are emoji by default. You can replace them with icon fonts or SVGs by editing the HTML generation in `app.js`.

## Raspberry Pi Zero Optimization

This interface is specifically optimized for Raspberry Pi Zero:

1. **Minimal dependencies** - Pure HTML, CSS, and JavaScript (no frameworks)
2. **Efficient rendering** - Optimized DOM updates
3. **Responsive design** - Works on small screens
4. **Low memory footprint** - No build process required
5. **Fast loading** - Small file sizes

## Troubleshooting

### Interface shows "Disconnected"
- Check that your API is running and accessible
- Verify the API URL in settings
- Check browser console for error messages

### Devices not responding
- Ensure your API implements the correct endpoints
- Check network connectivity between RPi and API
- Verify API returns proper JSON responses

### Page not loading
- Ensure web server is running
- Check firewall settings on Raspberry Pi
- Verify correct port number

## Browser Compatibility

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

Optimized for:
- Raspberry Pi Zero W
- Raspberry Pi Zero 2 W
- Raspberry Pi 3/4 (will work even better)

## License

See LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Support

For issues or questions, please open an issue on GitHub.