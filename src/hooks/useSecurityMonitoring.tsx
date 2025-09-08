import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface SecurityEvent {
  event_type: string;
  event_data?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

export const useSecurityMonitoring = () => {
  const { user } = useAuth();

  const logSecurityEvent = useCallback(async (event: SecurityEvent) => {
    if (!user) return;

    try {
      // Get client info
      const userAgent = navigator.userAgent;
      
      // Try to get IP (note: this won't work in all environments)
      let clientIP: string | undefined;
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        clientIP = data.ip;
      } catch {
        // IP detection failed, continue without it
      }

      await supabase.rpc('log_security_event', {
        p_user_id: user.id,
        p_event_type: event.event_type,
        p_event_data: event.event_data || null,
        p_ip_address: clientIP || null,
        p_user_agent: userAgent
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }, [user]);

  const logAuthEvent = useCallback((eventType: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOGOUT' | 'SIGNUP_SUCCESS' | 'SIGNUP_FAILED', data?: Record<string, any>) => {
    logSecurityEvent({
      event_type: eventType,
      event_data: data
    });
  }, [logSecurityEvent]);

  const logSuspiciousActivity = useCallback((description: string, data?: Record<string, any>) => {
    logSecurityEvent({
      event_type: 'SUSPICIOUS_ACTIVITY',
      event_data: {
        description,
        ...data
      }
    });
  }, [logSecurityEvent]);

  const logAccessAttempt = useCallback((resource: string, allowed: boolean, reason?: string) => {
    logSecurityEvent({
      event_type: allowed ? 'ACCESS_GRANTED' : 'ACCESS_DENIED',
      event_data: {
        resource,
        reason
      }
    });
  }, [logSecurityEvent]);

  // Monitor for suspicious patterns
  useEffect(() => {
    if (!user) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        logSecurityEvent({
          event_type: 'SESSION_INACTIVE',
          event_data: { timestamp: new Date().toISOString() }
        });
      } else {
        logSecurityEvent({
          event_type: 'SESSION_ACTIVE',
          event_data: { timestamp: new Date().toISOString() }
        });
      }
    };

    const handleBeforeUnload = () => {
      logSecurityEvent({
        event_type: 'SESSION_END',
        event_data: { timestamp: new Date().toISOString() }
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Log session start
    logSecurityEvent({
      event_type: 'SESSION_START',
      event_data: { timestamp: new Date().toISOString() }
    });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user, logSecurityEvent]);

  return {
    logSecurityEvent,
    logAuthEvent,
    logSuspiciousActivity,
    logAccessAttempt
  };
};

// Global error boundary for security monitoring
export const useGlobalErrorMonitoring = () => {
  const { logSecurityEvent } = useSecurityMonitoring();

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Log client-side errors that might indicate security issues
      if (
        event.error?.message?.includes('script') ||
        event.error?.message?.includes('injection') ||
        event.error?.message?.includes('xss') ||
        event.filename?.includes('eval') ||
        event.filename?.includes('javascript:')
      ) {
        logSecurityEvent({
          event_type: 'POTENTIAL_XSS_ATTEMPT',
          event_data: {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          }
        });
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Log unhandled promise rejections that might indicate security issues
      if (
        event.reason?.message?.includes('fetch') ||
        event.reason?.message?.includes('cors') ||
        event.reason?.message?.includes('unauthorized')
      ) {
        logSecurityEvent({
          event_type: 'POTENTIAL_API_ABUSE',
          event_data: {
            reason: event.reason?.message || 'Unknown rejection',
            stack: event.reason?.stack?.substring(0, 500) // Limit stack trace size
          }
        });
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [logSecurityEvent]);
};