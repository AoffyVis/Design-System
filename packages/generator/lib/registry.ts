import type { TransformFn } from './types.js';

/**
 * Transform registry — maps transform names to their implementations.
 * New transforms are registered here to become available via CLI --platforms.
 */
const transforms = new Map<string, TransformFn>();

/**
 * Register a named transform function.
 */
export function register(name: string, fn: TransformFn): void {
  transforms.set(name, fn);
}

/**
 * Get a transform by name. Returns undefined if not registered.
 */
export function getTransform(name: string): TransformFn | undefined {
  return transforms.get(name);
}

/**
 * Get all registered transform names.
 */
export function getAllTransformNames(): string[] {
  return [...transforms.keys()];
}

/**
 * Get all registered transforms as entries.
 */
export function getAllTransforms(): Array<[string, TransformFn]> {
  return [...transforms.entries()];
}
