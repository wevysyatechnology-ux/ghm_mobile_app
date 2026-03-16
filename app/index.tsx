import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import StartupLoadingView from '@/components/shared/StartupLoadingView';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isProfileComplete, isLoading } = useAuth();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    const minDisplayTimer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 2500);

    return () => clearTimeout(minDisplayTimer);
  }, []);

  useEffect(() => {
    console.log('Index screen - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated, 'isProfileComplete:', isProfileComplete, 'minTimeElapsed:', minTimeElapsed);

    if (!isLoading && minTimeElapsed) {
      if (!isAuthenticated) {
        console.log('Redirecting to login');
        router.replace('/auth/login');
      } else if (!isProfileComplete) {
        console.log('Redirecting to profile setup');
        router.replace('/auth/profile-setup');
      } else {
        console.log('Redirecting to tabs');
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, isProfileComplete, isLoading, minTimeElapsed]);

  return <StartupLoadingView />;
}
