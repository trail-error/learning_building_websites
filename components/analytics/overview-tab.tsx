"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { getStatusColor } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { differenceInDays } from "date-fns"
import { X, Filter, RefreshCw, BarChart3, PieChartIcon, Users, AlertTriangle } from "lucide-react"

interface Pod {
  pod: string
  assignedEngineer: string
  priority: number
  status: string
  subStatus: string
  podTypeOriginal: string | null
  podProgramType: string | null
  slaCalculatedNbd: string | null
  creationTimestamp: string | null
  totalElapsedCycleTime: number | null
  workableCycleTime: number | null
  timeInCurrentStatus: string | null
  clli: string | null
  city: string | null
  state: string | null
  routerType: string | null
  router1: string | null
  router2: string | null
  tenantName: string | null
  currentLepVersion: string | null
  lepVersionToBeApplied: string | null
  podType: string | null
  special: boolean | null
  notes: string | null
  projectManagers: string | null
  linkToActiveTds: string | null
  linkToActivePreloads: string | null
  daysLate?: number
}

interface AnalyticsData {
  statusCounts: { name: string; value: number }[]
  subStatusCounts: { name: string; value: number }[]
  podTypeCounts: { name: string; value: number }[]
  podProgramTypeCounts: { name: string; value: number }[]
  latePods: Pod[]
  allPods: Pod[]
  totalPods: number
}

interface FilterState {
  selectedStatus: string | null
  selectedSubStatus: string | null
  selectedPodType: string | null
  selectedPodProgramType: string | null
}

interface LoadingState {
  metrics: boolean
  statusChart: boolean
  subStatusChart: boolean
  podTypeChart: boolean
  podProgramTypeChart: boolean
  podsList: boolean
  latePods: boolean
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FF6B6B",
  "#6A7FDB",
  "#61DAFB",
  "#FF9AA2",
  "#B5EAD7",
  "#C7CEEA",
  "#E2F0CB",
  "#FFDAC1",
  "#FFB7B2",
]

const LoadingCard = ({ title, description, icon: Icon }: { title: string; description: string; icon: any }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Icon className="h-5 w-5" />
        {title}
      </CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="h-[400px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading {title.toLowerCase()}...</p>
      </div>
    </CardContent>
  </Card>
)

const MetricsLoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    {[1, 2, 3, 4].map((i) => (
      <Card key={i}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    ))}
  </div>
)

const TableLoadingSkeleton = ({ title, description }: { title: string; description: string }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">Loading {title.toLowerCase()}...</span>
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
)

