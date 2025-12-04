import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const BackRedirect: React.FC = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Preserve all URL parameters including UTMs
    const currentParams = new URLSearchParams(location.search);
    const warningUrl = `/aviso`;
    
    // Build the redirect URL with all parameters
    const urlBackRedirect = warningUrl + 
      (currentParams.toString() ? '?' + currentParams.toString() : '');
    
    history.pushState({}, '', location.href);
    history.pushState({}, '', location.href);
    
    const handlePopState = () => {
      setTimeout(() => {
        window.location.href = urlBackRedirect;
      }, 1);
    };
    
    window.onpopstate = handlePopState;
    
    return () => {
      window.onpopstate = null;
    };
  }, [location]);

  return null;
};

export default BackRedirect;