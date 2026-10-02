import { AppError } from '@/lib/errors/app-error';
import { hasPermission, Permission, UserRole } from './roles';

export function assertPermission(role: string, permission: Permission, message?: string) {
  if (!hasPermission(role, permission)) {
    throw new AppError({
      code: 'FORBIDDEN',
      message: message || `Role ${role} does not have permission: ${permission}`,
      statusCode: 403,
    });
  }
}

export function assertOwner(role: string, message = 'Only the shop owner can perform this action.') {
  if (role.toUpperCase() !== 'OWNER') {
    throw new AppError({
      code: 'FORBIDDEN',
      message,
      statusCode: 403,
    });
  }
}
