// Input validation and sanitization utilities

export function sanitizeInput(input: string, maxLength: number = 500): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Remove HTML tags, scripts, and potentially malicious content
  const cleaned = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>?/gm, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/expression\(/gi, '')
    .trim();
  
  // Limit length
  return cleaned.substring(0, maxLength);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors };
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return { isValid: errors.length === 0, errors };
}

export function validateName(name: string, fieldName: string = 'Name'): { isValid: boolean; error?: string } {
  if (!name || typeof name !== 'string') {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  const sanitized = sanitizeInput(name, 100);
  if (sanitized.length === 0) {
    return { isValid: false, error: `${fieldName} contains invalid characters` };
  }
  
  if (sanitized.length > 100) {
    return { isValid: false, error: `${fieldName} must be less than 100 characters` };
  }
  
  // Check for potentially malicious patterns
  if (/[<>\"'&]/.test(sanitized)) {
    return { isValid: false, error: `${fieldName} contains invalid characters` };
  }
  
  return { isValid: true };
}

export function validateTextArea(text: string, maxLength: number = 500, fieldName: string = 'Text'): { isValid: boolean; error?: string } {
  if (!text || typeof text !== 'string') {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  const sanitized = sanitizeInput(text, maxLength);
  if (sanitized.length === 0) {
    return { isValid: false, error: `${fieldName} contains invalid characters` };
  }
  
  if (sanitized.length > maxLength) {
    return { isValid: false, error: `${fieldName} must be less than ${maxLength} characters` };
  }
  
  return { isValid: true };
}

// Rate limiting helper for frontend
export class ClientRateLimit {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  
  checkLimit(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(key);
    
    if (!attempt || now > attempt.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (attempt.count >= maxAttempts) {
      return false;
    }
    
    attempt.count++;
    this.attempts.set(key, attempt);
    return true;
  }
  
  getRemainingTime(key: string): number {
    const attempt = this.attempts.get(key);
    if (!attempt) return 0;
    
    const remaining = attempt.resetTime - Date.now();
    return Math.max(0, remaining);
  }
}