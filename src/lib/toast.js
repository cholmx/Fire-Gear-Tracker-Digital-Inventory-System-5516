// Toast notification system for user feedback
class ToastManager {
  constructor() {
    this.toasts = []
    this.container = null
    this.init()
  }
  
  init() {
    // Create toast container if it doesn't exist
    if (!this.container) {
      this.container = document.createElement('div')
      this.container.id = 'toast-container'
      this.container.className = 'fixed top-4 right-4 z-50 space-y-2'
      document.body.appendChild(this.container)
    }
  }
  
  show(message, type = 'info', duration = 5000) {
    const toast = {
      id: Date.now(),
      message,
      type,
      duration
    }
    
    this.toasts.push(toast)
    this.render(toast)
    
    // Auto-remove toast
    setTimeout(() => {
      this.remove(toast.id)
    }, duration)
    
    return toast.id
  }
  
  success(message, duration = 4000) {
    return this.show(message, 'success', duration)
  }
  
  error(message, duration = 6000) {
    return this.show(message, 'error', duration)
  }
  
  warning(message, duration = 5000) {
    return this.show(message, 'warning', duration)
  }
  
  info(message, duration = 4000) {
    return this.show(message, 'info', duration)
  }
  
  render(toast) {
    const toastEl = document.createElement('div')
    toastEl.id = `toast-${toast.id}`
    toastEl.className = this.getToastClasses(toast.type)
    
    const icon = this.getIcon(toast.type)
    
    toastEl.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="flex-shrink-0">
          ${icon}
        </div>
        <div class="flex-1 text-sm font-inter text-white">
          ${toast.message}
        </div>
        <button onclick="window.toastManager.remove(${toast.id})" class="flex-shrink-0 text-white hover:text-gray-300">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `
    
    // Add animation
    toastEl.style.transform = 'translateX(100%)'
    toastEl.style.transition = 'transform 0.3s ease-in-out'
    
    this.container.appendChild(toastEl)
    
    // Trigger animation
    setTimeout(() => {
      toastEl.style.transform = 'translateX(0)'
    }, 10)
  }
  
  remove(id) {
    const toastEl = document.getElementById(`toast-${id}`)
    if (toastEl) {
      toastEl.style.transform = 'translateX(100%)'
      setTimeout(() => {
        if (toastEl.parentNode) {
          toastEl.parentNode.removeChild(toastEl)
        }
      }, 300)
    }
    
    this.toasts = this.toasts.filter(toast => toast.id !== id)
  }
  
  getToastClasses(type) {
    const baseClasses = 'max-w-sm p-4 rounded-lg shadow-lg border backdrop-blur-sm'
    
    switch (type) {
      case 'success':
        return `${baseClasses} bg-green-900/90 border-green-700`
      case 'error':
        return `${baseClasses} bg-red-900/90 border-red-700`
      case 'warning':
        return `${baseClasses} bg-yellow-900/90 border-yellow-700`
      default:
        return `${baseClasses} bg-blue-900/90 border-blue-700`
    }
  }
  
  getIcon(type) {
    switch (type) {
      case 'success':
        return '<svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>'
      case 'error':
        return '<svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>'
      case 'warning':
        return '<svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path></svg>'
      default:
        return '<svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
    }
  }
}

// Global toast manager
const toastManager = new ToastManager()

// Make it globally available
window.toastManager = toastManager

export const toast = toastManager
export default toast