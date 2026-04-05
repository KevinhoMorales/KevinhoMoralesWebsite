/** Registro de lista de espera en Firestore (`prod/admin/waitlist`). */
export interface WaitlistEntry {
  id: string;
  email: string;
  emailLower?: string;
  firstName?: string;
  lastName?: string;
  /** Derivable desde nombre + apellido; puede existir en registros antiguos. */
  displayName?: string;
  /** Solo registros antiguos. */
  organization?: string;
  source?: string;
  userAgent?: string;
  createdAt: string | null;
  updatedAt: string | null;
}
