
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialogFooter } from "@/components/ui/alert-dialog";
import { rejectRemoval } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface RejectionFormProps {
  removalId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const RejectionForm: React.FC<RejectionFormProps> = ({
  removalId,
  onSuccess,
  onCancel
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [signature, setSignature] = useState(user?.name || "");
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Determine rejection level based on current user role
  const getRejectionLevel = (): number => {
    if (!user) return 0;
    
    const roleNames = user.roles.map(r => r.name);
    
    if (roleNames.includes("LEVEL_2")) return 2;
    if (roleNames.includes("LEVEL_3")) return 3;
    if (roleNames.includes("LEVEL_4")) return 4;
    if (roleNames.includes("SECURITY")) return 5;
    
    return 0;
  };
  
  const handleRejection = async () => {
    if (!signature.trim()) {
      toast({
        title: "Missing signature",
        description: "Please provide your signature",
        variant: "destructive",
      });
      return;
    }
    
    if (!rejectionReason.trim()) {
      toast({
        title: "Missing reason",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }
    
    const level = getRejectionLevel();
    if (level === 0) {
      toast({
        title: "Permission error",
        description: "You don't have permission to reject this request",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      await rejectRemoval(removalId, level, rejectionReason, signature);
      
      toast({
        title: "Success",
        description: "Removal request rejected successfully",
      });
      
      onSuccess();
    } catch (error) {
      console.error("Error rejecting removal:", error);
      toast({
        title: "Error",
        description: "Failed to reject removal request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="rejection-reason">Rejection Reason <span className="text-red-500">*</span></Label>
          <Textarea
            id="rejection-reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Explain why this request is being rejected"
            rows={4}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="signature">Your Signature <span className="text-red-500">*</span></Label>
          <Input
            id="signature"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            placeholder="Enter your full name"
          />
        </div>
      </div>
      
      <AlertDialogFooter className="mt-4">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={handleRejection} disabled={loading}>
          {loading ? "Processing..." : "Reject Request"}
        </Button>
      </AlertDialogFooter>
    </>
  );
};
