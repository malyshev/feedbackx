import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Normalized HTTP exception response format
 */
export interface NormalizedHttpExceptionResponse {
    error: string;
    statusCode: number;
    issues?: { [key: string]: string[] };
}

/**
 * Normalizes HttpException response to consistent format with error (string) and statusCode (number)
 *
 * Formats HttpException responses to:
 * {
 *   error: "Error message",
 *   statusCode: 400
 * }
 *
 * Or for validation errors (BadRequestException with issues):
 * {
 *   issues: {...},
 *   error: "Bad Request",
 *   statusCode: 400
 * }
 *
 * @param exception - HttpException instance
 * @returns Normalized response object
 */
export function normalizeHttpExceptionResponse(exception: HttpException): NormalizedHttpExceptionResponse {
    const statusCode = exception.getStatus();
    const response = exception.getResponse();
    const statusText = HttpStatus[statusCode] || 'Error';

    // Check if response already has the normalized format (from our validation factory)
    // Only return as-is if it's normalized AND doesn't have a 'message' field
    // (some NestJS exceptions like UnauthorizedException return both message and error)
    if (
        typeof response === 'object' &&
        response !== null &&
        'error' in response &&
        'statusCode' in response &&
        typeof (response as { error: unknown }).error === 'string' &&
        typeof (response as { statusCode: unknown }).statusCode === 'number' &&
        !('message' in response)
    ) {
        // Already normalized - return as-is (might include issues for validation errors)
        return response as NormalizedHttpExceptionResponse;
    }

    // Extract error message from various response formats
    let errorMessage: string;
    if (typeof response === 'string') {
        errorMessage = response;
    } else if (typeof response === 'object' && response !== null) {
        const responseObj = response as Record<string, unknown>;
        // Check for common NestJS exception response formats
        if ('message' in responseObj) {
            const message = responseObj.message;
            if (typeof message === 'string') {
                errorMessage = message;
            } else if (Array.isArray(message)) {
                // If message is an array, join it (but this should be handled by validation factory)
                errorMessage = message.join(', ');
            } else {
                errorMessage = statusText;
            }
        } else if ('error' in responseObj && typeof responseObj.error === 'string') {
            errorMessage = responseObj.error;
        } else {
            errorMessage = statusText;
        }
    } else {
        errorMessage = statusText;
    }

    return {
        error: errorMessage,
        statusCode,
    };
}
