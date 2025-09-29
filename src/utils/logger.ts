// Centralized logging utility for admin2 section
export const logger = {
  info: (component: string, message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(`[${component}] ${message}`, data || '')
    }
  },
  
  warn: (component: string, message: string, data?: any) => {
    console.warn(`[${component}] ${message}`, data || '')
  },
  
  error: (component: string, message: string, error?: any) => {
    console.error(`[${component}] ${message}`, error || '')
  },
  
  debug: (component: string, message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${component}] ${message}`, data || '')
    }
  }
}

