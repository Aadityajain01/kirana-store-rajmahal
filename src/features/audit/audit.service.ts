import { findAuditLogs } from './audit.repository';

export async function getAuditEvents(shopId: string, limit = 50) {
  return findAuditLogs(shopId, limit);
}
