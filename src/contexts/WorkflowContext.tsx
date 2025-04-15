
import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  WorkflowStep, 
  WorkflowTransition, 
  Removal, 
  RemovalStatus 
} from "@/types";
import { getWorkflowSteps, getWorkflowStep, getAllowedTransitions } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

interface WorkflowContextType {
  steps: WorkflowStep[];
  loading: boolean;
  getStepDetails: (status: RemovalStatus) => Promise<WorkflowStep | undefined>;
  getAllowedTransitions: (removalId: string) => Promise<WorkflowTransition[]>;
  getStatusColor: (status: RemovalStatus) => string;
  getNextStepName: (status: RemovalStatus) => string | undefined;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export const WorkflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchWorkflowSteps = async () => {
      try {
        const workflowSteps = await getWorkflowSteps();
        setSteps(workflowSteps);
      } catch (error) {
        console.error("Error fetching workflow steps:", error);
        toast({
          title: "Error",
          description: "Failed to load workflow configuration",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflowSteps();
  }, [toast]);

  const fetchStepDetails = async (status: RemovalStatus): Promise<WorkflowStep | undefined> => {
    try {
      return await getWorkflowStep(status);
    } catch (error) {
      console.error("Error fetching step details:", error);
      return undefined;
    }
  };

  const fetchAllowedTransitions = async (removalId: string): Promise<WorkflowTransition[]> => {
    try {
      return await getAllowedTransitions(removalId);
    } catch (error) {
      console.error("Error fetching allowed transitions:", error);
      return [];
    }
  };

  const getStatusColor = (status: RemovalStatus): string => {
    switch (status) {
      case "DRAFT":
        return "bg-removal-draft";
      case "PENDING_LEVEL_2":
      case "PENDING_LEVEL_3":
      case "PENDING_LEVEL_4":
      case "PENDING_SECURITY":
      case "PENDING_LEVEL_2_RECHECK":
        return "bg-removal-pending";
      case "APPROVED":
        return "bg-removal-approved";
      case "REJECTED":
        return "bg-removal-rejected";
      case "RETURNED":
        return "bg-removal-return";
      default:
        return "bg-gray-400";
    }
  };

  const getNextStepName = (status: RemovalStatus): string | undefined => {
    const statusToNextStep: Record<RemovalStatus, string | undefined> = {
      "DRAFT": "Department Approval",
      "PENDING_LEVEL_2": "Finance Approval",
      "PENDING_LEVEL_3": "Management Approval",
      "PENDING_LEVEL_4": "Security Approval",
      "PENDING_SECURITY": "Approval Complete",
      "APPROVED": undefined,
      "REJECTED": undefined,
      "RETURNED": undefined,
      "PENDING_LEVEL_2_RECHECK": "Department Re-check"
    };
    
    return statusToNextStep[status];
  };

  return (
    <WorkflowContext.Provider
      value={{
        steps,
        loading,
        getStepDetails: fetchStepDetails,
        getAllowedTransitions: fetchAllowedTransitions,
        getStatusColor,
        getNextStepName
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
};

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (context === undefined) {
    throw new Error("useWorkflow must be used within a WorkflowProvider");
  }
  return context;
};
