export type UserRole = 'OWNER' | 'EMPLOYEE' | 'ACCOUNTANT';

export type Permission =
  | 'VIEW_DASHBOARD'
  | 'CREATE_PARTY'
  | 'CREATE_FINANCIAL_ENTRY'
  | 'RECORD_CUSTOMER_PAYMENT'
  | 'RECORD_SUPPLIER_PAYMENT'
  | 'RECORD_EXPENSE'
  | 'EDIT_FINANCIAL_ENTRY'
  | 'SOFT_DELETE_FINANCIAL_ENTRY'
  | 'VIEW_REPORTS'
  | 'EXPORT_REPORTS'
  | 'MANAGE_USERS'
  | 'RESTORE_BACKUP'
  | 'SECURITY_SETTINGS'
  | 'CLOSE_DAY'
  | 'REOPEN_DAY';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  OWNER: [
    'VIEW_DASHBOARD',
    'CREATE_PARTY',
    'CREATE_FINANCIAL_ENTRY',
    'RECORD_CUSTOMER_PAYMENT',
    'RECORD_SUPPLIER_PAYMENT',
    'RECORD_EXPENSE',
    'EDIT_FINANCIAL_ENTRY',
    'SOFT_DELETE_FINANCIAL_ENTRY',
    'VIEW_REPORTS',
    'EXPORT_REPORTS',
    'MANAGE_USERS',
    'RESTORE_BACKUP',
    'SECURITY_SETTINGS',
    'CLOSE_DAY',
    'REOPEN_DAY',
  ],
  EMPLOYEE: [
    'VIEW_DASHBOARD',
    'CREATE_PARTY',
    'CREATE_FINANCIAL_ENTRY',
    'RECORD_CUSTOMER_PAYMENT',
    'RECORD_SUPPLIER_PAYMENT',
    'RECORD_EXPENSE',
    'VIEW_REPORTS', // Daily/cash view
    'CLOSE_DAY',
  ],
  ACCOUNTANT: [
    'VIEW_DASHBOARD',
    'CREATE_PARTY',
    'VIEW_REPORTS',
    'EXPORT_REPORTS',
  ],
};

export function hasPermission(role: string, permission: Permission): boolean {
  const normRole = (role || 'EMPLOYEE').toUpperCase() as UserRole;
  const list = ROLE_PERMISSIONS[normRole] || [];
  return list.includes(permission);
}
