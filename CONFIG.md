# Configuration Example for House Control Interface

This file shows example configurations for different setups.

## Example API Configurations

### Local Development
```
API URL: http://localhost:3000/api
Refresh Interval: 30 seconds
```

### Raspberry Pi (Same Device)
```
API URL: http://localhost:3000/api
Refresh Interval: 30 seconds
```

### Remote API Server
```
API URL: http://192.168.1.100:3000/api
Refresh Interval: 30 seconds
```

### Cloud API
```
API URL: https://your-api.example.com/api
Refresh Interval: 60 seconds
```

## Example Backend API (Node.js/Express)

Here's a simple example of what your backend API could look like:

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mock data store
let rooms = [
  {
    id: 1,
    name: 'Living Room',
    icon: '🛋️',
    devices: [
      { id: 101, name: 'Main Light', type: 'light', icon: '💡', state: 'off' }
    ]
  }
];

// Get all rooms
app.get('/api/rooms', (req, res) => {
  res.json(rooms);
});

// Toggle device
app.post('/api/rooms/:roomId/devices/:deviceId/toggle', (req, res) => {
  const roomId = parseInt(req.params.roomId);
  const deviceId = parseInt(req.params.deviceId);
  
  const room = rooms.find(r => r.id === roomId);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  
  const device = room.devices.find(d => d.id === deviceId);
  if (!device) return res.status(404).json({ error: 'Device not found' });
  
  device.state = device.state === 'on' ? 'off' : 'on';
  
  res.json(device);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(3000, () => {
  console.log('API server running on port 3000');
});
```

## Device Type Examples

### Light
```json
{
  "id": 101,
  "name": "Main Light",
  "type": "light",
  "icon": "💡",
  "state": "on",
  "brightness": 75,
  "color": "#ffffff"
}
```

### Thermostat
```json
{
  "id": 102,
  "name": "Thermostat",
  "type": "thermostat",
  "icon": "🌡️",
  "state": "on",
  "temperature": 22,
  "targetTemperature": 24
}
```

### Smart Plug
```json
{
  "id": 103,
  "name": "Smart Plug",
  "type": "plug",
  "icon": "🔌",
  "state": "on",
  "powerUsage": 45.5
}
```

### Fan
```json
{
  "id": 104,
  "name": "Ceiling Fan",
  "type": "fan",
  "icon": "🌀",
  "state": "on",
  "speed": 2
}
```

## Raspberry Pi Setup Commands

### Install Dependencies
```bash
# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js (for API backend)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Or install Python (for simple web server)
sudo apt-get install -y python3
```

### Auto-start on Boot (systemd)

Create `/etc/systemd/system/house-control-web.service`:

```ini
[Unit]
Description=House Control Web Interface
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/webinterface
ExecStart=/usr/bin/python3 -m http.server 8080
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable house-control-web.service
sudo systemctl start house-control-web.service
```

## Security Considerations

1. **Use HTTPS** in production
2. **Add authentication** to your API
3. **Restrict CORS** to specific origins
4. **Use environment variables** for sensitive configuration
5. **Keep your Raspberry Pi updated**
6. **Use a firewall** (ufw or iptables)

Example firewall setup:
```bash
sudo apt-get install ufw
sudo ufw allow 8080/tcp
sudo ufw enable
```
