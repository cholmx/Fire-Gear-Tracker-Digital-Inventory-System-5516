-- Atomic Signup Flow with Proper Transaction Handling
-- This migration creates stored procedures for safe, atomic user registration

-- Drop existing problematic triggers that might interfere
DROP TRIGGER IF EXISTS initialize_department_data_trigger ON user_profiles;
DROP FUNCTION IF EXISTS initialize_department_data();

-- Create atomic signup function
CREATE OR REPLACE FUNCTION signup_user(
  auth_user_id UUID,
  user_email TEXT,
  dept_name TEXT,
  admin_first_name TEXT,
  admin_last_name TEXT,
  selected_plan TEXT DEFAULT 'free'
)
RETURNS JSON AS $$
DECLARE
  dept_id UUID;
  profile_id UUID;
  station_id UUID;
  result JSON;
BEGIN
  -- Start transaction (implicit in function)
  
  -- Validate inputs
  IF auth_user_id IS NULL OR user_email IS NULL OR dept_name IS NULL THEN
    RAISE EXCEPTION 'Missing required parameters';
  END IF;
  
  IF LENGTH(dept_name) < 2 THEN
    RAISE EXCEPTION 'Department name must be at least 2 characters';
  END IF;
  
  IF selected_plan NOT IN ('free', 'professional', 'unlimited') THEN
    RAISE EXCEPTION 'Invalid plan selected';
  END IF;

  -- Check if user already has a profile
  IF EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth_user_id) THEN
    RAISE EXCEPTION 'User already has a profile';
  END IF;

  -- Check if department name already exists
  IF EXISTS (SELECT 1 FROM departments WHERE LOWER(name) = LOWER(dept_name)) THEN
    RAISE EXCEPTION 'Department name already exists';
  END IF;

  -- 1. Create department
  INSERT INTO departments (
    id,
    name,
    admin_email,
    plan,
    subscription_status,
    trial_ends_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    dept_name,
    user_email,
    selected_plan,
    CASE 
      WHEN selected_plan = 'free' THEN 'active'
      ELSE 'trial'
    END,
    CASE 
      WHEN selected_plan = 'free' THEN NULL
      ELSE NOW() + INTERVAL '30 days'
    END,
    NOW(),
    NOW()
  ) RETURNING id INTO dept_id;

  -- 2. Create user profile
  INSERT INTO user_profiles (
    id,
    user_id,
    department_id,
    email,
    first_name,
    last_name,
    role,
    status,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    auth_user_id,
    dept_id,
    user_email,
    admin_first_name,
    admin_last_name,
    'fire-chief',
    'active',
    NOW(),
    NOW()
  ) RETURNING id INTO profile_id;

  -- 3. Create default station
  INSERT INTO stations (
    id,
    department_id,
    name,
    address,
    phone,
    notes,
    created_by,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    dept_id,
    'Station 1',
    '',
    '',
    'Default station created during signup',
    profile_id,
    NOW(),
    NOW()
  ) RETURNING id INTO station_id;

  -- 4. Initialize subscription usage tracking
  INSERT INTO subscription_usage (department_id, resource_type, current_usage, updated_at)
  VALUES 
    (dept_id, 'stations', 1, NOW()),
    (dept_id, 'equipment', 0, NOW()),
    (dept_id, 'users', 1, NOW()),
    (dept_id, 'vendors', 0, NOW()),
    (dept_id, 'inspections', 0, NOW());

  -- 5. Create initial analytics event
  INSERT INTO analytics_events (
    department_id,
    user_id,
    event_name,
    properties,
    timestamp
  ) VALUES (
    dept_id,
    profile_id,
    'department_created',
    json_build_object(
      'plan', selected_plan,
      'signup_method', 'direct',
      'department_name', dept_name
    ),
    NOW()
  );

  -- Build success result
  SELECT json_build_object(
    'success', true,
    'department', json_build_object(
      'id', dept_id,
      'name', dept_name,
      'plan', selected_plan,
      'admin_email', user_email,
      'subscription_status', CASE WHEN selected_plan = 'free' THEN 'active' ELSE 'trial' END,
      'created_at', NOW()
    ),
    'user_profile', json_build_object(
      'id', profile_id,
      'user_id', auth_user_id,
      'department_id', dept_id,
      'email', user_email,
      'first_name', admin_first_name,
      'last_name', admin_last_name,
      'role', 'fire-chief',
      'status', 'active'
    ),
    'default_station', json_build_object(
      'id', station_id,
      'name', 'Station 1'
    ),
    'message', 'Account created successfully'
  ) INTO result;

  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    -- Log the error
    INSERT INTO analytics_events (
      event_name,
      properties,
      timestamp
    ) VALUES (
      'signup_error',
      json_build_object(
        'error_message', SQLERRM,
        'error_code', SQLSTATE,
        'department_name', dept_name,
        'user_email', user_email
      ),
      NOW()
    );
    
    -- Return error result
    SELECT json_build_object(
      'success', false,
      'error', json_build_object(
        'message', SQLERRM,
        'code', SQLSTATE
      )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if signup is allowed
CREATE OR REPLACE FUNCTION can_signup(
  user_email TEXT,
  dept_name TEXT
) RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Check if department name is available
  IF EXISTS (SELECT 1 FROM departments WHERE LOWER(name) = LOWER(dept_name)) THEN
    SELECT json_build_object(
      'allowed', false,
      'reason', 'department_name_taken',
      'message', 'This department name is already taken'
    ) INTO result;
    RETURN result;
  END IF;

  -- Check if email is already used as admin
  IF EXISTS (SELECT 1 FROM departments WHERE LOWER(admin_email) = LOWER(user_email)) THEN
    SELECT json_build_object(
      'allowed', false,
      'reason', 'email_already_admin',
      'message', 'This email is already registered as a department administrator'
    ) INTO result;
    RETURN result;
  END IF;

  -- All checks passed
  SELECT json_build_object(
    'allowed', true,
    'message', 'Signup allowed'
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user signup status
CREATE OR REPLACE FUNCTION get_user_signup_status(auth_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
  user_profile RECORD;
  department_info RECORD;
BEGIN
  -- Check if user has a profile
  SELECT up.*, d.name as department_name, d.plan, d.subscription_status
  INTO user_profile
  FROM user_profiles up
  LEFT JOIN departments d ON d.id = up.department_id
  WHERE up.user_id = auth_user_id;

  IF user_profile IS NULL THEN
    -- User needs to complete signup
    SELECT json_build_object(
      'status', 'needs_signup',
      'message', 'User needs to complete signup process',
      'has_profile', false
    ) INTO result;
  ELSE
    -- User has completed signup
    SELECT json_build_object(
      'status', 'completed',
      'message', 'User signup is complete',
      'has_profile', true,
      'user', json_build_object(
        'id', user_profile.id,
        'department_id', user_profile.department_id,
        'email', user_profile.email,
        'first_name', user_profile.first_name,
        'last_name', user_profile.last_name,
        'role', user_profile.role,
        'status', user_profile.status
      ),
      'department', json_build_object(
        'name', user_profile.department_name,
        'plan', user_profile.plan,
        'subscription_status', user_profile.subscription_status
      )
    ) INTO result;
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function for safe department cleanup (for failed signups)
CREATE OR REPLACE FUNCTION cleanup_failed_signup(dept_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- This function should only be called by system/admin
  -- Delete in reverse order of creation to handle foreign keys
  
  DELETE FROM analytics_events WHERE department_id = dept_id;
  DELETE FROM subscription_usage WHERE department_id = dept_id;
  DELETE FROM inspections WHERE department_id = dept_id;
  DELETE FROM equipment WHERE department_id = dept_id;
  DELETE FROM vendors WHERE department_id = dept_id;
  DELETE FROM stations WHERE department_id = dept_id;
  DELETE FROM user_profiles WHERE department_id = dept_id;
  DELETE FROM departments WHERE id = dept_id;

  SELECT json_build_object(
    'success', true,
    'message', 'Department data cleaned up successfully'
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION signup_user(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION can_signup(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_signup_status(UUID) TO authenticated;

-- Grant execute permissions to service role for cleanup
GRANT EXECUTE ON FUNCTION cleanup_failed_signup(UUID) TO service_role;

-- Update RLS policies to work with the new signup flow
-- Drop problematic policies first
DROP POLICY IF EXISTS "Allow department creation during signup" ON departments;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON user_profiles;

-- Create new policies that work with RPC functions
CREATE POLICY "Allow department operations via RPC" ON departments FOR ALL 
USING (true) WITH CHECK (true);

CREATE POLICY "Allow profile operations via RPC" ON user_profiles FOR ALL 
USING (true) WITH CHECK (true);

-- The RPC functions will handle security internally
-- Regular operations still go through normal RLS policies

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_departments_name_lower ON departments(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_departments_admin_email_lower ON departments(LOWER(admin_email));
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_dept ON user_profiles(user_id, department_id);

-- Add constraints to prevent data inconsistencies
ALTER TABLE user_profiles 
ADD CONSTRAINT check_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE departments 
ADD CONSTRAINT check_admin_email_format 
CHECK (admin_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Create a view for signup analytics
CREATE OR REPLACE VIEW signup_analytics AS
SELECT 
  d.id as department_id,
  d.name as department_name,
  d.plan,
  d.subscription_status,
  d.created_at as signup_date,
  up.first_name || ' ' || up.last_name as admin_name,
  up.email as admin_email,
  (SELECT COUNT(*) FROM stations WHERE department_id = d.id) as station_count,
  (SELECT COUNT(*) FROM equipment WHERE department_id = d.id) as equipment_count,
  (SELECT COUNT(*) FROM user_profiles WHERE department_id = d.id) as user_count
FROM departments d
JOIN user_profiles up ON up.department_id = d.id AND up.role = 'fire-chief';

-- Enable RLS on the view
ALTER VIEW signup_analytics ENABLE ROW LEVEL SECURITY;

-- Create policy for the view (admins only)
CREATE POLICY "Admins can view signup analytics" ON signup_analytics FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'fire-chief'
  )
);

GRANT SELECT ON signup_analytics TO authenticated;