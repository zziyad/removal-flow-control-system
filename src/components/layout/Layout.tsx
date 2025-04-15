
import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LayoutDashboard, 
  FileText, 
  Clock, 
  CheckSquare, 
  XSquare, 
  ArrowLeft, 
  UserCircle, 
  LogOut,
  Menu,
  File,
  Users,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  active?: boolean;
  requiresPermission?: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  icon, 
  label, 
  to, 
  active = false, 
  requiresPermission 
}) => {
  const { hasPermission } = useAuth();
  
  if (requiresPermission && !hasPermission(requiresPermission)) {
    return null;
  }
  
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
        active ? "bg-primary/10 text-primary" : "text-muted-foreground"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };
  
  if (!user) {
    return <>{children}</>;
  }
  
  return (
    <div className="flex min-h-screen">
      {/* Mobile sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden fixed left-4 top-4 z-10">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 pt-10">
          <div className="flex h-full flex-col gap-2 p-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium mb-4">Main Menu</p>
              <SidebarItem
                icon={<LayoutDashboard className="h-5 w-5" />}
                label="Dashboard"
                to="/"
                active={location.pathname === "/"}
              />
              <SidebarItem
                icon={<FileText className="h-5 w-5" />}
                label="My Removals"
                to="/removals"
                active={location.pathname === "/removals"}
              />
              <SidebarItem
                icon={<File className="h-5 w-5" />}
                label="Create Removal"
                to="/removals/create"
                active={location.pathname === "/removals/create"}
                requiresPermission="create_removal"
              />
              <SidebarItem
                icon={<Clock className="h-5 w-5" />}
                label="Pending Approvals"
                to="/approvals"
                active={location.pathname === "/approvals"}
                requiresPermission="approve_level_2"
              />
              <SidebarItem
                icon={<CheckSquare className="h-5 w-5" />}
                label="Returns"
                to="/returns"
                active={location.pathname === "/returns"}
                requiresPermission="record_return"
              />
              <SidebarItem
                icon={<XSquare className="h-5 w-5" />}
                label="Extensions"
                to="/extensions"
                active={location.pathname === "/extensions"}
                requiresPermission="manage_extension"
              />
              {hasPermission("admin_access") && (
                <>
                  <p className="text-sm font-medium mt-6 mb-4">Admin</p>
                  <SidebarItem
                    icon={<Users className="h-5 w-5" />}
                    label="Users"
                    to="/admin/users"
                    active={location.pathname === "/admin/users"}
                    requiresPermission="admin_access"
                  />
                  <SidebarItem
                    icon={<Settings className="h-5 w-5" />}
                    label="Settings"
                    to="/admin/settings"
                    active={location.pathname === "/admin/settings"}
                    requiresPermission="admin_access"
                  />
                </>
              )}
            </div>

            <div className="mt-auto">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 rounded-lg px-3 py-2">
                  <UserCircle className="h-5 w-5" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {user.roles.map(role => role.name).join(", ")}
                    </span>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout} className="w-full">
                  <LogOut className="h-4 w-4 mr-2" />
                  Log out
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden md:flex w-64 flex-col border-r bg-sidebar p-6">
        <div className="flex items-center gap-2 mb-8">
          <FileText className="h-6 w-6" />
          <h1 className="text-xl font-bold">Removal System</h1>
        </div>
        
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium mb-4">Main Menu</p>
          <SidebarItem
            icon={<LayoutDashboard className="h-5 w-5" />}
            label="Dashboard"
            to="/"
            active={location.pathname === "/"}
          />
          <SidebarItem
            icon={<FileText className="h-5 w-5" />}
            label="My Removals"
            to="/removals"
            active={location.pathname === "/removals"}
          />
          <SidebarItem
            icon={<File className="h-5 w-5" />}
            label="Create Removal"
            to="/removals/create"
            active={location.pathname === "/removals/create"}
            requiresPermission="create_removal"
          />
          <SidebarItem
            icon={<Clock className="h-5 w-5" />}
            label="Pending Approvals"
            to="/approvals"
            active={location.pathname === "/approvals"}
            requiresPermission="approve_level_2"
          />
          <SidebarItem
            icon={<CheckSquare className="h-5 w-5" />}
            label="Returns"
            to="/returns"
            active={location.pathname === "/returns"}
            requiresPermission="record_return"
          />
          <SidebarItem
            icon={<XSquare className="h-5 w-5" />}
            label="Extensions"
            to="/extensions"
            active={location.pathname === "/extensions"}
            requiresPermission="manage_extension"
          />
          {hasPermission("admin_access") && (
            <>
              <p className="text-sm font-medium mt-6 mb-4">Admin</p>
              <SidebarItem
                icon={<Users className="h-5 w-5" />}
                label="Users"
                to="/admin/users"
                active={location.pathname === "/admin/users"}
                requiresPermission="admin_access"
              />
              <SidebarItem
                icon={<Settings className="h-5 w-5" />}
                label="Settings"
                to="/admin/settings"
                active={location.pathname === "/admin/settings"}
                requiresPermission="admin_access"
              />
            </>
          )}
        </div>

        <div className="mt-auto">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 rounded-lg px-3 py-2">
              <UserCircle className="h-5 w-5" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground">
                  {user.roles.map(role => role.name).join(", ")}
                </span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="w-full">
              <LogOut className="h-4 w-4 mr-2" />
              Log out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <main className="p-6 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
