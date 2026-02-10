export { FileSystemSouvenirRepository } from './adapters/FileSystemSouvenirRepository';
export { LibsqlUserRepository } from './adapters/LibsqlUserRepository';
export type { SouvenirRepository } from './domain/ports/SouvenirRepository';
export type { UserRepository } from './domain/ports/UserRepository';
export { ensureUserTable, userTableExists, userTableHasColumns } from './db';
export { getSouvenirFilenames } from './use-cases/getSouvenirFilenames';
export { getSouvenirBuffer } from './use-cases/getSouvenirBuffer';
export { syncUser } from './use-cases/syncUser';

import { FileSystemSouvenirRepository } from './adapters/FileSystemSouvenirRepository';
import { LibsqlUserRepository } from './adapters/LibsqlUserRepository';
import { db } from '@/lib/db';

export const defaultSouvenirRepository = new FileSystemSouvenirRepository();
export const defaultUserRepository = new LibsqlUserRepository(db);
