
import React, { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Removal } from "@/types";
import { getRemovals } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  FileText,
  X,
} from "lucide-react";
import RemovalListItem from "@/components/removals/RemovalListItem";
import { useToast } from "@/components/ui/use-toast";

const Approvals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [removals, setRemovals] = useState<Removal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchRemovals = async () => {
      try {
        const data = await getRemovals();
        // Filter to only include removals that need approval
        const pendingRemovals = data.filter(r => 
          ["PENDING_LEVEL_2", "PENDING_LEVEL_3", "PENDING_LEVEL_4", "PENDING_SECURITY", "PENDING_LEVEL_2_RECHECK"].includes(r.status)
        );
        setRemovals(pendingRemovals);
      } catch (error) {
        console.error("Error fetching removals:", error);
        toast({
          title: "Error",
          description: "Failed to load pending approvals",
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

  // Get role-specific pending approvals
  const roleNames = user?.roles.map(r => r.name) || [];
  
  const level2Approvals = filteredRemovals.filter((r) => 
    (r.status === "PENDING_LEVEL_2" || r.status === "PENDING_LEVEL_2_RECHECK") && 
    (roleNames.includes("LEVEL_2") || roleNames.includes("ADMIN"))
  );
  
  const level3Approvals = filteredRemovals.filter((r) => 
    r.status === "PENDING_LEVEL_3" && 
    (roleNames.includes("LEVEL_3") || roleNames.includes("ADMIN"))
  );
  
  const level4Approvals = filteredRemovals.filter((r) => 
    r.status === "PENDING_LEVEL_4" && 
    (roleNames.includes("LEVEL_4") || roleNames.includes("ADMIN"))
  );
  
  const securityApprovals = filteredRemovals.filter((r) => 
    r.status === "PENDING_SECURITY" && 
    (roleNames.includes("SECURITY") || roleNames.includes("ADMIN"))
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
            <p className="text-lg font-medium">No pending approvals</p>
            <p className="text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search"
                : "No removal requests requiring your approval"}
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
          <h1 className="text-3xl font-bold tracking-tight">Pending Approvals</h1>
          <p className="text-muted-foreground">
            Review and approve removal requests
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search pending approvals..."
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
            {level2Approvals.length > 0 && (
              <TabsTrigger value="level2">
                Department ({level2Approvals.length})
              </TabsTrigger>
            )}
            {level3Approvals.length > 0 && (
              <TabsTrigger value="level3">
                Finance ({level3Approvals.length})
              </TabsTrigger>
            )}
            {level4Approvals.length > 0 && (
              <TabsTrigger value="level4">
                Management ({level4Approvals.length})
              </TabsTrigger>
            )}
            {securityApprovals.length > 0 && (
              <TabsTrigger value="security">
                Security ({securityApprovals.length})
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {renderRemovalsList(filteredRemovals)}
          </TabsContent>

          <TabsContent value="level2" className="space-y-4">
            {renderRemovalsList(level2Approvals)}
          </TabsContent>

          <TabsContent value="level3" className="space-y-4">
            {renderRemovalsList(level3Approvals)}
          </TabsContent>

          <TabsContent value="level4" className="space-y-4">
            {renderRemovalsList(level4Approvals)}
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            {renderRemovalsList(securityApprovals)}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Approvals;
