
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import RemovalDetails from "@/components/removals/RemovalDetails";
import { ArrowLeft } from "lucide-react";
import { getRemoval } from "@/lib/api";
import { Removal } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

const RemovalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [removal, setRemoval] = useState<Removal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRemoval = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await getRemoval(id);
      setRemoval(data);
    } catch (err) {
      console.error("Error fetching removal:", err);
      setError("Failed to load removal request");
      toast({
        title: "Error",
        description: "Failed to load removal request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRemoval();
  }, [id, toast]);

  const handleApprove = () => {
    fetchRemoval();
    toast({
      title: "Success",
      description: "Removal request approved successfully",
    });
  };

  const handleReject = () => {
    fetchRemoval();
    toast({
      title: "Success",
      description: "Removal request rejected successfully",
    });
  };

  const handleRecordReturn = () => {
    fetchRemoval();
    toast({
      title: "Success",
      description: "Return recorded successfully",
    });
  };

  const handleRequestExtension = () => {
    fetchRemoval();
    toast({
      title: "Success",
      description: "Extension request submitted successfully",
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center">
            <Link 
              to="/removals" 
              className="text-muted-foreground hover:text-foreground mr-4"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Removal Details</h1>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (error || !removal) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center">
            <Link 
              to="/removals" 
              className="text-muted-foreground hover:text-foreground mr-4"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Removal Details</h1>
          </div>
          
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-red-500 mb-4">{error || "Removal not found"}</p>
              <Link 
                to="/removals"
                className="text-blue-500 hover:underline"
              >
                Back to removals
              </Link>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center">
          <Link 
            to="/removals" 
            className="text-muted-foreground hover:text-foreground mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Removal Details</h1>
        </div>
        
        <RemovalDetails 
          removal={removal} 
          onApprove={handleApprove}
          onReject={handleReject}
          onRecordReturn={handleRecordReturn}
          onRequestExtension={handleRequestExtension}
        />
      </div>
    </Layout>
  );
};

export default RemovalDetail;
