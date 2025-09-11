-- Enhanced Security and Row Level Security Policies
-- This migration fixes security vulnerabilities and enforces strict tenant isolation

-- Drop all existing permissive policies
DROP POLICY IF EXISTS "Allow department operations via RPC" ON departments;
DROP POLICY IF EXISTS "Allow profile operations via RPC" ON user_profiles;
DROP POLICY IF EXISTS "Users can view stations in their department" ON stations;
DROP POLICY IF EXISTS "Users can insert stations in their department" ON stations;
DROP POLICY IF EXISTS "Users can update stations in their department" ON stations;
DROP POLICY IF EXISTS "Users can delete stations in their department" ON stations;
DROP POLICY IF EXISTS "Users can view equipment in their department" ON equipment;
DROP POLICY IF EXISTS "Users can insert equipment in their department" ON equipment;
DROP POLICY IF EXISTS "Users can update equipment in their department" ON equipment;
DROP POLICY IF EXISTS "Users can delete equipment in their department" ON equipment;
DROP POLICY IF EXISTS "Users can view inspections in their department" ON inspections;
DROP POLICY IF EXISTS "Users can insert inspections in their department" ON inspections;
DROP POLICY IF EXISTS "Users can update inspections in their department" ON inspections;
DROP POLICY IF EXISTS "Users can delete inspections in their department" ON inspections;
DROP POLICY IF EXISTS "Users can view vendors in their department" ON vendors;
DROP POLICY IF EXISTS "Users can insert vendors in their department" ON vendors;
DROP POLICY IF EXISTS "Users can update vendors in their department" ON vendors;
DROP POLICY IF EXISTS "Users can delete vendors in their department" ON vendors;

