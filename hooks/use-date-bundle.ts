import { useState, useCallback } from "react";

// Define the date field bundles
export const DATE_BUNDLES = {
  SET_1: {
    name: "DLP & CDM Bundle",
    fields: [
      { key: "dlpUploads", label: "DLP Uploads" },
      { key: "cdmLoad", label: "CDM Load" },
      { key: "inServiceVavAudit", label: "In-Service VAV Audit" },
      { key: "globalCvaasAudit", label: "Global CVaaS Audit" },
    ],
  },
  SET_2: {
    name: "PEP & ConnectIT Bundle",
    fields: [
      { key: "pepGeneration", label: "PEP Generation" },
      { key: "connectitTdsCreation", label: "ConnectIT TDS Creation" },
      { key: "connectitPreloadCreation", label: "ConnectIT Preload Creation" },
      { key: "checklistCreation", label: "Checklist Creation" },
    ],
  },
};

export function useDateBundle() {
  const [bundlePopupOpen, setBundlePopupOpen] = useState(false);
  const [currentBundle, setCurrentBundle] = useState<typeof DATE_BUNDLES[keyof typeof DATE_BUNDLES] | null>(null);
  const [triggeringField, setTriggeringField] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [onApplyCallback, setOnApplyCallback] = useState<((fields: string[], selectedDate: string) => void) | null>(null);

  const checkForBundle = useCallback((fieldKey: string, pod: any) => {
    // Check if the field is part of any bundle
    for (const [bundleKey, bundle] of Object.entries(DATE_BUNDLES)) {
      const fieldInBundle = bundle.fields.find(field => field.key === fieldKey);
      
      if (fieldInBundle) {
        // Get the current date value for the triggering field
        const currentDate = pod[fieldKey];
        const isNA = pod[`${fieldKey}IsNA`];
        
        if (currentDate && !isNA) {
          // Check which fields in the bundle are already filled
          const bundleFields = bundle.fields.map(field => ({
            key: field.key,
            label: field.label,
            isFilled: !!(pod[field.key] && !pod[`${field.key}IsNA`]),
          }));

          // Only show popup if there are unfilled fields in the bundle
          const unfilledFields = bundleFields.filter(field => !field.isFilled);
          
          if (unfilledFields.length > 0) {
            setCurrentBundle(bundle);
            setTriggeringField(fieldKey);
            setSelectedDate(currentDate);
            setBundlePopupOpen(true);
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  const handleBundleApply = useCallback((selectedFields: string[]) => {
    if (onApplyCallback) {
      onApplyCallback(selectedFields, selectedDate);
      setBundlePopupOpen(false);
    }
  }, [onApplyCallback, selectedDate]);

  const showBundlePopup = useCallback((
    fieldKey: string,
    pod: any,
    onApply: (fields: string[], selectedDate: string) => void
  ) => {
    setOnApplyCallback(() => onApply);
    return checkForBundle(fieldKey, pod);
  }, [checkForBundle]);

  return {
    bundlePopupOpen,
    setBundlePopupOpen,
    currentBundle,
    triggeringField,
    selectedDate,
    showBundlePopup,
    handleBundleApply,
  };
} 