-- Fix signup flow and RLS policies for user registration
-- This migration ensures proper user registration without permission issues

-- Temporarily disable RLS for user_profiles during signup
-- We'll create a special policy for user registration

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view profiles in their department" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Fire chiefs can manage users in their department" ON user_profiles;

-- Create more permissive policies that allow signup
CREATE POLICY "Users can view profiles in their department" ON user_profiles 
FOR SELECT USING (
  department_id IN (
    SELECT department_id FROM user_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own profile" ON user_profiles 
FOR UPDATE USING (user_id = auth.uid()) 
WITH CHECK (user_id = auth.uid());

-- Allow insert for new user registration (this is key for signup)
CREATE POLICY "Allow user profile creation during signup" ON user_profiles
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Fire chiefs can manage users in their department
CREATE POLICY "Fire chiefs can manage users in their department" ON user_profiles
FOR ALL USING (
  department_id IN (
    SELECT department_id FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('fire-chief', 'assistant-chief')
  )
) WITH CHECK (
  department_id IN (
    SELECT department_id FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('fire-chief', 'assistant-chief')
  )
);

-- Fix departments table policies for signup
DROP POLICY IF EXISTS "Users can view their own department" ON departments;
DROP POLICY IF EXISTS "Users can update their own department" ON departments;

-- Allow viewing departments for authenticated users
CREATE POLICY "Users can view their own department" ON departments
FOR SELECT USING (
  id IN (
    SELECT department_id FROM user_profiles WHERE user_id = auth.uid()
  )
);

-- Allow department creation during signup (temporary, will be restricted by app logic)
CREATE POLICY "Allow department creation during signup" ON departments
FOR INSERT WITH CHECK (true);

-- Fire chiefs can update their department
CREATE POLICY "Fire chiefs can update their own department" ON departments
FOR UPDATE USING (
  id IN (
    SELECT department_id FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('fire-chief', 'assistant-chief')
  )
) WITH CHECK (
  id IN (
    SELECT department_id FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('fire-chief', 'assistant-chief')
  )
);

-- Ensure subscription_usage table allows inserts during signup
DROP POLICY IF EXISTS "System can manage usage" ON subscription_usage;

CREATE POLICY "Users can view usage for their department" ON subscription_usage
FOR SELECT USING (
  department_id IN (
    SELECT department_id FROM user_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Allow usage tracking during signup" ON subscription_usage
FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update usage" ON subscription_usage
FOR UPDATE WITH CHECK (true);

-- Fix the get_user_department_id function to handle cases where user might not have profile yet
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

-- Create a function to check if user is admin of a department
CREATE OR REPLACE FUNCTION is_department_admin(dept_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND department_id = dept_id 
    AND role IN ('fire-chief', 'assistant-chief')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the set_created_by function to handle signup better
CREATE OR REPLACE FUNCTION set_created_by() 
RETURNS TRIGGER AS $$ 
BEGIN 
  -- Try to get the user profile ID
  SELECT id INTO NEW.created_by
  FROM user_profiles 
  WHERE user_id = auth.uid() 
  AND department_id = NEW.department_id 
  LIMIT 1;
  
  -- If no profile found (during signup), leave created_by as NULL
  -- It will be updated later when the profile is created
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add some helpful indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id_dept_id ON user_profiles(user_id, department_id);
CREATE INDEX IF NOT EXISTS idx_departments_admin_email ON departments(admin_email);

-- Create a view for easy department user management
CREATE OR REPLACE VIEW department_users AS
SELECT 
  up.id,
  up.user_id,
  up.department_id,
  up.email,
  up.first_name,
  up.last_name,
  up.role,
  up.status,
  up.last_login,
  up.created_at,
  d.name as department_name,
  d.plan as department_plan
FROM user_profiles up
JOIN departments d ON d.id = up.department_id;

-- Grant access to the view
GRANT SELECT ON department_users TO authenticated;

-- Create RLS policy for the view
ALTER VIEW department_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view department users in their department" ON department_users
FOR SELECT USING (
  department_id = get_user_department_id()
);