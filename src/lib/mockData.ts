import { 
  User, Role, Permission, Department, UserDepartment, 
  WorkflowStep, WorkflowTransition, Removal, RemovalReason,
  PermissionName, RemovalStatus, RoleName, RemovalType
} from "@/types";
import { v4 as uuidv4 } from "uuid";

// Permission definitions
const permissions: Record<PermissionName, Permission> = {
  create_removal: { id: "p1", name: "create_removal", scope: "own" },
  view_own_removal: { id: "p2", name: "view_own_removal", scope: "own" },
  approve_level_2: { id: "p3", name: "approve_level_2", scope: "department" },
  view_department_removal: { id: "p4", name: "view_department_removal", scope: "department" },
  recheck_extension: { id: "p5", name: "recheck_extension", scope: "department" },
  approve_level_3: { id: "p6", name: "approve_level_3", scope: "global" },
  view_level_3_removal: { id: "p7", name: "view_level_3_removal", scope: "global" },
  approve_level_4: { id: "p8", name: "approve_level_4", scope: "global" },
  view_level_4_removal: { id: "p9", name: "view_level_4_removal", scope: "global" },
  approve_security: { id: "p10", name: "approve_security", scope: "global" },
  record_return: { id: "p11", name: "record_return", scope: "global" },
  manage_extension: { id: "p12", name: "manage_extension", scope: "global" },
  view_security_removal: { id: "p13", name: "view_security_removal", scope: "global" },
  create_report: { id: "p14", name: "create_report", scope: "global" },
  admin_access: { id: "p15", name: "admin_access", scope: "global" },
  override_workflow: { id: "p16", name: "override_workflow", scope: "global" },
  configure_system: { id: "p17", name: "configure_system", scope: "global" }
};

// Role definitions
export const roles: Role[] = [
  {
    id: "r1",
    name: "LEVEL_1",
    level: 1,
    permissions: [permissions.create_removal, permissions.view_own_removal]
  },
  {
    id: "r2",
    name: "LEVEL_2",
    level: 2,
    permissions: [
      permissions.approve_level_2, 
      permissions.view_department_removal, 
      permissions.recheck_extension
    ]
  },
  {
    id: "r3",
    name: "LEVEL_3",
    level: 3,
    permissions: [permissions.approve_level_3, permissions.view_level_3_removal]
  },
  {
    id: "r4",
    name: "LEVEL_4",
    level: 4,
    permissions: [permissions.approve_level_4, permissions.view_level_4_removal]
  },
  {
    id: "r5",
    name: "SECURITY",
    level: 5,
    permissions: [
      permissions.approve_security,
      permissions.record_return,
      permissions.manage_extension,
      permissions.view_security_removal,
      permissions.create_report
    ]
  },
  {
    id: "r6",
    name: "ADMIN",
    level: 6,
    permissions: [
      permissions.admin_access,
      permissions.override_workflow,
      permissions.configure_system,
      permissions.create_report
    ]
  }
];

// Department definitions
export const departments: Department[] = [
  { id: "d1", name: "IT" },
  { id: "d2", name: "Finance" },
  { id: "d3", name: "Operations" },
  { id: "d4", name: "HR" },
  { id: "d5", name: "Security" }
];

// WorkflowStep definitions
export const workflowSteps: WorkflowStep[] = [
  { id: "ws1", name: "DRAFT", displayName: "Draft", requiredPermission: "create_removal", order: 1 },
  { id: "ws2", name: "PENDING_LEVEL_2", displayName: "Department Approval", requiredPermission: "approve_level_2", order: 2 },
  { id: "ws3", name: "PENDING_LEVEL_3", displayName: "Finance Approval", requiredPermission: "approve_level_3", order: 3 },
  { id: "ws4", name: "PENDING_LEVEL_4", displayName: "Management Approval", requiredPermission: "approve_level_4", order: 4 },
  { id: "ws5", name: "PENDING_SECURITY", displayName: "Security Approval", requiredPermission: "approve_security", order: 5 },
  { id: "ws6", name: "APPROVED", displayName: "Approved", order: 6 },
  { id: "ws7", name: "REJECTED", displayName: "Rejected", order: 7 },
  { id: "ws8", name: "RETURNED", displayName: "Returned", order: 8 },
  { id: "ws9", name: "PENDING_LEVEL_2_RECHECK", displayName: "Extension Re-Check", requiredPermission: "recheck_extension", order: 9 }
];

