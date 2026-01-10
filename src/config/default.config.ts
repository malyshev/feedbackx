import type { AppConfig } from './types/configuration.interface';
import type { ConfigService } from '@nestjs/config';

/**
 * Default configuration factory.
 *
 * This function returns default configuration values that can be overridden
 * by environment variables or environment-specific config files.
 *
 * @param configService - NestJS ConfigService instance
 * @returns Default configuration object
 */
export const defaultConfig = (configService: ConfigService): AppConfig => ({
    app: {
        // Application environment - determines which environment-specific config is loaded
        // Set via NODE_ENV environment variable (development, production, test)
        // This affects logging, error handling, and feature flags
        env: configService.get<string>('NODE_ENV', 'development'),

        // Application port - the port on which the server will listen
        // Default: 3000 - standard Node.js port
        // Override via APP_PORT environment variable for different ports or multiple instances
        // Example: APP_PORT=8080 npm run start:dev
        // Note: Using APP_PORT instead of PORT to avoid conflicts with Docker/system environment variables
        // ConfigService automatically converts string env vars to numbers when type is specified
        port: configService.get<number>('APP_PORT', 3000),

        // Application name - used for logging, monitoring, and identification
        // Default: 'nestjs-app'
        // Override via APP_NAME environment variable
        // Useful for distinguishing multiple services in distributed systems
        name: configService.get<string>('APP_NAME', 'nestjs-app'),

        // Admin secret key - used for admin authentication and secure operations
        // Default: undefined (must be provided via ADMIN_SECRET environment variable)
        // Generate a strong secret using: openssl rand -hex 32
        // Security: MUST be set in production - never commit secrets to version control
        // Use different secrets for each environment (development, staging, production)
        // Example: ADMIN_SECRET=a1b2c3d4e5f6... npm run start:dev
        // Security consideration: Minimum 32 characters recommended for production
        adminSecret: configService.get<string>('ADMIN_SECRET'),
    },
    cors: {
        // Allow credentials (cookies, authorization headers) - set to false by default for security
        // When true, allows cookies and Authorization headers to be sent cross-origin
        // Only set to true if you explicitly need cookies/auth headers across origins
        // Security consideration: When true, origin cannot be '*' - must specify exact domains
        credentials: false,

        // Allowed origins - which domains can access your API
        // Default: true (will be overridden by environment-specific configs)
        // Development: localhost URLs for local development
        // Production: specific domains from ALLOWED_ORIGINS env var (comma-separated)
        // Set to false to disable CORS entirely, or ['https://example.com'] for specific domains
        origin: true,

        // Allowed HTTP methods - which HTTP verbs are permitted
        // Default includes standard REST methods
        // Remove methods you don't use (e.g., PATCH) to reduce attack surface
        // OPTIONS is required for CORS preflight requests - don't remove it
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

        // Allowed headers - which request headers clients can send
        // Content-Type and Accept are standard for API requests
        // Authorization is for bearer tokens and API keys
        // Add custom headers here if your API requires them (e.g., 'X-API-Key')
        allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],

        // Exposed headers - which response headers clients can access via JavaScript
        // X-Total-Count: common for pagination (total items count)
        // X-Page-Count: page count for pagination
        // Location: standard HTTP header for 201 Created responses (resource URL)
        // Add custom headers here that your frontend needs to read
        exposedHeaders: ['X-Total-Count', 'X-Page-Count', 'Location'],

        // Preflight cache duration (maxAge) - how long browsers cache CORS preflight responses
        // Value: 86400 seconds = 24 hours
        // Reduces preflight requests for better performance
        // Increase for less preflight traffic, decrease if CORS settings change frequently
        maxAge: 86400, // 24 hours
    },
    throttle: {
        // Rate limiting configuration - protects against abuse and DDoS
        // Array of throttler configurations - you can add multiple named throttlers
        // Each throttler applies rate limiting independently
        throttlers: [
            {
                // Time window (TTL) - duration in milliseconds during which requests are counted
                // Default: 60000ms = 1 minute
                // Override via THROTTLE_TTL environment variable
                // Adjust based on your API's traffic patterns and abuse patterns
                // Example: 300000 = 5 minutes for slower-changing resources
                // ConfigService automatically converts string env vars to numbers when type is specified
                ttl: configService.get<number>('THROTTLE_TTL', 60000),

                // Request limit - maximum number of requests allowed per time window
                // Default: 100 requests per time window
                // Override via THROTTLE_LIMIT environment variable
                // Tune based on:
                //   - Normal user behavior (how many requests per minute?)
                //   - API complexity (lightweight GET vs heavy POST operations)
                //   - Server capacity and infrastructure
                // Example: Lower limits (10-20) for auth endpoints, higher (200+) for read operations
                // ConfigService automatically converts string env vars to numbers when type is specified
                limit: configService.get<number>('THROTTLE_LIMIT', 100),
            },
            // Example: Add additional throttlers for specific use cases
            // {
            //     name: 'auth',          // Named throttler - use with @UseThrottler('auth')
            //     ttl: 300000,          // 5 minutes
            //     limit: 5,             // Only 5 login attempts per 5 minutes
            // },
        ],

        // Skip throttling function - determines when rate limiting should be disabled
        // Default: Skip in non-production environments (development, test)
        // Production: Always enabled for security
        // Customize this function to skip throttling for:
        //   - Admin users: () => user.isAdmin
        //   - Specific IPs: () => whitelist.includes(request.ip)
        //   - Health checks: () => request.path === '/health'
        skipIf: () => process.env.NODE_ENV !== 'production',
    },
    helmet: {
        // X-Frame-Options: DENY - prevents your site from being embedded in iframes
        // Prevents clickjacking attacks where malicious sites embed your app in invisible iframes
        // Value: { action: 'deny' } = block all iframe embedding
        // Alternatives: { action: 'sameorigin' } = allow from same origin only
        // Set to false to disable (not recommended for APIs)
        frameguard: { action: 'deny' as const },

        // X-Content-Type-Options: nosniff - prevents browsers from MIME type sniffing
        // Prevents browsers from guessing content types, which can lead to XSS vulnerabilities
        // When enabled, browsers strictly follow Content-Type headers
        // Always keep enabled for APIs serving JSON/XML
        // Set to false only if you have specific MIME type handling requirements
        noSniff: true,

        // Hide X-Powered-By header - removes "X-Powered-By: Express" header
        // Security through obscurity: hides the framework/version information
        // Attackers can use framework versions to target known vulnerabilities
        // Removing this header makes fingerprinting harder
        // Always keep enabled unless you have a specific reason to show framework info
        hidePoweredBy: true,

        // X-DNS-Prefetch-Control: off - prevents browsers from prefetching DNS
        // DNS prefetching can leak user browsing behavior
        // When disabled, browsers won't automatically resolve DNS for links/resources
        // Keep disabled for APIs to prevent unnecessary DNS lookups
        // Set to { allow: true } if you want to enable DNS prefetching for performance
        dnsPrefetchControl: { allow: false },

        // X-Download-Options: noopen - prevents IE from executing downloads automatically
        // Legacy IE security feature - prevents auto-execution of downloaded files
        // Modern browsers ignore this, but it's harmless to keep enabled
        // Set to false if you have specific IE legacy requirements
        ieNoOpen: true,

        // Strict-Transport-Security (HSTS) - enforces HTTPS connections
        // When enabled, browsers remember to always use HTTPS for this domain
        // Default: Enabled in production, disabled in development
        // IMPORTANT: Only enable in production with HTTPS - enabling without HTTPS breaks localhost
        hsts:
            configService.get<string>('NODE_ENV') === 'production'
                ? {
                      // HSTS max age - how long browsers remember to use HTTPS (in seconds)
                      // Default: 31536000 = 1 year
                      // Once set, browsers will enforce HTTPS for this duration
                      // Increase for better security, decrease if you need flexibility
                      // Common values: 31536000 (1 year), 63072000 (2 years)
                      maxAge: 31536000, // 1 year

                      // Include subdomains - applies HSTS to all subdomains
                      // When true, example.com and *.example.com all use HTTPS
                      // Recommended: true for production to protect entire domain tree
                      // Set to false if you have subdomains that don't support HTTPS yet
                      includeSubDomains: true,

                      // HSTS preload - allows inclusion in browser HSTS preload lists
                      // Browser vendors maintain lists of domains that always use HTTPS
                      // When enabled, you can submit your domain to hstspreload.org
                      // Requires includeSubDomains: true and min 1 year maxAge
                      // Only enable if you're committed to HTTPS forever (hard to remove from preload)
                      preload: true,
                  }
                : false, // Disabled in development to avoid localhost HTTPS issues
    },
    logging: {
        // Log level - determines which log messages are displayed
        // Levels: trace < debug < info < warn < error < fatal
        // Default: 'info' - shows info, warn, error, fatal (hides trace, debug)
        // Override via LOG_LEVEL environment variable
        // Development: Use 'debug' to see more details during development
        // Production: Use 'info' or 'warn' to reduce log volume
        // Example: LOG_LEVEL=debug npm run start:dev
        level: configService.get<string>('LOG_LEVEL', 'info'),

        // Pretty printing - formats logs for human readability
        // Default: false (structured JSON) - better for production log aggregation
        // Development: Enable pretty printing for easier reading in terminal
        // Production: Disable pretty printing - use structured JSON for log parsing (Promtail/Loki compatible)
        // Pretty printing adds overhead - only use in development
        // Override via LOG_PRETTY environment variable (true/false)
        // Note: Structured JSON in production is compatible with Grafana Loki/Promtail stack
        // Explicitly convert string to boolean - env vars are strings ("true"/"false")
        // ConfigService.get<boolean> doesn't always handle string conversion correctly
        prettyPrint: configService.get<string>('LOG_PRETTY', 'false') === 'true',
    },
    database: {
        // Database host - PostgreSQL server hostname or IP address
        // Default: 'localhost' - standard for local development
        // Override via DB_HOST environment variable for different hosts
        // Docker: Use 'host.docker.internal' to access host machine from container
        // Example: DB_HOST=postgres.example.com
        host: configService.get<string>('DB_HOST', 'localhost'),

        // Database port - PostgreSQL server port
        // Default: 5432 - standard PostgreSQL port
        // Override via DB_PORT environment variable if using non-standard port
        // Example: DB_PORT=5433
        // ConfigService automatically converts string env vars to numbers when type is specified
        port: configService.get<number>('DB_PORT', 5432),

        // Database username - PostgreSQL user for authentication
        // Default: 'postgres' - standard default PostgreSQL user
        // Override via DB_USERNAME environment variable
        // Example: DB_USERNAME=myapp_user
        username: configService.get<string>('DB_USERNAME', 'postgres'),

        // Database password - PostgreSQL user password
        // Default: 'postgres' - CHANGE THIS IN PRODUCTION
        // Override via DB_PASSWORD environment variable
        // Security: MUST be set in production - never commit passwords to version control
        // Example: DB_PASSWORD=secure-password-123
        password: configService.get<string>('DB_PASSWORD', 'postgres'),

        // Database name - name of the PostgreSQL database to connect to
        // Default: 'nestjs-app' - change to match your application
        // Override via DB_DATABASE environment variable
        // Example: DB_DATABASE=feedbackx
        database: configService.get<string>('DB_DATABASE', 'nestjs-app'),

        // Auto-synchronize database schema - automatically syncs entity changes to database
        // WARNING: Should be false in production - only use in development/test
        // When true: Automatically creates/updates/drops tables based on entity definitions
        // When false: Requires manual migrations (recommended for production)
        // Default: false - safe default, should be overridden per environment
        // Override via DB_SYNCHRONIZE environment variable (true/false)
        // Development: true for rapid development (auto-sync changes)
        // Production: ALWAYS false - use migrations instead to prevent data loss
        // Explicitly convert string to boolean - env vars are strings ("true"/"false")
        // ConfigService.get<boolean> doesn't always handle string conversion correctly
        synchronize: configService.get<string>('DB_SYNCHRONIZE', 'false') === 'true',

        // Connection pool maximum connections - maximum number of connections in the pool
        // Default: 20 - good balance for most applications
        // Override via DB_POOL_MAX environment variable
        // Tune based on:
        //   - Database server capacity (check PostgreSQL max_connections setting)
        //   - Application load (more concurrent requests = higher pool size)
        //   - Available memory (each connection uses memory)
        // Example: DB_POOL_MAX=50 for high-traffic applications
        // ConfigService automatically converts string env vars to numbers when type is specified
        poolMax: configService.get<number>('DB_POOL_MAX', 20),

        // Connection pool minimum connections - minimum number of connections to maintain
        // Default: 5 - keeps warm connections ready for faster response
        // Override via DB_POOL_MIN environment variable
        // Higher values = faster initial queries (connections already open)
        // Lower values = less resource usage (fewer idle connections)
        // Example: DB_POOL_MIN=10 for high-traffic applications
        // ConfigService automatically converts string env vars to numbers when type is specified
        poolMin: configService.get<number>('DB_POOL_MIN', 5),

        // Connection pool idle timeout - time in milliseconds before closing idle connections
        // Default: 30000ms = 30 seconds
        // Override via DB_POOL_IDLE_TIMEOUT environment variable
        // Idle connections are closed after this timeout to free resources
        // Increase for applications with periodic bursts (keeps connections longer)
        // Decrease for applications with steady traffic (releases connections faster)
        // Example: DB_POOL_IDLE_TIMEOUT=60000 (1 minute)
        // ConfigService automatically converts string env vars to numbers when type is specified
        poolIdleTimeout: configService.get<number>('DB_POOL_IDLE_TIMEOUT', 30000),

        // Connection pool connection timeout - time in milliseconds to wait for new connection
        // Default: 10000ms = 10 seconds
        // Override via DB_POOL_CONNECTION_TIMEOUT environment variable
        // Throws error if connection cannot be established within this time
        // Increase if database is slow to respond (network latency, overloaded DB)
        // Decrease to fail fast if database is unreachable
        // Example: DB_POOL_CONNECTION_TIMEOUT=20000 (20 seconds)
        // ConfigService automatically converts string env vars to numbers when type is specified
        poolConnectionTimeout: configService.get<number>('DB_POOL_CONNECTION_TIMEOUT', 10000),

        // Query timeout - time in milliseconds before query times out
        // Default: 30000ms = 30 seconds
        // Override via DB_QUERY_TIMEOUT environment variable
        // Prevents long-running queries from blocking the application
        // Increase for complex analytical queries or bulk operations
        // Decrease for fast OLTP workloads (fail fast on slow queries)
        // Example: DB_QUERY_TIMEOUT=60000 (1 minute) for reporting queries
        // ConfigService automatically converts string env vars to numbers when type is specified
        queryTimeout: configService.get<number>('DB_QUERY_TIMEOUT', 30000),

        // TypeORM query logging - enable SQL query logging (development/debugging only)
        // Default: false - disable in production for performance
        // Override via DB_LOGGING environment variable (true/false)
        // Enable for debugging SQL queries during development
        // WARNING: Can generate significant log volume - only use when needed
        // Example: DB_LOGGING=true for development debugging
        // Explicitly convert string to boolean - env vars are strings ("true"/"false")
        // ConfigService.get<boolean> doesn't always handle string conversion correctly
        logging: configService.get<string>('DB_LOGGING', 'false') === 'true',

        // Connection pool connection limit - maximum number of concurrent connections allowed
        // Default: 20 (same as poolMax for consistency)
        // Override via DB_POOL_CONNECTION_LIMIT environment variable
        // Sets the maximum number of connections that can be created at once
        // Should match or be less than poolMax for consistency
        // Example: DB_POOL_CONNECTION_LIMIT=50 for high-traffic applications
        // ConfigService automatically converts string env vars to numbers when type is specified
        connectionLimit: configService.get<number>('DB_POOL_CONNECTION_LIMIT', 20),

        // Statement cache size - limit prepared statement cache (0 to disable)
        // Default: 0 (disabled to reduce memory usage)
        // Override via DB_STATEMENT_CACHE_SIZE environment variable
        // Set to 0 to disable statement caching (reduces memory usage)
        // Increase if you have many prepared statements and want to cache them
        // Example: DB_STATEMENT_CACHE_SIZE=100 to cache up to 100 statements
        // ConfigService automatically converts string env vars to numbers when type is specified
        statementCacheSize: configService.get<number>('DB_STATEMENT_CACHE_SIZE', 0),

        // Allow exit on idle - allow process to exit when connections are idle
        // Default: false (keep connections alive for better performance)
        // Override via DB_ALLOW_EXIT_ON_IDLE environment variable (true/false)
        // When true, allows the process to exit if all connections are idle
        // When false, keeps connections alive (recommended for server applications)
        // Example: DB_ALLOW_EXIT_ON_IDLE=false for server applications
        // Explicitly convert string to boolean - env vars are strings ("true"/"false")
        // ConfigService.get<boolean> doesn't always handle string conversion correctly
        allowExitOnIdle: configService.get<string>('DB_ALLOW_EXIT_ON_IDLE', 'false') === 'true',
    },
});
