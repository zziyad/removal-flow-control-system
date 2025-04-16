import {
  User,
  Removal,
  RemovalType,
  RemovalStatus,
  RemovalReason,
  RemovalItem,
  WorkflowStep,
  WorkflowTransition,
  Department,
  Role,
  Permission,
  PermissionName,
  ExtensionRequest,
  ReturnRecord
} from "@/types";
import { v4 as uuidv4 } from "uuid";
import { 
  users, 
  roles, 
  departments, 
  workflowSteps, 
  workflowTransitions, 
  removalReasons, 
  sampleRemovals,
  createNewRemoval
} from "./mockData";

// Mock API storage
const storage = {
  users: [...users],
  roles: [...roles],
  departments: [...departments],
  workflowSteps: [...workflowSteps],
  workflowTransitions: [...workflowTransitions],
  removalReasons: [...removalReasons],
  removals: [...sampleRemovals],
  currentUser: null as User | null
};

// Authentication
export const login = async (email: string, password: string): Promise<User> => {
  // Simple mock authentication (no password check)
  const user = storage.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return Promise.reject(new Error("User not found"));
  }
  
  storage.currentUser = user;
  return Promise.resolve(user);
};

export const logout = async (): Promise<void> => {
  storage.currentUser = null;
  return Promise.resolve();
};

export const getCurrentUser = async (): Promise<User | null> => {
  return Promise.resolve(storage.currentUser);
};

// User has permission check
export const hasPermission = (user: User, permissionName: PermissionName): boolean => {
  return user.roles.some(role => 
    role.permissions.some(permission => permission.name === permissionName)
  );
};

// Check if user can perform action on a removal
export const canPerformAction = (user: User, removal: Removal, permissionName: PermissionName): boolean => {
  const permissions = user.roles.flatMap(role => role.permissions);
  const permission = permissions.find(p => p.name === permissionName);
  
  if (!permission) return false;
  
  if (permission.scope === "own") {
    return removal.userId === user.id;
  }
  
  if (permission.scope === "department") {
    const userDepartmentIds = user.departments.map(ud => ud.departmentId);
    return removal.departmentId ? userDepartmentIds.includes(removal.departmentId) : false;
  }
  
  // Global scope or admin
  return permission.scope === "global" || hasPermission(user, "admin_access");
};

// Get allowed transitions for a removal
export const getAllowedTransitions = async (removalId: string): Promise<WorkflowTransition[]> => {
  const user = storage.currentUser;
  if (!user) {
    return Promise.resolve([]);
  }
  
  const removal = storage.removals.find(r => r.id === removalId);
  if (!removal) {
    return Promise.resolve([]);
  }
  
  const userRoleNames = user.roles.map(r => r.name);
  
  return Promise.resolve(
    storage.workflowTransitions.filter(transition => {
      // Check if the transition is from the current removal status
      if (transition.fromStep !== removal.status) {
        return false;
      }
      
      // Check if the user has the required permission
      const hasRequiredPermission = hasPermission(user, transition.requiredPermission);
      
      // If no roleId is specified or the user has the role
      const hasRequiredRole = !transition.roleId || userRoleNames.includes(transition.roleId);
      
      // Check if the user can perform the action based on scope
      const canPerform = canPerformAction(user, removal, transition.requiredPermission);
      
      return hasRequiredPermission && hasRequiredRole && canPerform;
    })
  );
};

// Workflow Steps
export const getWorkflowSteps = async (): Promise<WorkflowStep[]> => {
  return Promise.resolve([...storage.workflowSteps]);
};

export const getWorkflowStep = async (statusName: RemovalStatus): Promise<WorkflowStep | undefined> => {
  return Promise.resolve(storage.workflowSteps.find(step => step.name === statusName));
};

// Departments
export const getDepartments = async (): Promise<Department[]> => {
  return Promise.resolve([...storage.departments]);
};