// WorkflowTransition definitions
export const workflowTransitions: WorkflowTransition[] = [
  // User submission
  { id: "wt1", fromStep: "DRAFT", toStep: "PENDING_LEVEL_2", requiredPermission: "create_removal" },

  // Department approval
  { id: "wt2", fromStep: "PENDING_LEVEL_2", toStep: "PENDING_LEVEL_3", requiredPermission: "approve_level_2", roleId: "LEVEL_2" },
  { id: "wt3", fromStep: "PENDING_LEVEL_2", toStep: "REJECTED", requiredPermission: "approve_level_2", roleId: "LEVEL_2" },

  // Finance approval
  { id: "wt4", fromStep: "PENDING_LEVEL_3", toStep: "PENDING_LEVEL_4", requiredPermission: "approve_level_3", roleId: "LEVEL_3" },
  { id: "wt5", fromStep: "PENDING_LEVEL_3", toStep: "REJECTED", requiredPermission: "approve_level_3", roleId: "LEVEL_3" },

  // Management approval
  { id: "wt6", fromStep: "PENDING_LEVEL_4", toStep: "PENDING_SECURITY", requiredPermission: "approve_level_4", roleId: "LEVEL_4" },
  { id: "wt7", fromStep: "PENDING_LEVEL_4", toStep: "REJECTED", requiredPermission: "approve_level_4", roleId: "LEVEL_4" },

  // Security approval
  { id: "wt8", fromStep: "PENDING_SECURITY", toStep: "APPROVED", requiredPermission: "approve_security", roleId: "SECURITY" },
  { id: "wt9", fromStep: "PENDING_SECURITY", toStep: "REJECTED", requiredPermission: "approve_security", roleId: "SECURITY" },

  // Return process
  { id: "wt10", fromStep: "APPROVED", toStep: "RETURNED", requiredPermission: "record_return", roleId: "SECURITY" },

  // Extension process
  { id: "wt11", fromStep: "APPROVED", toStep: "PENDING_LEVEL_2_RECHECK", requiredPermission: "manage_extension", roleId: "SECURITY" },
  { id: "wt12", fromStep: "PENDING_LEVEL_2_RECHECK", toStep: "APPROVED", requiredPermission: "recheck_extension", roleId: "LEVEL_2" },

  // Admin override options
  { id: "wt13", fromStep: "DRAFT", toStep: "APPROVED", requiredPermission: "override_workflow", roleId: "ADMIN" },
  { id: "wt14", fromStep: "DRAFT", toStep: "REJECTED", requiredPermission: "override_workflow", roleId: "ADMIN" },
  { id: "wt15", fromStep: "PENDING_LEVEL_2", toStep: "APPROVED", requiredPermission: "override_workflow", roleId: "ADMIN" },
  { id: "wt16", fromStep: "PENDING_LEVEL_3", toStep: "APPROVED", requiredPermission: "override_workflow", roleId: "ADMIN" },
  { id: "wt17", fromStep: "PENDING_LEVEL_4", toStep: "APPROVED", requiredPermission: "override_workflow", roleId: "ADMIN" },
  { id: "wt18", fromStep: "PENDING_SECURITY", toStep: "APPROVED", requiredPermission: "override_workflow", roleId: "ADMIN" }
];

// RemovalReason definitions
export const removalReasons: RemovalReason[] = [
  { id: "rr1", name: "Business Use", allowCustom: false },
  { id: "rr2", name: "Repair or Service", allowCustom: false },
  { id: "rr3", name: "Personal Use", allowCustom: true },
  { id: "rr4", name: "Transfer to Another Department", allowCustom: false },
  { id: "rr5", name: "Equipment Replacement", allowCustom: false },
  { id: "rr6", name: "Other", allowCustom: true }
];

// Users
export const users: User[] = [
  {
    id: "u1",
    email: "employee@example.com",
    name: "Regular Employee",
    roles: [roles[0]], // LEVEL_1
    departments: [{ id: "ud1", userId: "u1", departmentId: "d1", isPrimary: true, department: departments[0] }]
  },
  {
    id: "u2",
    email: "manager@example.com",
    name: "Department Manager",
    roles: [roles[0], roles[1]], // LEVEL_1, LEVEL_2
    departments: [{ id: "ud2", userId: "u2", departmentId: "d1", isPrimary: true, department: departments[0] }]
  },
  {
    id: "u3",
    email: "finance@example.com",
    name: "Finance Approver",
    roles: [roles[2]], // LEVEL_3
    departments: [{ id: "ud3", userId: "u3", departmentId: "d2", isPrimary: true, department: departments[1] }]
  },
  {
    id: "u4",
    email: "management@example.com",
    name: "Management Approver",
    roles: [roles[3]], // LEVEL_4
    departments: [{ id: "ud4", userId: "u4", departmentId: "d3", isPrimary: true, department: departments[2] }]
  },
  {
    id: "u5",
    email: "security@example.com",
    name: "Security Officer",
    roles: [roles[4]], // SECURITY
    departments: [{ id: "ud5", userId: "u5", departmentId: "d5", isPrimary: true, department: departments[4] }]
  },
  {
    id: "u6",
    email: "admin@example.com",
    name: "System Administrator",
    roles: [roles[5]], // ADMIN
    departments: [{ id: "ud6", userId: "u6", departmentId: "d4", isPrimary: true, department: departments[3] }]
  }
];

