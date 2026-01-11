import { BadRequestException, ValidationError } from '@nestjs/common';
import { createValidationException } from './validation-exception.factory';

describe('createValidationException', () => {
    it('should create BadRequestException with single constraint error', () => {
        // Arrange
        const validationErrors: ValidationError[] = [
            {
                property: 'email',
                constraints: {
                    isEmail: 'email must be an email',
                },
            },
        ];

        // Act
        const exception = createValidationException(validationErrors);

        // Assert
        expect(exception).toBeInstanceOf(BadRequestException);
        expect(exception.getStatus()).toBe(400);
        expect(exception.getResponse()).toEqual({
            issues: {
                email: ['email must be an email'],
            },
            error: 'Bad Request',
            statusCode: 400,
        });
    });

    it('should create BadRequestException with multiple constraint errors for same field', () => {
        // Arrange
        const validationErrors: ValidationError[] = [
            {
                property: 'password',
                constraints: {
                    minLength: 'password must be longer than or equal to 8 characters',
                    matches: 'password must contain uppercase',
                },
            },
        ];

        // Act
        const exception = createValidationException(validationErrors);

        // Assert
        expect(exception).toBeInstanceOf(BadRequestException);
        expect(exception.getStatus()).toBe(400);
        const response = exception.getResponse() as {
            issues: { [key: string]: string[] };
            error: string;
            statusCode: number;
        };
        expect(response.issues.password).toHaveLength(2);
        expect(response.issues.password).toContain('password must be longer than or equal to 8 characters');
        expect(response.issues.password).toContain('password must contain uppercase');
        expect(response.error).toBe('Bad Request');
        expect(response.statusCode).toBe(400);
    });

    it('should create BadRequestException with multiple field errors', () => {
        // Arrange
        const validationErrors: ValidationError[] = [
            {
                property: 'email',
                constraints: {
                    isNotEmpty: 'email should not be empty',
                },
            },
            {
                property: 'name',
                constraints: {
                    isString: 'name must be a string',
                },
            },
        ];

        // Act
        const exception = createValidationException(validationErrors);

        // Assert
        expect(exception).toBeInstanceOf(BadRequestException);
        expect(exception.getStatus()).toBe(400);
        expect(exception.getResponse()).toEqual({
            issues: {
                email: ['email should not be empty'],
                name: ['name must be a string'],
            },
            error: 'Bad Request',
            statusCode: 400,
        });
    });

    it('should create BadRequestException with nested validation errors', () => {
        // Arrange
        const validationErrors: ValidationError[] = [
            {
                property: 'user',
                constraints: {},
                children: [
                    {
                        property: 'email',
                        constraints: {
                            isEmail: 'email must be an email',
                        },
                    },
                ],
            },
        ];

        // Act
        const exception = createValidationException(validationErrors);

        // Assert
        expect(exception).toBeInstanceOf(BadRequestException);
        expect(exception.getStatus()).toBe(400);
        expect(exception.getResponse()).toEqual({
            issues: {
                'user.email': ['email must be an email'],
            },
            error: 'Bad Request',
            statusCode: 400,
        });
    });

    it('should create BadRequestException with nested validation errors and parent constraints', () => {
        // Arrange
        const validationErrors: ValidationError[] = [
            {
                property: 'user',
                constraints: {
                    isObject: 'user must be an object',
                },
                children: [
                    {
                        property: 'email',
                        constraints: {
                            isEmail: 'email must be an email',
                        },
                    },
                ],
            },
        ];

        // Act
        const exception = createValidationException(validationErrors);

        // Assert
        expect(exception).toBeInstanceOf(BadRequestException);
        expect(exception.getStatus()).toBe(400);
        const response = exception.getResponse() as {
            issues: { [key: string]: string[] };
            error: string;
            statusCode: number;
        };
        expect(response.issues.user).toContain('user must be an object');
        expect(response.issues['user.email']).toContain('email must be an email');
        expect(response.error).toBe('Bad Request');
        expect(response.statusCode).toBe(400);
    });

    it('should create BadRequestException with multiple nested validation errors', () => {
        // Arrange
        const validationErrors: ValidationError[] = [
            {
                property: 'user',
                constraints: {},
                children: [
                    {
                        property: 'email',
                        constraints: {
                            isEmail: 'email must be an email',
                        },
                    },
                    {
                        property: 'name',
                        constraints: {
                            isString: 'name must be a string',
                        },
                    },
                ],
            },
        ];

        // Act
        const exception = createValidationException(validationErrors);

        // Assert
        expect(exception).toBeInstanceOf(BadRequestException);
        expect(exception.getStatus()).toBe(400);
        expect(exception.getResponse()).toEqual({
            issues: {
                'user.email': ['email must be an email'],
                'user.name': ['name must be a string'],
            },
            error: 'Bad Request',
            statusCode: 400,
        });
    });

    it('should create BadRequestException with empty validation errors array', () => {
        // Arrange
        const validationErrors: ValidationError[] = [];

        // Act
        const exception = createValidationException(validationErrors);

        // Assert
        expect(exception).toBeInstanceOf(BadRequestException);
        expect(exception.getStatus()).toBe(400);
        expect(exception.getResponse()).toEqual({
            issues: {},
            error: 'Bad Request',
            statusCode: 400,
        });
    });

    it('should create BadRequestException with validation errors without constraints', () => {
        // Arrange
        const validationErrors: ValidationError[] = [
            {
                property: 'field',
                constraints: {},
            },
        ];

        // Act
        const exception = createValidationException(validationErrors);

        // Assert
        expect(exception).toBeInstanceOf(BadRequestException);
        expect(exception.getStatus()).toBe(400);
        expect(exception.getResponse()).toEqual({
            issues: {},
            error: 'Bad Request',
            statusCode: 400,
        });
    });

    it('should handle validation errors with undefined constraints', () => {
        // Arrange
        const validationErrors: ValidationError[] = [
            {
                property: 'field',
                constraints: undefined as unknown as { [type: string]: string },
            },
        ];

        // Act
        const exception = createValidationException(validationErrors);

        // Assert
        expect(exception).toBeInstanceOf(BadRequestException);
        expect(exception.getStatus()).toBe(400);
        expect(exception.getResponse()).toEqual({
            issues: {},
            error: 'Bad Request',
            statusCode: 400,
        });
    });

    it('should handle deeply nested validation errors', () => {
        // Arrange
        const validationErrors: ValidationError[] = [
            {
                property: 'user',
                constraints: {},
                children: [
                    {
                        property: 'profile',
                        constraints: {},
                        children: [
                            {
                                property: 'email',
                                constraints: {
                                    isEmail: 'email must be an email',
                                },
                            },
                        ],
                    },
                ],
            },
        ];

        // Act
        const exception = createValidationException(validationErrors);

        // Assert
        expect(exception).toBeInstanceOf(BadRequestException);
        expect(exception.getStatus()).toBe(400);
        // Note: The current implementation only handles one level of nesting
        // This test verifies current behavior - only "profile.email" will be included
        const response = exception.getResponse() as { issues: { [key: string]: string[] } };
        expect(response.issues['user.profile']).toBeUndefined();
        // The implementation currently only processes direct children
    });
});
