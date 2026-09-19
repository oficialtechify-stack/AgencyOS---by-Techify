// lib/employeeService.ts
import { doc, setDoc, getDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { UserPermissions } from '@/types/auth';

export interface AddEmployeeParams {
  email: string;
  name: string;
  jobTitle: string;
  organizationId: string;
  permissions: UserPermissions;
  organizationSubscription: any;
}

export async function addEmployeeToCompany({
  email,
  name,
  jobTitle,
  organizationId,
  permissions,
  organizationSubscription,
}: AddEmployeeParams) {
  const cleanEmail = email.trim().toLowerCase();
  const inviteRef = doc(db, 'invited_employees', cleanEmail);

  await setDoc(inviteRef, {
    email: cleanEmail,
    name,
    jobTitle,
    organizationId,
    permissions,
    organizationSubscription,
    createdAt: new Date().toISOString(),
  });
}

export async function getInvitedEmployee(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  const inviteRef = doc(db, 'invited_employees', cleanEmail);
  const snap = await getDoc(inviteRef);
  if (snap.exists()) {
    return snap.data();
  }
  return null;
}

export async function removeInvitedEmployee(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  const inviteRef = doc(db, 'invited_employees', cleanEmail);
  await deleteDoc(inviteRef);
}

export async function listInvitedEmployeesByOrg(organizationId: string) {
  const colRef = collection(db, 'invited_employees');
  const snap = await getDocs(colRef);
  const list: any[] = [];
  snap.forEach((docSnap) => {
    const data = docSnap.data();
    if (data.organizationId === organizationId) {
      list.push({ id: docSnap.id, ...data });
    }
  });
  return list;
}
