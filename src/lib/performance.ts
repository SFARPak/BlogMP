// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number[]> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // Record a performance metric
  recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    this.metrics.get(name)!.push(value)

    // Keep only last 100 measurements
    const measurements = this.metrics.get(name)!
    if (measurements.length > 100) {
      measurements.shift()
    }
  }

  // Get average for a metric
  getAverage(name: string): number {
    const measurements = this.metrics.get(name)
    if (!measurements || measurements.length === 0) return 0

    return measurements.reduce((sum, val) => sum + val, 0) / measurements.length
  }

  // Get all metrics
  getAllMetrics() {
    const result: Record<string, { average: number; count: number; latest: number }> = {}

    for (const [name, measurements] of this.metrics.entries()) {
      result[name] = {
        average: this.getAverage(name),
        count: measurements.length,
        latest: measurements[measurements.length - 1] || 0
      }
    }

    return result
  }

  // Clear all metrics
  clear() {
    this.metrics.clear()
  }
}

// Performance measurement utilities
export const measureExecutionTime = async <T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> => {
  const start = performance.now()
  try {
    const result = await fn()
    const end = performance.now()
    PerformanceMonitor.getInstance().recordMetric(name, end - start)
    return result
  } catch (error) {
    const end = performance.now()
    PerformanceMonitor.getInstance().recordMetric(`${name}_error`, end - start)
    throw error
  }
}

export const measureSyncExecutionTime = <T>(
  name: string,
  fn: () => T
): T => {
  const start = performance.now()
  try {
    const result = fn()
    const end = performance.now()
    PerformanceMonitor.getInstance().recordMetric(name, end - start)
    return result
  } catch (error) {
    const end = performance.now()
    PerformanceMonitor.getInstance().recordMetric(`${name}_error`, end - start)
    throw error
  }
}

// Database query performance wrapper
export const measureDatabaseQuery = async <T>(
  queryName: string,
  query: () => Promise<T>
): Promise<T> => {
  return measureExecutionTime(`db_${queryName}`, query)
}

// API response time measurement
export const measureAPIResponse = async <T>(
  endpoint: string,
  handler: () => Promise<T>
): Promise<T> => {
  return measureExecutionTime(`api_${endpoint}`, handler)
}

// Memory usage monitoring
export const getMemoryUsage = () => {
  if (typeof performance !== 'undefined' && (performance as any).memory) {
    const mem = (performance as any).memory
    return {
      used: Math.round(mem.usedJSHeapSize / 1024 / 1024),
      total: Math.round(mem.totalJSHeapSize / 1024 / 1024),
      limit: Math.round(mem.jsHeapSizeLimit / 1024 / 1024)
    }
  }
  return null
}

// Performance reporting
export const generatePerformanceReport = () => {
  const monitor = PerformanceMonitor.getInstance()
  const metrics = monitor.getAllMetrics()
  const memory = getMemoryUsage()

  return {
    timestamp: new Date().toISOString(),
    metrics,
    memory,
    cacheStats: {
      // Add cache statistics here if needed
    }
  }
}

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  API_RESPONSE_TIME: 1000, // 1 second
  DATABASE_QUERY_TIME: 500, // 500ms
  PAGE_LOAD_TIME: 3000, // 3 seconds
  IMAGE_LOAD_TIME: 2000 // 2 seconds
}

// Performance alerts
export const checkPerformanceThresholds = () => {
  const monitor = PerformanceMonitor.getInstance()
  const alerts: string[] = []

  const apiResponseTime = monitor.getAverage('api_response')
  if (apiResponseTime > PERFORMANCE_THRESHOLDS.API_RESPONSE_TIME) {
    alerts.push(`API response time (${apiResponseTime.toFixed(2)}ms) exceeds threshold`)
  }

  const dbQueryTime = monitor.getAverage('db_query')
  if (dbQueryTime > PERFORMANCE_THRESHOLDS.DATABASE_QUERY_TIME) {
    alerts.push(`Database query time (${dbQueryTime.toFixed(2)}ms) exceeds threshold`)
  }

  return alerts
}
