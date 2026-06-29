'use client';

import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { App } from 'antd';
import { Role } from '@/shared/components/layout/layout.menu';
import { useMyTutorProfile } from '@/shared/services/api/queries/useProfile.query';

interface TutorProfileGuardProps {
  children: React.ReactNode;
}

export default function TutorProfileGuard({ children }: TutorProfileGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { message } = App.useApp();
  // @ts-ignore
  const role = session?.user?.role as Role | undefined;

  // Use the new robust hook that fetches /tutor/me
  // This avoids userId mismatch or session delays regarding userId availability (token is enough)
  const { data: profile, isLoading, isError } = useMyTutorProfile();
  const [hasNotified, setHasNotified] = useState(false);

  // Check only if authenticated and is tutor and NOT on profile page
  const shouldCheck = status === 'authenticated' && role === 'tutor' && pathname !== '/tutor/profile';

  useEffect(() => {
    if (!shouldCheck) return;
    if (isLoading) return; // Wait until check completes
    
    const hasProfile = !!profile;

    if (!hasProfile && !hasNotified) {
      setHasNotified(true);
      message.warning('Please create your tutor profile to continue.');
      router.push('/tutor/profile');
    }
  }, [shouldCheck, isLoading, profile, isError, hasNotified, router]);

  // While checking, we might want to show a loader or just render nothing to prevent flash?
  // But rendered children usually are just the layout shell, so maybe it's fine to show them.
  // If we block rendering, the layout (sidebar/header) might disappear which is bad.
  // So we render children. The redirect happens quickly if needed.

  return <>{children}</>;
}
