/**
 * US-5.3 : Détection de l'administrateur par email (session).
 */
const ADMIN_EMAIL = 'alain@maep.fr';

export function isAdminEmail(email: string): boolean {
  return email === ADMIN_EMAIL;
}
