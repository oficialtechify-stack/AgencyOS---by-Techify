/**
 * Creates a Firebase-hosted password setup link for a new invited user.
 * No ActionCodeSettings are passed intentionally: adding a continue URL
 * requires the domain to be registered in Firebase Authentication.
 * Without the optional settings Firebase handles the password action on
 * its default hosted auth page and does not require an app redirect domain.
 */
export interface PasswordLinkAuth {
  generatePasswordResetLink(email: string): Promise<string>;
}
export function createHostedPasswordLink(auth: PasswordLinkAuth, email: string) {
  return auth.generatePasswordResetLink(email);
}
