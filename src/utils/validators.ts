/**
 * Email Validation
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Password Validation
 * Returns {valid: boolean, errors: string[]}
 */
export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors = [];

  if (!password) {
    errors.push('Password is required');
  } else {
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain an uppercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain a number');
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push('Password must contain a special character (!@#$%^&*)');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * File Name Validation
 */
export const validateFileName = (fileName: string): boolean => {
  if (!fileName || fileName.trim() === '') {
    return false;
  }

  // Check for invalid characters
  const invalidChars = /[<>:"|?*\x00-\x1f]/g;
  if (invalidChars.test(fileName)) {
    return false;
  }

  // Check length (max 255 characters)
  if (fileName.length > 255) {
    return false;
  }

  return true;
};

/**
 * File Size Validation
 * @param {number} fileSize - Size in bytes
 * @param {number} maxSize - Max size in bytes (default 50MB)
 */
export const validateFileSize = (fileSize: number, maxSize: number = 50 * 1024 * 1024): boolean => {
  return fileSize <= maxSize;
};

/**
 * File Type Validation
 */
export const validateFileType = (fileName: string, allowedTypes: string[] = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt']): boolean => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  return allowedTypes.includes(ext || '');
};
/**
 * Sanitize Input
 * Removes potentially dangerous characters
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') {
    return String(input);
  }

  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Sanitize File Name
 * Removes special characters from file names
 */
export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[<>:"|?*\x00-\x1f]/g, '_') // Replace invalid chars with underscore
    .replace(/\s+/g, '_') // Replace spaces with underscore
    .substring(0, 255); // Limit to 255 characters
};

/**
 * Format File Size for Display
 */
export const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Format Date for Display
 */
export const formatDate = (date: string | Date, format: string = 'long'): string => {
  if (!date) return 'N/A';

  const dateObj = new Date(date);

  if (format === 'long') {
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (format === 'short') {
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  return dateObj.toLocaleString();
};

/**
 * Validate URL
 */
export const validateURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Check Password Strength
 * Returns score 0-5
 */
export const checkPasswordStrength = (password: string): number => {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[!@#$%^&*]/.test(password)) strength++;

  return strength;
};

/**
 * Get Password Strength Label
 */
export const getPasswordStrengthLabel = (strength: number): string => {
  if (strength === 0) return 'No password';
  if (strength <= 1) return 'Weak';
  if (strength <= 2) return 'Fair';
  if (strength <= 3) return 'Good';
  return 'Strong';
};
