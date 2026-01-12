import type { OpenAPIObject } from '@nestjs/swagger';
import { INTERNAL_DTO_NAMES } from '../decorators/api-internal.decorator';

/**
 * Filters out internal schemas from Swagger documentation
 * Automatically discovers all DTOs marked with @ApiInternal() decorator
 * and removes them from the OpenAPI document.
 *
 * Uses the INTERNAL_DTO_NAMES registry (class names) populated by @ApiInternal() decorator
 * to identify which schemas should be filtered. Schema names in Swagger match class names.
 *
 * Note: Internal schemas are removed even if referenced, as they should only be used
 * for composition (e.g., IntersectionType) and not appear in the public API documentation.
 *
 * @param document - OpenAPI document to filter
 * @returns Filtered OpenAPI document with internal schemas removed
 */
export function filterInternalSchemas(document: OpenAPIObject): OpenAPIObject {
    if (!document.components?.schemas) {
        return document;
    }

    // Remove all internal schemas - even if referenced, they shouldn't appear in documentation
    // The actual API uses concrete types (e.g., NumericScaleDto, EnumScaleDto) via oneOf,
    // not the abstract base classes (e.g., ScaleDto)
    for (const schemaName of Object.keys(document.components.schemas)) {
        if (INTERNAL_DTO_NAMES.has(schemaName)) {
            delete document.components.schemas[schemaName];
        }
    }

    return document;
}
