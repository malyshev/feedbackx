import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import type { Request } from 'express';
import type { AppConfig } from '../../config/types/configuration.interface';

/**
 * Admin authentication guard that validates Bearer token authentication.
 *
 * This guard protects admin-only endpoints by validating the Authorization header.
 * The token must match the ADMIN_SECRET from configuration.
 *
 * Usage:
 * ```typescript
 * @UseGuards(AdminAuthGuard)
 * @Controller('admin')
 * export class AdminController {
 *   // All endpoints require admin authentication
 * }
 *
 * // Or on specific endpoints:
 * @UseGuards(AdminAuthGuard)
 * @Delete(':id')
 * async delete(@Param('id') id: string) {
 *   // Only accessible with valid admin token
 * }
 * ```
 *
 * Authentication:
 * - Header: `Authorization: Bearer <ADMIN_SECRET>`
 * - Example: `Authorization: Bearer a1b2c3d4e5f6...`
 *
 * Security:
 * - Returns 401 Unauthorized if token is missing or invalid
 * - Logs failed authentication attempts for security monitoring
 * - Uses constant-time comparison to prevent timing attacks
 * - Requires ADMIN_SECRET to be configured in environment variables
 */
@Injectable()
export class AdminAuthGuard implements CanActivate {
    constructor(
        private readonly configService: ConfigService,
        private readonly logger: Logger,
    ) {}

    /**
     * Validates admin authentication token from Authorization header.
     *
     * @param context - NestJS execution context (contains request/response)
     * @returns true if authentication is valid, throws UnauthorizedException otherwise
     * @throws UnauthorizedException if token is missing, invalid format, or doesn't match ADMIN_SECRET
     */
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();

        // Get ADMIN_SECRET from configuration
        const appConfig = this.configService.get<AppConfig['app']>('app');
        const adminSecret = appConfig?.adminSecret;

        // Check if ADMIN_SECRET is configured
        if (!adminSecret) {
            this.logger.warn('Admin authentication attempted but ADMIN_SECRET is not configured', {
                context: AdminAuthGuard.name,
                path: request.url,
            });
            throw new UnauthorizedException('Admin authentication is not configured');
        }

        // Extract Authorization header (Express normalizes headers to lowercase)
        const authHeader = request.headers.authorization;
        if (!authHeader || typeof authHeader !== 'string') {
            this.logger.warn('Admin authentication failed: missing Authorization header', {
                context: AdminAuthGuard.name,
                path: request.url,
                ip: this.getClientIp(request),
            });
            throw new UnauthorizedException('Missing or invalid Authorization header');
        }

        // Parse Bearer token
        // Format: "Bearer <token>" or "bearer <token>" (case-insensitive)
        const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
        if (!bearerMatch || !bearerMatch[1]) {
            this.logger.warn('Admin authentication failed: invalid Bearer token format', {
                context: AdminAuthGuard.name,
                path: request.url,
                ip: this.getClientIp(request),
            });
            throw new UnauthorizedException('Invalid Authorization header format. Expected: Bearer <token>');
        }

        const providedToken = bearerMatch[1].trim();

        // Compare tokens using constant-time comparison to prevent timing attacks
        if (!this.constantTimeCompare(providedToken, adminSecret)) {
            this.logger.warn('Admin authentication failed: invalid token', {
                context: AdminAuthGuard.name,
                path: request.url,
                ip: this.getClientIp(request),
            });
            throw new UnauthorizedException('Invalid authentication token');
        }

        // Authentication successful
        this.logger.debug('Admin authentication successful', {
            context: AdminAuthGuard.name,
            path: request.url,
            ip: this.getClientIp(request),
        });

        return true;
    }

    /**
     * Constant-time string comparison to prevent timing attacks.
     *
     * Timing attacks can reveal information about secret values by measuring
     * how long comparison operations take. This function ensures comparison
     * always takes the same time regardless of where the strings differ.
     *
     * @param a - First string to compare
     * @param b - Second string to compare
     * @returns true if strings are equal, false otherwise
     */
    private constantTimeCompare(a: string, b: string): boolean {
        // Return false immediately if lengths differ (early exit is safe here)
        if (a.length !== b.length) {
            return false;
        }

        // Use bitwise OR to accumulate differences
        // If any characters differ, result will be non-zero
        let result = 0;
        for (let i = 0; i < a.length; i++) {
            // Bitwise OR: 0 | 0 = 0 (match), anything else = non-zero (mismatch)
            result |= a.charCodeAt(i) ^ b.charCodeAt(i);
        }

        // Return true only if result is 0 (no differences found)
        return result === 0;
    }

    /**
     * Extracts client IP address from request.
     *
     * Handles various proxy headers (X-Forwarded-For, X-Real-IP) for accurate IP logging
     * in production environments behind reverse proxies or load balancers.
     *
     * @param request - Express request object
     * @returns Client IP address or 'unknown' if not available
     */
    private getClientIp(request: Request): string {
        // Check for IP in request (Express adds this property)
        if (request.ip) {
            return request.ip;
        }

        // Fallback: try to extract from headers (for proxy scenarios)
        // Express normalizes headers to lowercase
        const forwardedFor = request.headers['x-forwarded-for'];
        if (forwardedFor && typeof forwardedFor === 'string') {
            // X-Forwarded-For can contain multiple IPs, take the first one
            return forwardedFor.split(',')[0].trim();
        }

        const realIp = request.headers['x-real-ip'];
        if (realIp && typeof realIp === 'string') {
            return realIp;
        }

        return 'unknown';
    }
}