// Removal Reasons
export const getRemovalReasons = async (): Promise<RemovalReason[]> => {
  return Promise.resolve([...storage.removalReasons]);
};

// Removals
export const getRemovals = async (): Promise<Removal[]> => {
  const user = storage.currentUser;
  if (!user) {
    return Promise.reject(new Error("Not authenticated"));
  }
  
  // Filter removals based on user's permissions
  const filtered = storage.removals.filter(removal => {
    // Admin can see all
    if (hasPermission(user, "admin_access")) {
      return true;
    }
    
    // Own removals
    if (removal.userId === user.id && hasPermission(user, "view_own_removal")) {
      return true;
    }
    
    // Department removals
    if (
      hasPermission(user, "view_department_removal") && 
      removal.departmentId &&
      user.departments.some(ud => ud.departmentId === removal.departmentId)
    ) {
      return true;
    }
    
    // Level 3 removals
    if (
      hasPermission(user, "view_level_3_removal") && 
      removal.status === "PENDING_LEVEL_3"
    ) {
      return true;
    }
    
    // Level 4 removals
    if (
      hasPermission(user, "view_level_4_removal") && 
      removal.status === "PENDING_LEVEL_4"
    ) {
      return true;
    }
    
    // Security removals
    if (
      hasPermission(user, "view_security_removal") && 
      (removal.status === "PENDING_SECURITY" || 
       (removal.status === "APPROVED" && removal.removalType === "RETURNABLE"))
    ) {
      return true;
    }
    
    return false;
  });
  
  return Promise.resolve(filtered);
};

export const getRemoval = async (id: string): Promise<Removal> => {
  const user = storage.currentUser;
  if (!user) {
    return Promise.reject(new Error("Not authenticated"));
  }
  
  const removal = storage.removals.find(r => r.id === id);
  if (!removal) {
    return Promise.reject(new Error("Removal not found"));
  }
  
  // Check if the user can view this removal
  if (
    !hasPermission(user, "admin_access") &&
    !canPerformAction(user, removal, "view_own_removal") &&
    !canPerformAction(user, removal, "view_department_removal") &&
    !canPerformAction(user, removal, "view_level_3_removal") &&
    !canPerformAction(user, removal, "view_level_4_removal") &&
    !canPerformAction(user, removal, "view_security_removal")
  ) {
    return Promise.reject(new Error("Permission denied"));
  }
  
  return Promise.resolve({ ...removal });
};

export const createRemoval = async (
  removalType: RemovalType,
  dateFrom: Date,
  dateTo?: Date,
  employee?: string,
  departmentId?: string,
  items: Array<{ description: string; removalReasonId: string; customReason?: string }> = []
): Promise<Removal> => {
  const user = storage.currentUser;
  if (!user) {
    return Promise.reject(new Error("Not authenticated"));
  }
  
  if (!hasPermission(user, "create_removal") && !hasPermission(user, "admin_access")) {
    return Promise.reject(new Error("Permission denied"));
  }
  
  // Validate required fields
  if (removalType === "RETURNABLE" && (!dateTo || !departmentId)) {
    return Promise.reject(new Error("Returnable items require dateTo and departmentId"));
  }
  
  if (removalType === "NON_RETURNABLE" && !employee) {
    return Promise.reject(new Error("Non-returnable items require employee name"));
  }
  
  const newRemoval = createNewRemoval(
    user.id,
    removalType,
    dateFrom,
    dateTo,
    employee,
    departmentId,
    items
  );
  
  storage.removals.push(newRemoval);
  return Promise.resolve(newRemoval);
};

