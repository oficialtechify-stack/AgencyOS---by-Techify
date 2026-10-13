import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canRemoveLegacyEmployee } from './legacyAccountDeletion';

const valid = {
  requesterUid: 'owner-firebase',
  workspaceUid: 'old-workspace-uid',
  targetUid: 'legacy-employee',
  agencyOwnerUid: 'old-workspace-uid',
  userType: 'employee',
  storedEmail: 'vitoriajobo02@gmail.com',
  confirmedEmail: 'vitoriajobo02@gmail.com',
  authUserExists: false,
};
test('allows only matching inactive legacy profile owned by verified workspace', () => {
  assert.equal(canRemoveLegacyEmployee(valid), true);
  assert.equal(canRemoveLegacyEmployee({...valid, confirmedEmail:'VITORIAJOBO02@GMAIL.COM'}), true);
});
test('blocks deletion of Firebase Auth users, cross-tenant accounts and owners', () => {
  assert.equal(canRemoveLegacyEmployee({...valid, authUserExists:true}), false);
  assert.equal(canRemoveLegacyEmployee({...valid, agencyOwnerUid:'company-b'}), false);
  assert.equal(canRemoveLegacyEmployee({...valid, targetUid:'owner-firebase'}), false);
  assert.equal(canRemoveLegacyEmployee({...valid, targetUid:'old-workspace-uid'}), false);
  assert.equal(canRemoveLegacyEmployee({...valid, userType:'client'}), false);
});
test('requires exact email confirmation', () => {
  assert.equal(canRemoveLegacyEmployee({...valid, confirmedEmail:'another@gmail.com'}), false);
  assert.equal(canRemoveLegacyEmployee({...valid, confirmedEmail:''}), false);
  assert.equal(canRemoveLegacyEmployee({...valid, storedEmail:''}), false);
});
