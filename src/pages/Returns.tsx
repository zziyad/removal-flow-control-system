
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
import { format, addDays, isBefore, isAfter } from "date-fns";

const Returns = () => {
  const { toast } = useToast();
  const [removals, setRemovals] = useState<Removal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchRemovals = async () => {
      try {
        const data = await getRemovals();
        // Filter to only include approved returnable items
        const returnableRemovals = data.filter(r => 
          r.status === "APPROVED" && 
          r.removalType === "RETURNABLE" &&
          r.dateTo !== undefined
        );
        setRemovals(returnableRemovals);
      } catch (error) {
        console.error("Error fetching removals:", error);
        toast({
          title: "Error",
          description: "Failed to load returnable items",
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

  // Today and 7 days from now
  const today = new Date();
  const nextWeek = addDays(today, 7);
  
  // Due today
  const dueToday = filteredRemovals.filter(r => 
    r.dateTo && format(new Date(r.dateTo), "yyyy-MM-dd") === format(today, "yyyy-MM-dd")
  );
  
  // Overdue
  const overdue = filteredRemovals.filter(r => 
    r.dateTo && isBefore(new Date(r.dateTo), today) && 
    format(new Date(r.dateTo), "yyyy-MM-dd") !== format(today, "yyyy-MM-dd")
  );
  
  // Due this week
  const dueThisWeek = filteredRemovals.filter(r => 
    r.dateTo && 
    isAfter(new Date(r.dateTo), today) && 
    isBefore(new Date(r.dateTo), nextWeek) &&
    format(new Date(r.dateTo), "yyyy-MM-dd") !== format(today, "yyyy-MM-dd")
  );
  
  // Due later
  const dueLater = filteredRemovals.filter(r => 
    r.dateTo && isAfter(new Date(r.dateTo), nextWeek)
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
                : "No returnable items in this category"}
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
          <h1 className="text-3xl font-bold tracking-tight">Returns</h1>
          <p className="text-muted-foreground">
            Manage returnable items and record returns
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search returnable items..."
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
            {overdue.length > 0 && (
              <TabsTrigger value="overdue" className="text-red-500">
                Overdue ({overdue.length})
              </TabsTrigger>
            )}
            {dueToday.length > 0 && (
              <TabsTrigger value="today">
                Due Today ({dueToday.length})
              </TabsTrigger>
            )}
            {dueThisWeek.length > 0 && (
              <TabsTrigger value="thisweek">
                This Week ({dueThisWeek.length})
              </TabsTrigger>
            )}
            {dueLater.length > 0 && (
              <TabsTrigger value="later">
                Later ({dueLater.length})
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {renderRemovalsList(filteredRemovals)}
          </TabsContent>

          <TabsContent value="overdue" className="space-y-4">
            {renderRemovalsList(overdue)}
          </TabsContent>

          <TabsContent value="today" className="space-y-4">
            {renderRemovalsList(dueToday)}
          </TabsContent>

          <TabsContent value="thisweek" className="space-y-4">
            {renderRemovalsList(dueThisWeek)}
          </TabsContent>

          <TabsContent value="later" className="space-y-4">
            {renderRemovalsList(dueLater)}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Returns;
