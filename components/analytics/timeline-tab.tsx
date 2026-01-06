"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { TrendingUp, Search, Filter, Clock, User, Calendar } from "lucide-react"
import { getStatusColor, formatDateInCentralTime } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import moment from 'moment-timezone'
import { TIMEZONE } from "@/lib/utils"

interface Pod {
  id: string
  pod: string
  status: string
  subStatus: string
  assignedEngineer: string
  org: string
  podProgramType: string
  podTypeOriginal: string
  creationTimestamp: string
  slaCalculatedNbd: string
}

interface TimelineEntry {
  type: "status" | "substatus"
  value: string
  startDate: string
  endDate: string | null
  duration: string
  previousValue: string | null
  changedBy: {
    email: string
    name: string
  } | null
  createdAt: string
}

interface TimelineData {
  pod: Pod
  statusHistory: any[]
  timelineData: TimelineEntry[]
}

const STATUS_COLORS: { [key: string]: string } = {
  "Initial": "#3b82f6",
  "Engineering": "#10b981",
  "Data Management": "#f59e0b",
  "Submitted": "#8b5cf6",
  "Complete": "#06b6d4",
  "Revision": "#ef4444",
  "Blocked": "#6b7280",
  "Paused": "#f97316",
  "Reject": "#dc2626",
  "Decom": "#374151",
  "Assignment": "#3b82f6",
  "Assessment": "#10b981",
  "Conversion File": "#f59e0b",
  "Ready": "#8b5cf6",
  "Normalization Required": "#ef4444",
  "PEP Generation": "#06b6d4",
  "TDS Generation": "#8b5cf6",
  "Preload Generation": "#f59e0b",
  "Services Connectivity": "#10b981",
  "NPB": "#6b7280",
  "VM Deletes": "#ef4444",
  "Network Deletes": "#f97316",
  "MACD Approval": "#8b5cf6",
  "DLP": "#06b6d4",
  "CDM": "#10b981",
  "CVaaS": "#3b82f6",
  "DNS Deletes": "#ef4444",
  "DNS Adds": "#f59e0b",
  "Network Adds/MACD": "#8b5cf6",
  "Preload Deletes": "#ef4444",
  "Preload Adds": "#10b981",
  "LEP Update": "#06b6d4",
  "PEP Update": "#8b5cf6",
  "ORT Not Complete": "#f59e0b",
  "Tenant Definition": "#3b82f6",
}

