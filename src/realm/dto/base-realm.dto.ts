import { IsNotEmpty, IsObject, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { EnumScaleDto, NumericScaleDto, ScaleDto, ScaleType } from './scale.dto';

/**
 * Base Realm DTO
 * Base class containing common realm fields shared across all realm DTOs
 * Provides the core realm structure (name, key, description, scale, metadata)
 * Note: Not abstract to allow use with IntersectionType which requires concrete classes
 */
@ApiExtraModels(NumericScaleDto, EnumScaleDto)
export class BaseRealmDto {
    @ApiProperty({
        required: true,
        example: 'Customer Satisfaction',
        maxLength: 63,
        description:
            'Human-readable identifier for administration and UI. Maximum length: 63 characters (DNS label limit for portability). Must be unique across all realms.',
    })
    @Expose()
    @IsString()
    @IsNotEmpty()
    @MaxLength(63)
    public name!: string;

    @ApiProperty({
        required: true,
        example: 'customer-satisfaction',
        maxLength: 64,
        description:
            'Public key (slug) used for API routing. Used in URL paths: POST /realms/:key/feedbacks. Maximum length: 64 characters. Must be unique across all realms. Should be URL-safe (lowercase, alphanumeric, hyphens/underscores).',
    })
    @Expose()
    @IsString()
    @IsNotEmpty()
    @MaxLength(64)
    public key!: string;

    @ApiProperty({
        required: false,
        example: 'Collects customer satisfaction feedback using NPS scale',
        maxLength: 255,
        description: 'Optional text description for administration. Maximum length: 255 characters.',
    })
    @Expose()
    @IsString()
    @IsOptional()
    @MaxLength(255)
    public description?: string;

    @ApiProperty({
        required: true,
        oneOf: [{ $ref: '#/components/schemas/NumericScaleDto' }, { $ref: '#/components/schemas/EnumScaleDto' }],
        example: {
            type: 'numeric',
            min: 0,
            max: 10,
        },
        description:
            "Feedback scoring scale configuration. Defines how numeric/rating feedback is structured (numeric range or enum values). Uses discriminator pattern to transform based on 'type' property: ScaleType.NUMERIC ('numeric') → NumericScaleDto (requires min and max), ScaleType.ENUM ('enum') → EnumScaleDto (requires values array).",
    })
    @Expose()
    @ValidateNested()
    @Type(() => ScaleDto, {
        discriminator: {
            property: 'type',
            subTypes: [
                { value: NumericScaleDto, name: ScaleType.NUMERIC },
                { value: EnumScaleDto, name: ScaleType.ENUM },
            ],
        },
        keepDiscriminatorProperty: true,
    })
    @IsObject()
    @IsNotEmpty()
    public scale!: ScaleDto;

    @ApiProperty({
        required: false,
        type: Object,
        example: {
            properties: {
                userId: { type: 'string' },
                version: { type: 'string' },
            },
        },
        description:
            'Optional metadata schema definition. Defines additional structured data fields for feedback. API does NOT enforce semantics - only validates JSON structure/shape.',
    })
    @Expose()
    @IsObject()
    @IsOptional()
    public metadata?: Record<string, unknown>;
}
