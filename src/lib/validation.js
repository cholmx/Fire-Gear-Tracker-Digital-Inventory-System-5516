// Enhanced Validation Service with Security Focus
export class ValidationService {
  // Input sanitization to prevent XSS and injection attacks
  static sanitizeInput(input) {
    if (typeof input !== 'string') return input

    return input
      .trim()
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .replace(/data:/gi, '') // Remove data: protocol
      .replace(/vbscript:/gi, '') // Remove vbscript: protocol
      .slice(0, 1000) // Limit length to prevent DoS
  }

  // Enhanced object sanitization
  static sanitizeObject(obj) {
    if (!obj || typeof obj !== 'object') return obj
    
    const sanitized = {}
    const maxKeys = 50 // Prevent object with too many keys

    let keyCount = 0
    Object.entries(obj).forEach(([key, value]) => {
      if (keyCount >= maxKeys) return // Prevent DoS

      const sanitizedKey = this.sanitizeInput(key)
      
      if (typeof value === 'string') {
        sanitized[sanitizedKey] = this.sanitizeInput(value)
      } else if (Array.isArray(value)) {
        // Limit array size and sanitize elements
        sanitized[sanitizedKey] = value.slice(0, 100).map(item => 
          typeof item === 'string' ? this.sanitizeInput(item) : item
        )
      } else if (value && typeof value === 'object') {
        sanitized[sanitizedKey] = this.sanitizeObject(value)
      } else {
        sanitized[sanitizedKey] = value
      }
      
      keyCount++
    })

    return sanitized
  }