export const updateRemoval = async (
  id: string,
  updates: {
    dateFrom?: Date;
    dateTo?: Date;
    employee?: string;
    departmentId?: string;
    items?: Array<{ description: string; removalReasonId: string; customReason?: string }>;
    images?: Array<{ url: string; filename: string }>;
  }
): Promise<Removal> => {
  const user = storage.currentUser;
  if (!user) {
    return Promise.reject(new Error("Not authenticated"));
  }
  
  const removalIndex = storage.removals.findIndex(r => r.id === id);
  if (removalIndex === -1) {
    return Promise.reject(new Error("Removal not found"));
  }
  
  const removal = storage.removals[removalIndex];
  
  // Check if the user can update this removal
  if (removal.status !== "DRAFT") {
    return Promise.reject(new Error("Can only update draft removals"));
  }
  
  if (
    removal.userId !== user.id && 
    !hasPermission(user, "admin_access")
  ) {
    return Promise.reject(new Error("Permission denied"));
  }
  
  const updated = {
    ...removal,
    dateFrom: updates.dateFrom || removal.dateFrom,
    dateTo: updates.dateTo !== undefined ? updates.dateTo : removal.dateTo,
    employee: updates.employee !== undefined ? updates.employee : removal.employee,
    departmentId: updates.departmentId !== undefined ? updates.departmentId : removal.departmentId,
    department: updates.departmentId !== undefined 
      ? departments.find(d => d.id === updates.departmentId) 
      : removal.department,
    updatedAt: new Date()
  };
  
  // Update items if provided
  if (updates.items) {
    updated.items = updates.items.map((item, index) => ({
      id: `ri-${id}-${index}`,
      removalId: id,
      description: item.description,
      removalReasonId: item.removalReasonId,
      removalReason: removalReasons.find(rr => rr.id === item.removalReasonId)!,
      customReason: item.customReason
    }));
  }
  
  // Update images if provided
  if (updates.images) {
    const newImages = updates.images.map((img, index) => ({
      id: `img-${id}-${index}`,
      removalId: id,
      url: img.url,
      filename: img.filename,
      createdAt: new Date()
    }));
    
    updated.images = [...removal.images, ...newImages];
  }
  
  storage.removals[removalIndex] = updated;
  return Promise.resolve(updated);
};

export const submitRemoval = async (id: string): Promise<Removal> => {
  const user = storage.currentUser;
  if (!user) {
    return Promise.reject(new Error("Not authenticated"));
  }
  
  const removalIndex = storage.removals.findIndex(r => r.id === id);
  if (removalIndex === -1) {
    return Promise.reject(new Error("Removal not found"));
  }
  
  const removal = storage.removals[removalIndex];
  
  // Check if the user can submit this removal
  if (removal.status !== "DRAFT") {
    return Promise.reject(new Error("Can only submit draft removals"));
  }
  
  if (
    removal.userId !== user.id && 
    !hasPermission(user, "admin_access")
  ) {
    return Promise.reject(new Error("Permission denied"));
  }
  
  // Validate required fields
  if (removal.removalType === "RETURNABLE" && (!removal.dateTo || !removal.departmentId)) {
    return Promise.reject(new Error("Returnable items require dateTo and departmentId"));
  }
  
  if (removal.removalType === "NON_RETURNABLE" && !removal.employee) {
    return Promise.reject(new Error("Non-returnable items require employee name"));
  }
  
  if (removal.items.length === 0) {
    return Promise.reject(new Error("At least one item is required"));
  }
  
  const updated = {
    ...removal,
    status: "PENDING_LEVEL_2" as RemovalStatus,
    updatedAt: new Date()
  };
  
  storage.removals[removalIndex] = updated;
  return Promise.resolve(updated);
};

