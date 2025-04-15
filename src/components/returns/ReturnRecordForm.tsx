
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialogFooter } from "@/components/ui/alert-dialog";
import { recordReturn } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface ReturnRecordFormProps {
  removalId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ReturnRecordForm: React.FC<ReturnRecordFormProps> = ({
  removalId,
  onSuccess,
  onCancel
}) => {
  const { toast } = useToast();
  const [returnDate, setReturnDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [condition, setCondition] = useState("Good");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  
  const handleRecordReturn = async () => {
    if (!returnDate) {
      toast({
        title: "Missing date",
        description: "Please provide the return date",
        variant: "destructive",
      });
      return;
    }
    
    if (!condition) {
      toast({
        title: "Missing condition",
        description: "Please specify the condition of the returned item",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      await recordReturn(removalId, new Date(returnDate), condition, notes);
      
      toast({
        title: "Success",
        description: "Return recorded successfully",
      });
      
      onSuccess();
    } catch (error) {
      console.error("Error recording return:", error);
      toast({
        title: "Error",
        description: "Failed to record return",
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
          <Label htmlFor="return-date">Return Date <span className="text-red-500">*</span></Label>
          <Input
            id="return-date"
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="condition">Condition <span className="text-red-500">*</span></Label>
          <Select value={condition} onValueChange={setCondition}>
            <SelectTrigger id="condition">
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Excellent">Excellent</SelectItem>
              <SelectItem value="Good">Good</SelectItem>
              <SelectItem value="Fair">Fair</SelectItem>
              <SelectItem value="Poor">Poor</SelectItem>
              <SelectItem value="Damaged">Damaged</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about the return"
            rows={3}
          />
        </div>
      </div>
      
      <AlertDialogFooter className="mt-4">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleRecordReturn} disabled={loading}>
          {loading ? "Processing..." : "Record Return"}
        </Button>
      </AlertDialogFooter>
    </>
  );
};