  // Enhanced validation with security checks
  static validate(data, schema) {
    const errors = []
    const sanitizedData = this.sanitizeObject(data)

    Object.entries(schema).forEach(([field, rules]) => {
      const value = sanitizedData[field]

      // Required field validation
      if (rules.required && this.isEmpty(value)) {
        errors.push({
          field,
          message: `${this.formatFieldName(field)} is required`,
          code: 'REQUIRED'
        })
        return
      }

      // Skip further validation if field is empty and not required
      if (this.isEmpty(value)) return

      // Type validation with security checks
      if (rules.type) {
        const typeError = this.validateType(value, rules.type, field)
        if (typeError) errors.push(typeError)
      }

      // Length validation (security: prevent excessively long inputs)
      if (rules.minLength && value.length < rules.minLength) {
        errors.push({
          field,
          message: `${this.formatFieldName(field)} must be at least ${rules.minLength} characters`,
          code: 'MIN_LENGTH'
        })
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push({
          field,
          message: `${this.formatFieldName(field)} must be no more than ${rules.maxLength} characters`,
          code: 'MAX_LENGTH'
        })
      }

      // Enum validation (security: prevent unexpected values)
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push({
          field,
          message: `${this.formatFieldName(field)} must be one of: ${rules.enum.join(', ')}`,
          code: 'INVALID_ENUM'
        })
      }

      // Pattern validation (security: enforce specific formats)
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push({
          field,
          message: rules.patternMessage || `${this.formatFieldName(field)} format is invalid`,
          code: 'INVALID_PATTERN'
        })
      }

      // Conditional required validation
      if (rules.requiredIfNot && this.isEmpty(sanitizedData[rules.requiredIfNot]) && this.isEmpty(value)) {
        errors.push({
          field,
          message: `Either ${this.formatFieldName(field)} or ${this.formatFieldName(rules.requiredIfNot)} is required`,
          code: 'CONDITIONAL_REQUIRED'
        })
      }
    })

    return {
      valid: errors.length === 0,
      errors,
      sanitizedData
    }
  }

  static validateType(value, type, field) {
    switch (type) {
      case 'email':
        if (!this.isValidEmail(value)) {
          return {
            field,
            message: `${this.formatFieldName(field)} must be a valid email address`,
            code: 'INVALID_EMAIL'
          }
        }
        break
      case 'phone':
        if (!this.isValidPhone(value)) {
          return {
            field,
            message: `${this.formatFieldName(field)} must be a valid phone number`,
            code: 'INVALID_PHONE'
          }
        }
        break
      case 'date':
        if (!this.isValidDate(value)) {
          return {
            field,
            message: `${this.formatFieldName(field)} must be a valid date`,
            code: 'INVALID_DATE'
          }
        }
        break
      case 'number':
        if (isNaN(value) || !isFinite(value)) {
          return {
            field,
            message: `${this.formatFieldName(field)} must be a valid number`,
            code: 'INVALID_NUMBER'
          }
        }
        break
      case 'url':
        if (!this.isValidUrl(value)) {
          return {
            field,
            message: `${this.formatFieldName(field)} must be a valid URL`,
            code: 'INVALID_URL'
          }
        }
        break
      case 'uuid':
        if (!this.isValidUUID(value)) {
          return {
            field,
            message: `${this.formatFieldName(field)} must be a valid UUID`,
            code: 'INVALID_UUID'
          }
        }
        break
    }
    return null
  }

  static isEmpty(value) {
    return value === undefined || 
           value === null || 
           value === '' || 
           (Array.isArray(value) && value.length === 0) ||
           (typeof value === 'string' && value.trim() === '')
  }

  // Enhanced email validation with security checks
  static isValidEmail(email) {
    if (typeof email !== 'string' || email.length > 254) return false
    
    // RFC 5322 compliant regex (simplified but secure)
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    
    if (!emailRegex.test(email)) return false
    
    // Additional security checks
    const [localPart, domain] = email.split('@')
    
    // Check for suspicious patterns
    if (localPart.includes('..') || localPart.startsWith('.') || localPart.endsWith('.')) {
      return false
    }
    
    // Check domain length
    if (domain.length > 253) return false
    
    return true
  }

  // Enhanced phone validation
  static isValidPhone(phone) {
    if (typeof phone !== 'string' || phone.length > 20) return false
    
    // Remove formatting characters
    const cleanPhone = phone.replace(/[\s\-().\+]/g, '')
    
    // Check if it's a valid phone number (7-15 digits, may start with +)
    const phoneRegex = /^(\+?1?)?[0-9]{7,15}$/
    return phoneRegex.test(cleanPhone)
  }

  static isValidDate(date) {
    if (!date) return false
    
    let dateObj
    if (date instanceof Date) {
      dateObj = date
    } else if (typeof date === 'string') {
      dateObj = new Date(date)
    } else {
      return false
    }
    
    // Check if date is valid and not in the far future/past (security)
    const now = new Date()
    const minDate = new Date('1900-01-01')
    const maxDate = new Date(now.getFullYear() + 100, 11, 31)
    
    return !isNaN(dateObj.getTime()) && 
           dateObj >= minDate && 
           dateObj <= maxDate
  }

  static isValidUrl(url) {
    if (typeof url !== 'string' || url.length > 2048) return false
    
    try {
      const urlObj = new URL(url)
      
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return false
      }
      
      // Prevent localhost/private IPs in production
      const hostname = urlObj.hostname.toLowerCase()
      if (hostname === 'localhost' || 
          hostname.startsWith('127.') || 
          hostname.startsWith('192.168.') ||
          hostname.startsWith('10.') ||
          hostname.match(/^172\.(1[6-9]|2[0-9]|3[01])\./)) {
        return process.env.NODE_ENV === 'development'
      }
      
      return true
    } catch {
      return false
    }
  }

  static isValidUUID(uuid) {
    if (typeof uuid !== 'string') return false
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }

  static formatFieldName(field) {
    return field
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .toLowerCase()
      .replace(/^\w/, c => c.toUpperCase())
  }

  // Enhanced password validation with security requirements
  static validatePassword(password) {
    const errors = []

    if (!password) {
      errors.push('Password is required')
      return errors
    }

    // Length requirements
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }
    
    if (password.length > 128) {
      errors.push('Password must be no more than 128 characters long')
    }

    // Character requirements
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number')
    }

    if (!/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?])/.test(password)) {
      errors.push('Password must contain at least one special character')
    }

    // Security checks
    const commonPasswords = [
      'password', '123456', '12345678', 'qwerty', 'abc123', 
      'password123', 'admin', 'letmein', 'welcome', 'monkey'
    ]
    
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common. Please choose a more secure password')
    }

    // Check for repeated characters
    if (/(.)\1{3,}/.test(password)) {
      errors.push('Password cannot contain more than 3 consecutive identical characters')
    }

    return errors
  }

  // Enhanced serial number validation
  static validateSerialNumber(serialNumber, existingSerials = []) {
    const errors = []

    if (!serialNumber || serialNumber.trim() === '') {
      errors.push('Serial number is required')
      return errors
    }

    const cleaned = serialNumber.trim()

    // Length validation
    if (cleaned.length < 3) {
      errors.push('Serial number must be at least 3 characters long')
    }

    if (cleaned.length > 50) {
      errors.push('Serial number must be no more than 50 characters long')
    }

    // Format validation (alphanumeric, dashes, spaces, underscores only)
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(cleaned)) {
      errors.push('Serial number can only contain letters, numbers, spaces, dashes, and underscores')
    }

    // Check for duplicates (case insensitive)
    const existingLowercase = existingSerials.map(s => s.toLowerCase())
    if (existingLowercase.includes(cleaned.toLowerCase())) {
      errors.push('This serial number is already in use')
    }

    // Security: Prevent obviously fake or test serials
    const suspiciousPatterns = ['test', '1234', 'abcd', 'sample', 'demo']
    if (suspiciousPatterns.some(pattern => cleaned.toLowerCase().includes(pattern))) {
      errors.push('Serial number appears to be a test or placeholder value')
    }

    return errors
  }

  // Enhanced department name validation
  static validateDepartmentName(name, existingNames = []) {
    const errors = []

    if (!name || name.trim() === '') {
      errors.push('Department name is required')
      return errors
    }

    const cleaned = name.trim()

    // Length validation
    if (cleaned.length < 2) {
      errors.push('Department name must be at least 2 characters long')
    }

    if (cleaned.length > 100) {
      errors.push('Department name must be no more than 100 characters long')
    }

    // Character validation (allow letters, numbers, spaces, hyphens, apostrophes)
    if (!/^[a-zA-Z0-9\s\-'\.]+$/.test(cleaned)) {
      errors.push('Department name can only contain letters, numbers, spaces, hyphens, periods, and apostrophes')
    }

    // Check for duplicates (case insensitive)
    const existingLowercase = existingNames.map(n => n.toLowerCase())
    if (existingLowercase.includes(cleaned.toLowerCase())) {
      errors.push('This department name is already taken')
    }

    // Security: Prevent suspicious names
    const suspiciousWords = ['test', 'demo', 'sample', 'admin', 'system']
    if (suspiciousWords.some(word => cleaned.toLowerCase().includes(word))) {
      errors.push('Department name cannot contain reserved words')
    }

    return errors
  }
}

