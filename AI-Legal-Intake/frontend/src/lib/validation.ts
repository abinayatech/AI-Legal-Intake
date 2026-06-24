/**
 * Shared client-side validation helpers.
 * Pure functions, no UI — forms call these and render the returned
 * message (or null when valid) next to the relevant field.
 */

export function validateName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "Name is required";
  if (trimmed.length < 2) return "Name must be at least 2 characters";
  if (trimmed.length > 100) return "Name must be under 100 characters";
  if (!/^[a-zA-Z\s'.-]+$/.test(trimmed)) {
    return "Name can only contain letters, spaces, and basic punctuation";
  }
  return null;
}

export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) return "Email is required";
  // RFC-5322-lite — good enough for client-side UX; server is source of truth.
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(trimmed)) return "Enter a valid email address";
  return null;
}

export type PasswordStrength = {
  valid: boolean;
  message: string | null;
  score: 0 | 1 | 2 | 3 | 4;
};

export function validatePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return { valid: false, message: "Password is required", score: 0 };
  }

  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = Math.min(checks.filter(Boolean).length, 4) as 0 | 1 | 2 | 3 | 4;

  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters", score };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Add at least one uppercase letter", score };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Add at least one lowercase letter", score };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Add at least one number", score };
  }

  return { valid: true, message: null, score };
}

export function validateConfirmPassword(
  password: string,
  confirmPassword: string,
): string | null {
  if (!confirmPassword) return "Please confirm your password";
  if (password !== confirmPassword) return "Passwords do not match";
  return null;
}

export function validatePhone(phone: string): string | null {
  const trimmed = phone.trim();
  if (!trimmed) return null; // phone is optional across the app
  if (!/^\+?[0-9]{7,15}$/.test(trimmed)) {
    return "Enter a valid phone number (7–15 digits, optional +)";
  }
  return null;
}

export function validateDescription(
  description: string,
  { min = 20, max = 5000 }: { min?: number; max?: number } = {},
): string | null {
  const trimmed = description.trim();
  if (!trimmed) return "Description is required";
  if (trimmed.length < min) {
    return `Please provide at least ${min} characters so we can understand your matter`;
  }
  if (trimmed.length > max) return `Description must be under ${max} characters`;
  return null;
}

export type FileValidationOptions = {
  maxSizeMb?: number;
  allowedTypes?: string[];
};

const DEFAULT_ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export function validateFile(
  file: File,
  { maxSizeMb = 10, allowedTypes = DEFAULT_ALLOWED_FILE_TYPES }: FileValidationOptions = {},
): string | null {
  if (file.size > maxSizeMb * 1024 * 1024) {
    return `File must be smaller than ${maxSizeMb}MB`;
  }
  if (!allowedTypes.includes(file.type)) {
    return "Unsupported file type. Please upload a PDF, Word doc, or image.";
  }
  return null;
}