export const approveRemoval = async (
  id: string, 
  level: number,
  signature: string,
  comments?: string
): Promise<Removal> => {
  const user = storage.currentUser;
  if (!user) {
    return Promise.reject(new Error("Not authenticated"));
  }
  
  const removalIndex = storage.removals.findIndex(r => r.id === id);
  if (removalIndex === -1) {
    return Promise.reject(new Error("Removal not found"));
  }
  
  const removal = storage.removals[removalIndex];
  
  // Check the required permission based on the level
  let requiredPermission: PermissionName = "admin_access"; // Default fallback
  
  if (level === 2) requiredPermission = "approve_level_2";
  else if (level === 3) requiredPermission = "approve_level_3";
  else if (level === 4) requiredPermission = "approve_level_4";
  else if (level === 5) requiredPermission = "approve_security";
  
  // Check if the user can approve at this level
  if (
    !hasPermission(user, requiredPermission) && 
    !hasPermission(user, "override_workflow")
  ) {
    return Promise.reject(new Error("Permission denied"));
  }
  
  // Check if removal is at the right status for this approval level
  let expectedStatus: RemovalStatus = "DRAFT"; // Default fallback
  
  if (level === 2) expectedStatus = "PENDING_LEVEL_2";
  else if (level === 3) expectedStatus = "PENDING_LEVEL_3";
  else if (level === 4) expectedStatus = "PENDING_LEVEL_4"; 
  else if (level === 5) expectedStatus = "PENDING_SECURITY";
  
  if (removal.status !== expectedStatus && !hasPermission(user, "override_workflow")) {
    return Promise.reject(new Error(`Removal is not at the expected status for level ${level} approval`));
  }
  
  // For department approvals, check if user is in the right department
  if (
    level === 2 && 
    removal.departmentId && 
    !user.departments.some(ud => ud.departmentId === removal.departmentId) &&
    !hasPermission(user, "override_workflow")
  ) {
    return Promise.reject(new Error("You can only approve removals from your department"));
  }
  
  // Get next status
  let nextStatus: RemovalStatus = removal.status;
  
  if (level === 2) nextStatus = "PENDING_LEVEL_3";
  else if (level === 3) nextStatus = "PENDING_LEVEL_4";
  else if (level === 4) nextStatus = "PENDING_SECURITY";
  else if (level === 5) nextStatus = "APPROVED";
  
  // Create approval record
  const approval = {
    id: uuidv4(),
    removalId: id,
    level,
    approved: true,
    signature,
    signatureDate: new Date(),
    approvedById: user.id,
    approvedBy: user,
    createdAt: new Date(),
    overrideById: hasPermission(user, "override_workflow") ? user.id : undefined,
    overrideBy: hasPermission(user, "override_workflow") ? user : undefined,
    overrideAt: hasPermission(user, "override_workflow") ? new Date() : undefined
  };
  
  const updated = {
    ...removal,
    status: nextStatus,
    updatedAt: new Date(),
    approvals: [...removal.approvals, approval]
  };
  
  storage.removals[removalIndex] = updated;
  return Promise.resolve(updated);
};

export const rejectRemoval = async (
  id: string, 
  level: number,
  rejectionReason: string,
  signature: string
): Promise<Removal> => {
  const user = storage.currentUser;
  if (!user) {
    return Promise.reject(new Error("Not authenticated"));
  }
  
  const removalIndex = storage.removals.findIndex(r => r.id === id);
  if (removalIndex === -1) {
    return Promise.reject(new Error("Removal not found"));
  }
  
  const removal = storage.removals[removalIndex];
  
  // Check the required permission based on the level
  let requiredPermission: PermissionName = "admin_access"; // Default fallback
  
  if (level === 2) requiredPermission = "approve_level_2";
  else if (level === 3) requiredPermission = "approve_level_3";
  else if (level === 4) requiredPermission = "approve_level_4";
  else if (level === 5) requiredPermission = "approve_security";
  
  // Check if the user can reject at this level
  if (
    !hasPermission(user, requiredPermission) && 
    !hasPermission(user, "override_workflow")
  ) {
    return Promise.reject(new Error("Permission denied"));
  }
  
  // Create rejection record
  const rejection = {
    id: uuidv4(),
    removalId: id,
    level,
    approved: false,
    rejectionReason,
    signature,
    signatureDate: new Date(),
    approvedById: user.id,
    approvedBy: user,
    createdAt: new Date(),
    overrideById: hasPermission(user, "override_workflow") ? user.id : undefined,
    overrideBy: hasPermission(user, "override_workflow") ? user : undefined,
    overrideAt: hasPermission(user, "override_workflow") ? new Date() : undefined
  };
  
  const updated = {
    ...removal,
    status: "REJECTED" as RemovalStatus,
    rejectionReason,
    updatedAt: new Date(),
    approvals: [...removal.approvals, rejection]
  };
  
  storage.removals[removalIndex] = updated;
  return Promise.resolve(updated);
};

