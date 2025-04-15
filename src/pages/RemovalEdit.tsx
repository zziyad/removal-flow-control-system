
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import RemovalForm from "@/components/removals/RemovalForm";
import { ArrowLeft } from "lucide-react";
import { getRemoval } from "@/lib/api";
import { Removal } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

const RemovalEdit = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [removal, setRemoval] = useState<Removal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRemoval = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await getRemoval(id);
        setRemoval(data);
        
        // Check if removal is in draft status
        if (data.status !== "DRAFT") {
          setError("Only draft removals can be edited");
        }
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

    fetchRemoval();
  }, [id, toast]);

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
            <h1 className="text-2xl font-bold tracking-tight">Edit Removal</h1>
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
            <h1 className="text-2xl font-bold tracking-tight">Edit Removal</h1>
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
            to={`/removals/${id}`} 
            className="text-muted-foreground hover:text-foreground mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Edit Removal</h1>
        </div>
        
        <RemovalForm mode="edit" removalId={id} existingData={removal} />
      </div>
    </Layout>
  );
};

export default RemovalEdit;
