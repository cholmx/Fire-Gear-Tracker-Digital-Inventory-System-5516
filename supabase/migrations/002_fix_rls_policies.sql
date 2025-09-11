-- Fix Row Level Security Policies for proper multi-tenant isolation
-- This migration ensures complete data isolation between departments

-- First, drop existing policies that might be too permissive
DROP POLICY IF EXISTS "Allow all operations" ON stations;
DROP POLICY IF EXISTS "Allow all operations" ON equipment;
DROP POLICY IF EXISTS "Allow all operations" ON inspections;
DROP POLICY IF EXISTS "Allow all operations" ON vendors;

-- Helper function to get user's department ID
CREATE OR REPLACE FUNCTION get_user_department_id()
RETURNS UUID AS $$
DECLARE
    dept_id UUID;
BEGIN
    SELECT department_id INTO dept_id
    FROM user_profiles
    WHERE user_id = auth.uid()
    LIMIT 1;
    
    RETURN dept_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Stations RLS Policies
CREATE POLICY "Users can view stations in their department"
    ON stations FOR SELECT
    USING (department_id = get_user_department_id());

CREATE POLICY "Users can insert stations in their department"
    ON stations FOR INSERT
    WITH CHECK (department_id = get_user_department_id());

CREATE POLICY "Users can update stations in their department"
    ON stations FOR UPDATE
    USING (department_id = get_user_department_id())
    WITH CHECK (department_id = get_user_department_id());

CREATE POLICY "Users can delete stations in their department"
    ON stations FOR DELETE
    USING (department_id = get_user_department_id());

-- Equipment RLS Policies
CREATE POLICY "Users can view equipment in their department"
    ON equipment FOR SELECT
    USING (department_id = get_user_department_id());

CREATE POLICY "Users can insert equipment in their department"
    ON equipment FOR INSERT
    WITH CHECK (department_id = get_user_department_id());

CREATE POLICY "Users can update equipment in their department"
    ON equipment FOR UPDATE
    USING (department_id = get_user_department_id())
    WITH CHECK (department_id = get_user_department_id());

CREATE POLICY "Users can delete equipment in their department"
    ON equipment FOR DELETE
    USING (department_id = get_user_department_id());

-- Inspections RLS Policies
CREATE POLICY "Users can view inspections in their department"
    ON inspections FOR SELECT
    USING (department_id = get_user_department_id());

CREATE POLICY "Users can insert inspections in their department"
    ON inspections FOR INSERT
    WITH CHECK (department_id = get_user_department_id());

CREATE POLICY "Users can update inspections in their department"
    ON inspections FOR UPDATE
    USING (department_id = get_user_department_id())
    WITH CHECK (department_id = get_user_department_id());

CREATE POLICY "Users can delete inspections in their department"
    ON inspections FOR DELETE
    USING (department_id = get_user_department_id());

-- Vendors RLS Policies
CREATE POLICY "Users can view vendors in their department"
    ON vendors FOR SELECT
    USING (department_id = get_user_department_id());

CREATE POLICY "Users can insert vendors in their department"
    ON vendors FOR INSERT
    WITH CHECK (department_id = get_user_department_id());

CREATE POLICY "Users can update vendors in their department"
    ON vendors FOR UPDATE
    USING (department_id = get_user_department_id())
    WITH CHECK (department_id = get_user_department_id());

CREATE POLICY "Users can delete vendors in their department"
    ON vendors FOR DELETE
    USING (department_id = get_user_department_id());

-- Update existing policies for user_profiles to be more restrictive
DROP POLICY IF EXISTS "Users can view profiles in their department" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage users in their department" ON user_profiles;

CREATE POLICY "Users can view profiles in their department"
    ON user_profiles FOR SELECT
    USING (department_id = get_user_department_id());

CREATE POLICY "Users can update their own profile"
    ON user_profiles FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Fire chiefs can manage users in their department"
    ON user_profiles FOR ALL
    USING (
        department_id = get_user_department_id() AND
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.user_id = auth.uid()
            AND up.department_id = get_user_department_id()
            AND up.role IN ('fire-chief', 'assistant-chief')
        )
    )
    WITH CHECK (
        department_id = get_user_department_id() AND
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.user_id = auth.uid()
            AND up.department_id = get_user_department_id()
            AND up.role IN ('fire-chief', 'assistant-chief')
        )
    );

-- Clean up any existing demo data to prevent cross-contamination
-- Remove the demo department data that might be causing issues
DELETE FROM equipment WHERE department_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM stations WHERE department_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM inspections WHERE department_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM vendors WHERE department_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM user_profiles WHERE department_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM departments WHERE id = '00000000-0000-0000-0000-000000000001';

-- Add a trigger to automatically set created_by field
CREATE OR REPLACE FUNCTION set_created_by()
RETURNS TRIGGER AS $$
BEGIN
    NEW.created_by = (
        SELECT id FROM user_profiles 
        WHERE user_id = auth.uid() 
        AND department_id = NEW.department_id
        LIMIT 1
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to relevant tables
DROP TRIGGER IF EXISTS set_created_by_trigger ON stations;
DROP TRIGGER IF EXISTS set_created_by_trigger ON equipment;
DROP TRIGGER IF EXISTS set_created_by_trigger ON inspections;
DROP TRIGGER IF EXISTS set_created_by_trigger ON vendors;

CREATE TRIGGER set_created_by_trigger
    BEFORE INSERT ON stations
    FOR EACH ROW EXECUTE FUNCTION set_created_by();

CREATE TRIGGER set_created_by_trigger
    BEFORE INSERT ON equipment
    FOR EACH ROW EXECUTE FUNCTION set_created_by();

CREATE TRIGGER set_created_by_trigger
    BEFORE INSERT ON inspections
    FOR EACH ROW EXECUTE FUNCTION set_created_by();

CREATE TRIGGER set_created_by_trigger
    BEFORE INSERT ON vendors
    FOR EACH ROW EXECUTE FUNCTION set_created_by();

-- Ensure all tables have proper indexes for department_id
CREATE INDEX IF NOT EXISTS idx_stations_department_id ON stations(department_id);
CREATE INDEX IF NOT EXISTS idx_equipment_department_id ON equipment(department_id);
CREATE INDEX IF NOT EXISTS idx_inspections_department_id ON inspections(department_id);
CREATE INDEX IF NOT EXISTS idx_vendors_department_id ON vendors(department_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_department_id ON user_profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Add constraint to ensure equipment belongs to stations in same department
ALTER TABLE equipment
DROP CONSTRAINT IF EXISTS equipment_station_department_check;

ALTER TABLE equipment
ADD CONSTRAINT equipment_station_department_check
CHECK (
    station_id IS NULL OR
    EXISTS (
        SELECT 1 FROM stations s 
        WHERE s.id = station_id 
        AND s.department_id = equipment.department_id
    )
);

-- Add constraint to ensure inspections belong to equipment in same department
ALTER TABLE inspections
DROP CONSTRAINT IF EXISTS inspections_equipment_department_check;

ALTER TABLE inspections
ADD CONSTRAINT inspections_equipment_department_check
CHECK (
    equipment_id IS NULL OR
    EXISTS (
        SELECT 1 FROM equipment e 
        WHERE e.id = equipment_id 
        AND e.department_id = inspections.department_id
    )
);