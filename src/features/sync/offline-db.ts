import Dexie, { Table } from 'dexie';

export interface LocalSyncCommand {
  id?: number;
  idempotencyKey: string;
  commandType: string;
  payload: any;
  status: 'PENDING' | 'SYNCED' | 'FAILED';
  clientCreatedAt: string;
  error?: string;
}

export class KiranaOfflineDatabase extends Dexie {
  commands!: Table<LocalSyncCommand, number>;

  constructor() {
    super('KiranaKhataOfflineDB');
    this.version(1).stores({
      commands: '++id, idempotencyKey, commandType, status, clientCreatedAt',
    });
  }
}

export const offlineDb = typeof window !== 'undefined' ? new KiranaOfflineDatabase() : null;

export async function enqueueOfflineCommand(commandType: string, payload: any): Promise<string> {
  if (!offlineDb) return '';

  const idempotencyKey = `cmd_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  await offlineDb.commands.add({
    idempotencyKey,
    commandType,
    payload,
    status: 'PENDING',
    clientCreatedAt: new Date().toISOString(),
  });

  return idempotencyKey;
}

export async function getPendingCommands(): Promise<LocalSyncCommand[]> {
  if (!offlineDb) return [];
  return offlineDb.commands.where('status').equals('PENDING').toArray();
}
