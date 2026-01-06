
import { addPod, checkPodExists } from "./actions"
import type { Pod, LogIssue, SearchCriteria } from "@/lib/types";

interface AddPodResult {
  success: boolean
  message?: string
  pod?: Pod
}

export async function addDuplicateoPod(pod: Pod, userId: string): Promise<AddPodResult> {
  try {
    // Check if POD already exists
    const exists = await checkPodExists(pod.pod)
    if (exists) {
      return {
        success: false,
        message: `A POD with ID "${pod.pod}" already exists. POD IDs must be unique.`,
      }
    }

    const result = await addPod(pod, userId)
    return result
  } catch (error) {
    console.error("Error adding pod:", error)
    return {
      success: false,
      message: "An error occurred while adding the POD",
    }
  }
} 