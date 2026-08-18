import { useEffect, useState } from 'react';
import { onValue, ref, set } from 'firebase/database';
import { database } from '../lib/firebase';
import type { AuthUser } from '../types';

export function useOwnerRole(user: AuthUser | null, isDemo: boolean) {
  const [isOwner, setIsOwner] = useState(isDemo);

  useEffect(() => {
    if (isDemo) {
      setIsOwner(true);
      return undefined;
    }
    if (!user) {
      setIsOwner(false);
      return undefined;
    }

    const roleRef = ref(database, `kayla/members/${user.uid}/role`);
    let active = true;
    const stop = onValue(
      roleRef,
      async (snapshot) => {
        if (snapshot.val() === 'owner') {
          if (active) setIsOwner(true);
          return;
        }
        try {
          // Database Rules only allow the whitelisted Owner account to create
          // this marker. Family accounts remain on the family UI without
          // exposing either login ID in the public application bundle.
          await set(roleRef, 'owner');
          if (active) setIsOwner(true);
        } catch {
          if (active) setIsOwner(false);
        }
      },
      () => {
        if (active) setIsOwner(false);
      },
      { onlyOnce: true },
    );

    return () => {
      active = false;
      stop();
    };
  }, [user, isDemo]);

  return isOwner;
}
