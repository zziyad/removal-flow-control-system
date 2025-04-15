
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialogFooter } from "@/components/ui/alert-dialog";
import { approveExtension, rejectExtension } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface ApproveExtensionFormProps {
  removalId: string;
  extensionId: string;
  originalDate: Date;
  newDate: Date;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ApproveExtensionForm: React.FC<ApproveExtensionFormProps> = ({
  removalId,
  extensionId,
  originalDate,
  newDate,
  onSuccess,
  onCancel
}) => {
  const { toast } = useToast();
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  
  const handleAction = async (actionType: "approve" | "reject") => {
    setAction(actionType);
    
    try {
      setLoading(true);
      
      if (actionType === "approve") {
        await approveExtension(removalId, extensionId);
        toast({
          title: "Success",
          description: "Extension request approved successfully",
        });
      } else {
        await rejectExtension(removalId, extensionId);
        toast({
          title: "Success",
          description: "Extension request rejected successfully",
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error(`Error ${actionType}ing extension:`, error);
      toast({
        title: "Error",
        description: `Failed to ${actionType} extension request`,
        variant: "destructive",
      });
      setAction(null);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Original Return Date</Label>
            <div className="p-2 bg-gray-50 border rounded text-sm">
              {format(new Date(originalDate), "MMMM d, yyyy")}
            </div>
          </div>
          
          <div className="space-y-1">
            <Label>Requested New Date</Label>
            <div className="p-2 bg-gray-50 border rounded text-sm">
              {format(new Date(newDate), "MMMM d, yyyy")}
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this extension request"
            rows={3}
          />
        </div>
      </div>
      
      <AlertDialogFooter className="mt-4">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <div className="space-x-2">
          <Button 
            variant="destructive" 
            onClick={() => handleAction("reject")} 
            disabled={loading || action === "approve"}
          >
            {loading && action === "reject" ? "Processing..." : "Reject"}
          </Button>
          <Button 
            onClick={() => handleAction("approve")} 
            disabled={loading || action === "reject"}
          >
            {loading && action === "approve" ? "Processing..." : "Approve"}
          </Button>
        </div>
      </AlertDialogFooter>
    </>
  );
};
