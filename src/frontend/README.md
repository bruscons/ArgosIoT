# IoTrain Frontend

Frontend for the IoTrain access control system, built with Next.js 14.

## Description

Web interface for viewing and monitoring the access control system in real time, including an interactive dashboard, historical reports, and IoT device monitoring (ESP32).

## Features

-  **Login Screen**: User authentication (no backend yet)
-  **Dashboard**: Real-time access visualization via MQTT
-  **Real-Time Charts**: Tracking of granted, denied, and error access events
-  **Device Monitoring**: Status of connected ESP32 devices
-  **Reports**: Full access history with advanced filters
-  **Real-Time Updates**: MQTT-based communication for instant events

## Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installing Dependencies

```bash
npm install
```

## Configuration

Create a `.env.local` file at the project root (`src/frontend/.env.local`) with the following variables:

```env
# Backend API URL
# Local example: http://localhost:3000
# Production example: http://159.223.199.233:3000
NEXT_PUBLIC_API_URL=http://localhost:3000

# MQTT Broker URL (WebSocket)
# For HiveMQ Cloud with SSL: wss://[broker].s1.eu.hivemq.cloud:8884
# For HiveMQ Cloud without SSL: ws://[broker].s1.eu.hivemq.cloud:8883
# Local example: ws://localhost:8083
NEXT_PUBLIC_MQTT_URL=wss://d8375c5d1154430bbaedae91fd4e1632.s1.eu.hivemq.cloud:8884

# MQTT credentials (optional, but recommended for production)
NEXT_PUBLIC_MQTT_USERNAME=Argos
NEXT_PUBLIC_MQTT_PASSWORD=ioTrain*99!
```

**Note**: You can use the `env.example` file as a base. Copy it to `.env.local` and adjust the values for your environment.

### Environment Variables

| Variable | Description | Required | Default |
|----------|-----------|-------------|--------|
| `NEXT_PUBLIC_API_URL` | Base backend API URL | Yes | `http://localhost:3000` |
| `NEXT_PUBLIC_MQTT_URL` | MQTT broker URL (WebSocket) | Yes | `ws://localhost:8083` |
| `NEXT_PUBLIC_MQTT_USERNAME` | Username for MQTT authentication | No | (empty) |
| `NEXT_PUBLIC_MQTT_PASSWORD` | Password for MQTT authentication | No | (empty) |

**Important**: 
- All variables must start with `NEXT_PUBLIC_` to be accessible on the client
- For HiveMQ Cloud, use `wss://` (WebSocket Secure) on port 8884 for SSL
- For local development without SSL, use `ws://` on port 8083

## Running

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:3001`

**Note**: The frontend runs on port **3001** to avoid conflicting with the backend, which runs on port **3000**.

### Production

```bash
npm run build
npm start
```

## Folder Structure

```
src/frontend/
├── app/                          # Next.js pages (App Router)
│   ├── dashboard/                # Main dashboard page
│   │   └── page.tsx
│   ├── login/                    # Login screen
│   │   └── page.tsx
│   ├── relatorios/               # Reports and history page
│   │   └── page.tsx
│   ├── layout.tsx                # Main layout
│   ├── page.tsx                  # Home page (redirects to login)
│   └── globals.css               # Global styles
├── components/                   # React components
│   └── Dashboard/
│       ├── RealtimeChart.tsx    # Real-time access chart
│       ├── DeviceMonitor.tsx     # Device monitoring
│       └── AccessLogsTable.tsx  # Access log table
├── services/                     # Communication services
│   ├── ApiService.ts             # HTTP client for REST API
│   └── MQTTService.ts            # MQTT client for real-time data
├── hooks/                        # Custom hooks
│   ├── useRealtimeData.ts        # Hook for real-time MQTT data
│   └── useAccessLogs.ts          # Hook for access logs
├── utils/                        # Utilities
│   └── dateFormatter.ts          # Date formatting
├── config/                       # Configuration and constants
│   └── constants.ts              # Application constants
├── types/                        # TypeScript type definitions
│   └── index.ts
├── .env.local                    # Environment variables (not committed)
├── env.example                   # Environment variable example
└── package.json
```

## Pages

### `/login`
System authentication screen. For now, it automatically redirects to the dashboard without validation.

### `/dashboard`
Main dashboard featuring:
- **Real-Time Chart**: Access events grouped by minute
- **Device Monitoring**: Status of connected ESP32 units
- **Log Table**: Recent access history

### `/relatorios`
Reports page featuring:
- **Advanced Filters**: By room, event type, and period
- **Full Table**: All access logs with detailed information

## Main Components

### RealtimeChart
Bar chart showing real-time access events received via MQTT, grouped by minute. Shows:
- Granted Access (green)
- Denied Access (red)
- Errors (yellow)

### DeviceMonitor
List of ESP32 devices connected to the system, showing:
- Device name and ID
- Status (Online/Offline/Error)
- Associated room
- Last update

### AccessLogsTable
Full access log table with columns:
- Room
- Activity (Entry/Exit)
- Team
- Responsible party
- Number of people
- Entry time
- Exit time
- Duration

## Technologies

- **Next.js 14+**: React framework with App Router
- **TypeScript**: Static typing
- **Tailwind CSS**: Utility-first styling
- **Recharts**: Charting library
- **MQTT.js**: MQTT client for real-time communication

## Integration

The frontend communicates with:

### Backend API (REST)
- `GET /api/access/logs` - Fetch access logs
- `GET /api/access/stats` - Fetch statistics
- `GET /api/devices` - List devices

### MQTT Broker
- **Subscription Topic**: `access/response/+`
- **Protocol**: WebSocket Secure (WSS) or WebSocket (WS)
- **Format**: JSON

## Real-Time vs Historical Data

### Real-Time (MQTT)
- Events received via MQTT
- Instant updates
- Last 100 events kept in memory
- Used in the real-time chart

### Historical (REST API)
- Data from the PostgreSQL database
- Filters and pagination
- Used in report tables

## Available Scripts

- `npm run dev` - Starts the development server on port 3001
- `npm run build` - Generates a production build
- `npm start` - Starts the production server on port 3001
- `npm run lint` - Runs the linter

## Development

### Data Structure

MQTT events follow this format:
```typescript
interface AccessEvent {
  request_id: string;
  response_type: 'success' | 'denied' | 'error';
  access_granted: boolean;
  message: {
    line1: string;
    line2: string;
  };
  timestamp: number;
  device_id?: string;
}
```

### Custom Hooks

- **useRealtimeData**: Manages the MQTT connection and real-time events
- **useAccessLogs**: Fetches and filters access logs from the backend

## License

ISC

## Developed by

IoTrain - Inteli
