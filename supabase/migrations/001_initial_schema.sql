-- Fire Gear Tracker Initial Schema
-- This migration creates the complete database schema for multi-tenant SaaS

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DATABASE postgres SET row_security = on;

-- Departments table (main tenant isolation)
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  admin_email VARCHAR(255) NOT NULL,
  plan VARCHAR(50) NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'professional', 'unlimited')),
  subscription_status VARCHAR(50) NOT NULL DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'past_due')),
  trial_ends_at TIMESTAMPTZ,
  subscription_id VARCHAR(255),
  customer_id VARCHAR(255),
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name)
);

-- User profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'firefighter' CHECK (role IN ('fire-chief', 'assistant-chief', 'captain', 'lieutenant', 'firefighter', 'inspector')),
  phone VARCHAR(20),
  assigned_stations UUID[] DEFAULT ARRAY[]::UUID[],
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id),
  UNIQUE(department_id, email)
);

-- Stations table
CREATE TABLE stations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  contact_person VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id),
  UNIQUE(department_id, name)
);

-- Equipment table
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  serial_number VARCHAR(255) NOT NULL,
  manufacturer VARCHAR(255),
  model VARCHAR(255),
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'in-service' CHECK (status IN ('in-service', 'out-of-service', 'out-for-repair', 'cannot-locate', 'in-training', 'other')),
  purchase_date DATE,
  purchase_cost DECIMAL(10,2),
  warranty_expires DATE,
  notes TEXT,
  history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id),
  UNIQUE(department_id, serial_number)
);

-- Vendors table
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  website VARCHAR(255),
  services TEXT,
  certifications TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

-- Inspections table
CREATE TABLE inspections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
  category VARCHAR(100),
  station_id UUID REFERENCES stations(id) ON DELETE SET NULL,
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  template_id VARCHAR(100),
  due_date DATE NOT NULL,
  last_completed TIMESTAMPTZ,
  status VARCHAR(50) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'overdue', 'cancelled')),
  notes TEXT,
  external_vendor BOOLEAN DEFAULT FALSE,
  vendor_contact TEXT,
  inspection_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id),
  completed_by UUID REFERENCES user_profiles(id)
);

-- Usage analytics table
CREATE TABLE usage_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics events table
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  session_id VARCHAR(255),
  event_name VARCHAR(100) NOT NULL,
  properties JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Subscription usage table
CREATE TABLE subscription_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  resource_type VARCHAR(50) NOT NULL,
  current_usage INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(department_id, resource_type)
);

-- Create indexes for performance
CREATE INDEX idx_user_profiles_department_id ON user_profiles(department_id);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_stations_department_id ON stations(department_id);
CREATE INDEX idx_equipment_department_id ON equipment(department_id);
CREATE INDEX idx_equipment_station_id ON equipment(station_id);
CREATE INDEX idx_equipment_category ON equipment(category);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_serial_number ON equipment(department_id, serial_number);
CREATE INDEX idx_vendors_department_id ON vendors(department_id);
CREATE INDEX idx_inspections_department_id ON inspections(department_id);
CREATE INDEX idx_inspections_equipment_id ON inspections(equipment_id);
CREATE INDEX idx_inspections_due_date ON inspections(due_date);
CREATE INDEX idx_inspections_status ON inspections(status);
CREATE INDEX idx_usage_analytics_department_id ON usage_analytics(department_id);
CREATE INDEX idx_usage_analytics_timestamp ON usage_analytics(timestamp);
CREATE INDEX idx_analytics_events_department_id ON analytics_events(department_id);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX idx_subscription_usage_department_id ON subscription_usage(department_id);

