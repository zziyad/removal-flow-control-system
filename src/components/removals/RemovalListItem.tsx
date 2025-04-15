
import React from "react";
import { Link } from "react-router-dom";
import { Calendar, User, Building } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Removal } from "@/types";
import RemovalStatusBadge from "./RemovalStatusBadge";
import { format } from "date-fns";

interface RemovalListItemProps {
  removal: Removal;
}

const RemovalListItem: React.FC<RemovalListItemProps> = ({ removal }) => {
  const formatDate = (date: Date) => {
    return format(new Date(date), "MMM d, yyyy");
  };
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <Link to={`/removals/${removal.id}`} className="font-medium text-lg hover:text-primary hover:underline">
              {removal.items[0]?.description || "No items"}
              {removal.items.length > 1 && ` +${removal.items.length - 1} more`}
            </Link>
            <div className="text-sm text-muted-foreground mt-1">
              <span className="text-xs bg-gray-100 rounded px-2 py-1 mr-2">
                {removal.removalType === "RETURNABLE" ? "Returnable" : "Non-returnable"}
              </span>
              <span>Created on {formatDate(removal.createdAt)}</span>
            </div>
          </div>
          <RemovalStatusBadge status={removal.status} />
        </div>
        
        <div className="flex flex-wrap gap-4 mt-4">
          {removal.departmentId && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Building className="h-4 w-4 mr-1" />
              <span>{removal.department?.name}</span>
            </div>
          )}
          
          {removal.dateFrom && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              <span>From: {formatDate(removal.dateFrom)}</span>
            </div>
          )}
          
          {removal.dateTo && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              <span>To: {formatDate(removal.dateTo)}</span>
            </div>
          )}
          
          {removal.employee && (
            <div className="flex items-center text-sm text-muted-foreground">
              <User className="h-4 w-4 mr-1" />
              <span>{removal.employee}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RemovalListItem;