export const recordReturn = async (
  id: string,
  returnDate: Date,
  condition: string,
  notes?: string
): Promise<Removal> => {
  const user = storage.currentUser;
  if (!user) {
    return Promise.reject(new Error("Not authenticated"));
  }
  
  const removalIndex = storage.removals.findIndex(r => r.id === id);
  if (removalIndex === -1) {
    return Promise.reject(new Error("Removal not found"));
  }
  
  const removal = storage.removals[removalIndex];
  
  // Check if the user can record returns
  if (
    !hasPermission(user, "record_return") && 
    !hasPermission(user, "admin_access")
  ) {
    return Promise.reject(new Error("Permission denied"));
  }
  
  // Check if removal is approved and returnable
  if (removal.status !== "APPROVED" || removal.removalType !== "RETURNABLE") {
    return Promise.reject(new Error("Can only record returns for approved returnable items"));
  }
  
  const returnRecord: ReturnRecord = {
    id: uuidv4(),
    removalId: id,
    returnDate,
    condition,
    notes,
    recordedById: user.id,
    recordedBy: user,
    createdAt: new Date()
  };
  
  const updated = {
    ...removal,
    status: "RETURNED" as RemovalStatus,
    updatedAt: new Date(),
    returnRecord
  };
  
  storage.removals[removalIndex] = updated;
  return Promise.resolve(updated);
};

export const requestExtension = async (
  id: string,
  newDate: Date
): Promise<Removal> => {
  const user = storage.currentUser;
  if (!user) {
    return Promise.reject(new Error("Not authenticated"));
  }
  
  const removalIndex = storage.removals.findIndex(r => r.id === id);
  if (removalIndex === -1) {
    return Promise.reject(new Error("Removal not found"));
  }
  
  const removal = storage.removals[removalIndex];
  
  // Check if the user can manage extensions
  if (
    !hasPermission(user, "manage_extension") && 
    !hasPermission(user, "admin_access")
  ) {
    return Promise.reject(new Error("Permission denied"));
  }
  
  // Check if removal is approved and returnable
  if (removal.status !== "APPROVED" || removal.removalType !== "RETURNABLE") {
    return Promise.reject(new Error("Can only request extensions for approved returnable items"));
  }
  
  if (!removal.dateTo) {
    return Promise.reject(new Error("Removal does not have a return date"));
  }
  
  const extension: ExtensionRequest = {
    id: uuidv4(),
    removalId: id,
    originalDate: removal.dateTo,
    newDate,
    status: "PENDING",
    requestedById: user.id,
    requestedBy: user,
    createdAt: new Date()
  };
  
  const updated = {
    ...removal,
    status: "PENDING_LEVEL_2_RECHECK" as RemovalStatus,
    updatedAt: new Date(),
    extensionRequests: [...(removal.extensionRequests || []), extension]
  };
  
  storage.removals[removalIndex] = updated;
  return Promise.resolve(updated);
};

