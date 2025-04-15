
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialogFooter } from "@/components/ui/alert-dialog";
import { approveRemoval } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface ApprovalFormProps {
  removalId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ApprovalForm: React.FC<ApprovalFormProps> = ({
  removalId,
  onSuccess,
  onCancel
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [signature, setSignature] = useState(user?.name || "");
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Determine approval level based on current user role
  const getApprovalLevel = (): number => {
    if (!user) return 0;
    
    const roleNames = user.roles.map(r => r.name);
    
    if (roleNames.includes("LEVEL_2")) return 2;
    if (roleNames.includes("LEVEL_3")) return 3;
    if (roleNames.includes("LEVEL_4")) return 4;
    if (roleNames.includes("SECURITY")) return 5;
    
    return 0;
  };
  
  const handleApproval = async () => {
    if (!signature.trim()) {
      toast({
        title: "Missing signature",
        description: "Please provide your signature",
        variant: "destructive",
      });
      return;
    }
    
    const level = getApprovalLevel();
    if (level === 0) {
      toast({
        title: "Permission error",
        description: "You don't have permission to approve this request",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      await approveRemoval(removalId, level, signature, comments);
      
      toast({
        title: "Success",
        description: "Removal request approved successfully",
      });
      
      onSuccess();
    } catch (error) {
      console.error("Error approving removal:", error);
      toast({
        title: "Error",
        description: "Failed to approve removal request",
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
          <Label htmlFor="signature">Your Signature</Label>
          <Input
            id="signature"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            placeholder="Enter your full name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="comments">Comments (Optional)</Label>
          <Textarea
            id="comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Add any comments or notes"
            rows={3}
          />
        </div>
      </div>
      
      <AlertDialogFooter className="mt-4">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleApproval} disabled={loading}>
          {loading ? "Processing..." : "Approve"}
        </Button>
      </AlertDialogFooter>
    </>
  );
};
