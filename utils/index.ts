export { FileSystemSouvenirRepository } from './adapters/FileSystemSouvenirRepository';
export { LibsqlInteretRepository } from './adapters/LibsqlInteretRepository';
export { LibsqlEtiquetteRepository } from './adapters/LibsqlEtiquetteRepository';
export { LibsqlUserRepository } from './adapters/LibsqlUserRepository';
export type { EtiquetteRepository } from './domain/ports/EtiquetteRepository';
export type { SouvenirRepository } from './domain/ports/SouvenirRepository';
export type { SouvenirInventoryRepository } from './domain/ports/SouvenirInventoryRepository';
export type { SouvenirFileDeleter } from './domain/ports/SouvenirFileDeleter';
export { FileSystemSouvenirFileDeleter } from './adapters/FileSystemSouvenirFileDeleter';
export { CloudinarySouvenirRepository } from './adapters/CloudinarySouvenirRepository';
export { CloudinarySouvenirFileDeleter } from './adapters/CloudinarySouvenirFileDeleter';
export { deleteSouvenir } from './use-cases/deleteSouvenir';
export type {
  InteretRepository,
  InteretValeur,
} from './domain/ports/InteretRepository';
export { isAdminEmail } from './isAdmin';
export {
  filterSouvenirsByEtiquettes,
  isEtiquetteAdminOnly,
  SANS_ETIQUETTE,
} from './filterSouvenirsByEtiquettes';
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
  ensureEtiquetteTable,
  ensureSouvenirEtiquetteTable,
  etiquetteTableExists,
  souvenirEtiquetteTableExists,
} from './db';
export { getSouvenirFilenames } from './use-cases/getSouvenirFilenames';
export { getSouvenirBuffer } from './use-cases/getSouvenirBuffer';
export { syncUser } from './use-cases/syncUser';

import { join } from 'path';
import { CloudinarySouvenirRepository } from './adapters/CloudinarySouvenirRepository';
import { CloudinarySouvenirFileDeleter } from './adapters/CloudinarySouvenirFileDeleter';
import { FileSystemSouvenirRepository } from './adapters/FileSystemSouvenirRepository';
import { FileSystemSouvenirFileDeleter } from './adapters/FileSystemSouvenirFileDeleter';
import { LibsqlInteretRepository } from './adapters/LibsqlInteretRepository';
import { LibsqlEtiquetteRepository } from './adapters/LibsqlEtiquetteRepository';
import { LibsqlUserRepository } from './adapters/LibsqlUserRepository';
import { db } from '@/lib/db';

const useFilesystem =
  typeof process !== 'undefined' && process.env.SOUVENIR_REPO === 'filesystem';

const cwd = typeof process !== 'undefined' ? process.cwd() : '';

export const defaultSouvenirRepository = useFilesystem
  ? new FileSystemSouvenirRepository()
  : new CloudinarySouvenirRepository();
export const defaultSouvenirFileDeleter = useFilesystem
  ? new FileSystemSouvenirFileDeleter(
      join(cwd, 'data', 'input', 'done'),
      join(cwd, 'data', 'input', 'trash'),
      join(cwd, 'data', 'souvenirs', 'webp'),
      join(cwd, 'data', 'souvenirs', 'miniature')
    )
  : new CloudinarySouvenirFileDeleter();

export const defaultUserRepository = new LibsqlUserRepository(db);
export const defaultInteretRepository = new LibsqlInteretRepository(db);
export const defaultEtiquetteRepository = new LibsqlEtiquetteRepository(db);