export const approveExtension = async (
  id: string,
  extensionId: string
): Promise<Removal> => {
  const user = storage.currentUser;
  if (!user) {
    return Promise.reject(new Error("Not authenticated"));
  }
  
  const removalIndex = storage.removals.findIndex(r => r.id === id);
  if (removalIndex === -1) {
    return Promise.reject(new Error("Removal not found"));
  }
  
  const removal = storage.removals[removalIndex];
  
  // Check if the user can recheck extensions
  if (
    !hasPermission(user, "recheck_extension") && 
    !hasPermission(user, "admin_access")
  ) {
    return Promise.reject(new Error("Permission denied"));
  }
  
  // Check if removal is in recheck status
  if (removal.status !== "PENDING_LEVEL_2_RECHECK") {
    return Promise.reject(new Error("Can only approve extensions for removals in recheck status"));
  }
  
  // Check if extension exists
  if (!removal.extensionRequests || removal.extensionRequests.length === 0) {
    return Promise.reject(new Error("No extension requests found"));
  }
  
  const extensionIndex = removal.extensionRequests.findIndex(e => e.id === extensionId);
  if (extensionIndex === -1) {
    return Promise.reject(new Error("Extension request not found"));
  }
  
  const extension = removal.extensionRequests[extensionIndex];
  
  // Update extension
  const updatedExtension: ExtensionRequest = {
    ...extension,
    status: "APPROVED",
    recheckById: user.id,
    recheckBy: user,
    recheckStatus: "APPROVED",
    recheckAt: new Date()
  };
  
  const updatedExtensionRequests = [...removal.extensionRequests];
  updatedExtensionRequests[extensionIndex] = updatedExtension;
  
  const updated = {
    ...removal,
    status: "APPROVED" as RemovalStatus,
    dateTo: extension.newDate, // Update the return date
    updatedAt: new Date(),
    extensionRequests: updatedExtensionRequests
  };
  
  storage.removals[removalIndex] = updated;
  return Promise.resolve(updated);
};

export const rejectExtension = async (
  id: string,
  extensionId: string
): Promise<Removal> => {
  const user = storage.currentUser;
  if (!user) {
    return Promise.reject(new Error("Not authenticated"));
  }
  
  const removalIndex = storage.removals.findIndex(r => r.id === id);
  if (removalIndex === -1) {
    return Promise.reject(new Error("Removal not found"));
  }
  
  const removal = storage.removals[removalIndex];
  
  // Check if the user can recheck extensions
  if (
    !hasPermission(user, "recheck_extension") && 
    !hasPermission(user, "admin_access")
  ) {
    return Promise.reject(new Error("Permission denied"));
  }
  
  // Check if removal is in recheck status
  if (removal.status !== "PENDING_LEVEL_2_RECHECK") {
    return Promise.reject(new Error("Can only reject extensions for removals in recheck status"));
  }
  
  // Check if extension exists
  if (!removal.extensionRequests || removal.extensionRequests.length === 0) {
    return Promise.reject(new Error("No extension requests found"));
  }
  
  const extensionIndex = removal.extensionRequests.findIndex(e => e.id === extensionId);
  if (extensionIndex === -1) {
    return Promise.reject(new Error("Extension request not found"));
  }
  
  const extension = removal.extensionRequests[extensionIndex];
  
  // Update extension
  const updatedExtension: ExtensionRequest = {
    ...extension,
    status: "REJECTED",
    recheckById: user.id,
    recheckBy: user,
    recheckStatus: "REJECTED",
    recheckAt: new Date()
  };
  
  const updatedExtensionRequests = [...removal.extensionRequests];
  updatedExtensionRequests[extensionIndex] = updatedExtension;
  
  const updated = {
    ...removal,
    status: "APPROVED" as RemovalStatus, // Return to approved status
    updatedAt: new Date(),
    extensionRequests: updatedExtensionRequests
  };
  
  storage.removals[removalIndex] = updated;
  return Promise.resolve(updated);
};

// Reports
export const generateReport = async (removalId: string, type: 'approval_form' | 'return_receipt' | 'extension_form'): Promise<string> => {
  const user = storage.currentUser;
  if (!user) {
    return Promise.reject(new Error("Not authenticated"));
  }
  
  // Check if the user can create reports
  if (
    !hasPermission(user, "create_report") && 
    !hasPermission(user, "admin_access")
  ) {
    return Promise.reject(new Error("Permission denied"));
  }
  
  // In a real app, this would generate a PDF or other document
  // For this mock, we'll just return a fake URL
  return Promise.resolve(`/reports/${type}/${removalId}`);
};