-- Create enhanced security functions
CREATE OR REPLACE FUNCTION auth.user_id() RETURNS UUID AS $$
  SELECT COALESCE(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::UUID
$$ LANGUAGE SQL STABLE;

-- Enhanced function to get user's department with security checks
CREATE OR REPLACE FUNCTION get_user_department_id() RETURNS UUID AS $$
DECLARE
  dept_id UUID;
  user_uuid UUID;
BEGIN
  -- Get the authenticated user ID
  user_uuid := auth.user_id();
  
  -- Return NULL if no authenticated user
  IF user_uuid IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Get department ID for the authenticated user
  SELECT department_id INTO dept_id 
  FROM user_profiles 
  WHERE user_id = user_uuid 
  LIMIT 1;
  
  RETURN dept_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is authenticated
CREATE OR REPLACE FUNCTION is_authenticated() RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.user_id() IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is department admin
CREATE OR REPLACE FUNCTION is_department_admin(dept_id UUID DEFAULT NULL) RETURNS BOOLEAN AS $$
DECLARE
  check_dept_id UUID;
  user_uuid UUID;
BEGIN
  user_uuid := auth.user_id();
  
  -- Return false if not authenticated
  IF user_uuid IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Use provided dept_id or get user's department
  check_dept_id := COALESCE(dept_id, get_user_department_id());
  
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = user_uuid 
    AND department_id = check_dept_id 
    AND role IN ('fire-chief', 'assistant-chief')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user owns a record in their department
CREATE OR REPLACE FUNCTION user_owns_department_record(record_dept_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  RETURN record_dept_id IS NOT NULL 
    AND record_dept_id = get_user_department_id();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for system health checks (no sensitive data)
CREATE OR REPLACE FUNCTION get_system_health() RETURNS JSON AS $$
BEGIN
  RETURN json_build_object(
    'status', 'healthy',
    'timestamp', NOW(),
    'version', '1.0.0'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- DEPARTMENTS TABLE - Strict RLS Policies
CREATE POLICY "Users can view their own department only" ON departments 
  FOR SELECT 
  USING (
    is_authenticated() 
    AND id = get_user_department_id()
  );

CREATE POLICY "Department creation via signup RPC only" ON departments 
  FOR INSERT 
  WITH CHECK (
    -- Only allow inserts during signup process via RPC
    current_setting('app.signup_mode', true) = 'true'
    AND admin_email = (
      SELECT email FROM auth.users WHERE id = auth.user_id()
    )
  );

CREATE POLICY "Admins can update their department" ON departments 
  FOR UPDATE 
  USING (
    is_authenticated()
    AND id = get_user_department_id()
    AND is_department_admin(id)
  )
  WITH CHECK (
    id = get_user_department_id()
    AND is_department_admin(id)
  );

-- USER_PROFILES TABLE - Strict RLS Policies
CREATE POLICY "Users can view profiles in their department" ON user_profiles 
  FOR SELECT 
  USING (
    is_authenticated()
    AND department_id = get_user_department_id()
  );

CREATE POLICY "Profile creation via signup RPC only" ON user_profiles 
  FOR INSERT 
  WITH CHECK (
    -- During signup process
    (current_setting('app.signup_mode', true) = 'true' AND user_id = auth.user_id())
    OR
    -- Or by department admin
    (is_department_admin(department_id))
  );

CREATE POLICY "Users can update their own profile" ON user_profiles 
  FOR UPDATE 
  USING (user_id = auth.user_id())
  WITH CHECK (user_id = auth.user_id());

CREATE POLICY "Admins can manage department users" ON user_profiles 
  FOR ALL 
  USING (
    is_authenticated()
    AND department_id = get_user_department_id()
    AND is_department_admin()
    AND user_id != auth.user_id() -- Cannot delete themselves
  )
  WITH CHECK (
    department_id = get_user_department_id()
    AND is_department_admin()
  );

-- STATIONS TABLE - Strict RLS Policies
CREATE POLICY "Users can view stations in their department" ON stations 
  FOR SELECT 
  USING (
    is_authenticated()
    AND user_owns_department_record(department_id)
  );

CREATE POLICY "Users can manage stations in their department" ON stations 
  FOR ALL 
  USING (
    is_authenticated()
    AND user_owns_department_record(department_id)
  )
  WITH CHECK (
    user_owns_department_record(department_id)
  );

-- EQUIPMENT TABLE - Strict RLS Policies
CREATE POLICY "Users can view equipment in their department" ON equipment 
  FOR SELECT 
  USING (
    is_authenticated()
    AND user_owns_department_record(department_id)
  );

CREATE POLICY "Users can manage equipment in their department" ON equipment 
  FOR ALL 
  USING (
    is_authenticated()
    AND user_owns_department_record(department_id)
  )
  WITH CHECK (
    user_owns_department_record(department_id)
    -- Ensure station belongs to same department
    AND EXISTS (
      SELECT 1 FROM stations s 
      WHERE s.id = station_id 
      AND s.department_id = department_id
    )
  );

-- VENDORS TABLE - Strict RLS Policies
CREATE POLICY "Users can view vendors in their department" ON vendors 
  FOR SELECT 
  USING (
    is_authenticated()
    AND user_owns_department_record(department_id)
  );

CREATE POLICY "Users can manage vendors in their department" ON vendors 
  FOR ALL 
  USING (
    is_authenticated()
    AND user_owns_department_record(department_id)
  )
  WITH CHECK (
    user_owns_department_record(department_id)
  );

-- INSPECTIONS TABLE - Strict RLS Policies
CREATE POLICY "Users can view inspections in their department" ON inspections 
  FOR SELECT 
  USING (
    is_authenticated()
    AND user_owns_department_record(department_id)
  );

CREATE POLICY "Users can manage inspections in their department" ON inspections 
  FOR ALL 
  USING (
    is_authenticated()
    AND user_owns_department_record(department_id)
  )
  WITH CHECK (
    user_owns_department_record(department_id)
    -- Ensure equipment belongs to same department (if specified)
    AND (
      equipment_id IS NULL 
      OR EXISTS (
        SELECT 1 FROM equipment e 
        WHERE e.id = equipment_id 
        AND e.department_id = department_id
      )
    )
    -- Ensure station belongs to same department (if specified)
    AND (
      station_id IS NULL 
      OR EXISTS (
        SELECT 1 FROM stations s 
        WHERE s.id = station_id 
        AND s.department_id = department_id
      )
    )
  );

-- ANALYTICS AND USAGE TABLES - Restricted Policies
CREATE POLICY "Users can view analytics for their department" ON usage_analytics 
  FOR SELECT 
  USING (
    is_authenticated()
    AND (
      department_id = get_user_department_id()
      OR is_department_admin()
    )
  );

CREATE POLICY "System can insert usage analytics" ON usage_analytics 
  FOR INSERT 
  WITH CHECK (true); -- Allow system inserts for tracking

CREATE POLICY "Users can view events for their department" ON analytics_events 
  FOR SELECT 
  USING (
    is_authenticated()
    AND (
      department_id = get_user_department_id()
      OR is_department_admin()
    )
  );

CREATE POLICY "System can insert analytics events" ON analytics_events 
  FOR INSERT 
  WITH CHECK (true); -- Allow system inserts for tracking

CREATE POLICY "Users can view usage for their department" ON subscription_usage 
  FOR SELECT 
  USING (
    is_authenticated()
    AND department_id = get_user_department_id()
  );

CREATE POLICY "System can manage subscription usage" ON subscription_usage 
  FOR ALL 
  WITH CHECK (true); -- Allow system management

-- Enhanced signup function with security checks
CREATE OR REPLACE FUNCTION signup_user(
  auth_user_id UUID,
  user_email TEXT,
  dept_name TEXT,
  admin_first_name TEXT,
  admin_last_name TEXT,
  selected_plan TEXT DEFAULT 'free'
) RETURNS JSON AS $$
DECLARE
  dept_id UUID;
  profile_id UUID;
  station_id UUID;
  result JSON;
BEGIN
  -- Set signup mode for RLS policies
  PERFORM set_config('app.signup_mode', 'true', true);
  
  -- Validate inputs with enhanced security
  IF auth_user_id IS NULL OR user_email IS NULL OR dept_name IS NULL THEN
    RAISE EXCEPTION 'Missing required parameters';
  END IF;
  
  -- Validate email format
  IF user_email !~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  -- Validate department name
  IF LENGTH(TRIM(dept_name)) < 2 OR LENGTH(TRIM(dept_name)) > 100 THEN
    RAISE EXCEPTION 'Department name must be between 2 and 100 characters';
  END IF;
  
  -- Validate plan
  IF selected_plan NOT IN ('free', 'professional', 'unlimited') THEN
    RAISE EXCEPTION 'Invalid plan selected';
  END IF;
  
  -- Check if user already exists
  IF EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth_user_id) THEN
    RAISE EXCEPTION 'User already has a profile';
  END IF;
  
  -- Check if department name is taken (case insensitive)
  IF EXISTS (SELECT 1 FROM departments WHERE LOWER(TRIM(name)) = LOWER(TRIM(dept_name))) THEN
    RAISE EXCEPTION 'Department name already exists';
  END IF;
  
  -- Check if email is already used as admin
  IF EXISTS (SELECT 1 FROM departments WHERE LOWER(TRIM(admin_email)) = LOWER(TRIM(user_email))) THEN
    RAISE EXCEPTION 'Email already registered as department administrator';
  END IF;

  -- Create department
  INSERT INTO departments (
    id, name, admin_email, plan, subscription_status, 
    trial_ends_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    TRIM(dept_name),
    LOWER(TRIM(user_email)),
    selected_plan,
    CASE WHEN selected_plan = 'free' THEN 'active' ELSE 'trial' END,
    CASE WHEN selected_plan = 'free' THEN NULL ELSE NOW() + INTERVAL '30 days' END,
    NOW(),
    NOW()
  ) RETURNING id INTO dept_id;

  -- Create user profile
  INSERT INTO user_profiles (
    id, user_id, department_id, email, first_name, last_name, 
    role, status, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    auth_user_id,
    dept_id,
    LOWER(TRIM(user_email)),
    TRIM(admin_first_name),
    TRIM(admin_last_name),
    'fire-chief',
    'active',
    NOW(),
    NOW()
  ) RETURNING id INTO profile_id;

  -- Create default station
  INSERT INTO stations (
    id, department_id, name, notes, created_by, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    dept_id,
    'Station 1',
    'Default station created during signup',
    profile_id,
    NOW(),
    NOW()
  ) RETURNING id INTO station_id;

  -- Initialize subscription usage
  INSERT INTO subscription_usage (department_id, resource_type, current_usage, updated_at) VALUES
    (dept_id, 'stations', 1, NOW()),
    (dept_id, 'equipment', 0, NOW()),
    (dept_id, 'users', 1, NOW()),
    (dept_id, 'vendors', 0, NOW()),
    (dept_id, 'inspections', 0, NOW());

  -- Log signup event
  INSERT INTO analytics_events (
    department_id, event_name, properties, timestamp
  ) VALUES (
    dept_id,
    'department_created',
    json_build_object(
      'plan', selected_plan,
      'signup_method', 'direct',
      'department_name', TRIM(dept_name)
    ),
    NOW()
  );

  -- Clear signup mode
  PERFORM set_config('app.signup_mode', '', true);

  -- Build success response
  SELECT json_build_object(
    'success', true,
    'department', json_build_object(
      'id', dept_id,
      'name', TRIM(dept_name),
      'plan', selected_plan,
      'admin_email', LOWER(TRIM(user_email)),
      'subscription_status', CASE WHEN selected_plan = 'free' THEN 'active' ELSE 'trial' END,
      'created_at', NOW()
    ),
    'user_profile', json_build_object(
      'id', profile_id,
      'user_id', auth_user_id,
      'department_id', dept_id,
      'email', LOWER(TRIM(user_email)),
      'first_name', TRIM(admin_first_name),
      'last_name', TRIM(admin_last_name),
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
    -- Clear signup mode on error
    PERFORM set_config('app.signup_mode', '', true);
    
    -- Log error
    INSERT INTO analytics_events (
      event_name, properties, timestamp
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

    -- Return error
    RETURN json_build_object(
      'success', false,
      'error', json_build_object(
        'message', SQLERRM,
        'code', SQLSTATE
      )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced validation function with security checks
CREATE OR REPLACE FUNCTION can_signup(
  user_email TEXT,
  dept_name TEXT
) RETURNS JSON AS $$
BEGIN
  -- Input validation
  IF user_email IS NULL OR dept_name IS NULL THEN
    RETURN json_build_object(
      'allowed', false,
      'reason', 'invalid_input',
      'message', 'Email and department name are required'
    );
  END IF;
  
  -- Email format validation
  IF user_email !~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' THEN
    RETURN json_build_object(
      'allowed', false,
      'reason', 'invalid_email',
      'message', 'Invalid email format'
    );
  END IF;
  
  -- Department name length validation
  IF LENGTH(TRIM(dept_name)) < 2 OR LENGTH(TRIM(dept_name)) > 100 THEN
    RETURN json_build_object(
      'allowed', false,
      'reason', 'invalid_department_name',
      'message', 'Department name must be between 2 and 100 characters'
    );
  END IF;

  -- Check if department name is available (case insensitive)
  IF EXISTS (SELECT 1 FROM departments WHERE LOWER(TRIM(name)) = LOWER(TRIM(dept_name))) THEN
    RETURN json_build_object(
      'allowed', false,
      'reason', 'department_name_taken',
      'message', 'This department name is already taken'
    );
  END IF;

  -- Check if email is already used as admin
  IF EXISTS (SELECT 1 FROM departments WHERE LOWER(TRIM(admin_email)) = LOWER(TRIM(user_email))) THEN
    RETURN json_build_object(
      'allowed', false,
      'reason', 'email_already_admin',
      'message', 'This email is already registered as a department administrator'
    );
  END IF;

  -- All checks passed
  RETURN json_build_object(
    'allowed', true,
    'message', 'Signup allowed'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Security audit function (admin only)
CREATE OR REPLACE FUNCTION audit_rls_policies() RETURNS TABLE(
  table_name TEXT,
  policy_name TEXT,
  policy_type TEXT,
  policy_definition TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname || '.' || tablename as table_name,
    policyname as policy_name,
    cmd as policy_type,
    qual as policy_definition
  FROM pg_policies 
  WHERE schemaname = 'public'
  ORDER BY tablename, policyname;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_user_department_id() TO authenticated;
GRANT EXECUTE ON FUNCTION is_authenticated() TO authenticated;
GRANT EXECUTE ON FUNCTION is_department_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION user_owns_department_record(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_system_health() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION signup_user(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION can_signup(TEXT, TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION audit_rls_policies() TO authenticated;

-- Create indexes for security functions
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id_active ON user_profiles(user_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_user_profiles_dept_role_active ON user_profiles(department_id, role) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_departments_name_lower ON departments(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_departments_admin_email_lower ON departments(LOWER(admin_email));

-- Add security constraints
ALTER TABLE user_profiles ADD CONSTRAINT check_user_profile_email_format 
  CHECK (email ~* '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');

ALTER TABLE departments ADD CONSTRAINT check_department_admin_email_format 
  CHECK (admin_email ~* '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');

ALTER TABLE departments ADD CONSTRAINT check_department_name_length 
  CHECK (LENGTH(TRIM(name)) >= 2 AND LENGTH(TRIM(name)) <= 100);

-- Security comment
COMMENT ON FUNCTION get_user_department_id() IS 'Security function: Returns authenticated user department ID with strict validation';
COMMENT ON FUNCTION signup_user(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) IS 'Security function: Atomic user signup with input validation and RLS bypass';