/**
 * Scale Type enumeration
 * Defines the types of feedback scoring scales supported
 */
export enum ScaleType {
    NUMERIC = 'numeric',
    ENUM = 'enum',
}

/**
 * Base Scale Model
 * Discriminator base class for scale configuration types
 * Pure domain model - no decorators, no transport concerns
 */
export abstract class ScaleModel {
    public abstract readonly type: ScaleType;
}

/**
 * Numeric Scale Model
 * Defines a continuous numeric range for feedback scoring (e.g., 0-10, 1-5)
 * Pure domain model - no decorators, no transport concerns
 */
export class NumericScaleModel extends ScaleModel {
    public readonly type = ScaleType.NUMERIC;
    public min!: number;
    public max!: number;
}

/**
 * Enum Scale Model
 * Defines discrete predefined values for feedback scoring (e.g., ['bad', 'ok', 'great'])
 * Pure domain model - no decorators, no transport concerns
 */
export class EnumScaleModel extends ScaleModel {
    public readonly type = ScaleType.ENUM;
    public values!: string[];
}