-- Enable Row Level Security on all tables
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for departments
CREATE POLICY "Users can view their own department" ON departments
  FOR SELECT USING (
    id IN (
      SELECT department_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own department" ON departments
  FOR UPDATE USING (
    id IN (
      SELECT department_id FROM user_profiles 
      WHERE user_id = auth.uid() AND role IN ('fire-chief', 'assistant-chief')
    )
  );

-- RLS Policies for user_profiles
CREATE POLICY "Users can view profiles in their department" ON user_profiles
  FOR SELECT USING (
    department_id IN (
      SELECT department_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage users in their department" ON user_profiles
  FOR ALL USING (
    department_id IN (
      SELECT department_id FROM user_profiles 
      WHERE user_id = auth.uid() AND role IN ('fire-chief', 'assistant-chief')
    )
  );

-- RLS Policies for stations
CREATE POLICY "Users can view stations in their department" ON stations
  FOR SELECT USING (
    department_id IN (
      SELECT department_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage stations in their department" ON stations
  FOR ALL USING (
    department_id IN (
      SELECT department_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for equipment
CREATE POLICY "Users can view equipment in their department" ON equipment
  FOR SELECT USING (
    department_id IN (
      SELECT department_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage equipment in their department" ON equipment
  FOR ALL USING (
    department_id IN (
      SELECT department_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for vendors
CREATE POLICY "Users can view vendors in their department" ON vendors
  FOR SELECT USING (
    department_id IN (
      SELECT department_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage vendors in their department" ON vendors
  FOR ALL USING (
    department_id IN (
      SELECT department_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for inspections
CREATE POLICY "Users can view inspections in their department" ON inspections
  FOR SELECT USING (
    department_id IN (
      SELECT department_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage inspections in their department" ON inspections
  FOR ALL USING (
    department_id IN (
      SELECT department_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for usage_analytics
CREATE POLICY "Users can view analytics for their department" ON usage_analytics
  FOR SELECT USING (
    department_id IN (
      SELECT department_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert analytics" ON usage_analytics
  FOR INSERT WITH CHECK (true);

-- RLS Policies for analytics_events
CREATE POLICY "Users can view events for their department" ON analytics_events
  FOR SELECT USING (
    department_id IN (
      SELECT department_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert events" ON analytics_events
  FOR INSERT WITH CHECK (true);

-- RLS Policies for subscription_usage
CREATE POLICY "Users can view usage for their department" ON subscription_usage
  FOR SELECT USING (
    department_id IN (
      SELECT department_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage usage" ON subscription_usage
  FOR ALL WITH CHECK (true);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stations_updated_at BEFORE UPDATE ON stations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inspections_updated_at BEFORE UPDATE ON inspections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscription_usage_updated_at BEFORE UPDATE ON subscription_usage FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update subscription usage
CREATE OR REPLACE FUNCTION update_subscription_usage(dept_id UUID, resource VARCHAR(50), delta INTEGER DEFAULT 1)
RETURNS VOID AS $$
BEGIN
  INSERT INTO subscription_usage (department_id, resource_type, current_usage)
  VALUES (dept_id, resource, delta)
  ON CONFLICT (department_id, resource_type)
  DO UPDATE SET 
    current_usage = subscription_usage.current_usage + delta,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check subscription limits
CREATE OR REPLACE FUNCTION check_subscription_limit(dept_id UUID, resource VARCHAR(50), increment INTEGER DEFAULT 1)
RETURNS BOOLEAN AS $$
DECLARE
  current_plan VARCHAR(50);
  current_usage INTEGER;
  plan_limit INTEGER;
BEGIN
  -- Get department plan
  SELECT plan INTO current_plan FROM departments WHERE id = dept_id;
  
  -- Get current usage
  SELECT COALESCE(current_usage, 0) INTO current_usage 
  FROM subscription_usage 
  WHERE department_id = dept_id AND resource_type = resource;
  
  -- Set limits based on plan
  CASE 
    WHEN current_plan = 'free' THEN
      CASE resource
        WHEN 'stations' THEN plan_limit := 1;
        WHEN 'equipment' THEN plan_limit := 50;
        WHEN 'users' THEN plan_limit := 3;
        ELSE plan_limit := 999999;
      END CASE;
    WHEN current_plan = 'professional' THEN
      CASE resource
        WHEN 'stations' THEN plan_limit := 3;
        WHEN 'equipment' THEN plan_limit := 300;
        WHEN 'users' THEN plan_limit := 10;
        ELSE plan_limit := 999999;
      END CASE;
    WHEN current_plan = 'unlimited' THEN
      plan_limit := 999999; -- Effectively unlimited
    ELSE
      plan_limit := 0; -- No access for unknown plans
  END CASE;
  
  -- Check if adding increment would exceed limit
  RETURN (current_usage + increment) <= plan_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers to update usage counters
CREATE OR REPLACE FUNCTION track_resource_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM update_subscription_usage(NEW.department_id, TG_ARGV[0], 1);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM update_subscription_usage(OLD.department_id, TG_ARGV[0], -1);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create usage tracking triggers
CREATE TRIGGER track_station_usage 
  AFTER INSERT OR DELETE ON stations 
  FOR EACH ROW EXECUTE FUNCTION track_resource_usage('stations');

CREATE TRIGGER track_equipment_usage 
  AFTER INSERT OR DELETE ON equipment 
  FOR EACH ROW EXECUTE FUNCTION track_resource_usage('equipment');

CREATE TRIGGER track_user_usage 
  AFTER INSERT OR DELETE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION track_resource_usage('users');

-- Initial data for development
-- This would be removed in production
INSERT INTO departments (id, name, admin_email, plan, subscription_status) 
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Demo Fire Department',
  'demo@firedept.gov',
  'professional',
  'active'
) ON CONFLICT (name) DO NOTHING;