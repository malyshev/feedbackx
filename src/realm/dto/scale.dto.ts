import { IsEnum, IsNotEmpty, IsNumber, IsArray, IsString } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Scale type enumeration
 * Defines the types of feedback scoring scales supported
 */
export enum ScaleType {
    NUMERIC = 'numeric',
    ENUM = 'enum',
}

/**
 * Base Scale DTO
 * Discriminator base class for scale configuration types
 */
export abstract class ScaleDto {
    @ApiProperty({
        enum: ScaleType,
        example: ScaleType.NUMERIC,
    })
    @Expose()
    @IsEnum(ScaleType)
    @IsNotEmpty()
    public abstract readonly type: ScaleType;
}

/**
 * Numeric Scale DTO
 * Defines a continuous numeric range for feedback scoring (e.g., 0-10, 1-5)
 */
export class NumericScaleDto extends ScaleDto {
    @ApiProperty({
        enum: ScaleType,
        example: ScaleType.NUMERIC,
    })
    @Expose()
    @IsEnum(ScaleType)
    @IsNotEmpty()
    public readonly type = ScaleType.NUMERIC;

    @ApiProperty({
        required: true,
        type: Number,
        example: 0,
        description: 'Minimum allowed value (inclusive). Example: For 5-star rating, min would be 1.',
    })
    @Expose()
    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    public min!: number;

    @ApiProperty({
        required: true,
        type: Number,
        example: 10,
        description: 'Maximum allowed value (inclusive). Example: For 5-star rating, max would be 5.',
    })
    @Expose()
    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    public max!: number;
}

/**
 * Enum Scale DTO
 * Defines discrete predefined values for feedback scoring (e.g., ['bad', 'ok', 'great'])
 */
export class EnumScaleDto extends ScaleDto {
    @ApiProperty({
        enum: ScaleType,
        example: ScaleType.ENUM,
    })
    @Expose()
    @IsEnum(ScaleType)
    @IsNotEmpty()
    public readonly type = ScaleType.ENUM;

    @ApiProperty({
        required: true,
        type: [String],
        example: ['negative', 'neutral', 'positive'],
        description: "Array of allowed string values (must be unique). Example: ['negative', 'neutral', 'positive'].",
    })
    @Expose()
    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty()
    public values!: string[];
}
