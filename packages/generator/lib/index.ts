/**
 * @company/generator — public API
 *
 * Unified design system generation pipeline.
 * Orchestrates: parse → validate → resolve → transform → write
 */

// Register all built-in transforms on import
import { register } from './registry.js';
import { cssTokensTransform } from './transforms/css-tokens.js';
import { cssUtilitiesTransform } from './transforms/css-utilities.js';
import { jsonTransform } from './transforms/json.js';
import { typescriptTransform } from './transforms/typescript.js';
import { themesTransform } from './transforms/themes.js';

register('css-tokens', cssTokensTransform);
register('css-utilities', cssUtilitiesTransform);
register('json', jsonTransform);
register('typescript', typescriptTransform);
register('themes', themesTransform);

// Public exports — orchestrator.ts owns the actual pipeline logic
// (parse → validate → resolve → transform → write); this module only
// registers the built-in transforms and re-exports the public API.
export { orchestrate as generate, ValidationFailureError } from './orchestrator.js';
export { writeOutputs } from './writer.js';
export { register, getTransform, getAllTransformNames } from './registry.js';
export type { GenerateConfig, TransformFn, TransformOutput, GenerateResult } from './types.js';
