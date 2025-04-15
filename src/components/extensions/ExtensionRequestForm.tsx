
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialogFooter } from "@/components/ui/alert-dialog";
import { requestExtension } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { format, addDays } from "date-fns";

interface ExtensionRequestFormProps {
  removalId: string;
  currentReturnDate: Date;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ExtensionRequestForm: React.FC<ExtensionRequestFormProps> = ({
  removalId,
  currentReturnDate,
  onSuccess,
  onCancel
}) => {
  const { toast } = useToast();
  const defaultNewDate = format(
    addDays(new Date(currentReturnDate), 3),
    "yyyy-MM-dd"
  );
  const [newReturnDate, setNewReturnDate] = useState(defaultNewDate);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  
  const handleRequestExtension = async () => {
    if (!newReturnDate) {
      toast({
        title: "Missing date",
        description: "Please provide the new return date",
        variant: "destructive",
      });
      return;
    }
    
    // Check that new date is after current date
    if (new Date(newReturnDate) <= new Date(currentReturnDate)) {
      toast({
        title: "Invalid date",
        description: "New return date must be after the current return date",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      await requestExtension(removalId, new Date(newReturnDate));
      
      toast({
        title: "Success",
        description: "Extension request submitted successfully",
      });
      
      onSuccess();
    } catch (error) {
      console.error("Error requesting extension:", error);
      toast({
        title: "Error",
        description: "Failed to request extension",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <div className="space-y-4">
        <div className="space-y-1">
          <Label>Current Return Date</Label>
          <div className="p-2 bg-gray-50 border rounded text-sm">
            {format(new Date(currentReturnDate), "MMMM d, yyyy")}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="new-return-date">New Return Date <span className="text-red-500">*</span></Label>
          <Input
            id="new-return-date"
            type="date"
            value={newReturnDate}
            onChange={(e) => setNewReturnDate(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="reason">Reason for Extension (Optional)</Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why an extension is needed"
            rows={3}
          />
        </div>
        
        <div className="bg-blue-50 border border-blue-100 rounded p-3 text-sm">
          <p className="text-blue-800">
            Extension requests require approval from the department manager. The item must still be returned by the current return date unless the extension is approved.
          </p>
        </div>
      </div>
      
      <AlertDialogFooter className="mt-4">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleRequestExtension} disabled={loading}>
          {loading ? "Processing..." : "Request Extension"}
        </Button>
      </AlertDialogFooter>
    </>
  );
};
