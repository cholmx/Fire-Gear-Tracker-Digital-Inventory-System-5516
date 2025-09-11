import supabase from './supabase'
import { toast } from './toast'

// Data transformation utilities
const transformToSnakeCase = (obj) => {
  if (!obj || typeof obj !== 'object') return obj
  const transformed = {}
  
  Object.entries(obj).forEach(([key, value]) => {
    // Convert camelCase to snake_case
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()
    
    // Handle nested objects and arrays
    if (Array.isArray(value)) {
      transformed[snakeKey] = value.map(item => 
        typeof item === 'object' ? transformToSnakeCase(item) : item
      )
    } else if (value && typeof value === 'object' && value.constructor === Object) {
      transformed[snakeKey] = transformToSnakeCase(value)
    } else {
      transformed[snakeKey] = value
    }
  })
  
  return transformed
}

const transformToCamelCase = (obj) => {
  if (!obj || typeof obj !== 'object') return obj
  const transformed = {}
  
  Object.entries(obj).forEach(([key, value]) => {
    // Convert snake_case to camelCase
    const camelKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase())
    
    // Handle nested objects and arrays
    if (Array.isArray(value)) {
      transformed[camelKey] = value.map(item => 
        typeof item === 'object' ? transformToCamelCase(item) : item
      )
    } else if (value && typeof value === 'object' && value.constructor === Object) {
      transformed[camelKey] = transformToCamelCase(value)
    } else {
      transformed[camelKey] = value
    }
  })
  
  return transformed
}

// Field mapping for specific transformations
const FIELD_MAPPINGS = {
  // Equipment fields
  serialNumber: 'serial_number',
  stationId: 'station_id',
  departmentId: 'department_id',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  createdBy: 'created_by',
  updatedBy: 'updated_by',
  
  // Inspection fields
  equipmentId: 'equipment_id',
  templateId: 'template_id',
  dueDate: 'due_date',
  lastCompleted: 'last_completed',
  externalVendor: 'external_vendor',
  vendorId: 'vendor_id',
  vendorContact: 'vendor_contact',
  
  // User profile fields
  userId: 'user_id',
  firstName: 'first_name',
  lastName: 'last_name',
  assignedStations: 'assigned_stations',
  lastLogin: 'last_login',
  
  // Department fields
  adminEmail: 'admin_email',
  subscriptionStatus: 'subscription_status',
  trialEndsAt: 'trial_ends_at',
  subscriptionId: 'subscription_id',
  customerId: 'customer_id',
  
  // Vendor fields
  contactPerson: 'contact_person'
}

// Reverse mapping for camelCase to snake_case
const REVERSE_FIELD_MAPPINGS = Object.fromEntries(
  Object.entries(FIELD_MAPPINGS).map(([camel, snake]) => [snake, camel])
)

// Enhanced transformation with field mapping
const transformDataToSnakeCase = (data) => {
  if (!data || typeof data !== 'object') return data
  
  if (Array.isArray(data)) {
    return data.map(item => transformDataToSnakeCase(item))
  }
  
  const transformed = {}
  Object.entries(data).forEach(([key, value]) => {
    // Use explicit mapping if available, otherwise convert case
    const snakeKey = FIELD_MAPPINGS[key] || key.replace(/([A-Z])/g, '_$1').toLowerCase()
    
    if (Array.isArray(value)) {
      transformed[snakeKey] = value.map(item => 
        typeof item === 'object' ? transformDataToSnakeCase(item) : item
      )
    } else if (value && typeof value === 'object' && value.constructor === Object) {
      transformed[snakeKey] = transformDataToSnakeCase(value)
    } else {
      transformed[snakeKey] = value
    }
  })
  
  return transformed
}

const transformDataToCamelCase = (data) => {
  if (!data || typeof data !== 'object') return data
  
  if (Array.isArray(data)) {
    return data.map(item => transformDataToCamelCase(item))
  }
  
  const transformed = {}
  Object.entries(data).forEach(([key, value]) => {
    // Use explicit mapping if available, otherwise convert case
    const camelKey = REVERSE_FIELD_MAPPINGS[key] || key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase())
    
    if (Array.isArray(value)) {
      transformed[camelKey] = value.map(item => 
        typeof item === 'object' ? transformDataToCamelCase(item) : item
      )
    } else if (value && typeof value === 'object' && value.constructor === Object) {
      transformed[camelKey] = transformDataToCamelCase(value)
    } else {
      transformed[camelKey] = value
    }
  })
  
  return transformed
}

