import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { UnauthorizedException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { AdminAuthGuard } from './admin-auth.guard';
import type { Request } from 'express';

describe('AdminAuthGuard', () => {
    let guard: AdminAuthGuard;
    let configService: ConfigService;
    let logger: Logger;
    let mockExecutionContext: ExecutionContext;

    const mockAdminSecret = 'test-admin-secret-12345';
    const mockRequest = {
        headers: {} as Request['headers'],
        url: '/admin/test',
        ip: '127.0.0.1',
    } as Request & { ip?: string };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AdminAuthGuard,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn(),
                    },
                },
                {
                    provide: Logger,
                    useValue: {
                        log: jest.fn(),
                        debug: jest.fn(),
                        warn: jest.fn(),
                        error: jest.fn(),
                    },
                },
            ],
        }).compile();

        guard = module.get<AdminAuthGuard>(AdminAuthGuard);
        configService = module.get<ConfigService>(ConfigService);
        logger = module.get<Logger>(Logger);

        // Mock execution context
        mockExecutionContext = {
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: jest.fn().mockReturnValue(mockRequest as Request),
            }),
        } as unknown as ExecutionContext;

        // Reset mocks
        jest.clearAllMocks();
    });

    describe('canActivate', () => {
        it('should allow access with valid Bearer token', () => {
            // Arrange
            (configService.get as jest.Mock).mockReturnValue({
                adminSecret: mockAdminSecret,
            });
            mockRequest.headers.authorization = `Bearer ${mockAdminSecret}`;

            // Act
            const result = guard.canActivate(mockExecutionContext);

            // Assert
            expect(result).toBe(true);
            expect(configService.get).toHaveBeenCalledWith('app');
            expect(logger.debug).toHaveBeenCalledWith(
                'Admin authentication successful',
                expect.objectContaining({
                    context: 'AdminAuthGuard',
                    path: '/admin/test',
                    ip: '127.0.0.1',
                }),
            );
        });

        it('should throw UnauthorizedException when ADMIN_SECRET is not configured', () => {
            // Arrange
            (configService.get as jest.Mock).mockReturnValue({
                adminSecret: undefined,
            });
            mockRequest.headers.authorization = `Bearer ${mockAdminSecret}`;

            // Act & Assert
            expect(() => guard.canActivate(mockExecutionContext)).toThrow(UnauthorizedException);
            expect(() => guard.canActivate(mockExecutionContext)).toThrow('Admin authentication is not configured');
            expect(logger.warn).toHaveBeenCalledWith(
                'Admin authentication attempted but ADMIN_SECRET is not configured',
                expect.objectContaining({
                    context: 'AdminAuthGuard',
                    path: '/admin/test',
                }),
            );
        });

        it('should throw UnauthorizedException when Authorization header is missing', () => {
            // Arrange
            (configService.get as jest.Mock).mockReturnValue({
                adminSecret: mockAdminSecret,
            });
            delete mockRequest.headers.authorization;

            // Act & Assert
            expect(() => guard.canActivate(mockExecutionContext)).toThrow(UnauthorizedException);
            expect(() => guard.canActivate(mockExecutionContext)).toThrow('Missing or invalid Authorization header');
            expect(logger.warn).toHaveBeenCalledWith(
                'Admin authentication failed: missing Authorization header',
                expect.objectContaining({
                    context: 'AdminAuthGuard',
                    path: '/admin/test',
                }),
            );
        });

        it('should throw UnauthorizedException when Authorization header format is invalid', () => {
            // Arrange
            (configService.get as jest.Mock).mockReturnValue({
                adminSecret: mockAdminSecret,
            });
            mockRequest.headers.authorization = 'InvalidFormat token';

            // Act & Assert
            expect(() => guard.canActivate(mockExecutionContext)).toThrow(UnauthorizedException);
            expect(() => guard.canActivate(mockExecutionContext)).toThrow(
                'Invalid Authorization header format. Expected: Bearer <token>',
            );
            expect(logger.warn).toHaveBeenCalledWith(
                'Admin authentication failed: invalid Bearer token format',
                expect.objectContaining({
                    context: 'AdminAuthGuard',
                    path: '/admin/test',
                }),
            );
        });

        it('should throw UnauthorizedException when Bearer token is missing (empty token)', () => {
            // Arrange
            (configService.get as jest.Mock).mockReturnValue({
                adminSecret: mockAdminSecret,
            });
            mockRequest.headers.authorization = 'Bearer ';

            // Act & Assert
            expect(() => guard.canActivate(mockExecutionContext)).toThrow(UnauthorizedException);
            expect(() => guard.canActivate(mockExecutionContext)).toThrow(
                'Invalid Authorization header format. Expected: Bearer <token>',
            );
        });

        it('should throw UnauthorizedException when token does not match ADMIN_SECRET', () => {
            // Arrange
            (configService.get as jest.Mock).mockReturnValue({
                adminSecret: mockAdminSecret,
            });
            mockRequest.headers.authorization = 'Bearer wrong-token';

            // Act & Assert
            expect(() => guard.canActivate(mockExecutionContext)).toThrow(UnauthorizedException);
            expect(() => guard.canActivate(mockExecutionContext)).toThrow('Invalid authentication token');
            expect(logger.warn).toHaveBeenCalledWith(
                'Admin authentication failed: invalid token',
                expect.objectContaining({
                    context: 'AdminAuthGuard',
                    path: '/admin/test',
                }),
            );
        });

        it('should handle Bearer token with leading/trailing whitespace', () => {
            // Arrange
            (configService.get as jest.Mock).mockReturnValue({
                adminSecret: mockAdminSecret,
            });
            mockRequest.headers.authorization = `Bearer   ${mockAdminSecret}   `;

            // Act
            const result = guard.canActivate(mockExecutionContext);

            // Assert
            expect(result).toBe(true);
        });

        it('should handle Bearer token case-insensitively', () => {
            // Arrange
            (configService.get as jest.Mock).mockReturnValue({
                adminSecret: mockAdminSecret,
            });
            mockRequest.headers.authorization = `bearer ${mockAdminSecret}`;

            // Act
            const result = guard.canActivate(mockExecutionContext);

            // Assert
            expect(result).toBe(true);
        });

        it('should extract IP from X-Forwarded-For header when request.ip is not available', () => {
            // Arrange
            (configService.get as jest.Mock).mockReturnValue({
                adminSecret: mockAdminSecret,
            });
            mockRequest.headers.authorization = `Bearer ${mockAdminSecret}`;
            delete mockRequest.ip;
            mockRequest.headers['x-forwarded-for'] = '192.168.1.1, 10.0.0.1';

            // Act
            const result = guard.canActivate(mockExecutionContext);

            // Assert
            expect(result).toBe(true);
            expect(logger.debug).toHaveBeenCalledWith(
                'Admin authentication successful',
                expect.objectContaining({
                    ip: '192.168.1.1', // Should take first IP from X-Forwarded-For
                }),
            );
        });

        it('should extract IP from X-Real-IP header when other methods are not available', () => {
            // Arrange
            (configService.get as jest.Mock).mockReturnValue({
                adminSecret: mockAdminSecret,
            });
            mockRequest.headers.authorization = `Bearer ${mockAdminSecret}`;
            delete mockRequest.ip;
            delete mockRequest.headers['x-forwarded-for'];
            mockRequest.headers['x-real-ip'] = '10.0.0.1';

            // Act
            const result = guard.canActivate(mockExecutionContext);

            // Assert
            expect(result).toBe(true);
            expect(logger.debug).toHaveBeenCalledWith(
                'Admin authentication successful',
                expect.objectContaining({
                    ip: '10.0.0.1',
                }),
            );
        });

        it('should use "unknown" for IP when no IP information is available', () => {
            // Arrange
            (configService.get as jest.Mock).mockReturnValue({
                adminSecret: mockAdminSecret,
            });
            mockRequest.headers.authorization = `Bearer ${mockAdminSecret}`;
            delete mockRequest.ip;
            delete mockRequest.headers['x-forwarded-for'];
            delete mockRequest.headers['x-real-ip'];

            // Act
            const result = guard.canActivate(mockExecutionContext);

            // Assert
            expect(result).toBe(true);
            expect(logger.debug).toHaveBeenCalledWith(
                'Admin authentication successful',
                expect.objectContaining({
                    ip: 'unknown',
                }),
            );
        });
    });

    describe('constantTimeCompare', () => {
        it('should return false for strings of different lengths', () => {
            // Note: This tests the private method indirectly through canActivate
            // Arrange
            (configService.get as jest.Mock).mockReturnValue({
                adminSecret: 'short',
            });
            mockRequest.headers.authorization = 'Bearer long-token';

            // Act & Assert
            expect(() => guard.canActivate(mockExecutionContext)).toThrow(UnauthorizedException);
        });

        it('should return true for identical strings', () => {
            // This is tested indirectly through successful authentication
            // Arrange
            const secret = 'identical-secret';
            (configService.get as jest.Mock).mockReturnValue({
                adminSecret: secret,
            });
            mockRequest.headers.authorization = `Bearer ${secret}`;

            // Act
            const result = guard.canActivate(mockExecutionContext);

            // Assert
            expect(result).toBe(true);
        });
    });
});
