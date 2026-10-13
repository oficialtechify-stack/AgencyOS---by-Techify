// lib/authService.ts
import { GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, setStoredSession } from './firebase';
import { UserProfile } from '@/types/auth';
import { getDefaultPermissionsForPlan } from './plans';

export async function loginWithGoogle(selectedPlan: 'starter' | 'professional' | 'enterprise' = 'professional') {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    return await handleUserAuthentication(user, selectedPlan);
  } catch (error: any) {
    if (error.code === 'auth/unauthorized-domain') {
      console.warn('Ambiente de iframe detectado. Adicione o domínio ao Firebase Console.');
    }
    throw error;
  }
}

export async function handleUserAuthentication(user: User, plan: 'starter' | 'professional' | 'enterprise') {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  // 1. Se o usuário já existe na base
  if (userSnap.exists()) {
    const existingData = userSnap.data() as UserProfile;
    setStoredSession({
      uid: existingData.uid || user.uid,
      email: existingData.email || user.email || '',
      name: existingData.displayName || user.displayName || 'Usuário',
    });
    return existingData;
  }

  // 2. Verificar se o e-mail foi pré-cadastrado como funcionário por alguma empresa
  const invitedRef = doc(db, 'invited_employees', user.email!.toLowerCase());
  const invitedSnap = await getDoc(invitedRef);

  if (invitedSnap.exists()) {
    const inviteData = invitedSnap.data();
    
    const employeeProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName || inviteData.name,
      photoURL: user.photoURL || '',
      role: 'employee',
      organizationId: inviteData.organizationId,
      jobTitle: inviteData.jobTitle,
      permissions: inviteData.permissions,
      subscription: inviteData.organizationSubscription, // herda a assinatura da empresa
    };

    await setDoc(userRef, employeeProfile);
    setStoredSession({
      uid: employeeProfile.uid,
      email: employeeProfile.email,
      name: employeeProfile.displayName,
    });
    return employeeProfile;
  }

  // 3. Caso especial: Conta Master / Empresa Principal (rickmarketing81@gmail.com)
  if (user.emailVerified && user.email?.toLowerCase() === 'rickmarketing81@gmail.com') {
    const masterProfile: UserProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || 'Marcos Henrique (CEO)',
      photoURL: user.photoURL || '',
      role: 'master',
      organizationId: 'master_agency',
      jobTitle: 'CEO / Admin Master',
      permissions: getDefaultPermissionsForPlan('enterprise'),
      subscription: {
        plan: 'enterprise',
        status: 'active',
        trialEndsAt: new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000).toISOString(),
        isMasterAccount: true,
      },
    };

    await setDoc(userRef, masterProfile);
    setStoredSession({
      uid: masterProfile.uid,
      email: masterProfile.email,
      name: masterProfile.displayName,
    });
    return masterProfile;
  }

  // 4. Nova Empresa/Cliente — Criação de conta com 14 Dias Grátis
  const now = new Date();
  const trialEnds = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // +14 dias

  const newCompanyProfile: UserProfile = {
    uid: user.uid,
    email: user.email!,
    displayName: user.displayName || 'Nova Agência',
    photoURL: user.photoURL || '',
    role: 'owner',
    organizationId: `org_${user.uid}`,
    jobTitle: 'Dono / CEO',
    permissions: getDefaultPermissionsForPlan(plan),
    subscription: {
      plan,
      status: 'trialing',
      trialEndsAt: trialEnds.toISOString(),
    },
  };

  await setDoc(userRef, newCompanyProfile);
  setStoredSession({
    uid: newCompanyProfile.uid,
    email: newCompanyProfile.email,
    name: newCompanyProfile.displayName,
  });
  return newCompanyProfile;
}

// A direct email string must never authenticate a user.
// This deprecated entry point explicitly refuses legacy impersonation calls.
export async function authenticateWithGoogleEmailDirect(
  email: string,
  displayName?: string,
  photoURL?: string,
  plan: 'starter' | 'professional' | 'enterprise' = 'professional'
): Promise<UserProfile> {
  throw new Error('Acesso direto por e-mail foi desativado por segurança. Entre usando o Google ou e-mail e senha no Firebase Auth.');
}
