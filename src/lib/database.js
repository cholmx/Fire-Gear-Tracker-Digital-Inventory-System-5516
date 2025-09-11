import supabase, { handleSupabaseError } from './supabase'
import { toast } from './toast'

// Simplified field mapping
const fieldMap = {
  // To snake_case
  serialNumber: 'serial_number',
  stationId: 'station_id',
  departmentId: 'department_id',
  equipmentId: 'equipment_id',
  userId: 'user_id',
  firstName: 'first_name',
  lastName: 'last_name',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  dueDate: 'due_date',
  lastCompleted: 'last_completed',
  externalVendor: 'external_vendor',
  vendorId: 'vendor_id',
  vendorContact: 'vendor_contact',
  templateId: 'template_id',
  contactPerson: 'contact_person',
  adminEmail: 'admin_email',
  subscriptionStatus: 'subscription_status',
  lastLogin: 'last_login'
}

// Reverse mapping (snake_case to camelCase)
const reverseFieldMap = Object.fromEntries(
  Object.entries(fieldMap).map(([camel, snake]) => [snake, camel])
)

// Transform data to snake_case for database
export const transformToSnakeCase = (obj) => {
  if (!obj || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(transformToSnakeCase)

  const result = {}
  Object.entries(obj).forEach(([key, value]) => {
    const snakeKey = fieldMap[key] || key.replace(/([A-Z])/g, '_$1').toLowerCase()
    
    if (Array.isArray(value)) {
      result[snakeKey] = value.map(item => 
        typeof item === 'object' ? transformToSnakeCase(item) : item
      )
    } else if (value && typeof value === 'object' && value.constructor === Object) {
      result[snakeKey] = transformToSnakeCase(value)
    } else {
      result[snakeKey] = value
    }
  })
  return result
}

// Transform data to camelCase for frontend
export const transformToCamelCase = (obj) => {
  if (!obj || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(transformToCamelCase)

  const result = {}
  Object.entries(obj).forEach(([key, value]) => {
    const camelKey = reverseFieldMap[key] || key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    
    if (Array.isArray(value)) {
      result[camelKey] = value.map(item => 
        typeof item === 'object' ? transformToCamelCase(item) : item
      )
    } else if (value && typeof value === 'object' && value.constructor === Object) {
      result[camelKey] = transformToCamelCase(value)
    } else {
      result[camelKey] = value
    }
  })
  return result
}

// Simplified Database Service - Single source of truth
export class DatabaseService {
  constructor() {
    this.currentDepartmentId = null
    this.cache = new Map()
    this.cacheExpiry = 5 * 60 * 1000 // 5 minutes
    this.retryCount = 0
    this.maxRetries = 3
  }

  setDepartmentId(departmentId) {
    console.log('🏢 Setting department ID:', departmentId)
    this.currentDepartmentId = departmentId
    this.clearCache()
  }

  clearCache() {
    this.cache.clear()
  }

  clearDepartmentContext() {
    this.currentDepartmentId = null
    this.clearCache()
  }

  // Get current user's department ID with caching
  async getCurrentDepartmentId() {
    if (this.currentDepartmentId) {
      return this.currentDepartmentId
    }

    const cacheKey = 'departmentId'
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() < cached.expiry) {
      this.currentDepartmentId = cached.value
      return cached.value
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('department_id')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        return null
      }

      if (profile?.department_id) {
        this.currentDepartmentId = profile.department_id
        this.cache.set(cacheKey, {
          value: profile.department_id,
          expiry: Date.now() + this.cacheExpiry
        })
        return profile.department_id
      }

      return null
    } catch (error) {
      console.error('Error getting department ID:', error)
      return null
    }
  }

  // Unified query method with comprehensive error handling
  async query(table, options = {}) {
    try {
      const departmentId = await this.getCurrentDepartmentId()
      if (!departmentId) {
        throw new Error('Please log in to access data')
      }

      let query = supabase.from(table).select('*')
      
      // Apply department filter for tenant isolation
      query = query.eq('department_id', departmentId)

      // Apply filters
      if (options.filters) {
        const snakeFilters = transformToSnakeCase(options.filters)
        Object.entries(snakeFilters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }

      // Apply ordering
      if (options.order) {
        const { column, ascending = true } = options.order
        const snakeColumn = fieldMap[column] || column.replace(/([A-Z])/g, '_$1').toLowerCase()
        query = query.order(snakeColumn, { ascending })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      // Apply pagination
      if (options.range) {
        query = query.range(options.range.from, options.range.to)
      }

      const { data, error } = await query

      if (error) {
        const handledError = handleSupabaseError(error, `query ${table}`)
        throw handledError.error
      }

      this.retryCount = 0 // Reset retry count on success
      return data ? transformToCamelCase(data) : []

    } catch (error) {
      console.error(`Database query error on ${table}:`, error)
      
      // Don't show toast for authentication errors during initialization
      if (!error.message?.includes('Please log in')) {
        toast.error(`Failed to fetch ${table}: ${error.message}`)
      }
      
      return []
    }
  }

  // Unified insert method with comprehensive error handling
  async insert(table, data, options = {}) {
    try {
      const departmentId = await this.getCurrentDepartmentId()
      if (!departmentId) {
        throw new Error('Please log in to add data')
      }

      const snakeData = transformToSnakeCase(data)
      const dataWithDepartment = {
        ...snakeData,
        department_id: departmentId,
        created_at: snakeData.created_at || new Date().toISOString()
      }

      const { data: result, error } = await supabase
        .from(table)
        .insert(dataWithDepartment)
        .select()
        .single()

      if (error) {
        const handledError = handleSupabaseError(error, `insert ${table}`)
        throw handledError.error
      }

      this.retryCount = 0
      return transformToCamelCase(result)

    } catch (error) {
      console.error(`Database insert error on ${table}:`, error)
      toast.error(error.message || `Failed to add ${table}`)
      throw error
    }
  }

  // Unified update method with comprehensive error handling
  async update(table, id, updates, options = {}) {
    try {
      const departmentId = await this.getCurrentDepartmentId()
      if (!departmentId) {
        throw new Error('Please log in to update data')
      }

      const snakeUpdates = transformToSnakeCase(updates)
      snakeUpdates.updated_at = new Date().toISOString()

      const { data, error } = await supabase
        .from(table)
        .update(snakeUpdates)
        .eq('id', id)
        .eq('department_id', departmentId)
        .select()
        .single()

      if (error) {
        const handledError = handleSupabaseError(error, `update ${table}`)
        throw handledError.error
      }

      this.retryCount = 0
      return transformToCamelCase(data)

    } catch (error) {
      console.error(`Database update error on ${table}:`, error)
      toast.error(error.message || `Failed to update ${table}`)
      throw error
    }
  }

  // Unified delete method with comprehensive error handling
  async delete(table, id, options = {}) {
    try {
      const departmentId = await this.getCurrentDepartmentId()
      if (!departmentId) {
        throw new Error('Please log in to delete data')
      }

      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
        .eq('department_id', departmentId)

      if (error) {
        const handledError = handleSupabaseError(error, `delete ${table}`)
        throw handledError.error
      }

      this.retryCount = 0
      return true

    } catch (error) {
      console.error(`Database delete error on ${table}:`, error)
      toast.error(error.message || `Failed to delete ${table}`)
      throw error
    }
  }

  // Health check method
  async healthCheck() {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('count')
        .limit(1)

      return {
        healthy: !error,
        connected: !error,
        error: error ? handleSupabaseError(error, 'health check').error : null
      }
    } catch (error) {
      return {
        healthy: false,
        connected: false,
        error: handleSupabaseError(error, 'health check').error
      }
    }
  }
}

export const db = new DatabaseService()
export default db