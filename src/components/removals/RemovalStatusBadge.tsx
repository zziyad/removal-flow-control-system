
import React from "react";
import { Badge } from "@/components/ui/badge";
import { RemovalStatus } from "@/types";
import { useWorkflow } from "@/contexts/WorkflowContext";

interface RemovalStatusBadgeProps {
  status: RemovalStatus;
}

const RemovalStatusBadge: React.FC<RemovalStatusBadgeProps> = ({ status }) => {
  const { steps } = useWorkflow();
  
  const getDisplayName = (): string => {
    const step = steps.find(s => s.name === status);
    return step?.displayName || status;
  };
  
  const getVariant = (): "default" | "destructive" | "outline" | "secondary" => {
    switch (status) {
      case "DRAFT":
        return "outline";
      case "PENDING_LEVEL_2":
      case "PENDING_LEVEL_3":
      case "PENDING_LEVEL_4":
      case "PENDING_SECURITY":
      case "PENDING_LEVEL_2_RECHECK":
        return "secondary";
      case "APPROVED":
        return "default";
      case "REJECTED":
        return "destructive";
      case "RETURNED":
        return "default";
      default:
        return "outline";
    }
  };
  
  return (
    <Badge variant={getVariant()} className="text-xs">
      {getDisplayName()}
    </Badge>
  );
};

export default RemovalStatusBadge;
