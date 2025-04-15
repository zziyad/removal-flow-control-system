
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RemovalReason, RemovalType, Department } from "@/types";
import { getRemovalReasons, getDepartments, createRemoval, updateRemoval, submitRemoval } from "@/lib/api";
import { Plus, Trash, Upload, Save, Send } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface RemovalFormProps {
  removalId?: string;
  existingData?: any;
  mode: "create" | "edit";
}

const RemovalForm: React.FC<RemovalFormProps> = ({ removalId, existingData, mode }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // States
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [removalType, setRemovalType] = useState<RemovalType>(existingData?.removalType || "RETURNABLE");
  const [dateFrom, setDateFrom] = useState(existingData?.dateFrom ? format(new Date(existingData.dateFrom), "yyyy-MM-dd") : "");
  const [dateTo, setDateTo] = useState(existingData?.dateTo ? format(new Date(existingData.dateTo), "yyyy-MM-dd") : "");
  const [employee, setEmployee] = useState(existingData?.employee || "");
  const [departmentId, setDepartmentId] = useState(existingData?.departmentId || "");
  const [items, setItems] = useState<Array<{
    description: string;
    removalReasonId: string;
    customReason?: string;
  }>>(existingData?.items || [{ description: "", removalReasonId: "", customReason: "" }]);
  const [removalReasons, setRemovalReasons] = useState<RemovalReason[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  
  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [reasons, depts] = await Promise.all([
          getRemovalReasons(),
          getDepartments()
        ]);
        setRemovalReasons(reasons);
        setDepartments(depts);
      } catch (error) {
        console.error("Error loading form data:", error);
        toast({
          title: "Error",
          description: "Failed to load form data",
          variant: "destructive",
        });
      }
    };
    
    loadData();
  }, [toast]);
  
  // Item management
  const addItem = () => {
    setItems([...items, { description: "", removalReasonId: "", customReason: "" }]);
  };
  
  const removeItem = (index: number) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };
  
  const updateItem = (index: number, field: string, value: string) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Clear custom reason if not allowed
    if (field === "removalReasonId") {
      const reason = removalReasons.find(r => r.id === value);
      if (!reason?.allowCustom) {
        updatedItems[index].customReason = "";
      }
    }
    
    setItems(updatedItems);
  };
  
  // Form submission
  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Basic validation
      if (!dateFrom) {
        toast({
          title: "Missing information",
          description: "Please enter a from date",
          variant: "destructive",
        });
        return;
      }
      
      if (removalType === "RETURNABLE" && (!dateTo || !departmentId)) {
        toast({
          title: "Missing information",
          description: "Returnable items require a return date and department",
          variant: "destructive",
        });
        return;
      }
      
      if (removalType === "NON_RETURNABLE" && !employee) {
        toast({
          title: "Missing information",
          description: "Non-returnable items require an employee name",
          variant: "destructive",
        });
        return;
      }
      
      // Validate items
      const validItems = items.filter(item => item.description && item.removalReasonId);
      if (validItems.length === 0) {
        toast({
          title: "Missing information",
          description: "Please add at least one item with a description and reason",
          variant: "destructive",
        });
        return;
      }
      
      // Create or update
      if (mode === "create") {
        const newRemoval = await createRemoval(
          removalType,
          new Date(dateFrom),
          dateTo ? new Date(dateTo) : undefined,
          employee,
          departmentId,
          validItems
        );
        
        toast({
          title: "Success",
          description: "Removal request created successfully",
        });
        
        navigate(`/removals/${newRemoval.id}`);
      } else if (removalId) {
        await updateRemoval(removalId, {
          dateFrom: new Date(dateFrom),
          dateTo: dateTo ? new Date(dateTo) : undefined,
          employee,
          departmentId,
          items: validItems
        });
        
        toast({
          title: "Success",
          description: "Removal request updated successfully",
        });
        
        navigate(`/removals/${removalId}`);
      }
    } catch (error) {
      console.error("Error saving removal:", error);
      toast({
        title: "Error",
        description: "Failed to save removal request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async () => {
    if (!removalId) return;
    
    try {
      setSubmitting(true);
      await submitRemoval(removalId);
      
      toast({
        title: "Success",
        description: "Removal request submitted for approval",
      });
      
      navigate(`/removals/${removalId}`);
    } catch (error) {
      console.error("Error submitting removal:", error);
      toast({
        title: "Error",
        description: "Failed to submit removal request",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Create New Removal Request" : "Edit Removal Request"}</CardTitle>
        <CardDescription>
          Fill out the details for the items you want to remove from the premises
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Removal Type */}
        <div className="space-y-2">
          <Label>Removal Type</Label>
          <RadioGroup 
            value={removalType} 
            onValueChange={(value) => setRemovalType(value as RemovalType)}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="RETURNABLE" id="returnable" />
              <Label htmlFor="returnable" className="font-normal">
                Returnable (temporary removal)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="NON_RETURNABLE" id="non-returnable" />
              <Label htmlFor="non-returnable" className="font-normal">
                Non-returnable (permanent removal)
              </Label>
            </div>
          </RadioGroup>
        </div>
        
        {/* From Date */}
        <div className="space-y-2">
          <Label htmlFor="date-from">From Date</Label>
          <Input
            id="date-from"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        
        {/* Conditional Fields based on Removal Type */}
        {removalType === "RETURNABLE" ? (
          <>
            {/* Return Date */}
            <div className="space-y-2">
              <Label htmlFor="date-to">Return Date</Label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            
            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        ) : (
          <>
            {/* Employee Name */}
            <div className="space-y-2">
              <Label htmlFor="employee">Employee Name</Label>
              <Input
                id="employee"
                value={employee}
                onChange={(e) => setEmployee(e.target.value)}
                placeholder="Enter the employee's name"
              />
            </div>
          </>
        )}
        
        {/* Items Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Items</Label>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </div>
          
          {items.map((item, index) => (
            <div key={index} className="space-y-3 p-3 border rounded-md relative">
              {items.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => removeItem(index)}
                >
                  <Trash className="h-4 w-4 text-destructive" />
                </Button>
              )}
              
              <div className="space-y-2">
                <Label htmlFor={`item-description-${index}`}>Item Description</Label>
                <Input
                  id={`item-description-${index}`}
                  value={item.description}
                  onChange={(e) => updateItem(index, "description", e.target.value)}
                  placeholder="Describe the item"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`item-reason-${index}`}>Removal Reason</Label>
                <Select 
                  value={item.removalReasonId} 
                  onValueChange={(value) => updateItem(index, "removalReasonId", value)}
                >
                  <SelectTrigger id={`item-reason-${index}`}>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {removalReasons.map((reason) => (
                      <SelectItem key={reason.id} value={reason.id}>
                        {reason.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {item.removalReasonId && 
                removalReasons.find(r => r.id === item.removalReasonId)?.allowCustom && (
                <div className="space-y-2">
                  <Label htmlFor={`item-custom-reason-${index}`}>Additional Details</Label>
                  <Textarea
                    id={`item-custom-reason-${index}`}
                    value={item.customReason || ""}
                    onChange={(e) => updateItem(index, "customReason", e.target.value)}
                    placeholder="Provide additional details"
                    rows={2}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        
        {mode === "edit" && (
          <div className="space-y-2">
            <Label>Images</Label>
            <div className="border border-dashed rounded-md p-6 flex flex-col items-center">
              <Upload className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-1">
                Drag and drop images here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG or GIF, max 5MB each
              </p>
              <Button type="button" variant="outline" size="sm" className="mt-4">
                Upload Images
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Image upload is disabled in this demo
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(-1)}
        >
          Cancel
        </Button>
        <div className="space-x-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleSave}
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-1" />
            Save as Draft
          </Button>
          {mode === "edit" && (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
            >
              <Send className="h-4 w-4 mr-1" />
              Submit for Approval
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default RemovalForm;
