import { InputType } from './store';

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export function validateInput(input: string, inputType: InputType): ValidationResult {
  const trimmed = input.trim();
  
  // 1. Check for empty input
  if (!trimmed) {
    return {
      valid: false,
      message: 'Please paste some code, API specification, or content to get started.',
    };
  }

  // 2. Check for maximum length (10,000 characters limit)
  if (input.length > 10000) {
    return {
      valid: false,
      message: `Input is too large (current size: ${input.length.toLocaleString()} characters). Please keep it under 10,000 characters.`,
    };
  }

  // 3. Validation for OpenAPI / Swagger specs
  if (inputType === 'swagger') {
    const looksLikeJson = trimmed.startsWith('{') && trimmed.endsWith('}');
    
    if (looksLikeJson) {
      try {
        JSON.parse(trimmed);
      } catch {
        return {
          valid: false,
          message: 'Invalid JSON format. Please check for missing brackets, trailing commas, or syntax errors.',
        };
      }
    } else {
      // Looks like YAML (or should be)
      // Check for common OpenAPI/Swagger keys in YAML format
      const hasSwaggerIndicator = 
        trimmed.includes('swagger:') || 
        trimmed.includes('openapi:') || 
        trimmed.includes('paths:') || 
        trimmed.includes('info:');
        
      if (!hasSwaggerIndicator) {
        return {
          valid: false,
          message: 'Invalid OpenAPI/Swagger specification format. Ensure it is valid JSON or YAML with appropriate fields (openapi/swagger, info, paths).',
        };
      }
      
      // Basic YAML structure lines check (each key should have a colon followed by space or newline)
      const lines = trimmed.split('\n');
      let yamlViolations = 0;
      for (const line of lines.slice(0, 15)) { // Check first 15 lines
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#') && !trimmedLine.startsWith('-')) {
          if (trimmedLine.includes(':')) {
            const parts = trimmedLine.split(':');
            // If there's no space after the colon and it's not a URL, it might be invalid YAML
            const value = parts[1];
            if (value && !value.startsWith(' ') && !value.startsWith('\r') && !value.startsWith('\n') && !value.startsWith('//') && !value.startsWith('/')) {
              yamlViolations++;
            }
          }
        }
      }
      if (yamlViolations > 5) {
        return {
          valid: false,
          message: 'Invalid YAML format. Please check your indentation and make sure all colons have a space after them (e.g. "key: value").',
        };
      }
    }
  }

  return { valid: true };
}
