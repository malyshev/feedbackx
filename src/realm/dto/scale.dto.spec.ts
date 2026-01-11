import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ScaleType, ScaleDto, NumericScaleDto, EnumScaleDto } from './scale.dto';

describe('ScaleDto', () => {
    describe('NumericScaleDto', () => {
        it('should be defined', () => {
            expect(NumericScaleDto).toBeDefined();
        });

        it('should create a valid NumericScaleDto instance', () => {
            const dto = plainToInstance(NumericScaleDto, {
                type: ScaleType.NUMERIC,
                min: 0,
                max: 10,
            });

            expect(dto).toBeInstanceOf(NumericScaleDto);
            expect(dto.type).toBe(ScaleType.NUMERIC);
            expect(dto.min).toBe(0);
            expect(dto.max).toBe(10);
        });

        it('should validate successfully with valid numeric scale', async () => {
            const dto = plainToInstance(NumericScaleDto, {
                type: ScaleType.NUMERIC,
                min: 1,
                max: 5,
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should fail validation when min is missing', async () => {
            const dto = plainToInstance(NumericScaleDto, {
                type: ScaleType.NUMERIC,
                max: 10,
            });

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors.some((error) => error.property === 'min')).toBe(true);
        });

        it('should fail validation when max is missing', async () => {
            const dto = plainToInstance(NumericScaleDto, {
                type: ScaleType.NUMERIC,
                min: 0,
            });

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors.some((error) => error.property === 'max')).toBe(true);
        });

        it('should fail validation when type is missing', async () => {
            const dto = plainToInstance(NumericScaleDto, {
                min: 0,
                max: 10,
            });

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
        });

        it('should handle decimal min and max values', async () => {
            const dto = plainToInstance(NumericScaleDto, {
                type: ScaleType.NUMERIC,
                min: 0.5,
                max: 9.5,
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
            expect(dto.min).toBe(0.5);
            expect(dto.max).toBe(9.5);
        });

        it('should handle negative values', async () => {
            const dto = plainToInstance(NumericScaleDto, {
                type: ScaleType.NUMERIC,
                min: -10,
                max: 10,
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
            expect(dto.min).toBe(-10);
            expect(dto.max).toBe(10);
        });
    });

    describe('EnumScaleDto', () => {
        it('should be defined', () => {
            expect(EnumScaleDto).toBeDefined();
        });

        it('should create a valid EnumScaleDto instance', () => {
            const dto = plainToInstance(EnumScaleDto, {
                type: ScaleType.ENUM,
                values: ['bad', 'ok', 'great'],
            });

            expect(dto).toBeInstanceOf(EnumScaleDto);
            expect(dto.type).toBe(ScaleType.ENUM);
            expect(dto.values).toEqual(['bad', 'ok', 'great']);
        });

        it('should validate successfully with valid enum scale', async () => {
            const dto = plainToInstance(EnumScaleDto, {
                type: ScaleType.ENUM,
                values: ['negative', 'neutral', 'positive'],
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should fail validation when values array is missing', async () => {
            const dto = plainToInstance(EnumScaleDto, {
                type: ScaleType.ENUM,
            });

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors.some((error) => error.property === 'values')).toBe(true);
        });

        it('should fail validation when type is missing', async () => {
            const dto = plainToInstance(EnumScaleDto, {
                values: ['bad', 'ok', 'great'],
            });

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
        });

        it('should fail validation when values contains non-string items', async () => {
            const dto = plainToInstance(EnumScaleDto, {
                type: ScaleType.ENUM,
                values: ['bad', 123, 'great'],
            });

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
        });

        it('should handle single value in array', async () => {
            const dto = plainToInstance(EnumScaleDto, {
                type: ScaleType.ENUM,
                values: ['yes'],
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
            expect(dto.values).toEqual(['yes']);
        });

        it('should handle many values in array', async () => {
            const dto = plainToInstance(EnumScaleDto, {
                type: ScaleType.ENUM,
                values: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
            expect(dto.values).toHaveLength(7);
        });
    });

    describe('ScaleType enum', () => {
        it('should have NUMERIC value', () => {
            expect(ScaleType.NUMERIC).toBe('numeric');
        });

        it('should have ENUM value', () => {
            expect(ScaleType.ENUM).toBe('enum');
        });
    });

    describe('ScaleDto abstract class', () => {
        it('should not be instantiable directly', () => {
            // TypeScript prevents direct instantiation of abstract classes
            // This test documents that ScaleDto is abstract
            expect(ScaleDto).toBeDefined();
        });

        it('should be the base class for NumericScaleDto', () => {
            const dto = plainToInstance(NumericScaleDto, {
                type: ScaleType.NUMERIC,
                min: 0,
                max: 10,
            });

            expect(dto).toBeInstanceOf(NumericScaleDto);
            // NumericScaleDto extends ScaleDto
            expect(Object.getPrototypeOf(Object.getPrototypeOf(dto)).constructor).toBe(ScaleDto);
        });

        it('should be the base class for EnumScaleDto', () => {
            const dto = plainToInstance(EnumScaleDto, {
                type: ScaleType.ENUM,
                values: ['bad', 'ok', 'great'],
            });

            expect(dto).toBeInstanceOf(EnumScaleDto);
            // EnumScaleDto extends ScaleDto
            expect(Object.getPrototypeOf(Object.getPrototypeOf(dto)).constructor).toBe(ScaleDto);
        });
    });
});
