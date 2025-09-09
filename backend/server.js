const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_pVho4L1uAKmJ@ep-holy-queen-adxl534v-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

// Initialize database tables
const initializeTables = async () => {
  try {
    // Create stations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        address TEXT,
        phone VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create equipment table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS equipment (
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
      )
    `);

    // Create inspections table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS inspections (
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
      )
    `);

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_equipment_station_id ON equipment(station_id);
      CREATE INDEX IF NOT EXISTS idx_equipment_category ON equipment(category);
      CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);
      CREATE INDEX IF NOT EXISTS idx_inspections_equipment_id ON inspections(equipment_id);
      CREATE INDEX IF NOT EXISTS idx_inspections_due_date ON inspections(due_date);
      CREATE INDEX IF NOT EXISTS idx_inspections_status ON inspections(status);
    `);

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database tables:', error);
  }
};

// Initialize tables on startup
initializeTables();

// Health check endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/health/database', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'connected', database: 'PostgreSQL' });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// Setup endpoint
app.post('/api/setup/initialize', async (req, res) => {
  try {
    await initializeTables();
    res.json({ status: 'success', message: 'Database initialized' });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// Station endpoints
app.get('/api/stations', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM stations ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/stations', async (req, res) => {
  try {
    const { name, address, phone } = req.body;
    const result = await pool.query(
      'INSERT INTO stations (name, address, phone) VALUES ($1, $2, $3) RETURNING *',
      [name, address, phone]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/stations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, phone } = req.body;
    const result = await pool.query(
      'UPDATE stations SET name = $1, address = $2, phone = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
      [name, address, phone, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Station not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/stations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM stations WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Station not found' });
    }
    
    res.json({ message: 'Station deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Equipment endpoints
app.get('/api/equipment', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM equipment ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/equipment', async (req, res) => {
  try {
    const {
      name,
      serialNumber,
      manufacturer,
      model,
      category,
      subcategory,
      stationId,
      status,
      notes
    } = req.body;

    // Create initial history entry
    const initialHistory = [{
      id: uuidv4(),
      date: new Date().toISOString(),
      type: 'created',
      action: 'Equipment Created',
      user: 'Current User',
      details: 'Equipment added to inventory',
      status: status,
      notes: notes || ''
    }];

    const result = await pool.query(
      `INSERT INTO equipment 
       (name, serial_number, manufacturer, model, category, subcategory, station_id, status, notes, history) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [name, serialNumber, manufacturer, model, category, subcategory, stationId, status, notes, JSON.stringify(initialHistory)]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/equipment/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      serialNumber,
      manufacturer,
      model,
      category,
      subcategory,
      stationId,
      status,
      notes
    } = req.body;

    // Get current equipment to add history entry
    const currentResult = await pool.query('SELECT * FROM equipment WHERE id = $1', [id]);
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    const currentEquipment = currentResult.rows[0];
    const currentHistory = currentEquipment.history || [];

    // Create history entry
    const historyEntry = {
      id: uuidv4(),
      date: new Date().toISOString(),
      type: 'updated',
      action: status !== currentEquipment.status ? 'Status Changed' : 'Equipment Updated',
      user: 'Current User',
      details: status !== currentEquipment.status 
        ? `Status changed from ${currentEquipment.status} to ${status}`
        : 'Equipment information updated',
      previousStatus: currentEquipment.status,
      newStatus: status,
      notes: notes || ''
    };

    const updatedHistory = [...currentHistory, historyEntry];

    const result = await pool.query(
      `UPDATE equipment 
       SET name = $1, serial_number = $2, manufacturer = $3, model = $4, 
           category = $5, subcategory = $6, station_id = $7, status = $8, 
           notes = $9, history = $10, updated_at = NOW() 
       WHERE id = $11 
       RETURNING *`,
      [name, serialNumber, manufacturer, model, category, subcategory, stationId, status, notes, JSON.stringify(updatedHistory), id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/equipment/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM equipment WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    res.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Inspection endpoints
app.get('/api/inspections', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inspections ORDER BY due_date ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/inspections', async (req, res) => {
  try {
    const {
      name,
      equipmentId,
      category,
      stationId,
      templateId,
      dueDate,
      notes,
      externalVendor,
      vendorContact
    } = req.body;

    const result = await pool.query(
      `INSERT INTO inspections 
       (name, equipment_id, category, station_id, template_id, due_date, notes, external_vendor, vendor_contact) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [name, equipmentId, category, stationId, templateId, dueDate, notes, externalVendor, vendorContact]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/inspections/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      dueDate,
      lastCompleted,
      status,
      notes,
      externalVendor,
      vendorContact
    } = req.body;

    const result = await pool.query(
      `UPDATE inspections 
       SET name = $1, due_date = $2, last_completed = $3, status = $4, 
           notes = $5, external_vendor = $6, vendor_contact = $7, updated_at = NOW() 
       WHERE id = $8 
       RETURNING *`,
      [name, dueDate, lastCompleted, status, notes, externalVendor, vendorContact, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inspection not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/inspections/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM inspections WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inspection not found' });
    }
    
    res.json({ message: 'Inspection deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/api/health`);
});