// Enhanced validation schemas with security constraints
ValidationService.equipmentSchema = {
  name: { 
    required: true, 
    minLength: 1, 
    maxLength: 255,
    pattern: /^[a-zA-Z0-9\s\-_'.()]+$/,
    patternMessage: 'Equipment name contains invalid characters'
  },
  serialNumber: { 
    required: true, 
    minLength: 3, 
    maxLength: 50,
    pattern: /^[a-zA-Z0-9\s\-_]+$/,
    patternMessage: 'Serial number can only contain letters, numbers, spaces, dashes, and underscores'
  },
  category: { 
    required: true,
    enum: ['breathing', 'ppe', 'rescue', 'detection', 'apparatus', 'pumps', 'hose', 'communications', 'medical', 'ventilation', 'electrical', 'other']
  },
  stationId: { 
    required: true,
    type: 'uuid'
  },
  status: { 
    required: true, 
    enum: ['in-service', 'out-of-service', 'out-for-repair', 'cannot-locate', 'in-training', 'other'] 
  },
  notes: {
    maxLength: 2000
  }
}

ValidationService.stationSchema = {
  name: { 
    required: true, 
    minLength: 2, 
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-'.]+$/,
    patternMessage: 'Station name contains invalid characters'
  },
  address: { 
    maxLength: 500 
  },
  phone: { 
    type: 'phone', 
    maxLength: 20 
  }
}

ValidationService.userSchema = {
  email: { 
    required: true, 
    type: 'email',
    maxLength: 254
  },
  firstName: { 
    required: true, 
    minLength: 1, 
    maxLength: 50,
    pattern: /^[a-zA-Z\s\-'.]+$/,
    patternMessage: 'First name can only contain letters, spaces, hyphens, periods, and apostrophes'
  },
  lastName: { 
    required: true, 
    minLength: 1, 
    maxLength: 50,
    pattern: /^[a-zA-Z\s\-'.]+$/,
    patternMessage: 'Last name can only contain letters, spaces, hyphens, periods, and apostrophes'
  },
  role: { 
    required: true, 
    enum: ['fire-chief', 'assistant-chief', 'captain', 'lieutenant', 'firefighter', 'inspector'] 
  },
  phone: { 
    type: 'phone', 
    maxLength: 20 
  }
}

ValidationService.departmentSchema = {
  name: { 
    required: true, 
    minLength: 2, 
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-'.]+$/,
    patternMessage: 'Department name can only contain letters, numbers, spaces, hyphens, periods, and apostrophes'
  },
  adminEmail: { 
    required: true, 
    type: 'email',
    maxLength: 254
  }
}

ValidationService.inspectionSchema = {
  name: { 
    required: true, 
    minLength: 1, 
    maxLength: 255,
    pattern: /^[a-zA-Z0-9\s\-_'.()]+$/,
    patternMessage: 'Inspection name contains invalid characters'
  },
  dueDate: { 
    required: true, 
    type: 'date' 
  },
  equipmentId: { 
    requiredIfNot: 'category',
    type: 'uuid'
  },
  category: { 
    requiredIfNot: 'equipmentId',
    enum: ['breathing', 'ppe', 'rescue', 'detection', 'apparatus', 'pumps', 'hose', 'communications', 'medical', 'ventilation', 'electrical', 'other']
  },
  notes: {
    maxLength: 2000
  }
}

export default ValidationService