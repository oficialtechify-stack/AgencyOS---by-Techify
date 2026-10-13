/**
 * Eligibility check for removing a Firestore-only employee record.
 * This never authorizes removal of a Firebase Authentication user,
 * a workspace owner or a user from a different company.
 */
export type LegacyDeletionCandidate = {
  requesterUid: string;
  workspaceUid: string;
  targetUid: string;
  agencyOwnerUid: string | null | undefined;
  userType: string | null | undefined;
  storedEmail: string | null | undefined;
  confirmedEmail: string | null | undefined;
  authUserExists: boolean;
};
export function canRemoveLegacyEmployee(value: LegacyDeletionCandidate): boolean {
  if (!value.requesterUid || !value.workspaceUid || !value.targetUid) return false;
  if (value.targetUid === value.requesterUid || value.targetUid === value.workspaceUid) return false;
  if (value.userType !== 'employee' || value.agencyOwnerUid !== value.workspaceUid) return false;
  if (value.authUserExists) return false;
  const stored = (value.storedEmail || '').trim().toLowerCase();
  const confirmation = (value.confirmedEmail || '').trim().toLowerCase();
  return Boolean(stored && stored.includes('@') && confirmation === stored);
}
