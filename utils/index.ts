export { FileSystemSouvenirRepository } from './adapters/FileSystemSouvenirRepository';
export { LibsqlInteretRepository } from './adapters/LibsqlInteretRepository';
export { LibsqlUserRepository } from './adapters/LibsqlUserRepository';
export type { SouvenirRepository } from './domain/ports/SouvenirRepository';
export type { SouvenirInventoryRepository } from './domain/ports/SouvenirInventoryRepository';
export type {
  InteretRepository,
  InteretValeur,
} from './domain/ports/InteretRepository';
export {
  getInteretLabel,
  getInteretOptions,
} from './interetLabels';
export type { InteretCle, InteretOption } from './interetLabels';
export type { UserRepository } from './domain/ports/UserRepository';
export {
  ensureUserTable,
  ensureSouvenirTable,
  userTableExists,
  userTableHasColumns,
  souvenirTableExists,
  souvenirTableHasColumns,
  interetTableExists,
  interetTableHasColumns,
} from './db';
export { getSouvenirFilenames } from './use-cases/getSouvenirFilenames';
export { getSouvenirBuffer } from './use-cases/getSouvenirBuffer';
export { syncUser } from './use-cases/syncUser';

import { FileSystemSouvenirRepository } from './adapters/FileSystemSouvenirRepository';
import { LibsqlInteretRepository } from './adapters/LibsqlInteretRepository';
import { LibsqlUserRepository } from './adapters/LibsqlUserRepository';
import { db } from '@/lib/db';

export const defaultSouvenirRepository = new FileSystemSouvenirRepository();
export const defaultUserRepository = new LibsqlUserRepository(db);
export const defaultInteretRepository = new LibsqlInteretRepository(db);