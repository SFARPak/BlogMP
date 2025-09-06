"use client"

import { useState, useEffect } from 'react'
import { PerformanceMonitor as PerfMonitor, generatePerformanceReport, checkPerformanceThresholds } from '@/lib/performance'
import { Activity, AlertTriangle, TrendingUp, Zap } from 'lucide-react'

export function PerformanceMonitorComponent() {
  const [metrics, setMetrics] = useState<any>({})
  const [alerts, setAlerts] = useState<string[]>([])
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const updateMetrics = () => {
      const report = generatePerformanceReport()
      setMetrics(report.metrics)
      setAlerts(checkPerformanceThresholds())
    }

    updateMetrics()
    const interval = setInterval(updateMetrics, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (value: number, threshold: number) => {
    if (value > threshold) return 'text-red-600'
    if (value > threshold * 0.8) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div
        className="p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Activity className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-medium text-gray-900">Performance Monitor</h3>
              <p className="text-xs text-gray-600">Real-time metrics</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {alerts.length > 0 && (
              <div className="flex items-center text-red-600">
                <AlertTriangle className="w-4 h-4 mr-1" />
                <span className="text-xs">{alerts.length}</span>
              </div>
            )}
            <TrendingUp className={`w-4 h-4 ${isExpanded ? 'transform rotate-180' : ''}`} />
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 p-4">
          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1 text-red-600" />
                Performance Alerts
              </h4>
              <div className="space-y-1">
                {alerts.map((alert, index) => (
                  <div key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                    {alert}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(metrics).map(([key, data]: [string, any]) => (
              <div key={key} className="bg-gray-50 p-3 rounded">
                <div className="text-xs text-gray-600 mb-1">{key.replace(/_/g, ' ')}</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {data.average.toFixed(2)}ms
                  </span>
                  <span className={`text-xs ${getStatusColor(data.average, 1000)}`}>
                    {data.count} calls
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Cache Stats */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
              <Zap className="w-4 h-4 mr-1 text-green-600" />
              Cache Performance
            </h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-green-50 p-2 rounded text-center">
                <div className="font-medium text-green-700">Posts Cache</div>
                <div className="text-green-600">Active</div>
              </div>
              <div className="bg-blue-50 p-2 rounded text-center">
                <div className="font-medium text-blue-700">User Cache</div>
                <div className="text-blue-600">Active</div>
              </div>
              <div className="bg-purple-50 p-2 rounded text-center">
                <div className="font-medium text-purple-700">Search Cache</div>
                <div className="text-purple-600">Active</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
