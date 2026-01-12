/**
 * Global registry of class names marked with @ApiInternal()
 * Used by filterInternalSchemas to identify internal schemas by name
 * Schema names in Swagger match class names, so we can filter by name directly
 */
export const INTERNAL_DTO_NAMES = new Set<string>();

/**
 * Decorator to mark a DTO as internal.
 * Internal DTOs are excluded from Swagger's Schemas section but still work for IntersectionType composition
 *
 * Registers the class name in INTERNAL_DTO_NAMES for filtering.
 *
 * Usage:
 * ```typescript
 * @ApiInternal()
 * export class InternalDto {
 *   // ...
 * }
 * ```
 */
export const ApiInternal = (): ClassDecorator => {
    return (target) => {
        // Store class name for efficient schema filtering by name
        INTERNAL_DTO_NAMES.add(target.name);
    };
};
