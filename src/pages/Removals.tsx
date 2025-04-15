
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  Plus,
  Search,
  FileText,
  SlidersHorizontal,
  X,
} from "lucide-react";
import RemovalListItem from "@/components/removals/RemovalListItem";
import { useToast } from "@/components/ui/use-toast";

const Removals = () => {
  const { hasPermission } = useAuth();
  const { toast } = useToast();
  const [removals, setRemovals] = useState<Removal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchRemovals = async () => {
      try {
        const data = await getRemovals();
        setRemovals(data);
      } catch (error) {
        console.error("Error fetching removals:", error);
        toast({
          title: "Error",
          description: "Failed to load removals",
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
        removal.department.name.toLowerCase().includes(searchLower))
    );
  });

  const draftRemovals = filteredRemovals.filter((r) => r.status === "DRAFT");
  
  const pendingRemovals = filteredRemovals.filter((r) =>
    [
      "PENDING_LEVEL_2",
      "PENDING_LEVEL_3",
      "PENDING_LEVEL_4",
      "PENDING_SECURITY",
      "PENDING_LEVEL_2_RECHECK",
    ].includes(r.status)
  );
  
  const approvedRemovals = filteredRemovals.filter(
    (r) => r.status === "APPROVED"
  );
  
  const completedRemovals = filteredRemovals.filter((r) =>
    ["RETURNED", "REJECTED"].includes(r.status)
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
            <p className="text-lg font-medium">No removals found</p>
            <p className="text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search or filters"
                : "No removal requests in this category"}
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Removals</h1>
            <p className="text-muted-foreground">
              Manage your removal requests
            </p>
          </div>
          {hasPermission("create_removal") && (
            <Link to="/removals/create">
              <Button>
                <Plus className="h-4 w-4 mr-1" />
                New Removal
              </Button>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search removals..."
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
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {showFilters && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Filters</CardTitle>
              <CardDescription>Refine your removal requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Filter UI would go here in a real application */}
                <div className="col-span-3 text-center text-muted-foreground">
                  Filters are disabled in this demo
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="all" className="w-full space-y-4">
          <TabsList>
            <TabsTrigger value="all">
              All ({filteredRemovals.length})
            </TabsTrigger>
            <TabsTrigger value="draft">
              Draft ({draftRemovals.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingRemovals.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({approvedRemovals.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedRemovals.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {renderRemovalsList(filteredRemovals)}
          </TabsContent>

          <TabsContent value="draft" className="space-y-4">
            {renderRemovalsList(draftRemovals)}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {renderRemovalsList(pendingRemovals)}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {renderRemovalsList(approvedRemovals)}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {renderRemovalsList(completedRemovals)}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Removals;