// Database service that uses Supabase with proper multi-tenant isolation
export class DatabaseService {
  constructor() {
    this.currentDepartmentId = null
    this.isDemo = false
    this._departmentIdCache = new Map()
    this._cacheExpiry = null
  }

  setDepartmentId(departmentId) {
    console.log('🏢 Setting department ID:', departmentId)
    this.currentDepartmentId = departmentId
    
    // Clear cache when department changes
    this._departmentIdCache.clear()
    this._cacheExpiry = null
  }

  // Get current user's department ID from auth context with caching
  async getCurrentDepartmentId() {
    // Return cached department ID if available and not expired
    if (this.currentDepartmentId && this._cacheExpiry && Date.now() < this._cacheExpiry) {
      return this.currentDepartmentId
    }

    // Check if we have it cached in memory
    if (this.currentDepartmentId) {
      console.log('🏢 Using cached department ID:', this.currentDepartmentId)
      return this.currentDepartmentId
    }

    try {
      console.log('🔍 Fetching department ID from database...')
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.warn('❌ No authenticated user found')
        return null
      }

      console.log('👤 Authenticated user:', user.email)

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('department_id, first_name, last_name')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('❌ Error fetching user profile:', error)
        return null
      }

      if (profile && profile.department_id) {
        console.log('✅ Found department ID:', profile.department_id, 'for user:', profile.first_name, profile.last_name)
        this.currentDepartmentId = profile.department_id
        this._cacheExpiry = Date.now() + (5 * 60 * 1000) // Cache for 5 minutes
        return profile.department_id
      } else {
        console.warn('❌ No department ID found in user profile')
        return null
      }
    } catch (error) {
      console.error('❌ Error getting department ID:', error)
      return null
    }
  }

  // ✅ ENHANCED: Better error handling and validation
  async query(table, options = {}) {
    try {
      const departmentId = await this.getCurrentDepartmentId()
      
      if (!departmentId) {
        console.error('❌ No department ID available for query on table:', table)
        throw new Error('Department context not available. Please ensure you are logged in and have a valid department.')
      }

      console.log(`📊 Querying ${table} for department:`, departmentId)

      let query = supabase.from(table).select('*')
      
      // Apply department filter for tenant isolation
      query = query.eq('department_id', departmentId)

      // Apply additional filters (transform to snake_case)
      if (options.filters) {
        const snakeCaseFilters = transformDataToSnakeCase(options.filters)
        Object.entries(snakeCaseFilters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }

      // Apply ordering
      if (options.order) {
        const { column, ascending = true } = options.order
        const snakeCaseColumn = FIELD_MAPPINGS[column] || column.replace(/([A-Z])/g, '_$1').toLowerCase()
        query = query.order(snakeCaseColumn, { ascending })
      } else {
        // Default ordering by created_at
        query = query.order('created_at', { ascending: false })
      }

      // Apply range/pagination
      if (options.range) {
        const { from, to } = options.range
        query = query.range(from, to)
      }

      const { data, error } = await query

      if (error) {
        console.error(`❌ Query error on ${table}:`, error)
        throw error
      }

      console.log(`✅ Query successful on ${table}, found ${data?.length || 0} records`)

      // Transform data back to camelCase for frontend
      const transformedData = data ? transformDataToCamelCase(data) : []
      return transformedData
    } catch (error) {
      console.error('Database query error:', error)
      
      // Don't show toast for department context errors during initialization
      if (!error.message?.includes('Department context not available')) {
        toast.error(`Failed to fetch ${table}: ${error.message}`)
      }
      
      return []
    }
  }

  // ✅ ENHANCED: Better validation and error messages
  async insert(table, data, options = {}) {
    try {
      const departmentId = await this.getCurrentDepartmentId()
      
      if (!departmentId) {
        console.error('❌ No department ID available for insert into table:', table)
        throw new Error('Department context not available. Please ensure you are logged in and have a valid department.')
      }

      console.log(`➕ Inserting into ${table} for department:`, departmentId)
      console.log('📝 Insert data (before transformation):', data)

      // Transform data to snake_case for database
      const snakeCaseData = transformDataToSnakeCase(data)

      // Auto-inject department_id for all inserts
      const dataWithDepartment = Array.isArray(snakeCaseData) 
        ? snakeCaseData.map(item => ({
            ...item,
            department_id: departmentId,
            // Ensure created_at is set if not provided
            created_at: item.created_at || new Date().toISOString()
          }))
        : {
            ...snakeCaseData,
            department_id: departmentId,
            // Ensure created_at is set if not provided  
            created_at: snakeCaseData.created_at || new Date().toISOString()
          }

      console.log('📝 Insert data (after transformation):', dataWithDepartment)

      const { data: result, error } = await supabase
        .from(table)
        .insert(dataWithDepartment)
        .select()
        .single()

      if (error) {
        console.error(`❌ Insert error on ${table}:`, error)
        
        // Provide more helpful error messages
        if (error.code === '23505') {
          throw new Error('A record with this information already exists.')
        } else if (error.code === '23503') {
          throw new Error('Invalid reference. Please check your data and try again.')
        } else if (error.message?.includes('row-level security')) {
          throw new Error('Access denied. Please contact your administrator.')
        } else {
          throw new Error(`Failed to save data: ${error.message}`)
        }
      }

      console.log(`✅ Insert successful on ${table}:`, result)

      // Transform result back to camelCase
      const transformedResult = transformDataToCamelCase(result)
      return transformedResult
    } catch (error) {
      console.error('Database insert error:', error)
      
      // Show user-friendly error messages
      if (error.message?.includes('Department context not available')) {
        toast.error('Please log in and try again.')
      } else {
        toast.error(error.message || `Failed to add ${table}`)
      }
      
      throw error
    }
  }

  async update(table, id, updates, options = {}) {
    try {
      const departmentId = await this.getCurrentDepartmentId()
      
      if (!departmentId) {
        console.error('❌ No department ID available for update on table:', table)
        throw new Error('Department context not available. Please ensure you are logged in and have a valid department.')
      }

      console.log(`✏️ Updating ${table} record ${id} for department:`, departmentId)

      // Transform updates to snake_case
      const snakeCaseUpdates = transformDataToSnakeCase(updates)
      
      // Add updated_at timestamp
      snakeCaseUpdates.updated_at = new Date().toISOString()

      const { data, error } = await supabase
        .from(table)
        .update(snakeCaseUpdates)
        .eq('id', id)
        .eq('department_id', departmentId) // Ensure we only update records from current department
        .select()
        .single()

      if (error) {
        console.error(`❌ Update error on ${table}:`, error)
        
        if (error.code === '23505') {
          throw new Error('A record with this information already exists.')
        } else if (error.message?.includes('row-level security')) {
          throw new Error('Access denied. Please contact your administrator.')
        } else {
          throw new Error(`Failed to update data: ${error.message}`)
        }
      }

      console.log(`✅ Update successful on ${table}:`, data)

      // Transform result back to camelCase
      const transformedResult = transformDataToCamelCase(data)
      return transformedResult
    } catch (error) {
      console.error('Database update error:', error)
      toast.error(error.message || `Failed to update ${table}`)
      throw error
    }
  }

  async delete(table, id, options = {}) {
    try {
      const departmentId = await this.getCurrentDepartmentId()
      
      if (!departmentId) {
        console.error('❌ No department ID available for delete on table:', table)
        throw new Error('Department context not available. Please ensure you are logged in and have a valid department.')
      }

      console.log(`🗑️ Deleting from ${table} record ${id} for department:`, departmentId)

      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
        .eq('department_id', departmentId) // Ensure we only delete records from current department

      if (error) {
        console.error(`❌ Delete error on ${table}:`, error)
        
        if (error.message?.includes('row-level security')) {
          throw new Error('Access denied. Please contact your administrator.')
        } else {
          throw new Error(`Failed to delete data: ${error.message}`)
        }
      }

      console.log(`✅ Delete successful on ${table}`)
      return true
    } catch (error) {
      console.error('Database delete error:', error)
      toast.error(error.message || `Failed to delete ${table}`)
      throw error
    }
  }

  async batchInsert(table, dataArray, options = {}) {
    try {
      const departmentId = await this.getCurrentDepartmentId()
      
      if (!departmentId) {
        console.error('❌ No department ID available for batch insert into table:', table)
        throw new Error('Department context not available. Please ensure you are logged in and have a valid department.')
      }

      console.log(`➕ Batch inserting ${dataArray.length} records into ${table} for department:`, departmentId)

      // Transform all data to snake_case
      const snakeCaseDataArray = dataArray.map(item => transformDataToSnakeCase(item))

      const dataWithDepartment = snakeCaseDataArray.map(item => ({
        ...item,
        department_id: departmentId,
        created_at: item.created_at || new Date().toISOString()
      }))

      const { data, error } = await supabase
        .from(table)
        .insert(dataWithDepartment)
        .select()

      if (error) {
        console.error(`❌ Batch insert error on ${table}:`, error)
        throw error
      }

      console.log(`✅ Batch insert successful on ${table}, inserted ${data?.length || 0} records`)

      // Transform results back to camelCase
      const transformedResults = data ? transformDataToCamelCase(data) : []
      return transformedResults
    } catch (error) {
      console.error('Database batch insert error:', error)
      toast.error(`Failed to batch insert ${table}: ${error.message}`)
      throw error
    }
  }

  generateId() {
    return crypto.randomUUID()
  }

  // Health check
  async healthCheck() {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('count')
        .limit(1)
      
      return {
        healthy: !error,
        demo: false,
        error: error
      }
    } catch (error) {
      return {
        healthy: false,
        demo: false,
        error
      }
    }
  }

  // Real-time subscription with department isolation
  subscribeToTable(table, callback, options = {}) {
    const departmentFilter = this.currentDepartmentId 
      ? `department_id=eq.${this.currentDepartmentId}` 
      : null

    if (!departmentFilter) {
      console.error('Cannot subscribe without department ID')
      return { unsubscribe: () => {} }
    }

    console.log(`🔔 Subscribing to ${table} changes for department:`, this.currentDepartmentId)

    const channel = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: departmentFilter
        },
        (payload) => {
          console.log(`🔔 Real-time update on ${table}:`, payload)
          
          // Transform payload data to camelCase before calling callback
          const transformedPayload = {
            ...payload,
            new: payload.new ? transformDataToCamelCase(payload.new) : payload.new,
            old: payload.old ? transformDataToCamelCase(payload.old) : payload.old
          }
          callback(transformedPayload)
        }
      )
      .subscribe()

    return {
      unsubscribe: () => supabase.removeChannel(channel)
    }
  }

  // Analytics tracking with department context
  async trackUsage(action, metadata = {}) {
    try {
      const departmentId = await this.getCurrentDepartmentId()
      if (!departmentId) return

      // Transform metadata to snake_case
      const snakeCaseMetadata = transformDataToSnakeCase(metadata)

      await supabase
        .from('usage_analytics')
        .insert({
          department_id: departmentId,
          action,
          metadata: snakeCaseMetadata,
          timestamp: new Date().toISOString()
        })
    } catch (error) {
      console.error('Analytics tracking error:', error)
    }
  }

  // Export department data (only current department's data)
  async exportDepartmentData() {
    try {
      const departmentId = await this.getCurrentDepartmentId()
      
      if (!departmentId) {
        throw new Error('No department ID available for export')
      }

      const tables = ['stations', 'equipment', 'inspections', 'vendors']
      const exportData = {}

      for (const table of tables) {
        const data = await this.query(table)
        exportData[table] = data
      }

      exportData.exported_at = new Date().toISOString()
      exportData.department_id = departmentId
      exportData.demo_mode = false

      return exportData
    } catch (error) {
      toast.error('Failed to export data')
      throw error
    }
  }

  // Initialize fresh department data (for new signups)
  async initializeDepartmentData(departmentId) {
    try {
      console.log('🚀 Initializing department data for:', departmentId)
      this.setDepartmentId(departmentId)

      // Create default station for new department
      const defaultStation = {
        name: 'Station 1',
        address: '',
        phone: '',
        notes: 'Default station created during signup'
      }

      await this.insert('stations', defaultStation)
      console.log('✅ Default station created successfully')
    } catch (error) {
      console.error('❌ Error initializing department data:', error)
      // Don't throw here as it's not critical for signup
    }
  }

  // Clear department context (for logout)
  clearDepartmentContext() {
    console.log('🔄 Clearing department context')
    this.currentDepartmentId = null
    this._departmentIdCache.clear()
    this._cacheExpiry = null
  }
}

export const db = new DatabaseService()

// Export transformation utilities for use in other files
export { 
  transformDataToSnakeCase, 
  transformDataToCamelCase, 
  FIELD_MAPPINGS, 
  REVERSE_FIELD_MAPPINGS 
}

export default db