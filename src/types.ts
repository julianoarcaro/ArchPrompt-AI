/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ContextInfo {
  country: string;
  city: string;
  projectType: string;
  neighbors: string;
  climate: string;
  lockedMaterials?: string; // Storing the raw locked block or JSON string
}

export interface PromptResult {
  title: string;
  prompt: string;
  negativePrompt: string;
}

export interface GenerationResult {
  prompts: PromptResult[];
  lockedMaterials?: string; // The generated materials string to lock
}
