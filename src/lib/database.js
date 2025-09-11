import supabase from './supabase'
import { toast } from './toast'

// Database service that uses Supabase with proper multi-tenant isolation
export class DatabaseService {
  constructor() {
    this.currentDepartmentId = null
    this.isDemo = false
  }

  setDepartmentId(departmentId) {
    this.currentDepartmentId = departmentId
  }

  // Get current user's department ID from auth context
  async getCurrentDepartmentId() {
    if (this.currentDepartmentId) {
      return this.currentDepartmentId
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('department_id')
        .eq('user_id', user.id)
        .single()

      if (profile) {
        this.currentDepartmentId = profile.department_id
        return profile.department_id
      }
    } catch (error) {
      console.error('Error getting department ID:', error)
    }

    return null
  }

  // Database operations using Supabase with department isolation
  async query(table, options = {}) {
    try {
      const departmentId = await this.getCurrentDepartmentId()
      if (!departmentId) {
        console.error('No department ID available for query')
        return []
      }

      let query = supabase.from(table).select('*')

      // Apply department filter for tenant isolation
      query = query.eq('department_id', departmentId)

      // Apply additional filters
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }

      // Apply ordering
      if (options.order) {
        const { column, ascending = true } = options.order
        query = query.order(column, { ascending })
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

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Database query error:', error)
      toast.error(`Failed to fetch ${table}: ${error.message}`)
      return []
    }
  }

  async insert(table, data, options = {}) {
    try {
      const departmentId = await this.getCurrentDepartmentId()
      if (!departmentId) {
        throw new Error('No department ID available for insert')
      }

      // Add department_id to the data for tenant isolation
      const dataWithDepartment = Array.isArray(data)
        ? data.map(item => ({ ...item, department_id: departmentId }))
        : { ...data, department_id: departmentId }

      const { data: result, error } = await supabase
        .from(table)
        .insert(dataWithDepartment)
        .select()
        .single()

      if (error) throw error
      return result
    } catch (error) {
      console.error('Database insert error:', error)
      toast.error(`Failed to add ${table}: ${error.message}`)
      throw error
    }
  }

  async update(table, id, updates, options = {}) {
    try {
      const departmentId = await this.getCurrentDepartmentId()
      if (!departmentId) {
        throw new Error('No department ID available for update')
      }

      const { data, error } = await supabase
        .from(table)
        .update(updates)
        .eq('id', id)
        .eq('department_id', departmentId) // Ensure we only update records from current department
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Database update error:', error)
      toast.error(`Failed to update ${table}: ${error.message}`)
      throw error
    }
  }

  async delete(table, id, options = {}) {
    try {
      const departmentId = await this.getCurrentDepartmentId()
      if (!departmentId) {
        throw new Error('No department ID available for delete')
      }

      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
        .eq('department_id', departmentId) // Ensure we only delete records from current department

      if (error) throw error
      return true
    } catch (error) {
      console.error('Database delete error:', error)
      toast.error(`Failed to delete ${table}: ${error.message}`)
      throw error
    }
  }

  async batchInsert(table, dataArray, options = {}) {
    try {
      const departmentId = await this.getCurrentDepartmentId()
      if (!departmentId) {
        throw new Error('No department ID available for batch insert')
      }

      const dataWithDepartment = dataArray.map(item => ({
        ...item,
        department_id: departmentId
      }))

      const { data, error } = await supabase
        .from(table)
        .insert(dataWithDepartment)
        .select()

      if (error) throw error
      return data
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
        callback
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

      await supabase
        .from('usage_analytics')
        .insert({
          department_id: departmentId,
          action,
          metadata,
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
      this.setDepartmentId(departmentId)

      // Create default station for new department
      await supabase
        .from('stations')
        .insert({
          department_id: departmentId,
          name: 'Station 1',
          address: '',
          phone: '',
          notes: 'Default station created during signup'
        })

      console.log('Department data initialized for:', departmentId)
    } catch (error) {
      console.error('Error initializing department data:', error)
      // Don't throw here as it's not critical for signup
    }
  }
}

export const db = new DatabaseService()
export default db