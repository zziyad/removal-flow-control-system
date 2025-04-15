
import React from "react";
import Layout from "@/components/layout/Layout";
import RemovalForm from "@/components/removals/RemovalForm";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const RemovalCreate = () => {
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
          <h1 className="text-2xl font-bold tracking-tight">Create New Removal</h1>
        </div>
        
        <RemovalForm mode="create" />
      </div>
    </Layout>
  );
};

export default RemovalCreate;
