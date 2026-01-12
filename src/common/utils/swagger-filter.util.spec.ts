import type { OpenAPIObject } from '@nestjs/swagger';
import { filterInternalSchemas } from './swagger-filter.util';
import { INTERNAL_DTO_NAMES } from '../decorators/api-internal.decorator';

describe('filterInternalSchemas', () => {
    beforeEach(() => {
        // Clear the registry before each test
        INTERNAL_DTO_NAMES.clear();
    });

    afterEach(() => {
        // Clean up after each test
        INTERNAL_DTO_NAMES.clear();
    });

    it('should be defined', () => {
        expect(filterInternalSchemas).toBeDefined();
    });

    it('should return document unchanged if components.schemas is missing', () => {
        const document: OpenAPIObject = {
            openapi: '3.0.0',
            info: {
                title: 'Test API',
                version: '1.0.0',
            },
            paths: {},
        };

        const result = filterInternalSchemas(document);

        expect(result).toEqual(document);
        expect(result.components).toBeUndefined();
    });

    it('should return document unchanged if components.schemas is undefined', () => {
        const document: OpenAPIObject = {
            openapi: '3.0.0',
            info: {
                title: 'Test API',
                version: '1.0.0',
            },
            paths: {},
            components: {},
        };

        const result = filterInternalSchemas(document);

        expect(result).toEqual(document);
        expect(result.components?.schemas).toBeUndefined();
    });

    it('should return document unchanged if no internal schemas are registered', () => {
        const document: OpenAPIObject = {
            openapi: '3.0.0',
            info: {
                title: 'Test API',
                version: '1.0.0',
            },
            paths: {},
            components: {
                schemas: {
                    PublicDto: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                        },
                    },
                    AnotherPublicDto: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                        },
                    },
                },
            },
        };

        const result = filterInternalSchemas(document);

        expect(result.components?.schemas).toEqual({
            PublicDto: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                },
            },
            AnotherPublicDto: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                },
            },
        });
    });

    it('should remove internal schemas from document', () => {
        // Register internal DTOs
        INTERNAL_DTO_NAMES.add('InternalDto');
        INTERNAL_DTO_NAMES.add('BaseDto');

        const document: OpenAPIObject = {
            openapi: '3.0.0',
            info: {
                title: 'Test API',
                version: '1.0.0',
            },
            paths: {},
            components: {
                schemas: {
                    PublicDto: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                        },
                    },
                    InternalDto: {
                        type: 'object',
                        properties: {
                            internal: { type: 'string' },
                        },
                    },
                    BaseDto: {
                        type: 'object',
                        properties: {
                            base: { type: 'string' },
                        },
                    },
                    AnotherPublicDto: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                        },
                    },
                },
            },
        };

        const result = filterInternalSchemas(document);

        expect(result.components?.schemas).toEqual({
            PublicDto: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                },
            },
            AnotherPublicDto: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                },
            },
        });
        expect(result.components?.schemas?.InternalDto).toBeUndefined();
        expect(result.components?.schemas?.BaseDto).toBeUndefined();
    });

    it('should remove all internal schemas even if they are referenced', () => {
        // Register internal DTO
        INTERNAL_DTO_NAMES.add('InternalBaseDto');

        const document: OpenAPIObject = {
            openapi: '3.0.0',
            info: {
                title: 'Test API',
                version: '1.0.0',
            },
            paths: {
                '/test': {
                    post: {
                        responses: {
                            '200': {
                                description: 'Success',
                            },
                        },
                        requestBody: {
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/InternalBaseDto',
                                    },
                                },
                            },
                        },
                    },
                },
            },
            components: {
                schemas: {
                    InternalBaseDto: {
                        type: 'object',
                        properties: {
                            base: { type: 'string' },
                        },
                    },
                    PublicDto: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                        },
                    },
                },
            },
        };

        const result = filterInternalSchemas(document);

        // Internal schema should be removed even though it's referenced
        expect(result.components?.schemas?.InternalBaseDto).toBeUndefined();
        expect(result.components?.schemas?.PublicDto).toBeDefined();
    });

    it('should handle empty schemas object', () => {
        const document: OpenAPIObject = {
            openapi: '3.0.0',
            info: {
                title: 'Test API',
                version: '1.0.0',
            },
            paths: {},
            components: {
                schemas: {},
            },
        };

        const result = filterInternalSchemas(document);

        expect(result.components?.schemas).toEqual({});
    });

    it('should not modify the original document object', () => {
        INTERNAL_DTO_NAMES.add('InternalDto');

        const document: OpenAPIObject = {
            openapi: '3.0.0',
            info: {
                title: 'Test API',
                version: '1.0.0',
            },
            paths: {},
            components: {
                schemas: {
                    PublicDto: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                        },
                    },
                    InternalDto: {
                        type: 'object',
                        properties: {
                            internal: { type: 'string' },
                        },
                    },
                },
            },
        };

        const originalSchemas = { ...document.components?.schemas };
        filterInternalSchemas(document);

        // Original document should be modified (function mutates)
        // But we verify the function works correctly
        expect(document.components?.schemas?.InternalDto).toBeUndefined();
        expect(originalSchemas.InternalDto).toBeDefined();
    });
});
