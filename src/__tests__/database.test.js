import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DatabaseService, transformToSnakeCase, transformToCamelCase } from '../lib/database'

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis()
  })),
  auth: {
    getUser: vi.fn().mockResolvedValue({ 
      data: { user: { id: 'test-user-id' } } 
    })
  }
}

vi.mock('../lib/supabase', () => ({ default: mockSupabase, handleSupabaseError: vi.fn() }))
vi.mock('../lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

describe('Database Service', () => {
  let db

  beforeEach(() => {
    db = new DatabaseService()
    db.currentDepartmentId = 'test-dept-id'
    vi.clearAllMocks()
  })

  describe('Data Transformation', () => {
    it('should transform camelCase to snake_case', () => {
      const input = {
        serialNumber: 'ABC123',
        stationId: 'station-1',
        createdAt: '2024-01-01'
      }

      const expected = {
        serial_number: 'ABC123',
        station_id: 'station-1',
        created_at: '2024-01-01'
      }

      expect(transformToSnakeCase(input)).toEqual(expected)
    })

    it('should transform snake_case to camelCase', () => {
      const input = {
        serial_number: 'ABC123',
        station_id: 'station-1',
        created_at: '2024-01-01'
      }

      const expected = {
        serialNumber: 'ABC123',
        stationId: 'station-1',
        createdAt: '2024-01-01'
      }

      expect(transformToCamelCase(input)).toEqual(expected)
    })

    it('should handle nested objects', () => {
      const input = {
        equipmentData: {
          serialNumber: 'ABC123',
          stationInfo: {
            stationId: 'station-1'
          }
        }
      }

      const result = transformToSnakeCase(input)
      expect(result.equipment_data.serial_number).toBe('ABC123')
      expect(result.equipment_data.station_info.station_id).toBe('station-1')
    })

    it('should handle arrays', () => {
      const input = {
        equipment: [
          { serialNumber: 'ABC123' },
          { serialNumber: 'DEF456' }
        ]
      }

      const result = transformToSnakeCase(input)
      expect(result.equipment[0].serial_number).toBe('ABC123')
      expect(result.equipment[1].serial_number).toBe('DEF456')
    })
  })

  describe('Database Operations', () => {
    it('should query with department context', async () => {
      const mockData = [{ id: '1', name: 'Test Equipment' }]
      mockSupabase.from().select().eq().order.mockResolvedValue({ 
        data: mockData, 
        error: null 
      })

      const result = await db.query('equipment')

      expect(mockSupabase.from).toHaveBeenCalledWith('equipment')
      expect(result).toBeDefined()
    })

    it('should insert with department context', async () => {
      const testData = { name: 'Test Equipment', serialNumber: 'ABC123' }
      const mockResult = { id: '1', ...testData, department_id: 'test-dept-id' }
      
      mockSupabase.from().insert().select().single.mockResolvedValue({ 
        data: mockResult, 
        error: null 
      })

      const result = await db.insert('equipment', testData)

      expect(mockSupabase.from).toHaveBeenCalledWith('equipment')
      expect(result).toBeDefined()
    })

    it('should handle errors gracefully', async () => {
      const mockError = new Error('Database error')
      mockSupabase.from().select().eq().order.mockResolvedValue({ 
        data: null, 
        error: mockError 
      })

      const result = await db.query('equipment')

      expect(result).toEqual([]) // Should return empty array on error
    })
  })

  describe('Error Handling', () => {
    it('should handle missing department context', async () => {
      db.currentDepartmentId = null
      
      const result = await db.query('equipment')
      
      expect(result).toEqual([])
    })

    it('should handle network errors', async () => {
      const networkError = new Error('fetch failed')
      mockSupabase.from().select.mockRejectedValue(networkError)

      const result = await db.query('equipment')
      
      expect(result).toEqual([])
    })
  })

  describe('Health Check', () => {
    it('should perform health check', async () => {
      mockSupabase.from().select().limit.mockResolvedValue({ 
        data: [], 
        error: null 
      })

      const result = await db.healthCheck()
      
      expect(result.healthy).toBe(true)
      expect(result.connected).toBe(true)
    })

    it('should handle health check errors', async () => {
      const healthError = new Error('Connection failed')
      mockSupabase.from().select().limit.mockResolvedValue({ 
        data: null, 
        error: healthError 
      })

      const result = await db.healthCheck()
      
      expect(result.healthy).toBe(false)
      expect(result.connected).toBe(false)
    })
  })
})