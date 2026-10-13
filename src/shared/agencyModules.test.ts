import test from 'node:test';
import assert from 'node:assert/strict';
import { EMPLOYEE_MODULE_SET, EMPLOYEE_MODULE_IDS, DEFAULT_EMPLOYEE_MODULES, splitEmployeeModules } from './agencyModules';

test('exactly 18 operational modules, no privileged permissions', () => {
  assert.equal(EMPLOYEE_MODULE_IDS.length, 18);
  for (const id of ['admin','leadspay-master','leadspay-companies']) assert.equal(EMPLOYEE_MODULE_SET.has(id), false);
  for (const id of DEFAULT_EMPLOYEE_MODULES) assert.equal(EMPLOYEE_MODULE_SET.has(id), true);
});
test('legacy permissions are separated without silently granting admin access', () => {
  assert.deepEqual(splitEmployeeModules(['dashboard','admin','profile','leadspay-master','dashboard']), {
    valid:['dashboard','profile'],ignored:['admin','leadspay-master'],
  });
});
test('invalid, null, duplicate and unknown module fields handled', () => {
  assert.deepEqual(splitEmployeeModules(null).valid, []);
  assert.deepEqual(splitEmployeeModules(['ponto', 'ponto', 23, 'unreleased']), {
    valid:['ponto'],ignored:['unreleased'],
  });
});
