# Fire Gear Tracker - Supabase Setup Guide

This guide will help you connect your Fire Gear Tracker application to Supabase for cloud database functionality.

## Quick Start

### 1. Supabase Project Setup

1. **Create a Supabase Account**: Go to [supabase.com](https://supabase.com) and create an account
2. **Create a New Project**: Click "New Project" and fill in your project details
3. **Get Your Credentials**: From your project dashboard, go to Settings > API to find:
   - Project URL (e.g., `https://your-project-id.supabase.co`)
   - Anon/Public Key (starts with `eyJ...`)

### 2. Quest Environment Connection

In the Quest environment, use the **connectSupabaseProject** tool to link your project:

```javascript
// This will be handled automatically by Quest
connectSupabaseProject({
  organizationNameOrId: "your-org-name",
  projectNameOrId: "fire-gear-tracker"
});
```

### 3. Database Schema

The application will automatically create the following tables when you initialize the database:

#### Stations Table
```sql
CREATE TABLE stations_fd2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE stations_fd2024 ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations" ON stations_fd2024 FOR ALL TO public USING (true) WITH CHECK (true);
```

#### Equipment Table
```sql
CREATE TABLE equipment_fd2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  serial_number VARCHAR(255) NOT NULL UNIQUE,
  manufacturer VARCHAR(255),
  model VARCHAR(255),
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  station_id UUID REFERENCES stations_fd2024(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'in-service',
  notes TEXT,
  history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE equipment_fd2024 ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations" ON equipment_fd2024 FOR ALL TO public USING (true) WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_equipment_station_id ON equipment_fd2024(station_id);
CREATE INDEX idx_equipment_category ON equipment_fd2024(category);
CREATE INDEX idx_equipment_status ON equipment_fd2024(status);
```

#### Inspections Table
```sql
CREATE TABLE inspections_fd2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  equipment_id UUID REFERENCES equipment_fd2024(id) ON DELETE CASCADE,
  category VARCHAR(100),
  station_id UUID REFERENCES stations_fd2024(id) ON DELETE SET NULL,
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

ALTER TABLE inspections_fd2024 ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations" ON inspections_fd2024 FOR ALL TO public USING (true) WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_inspections_equipment_id ON inspections_fd2024(equipment_id);
CREATE INDEX idx_inspections_due_date ON inspections_fd2024(due_date);
CREATE INDEX idx_inspections_status ON inspections_fd2024(status);
```

## Features

✅ **Real-time Database** - PostgreSQL with real-time subscriptions  
✅ **Row Level Security** - Secure data access policies  
✅ **Automatic Backups** - Built-in backup and restore  
✅ **Edge Functions** - Serverless functions for complex operations  
✅ **Authentication** - Built-in user management (if needed)  
✅ **File Storage** - For equipment photos and documents  
✅ **API Generation** - Automatic REST and GraphQL APIs  

## Connection Status

The application will show:
- **"Supabase Connected"** when properly linked
- **"Local Storage Mode"** when using offline functionality

## Data Migration

If you have existing data in local storage, you can:

1. **Export Data**: Use Settings > Data Management > Export Data
2. **Connect Supabase**: Set up your Supabase project
3. **Import Data**: Use the import functionality to transfer your data

## Troubleshooting

### Common Issues

1. **"Supabase project not connected"**
   - Ensure you've connected your project in the Quest environment
   - Check your project URL and API key are correct

2. **"Database not initialized"**
   - Use the "Setup Database" button in the application
   - This will create all required tables and policies

3. **"Permission denied"**
   - Verify Row Level Security policies are set correctly
   - Check that your API key has the right permissions

### Support

If you encounter issues:
1. Check the browser console for detailed error messages
2. Verify your Supabase project is active and not paused
3. Ensure you're using the correct project credentials

## Security Best Practices

1. **Never expose your service key** - Only use the anon/public key in frontend
2. **Use Row Level Security** - All tables have RLS enabled by default
3. **Regular backups** - Supabase provides automatic backups
4. **Monitor usage** - Keep an eye on your database usage in Supabase dashboard

## Performance Tips

1. **Use indexes** - Already created for common queries
2. **Limit large queries** - Use pagination for large datasets
3. **Real-time subscriptions** - Only subscribe to data you need
4. **Connection pooling** - Supabase handles this automatically

This setup provides a robust, scalable backend for your Fire Gear Tracker application with enterprise-grade security and performance.