/**
 * Port : accès aux souvenirs (hexagonal architecture).
 * L'adaptateur concret (ex: FileSystemSouvenirRepository) lit depuis le système de fichiers.
 */
export interface SouvenirRepository {
  listFilenames(): Promise<string[]>;
  getBuffer(filename: string): Promise<Buffer>;
}
