
import React, { useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Removal, RemovalItem, RemovalImage } from "@/types";
import RemovalStatusBadge from "./RemovalStatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkflow } from "@/contexts/WorkflowContext";
import { approve, reject } from "@/lib/actions";
import { 
  CalendarDays, 
  Building, 
  User, 
  Send,
  Edit,
  Printer,
  Check,
  X,
  AlertTriangle,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { ApprovalForm } from "../approvals/ApprovalForm";
import { RejectionForm } from "../approvals/RejectionForm";
import { ReturnRecordForm } from "../returns/ReturnRecordForm";
import { ExtensionRequestForm } from "../extensions/ExtensionRequestForm";

interface RemovalDetailsProps {
  removal: Removal;
  onApprove?: () => void;
  onReject?: () => void;
  onRecordReturn?: () => void;
  onRequestExtension?: () => void;
}

const RemovalDetails: React.FC<RemovalDetailsProps> = ({
  removal,
  onApprove,
  onReject,
  onRecordReturn,
  onRequestExtension
}) => {
  const { user, hasPermission } = useAuth();
  const { getStatusColor, getAllowedTransitions } = useWorkflow();
  const navigate = useNavigate();

  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [showExtensionForm, setShowExtensionForm] = useState(false);
  const [allowedTransitions, setAllowedTransitions] = useState<any[]>([]);

  React.useEffect(() => {
    const loadTransitions = async () => {
      if (removal) {
        const transitions = await getAllowedTransitions(removal.id);
        setAllowedTransitions(transitions);
      }
    };
    
    loadTransitions();
  }, [removal, getAllowedTransitions]);

  if (!removal) return null;

  const formatDate = (date: Date | undefined) => {
    if (!date) return "Not specified";
    return format(new Date(date), "MMMM d, yyyy");
  };

  const canSubmit = removal.status === "DRAFT" && 
                   (removal.userId === user?.id || hasPermission("admin_access"));
  
  const canEdit = removal.status === "DRAFT" && 
                 (removal.userId === user?.id || hasPermission("admin_access"));
  
  const canApprove = allowedTransitions.some(t => 
    t.toStep !== "REJECTED" && 
    (t.requiredPermission.includes("approve_") || t.requiredPermission === "recheck_extension")
  );
  
  const canReject = allowedTransitions.some(t => 
    t.toStep === "REJECTED" && 
    t.requiredPermission.includes("approve_")
  );
  
  const canRecordReturn = removal.status === "APPROVED" && 
                          removal.removalType === "RETURNABLE" &&
                          hasPermission("record_return");
  
  const canRequestExtension = removal.status === "APPROVED" && 
                             removal.removalType === "RETURNABLE" &&
                             hasPermission("manage_extension");

  const handleSubmit = async () => {
    // In a real system, this would call an API endpoint
    alert("Removal submitted for approval!");
    navigate("/removals");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl">
                Removal Request
              </CardTitle>
              <CardDescription className="mt-1">
                Created on {formatDate(removal.createdAt)} by {removal.user.name}
              </CardDescription>
            </div>
            <RemovalStatusBadge status={removal.status} />
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Removal Details</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <Badge variant="outline" className="mr-2">
                    {removal.removalType === "RETURNABLE" ? "Returnable" : "Non-returnable"}
                  </Badge>
                </div>
                
                <div className="flex items-center text-sm">
                  <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground mr-1">From:</span>
                  <span>{formatDate(removal.dateFrom)}</span>
                </div>
                
                {removal.removalType === "RETURNABLE" && removal.dateTo && (
                  <div className="flex items-center text-sm">
                    <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground mr-1">Return by:</span>
                    <span>{formatDate(removal.dateTo)}</span>
                  </div>
                )}
                
                {removal.departmentId && (
                  <div className="flex items-center text-sm">
                    <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground mr-1">Department:</span>
                    <span>{removal.department?.name}</span>
                  </div>
                )}
                
                {removal.employee && (
                  <div className="flex items-center text-sm">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground mr-1">Employee:</span>
                    <span>{removal.employee}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Approval Status</h3>
              <div className="space-y-2">
                {removal.status === "REJECTED" && (
                  <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
                    <div className="flex items-start">
                      <AlertTriangle className="h-4 w-4 text-red-500 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-800">Removal Rejected</p>
                        <p className="text-red-700 mt-1">{removal.rejectionReason || "No reason provided"}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {removal.removalType === "RETURNABLE" && removal.status === "APPROVED" && removal.dateTo && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                    <div className="flex items-start">
                      <Clock className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-800">Return Date</p>
                        <p className="text-blue-700 mt-1">
                          Item must be returned by {formatDate(removal.dateTo)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-4 space-y-1">
                  {["LEVEL_2", "LEVEL_3", "LEVEL_4", "SECURITY"].map((level, index) => {
                    const approval = removal.approvals.find(a => a.level === index + 2);
                    const levelName = 
                      level === "LEVEL_2" ? "Department" :
                      level === "LEVEL_3" ? "Finance" :
                      level === "LEVEL_4" ? "Management" :
                      "Security";
                    
                    let status = "Pending";
                    let icon = <Clock className="h-4 w-4 text-gray-400" />;
                    
                    if (approval) {
                      if (approval.approved) {
                        status = `Approved by ${approval.approvedBy.name}`;
                        icon = <Check className="h-4 w-4 text-green-600" />;
                      } else {
                        status = `Rejected by ${approval.approvedBy.name}`;
                        icon = <X className="h-4 w-4 text-red-600" />;
                      }
                    } else if (
                      (level === "LEVEL_2" && !["PENDING_LEVEL_2", "DRAFT"].includes(removal.status)) ||
                      (level === "LEVEL_3" && !["PENDING_LEVEL_3", "PENDING_LEVEL_2", "DRAFT"].includes(removal.status)) ||
                      (level === "LEVEL_4" && !["PENDING_LEVEL_4", "PENDING_LEVEL_3", "PENDING_LEVEL_2", "DRAFT"].includes(removal.status)) ||
                      (level === "SECURITY" && !["PENDING_SECURITY", "PENDING_LEVEL_4", "PENDING_LEVEL_3", "PENDING_LEVEL_2", "DRAFT"].includes(removal.status))
                    ) {
                      status = "Not required";
                      icon = <div className="h-4 w-4 rounded-full bg-gray-200" />;
                    }
                    
                    return (
                      <div key={level} className="flex items-center gap-2 text-sm">
                        {icon}
                        <span className="text-muted-foreground">{levelName}:</span>
                        <span>{status}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <Tabs defaultValue="items">
            <TabsList>
              <TabsTrigger value="items">Items ({removal.items.length})</TabsTrigger>
              <TabsTrigger value="images">Images ({removal.images.length})</TabsTrigger>
              {removal.returnRecord && <TabsTrigger value="return">Return Record</TabsTrigger>}
              {removal.extensionRequests && removal.extensionRequests.length > 0 && (
                <TabsTrigger value="extensions">Extensions ({removal.extensionRequests.length})</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="items" className="mt-4">
              <div className="space-y-3">
                {removal.items.map((item: RemovalItem, index: number) => (
                  <div key={index} className="border rounded-md p-3">
                    <p className="font-medium">{item.description}</p>
                    <div className="flex items-center mt-1 text-sm">
                      <span className="text-muted-foreground mr-1">Reason:</span>
                      <span>{item.removalReason.name}</span>
                    </div>
                    {item.customReason && (
                      <div className="mt-2 text-sm">
                        <p className="text-muted-foreground">Additional details:</p>
                        <p className="mt-1">{item.customReason}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="images" className="mt-4">
              {removal.images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {removal.images.map((image: RemovalImage, index: number) => (
                    <div key={index} className="border rounded-md overflow-hidden">
                      <img 
                        src={image.url} 
                        alt={`Item image ${index + 1}`} 
                        className="w-full h-40 object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No images uploaded</p>
              )}
            </TabsContent>
            
            {removal.returnRecord && (
              <TabsContent value="return" className="mt-4">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Return Record</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Return Date:</p>
                      <p>{formatDate(removal.returnRecord.returnDate)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Condition:</p>
                      <p>{removal.returnRecord.condition}</p>
                    </div>
                    {removal.returnRecord.notes && (
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Notes:</p>
                        <p>{removal.returnRecord.notes}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-muted-foreground">Recorded By:</p>
                      <p>{removal.returnRecord.recordedBy.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Recorded On:</p>
                      <p>{formatDate(removal.returnRecord.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            )}
            
            {removal.extensionRequests && removal.extensionRequests.length > 0 && (
              <TabsContent value="extensions" className="mt-4">
                <div className="space-y-3">
                  {removal.extensionRequests.map((extension, index) => (
                    <div key={index} className="border rounded-md p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">Extension Request #{index + 1}</h3>
                        <Badge variant={
                          extension.status === "APPROVED" ? "default" :
                          extension.status === "REJECTED" ? "destructive" :
                          "secondary"
                        }>
                          {extension.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Original Return Date:</p>
                          <p>{formatDate(extension.originalDate)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">New Return Date:</p>
                          <p>{formatDate(extension.newDate)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Requested By:</p>
                          <p>{extension.requestedBy.name}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Requested On:</p>
                          <p>{formatDate(extension.createdAt)}</p>
                        </div>
                        {extension.recheckById && (
                          <>
                            <div>
                              <p className="text-muted-foreground">Reviewed By:</p>
                              <p>{extension.recheckBy?.name}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Review Status:</p>
                              <p>{extension.recheckStatus}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between pt-0">
          <div>
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
          </div>
          
          <div className="flex gap-2">
            {canEdit && (
              <Button
                variant="outline"
                onClick={() => navigate(`/removals/${removal.id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
            
            {removal.status === "APPROVED" && (
              <Button variant="outline">
                <Printer className="h-4 w-4 mr-1" />
                Print
              </Button>
            )}
            
            {canSubmit && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button>
                    <Send className="h-4 w-4 mr-1" />
                    Submit for Approval
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Submit removal request?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Once submitted, you won't be able to edit this request.
                      It will be sent to your department manager for review.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSubmit}>Submit</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            
            {canApprove && (
              <Button
                variant="default"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setShowApprovalForm(true)}
              >
                <Check className="h-4 w-4 mr-1" />
                Approve
              </Button>
            )}
            
            {canReject && (
              <Button
                variant="destructive"
                onClick={() => setShowRejectionForm(true)}
              >
                <X className="h-4 w-4 mr-1" />
                Reject
              </Button>
            )}
            
            {canRecordReturn && (
              <Button
                variant="default"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setShowReturnForm(true)}
              >
                <Check className="h-4 w-4 mr-1" />
                Record Return
              </Button>
            )}
            
            {canRequestExtension && (
              <Button
                variant="outline"
                onClick={() => setShowExtensionForm(true)}
              >
                <Clock className="h-4 w-4 mr-1" />
                Request Extension
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
      
      {/* Approval Form Dialog */}
      <AlertDialog open={showApprovalForm} onOpenChange={setShowApprovalForm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Removal Request</AlertDialogTitle>
            <AlertDialogDescription>
              Please review the details carefully before approving this request.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ApprovalForm 
            removalId={removal.id} 
            onSuccess={() => {
              setShowApprovalForm(false);
              if (onApprove) onApprove();
            }}
            onCancel={() => setShowApprovalForm(false)}
          />
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Rejection Form Dialog */}
      <AlertDialog open={showRejectionForm} onOpenChange={setShowRejectionForm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Removal Request</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this request.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <RejectionForm 
            removalId={removal.id} 
            onSuccess={() => {
              setShowRejectionForm(false);
              if (onReject) onReject();
            }}
            onCancel={() => setShowRejectionForm(false)}
          />
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Return Record Form Dialog */}
      <AlertDialog open={showReturnForm} onOpenChange={setShowReturnForm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Record Item Return</AlertDialogTitle>
            <AlertDialogDescription>
              Please record the return details for this item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ReturnRecordForm 
            removalId={removal.id} 
            onSuccess={() => {
              setShowReturnForm(false);
              if (onRecordReturn) onRecordReturn();
            }}
            onCancel={() => setShowReturnForm(false)}
          />
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Extension Request Form Dialog */}
      <AlertDialog open={showExtensionForm} onOpenChange={setShowExtensionForm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Request Return Extension</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide details for the extension request.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ExtensionRequestForm 
            removalId={removal.id} 
            currentReturnDate={removal.dateTo as Date}
            onSuccess={() => {
              setShowExtensionForm(false);
              if (onRequestExtension) onRequestExtension();
            }}
            onCancel={() => setShowExtensionForm(false)}
          />
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RemovalDetails;
