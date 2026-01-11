/**
 * Formats validation errors into the standard issues format
 *
 * Converts validation errors from various formats to:
 * {
 *   issues: {
 *     fieldName: ["error message 1", "error message 2"],
 *     anotherField: ["error message"]
 *   }
 * }
 *
 * @param errors - Validation errors in various formats
 * @returns Formatted issues object where all values are arrays
 */
export function formatValidationIssues(errors: { [key: string]: string | string[] }): { [key: string]: string[] } {
    const issues: { [key: string]: string[] } = {};

    for (const [field, messages] of Object.entries(errors)) {
        issues[field] = Array.isArray(messages) ? messages : [messages];
    }

    return issues;
}
