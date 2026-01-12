import { IsEnum, IsNotEmpty, IsNumber, IsArray, IsString } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PickType } from '@nestjs/mapped-types';
import { ScaleType, NumericScaleModel, EnumScaleModel } from '../models/scale.model';

/**
 * Numeric Scale DTO
 * Uses PickType from NumericScaleModel domain model, then adds transport layer decorators
 * Defines a continuous numeric range for feedback scoring (e.g., 0-10, 1-5)
 */
export class NumericScaleDto extends PickType(NumericScaleModel, ['type', 'min', 'max'] as const) {
    @ApiProperty({
        enum: ScaleType,
        example: ScaleType.NUMERIC,
    })
    @Expose()
    @IsEnum(ScaleType)
    @IsNotEmpty()
    declare public readonly type: ScaleType.NUMERIC;

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
    declare public min: number;

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
    declare public max: number;
}

/**
 * Enum Scale DTO
 * Uses PickType from EnumScaleModel domain model, then adds transport layer decorators
 * Defines discrete predefined values for feedback scoring (e.g., ['bad', 'ok', 'great'])
 */
export class EnumScaleDto extends PickType(EnumScaleModel, ['type', 'values'] as const) {
    @ApiProperty({
        enum: ScaleType,
        example: ScaleType.ENUM,
    })
    @Expose()
    @IsEnum(ScaleType)
    @IsNotEmpty()
    declare public readonly type: ScaleType.ENUM;

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
    declare public values: string[];
}
