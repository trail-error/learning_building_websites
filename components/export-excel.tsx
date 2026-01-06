"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download } from "lucide-react";
import type { Pod, SearchCriteria } from "@/lib/types";
import { exportPodsToExcel } from "@/lib/actions";
import { useState } from "react";

interface ExportExcelProps {
  isHistory: boolean;
  searchCriteria: SearchCriteria[];
  userId?: string;
}

export function ExportExcel({ isHistory, searchCriteria, userId }: ExportExcelProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await exportPodsToExcel(isHistory, searchCriteria, userId);

      if (!result.success) {
        throw new Error(result.message || "Failed to export data");
      }

      // Convert pods to Excel format
      const pods = result.pods;
      if (!pods || pods.length === 0) {
        toast({
          title: "No Data",
          description: "There is no data to export",
          variant: "destructive",
        });
        return;
      }

      const headers = [
        "POD ID",
        "Internal POD ID",
        "Priority",
        "Type",
        "Assigned Engineer",
        "Status",
        "Sub Status",
        "Organization",
        "Creation Date",
        "SLA Calculated NBD",
        "POD Workable Date",
        "Total Elapsed Cycle Time",
        "Workable Cycle Time",
        "Time In Current Status",
        "CLLI",
        "City",
        "State",
        "Router Type",
        "Router 1",
        "Router 2",
        "POD Program Type",
        "Tenant Name",
        "Current LEP Version",
        "LEP Version To Be Applied",
        "POD Type",
        "Special",
        "LEP Assessment",
        "DLP Template Updates",
        "IP Acquisition",
        "IP Allocation",
        "Conversion File Update",
        "Conversion File Validation",
        "PEP Generation",
        "ConnectIT TDS Creation",
        "ConnectIT Preload Creation",
        "Checklist Creation",
        "VM Delete List",
        "VM Deletes Complete",
        "LCM Network Deletes",
        "MACD Creation",
        "ATS MACD Approval",
        "LCM Network Delete Completion",
        "DLP Uploads",
        "CDM Load",
        "In-Service VAV Audit",
        "Global CVaaS Audit",
        "DNS Deletes",
        "DNS Adds",
        "LCM Add Ticket",
        "Preload Ticket Submitted",
        "IXC Roaming SMOP",
        "GTM VVM SMOP",
        "Other Routing",
        "Publish PEP",
        "Ticket Notification Email",
        "MyLogins Request",
        "LCM Complete",
        "Preload Complete",
        "Completed Date",
      ];

      // Convert pod objects to arrays in the order of headers
      const rows = pods.map((pod: Pod) => [
        pod.pod,
        pod.internalPodId,
        pod.priority.toString(),
        pod.type,
        pod.assignedEngineer,
        pod.status,
        pod.subStatus,
        pod.org,
    
        pod.creationTimestampIsNA ? "N/A" : pod.creationTimestamp || "",
        pod.slaCalculatedNbdIsNA ? "N/A" : pod.slaCalculatedNbd || "",
        pod.podWorkableDateIsNA ? "N/A" : pod.podWorkableDate || "",
        pod.totalElapsedCycleTime,
        pod.workableCycleTime,
        pod.timeInCurrentStatus,
        pod.clli,
        pod.city,
        pod.state,
        pod.routerType,
        pod.router1,
        pod.router2,
        pod.podProgramType,
        pod.tenantName,
        pod.currentLepVersion,
        pod.lepVersionToBeApplied,
        pod.podType,
        pod.special.toString(),
        pod.lepAssessmentIsNA ? "N/A" : pod.lepAssessment || "",
        pod.dlpTemplateUpdatesIsNA ? "N/A" : pod.dlpTemplateUpdates || "",
        pod.ipAcquisitionIsNA ? "N/A" : pod.ipAcquisition || "",
        pod.ipAllocationIsNA ? "N/A" : pod.ipAllocation || "",
        pod.conversionFileUpdateIsNA ? "N/A" : pod.conversionFileUpdate || "",
        pod.conversionFileValidationIsNA
          ? "N/A"
          : pod.conversionFileValidation || "",
        pod.pepGenerationIsNA ? "N/A" : pod.pepGeneration || "",
        pod.connectitTdsCreationIsNA ? "N/A" : pod.connectitTdsCreation || "",
        pod.connectitPreloadCreationIsNA
          ? "N/A"
          : pod.connectitPreloadCreation || "",
        pod.checklistCreationIsNA ? "N/A" : pod.checklistCreation || "",
        pod.vmDeleteListIsNA ? "N/A" : pod.vmDeleteList || "",
        pod.vmDeletesCompleteIsNA ? "N/A" : pod.vmDeletesComplete || "",
        pod.lcmNetworkDeletesIsNA ? "N/A" : pod.lcmNetworkDeletes || "",
        pod.macdCreationIsNA ? "N/A" : pod.macdCreation || "",
        pod.atsMacdApprovalIsNA ? "N/A" : pod.atsMacdApproval || "",
        pod.lcmNetworkDeleteCompletionIsNA
          ? "N/A"
          : pod.lcmNetworkDeleteCompletion || "",
        pod.dlpUploadsIsNA ? "N/A" : pod.dlpUploads || "",
        pod.cdmLoadIsNA ? "N/A" : pod.cdmLoad || "",
        pod.inServiceVavAuditIsNA ? "N/A" : pod.inServiceVavAudit || "",
        pod.globalCvaasAuditIsNA ? "N/A" : pod.globalCvaasAudit || "",
        pod.dnsIsNA ? "N/A" : pod.dns || "",
        pod.dnsIsNA ? "N/A" : pod.dns || "",
        pod.lcmAddTicketIsNA ? "N/A" : pod.lcmAddTicket || "",
        pod.preloadTicketSubmittedIsNA
          ? "N/A"
          : pod.preloadTicketSubmitted || "",
        pod.ixcRoamingSmopIsNA ? "N/A" : pod.ixcRoamingSmop || "",
        pod.gtmVvmSmopIsNA ? "N/A" : pod.gtmVvmSmop || "",
        pod.otherRoutingIsNA ? "N/A" : pod.otherRouting || "",
        pod.publishPepIsNA ? "N/A" : pod.publishPep || "",
        pod.ticketNotificationEmailIsNA
          ? "N/A"
          : pod.ticketNotificationEmail || "",
        pod.myloginsRequestIsNA ? "N/A" : pod.myloginsRequest || "",
        pod.lcmCompleteIsNA ? "N/A" : pod.lcmComplete || "",
        pod.preloadCompleteIsNA ? "N/A" : pod.preloadComplete || "",
        pod.completedDateIsNA ? "N/A" : pod.completedDate || "",
      ]);

      // Create CSV content
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += headers.join(",") + "\n";
      rows.forEach((row) => {
        // Escape commas and quotes in the data
        const formattedRow = row.map((cell) => {
          // If cell contains commas, quotes, or newlines, wrap in quotes
          if (
            cell &&
            (cell.toString().includes(",") ||
              cell.toString().includes('"') ||
              cell.toString().includes("\n"))
          ) {
            // Replace quotes with double quotes for escaping
            return `"${cell.toString().replace(/"/g, '""')}"`;
          }
          return cell;
        });
        csvContent += formattedRow.join(",") + "\n";
      });

      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `pod_export_${isHistory ? "history" : "active"}_${new Date()
          .toISOString()
          .slice(0, 10)}.csv`
      );
      document.body.appendChild(link);

      // Download the file
      link.click();

      // Clean up
      document.body.removeChild(link);

      toast({
        title: "Export Successful",
        description: `Exported ${pods.length} PODs to Excel`,
      });
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast({
        title: "Export Failed",
        description:
          error instanceof Error ? error.message : "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button onClick={handleExport} disabled={isExporting} variant="outline">
      <Download className="mr-2 h-4 w-4" />
      {isExporting ? "Exporting..." : "Export to Excel"}
    </Button>
  );
}
