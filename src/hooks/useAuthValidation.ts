import { useState } from 'react';
import { ZodSchema } from 'zod';

interface ValidationResult<T> {
  data: T | null;
  errors: Record<string, string[]> | null;
  isValid: boolean;
}

export function useAuthValidation<T>() {
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);

  const validate = (schema: ZodSchema<T>, data: unknown): ValidationResult<T> => {
    try {
      const validatedData = schema.parse(data);
      setErrors(null);
      return {
        data: validatedData,
        errors: null,
        isValid: true
      };
    } catch (error: any) {
      const validationErrors: Record<string, string[]> = {};
      
      if (error.errors) {
        error.errors.forEach((err: any) => {
          const path = err.path.join('.');
          if (!validationErrors[path]) {
            validationErrors[path] = [];
          }
          validationErrors[path].push(err.message);
        });
      }
      
      setErrors(validationErrors);
      return {
        data: null,
        errors: validationErrors,
        isValid: false
      };
    }
  };

  const clearErrors = () => setErrors(null);

  const getFieldError = (fieldName: string): string | null => {
    return errors?.[fieldName]?.[0] || null;
  };

  return {
    validate,
    errors,
    clearErrors,
    getFieldError
  };
}