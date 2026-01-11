import {
    BadRequestException,
    CallHandler,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Injectable,
    InternalServerErrorException,
    NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Logger } from 'nestjs-pino';
import type { Request } from 'express';
import { formatValidationIssues, normalizeHttpExceptionResponse, ValidationException } from '../exceptions';

/**
 * Common Error Interceptor
 *
 * Handles common error transformations and logging for HTTP requests.
 * Maps domain exceptions to appropriate HTTP exceptions and normalizes all error responses.
 *
 * Behavior:
 * - Normalizes all HTTP exceptions to consistent format: { error: string, statusCode: number }
 * - Validation errors include issues: { issues: {...}, error: string, statusCode: number }
 * - Logs unexpected errors with request context
 * - Returns InternalServerErrorException for unhandled errors
 *
 * Usage:
 * This interceptor should be registered globally in app.module.ts using APP_INTERCEPTOR:
 * ```typescript
 * {
 *   provide: APP_INTERCEPTOR,
 *   useClass: CommonErrorInterceptor,
 * }
 * ```
 */
@Injectable()
export class CommonErrorInterceptor implements NestInterceptor {
    constructor(private readonly logger: Logger) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        return next.handle().pipe(
            catchError((error: unknown) => {
                const request = context.switchToHttp().getRequest<Request & { params?: Record<string, unknown> }>();
                const params = request.params ?? {};
                const url = request.url;
                const method = request.method;

                // Transform ValidationException to BadRequestException with issues format
                // Format: { issues: { fieldName: string[] }, error: "Bad Request", statusCode: 400 }
                if (error instanceof ValidationException) {
                    const issues = formatValidationIssues(error.errors);
                    return throwError(
                        () =>
                            new BadRequestException({
                                issues,
                                error: 'Bad Request',
                                statusCode: 400,
                            }),
                    );
                }

                // Normalize all HTTP exceptions to consistent format with error (string) and statusCode (number)
                // BadRequestException from ValidationPipe is already formatted with issues via exceptionFactory
                // Other HTTP exceptions will be normalized to { error: string, statusCode: number }
                if (error instanceof HttpException) {
                    const normalized = normalizeHttpExceptionResponse(error);
                    // Create new exception with normalized response to ensure consistent format
                    return throwError(() => new HttpException(normalized, error.getStatus()));
                }

                // Log unexpected errors with context for debugging
                this.logger.error(`Request failed. Reason: ${error instanceof Error ? error.message : String(error)}`, {
                    context: CommonErrorInterceptor.name,
                    error,
                    params,
                    url,
                    method,
                    // Include error stack trace if available
                    ...(error instanceof Error && error.stack ? { stack: error.stack } : {}),
                });

                // Return generic error message for security (don't expose internal error details)
                // Normalized format: { error: string, statusCode: number }
                return throwError(
                    () =>
                        new InternalServerErrorException({
                            error: 'Internal Server Error',
                            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                        }),
                );
            }),
        );
    }
}
