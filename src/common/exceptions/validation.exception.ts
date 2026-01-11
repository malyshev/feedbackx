/**
 * Validation Exception
 *
 * Represents validation errors in a format similar to class-validator.
 * Used for service-level validation errors that should be transformed to BadRequestException.
 *
 * Format:
 * ```typescript
 * {
 *   fieldName: "error message" | ["error message 1", "error message 2"],
 *   anotherField: "single error",
 *   arrayField: ["error 1", "error 2"]
 * }
 * ```
 *
 * Example:
 * ```typescript
 * throw new ValidationException({
 *   email: "email is required",
 *   password: ["password must be at least 8 characters", "password must contain uppercase"],
 *   age: "age must be a number"
 * });
 * ```
 */
export class ValidationException extends Error {
    /**
     * Validation errors object
     * Keys are field names, values are error messages (single string or array of strings)
     */
    public readonly errors: { [key: string]: string | string[] };

    constructor(errors: { [key: string]: string | string[] }) {
        // Generate a summary message from all validation errors
        const errorMessages = Object.entries(errors)
            .map(([field, messages]) => {
                const messageArray = Array.isArray(messages) ? messages : [messages];
                return `${field}: ${messageArray.join(', ')}`;
            })
            .join('; ');

        super(`Validation failed: ${errorMessages}`);
        this.name = this.constructor.name;
        this.errors = errors;
        Error.captureStackTrace(this, this.constructor);
    }
}
