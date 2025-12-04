import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

let sessionId = '';

function getSessionId(): string {
  if (!sessionId) {
    sessionId = sessionStorage.getItem('user_session_id') || '';
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('user_session_id', sessionId);
    }
  }
  return sessionId;
}

async function getFingerprint(): Promise<any> {
  try {
    if (typeof window !== 'undefined' && (window as any).FYCLOAK_FINGERPRINT) {
      return (window as any).FYCLOAK_FINGERPRINT;
    }
    return null;
  } catch (error) {
    console.error('Error getting fingerprint:', error);
    return null;
  }
}

async function getUserIP(): Promise<string | null> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error getting IP:', error);
    return null;
  }
}

export async function logUserActivity(eventType: string, metadata: any = {}) {
  try {
    const fingerprint = await getFingerprint();
    const sessionIdValue = getSessionId();
    const ipAddress = await getUserIP();

    const logData = {
      session_id: sessionIdValue,
      user_agent: navigator.userAgent,
      ip_address: ipAddress,
      fingerprint: fingerprint,
      page_url: window.location.href,
      event_type: eventType,
      metadata: {
        ...metadata,
        screen_width: window.screen.width,
        screen_height: window.screen.height,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
        language: navigator.language,
        platform: navigator.platform,
        referrer: document.referrer || null,
      },
    };

    const { error } = await supabase.from('user_logs').insert(logData);

    if (error) {
      console.error('Error logging user activity:', error);
    }
  } catch (error) {
    console.error('Error in logUserActivity:', error);
  }
}

export function initUserLogger() {
  logUserActivity('pageview');

  window.addEventListener('beforeunload', () => {
    logUserActivity('page_leave', {
      time_on_page: Date.now(),
    });
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      logUserActivity('page_hidden');
    } else {
      logUserActivity('page_visible');
    }
  });

  let fyCloakCheckInterval: NodeJS.Timeout;
  if (typeof window !== 'undefined') {
    fyCloakCheckInterval = setInterval(() => {
      if ((window as any).FYCLOAK_FINGERPRINT) {
        logUserActivity('fingerprint_captured', {
          fingerprint_data: (window as any).FYCLOAK_FINGERPRINT,
        });
        clearInterval(fyCloakCheckInterval);
      }
    }, 1000);

    setTimeout(() => {
      clearInterval(fyCloakCheckInterval);
    }, 30000);
  }
}
