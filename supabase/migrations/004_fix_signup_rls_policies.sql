-- Fix Row Level Security Policies for Signup Flow
-- This migration resolves the chicken-and-egg problem during user registration

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Allow user profile creation during signup" ON user_profiles;
DROP POLICY IF EXISTS "Allow department creation during signup" ON departments;

-- Create a better get_user_department_id function that handles signup
CREATE OR REPLACE FUNCTION get_user_department_id()
RETURNS UUID AS $$
DECLARE
    dept_id UUID;
BEGIN
    SELECT department_id INTO dept_id
    FROM user_profiles
    WHERE user_id = auth.uid()
    LIMIT 1;
    
    -- Return the department ID if found, NULL if not (which is OK during signup)
    RETURN dept_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is in signup process
CREATE OR REPLACE FUNCTION is_signup_process()
RETURNS BOOLEAN AS $$
BEGIN
    -- User is in signup if they're authenticated but have no profile yet
    RETURN auth.uid() IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM user_profiles WHERE user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is department admin
CREATE OR REPLACE FUNCTION is_department_admin(dept_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    check_dept_id UUID;
BEGIN
    -- Use provided dept_id or get user's department
    check_dept_id := COALESCE(dept_id, get_user_department_id());
    
    RETURN EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_id = auth.uid() 
        AND department_id = check_dept_id 
        AND role IN ('fire-chief', 'assistant-chief')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- DEPARTMENTS TABLE POLICIES
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own department" ON departments;
DROP POLICY IF EXISTS "Fire chiefs can update their own department" ON departments;

-- Allow viewing own department
CREATE POLICY "Users can view their own department" ON departments
FOR SELECT USING (
    id = get_user_department_id()
);

-- Allow department creation during signup ONLY
CREATE POLICY "Allow department creation during signup" ON departments
FOR INSERT WITH CHECK (
    is_signup_process() AND admin_email = auth.email()
);

-- Allow department updates by admins
CREATE POLICY "Admins can update their department" ON departments
FOR UPDATE USING (
    id = get_user_department_id() AND is_department_admin()
) WITH CHECK (
    id = get_user_department_id() AND is_department_admin()
);

-- USER_PROFILES TABLE POLICIES  
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view profiles in their department" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Fire chiefs can manage users in their department" ON user_profiles;

-- Allow viewing profiles in same department
CREATE POLICY "Users can view profiles in their department" ON user_profiles
FOR SELECT USING (
    department_id = get_user_department_id()
);

-- Allow profile creation during signup
CREATE POLICY "Allow profile creation during signup" ON user_profiles
FOR INSERT WITH CHECK (
    user_id = auth.uid() AND (
        -- Either it's signup process
        is_signup_process()
        -- Or user is admin creating another user
        OR is_department_admin(department_id)
    )
);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON user_profiles
FOR UPDATE USING (
    user_id = auth.uid()
) WITH CHECK (
    user_id = auth.uid()
);

-- Allow admins to manage users in their department
CREATE POLICY "Admins can manage department users" ON user_profiles
FOR ALL USING (
    department_id = get_user_department_id() AND is_department_admin()
) WITH CHECK (
    department_id = get_user_department_id() AND is_department_admin()
);

-- Allow admins to delete users (except themselves)
CREATE POLICY "Admins can delete department users" ON user_profiles
FOR DELETE USING (
    department_id = get_user_department_id() 
    AND is_department_admin() 
    AND user_id != auth.uid()
);

-- SUBSCRIPTION_USAGE TABLE POLICIES
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view usage for their department" ON subscription_usage;
DROP POLICY IF EXISTS "Allow usage tracking during signup" ON subscription_usage;
DROP POLICY IF EXISTS "System can update usage" ON subscription_usage;

-- Allow viewing usage for own department
CREATE POLICY "Users can view usage for their department" ON subscription_usage
FOR SELECT USING (
    department_id = get_user_department_id()
);

-- Allow inserting usage data (for signup and system operations)
CREATE POLICY "Allow usage data creation" ON subscription_usage
FOR INSERT WITH CHECK (
    -- During signup or by system
    is_signup_process() OR 
    -- Or by authenticated user for their department
    department_id = get_user_department_id()
);

-- Allow updating usage data (system operations)
CREATE POLICY "Allow usage data updates" ON subscription_usage
FOR UPDATE WITH CHECK (
    department_id = get_user_department_id() OR
    -- Allow system updates during operations
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid())
);

-- ANALYTICS TABLES POLICIES
-- These need to allow inserts for tracking but restrict reads

-- Usage analytics
DROP POLICY IF EXISTS "Users can view analytics for their department" ON usage_analytics;
DROP POLICY IF EXISTS "System can insert analytics" ON usage_analytics;

CREATE POLICY "Users can view analytics for their department" ON usage_analytics
FOR SELECT USING (
    department_id = get_user_department_id()
);

CREATE POLICY "Allow analytics tracking" ON usage_analytics
FOR INSERT WITH CHECK (true); -- Allow all inserts for tracking

