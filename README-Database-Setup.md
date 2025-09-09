# Fire Gear Tracker - PostgreSQL Database Setup

This guide will help you set up the backend API server to connect your Fire Gear Tracker frontend to your Neon PostgreSQL database.

## Quick Start

### 1. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the backend directory (optional, connection string is already configured):

```bash
DATABASE_URL=postgresql://neondb_owner:npg_pVho4L1uAKmJ@ep-holy-queen-adxl534v-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
PORT=3001
```

### 3. Start the Backend Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3001`

### 4. Test Database Connection

Visit `http://localhost:3001/api/health/database` to verify the connection.

### 5. Start the Frontend

In a new terminal, start the React frontend:

```bash
# In the root directory
npm run dev
```

The frontend will automatically connect to your backend API and PostgreSQL database.

## Database Schema

The backend automatically creates the following tables:

### Stations Table
```sql
CREATE TABLE stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Equipment Table
```sql
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  serial_number VARCHAR(255) NOT NULL UNIQUE,
  manufacturer VARCHAR(255),
  model VARCHAR(255),
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  station_id UUID REFERENCES stations(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'in-service',
  notes TEXT,
  history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Inspections Table
```sql
CREATE TABLE inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
  category VARCHAR(100),
  station_id UUID REFERENCES stations(id) ON DELETE SET NULL,
  template_id VARCHAR(100),
  due_date DATE NOT NULL,
  last_completed TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  external_vendor BOOLEAN DEFAULT FALSE,
  vendor_contact VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Endpoints

### Health Checks
- `GET /api/health` - General health check
- `GET /api/health/database` - Database connection check
- `POST /api/setup/initialize` - Initialize database tables

### Stations
- `GET /api/stations` - Get all stations
- `POST /api/stations` - Create new station
- `PUT /api/stations/:id` - Update station
- `DELETE /api/stations/:id` - Delete station

### Equipment
- `GET /api/equipment` - Get all equipment
- `POST /api/equipment` - Create new equipment
- `PUT /api/equipment/:id` - Update equipment
- `DELETE /api/equipment/:id` - Delete equipment

### Inspections
- `GET /api/inspections` - Get all inspections
- `POST /api/inspections` - Create new inspection
- `PUT /api/inspections/:id` - Update inspection
- `DELETE /api/inspections/:id` - Delete inspection

## Features

✅ **Direct PostgreSQL Connection** - No third-party services required  
✅ **Automatic Schema Creation** - Tables and indexes created automatically  
✅ **CORS Enabled** - Frontend can communicate with backend  
✅ **Error Handling** - Comprehensive error handling and logging  
✅ **UUID Primary Keys** - Using PostgreSQL's native UUID generation  
✅ **JSONB History** - Equipment history stored as structured JSON  
✅ **Referential Integrity** - Foreign key constraints and cascading deletes  
✅ **Performance Optimized** - Indexes on frequently queried columns  

## Troubleshooting

### Connection Issues
1. Verify your Neon database is running
2. Check the connection string is correct
3. Ensure SSL is properly configured
4. Test the connection using `psql` command line

### CORS Issues
The backend is configured with CORS enabled for all origins. In production, you should restrict this to your frontend domain.

### Port Conflicts
If port 3001 is in use, change the PORT in your `.env` file or the server.js file.

## Production Deployment

For production deployment:

1. Set proper environment variables
2. Use a process manager like PM2
3. Configure proper CORS origins
4. Set up SSL/HTTPS
5. Use connection pooling for better performance
6. Set up database backups
7. Monitor database performance

## Security Considerations

- The connection string contains credentials - keep it secure
- Use environment variables for sensitive data
- Implement authentication/authorization as needed
- Validate and sanitize all inputs
- Use prepared statements (already implemented)
- Monitor database access logs