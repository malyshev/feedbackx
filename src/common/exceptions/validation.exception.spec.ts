import { ValidationException } from './validation.exception';

describe('ValidationException', () => {
    describe('constructor', () => {
        it('should create ValidationException with single string error messages', () => {
            // Arrange
            const errors = {
                email: 'email is required',
                name: 'name is required',
            };

            // Act
            const exception = new ValidationException(errors);

            // Assert
            expect(exception).toBeInstanceOf(ValidationException);
            expect(exception).toBeInstanceOf(Error);
            expect(exception.errors).toEqual(errors);
            expect(exception.message).toBe('Validation failed: email: email is required; name: name is required');
            expect(exception.name).toBe('ValidationException');
        });

        it('should create ValidationException with array error messages', () => {
            // Arrange
            const errors = {
                password: ['password must be at least 8 characters', 'password must contain uppercase'],
                age: ['age must be a number'],
            };

            // Act
            const exception = new ValidationException(errors);

            // Assert
            expect(exception).toBeInstanceOf(ValidationException);
            expect(exception.errors).toEqual(errors);
            expect(exception.message).toBe(
                'Validation failed: password: password must be at least 8 characters, password must contain uppercase; age: age must be a number',
            );
        });

        it('should create ValidationException with mixed string and array error messages', () => {
            // Arrange
            const errors = {
                email: 'email is required',
                password: ['password must be at least 8 characters', 'password must contain uppercase'],
                age: 'age must be a number',
            };

            // Act
            const exception = new ValidationException(errors);

            // Assert
            expect(exception).toBeInstanceOf(ValidationException);
            expect(exception.errors).toEqual(errors);
            expect(exception.message).toBe(
                'Validation failed: email: email is required; password: password must be at least 8 characters, password must contain uppercase; age: age must be a number',
            );
        });

        it('should create ValidationException with empty errors object', () => {
            // Arrange
            const errors = {};

            // Act
            const exception = new ValidationException(errors);

            // Assert
            expect(exception).toBeInstanceOf(ValidationException);
            expect(exception.errors).toEqual({});
            expect(exception.message).toBe('Validation failed: ');
        });

        it('should create ValidationException with single error', () => {
            // Arrange
            const errors = {
                email: 'email is required',
            };

            // Act
            const exception = new ValidationException(errors);

            // Assert
            expect(exception).toBeInstanceOf(ValidationException);
            expect(exception.errors).toEqual(errors);
            expect(exception.message).toBe('Validation failed: email: email is required');
        });

        it('should create ValidationException with single array error', () => {
            // Arrange
            const errors = {
                email: ['email is required', 'email must be valid'],
            };

            // Act
            const exception = new ValidationException(errors);

            // Assert
            expect(exception).toBeInstanceOf(ValidationException);
            expect(exception.errors).toEqual(errors);
            expect(exception.message).toBe('Validation failed: email: email is required, email must be valid');
        });

        it('should preserve errors object reference', () => {
            // Arrange
            const errors = {
                email: 'email is required',
            };

            // Act
            const exception = new ValidationException(errors);

            // Assert
            expect(exception.errors).toBe(errors);
        });

        it('should have correct stack trace', () => {
            // Arrange
            const errors = {
                email: 'email is required',
            };

            // Act
            const exception = new ValidationException(errors);

            // Assert
            expect(exception.stack).toBeDefined();
            expect(typeof exception.stack).toBe('string');
            expect(exception.stack).toContain('ValidationException');
        });
    });
});
