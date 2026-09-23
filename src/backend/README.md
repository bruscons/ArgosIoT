# Access Control System - Backend

Backend system for access control at train stations using ESP32, RFID, and PostgreSQL.

## Requirements

- Node.js 16+ 
- PostgreSQL 12+
- npm or yarn

## Installation

1. Clone the repository and navigate to the backend folder:
```bash
cd src/backend
```

2. Install the dependencies:
```bash
npm install
```

3. Configure the environment variables:
- Copy the `.env.example` file to `.env`
- Fill in your PostgreSQL database credentials

```bash
cp .env.example .env
```

4. Set up the database:
```bash
npm run db:setup
```

This command creates all the tables and fills them with test data.

## Available Scripts

- `npm start` - Starts the server in production mode
- `npm run dev` - Starts the server in development mode with auto-reload
- `npm run db:create` - Creates only the database tables
- `npm run db:seed` - Fills the tables with mock data
- `npm run db:setup` - Runs db:create and db:seed in sequence

## Project Structure

```
src/backend/
├── config/
│   ├── database/
│   │   ├── sql/
│   │   │   ├── schema/      # Table creation scripts
│   │   │   └── seeds/       # Mock data for testing
│   │   ├── db_config.js     # PostgreSQL configuration
│   │   ├── create_tables.js # Script to create tables
│   │   └── fill_tables.js   # Script to populate data
│   └── constants.js         # Application constants
├── controllers/
│   └── AccessController.js  # Access controller
├── services/
│   ├── AccessValidationService.js  # Validation logic
│   └── LogService.js               # Logging logic
├── repositories/
│   ├── WorkerRepository.js         # Worker data access
│   ├── ServiceRepository.js        # Service data access
│   └── AuthorizationRepository.js  # Authorization data access
├── routes/
│   ├── index.js             # Route aggregator
│   └── access.js            # Access routes
├── middlewares/
│   └── errorHandler.js      # Error handling
├── utils/
│   └── dateFormatter.js     # Date formatting
├── server.js                # Main file
├── package.json
└── .env
```

## Main Endpoint

### POST /api/access/verify

Endpoint used by the ESP32 to verify access.

**Request format:**
```json
{
  "request_id": "SALA01_E_1729450234567_A1B2C3D4_00001",
  "timestamp": "1729450234567",
  "event_type": "ENTRY",
  "location": {
    "room_id": "SALA01",
    "door_id": "PORTA01",
    "esp_id": "ESP001"
  },
  "rfid": {
    "uid": "A1B2C3D4",
    "password_hash": "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"
  },
  "message_hash": "3a52ce780950d4d969792a2559cd519d7ee8c4b067b82fc63b64e9e3e5e9f8c2"
}
```

**Response format:**
```json
{
  "request_id": "SALA01_E_1729450234567_A1B2C3D4_00001",
  "response_type": "success",
  "access_granted": true,
  "message": {
    "line1": "Access granted",
    "line2": "Welcome!"
  },
  "display_duration": 3000,
  "message_hash": "d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4"
}
```

## Test Data

The system comes pre-configured with the following test data:

### Workers:
- RFID: A1B2, Password: 1234, Name: Agent Smith
- RFID: B5C607E8, Password: 5678, Name: Ada Lovelace
- RFID: 0123456789ABC012, Password: abcd, Name: Neo

### Services:
- Electrical Maintenance (SALA_A, MON/WED/FRI, 08:00-12:00)
- Technical Cleaning (SALA_B, TUE/THU, 14:00-17:00)
- Technical Meeting (SALA_C, MON-FRI, 09:00-11:00)

## Development

For local development with auto-reload:
```bash
npm run dev
```

The server will start on the port defined in `.env` (default: 3000).
