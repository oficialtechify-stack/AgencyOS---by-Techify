'use client';

import React, { useEffect, useState } from 'react';
import { LeadsPayMasterView } from '../../../src/views/LeadsPayMasterView';
import { getStoredSession, subscribeToUserProfile, FirestoreUserProfile } from '../../../src/lib/firebase';

export default function LeadsPayMasterDashboard() {
  const [profile, setProfile] = useState<FirestoreUserProfile | null>(null);

  useEffect(() => {
    const session = getStoredSession();
    if (session?.uid) {
      const unsub = subscribeToUserProfile(session.uid, (p) => {
        if (p) setProfile(p);
      });
      return () => unsub();
    }
  }, []);

  return <LeadsPayMasterView currentUser={profile} />;
}
