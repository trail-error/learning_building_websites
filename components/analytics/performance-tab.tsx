"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Calendar, TrendingUp, Clock } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { useAuth } from "@/contexts/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import moment from "moment-timezone"
import { TIMEZONE, formatDateInCentralTime } from "@/lib/utils"

interface HistoricalPod {
  id: string
  pod: string
  lcmComplete: string
  slaCalculatedNbd: string
  org: string
  podProgramType: string
  podTypeOriginal: string
  completedDate: string | null
  totalElapsedCycleTime: number
  workableCycleTime: number
}

interface LcmCompleteByMonth {
  monthYear: string
  count: number
  displayName: string
}

interface LcmVsSlaData {
  pod: string
  lcmComplete: number // timestamp
  slaNbd: number // timestamp
  lcmCompleteDate: string // original date
  slaNbdDate: string // original date
  daysDifference: number
  org: string
  podProgramType: string
  totalElapsedCycleTime: number
  workableCycleTime: number
  lcmCompleteFormatted: string
  slaNbdFormatted: string
}

interface PerformanceData {
  historicalPods: HistoricalPod[]
  lcmCompleteByMonth: LcmCompleteByMonth[]
  lcmVsSlaData: LcmVsSlaData[]
  totalCount: number
}

export function PerformanceTab() {
  const { user, loading: authLoading } = useAuth()
  const [data, setData] = useState<PerformanceData | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchPerformanceData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/analytics/performance')
      if (response.ok) {
        const result = await response.json()
        console.log("Performance data:", result)
        setData(result)
      }
    } catch (error) {
      console.error("Error fetching performance data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchPerformanceData()
    }
  }, [user])

  if (authLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Performance Analytics</h1>
            <p className="text-sm text-muted-foreground">Analytics / Performance</p>
          </div>
        </div>
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading performance analytics...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Performance Analytics</h1>
          <p className="text-sm text-muted-foreground">Analytics / Performance</p>
        </div>
      </div>


      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LCM Complete by Month */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              LCM Complete by Month
            </CardTitle>
            <CardDescription>
              Number of PODs completed by LCM each month
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : data?.lcmCompleteByMonth.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.lcmCompleteByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="displayName" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <div className="text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No Data Available</p>
                  <p className="text-sm">No LCM completion data found</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* LCM Complete vs SLA NBD Scatter Plot */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              LCM Complete vs SLA NBD
            </CardTitle>
            <CardDescription>
              Scatter plot showing relationship between SLA deadlines and actual completion dates
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : data?.lcmVsSlaData.length ? (
              <div className="w-full">
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Found {data.lcmVsSlaData.length} PODs</strong> with both LCM completion and SLA deadline data
                  </p>
                </div>
                <div className="w-full h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                      data={data.lcmVsSlaData}
                      margin={{ top: 20, right: 30, left: 80, bottom: 80 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="slaNbd"
                        type="number"
                        scale="time"
                        domain={['dataMin - 86400000', 'dataMax + 86400000']}
                        tickFormatter={(value) => moment(value).format('MMM DD, YY')}
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        label={{ 
                          value: 'SLA NBD', 
                          position: 'insideBottom', 
                          offset: -10,
                          style: { textAnchor: 'middle', fontSize: '14px', fontWeight: 'bold' }
                        }}
                      />
                      <YAxis 
                        dataKey="lcmComplete"
                        type="number"
                        scale="time"
                        domain={['dataMin - 86400000', 'dataMax + 86400000']}
                        tickFormatter={(value) => moment(value).format('MMM DD, YY')}
                        tick={{ fontSize: 12 }}
                        width={100}
                        label={{ 
                          value: 'LCM Complete', 
                          angle: -90, 
                          position: 'insideLeft',
                          offset: -10,
                          style: { textAnchor: 'middle', fontSize: '14px', fontWeight: 'bold' }
                        }}
                      />
                      <Tooltip 
                        formatter={(value, name, props) => [
                          moment(value as number).format('MMM DD, YYYY'),
                          name === 'lcmComplete' ? 'LCM Complete' : 'SLA NBD'
                        ]}
                        labelFormatter={(label, payload) => {
                          if (payload && payload.length > 0) {
                            return `POD: ${payload[0].payload.pod}`
                          }
                          return `POD: ${label}`
                        }}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      {/* Connect each POD's coordinates with a line */}
                      <Line 
                        type="monotone" 
                        dataKey="lcmComplete" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                        name="LCM Complete"
                        connectNulls={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No Data Available</p>
                  <p className="text-sm">No LCM vs SLA data found</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Table */}
      {data?.lcmVsSlaData.length && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Details</CardTitle>
            <CardDescription>
              Detailed view of LCM completion vs SLA performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">POD</th>
                    <th className="text-left p-2">LCM Complete</th>
                    <th className="text-left p-2">SLA NBD</th>
                    <th className="text-left p-2">Days Difference</th>
                    <th className="text-left p-2">Org</th>
                    <th className="text-left p-2">Program Type</th>
                  </tr>
                </thead>
                <tbody>
                  {data.lcmVsSlaData.slice(0, 10).map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2 font-medium">{item.pod}</td>
                      <td className="p-2">{formatDateInCentralTime(item.lcmCompleteDate)}</td>
                      <td className="p-2">{formatDateInCentralTime(item.slaNbdDate)}</td>
                      <td className={`p-2 ${item.daysDifference <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.daysDifference > 0 ? '+' : ''}{item.daysDifference} days
                      </td>
                      <td className="p-2">{item.org}</td>
                      <td className="p-2">{item.podProgramType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
