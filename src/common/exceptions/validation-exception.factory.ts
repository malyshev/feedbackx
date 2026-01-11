import { BadRequestException, ValidationError } from '@nestjs/common';

/**
 * Factory function to create BadRequestException from class-validator ValidationError[]
 *
 * Transforms class-validator validation errors to issues format:
 * {
 *   issues: {
 *     fieldName: ["error message 1", "error message 2"],
 *     nestedField: ["error message"]
 *   }
 * }
 *
 * @param validationErrors - Array of ValidationError from class-validator
 * @returns BadRequestException with issues format
 */
export function createValidationException(validationErrors: ValidationError[] = []): BadRequestException {
    // Transform class-validator errors to issues format
    // Format: { issues: { fieldName: string[] }, error: "Bad Request", statusCode: 400 }
    const issues: { [key: string]: string[] } = {};

    for (const error of validationErrors) {
        const fieldName = error.property;
        const constraints = error.constraints || {};
        const messages = Object.values(constraints);

        if (messages.length > 0) {
            issues[fieldName] = messages;
        }

        // Handle nested validation errors (for nested objects)
        if (error.children && error.children.length > 0) {
            for (const childError of error.children) {
                const childFieldName = childError.property;
                const childConstraints = childError.constraints || {};
                const childMessages = Object.values(childConstraints);

                if (childMessages.length > 0) {
                    // Use dot notation for nested fields: "parent.child"
                    const nestedFieldName = `${fieldName}.${childFieldName}`;
                    issues[nestedFieldName] = childMessages;
                }
            }
        }
    }

    return new BadRequestException({
        issues,
        error: 'Bad Request',
        statusCode: 400,
    });
}
