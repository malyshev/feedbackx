import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configuration } from './config/configuration';
import { loggerModuleFactory, throttlerModuleFactory, typeOrmModuleFactory } from './app.module.factory';
import { FeedbackModule } from './feedback/feedback.module';
import { CommonErrorInterceptor } from './common/interceptors';

@Module({
    imports: [
        // Configuration module - explicit import required (not global)
        ConfigModule.forRoot({
            load: [configuration],
            envFilePath: ['.env.local', '.env'],
        }),
        // Pino logging module - imports ConfigModule to use ConfigService
        LoggerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: loggerModuleFactory,
        }),
        // Rate limiting configuration - imports ConfigModule to use ConfigService
        ThrottlerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: throttlerModuleFactory,
        }),
        // TypeORM database configuration - imports ConfigModule to use ConfigService
        // Entities are auto-discovered using pattern: **/*.entity.ts (test) or **/*.entity.js (production)
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: typeOrmModuleFactory,
        }),

        FeedbackModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        // Apply throttler guard globally
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
        // Apply common error interceptor globally
        {
            provide: APP_INTERCEPTOR,
            useClass: CommonErrorInterceptor,
        },
    ],
})
export class AppModule {}