export function TimeLineTab() {
  const { user, loading: authLoading } = useAuth()
  const [activePods, setActivePods] = useState<Pod[]>([])
  const [selectedPod, setSelectedPod] = useState<Pod | null>(null)
  const [timelineData, setTimelineData] = useState<TimelineData | null>(null)
  const [viewType, setViewType] = useState<"status" | "substatus">("substatus")
  const [loading, setLoading] = useState(false)
  const [timelineLoading, setTimelineLoading] = useState(false)
  const [filters, setFilters] = useState({
    org: "",
    podProgramType: "",
    podType: "",
    engineer: "",
    search: "",
  })
  const [filterOptions, setFilterOptions] = useState({
    orgs: [],
    podProgramTypes: [],
    podTypes: [],
    engineers: [],
  })

  // Fetch all active PODs once at startup
  const fetchAllActivePods = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/active-pods')
      if (response.ok) {
        const data = await response.json()
        setActivePods(data.pods)
        setFilterOptions(data.filters)
      }
    } catch (error) {
      console.error("Error fetching active PODs:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch timeline data for selected POD
  const fetchTimelineData = async (podId: string) => {
    try {
      setTimelineLoading(true)
      const response = await fetch(`/api/pod-timeline?podId=${podId}`)
      if (response.ok) {
        const data = await response.json()
        setTimelineData(data)
      }
    } catch (error) {
      console.error("Error fetching timeline data:", error)
    } finally {
      setTimelineLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchAllActivePods()
    }
  }, [user])

  const handlePodSelect = (pod: Pod) => {
    setSelectedPod(pod)
    fetchTimelineData(pod.id)
  }

  // Frontend filtering for PODs list
  const getFilteredPods = () => {
    return activePods.filter(pod => {
      // Search filter
      if (filters.search && !pod.pod.toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }
      
      // Org filter
      if (filters.org && pod.org !== filters.org) {
        return false
      }
      
      // Pod Program Type filter
      if (filters.podProgramType && pod.podProgramType !== filters.podProgramType) {
        return false
      }
      
      // Pod Type filter
      if (filters.podType && pod.podTypeOriginal !== filters.podType) {
        return false
      }
      
      // Engineer filter
      if (filters.engineer && pod.assignedEngineer !== filters.engineer) {
        return false
      }
      
      return true
    })
  }

  const getFilteredTimeline = () => {
    
    if (!timelineData) return []
    return timelineData.timelineData.filter(entry => entry.type === viewType)
  }

  const getCurrentStatus = () => {
    const filteredTimeline = getFilteredTimeline()
    return filteredTimeline.find(entry => !entry.endDate) || null
  }

  const getTodayMarkerPosition = () => {
    const currentStatus = getCurrentStatus()
    if (!currentStatus) return null

    const filteredTimeline = getFilteredTimeline()
    const currentIndex = filteredTimeline.findIndex(entry => entry === currentStatus)
    
    if (currentIndex === -1) return null

    // Calculate position based on duration up to current status
    let totalDuration = 0
    for (let i = 0; i <= currentIndex; i++) {
      totalDuration += parseDurationToMinutes(filteredTimeline[i].duration)
    }
    
    const totalCycleTime = parseDurationToMinutes(calculateTotalCycleTime())
    return (totalDuration / totalCycleTime) * 100
  }

  const getStatusWidth = (entry: TimelineEntry, index: number) => {
    const filteredTimeline = getFilteredTimeline()
    const totalCycleTime = parseDurationToMinutes(calculateTotalCycleTime())
    const entryDuration = parseDurationToMinutes(entry.duration)
    
    // Calculate percentage based on duration
    const percentage = (entryDuration / totalCycleTime) * 100
    
    // Set minimum width (e.g., 8% of total width)
    const minWidth = 8
    const maxWidth = 100 - (filteredTimeline.length - 1) * minWidth
    
    return Math.max(minWidth, Math.min(percentage, maxWidth))
  }

  const calculateTotalCycleTime = () => {
    if (!timelineData) return "0m"
    const filteredTimeline = getFilteredTimeline()

    // Calculate total duration by parsing each duration string
    let totalMinutes = 0
    
    filteredTimeline.forEach(entry => {
      const duration = entry.duration
      const daysMatch = duration.match(/(\d+)d/)
      const hoursMatch = duration.match(/(\d+)h/)
      const minutesMatch = duration.match(/(\d+)m/)
      const secondsMatch = duration.match(/(\d+)s/)
      
      if (daysMatch) totalMinutes += parseInt(daysMatch[1]) * 24 * 60
      if (hoursMatch) totalMinutes += parseInt(hoursMatch[1]) * 60
      if (minutesMatch) totalMinutes += parseInt(minutesMatch[1])
      if (secondsMatch) totalMinutes += parseInt(secondsMatch[1]) / 60
    })
    
    // Convert back to human readable format
    const days = Math.floor(totalMinutes / (24 * 60))
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60)
    const minutes = Math.floor(totalMinutes % 60)
    
    let result = ""
    if (days > 0) result += `${days}d `
    if (hours > 0) result += `${hours}h `
    if (minutes > 0) result += `${minutes}m`
    if (result === "") result = "0m"
    
    return result.trim()
  }

  const formatDate = (dateString: string) => {
    return moment(dateString).tz(TIMEZONE).format('MMM DD')
  }

  const formatDetailedDate = (dateString: string) => {
    return moment(dateString).tz(TIMEZONE).format('MMM DD, YYYY')
  }

  const parseDurationToMinutes = (duration: string): number => {
    const daysMatch = duration.match(/(\d+)d/)
    const hoursMatch = duration.match(/(\d+)h/)
    const minutesMatch = duration.match(/(\d+)m/)
    const secondsMatch = duration.match(/(\d+)s/)
    
    let totalMinutes = 0
    if (daysMatch) totalMinutes += parseInt(daysMatch[1]) * 24 * 60
    if (hoursMatch) totalMinutes += parseInt(hoursMatch[1]) * 60
    if (minutesMatch) totalMinutes += parseInt(minutesMatch[1])
    if (secondsMatch) totalMinutes += parseInt(secondsMatch[1]) / 60
    
    return totalMinutes
  }

  if (authLoading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Pod Timeline</h1>
            <p className="text-sm text-muted-foreground">Analytics / Pod Timeline</p>
          </div>
        </div>

        {/* Loading state */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading timeline analytics...</p>
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
          <h1 className="text-2xl font-bold">Pod Timeline</h1>
          <p className="text-sm text-muted-foreground">Analytics / Pod Timeline</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
        

            <Select value={filters.podProgramType || "all"} onValueChange={(value) => setFilters(prev => ({ ...prev, podProgramType: value === "all" ? "" : value }))}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Program Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">POD Program Type</SelectItem>
                {filterOptions.podProgramTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.podType || "all"} onValueChange={(value) => setFilters(prev => ({ ...prev, podType: value === "all" ? "" : value }))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Pod Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">POD Type</SelectItem>
                {filterOptions.podTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.engineer || "all"} onValueChange={(value) => setFilters(prev => ({ ...prev, engineer: value === "all" ? "" : value }))}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Engineer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Engineers</SelectItem>
                {filterOptions.engineers.map((engineer) => (
                  <SelectItem key={engineer} value={engineer}>{engineer}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel - All PODs */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>All PODs</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search pod..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {getFilteredPods().map((pod) => (
                    <div
                      key={pod.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedPod?.id === pod.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => handlePodSelect(pod)}
                    >
                      <div className="font-medium">{pod.pod}</div>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${
                          selectedPod?.id === pod.id ? "bg-primary-foreground text-primary" : ""
                        }`}
                      >
                        {pod.subStatus}
                      </Badge>
                    </div>
                  ))}
                  {getFilteredPods().length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <p>No PODs match the current filters</p>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Main Timeline Panel */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Pod Timeline</CardTitle>
                {selectedPod && (
                  <p className="text-sm text-muted-foreground">
                    Total cycle time: {calculateTotalCycleTime()}
                  </p>
                )}
              </div>
              <RadioGroup value={viewType} onValueChange={(value) => setViewType(value as "status" | "substatus")} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="status" id="status" />
                  <Label htmlFor="status">Status</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="substatus" id="substatus" />
                  <Label htmlFor="substatus">Sub-status</Label>
                </div>
              </RadioGroup>
            </div>
          </CardHeader>
          <CardContent>
            {!selectedPod ? (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Select a POD</p>
                  <p className="text-sm">Choose a POD from the left panel to view its timeline</p>
                </div>
              </div>
            ) : timelineLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : getFilteredTimeline().length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Timeline not found for POD {selectedPod?.pod}</p>
                  <p className="text-sm">No status history available for this POD</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Timeline Visualization */}
                <div className="relative">
                  <TooltipProvider>
                    <div className="flex items-center h-12 bg-gray-100 rounded-lg overflow-hidden">
                      {getFilteredTimeline().map((entry, index) => (
                        <Tooltip key={index}>
                          <TooltipTrigger asChild>
                            <div
                              className="h-full flex items-center justify-center text-white text-sm font-medium cursor-pointer"
                              style={{
                                backgroundColor: STATUS_COLORS[entry.value] || "#6b7280",
                                width: `${getStatusWidth(entry, index)}%`,
                                minWidth: '60px' // Ensure minimum readable width
                              }}
                            >
                              <span className="truncate px-2 text-center">{entry.value}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="max-w-xs">
                            <div className="space-y-1">
                              <div className="font-medium">{entry.value}</div>
                              <div className="text-sm text-muted-foreground">Duration: {entry.duration}</div>
                              <div className="text-sm text-muted-foreground">
                                {formatDate(entry.startDate)} - {entry.endDate ? formatDate(entry.endDate) : "Ongoing"}
                              </div>
                              {entry.changedBy && (
                                <div className="text-sm text-muted-foreground">By: {entry.changedBy.email}</div>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </TooltipProvider>
                  
                  {/* Today marker - only show if there's a current status */}
                  {getTodayMarkerPosition() !== null && (
                    <div 
                      className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                      style={{ left: `${getTodayMarkerPosition()}%` }}
                    >
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-red-500 bg-white px-1 rounded">
                        Today
                      </div>
                    </div>
                  )}
                </div>

                {/* Transitions Table */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Transitions</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="font-semibold text-gray-900">{viewType === "status" ? "Status" : "Sub-status"}</TableHead>
                          <TableHead className="font-semibold text-gray-900">Start</TableHead>
                          <TableHead className="font-semibold text-gray-900">End</TableHead>
                          <TableHead className="font-semibold text-gray-900">Duration</TableHead>
                          <TableHead className="font-semibold text-gray-900">Changed By</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getFilteredTimeline().map((entry, index) => (
                          <TableRow key={index} className="hover:bg-gray-50">
                            <TableCell className="py-3">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-3 h-3 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: STATUS_COLORS[entry.value] || "#6b7280" }}
                                />
                                <span className="font-medium text-gray-900">{entry.value}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-3 text-gray-600">
                              {formatDetailedDate(entry.startDate)}
                            </TableCell>
                            <TableCell className="py-3 text-gray-600">
                              {entry.endDate ? formatDetailedDate(entry.endDate) : "Today"}
                            </TableCell>
                            <TableCell className="py-3">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span className="font-medium text-gray-900">{entry.duration}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-3">
                              {entry.changedBy ? (
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-gray-500" />
                                  <span className="text-gray-600">{entry.changedBy.email}</span>
                                </div>
                              ) : (
                                <span className="text-gray-500 italic">System</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
