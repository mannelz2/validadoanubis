import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface DevOnlyRouteProps {
  children: React.ReactNode;
}

export default function DevOnlyRoute({ children }: DevOnlyRouteProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const isDevelopment =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.includes('bolt.new') ||
      window.location.hostname.includes('webcontainer') ||
      import.meta.env.DEV;

    if (!isDevelopment) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const isDevelopment =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('bolt.new') ||
    window.location.hostname.includes('webcontainer') ||
    import.meta.env.DEV;

  if (!isDevelopment) {
    return null;
  }

  return <>{children}</>;
}