-- Analytics events  
DROP POLICY IF EXISTS "Users can view events for their department" ON analytics_events;
DROP POLICY IF EXISTS "System can insert events" ON analytics_events;

CREATE POLICY "Users can view events for their department" ON analytics_events
FOR SELECT USING (
    department_id = get_user_department_id()
);

CREATE POLICY "Allow event tracking" ON analytics_events
FOR INSERT WITH CHECK (true); -- Allow all inserts for tracking

-- Update the set_created_by function to handle signup better
CREATE OR REPLACE FUNCTION set_created_by()
RETURNS TRIGGER AS $$
DECLARE
    profile_id UUID;
BEGIN
    -- Try to get the user profile ID
    SELECT id INTO profile_id
    FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND department_id = NEW.department_id 
    LIMIT 1;
    
    -- Set created_by if profile exists
    NEW.created_by := profile_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to initialize department data after signup
CREATE OR REPLACE FUNCTION initialize_department_data()
RETURNS TRIGGER AS $$
BEGIN
    -- This function runs after a new user_profile is created
    -- Initialize default station for new department if it's the first user (fire-chief)
    IF NEW.role = 'fire-chief' AND NOT EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE department_id = NEW.department_id 
        AND id != NEW.id
    ) THEN
        -- Create default station
        INSERT INTO stations (department_id, name, address, phone, created_by)
        VALUES (NEW.department_id, 'Station 1', '', '', NEW.id);
        
        -- Initialize usage tracking
        INSERT INTO subscription_usage (department_id, resource_type, current_usage)
        VALUES 
            (NEW.department_id, 'stations', 1),
            (NEW.department_id, 'equipment', 0),
            (NEW.department_id, 'users', 1)
        ON CONFLICT (department_id, resource_type) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for department initialization
DROP TRIGGER IF EXISTS initialize_department_data_trigger ON user_profiles;
CREATE TRIGGER initialize_department_data_trigger
    AFTER INSERT ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION initialize_department_data();

-- Create a function to validate signup data
CREATE OR REPLACE FUNCTION validate_signup_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Validate department creation during signup
    IF TG_TABLE_NAME = 'departments' THEN
        -- Only allow if user is in signup process
        IF NOT is_signup_process() THEN
            RAISE EXCEPTION 'Department creation only allowed during signup';
        END IF;
        
        -- Ensure admin_email matches authenticated user
        IF NEW.admin_email != auth.email() THEN
            RAISE EXCEPTION 'Admin email must match authenticated user';
        END IF;
    END IF;
    
    -- Validate user profile creation
    IF TG_TABLE_NAME = 'user_profiles' THEN
        -- During signup, ensure user_id matches auth.uid()
        IF is_signup_process() AND NEW.user_id != auth.uid() THEN
            RAISE EXCEPTION 'User ID must match authenticated user during signup';
        END IF;
        
        -- Ensure email matches
        IF NEW.email != auth.email() THEN
            RAISE EXCEPTION 'Profile email must match authenticated user email';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create validation triggers
DROP TRIGGER IF EXISTS validate_department_signup ON departments;
CREATE TRIGGER validate_department_signup
    BEFORE INSERT ON departments
    FOR EACH ROW
    EXECUTE FUNCTION validate_signup_data();

DROP TRIGGER IF EXISTS validate_profile_signup ON user_profiles;
CREATE TRIGGER validate_profile_signup
    BEFORE INSERT ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION validate_signup_data();

-- Add helpful indexes for the new functions
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id_lookup ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_dept_role ON user_profiles(department_id, role);
CREATE INDEX IF NOT EXISTS idx_departments_admin_email ON departments(admin_email);

-- Create a view for easier department management
DROP VIEW IF EXISTS department_users;
CREATE VIEW department_users AS
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
    d.plan as department_plan,
    d.subscription_status
FROM user_profiles up
JOIN departments d ON d.id = up.department_id;

-- Enable RLS on the view
ALTER VIEW department_users ENABLE ROW LEVEL SECURITY;

-- Create policy for the view
CREATE POLICY "Users can view department users in their department" 
ON department_users FOR SELECT USING (
    department_id = get_user_department_id()
);

-- Grant access to authenticated users
GRANT SELECT ON department_users TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Test the policies with a simple query function
CREATE OR REPLACE FUNCTION test_rls_policies()
RETURNS TABLE(test_name TEXT, result BOOLEAN, message TEXT) AS $$
BEGIN
    RETURN QUERY SELECT 
        'get_user_department_id'::TEXT,
        (get_user_department_id() IS NOT NULL OR is_signup_process())::BOOLEAN,
        CASE 
            WHEN get_user_department_id() IS NOT NULL THEN 'User has department: ' || get_user_department_id()::TEXT
            WHEN is_signup_process() THEN 'User is in signup process'
            ELSE 'User has no department and not in signup'
        END;
        
    RETURN QUERY SELECT 
        'is_signup_process'::TEXT,
        is_signup_process()::BOOLEAN,
        CASE WHEN is_signup_process() THEN 'In signup process' ELSE 'Not in signup process' END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;