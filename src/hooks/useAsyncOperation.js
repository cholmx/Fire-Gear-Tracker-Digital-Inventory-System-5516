import { useState, useCallback } from 'react'
import { toast } from '../lib/toast'

export const useAsyncOperation = (operation, options = {}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await operation(...args)
      setData(result)
      
      if (options.successMessage) {
        toast.success(options.successMessage)
      }
      
      return { success: true, data: result }
      
    } catch (error) {
      console.error('Async operation error:', error)
      setError(error)
      
      if (options.showErrorToast !== false) {
        toast.error(error.message || 'Operation failed')
      }
      
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }, [operation, options.successMessage, options.showErrorToast])

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
    setData(null)
  }, [])

  return {
    loading,
    error,
    data,
    execute,
    reset
  }
}

// Hook for form operations with validation
export const useFormOperation = (submitFn, validationFn, options = {}) => {
  const [formData, setFormData] = useState(options.initialData || {})
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }, [errors])

  const validateForm = useCallback(() => {
    if (!validationFn) return true
    
    const validation = validationFn(formData)
    setErrors(validation.errors || {})
    return validation.valid
  }, [formData, validationFn])

  const submit = useCallback(async (e) => {
    if (e) e.preventDefault()
    
    if (!validateForm()) {
      return { success: false, errors }
    }

    try {
      setLoading(true)
      const result = await submitFn(formData)
      
      if (options.resetOnSuccess !== false) {
        setFormData(options.initialData || {})
        setErrors({})
      }
      
      if (options.successMessage) {
        toast.success(options.successMessage)
      }
      
      return { success: true, data: result }
      
    } catch (error) {
      console.error('Form submission error:', error)
      
      if (options.showErrorToast !== false) {
        toast.error(error.message || 'Form submission failed')
      }
      
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }, [formData, validateForm, submitFn, errors, options])

  const reset = useCallback(() => {
    setFormData(options.initialData || {})
    setErrors({})
    setLoading(false)
  }, [options.initialData])

  return {
    formData,
    errors,
    loading,
    updateField,
    submit,
    reset,
    setFormData,
    setErrors
  }
}

export default useAsyncOperation