import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHostedPasswordLink } from './invitationLink';

test('uses Firebase-hosted password page without blocked agency continueURL', async () => {
  const calls: unknown[][] = [];
  const mock = {
    async generatePasswordResetLink(...args: unknown[]) {
      calls.push(args);
      return 'https://agencyos-1c3fc.firebaseapp.com/__/auth/action?mode=resetPassword';
    },
  };
  const link = await createHostedPasswordLink(mock as any, 'designer@example.com');
  assert.equal(link.includes('mode=resetPassword'), true);
  assert.deepEqual(calls, [['designer@example.com']]);
});

test('propagates Firebase Auth failures instead of returning a fake link', async () => {
  const mock = { generatePasswordResetLink: async () => { throw Error('Firebase service unavailable'); } };
  await assert.rejects(createHostedPasswordLink(mock, 'staff@example.com'), /Firebase service unavailable/);
});
