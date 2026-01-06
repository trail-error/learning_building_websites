"use client"

import { Header } from "@/components/header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, TrendingUp, Activity } from "lucide-react"
import { OverviewTab } from "@/components/analytics/overview-tab"
import { useRouter } from "next/navigation"
import { PerformanceTab } from "@/components/analytics/performance-tab"
import { TimeLineTab } from "@/components/analytics/timeline-tab"

export default function AnalyticsPage() {
  const router = useRouter()

  const handleBack = () => {
    router.push('/main')
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Header title="Analytics Dashboard" onBack={handleBack} />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            TimeLine
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab />
        </TabsContent>

        <TabsContent value="timeline">
          <TimeLineTab />
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
