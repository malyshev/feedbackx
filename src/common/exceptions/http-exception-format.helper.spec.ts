import {
    HttpException,
    HttpStatus,
    BadRequestException,
    UnauthorizedException,
    NotFoundException,
} from '@nestjs/common';
import { normalizeHttpExceptionResponse } from './http-exception-format.helper';

describe('normalizeHttpExceptionResponse', () => {
    it('should normalize HttpException with string response', () => {
        // Arrange
        const exception = new HttpException('Error message', HttpStatus.BAD_REQUEST);

        // Act
        const result = normalizeHttpExceptionResponse(exception);

        // Assert
        expect(result).toEqual({
            error: 'Error message',
            statusCode: 400,
        });
    });

    it('should normalize HttpException with object response containing message', () => {
        // Arrange
        const exception = new HttpException({ message: 'Error message' }, HttpStatus.BAD_REQUEST);

        // Act
        const result = normalizeHttpExceptionResponse(exception);

        // Assert
        expect(result).toEqual({
            error: 'Error message',
            statusCode: 400,
        });
    });

    it('should normalize HttpException with object response containing array message', () => {
        // Arrange
        const exception = new HttpException(
            { message: ['Error message 1', 'Error message 2'] },
            HttpStatus.BAD_REQUEST,
        );

        // Act
        const result = normalizeHttpExceptionResponse(exception);

        // Assert
        expect(result).toEqual({
            error: 'Error message 1, Error message 2',
            statusCode: 400,
        });
    });

    it('should normalize HttpException with object response containing error field', () => {
        // Arrange
        const exception = new HttpException({ error: 'Custom error message' }, HttpStatus.BAD_REQUEST);

        // Act
        const result = normalizeHttpExceptionResponse(exception);

        // Assert
        expect(result).toEqual({
            error: 'Custom error message',
            statusCode: 400,
        });
    });

    it('should return already normalized response as-is', () => {
        // Arrange
        const normalizedResponse = {
            error: 'Bad Request',
            statusCode: 400,
            issues: {
                email: ['email is required'],
            },
        };
        const exception = new BadRequestException(normalizedResponse);

        // Act
        const result = normalizeHttpExceptionResponse(exception);

        // Assert
        expect(result).toEqual(normalizedResponse);
    });

    it('should return already normalized response without issues as-is', () => {
        // Arrange
        const normalizedResponse = {
            error: 'Unauthorized',
            statusCode: 401,
        };
        const exception = new UnauthorizedException(normalizedResponse);

        // Act
        const result = normalizeHttpExceptionResponse(exception);

        // Assert
        expect(result).toEqual(normalizedResponse);
    });

    it('should normalize UnauthorizedException with string message', () => {
        // Arrange
        const exception = new UnauthorizedException('Authentication failed');

        // Act
        const result = normalizeHttpExceptionResponse(exception);

        // Assert
        // UnauthorizedException with string returns { message: string, error: string, statusCode: number }
        // The helper extracts the message field and uses it as error
        expect(result).toEqual({
            error: 'Authentication failed',
            statusCode: 401,
        });
    });

    it('should normalize NotFoundException with string message', () => {
        // Arrange
        const exception = new NotFoundException('Resource not found');

        // Act
        const result = normalizeHttpExceptionResponse(exception);

        // Assert
        expect(result).toEqual({
            error: 'Resource not found',
            statusCode: 404,
        });
    });

    it('should use status text as error message when response object has no message or error field', () => {
        // Arrange
        const exception = new HttpException({ customField: 'value' }, HttpStatus.BAD_REQUEST);

        // Act
        const result = normalizeHttpExceptionResponse(exception);

        // Assert
        // When response object has no 'message' or 'error' field, it uses status text
        // HttpStatus[statusCode] returns the enum key name (e.g., "BAD_REQUEST")
        expect(result.error).toBe(HttpStatus[HttpStatus.BAD_REQUEST]);
        expect(result.statusCode).toBe(400);
        expect(result.issues).toBeUndefined();
    });

    it('should handle different HTTP status codes correctly', () => {
        // Arrange
        const statusCodes = [
            { code: HttpStatus.BAD_REQUEST, text: HttpStatus[HttpStatus.BAD_REQUEST] },
            { code: HttpStatus.UNAUTHORIZED, text: HttpStatus[HttpStatus.UNAUTHORIZED] },
            { code: HttpStatus.FORBIDDEN, text: HttpStatus[HttpStatus.FORBIDDEN] },
            { code: HttpStatus.NOT_FOUND, text: HttpStatus[HttpStatus.NOT_FOUND] },
            { code: HttpStatus.INTERNAL_SERVER_ERROR, text: HttpStatus[HttpStatus.INTERNAL_SERVER_ERROR] },
        ];

        statusCodes.forEach(({ code, text }) => {
            // Arrange
            const exception = new HttpException({ customField: 'value' }, code);

            // Act
            const result = normalizeHttpExceptionResponse(exception);

            // Assert
            // HttpStatus[code] returns the enum key name (e.g., "BAD_REQUEST") not the readable text
            expect(result.error).toBe(text);
            expect(result.statusCode).toBe(code);
        });
    });

    it('should normalize BadRequestException with issues format', () => {
        // Arrange
        const exception = new BadRequestException({
            issues: {
                email: ['email is required'],
                password: ['password must be at least 8 characters'],
            },
            error: 'Bad Request',
            statusCode: 400,
        });

        // Act
        const result = normalizeHttpExceptionResponse(exception);

        // Assert
        expect(result).toEqual({
            issues: {
                email: ['email is required'],
                password: ['password must be at least 8 characters'],
            },
            error: 'Bad Request',
            statusCode: 400,
        });
    });

    it('should handle exception with empty response object', () => {
        // Arrange
        // HttpException doesn't allow null, but test with empty object
        const exception = new HttpException({}, HttpStatus.BAD_REQUEST);

        // Act
        const result = normalizeHttpExceptionResponse(exception);

        // Assert
        // HttpStatus[statusCode] returns the enum key name (e.g., "BAD_REQUEST")
        expect(result).toEqual({
            error: HttpStatus[HttpStatus.BAD_REQUEST],
            statusCode: 400,
        });
    });

    it('should preserve issues field when response is already normalized', () => {
        // Arrange
        const normalizedResponse = {
            issues: {
                field1: ['error1', 'error2'],
                field2: ['error3'],
            },
            error: 'Bad Request',
            statusCode: 400,
        };
        const exception = new BadRequestException(normalizedResponse);

        // Act
        const result = normalizeHttpExceptionResponse(exception);

        // Assert
        expect(result).toEqual(normalizedResponse);
        expect(result.issues).toBeDefined();
        expect(result.issues?.field1).toEqual(['error1', 'error2']);
        expect(result.issues?.field2).toEqual(['error3']);
    });

    it('should not include issues field when response is not normalized with issues', () => {
        // Arrange
        // BadRequestException with string returns { message: string, error: string, statusCode: number }
        const exception = new BadRequestException('Simple error message');

        // Act
        const result = normalizeHttpExceptionResponse(exception);

        // Assert
        // The helper extracts the message field and uses it as error
        expect(result.error).toBe('Simple error message');
        expect(result.statusCode).toBe(400);
        expect(result.issues).toBeUndefined();
    });
});