// Helper function to calculate analytics from POD data
const calculateAnalytics = (pods: Pod[], filters: FilterState): AnalyticsData => {
  // Apply filters to get filtered PODs
  const filteredPods = pods.filter(pod => {
    if (filters.selectedStatus && pod.status !== filters.selectedStatus) return false
    if (filters.selectedSubStatus && pod.subStatus !== filters.selectedSubStatus) return false
    if (filters.selectedPodType && (pod.podTypeOriginal || "Not Set") !== filters.selectedPodType) return false
    if (filters.selectedPodProgramType && (pod.podProgramType || "Not Set") !== filters.selectedPodProgramType) return false
    return true
  })

  // Calculate status counts
  const statusMap = new Map<string, number>()
  filteredPods.forEach(pod => {
    const status = pod.status
    statusMap.set(status, (statusMap.get(status) || 0) + 1)
  })
  const statusCounts = Array.from(statusMap.entries()).map(([name, value]) => ({ name, value }))

  // Calculate sub-status counts
  const subStatusMap = new Map<string, number>()
  filteredPods.forEach(pod => {
    const subStatus = pod.subStatus
    subStatusMap.set(subStatus, (subStatusMap.get(subStatus) || 0) + 1)
  })
  const subStatusCounts = Array.from(subStatusMap.entries()).map(([name, value]) => ({ name, value }))

  // Calculate pod type counts
  const podTypeMap = new Map<string, number>()
  filteredPods.forEach(pod => {
    const podType = pod.podTypeOriginal || "Not Set"
    podTypeMap.set(podType, (podTypeMap.get(podType) || 0) + 1)
  })
  const podTypeCounts = Array.from(podTypeMap.entries()).map(([name, value]) => ({ name, value }))

  // Calculate pod program type counts
  const podProgramTypeMap = new Map<string, number>()
  filteredPods.forEach(pod => {
    const podProgramType = pod.podProgramType || "Not Set"
    podProgramTypeMap.set(podProgramType, (podProgramTypeMap.get(podProgramType) || 0) + 1)
  })
  const podProgramTypeCounts = Array.from(podProgramTypeMap.entries()).map(([name, value]) => ({ name, value }))

  // Calculate late pods
  const today = new Date()
  const latePods = filteredPods
    .filter(pod => {
      return pod.slaCalculatedNbd && pod.status !== "Complete" && new Date(pod.slaCalculatedNbd) < today
    })
    .map(pod => {
      const daysLate = differenceInDays(today, new Date(pod.slaCalculatedNbd!))
      return {
        ...pod,
        daysLate,
        slaCalculatedNbd: pod.slaCalculatedNbd!.split("T")[0],
      }
    })
    .sort((a, b) => (b.daysLate || 0) - (a.daysLate || 0))

  // Prepare all pods details for the table
  const allPodsDetails = filteredPods.map(pod => ({
    ...pod,
    slaCalculatedNbd: pod.slaCalculatedNbd ? pod.slaCalculatedNbd.split("T")[0] : null,
    daysLate: pod.slaCalculatedNbd && pod.status !== "Complete" && new Date(pod.slaCalculatedNbd) < today
      ? differenceInDays(today, new Date(pod.slaCalculatedNbd))
      : 0,
  }))

  return {
    statusCounts,
    subStatusCounts,
    podTypeCounts,
    podProgramTypeCounts,
    latePods,
    allPods: allPodsDetails,
    totalPods: filteredPods.length,
  }
}

// Helper function to calculate workload distribution
const calculateWorkloadDistribution = (pods: Pod[]): Array<{
  engineer: string
  totalPods: number
  overduePods: number
  overduePercentage: number
  statusBreakdown: { [status: string]: number }
}> => {
  const today = new Date()
  const workloadMap = new Map<string, {
    totalPods: number
    overduePods: number
    statusBreakdown: { [status: string]: number }
  }>()

  pods.forEach(pod => {
    const engineer = pod.assignedEngineer
    if (!workloadMap.has(engineer)) {
      workloadMap.set(engineer, {
        totalPods: 0,
        overduePods: 0,
        statusBreakdown: {}
      })
    }

    const workload = workloadMap.get(engineer)!
    workload.totalPods++

    // Count status breakdown
    workload.statusBreakdown[pod.status] = (workload.statusBreakdown[pod.status] || 0) + 1

    // Check if overdue
    if (pod.slaCalculatedNbd && pod.status !== "Complete" && new Date(pod.slaCalculatedNbd) < today) {
      workload.overduePods++
    }
  })

  return Array.from(workloadMap.entries()).map(([engineer, data]) => ({
    engineer,
    totalPods: data.totalPods,
    overduePods: data.overduePods,
    overduePercentage: data.totalPods > 0 ? Math.round((data.overduePods / data.totalPods) * 100) : 0,
    statusBreakdown: data.statusBreakdown
  })).sort((a, b) => b.totalPods - a.totalPods) // Sort by total PODs descending
}

