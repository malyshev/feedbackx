import { Test, TestingModule } from '@nestjs/testing';
import {
    BadRequestException,
    ExecutionContext,
    HttpException,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { Logger } from 'nestjs-pino';
import { CommonErrorInterceptor } from './common-error.interceptor';
import { formatValidationIssues, normalizeHttpExceptionResponse, ValidationException } from '../exceptions';

// Mock the helper functions
jest.mock('../exceptions/validation-format.helper');
jest.mock('../exceptions/http-exception-format.helper');

describe('CommonErrorInterceptor', () => {
    let interceptor: CommonErrorInterceptor;
    let logger: jest.Mocked<Logger>;
    let executionContext: jest.Mocked<ExecutionContext>;
    let mockRequest: any;

    const mockFormatValidationIssues = formatValidationIssues as jest.MockedFunction<typeof formatValidationIssues>;
    const mockNormalizeHttpExceptionResponse = normalizeHttpExceptionResponse as jest.MockedFunction<
        typeof normalizeHttpExceptionResponse
    >;

    beforeEach(async () => {
        const mockLogger = {
            error: jest.fn(),
            log: jest.fn(),
            debug: jest.fn(),
            warn: jest.fn(),
        };

        mockRequest = {
            url: '/test/endpoint',
            method: 'POST',
            params: { id: '123' },
        };

        executionContext = {
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: jest.fn().mockReturnValue(mockRequest),
            }),
        } as any;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CommonErrorInterceptor,
                {
                    provide: Logger,
                    useValue: mockLogger,
                },
            ],
        }).compile();

        interceptor = module.get<CommonErrorInterceptor>(CommonErrorInterceptor);
        logger = module.get(Logger);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(interceptor).toBeDefined();
    });

    describe('successful requests', () => {
        it('should pass through successful responses', (done) => {
            const callHandler = {
                handle: jest.fn().mockReturnValue(of({ data: 'success' })),
            };

            interceptor.intercept(executionContext, callHandler).subscribe({
                next: (value) => {
                    expect(value).toEqual({ data: 'success' });
                    done();
                },
                error: done,
            });
        });
    });

    describe('ValidationException handling', () => {
        it('should transform ValidationException to BadRequestException with issues format', (done) => {
            const validationErrors = {
                email: 'email is required',
                password: ['password must be at least 8 characters', 'password must contain uppercase'],
            };

            const validationException = new ValidationException(validationErrors);
            const formattedIssues = {
                email: ['email is required'],
                password: ['password must be at least 8 characters', 'password must contain uppercase'],
            };

            mockFormatValidationIssues.mockReturnValue(formattedIssues);

            const callHandler = {
                handle: jest.fn().mockReturnValue(throwError(() => validationException)),
            };

            interceptor.intercept(executionContext, callHandler).subscribe({
                next: () => {
                    done(new Error('Should have thrown an error'));
                },
                error: (error) => {
                    expect(error).toBeInstanceOf(BadRequestException);
                    expect(error.getResponse()).toEqual({
                        issues: formattedIssues,
                        error: 'Bad Request',
                        statusCode: 400,
                    });
                    expect(mockFormatValidationIssues).toHaveBeenCalledWith(validationErrors);
                    done();
                },
            });
        });

        it('should handle ValidationException with empty errors object', (done) => {
            const validationException = new ValidationException({});
            const formattedIssues = {};

            mockFormatValidationIssues.mockReturnValue(formattedIssues);

            const callHandler = {
                handle: jest.fn().mockReturnValue(throwError(() => validationException)),
            };

            interceptor.intercept(executionContext, callHandler).subscribe({
                next: () => {
                    done(new Error('Should have thrown an error'));
                },
                error: (error) => {
                    expect(error).toBeInstanceOf(BadRequestException);
                    expect(error.getResponse()).toEqual({
                        issues: formattedIssues,
                        error: 'Bad Request',
                        statusCode: 400,
                    });
                    done();
                },
            });
        });
    });

    describe('HttpException handling', () => {
        it('should normalize and rethrow HttpException', (done) => {
            const httpException = new UnauthorizedException('Unauthorized access');
            const normalizedResponse = {
                error: 'Unauthorized',
                statusCode: 401,
            };

            mockNormalizeHttpExceptionResponse.mockReturnValue(normalizedResponse);

            const callHandler = {
                handle: jest.fn().mockReturnValue(throwError(() => httpException)),
            };

            interceptor.intercept(executionContext, callHandler).subscribe({
                next: () => {
                    done(new Error('Should have thrown an error'));
                },
                error: (error) => {
                    expect(error).toBeInstanceOf(HttpException);
                    expect(error.getStatus()).toBe(401);
                    expect(error.getResponse()).toEqual(normalizedResponse);
                    expect(mockNormalizeHttpExceptionResponse).toHaveBeenCalledWith(httpException);
                    done();
                },
            });
        });

        it('should handle NotFoundException', (done) => {
            const notFoundException = new NotFoundException('Resource not found');
            const normalizedResponse = {
                error: 'Not Found',
                statusCode: 404,
            };

            mockNormalizeHttpExceptionResponse.mockReturnValue(normalizedResponse);

            const callHandler = {
                handle: jest.fn().mockReturnValue(throwError(() => notFoundException)),
            };

            interceptor.intercept(executionContext, callHandler).subscribe({
                next: () => {
                    done(new Error('Should have thrown an error'));
                },
                error: (error) => {
                    expect(error).toBeInstanceOf(HttpException);
                    expect(error.getStatus()).toBe(404);
                    expect(mockNormalizeHttpExceptionResponse).toHaveBeenCalledWith(notFoundException);
                    done();
                },
            });
        });

        it('should handle BadRequestException', (done) => {
            const badRequestException = new BadRequestException('Invalid input');
            const normalizedResponse = {
                error: 'Bad Request',
                statusCode: 400,
            };

            mockNormalizeHttpExceptionResponse.mockReturnValue(normalizedResponse);

            const callHandler = {
                handle: jest.fn().mockReturnValue(throwError(() => badRequestException)),
            };

            interceptor.intercept(executionContext, callHandler).subscribe({
                next: () => {
                    done(new Error('Should have thrown an error'));
                },
                error: (error) => {
                    expect(error).toBeInstanceOf(HttpException);
                    expect(error.getStatus()).toBe(400);
                    expect(mockNormalizeHttpExceptionResponse).toHaveBeenCalledWith(badRequestException);
                    done();
                },
            });
        });
    });

    describe('unexpected error handling', () => {
        it('should handle Error instances and log with stack trace', (done) => {
            const error = new Error('Unexpected error');
            error.stack = 'Error: Unexpected error\n    at test.js:1:1';

            const callHandler = {
                handle: jest.fn().mockReturnValue(throwError(() => error)),
            };

            interceptor.intercept(executionContext, callHandler).subscribe({
                next: () => {
                    done(new Error('Should have thrown an error'));
                },
                error: (thrownError) => {
                    expect(thrownError).toBeInstanceOf(InternalServerErrorException);
                    expect(thrownError.getResponse()).toEqual({
                        error: 'Internal Server Error',
                        statusCode: 500,
                    });

                    expect(logger.error).toHaveBeenCalledWith(
                        'Request failed. Reason: Unexpected error',
                        expect.objectContaining({
                            context: 'CommonErrorInterceptor',
                            error,
                            params: { id: '123' },
                            url: '/test/endpoint',
                            method: 'POST',
                            stack: error.stack,
                        }),
                    );

                    done();
                },
            });
        });

        it('should handle Error instances without stack trace', (done) => {
            const error = new Error('Unexpected error');
            delete error.stack;

            const callHandler = {
                handle: jest.fn().mockReturnValue(throwError(() => error)),
            };

            interceptor.intercept(executionContext, callHandler).subscribe({
                next: () => {
                    done(new Error('Should have thrown an error'));
                },
                error: (thrownError) => {
                    expect(thrownError).toBeInstanceOf(InternalServerErrorException);
                    expect(logger.error).toHaveBeenCalledWith(
                        'Request failed. Reason: Unexpected error',
                        expect.objectContaining({
                            context: 'CommonErrorInterceptor',
                            error,
                            params: { id: '123' },
                            url: '/test/endpoint',
                            method: 'POST',
                        }),
                    );

                    expect(logger.error.mock.calls[0][1]).not.toHaveProperty('stack');
                    done();
                },
            });
        });

        it('should handle non-Error objects (strings)', (done) => {
            const error = 'String error';

            const callHandler = {
                handle: jest.fn().mockReturnValue(throwError(() => error)),
            };

            interceptor.intercept(executionContext, callHandler).subscribe({
                next: () => {
                    done(new Error('Should have thrown an error'));
                },
                error: (thrownError) => {
                    expect(thrownError).toBeInstanceOf(InternalServerErrorException);
                    expect(thrownError.getResponse()).toEqual({
                        error: 'Internal Server Error',
                        statusCode: 500,
                    });

                    expect(logger.error).toHaveBeenCalledWith(
                        'Request failed. Reason: String error',
                        expect.objectContaining({
                            context: 'CommonErrorInterceptor',
                            error,
                            params: { id: '123' },
                            url: '/test/endpoint',
                            method: 'POST',
                        }),
                    );

                    done();
                },
            });
        });

        it('should handle non-Error objects (numbers)', (done) => {
            const error = 500;

            const callHandler = {
                handle: jest.fn().mockReturnValue(throwError(() => error)),
            };

            interceptor.intercept(executionContext, callHandler).subscribe({
                next: () => {
                    done(new Error('Should have thrown an error'));
                },
                error: (thrownError) => {
                    expect(thrownError).toBeInstanceOf(InternalServerErrorException);
                    expect(logger.error).toHaveBeenCalledWith(
                        'Request failed. Reason: 500',
                        expect.objectContaining({
                            context: 'CommonErrorInterceptor',
                            error,
                            params: { id: '123' },
                            url: '/test/endpoint',
                            method: 'POST',
                        }),
                    );

                    done();
                },
            });
        });

        it('should handle null errors', (done) => {
            const error = null;

            const callHandler = {
                handle: jest.fn().mockReturnValue(throwError(() => error)),
            };

            interceptor.intercept(executionContext, callHandler).subscribe({
                next: () => {
                    done(new Error('Should have thrown an error'));
                },
                error: (thrownError) => {
                    expect(thrownError).toBeInstanceOf(InternalServerErrorException);
                    expect(logger.error).toHaveBeenCalledWith(
                        'Request failed. Reason: null',
                        expect.objectContaining({
                            context: 'CommonErrorInterceptor',
                            error: null,
                            params: { id: '123' },
                            url: '/test/endpoint',
                            method: 'POST',
                        }),
                    );

                    done();
                },
            });
        });

        it('should handle undefined errors', (done) => {
            const error = undefined;

            const callHandler = {
                handle: jest.fn().mockReturnValue(throwError(() => error)),
            };

            interceptor.intercept(executionContext, callHandler).subscribe({
                next: () => {
                    done(new Error('Should have thrown an error'));
                },
                error: (thrownError) => {
                    expect(thrownError).toBeInstanceOf(InternalServerErrorException);
                    expect(logger.error).toHaveBeenCalledWith(
                        'Request failed. Reason: undefined',
                        expect.objectContaining({
                            context: 'CommonErrorInterceptor',
                            error: undefined,
                            params: { id: '123' },
                            url: '/test/endpoint',
                            method: 'POST',
                        }),
                    );

                    done();
                },
            });
        });
    });

    describe('request context handling', () => {
        it('should handle requests without params', (done) => {
            const requestWithoutParams = {
                url: '/test/endpoint',
                method: 'GET',
            };

            const mockGetRequest = jest.fn().mockReturnValue(requestWithoutParams);
            executionContext.switchToHttp = jest.fn().mockReturnValue({
                getRequest: mockGetRequest,
            });

            const error = new Error('Test error');
            const callHandler = {
                handle: jest.fn().mockReturnValue(throwError(() => error)),
            };

            interceptor.intercept(executionContext, callHandler).subscribe({
                next: () => {
                    done(new Error('Should have thrown an error'));
                },
                error: () => {
                    expect(logger.error).toHaveBeenCalledWith(
                        'Request failed. Reason: Test error',
                        expect.objectContaining({
                            context: 'CommonErrorInterceptor',
                            error,
                            params: {},
                            url: '/test/endpoint',
                            method: 'GET',
                        }),
                    );

                    done();
                },
            });
        });

        it('should handle requests with undefined params', (done) => {
            const requestWithUndefinedParams = {
                url: '/test/endpoint',
                method: 'GET',
                params: undefined,
            };

            const mockGetRequest = jest.fn().mockReturnValue(requestWithUndefinedParams);
            executionContext.switchToHttp = jest.fn().mockReturnValue({
                getRequest: mockGetRequest,
            });

            const error = new Error('Test error');
            const callHandler = {
                handle: jest.fn().mockReturnValue(throwError(() => error)),
            };

            interceptor.intercept(executionContext, callHandler).subscribe({
                next: () => {
                    done(new Error('Should have thrown an error'));
                },
                error: () => {
                    expect(logger.error).toHaveBeenCalledWith(
                        'Request failed. Reason: Test error',
                        expect.objectContaining({
                            context: 'CommonErrorInterceptor',
                            error,
                            params: {},
                            url: '/test/endpoint',
                            method: 'GET',
                        }),
                    );

                    done();
                },
            });
        });
    });
});
