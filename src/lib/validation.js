// Comprehensive validation library
export class ValidationService {
  static validate(data, schema) {
    const errors = []

    Object.entries(schema).forEach(([field, rules]) => {
      const value = data[field]

      // Required field validation
      if (rules.required && this.isEmpty(value)) {
        errors.push({
          field,
          message: `${this.formatFieldName(field)} is required`
        })
        return
      }

      // Skip further validation if field is empty and not required
      if (this.isEmpty(value)) return

      // Type validation
      if (rules.type) {
        const typeError = this.validateType(value, rules.type, field)
        if (typeError) errors.push(typeError)
      }

      // Length validation
      if (rules.minLength && value.length < rules.minLength) {
        errors.push({
          field,
          message: `${this.formatFieldName(field)} must be at least ${rules.minLength} characters`
        })
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push({
          field,
          message: `${this.formatFieldName(field)} must be no more than ${rules.maxLength} characters`
        })
      }

      // Enum validation
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push({
          field,
          message: `${this.formatFieldName(field)} must be one of: ${rules.enum.join(', ')}`
        })
      }

      // Conditional required validation
      if (rules.requiredIfNot && this.isEmpty(data[rules.requiredIfNot]) && this.isEmpty(value)) {
        errors.push({
          field,
          message: `Either ${this.formatFieldName(field)} or ${this.formatFieldName(rules.requiredIfNot)} is required`
        })
      }
    })

    return {
      valid: errors.length === 0,
      errors
    }
  }

  static validateType(value, type, field) {
    switch (type) {
      case 'email':
        if (!this.isValidEmail(value)) {
          return {
            field,
            message: `${this.formatFieldName(field)} must be a valid email address`
          }
        }
        break
      case 'phone':
        if (!this.isValidPhone(value)) {
          return {
            field,
            message: `${this.formatFieldName(field)} must be a valid phone number`
          }
        }
        break
      case 'date':
        if (!this.isValidDate(value)) {
          return {
            field,
            message: `${this.formatFieldName(field)} must be a valid date`
          }
        }
        break
      case 'number':
        if (isNaN(value)) {
          return {
            field,
            message: `${this.formatFieldName(field)} must be a number`
          }
        }
        break
      case 'url':
        if (!this.isValidUrl(value)) {
          return {
            field,
            message: `${this.formatFieldName(field)} must be a valid URL`
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
           (Array.isArray(value) && value.length === 0)
  }

  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  static isValidPhone(phone) {
    // Remove formatting characters
    const cleanPhone = phone.replace(/[\s\-()]/g, '')
    
    // Check if it's a valid phone number (10-15 digits)
    const phoneRegex = /^\d{10,15}$/
    return phoneRegex.test(cleanPhone)
  }

  static isValidDate(date) {
    if (date instanceof Date) {
      return !isNaN(date.getTime())
    }
    
    if (typeof date === 'string') {
      const parsedDate = new Date(date)
      return !isNaN(parsedDate.getTime())
    }
    
    return false
  }

  static isValidUrl(url) {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  static formatFieldName(field) {
    return field
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .toLowerCase()
      .replace(/^\w/, c => c.toUpperCase())
  }

  // Custom validators
  static validateSerialNumber(serialNumber, existingSerials = []) {
    const errors = []

    if (!serialNumber || serialNumber.trim() === '') {
      errors.push('Serial number is required')
    } else {
      // Check for duplicates
      if (existingSerials.includes(serialNumber.trim())) {
        errors.push('This serial number is already in use')
      }

      // Check format (alphanumeric, dashes, spaces allowed)
      if (!/^[a-zA-Z0-9\s\-_]+$/.test(serialNumber)) {
        errors.push('Serial number can only contain letters, numbers, spaces, dashes, and underscores')
      }
    }

    return errors
  }

  static validatePassword(password) {
    const errors = []

    if (!password) {
      errors.push('Password is required')
      return errors
    }

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }

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

    return errors
  }

  static validateDepartmentName(name, existingNames = []) {
    const errors = []

    if (!name || name.trim() === '') {
      errors.push('Department name is required')
    } else {
      if (name.trim().length < 2) {
        errors.push('Department name must be at least 2 characters long')
      }

      if (existingNames.includes(name.trim().toLowerCase())) {
        errors.push('This department name is already taken')
      }
    }

    return errors
  }

  // Sanitization
  static sanitizeInput(input) {
    if (typeof input !== 'string') return input

    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
  }

  static sanitizeObject(obj) {
    const sanitized = {}

    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeInput(value)
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => 
          typeof item === 'string' ? this.sanitizeInput(item) : item
        )
      } else {
        sanitized[key] = value
      }
    })

    return sanitized
  }
}

// Equipment validation schema
ValidationService.equipmentSchema = {
  name: { required: true, minLength: 1, maxLength: 255 },
  serial_number: { required: true, minLength: 1, maxLength: 100 },
  category: { required: true },
  station_id: { required: true },
  status: { 
    required: true, 
    enum: ['in-service', 'out-of-service', 'out-for-repair', 'cannot-locate', 'in-training', 'other'] 
  }
}

// Station validation schema
ValidationService.stationSchema = {
  name: { required: true, minLength: 1, maxLength: 255 },
  address: { maxLength: 500 },
  phone: { type: 'phone', maxLength: 20 }
}

// User validation schema
ValidationService.userSchema = {
  email: { required: true, type: 'email' },
  first_name: { required: true, minLength: 1, maxLength: 100 },
  last_name: { required: true, minLength: 1, maxLength: 100 },
  role: { 
    required: true, 
    enum: ['fire-chief', 'assistant-chief', 'captain', 'lieutenant', 'firefighter', 'inspector'] 
  },
  phone: { type: 'phone', maxLength: 20 }
}

// Department validation schema
ValidationService.departmentSchema = {
  name: { required: true, minLength: 2, maxLength: 255 },
  admin_email: { required: true, type: 'email' }
}

// Inspection validation schema
ValidationService.inspectionSchema = {
  name: { required: true, minLength: 1, maxLength: 255 },
  due_date: { required: true, type: 'date' },
  equipment_id: { requiredIfNot: 'category' },
  category: { requiredIfNot: 'equipment_id' }
}

export default ValidationService