export function OverviewTab() {
  const { user } = useAuth()
  const [allPods, setAllPods] = useState<Pod[]>([])
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState<LoadingState>({
    metrics: true,
    statusChart: true,
    subStatusChart: true,
    podTypeChart: true,
    podProgramTypeChart: true,
    podsList: true,
    latePods: true,
  })
  const [filters, setFilters] = useState<FilterState>({
    selectedStatus: null,
    selectedSubStatus: null,
    selectedPodType: null,
    selectedPodProgramType: null,
  })

  // Fetch all PODs once on component mount
  const fetchAllPods = async () => {
    try {
      setLoading({
        metrics: true,
        statusChart: true,
        subStatusChart: true,
        podTypeChart: true,
        podProgramTypeChart: true,
        podsList: true,
        latePods: true,
      })

      const response = await fetch("/api/analytics")
      if (response.ok) {
        const data = await response.json()
        setAllPods(data.pods)
        console.log(`Loaded ${data.pods.length} PODs for frontend analytics`)
      } else {
        console.error("Failed to fetch PODs")
        setLoading({
          metrics: false,
          statusChart: false,
          subStatusChart: false,
          podTypeChart: false,
          podProgramTypeChart: false,
          podsList: false,
          latePods: false,
        })
      }
    } catch (error) {
      console.error("Error fetching PODs:", error)
      setLoading({
        metrics: false,
        statusChart: false,
        subStatusChart: false,
        podTypeChart: false,
        podProgramTypeChart: false,
        podsList: false,
        latePods: false,
      })
    }
  }

  // Calculate analytics whenever filters or PODs change
  useEffect(() => {
    if (allPods.length > 0) {
      const calculated = calculateAnalytics(allPods, filters)
      setAnalyticsData(calculated)

      // Simulate staggered loading for better UX
      setTimeout(() => setLoading((prev) => ({ ...prev, metrics: false })), 100)
      setTimeout(() => setLoading((prev) => ({ ...prev, statusChart: false })), 200)
      setTimeout(() => setLoading((prev) => ({ ...prev, subStatusChart: false })), 300)
      setTimeout(() => setLoading((prev) => ({ ...prev, podTypeChart: false })), 400)
      setTimeout(() => setLoading((prev) => ({ ...prev, podProgramTypeChart: false })), 500)
      setTimeout(() => setLoading((prev) => ({ ...prev, podsList: false })), 600)
      setTimeout(() => setLoading((prev) => ({ ...prev, latePods: false })), 700)
    }
  }, [allPods, filters])

  // Calculate workload distribution
  const workloadDistribution = allPods.length > 0 ? calculateWorkloadDistribution(allPods) : []

  useEffect(() => {
    if (user && allPods.length === 0) {
      fetchAllPods()
    }
  }, [user])

  const handleStatusClick = (data: any) => {
    const statusName = data.name
    const newStatus = filters.selectedStatus === statusName ? null : statusName

    setFilters({
      selectedStatus: newStatus,
      selectedSubStatus: null, // Reset substatus when status changes
      selectedPodType: null, // Reset pod type when status changes
      selectedPodProgramType: null, // Reset pod program type when status changes
    })
  }

  const handleSubStatusClick = (data: any) => {
    const subStatusName = data.name
    const newSubStatus = filters.selectedSubStatus === subStatusName ? null : subStatusName

    setFilters((prev) => ({
      ...prev,
      selectedSubStatus: newSubStatus,
    }))
  }

  const handlePodTypeClick = (data: any) => {
    const podTypeName = data.name
    const newPodType = filters.selectedPodType === podTypeName ? null : podTypeName

    setFilters((prev) => ({
      ...prev,
      selectedPodType: newPodType,
    }))
  }

  const handlePodProgramTypeClick = (data: any) => {
    const podProgramTypeName = data.name
    const newPodProgramType = filters.selectedPodProgramType === podProgramTypeName ? null : podProgramTypeName

    setFilters((prev) => ({
      ...prev,
      selectedPodProgramType: newPodProgramType,
    }))
  }

  const clearFilters = () => {
    setFilters({
      selectedStatus: null,
      selectedSubStatus: null,
      selectedPodType: null,
      selectedPodProgramType: null,
    })
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    if (percent < 0.05) return null // Don't show labels for slices less than 5%

    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" fontSize={10}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  // Custom tooltip for status chart to show filtered vs total
  const StatusTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const baseValue = baseAnalytics?.statusCounts.find((s: any) => s.name === label)?.value || 0
      const filteredValue = payload[0].value

      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm">
            <span className="text-blue-600">Total: {baseValue}</span>
          </p>
          {filters.selectedStatus && (
            <p className="text-sm">
              <span className="text-orange-600">Filtered: {filteredValue}</span>
            </p>
          )}
        </div>
      )
    }
    return null
  }

  if (!user) {
    return <div>Loading...</div>
  }

  const hasActiveFilters = filters.selectedStatus || filters.selectedSubStatus || filters.selectedPodType || filters.selectedPodProgramType

  // Calculate base analytics (no filters) for charts that are clicked
  const baseAnalytics = allPods.length > 0 ? calculateAnalytics(allPods, {
    selectedStatus: null,
    selectedSubStatus: null,
    selectedPodType: null,
    selectedPodProgramType: null,
  }) : null

  // Use base data for the chart that was clicked (for easy switching), filtered data for others
  const displayData = analyticsData
  
  // Status chart: use base data if status is selected, filtered data otherwise
  const statusChartData = filters.selectedStatus ? baseAnalytics?.statusCounts || [] : displayData?.statusCounts || []
  
  // Sub-status chart: use base data if sub-status is selected, filtered data otherwise  
  const subStatusChartData = filters.selectedSubStatus ? baseAnalytics?.subStatusCounts || [] : displayData?.subStatusCounts || []
  
  // Pod Type chart: use base data if pod type is selected, filtered data otherwise
  const podTypeChartData = filters.selectedPodType ? baseAnalytics?.podTypeCounts || [] : displayData?.podTypeCounts || []
  
  // Pod Program Type chart: use base data if pod program type is selected, filtered data otherwise
  const podProgramTypeChartData = filters.selectedPodProgramType ? baseAnalytics?.podProgramTypeCounts || [] : displayData?.podProgramTypeCounts || []

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      {hasActiveFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Active Filters:</span>
              {filters.selectedStatus && (
                <Badge variant="secondary" className="gap-1">
                  Status: {filters.selectedStatus}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setFilters((prev) => ({ ...prev, selectedStatus: null, selectedSubStatus: null }))}
                  />
                </Badge>
              )}
              {filters.selectedSubStatus && (
                <Badge variant="secondary" className="gap-1">
                  Sub-Status: {filters.selectedSubStatus}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setFilters((prev) => ({ ...prev, selectedSubStatus: null }))}
                  />
                </Badge>
              )}
              {filters.selectedPodType && (
                <Badge variant="secondary" className="gap-1">
                  Pod Type: {filters.selectedPodType}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setFilters((prev) => ({ ...prev, selectedPodType: null }))}
                  />
                </Badge>
              )}
              {filters.selectedPodProgramType && (
                <Badge variant="secondary" className="gap-1">
                  Pod Program Type: {filters.selectedPodProgramType}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setFilters((prev) => ({ ...prev, selectedPodProgramType: null }))}
                  />
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      {loading.metrics ? (
        <MetricsLoadingSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total PODs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{displayData?.totalPods || 0}</div>
              <p className="text-xs text-muted-foreground">
                {hasActiveFilters ? `Filtered (${allPods.length} total)` : "All PODs"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue PODs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{displayData?.latePods.length || 0}</div>
              <p className="text-xs text-muted-foreground">Past SLA date</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Statuses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusChartData.length}</div>
              <p className="text-xs text-muted-foreground">Different status types</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sub-Statuses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subStatusChartData.length || 0}</div>
              <p className="text-xs text-muted-foreground">Different sub-status types</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        {loading.statusChart ? (
          <LoadingCard title="Status Distribution" description="Loading status data..." icon={BarChart3} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Status Distribution</CardTitle>
              <CardDescription>
                Click on any status to drill down. All statuses remain visible for easy switching.
                {filters.selectedStatus && ` (Currently viewing: ${filters.selectedStatus})`}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChartData} margin={{bottom:60}}>
                  <XAxis dataKey="name" angle={-45} fontSize={12} textAnchor="end" />
                  <YAxis />
                  <Tooltip content={<StatusTooltip />} />
                  <Bar dataKey="value" name="Number of PODs" onClick={handleStatusClick} className="cursor-pointer">
                    {statusChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        fillOpacity={filters.selectedStatus === entry.name ? 1 : filters.selectedStatus ? 0.4 : 1}
                        stroke={filters.selectedStatus === entry.name ? "#000000" : "transparent"}
                        strokeWidth={filters.selectedStatus === entry.name ? 2 : 0}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Sub-Status Distribution */}
        {loading.subStatusChart ? (
          <LoadingCard title="Sub-Status Distribution" description="Loading sub-status data..." icon={PieChartIcon} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Sub-Status Distribution</CardTitle>
              <CardDescription>
                {filters.selectedStatus
                  ? `Sub-statuses for ${filters.selectedStatus} status`
                  : "Click on a sub-status to filter"}
                {filters.selectedSubStatus && ` (Filtered by: ${filters.selectedSubStatus})`}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {(subStatusChartData || []).length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subStatusChartData || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      onClick={handleSubStatusClick}
                      className="cursor-pointer"
                    >
                      {(subStatusChartData || []).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          fillOpacity={
                            filters.selectedSubStatus === entry.name ? 1 : filters.selectedSubStatus ? 0.4 : 1
                          }
                          stroke={filters.selectedSubStatus === entry.name ? "#000000" : "transparent"}
                          strokeWidth={filters.selectedSubStatus === entry.name ? 2 : 0}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No sub-status data available for current selection
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Additional Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pod Type Distribution */}
        {loading.podTypeChart ? (
          <LoadingCard title="Pod Type Distribution" description="Loading pod type data..." icon={BarChart3} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Pod Type Distribution</CardTitle>
              <CardDescription>
                Click on any pod type to drill down. All pod types remain visible for easy switching.
                {filters.selectedPodType && ` (Currently viewing: ${filters.selectedPodType})`}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={podTypeChartData} margin={{bottom:60}}>
                  <XAxis dataKey="name" angle={-45} fontSize={12} textAnchor="end" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" name="Number of PODs" onClick={handlePodTypeClick} className="cursor-pointer">
                    {podTypeChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        fillOpacity={filters.selectedPodType === entry.name ? 1 : filters.selectedPodType ? 0.4 : 1}
                        stroke={filters.selectedPodType === entry.name ? "#000000" : "transparent"}
                        strokeWidth={filters.selectedPodType === entry.name ? 2 : 0}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Pod Program Type Distribution */}
        {loading.podProgramTypeChart ? (
          <LoadingCard title="Pod Program Type Distribution" description="Loading pod program type data..." icon={PieChartIcon} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Pod Program Type Distribution</CardTitle>
              <CardDescription>
                Click on any pod program type to drill down. All pod program types remain visible for easy switching.
                {filters.selectedPodProgramType && ` (Currently viewing: ${filters.selectedPodProgramType})`}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {(podProgramTypeChartData || []).length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={podProgramTypeChartData || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      onClick={handlePodProgramTypeClick}
                      className="cursor-pointer"
                    >
                      {(podProgramTypeChartData || []).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          fillOpacity={
                            filters.selectedPodProgramType === entry.name ? 1 : filters.selectedPodProgramType ? 0.4 : 1
                          }
                          stroke={filters.selectedPodProgramType === entry.name ? "#000000" : "transparent"}
                          strokeWidth={filters.selectedPodProgramType === entry.name ? 2 : 0}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No pod program type data available for current selection
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* PODs List and Workload Chart - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PODs List */}
        {loading.podsList ? (
          <TableLoadingSkeleton title="All PODs" description="Loading PODs data..." />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                All PODs
                {hasActiveFilters && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    (Showing {displayData?.allPods.length || 0} of {allPods.length} PODs)
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                {hasActiveFilters ? "PODs matching current filter selection" : "All PODs in the system"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>POD</TableHead>
                      <TableHead>Assigned Engineer</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sub-Status</TableHead>
                      <TableHead>SLA Date</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Days Late</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(displayData?.allPods || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center">
                          No PODs match the current filters
                        </TableCell>
                      </TableRow>
                    ) : (
                      (displayData?.allPods || []).map((pod, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{pod.pod}</TableCell>
                          <TableCell>{pod.assignedEngineer}</TableCell>
                          <TableCell>{pod.priority === 9999 ? "-" : pod.priority}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(pod.status)}>{pod.status}</Badge>
                          </TableCell>
                          <TableCell>{pod.subStatus}</TableCell>
                          <TableCell>{pod.slaCalculatedNbd || "-"}</TableCell>
                          <TableCell className="max-w-[150px] truncate" title={pod.notes || ""}>
                            {pod.notes || "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            {(pod.daysLate || 0) > 0 ? <span className="font-medium text-red-500">{pod.daysLate}</span> : "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Workload Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Workload Distribution Chart
            </CardTitle>
            <CardDescription>
              POD distribution by assigned engineer
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={workloadDistribution.map(w => ({
                  engineer: w.engineer || "Not Assigned",
                  totalPods: w.totalPods,
                  overduePods: w.overduePods,
                  overduePercentage: w.overduePercentage
                }))}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <XAxis 
                  dataKey="engineer" 
                  angle={-45} 
                  fontSize={12} 
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                          <p className="font-medium">{label}</p>
                          <p className="text-sm text-blue-600">Total PODs: {data.totalPods}</p>
                          <p className="text-sm text-red-600">Overdue PODs: {data.overduePods}</p>
                          <p className="text-sm text-orange-600">Overdue %: {data.overduePercentage}%</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar 
                  dataKey="totalPods" 
                  name="Total PODs"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Workload Distribution Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Workload Distribution
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({workloadDistribution.length} engineers)
            </span>
          </CardTitle>
          <CardDescription>
            POD distribution and overdue status by assigned engineer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Engineer</TableHead>
                  <TableHead className="text-center">Total PODs</TableHead>
                  <TableHead className="text-center">Overdue PODs</TableHead>
                  
                  <TableHead>Status Breakdown</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workloadDistribution.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No workload data available
                    </TableCell>
                  </TableRow>
                ) : (
                  workloadDistribution.map((workload, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{workload.engineer || "Not Assigned"}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{workload.totalPods}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {workload.overduePods > 0 ? (
                          <Badge variant="destructive">{workload.overduePods}</Badge>
                        ) : (
                          <Badge variant="secondary">0</Badge>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(workload.statusBreakdown).map(([status, count]) => (
                            <Badge 
                              key={status} 
                              variant="outline" 
                              className={`text-xs ${getStatusColor(status)}`}
                            >
                              {status}: {count}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Late PODs (if any) */}
      {(displayData?.latePods || []).length > 0 && (
        <>
          {loading.latePods ? (
            <TableLoadingSkeleton title="Overdue PODs" description="Loading overdue PODs data..." />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Overdue PODs
                </CardTitle>
                <CardDescription>
                  PODs that have passed their SLA date
                  {hasActiveFilters && ` (${displayData?.latePods.length || 0} overdue in current selection)`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[250px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>POD</TableHead>
                        <TableHead>Assigned Engineer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Sub-Status</TableHead>
                        <TableHead>SLA Date</TableHead>
                        <TableHead className="text-right">Days Late</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(displayData?.latePods || []).map((pod, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{pod.pod}</TableCell>
                          <TableCell>{pod.assignedEngineer}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(pod.status)}>{pod.status}</Badge>
                          </TableCell>
                          <TableCell>{pod.subStatus}</TableCell>
                          <TableCell>{pod.slaCalculatedNbd}</TableCell>
                          <TableCell className="text-right font-medium text-red-500">{pod.daysLate}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