// Sample removals with different statuses
export const sampleRemovals: Removal[] = [
  {
    id: "r1",
    userId: "u1",
    user: users[0],
    removalType: "RETURNABLE",
    dateFrom: new Date(2025, 3, 5),
    dateTo: new Date(2025, 3, 15),
    departmentId: "d1",
    department: departments[0],
    status: "PENDING_LEVEL_2",
    createdAt: new Date(2025, 3, 1),
    updatedAt: new Date(2025, 3, 1),
    items: [
      {
        id: "ri1",
        removalId: "r1",
        description: "Laptop (Dell XPS 15)",
        removalReasonId: "rr1",
        removalReason: removalReasons[0]
      }
    ],
    images: [
      {
        id: "img1",
        removalId: "r1",
        url: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        filename: "laptop.jpg",
        createdAt: new Date(2025, 3, 1)
      }
    ],
    approvals: []
  },
  {
    id: "r2",
    userId: "u1",
    user: users[0],
    removalType: "NON_RETURNABLE",
    dateFrom: new Date(2025, 2, 25),
    employee: "Jane Smith",
    departmentId: "d1",
    department: departments[0],
    status: "PENDING_LEVEL_3",
    createdAt: new Date(2025, 2, 20),
    updatedAt: new Date(2025, 2, 23),
    items: [
      {
        id: "ri2",
        removalId: "r2",
        description: "Office Supplies (Notebooks, Pens)",
        removalReasonId: "rr5",
        removalReason: removalReasons[4]
      }
    ],
    images: [
      {
        id: "img2",
        removalId: "r2",
        url: "https://images.unsplash.com/photo-1584473457406-c806a3474c03?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        filename: "supplies.jpg",
        createdAt: new Date(2025, 2, 20)
      }
    ],
    approvals: [
      {
        id: "a1",
        removalId: "r2",
        level: 2,
        approved: true,
        signature: "John Doe",
        signatureDate: new Date(2025, 2, 23),
        approvedById: "u2",
        approvedBy: users[1],
        createdAt: new Date(2025, 2, 23)
      }
    ]
  },
  {
    id: "r3",
    userId: "u1",
    user: users[0],
    removalType: "RETURNABLE",
    dateFrom: new Date(2025, 1, 10),
    dateTo: new Date(2025, 4, 30),
    departmentId: "d1",
    department: departments[0],
    status: "APPROVED",
    createdAt: new Date(2025, 1, 5),
    updatedAt: new Date(2025, 1, 15),
    items: [
      {
        id: "ri3",
        removalId: "r3",
        description: "Projector (Epson)",
        removalReasonId: "rr3",
        removalReason: removalReasons[2],
        customReason: "Company presentation at client site"
      }
    ],
    images: [
      {
        id: "img3",
        removalId: "r3",
        url: "https://images.unsplash.com/photo-1589830606058-bf4114d55352?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        filename: "projector.jpg",
        createdAt: new Date(2025, 1, 5)
      }
    ],
    approvals: [
      {
        id: "a2",
        removalId: "r3",
        level: 2,
        approved: true,
        signature: "John Doe",
        signatureDate: new Date(2025, 1, 8),
        approvedById: "u2",
        approvedBy: users[1],
        createdAt: new Date(2025, 1, 8)
      },
      {
        id: "a3",
        removalId: "r3",
        level: 3,
        approved: true,
        signature: "Sarah Finance",
        signatureDate: new Date(2025, 1, 10),
        approvedById: "u3",
        approvedBy: users[2],
        createdAt: new Date(2025, 1, 10)
      },
      {
        id: "a4",
        removalId: "r3",
        level: 4,
        approved: true,
        signature: "Mike Manager",
        signatureDate: new Date(2025, 1, 12),
        approvedById: "u4",
        approvedBy: users[3],
        createdAt: new Date(2025, 1, 12)
      },
      {
        id: "a5",
        removalId: "r3",
        level: 5,
        approved: true,
        signature: "Steve Security",
        signatureDate: new Date(2025, 1, 15),
        approvedById: "u5",
        approvedBy: users[4],
        createdAt: new Date(2025, 1, 15)
      }
    ]
  },
  {
    id: "r4",
    userId: "u1",
    user: users[0],
    removalType: "RETURNABLE",
    dateFrom: new Date(2025, 0, 5),
    dateTo: new Date(2025, 0, 15),
    departmentId: "d1",
    department: departments[0],
    status: "REJECTED",
    createdAt: new Date(2025, 0, 1),
    updatedAt: new Date(2025, 0, 3),
    rejectionReason: "Insufficient justification for business use",
    items: [
      {
        id: "ri4",
        removalId: "r4",
        description: "Company Vehicle",
        removalReasonId: "rr6",
        removalReason: removalReasons[5],
        customReason: "Weekend trip"
      }
    ],
    images: [
      {
        id: "img4",
        removalId: "r4",
        url: "https://images.unsplash.com/photo-1502877338535-766e1452684a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        filename: "car.jpg",
        createdAt: new Date(2025, 0, 1)
      }
    ],
    approvals: [
      {
        id: "a6",
        removalId: "r4",
        level: 2,
        approved: false,
        rejectionReason: "Insufficient justification for business use",
        signature: "John Doe",
        signatureDate: new Date(2025, 0, 3),
        approvedById: "u2",
        approvedBy: users[1],
        createdAt: new Date(2025, 0, 3)
      }
    ]
  },
  {
    id: "r5",
    userId: "u1",
    user: users[0],
    removalType: "RETURNABLE",
    dateFrom: new Date(2024, 11, 5),
    dateTo: new Date(2024, 11, 15),
    departmentId: "d1",
    department: departments[0],
    status: "RETURNED",
    createdAt: new Date(2024, 11, 1),
    updatedAt: new Date(2024, 11, 20),
    items: [
      {
        id: "ri5",
        removalId: "r5",
        description: "Digital Camera (Canon)",
        removalReasonId: "rr1",
        removalReason: removalReasons[0]
      }
    ],
    images: [
      {
        id: "img5",
        removalId: "r5",
        url: "https://images.unsplash.com/photo-1564466809058-bf4114d55352?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        filename: "camera.jpg",
        createdAt: new Date(2024, 11, 1)
      }
    ],
    approvals: [
      {
        id: "a7",
        removalId: "r5",
        level: 2,
        approved: true,
        signature: "John Doe",
        signatureDate: new Date(2024, 11, 3),
        approvedById: "u2",
        approvedBy: users[1],
        createdAt: new Date(2024, 11, 3)
      },
      {
        id: "a8",
        removalId: "r5",
        level: 3,
        approved: true,
        signature: "Sarah Finance",
        signatureDate: new Date(2024, 11, 5),
        approvedById: "u3",
        approvedBy: users[2],
        createdAt: new Date(2024, 11, 5)
      },
      {
        id: "a9",
        removalId: "r5",
        level: 4,
        approved: true,
        signature: "Mike Manager",
        signatureDate: new Date(2024, 11, 7),
        approvedById: "u4",
        approvedBy: users[3],
        createdAt: new Date(2024, 11, 7)
      },
      {
        id: "a10",
        removalId: "r5",
        level: 5,
        approved: true,
        signature: "Steve Security",
        signatureDate: new Date(2024, 11, 9),
        approvedById: "u5",
        approvedBy: users[4],
        createdAt: new Date(2024, 11, 9)
      }
    ],
    returnRecord: {
      id: "rr1",
      removalId: "r5",
      returnDate: new Date(2024, 11, 14),
      condition: "Good",
      notes: "Returned on time in good condition",
      recordedById: "u5",
      recordedBy: users[4],
      createdAt: new Date(2024, 11, 14)
    }
  },
  {
    id: "r6",
    userId: "u1",
    user: users[0],
    removalType: "RETURNABLE",
    dateFrom: new Date(2025, 3, 1),
    dateTo: new Date(2025, 3, 20),
    departmentId: "d1",
    department: departments[0],
    status: "DRAFT",
    createdAt: new Date(2025, 3, 1),
    updatedAt: new Date(2025, 3, 1),
    items: [
      {
        id: "ri6",
        removalId: "r6",
        description: "Monitor (Dell 27\")",
        removalReasonId: "rr1",
        removalReason: removalReasons[0]
      }
    ],
    images: [],
    approvals: []
  }
];

// Generate a new removal with ID
export const createNewRemoval = (
  userId: string,
  removalType: RemovalType,
  dateFrom: Date,
  dateTo?: Date,
  employee?: string,
  departmentId?: string,
  items: Array<{ description: string; removalReasonId: string; customReason?: string }> = []
): Removal => {
  const id = uuidv4();
  const user = users.find(u => u.id === userId)!;
  const department = departmentId ? departments.find(d => d.id === departmentId) : undefined;

  return {
    id,
    userId,
    user,
    removalType,
    dateFrom,
    dateTo,
    employee,
    departmentId,
    department,
    status: "DRAFT",
    createdAt: new Date(),
    updatedAt: new Date(),
    items: items.map((item, index) => ({
      id: `ri-${id}-${index}`,
      removalId: id,
      description: item.description,
      removalReasonId: item.removalReasonId,
      removalReason: removalReasons.find(rr => rr.id === item.removalReasonId)!,
      customReason: item.customReason
    })),
    images: [],
    approvals: []
  };
};
