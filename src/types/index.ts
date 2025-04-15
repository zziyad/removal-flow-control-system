
// User and authentication types
export interface User {
  id: string;
  email: string;
  name: string;
  roles: Role[];
  departments: UserDepartment[];
}

export interface UserDepartment {
  id: string;
  departmentId: string;
  userId: string;
  isPrimary: boolean;
  department: Department;
}

export interface Department {
  id: string;
  name: string;
}

export interface Role {
  id: string;
  name: RoleName;
  level: number;
  permissions: Permission[];
}

export type RoleName = 
  | 'LEVEL_1'
  | 'LEVEL_2'
  | 'LEVEL_3'
  | 'LEVEL_4'
  | 'SECURITY'
  | 'ADMIN';

export type PermissionName =
  | 'create_removal'
  | 'view_own_removal'
  | 'approve_level_2'
  | 'view_department_removal'
  | 'recheck_extension'
  | 'approve_level_3'
  | 'view_level_3_removal'
  | 'approve_level_4'
  | 'view_level_4_removal'
  | 'approve_security'
  | 'record_return'
  | 'manage_extension'
  | 'view_security_removal'
  | 'create_report'
  | 'admin_access'
  | 'override_workflow'
  | 'configure_system';

export type PermissionScope = 'own' | 'department' | 'global';

export interface Permission {
  id: string;
  name: PermissionName;
  scope: PermissionScope;
}

// Workflow types
export type RemovalStatus = 
  | 'DRAFT'
  | 'PENDING_LEVEL_2'
  | 'PENDING_LEVEL_3'
  | 'PENDING_LEVEL_4'
  | 'PENDING_SECURITY'
  | 'APPROVED'
  | 'REJECTED'
  | 'RETURNED'
  | 'PENDING_LEVEL_2_RECHECK';

export interface WorkflowStep {
  id: string;
  name: RemovalStatus;
  displayName: string;
  requiredPermission?: PermissionName;
  order: number;
}

export interface WorkflowTransition {
  id: string;
  fromStep: string; // WorkflowStep.name
  toStep: string;   // WorkflowStep.name
  requiredPermission: PermissionName;
  roleId?: RoleName;
}

// Removal types
export type RemovalType = 'RETURNABLE' | 'NON_RETURNABLE';

export interface Removal {
  id: string;
  userId: string;
  user: User;
  removalType: RemovalType;
  dateFrom: Date;
  dateTo?: Date;
  employee?: string;
  departmentId?: string;
  department?: Department;
  status: RemovalStatus;
  createdAt: Date;
  updatedAt: Date;
  items: RemovalItem[];
  images: RemovalImage[];
  approvals: Approval[];
  rejectionReason?: string;
  dueDateNotified?: boolean;
  returnRecord?: ReturnRecord;
  extensionRequests?: ExtensionRequest[];
}

export interface RemovalItem {
  id: string;
  removalId: string;
  description: string;
  removalReasonId: string;
  removalReason: RemovalReason;
  customReason?: string;
}

export interface RemovalReason {
  id: string;
  name: string;
  allowCustom: boolean;
}

export interface RemovalImage {
  id: string;
  removalId: string;
  url: string;
  filename: string;
  createdAt: Date;
}

export interface Approval {
  id: string;
  removalId: string;
  level: number;
  approved: boolean;
  rejectionReason?: string;
  signature?: string;
  signatureDate?: Date;
  approvedById: string;
  approvedBy: User;
  createdAt: Date;
  overrideById?: string;
  overrideBy?: User;
  overrideAt?: Date;
}

export interface ReturnRecord {
  id: string;
  removalId: string;
  returnDate: Date;
  condition: string;
  notes?: string;
  recordedById: string;
  recordedBy: User;
  createdAt: Date;
}

export interface ExtensionRequest {
  id: string;
  removalId: string;
  originalDate: Date;
  newDate: Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedById: string;
  requestedBy: User;
  createdAt: Date;
  recheckById?: string;
  recheckBy?: User;
  recheckStatus?: 'APPROVED' | 'REJECTED';
  recheckAt?: Date;
}

export interface Report {
  id: string;
  removalId: string;
  type: 'approval_form' | 'return_receipt' | 'extension_form';
  url: string;
  createdAt: Date;
  createdById: string;
  createdBy: User;
}

export interface RemovalNotification {
  id: string;
  removalId: string;
  userId: string;
  type: 'APPROVAL' | 'REJECTION' | 'RETURN_DUE' | 'EXTENSION_APPROVED' | 'EXTENSION_REJECTED';
  message: string;
  rejectionReason?: string;
  read: boolean;
  createdAt: Date;
}
