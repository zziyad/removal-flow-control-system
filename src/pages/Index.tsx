
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import RemovalListItem from "@/components/removals/RemovalListItem";
import { useToast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  const [removals, setRemovals] = useState<Removal[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Filter removals for different sections
  const pendingApprovals = removals.filter((r) =>
    ["PENDING_LEVEL_2", "PENDING_LEVEL_3", "PENDING_LEVEL_4", "PENDING_SECURITY", "PENDING_LEVEL_2_RECHECK"].includes(
      r.status
    )
  );

  const dueReturns = removals.filter(
    (r) =>
      r.status === "APPROVED" &&
      r.removalType === "RETURNABLE" &&
      r.dateTo &&
      new Date(r.dateTo) <= new Date(new Date().setDate(new Date().getDate() + 7))
  );

  const recentActivity = [...removals]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 5);

  // Prepare data for charts
  const statusData = [
    {
      name: "Draft",
      value: removals.filter((r) => r.status === "DRAFT").length,
      color: "#9E9E9E",
    },
    {
      name: "Pending",
      value: pendingApprovals.length,
      color: "#FFA500",
    },
    {
      name: "Approved",
      value: removals.filter((r) => r.status === "APPROVED").length,
      color: "#4CAF50",
    },
    {
      name: "Rejected",
      value: removals.filter((r) => r.status === "REJECTED").length,
      color: "#F44336",
    },
    {
      name: "Returned",
      value: removals.filter((r) => r.status === "RETURNED").length,
      color: "#2196F3",
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.name}
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Removals
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{removals.length}</div>
              <p className="text-xs text-muted-foreground">
                {removals.filter((r) => r.removalType === "RETURNABLE").length}{" "}
                returnable, {removals.filter((r) => r.removalType === "NON_RETURNABLE").length}{" "}
                non-returnable
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Approvals
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pendingApprovals.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Items waiting for review at various levels
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Due Returns
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dueReturns.length}</div>
              <p className="text-xs text-muted-foreground">
                Items due for return within 7 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Approval Rate
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {removals.length > 0
                  ? Math.round(
                      (removals.filter(
                        (r) => r.status === "APPROVED" || r.status === "RETURNED"
                      ).length /
                        removals.filter(
                          (r) =>
                            r.status === "APPROVED" ||
                            r.status === "RETURNED" ||
                            r.status === "REJECTED"
                        ).length) *
                        100
                    )
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground">
                Percentage of requests approved
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Removal Status Overview</CardTitle>
              <CardDescription>
                Distribution of removals by current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]}>
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your most recent removal updates
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentActivity.length > 0 ? (
                  recentActivity.map((removal) => (
                    <Link
                      key={removal.id}
                      to={`/removals/${removal.id}`}
                      className="flex items-center p-3 hover:bg-gray-50"
                    >
                      {removal.status === "DRAFT" && (
                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                      )}
                      {["PENDING_LEVEL_2", "PENDING_LEVEL_3", "PENDING_LEVEL_4", "PENDING_SECURITY", "PENDING_LEVEL_2_RECHECK"].includes(
                        removal.status
                      ) && (
                        <Clock className="h-5 w-5 text-orange-400 mr-3" />
                      )}
                      {removal.status === "APPROVED" && (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      )}
                      {removal.status === "REJECTED" && (
                        <XCircle className="h-5 w-5 text-red-500 mr-3" />
                      )}
                      {removal.status === "RETURNED" && (
                        <CheckCircle className="h-5 w-5 text-blue-500 mr-3" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {removal.items[0]?.description || "No items"}
                          {removal.items.length > 1 &&
                            ` +${removal.items.length - 1} more`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Status: {removal.status.replace(/_/g, " ")}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    No recent activity found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="w-full space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
            <TabsTrigger value="returns">Due Returns</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingApprovals.length > 0 ? (
              pendingApprovals.slice(0, 3).map((removal) => (
                <RemovalListItem key={removal.id} removal={removal} />
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-6">
                  <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                  <p className="text-lg font-medium">All caught up!</p>
                  <p className="text-muted-foreground">
                    No pending approvals at this time
                  </p>
                </CardContent>
              </Card>
            )}
            {pendingApprovals.length > 3 && (
              <div className="text-center">
                <Link to="/approvals">
                  <Button variant="outline">
                    View All Pending Approvals
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="returns" className="space-y-4">
            {dueReturns.length > 0 ? (
              dueReturns.slice(0, 3).map((removal) => (
                <RemovalListItem key={removal.id} removal={removal} />
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-6">
                  <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                  <p className="text-lg font-medium">No items due soon</p>
                  <p className="text-muted-foreground">
                    No returnable items are due within the next 7 days
                  </p>
                </CardContent>
              </Card>
            )}
            {dueReturns.length > 3 && (
              <div className="text-center">
                <Link to="/returns">
                  <Button variant="outline">
                    View All Due Returns
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Dashboard;
