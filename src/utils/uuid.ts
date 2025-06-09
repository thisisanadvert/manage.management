/**
 * UUID Utilities
 * 
 * Provides utilities for working with UUIDs safely and validating them
 * to prevent the invalid UUID errors we encountered.
 */

/**
 * Validates if a string is a valid UUID v4 format
 * @param uuid - The string to validate
 * @returns true if valid UUID, false otherwise
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validates if a string is a valid UUID (any version)
 * @param uuid - The string to validate
 * @returns true if valid UUID, false otherwise
 */
export function isValidUUIDAnyVersion(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Generates a random UUID v4
 * @returns A valid UUID v4 string
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Sanitizes a UUID by removing invalid characters and formatting
 * @param uuid - The UUID string to sanitize
 * @returns A sanitized UUID string or null if cannot be fixed
 */
export function sanitizeUUID(uuid: string): string | null {
  // Remove any non-hexadecimal characters except hyphens
  const cleaned = uuid.toLowerCase().replace(/[^0-9a-f-]/g, '');
  
  // Check if we have enough characters for a UUID
  const hexOnly = cleaned.replace(/-/g, '');
  if (hexOnly.length !== 32) {
    return null;
  }
  
  // Format as UUID
  const formatted = `${hexOnly.slice(0, 8)}-${hexOnly.slice(8, 12)}-${hexOnly.slice(12, 16)}-${hexOnly.slice(16, 20)}-${hexOnly.slice(20, 32)}`;
  
  // Validate the result
  return isValidUUIDAnyVersion(formatted) ? formatted : null;
}

/**
 * Validates and throws an error if UUID is invalid
 * @param uuid - The UUID to validate
 * @param context - Context for the error message
 * @throws Error if UUID is invalid
 */
export function validateUUID(uuid: string, context: string = 'UUID'): void {
  if (!isValidUUIDAnyVersion(uuid)) {
    throw new Error(`Invalid ${context}: "${uuid}". UUIDs must contain only hexadecimal characters (0-9, a-f) and hyphens in the format xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`);
  }
}

/**
 * Safe UUID validation for user input
 * @param uuid - The UUID string to validate
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateUUIDSafe(uuid: string): { isValid: boolean; error?: string } {
  if (!uuid || typeof uuid !== 'string') {
    return { isValid: false, error: 'UUID is required and must be a string' };
  }
  
  if (!isValidUUIDAnyVersion(uuid)) {
    return { 
      isValid: false, 
      error: `Invalid UUID format. UUIDs must contain only hexadecimal characters (0-9, a-f) and hyphens in the format xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx. Received: "${uuid}"` 
    };
  }
  
  return { isValid: true };
}

/**
 * Known valid UUIDs for the application
 */
export const KNOWN_BUILDING_IDS = {
  DEMO_BUILDING: 'b0a3f3f0-0b1a-4e1a-9f1a-0e1b2c3d4e5f',
  CENTRAL_PARK: 'c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6'
} as const;

/**
 * Validates if a building ID is one of our known valid IDs
 * @param buildingId - The building ID to check
 * @returns true if it's a known valid building ID
 */
export function isKnownBuildingId(buildingId: string): boolean {
  return Object.values(KNOWN_BUILDING_IDS).includes(buildingId as any);
}
