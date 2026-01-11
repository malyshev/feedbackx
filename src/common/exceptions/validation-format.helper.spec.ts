import { formatValidationIssues } from './validation-format.helper';

describe('formatValidationIssues', () => {
    it('should format single string error messages to arrays', () => {
        // Arrange
        const errors = {
            email: 'email is required',
            name: 'name is required',
        };

        // Act
        const result = formatValidationIssues(errors);

        // Assert
        expect(result).toEqual({
            email: ['email is required'],
            name: ['name is required'],
        });
    });

    it('should format array error messages as-is', () => {
        // Arrange
        const errors = {
            password: ['password must be at least 8 characters', 'password must contain uppercase'],
            age: ['age must be a number'],
        };

        // Act
        const result = formatValidationIssues(errors);

        // Assert
        expect(result).toEqual({
            password: ['password must be at least 8 characters', 'password must contain uppercase'],
            age: ['age must be a number'],
        });
    });

    it('should format mixed string and array error messages', () => {
        // Arrange
        const errors = {
            email: 'email is required',
            password: ['password must be at least 8 characters', 'password must contain uppercase'],
            age: 'age must be a number',
        };

        // Act
        const result = formatValidationIssues(errors);

        // Assert
        expect(result).toEqual({
            email: ['email is required'],
            password: ['password must be at least 8 characters', 'password must contain uppercase'],
            age: ['age must be a number'],
        });
    });

    it('should format empty errors object', () => {
        // Arrange
        const errors = {};

        // Act
        const result = formatValidationIssues(errors);

        // Assert
        expect(result).toEqual({});
    });

    it('should format single error', () => {
        // Arrange
        const errors = {
            email: 'email is required',
        };

        // Act
        const result = formatValidationIssues(errors);

        // Assert
        expect(result).toEqual({
            email: ['email is required'],
        });
    });

    it('should format single array error', () => {
        // Arrange
        const errors = {
            email: ['email is required', 'email must be valid'],
        };

        // Act
        const result = formatValidationIssues(errors);

        // Assert
        expect(result).toEqual({
            email: ['email is required', 'email must be valid'],
        });
    });

    it('should not mutate the original errors object', () => {
        // Arrange
        const errors = {
            email: 'email is required',
            password: ['password must be at least 8 characters'],
        };
        const originalErrors = { ...errors };
        const originalPasswordArray = [...errors.password];

        // Act
        const result = formatValidationIssues(errors);

        // Assert
        expect(errors).toEqual(originalErrors);
        expect(errors.password).toEqual(originalPasswordArray);
        // For string values, a new array is created, so references differ
        expect(result.email).not.toBe(errors.email); // email is converted to array, different reference
        // For array values, the same array reference is returned
        expect(result.password).toBe(errors.password); // Same array reference (not copied)
    });
});
