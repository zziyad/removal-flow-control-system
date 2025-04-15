
import React, { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import { Removal } from "@/types";
import { getRemovals } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Search,
  FileText,
  X,
} from "lucide-react";
import RemovalListItem from "@/components/removals/RemovalListItem";
import { useToast } from "@/components/ui/use-toast";

const Extensions = () => {
  const { toast } = useToast();
  const [removals, setRemovals] = useState<Removal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchRemovals = async () => {
      try {
        const data = await getRemovals();
        // Filter to include extension-related removals
        const filteredRemovals = data.filter(r => 
          (r.status === "APPROVED" && r.removalType === "RETURNABLE") || 
          r.status === "PENDING_LEVEL_2_RECHECK"
        );
        setRemovals(filteredRemovals);
      } catch (error) {
        console.error("Error fetching removals:", error);
        toast({
          title: "Error",
          description: "Failed to load extension data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRemovals();
  }, [toast]);

  // Filter removals
  const filteredRemovals = removals.filter((removal) => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    
    return (
      removal.items.some((item) =>
        item.description.toLowerCase().includes(searchLower)
      ) ||
      (removal.employee &&
        removal.employee.toLowerCase().includes(searchLower)) ||
      (removal.department?.name &&
        removal.department.name.toLowerCase().includes(searchLower)) ||
      (removal.user.name.toLowerCase().includes(searchLower))
    );
  });

  // Pending extension rechecks
  const pendingRechecks = filteredRemovals.filter(r => 
    r.status === "PENDING_LEVEL_2_RECHECK"
  );
  
  // Already approved with extensions
  const approvedWithExtensions = filteredRemovals.filter(r => 
    r.status === "APPROVED" && 
    r.extensionRequests && 
    r.extensionRequests.some(ext => ext.status === "APPROVED")
  );
  
  // Eligible for extension (approved returnable items with no approved extensions)
  const eligibleForExtension = filteredRemovals.filter(r => 
    r.status === "APPROVED" && 
    r.removalType === "RETURNABLE" &&
    (!r.extensionRequests || !r.extensionRequests.some(ext => ext.status === "APPROVED"))
  );

  const renderRemovalsList = (removals: Removal[]) => {
    if (loading) {
      return (
        <Card>
          <CardContent className="flex justify-center items-center p-6">
            <p>Loading...</p>
          </CardContent>
        </Card>
      );
    }

    if (removals.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <FileText className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-lg font-medium">No items found</p>
            <p className="text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search"
                : "No items in this category"}
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {removals.map((removal) => (
          <RemovalListItem key={removal.id} removal={removal} />
        ))}
      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Extensions</h1>
          <p className="text-muted-foreground">
            Manage extension requests for returnable items
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search items..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Tabs defaultValue="all" className="w-full space-y-4">
          <TabsList>
            <TabsTrigger value="all">
              All ({filteredRemovals.length})
            </TabsTrigger>
            {pendingRechecks.length > 0 && (
              <TabsTrigger value="pending">
                Pending Rechecks ({pendingRechecks.length})
              </TabsTrigger>
            )}
            {approvedWithExtensions.length > 0 && (
              <TabsTrigger value="extended">
                Extended ({approvedWithExtensions.length})
              </TabsTrigger>
            )}
            {eligibleForExtension.length > 0 && (
              <TabsTrigger value="eligible">
                Eligible ({eligibleForExtension.length})
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {renderRemovalsList(filteredRemovals)}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {renderRemovalsList(pendingRechecks)}
          </TabsContent>

          <TabsContent value="extended" className="space-y-4">
            {renderRemovalsList(approvedWithExtensions)}
          </TabsContent>

          <TabsContent value="eligible" className="space-y-4">
            {renderRemovalsList(eligibleForExtension)}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Extensions;
