import { ConfigService } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import type { AppConfig, PinoHttpConfig } from './config/types/configuration.interface';
import type { ThrottlerModuleOptions } from '@nestjs/throttler';

/**
 * Factory function for LoggerModule configuration.
 *
 * @param configService - NestJS ConfigService instance
 * @returns LoggerModule configuration
 * @throws Error if logging configuration is missing
 */
export const loggerModuleFactory = (configService: ConfigService): { pinoHttp: PinoHttpConfig } => {
    const loggingConfig = configService.get<AppConfig['logging']>('logging');
    if (!loggingConfig) {
        throw new Error('Logging configuration not found. Ensure ConfigModule is properly configured.');
    }

    const pinoHttpConfig: PinoHttpConfig = {
        level: loggingConfig.level,
        autoLogging: false,
    };

    if (loggingConfig.prettyPrint) {
        pinoHttpConfig.transport = {
            target: 'pino-pretty',
            options: {
                singleLine: false,
                colorize: true,
            },
        };
    }

    return {
        pinoHttp: pinoHttpConfig,
    };
};

/**
 * Factory function for ThrottlerModule configuration.
 *
 * @param configService - NestJS ConfigService instance
 * @returns ThrottlerModule configuration
 * @throws Error if throttle configuration is missing
 */
export const throttlerModuleFactory = (configService: ConfigService): ThrottlerModuleOptions => {
    const throttle = configService.get<AppConfig['throttle']>('throttle');
    if (!throttle) {
        throw new Error('Throttle configuration not found. Ensure ConfigModule is properly configured.');
    }
    return throttle;
};

/**
 * Factory function for TypeORM configuration.
 *
 * @param configService - NestJS ConfigService instance
 * @returns TypeORM module options
 * @throws Error if database configuration is missing
 */
export const typeOrmModuleFactory = (configService: ConfigService): TypeOrmModuleOptions => {
    const dbConfig = configService.get<AppConfig['database']>('database');
    if (!dbConfig) {
        throw new Error('Database configuration not found. Ensure ConfigModule is properly configured.');
    }

    // Entity path pattern: use .ts for test environment, .js for production/development
    // Test environment: use source .ts files (with ts-node)
    // Production/Development: use compiled .js files from dist/ directory
    const rootPath = process.cwd();
    const isTest = configService.get<string>('NODE_ENV') === 'test';
    const entityExtension = isTest ? 'ts' : 'js';
    const entityBasePath = isTest ? `${rootPath}/src` : `${rootPath}/dist`;
    const entitiesPath = `${entityBasePath}/**/*.entity.${entityExtension}`;
    const entities: string[] = [entitiesPath];

    return {
        type: 'postgres',
        host: dbConfig.host,
        port: dbConfig.port,
        username: dbConfig.username,
        password: dbConfig.password,
        database: dbConfig.database,
        entities,
        synchronize: dbConfig.synchronize,
        logging: dbConfig.logging,
        extra: {
            // Connection pool configuration
            max: dbConfig.poolMax,
            min: dbConfig.poolMin,
            idleTimeoutMillis: dbConfig.poolIdleTimeout,
            connectionTimeoutMillis: dbConfig.poolConnectionTimeout,

            // Query timeout
            query_timeout: dbConfig.queryTimeout,

            // Connection validation and management
            allowExitOnIdle: dbConfig.allowExitOnIdle,

            // Statement cache (0 to disable, or limit to reduce memory)
            statement_cache_size: dbConfig.statementCacheSize,

            // Connection pool size - maximum number of concurrent connections allowed
            connectionLimit: dbConfig.connectionLimit,
        },
    };
};
