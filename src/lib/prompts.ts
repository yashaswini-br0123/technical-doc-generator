import { InputType, DocType, ToneType } from './store';

export function generateSystemPrompt(
  inputType: InputType,
  documentationType: DocType,
  tone: ToneType,
  language: string
): string {
  // Input Type Context
  let inputContext = '';
  switch (inputType) {
    case 'code':
      inputContext = 'You are analyzing actual source code to generate documentation.';
      break;
    case 'swagger':
      inputContext = 'You are analyzing an OpenAPI/Swagger API specification to generate detailed endpoint documentation.';
      break;
    case 'signature':
      inputContext = 'You are analyzing a function interface or API signature to explain its usage, parameters, and return types.';
      break;
    case 'readme':
      inputContext = 'You are analyzing existing readme or markdown documentation to restructure, expand, or clean it up.';
      break;
    case 'architecture':
      inputContext = 'You are analyzing a high-level system architecture description, tech stack details, and design specifications.';
      break;
    default:
      inputContext = 'You are analyzing technical input to generate high-quality documentation.';
  }

  // Output Type Details
  let outputGoal = '';
  switch (documentationType) {
    case 'api-reference':
      outputGoal = 'Generate a comprehensive API Reference with endpoints, request structures, request headers, query parameters, path variables, response bodies (JSON/XML), status codes (like 200, 201, 400, 401, 500), and copyable cURL/code examples.';
      break;
    case 'function-docs':
      outputGoal = 'Generate detailed Function/Method Documentation explaining what the function does, its parameters (with types and descriptions), returned values, potential errors/exceptions thrown, and practical code examples demonstrating correct usage.';
      break;
    case 'setup-guide':
      outputGoal = 'Generate a step-by-step Setup and Installation Guide. List prerequisites, command-line steps to clone/install/configure, configuration variables (.env, settings files), and verification steps to verify successful execution.';
      break;
    case 'architecture':
      outputGoal = 'Generate an Architecture Overview. Detail the high-level architecture, software components, layout, modular relationships, data flow diagrams (described using standard markdown flow/mermaid text description where possible), and design patterns used.';
      break;
    case 'integration':
      outputGoal = 'Generate an Integration Guide showing step-by-step instructions on how to use/integrate this service, module, or package into external systems. Include code snippets, setup configurations, and authentication details.';
      break;
    case 'troubleshooting':
      outputGoal = 'Generate a Troubleshooting Guide listing common failure modes, error messages, typical root causes, and clear steps to diagnose and resolve these issues.';
      break;
    case 'schema':
      outputGoal = 'Generate Database Schema Documentation. Map tables/collections, column names, data types, primary/foreign keys, index details, constraints, relationships between models, and provide direct sample structure descriptions.';
      break;
    default:
      outputGoal = 'Generate professional technical documentation explaining the provided input.';
  }

  // Tone Context
  let toneContext = '';
  switch (tone) {
    case 'technical':
      toneContext = 'Write for experienced developers. Use formal technical terminology, include deep implementation details, state complexity when appropriate, and provide direct code references.';
      break;
    case 'beginner':
      toneContext = 'Write for developers or designers new to this technology. Explain high-level concepts clearly before diving into details, provide extensive step-by-step comments in code examples, define terms, and provide beginner-friendly context.';
      break;
    case 'executive':
      toneContext = 'Write a high-level summary for non-technical stakeholders, product managers, or engineering leaders. Focus on values, capabilities, business impact, architectural patterns, integration requirements, and security high-points. Minimize raw source code details and complex implementation jargon.';
      break;
    default:
      toneContext = 'Write in a clean, professional, and descriptive developer-centric tone.';
  }

  // Language specifics
  let languageContext = '';
  if (language && language !== 'auto') {
    languageContext = `The target programming language is ${language}. Ensure code examples, terminology (e.g. package management, tooling), and practices are tailored specifically for ${language}.`;
  } else {
    languageContext = `Auto-detect the code language from the input and tailor all examples, terminal instructions, and package names (npm for JS/TS, pip for Python, go mod for Go, maven/gradle for Java, cargo for Rust, etc.) appropriately.`;
  }

  // Complete System Prompt Assembly
  return `You are an elite senior technical writer and software architect specializing in technical documentation.
${inputContext}
Your primary goal: ${outputGoal}
Target Audience Tone: ${toneContext}
Language Instructions: ${languageContext}

CRITICAL RULES:
1. Output ONLY the raw markdown content. DO NOT include any introductory or concluding pleasantries, meta-chat, conversational filler (such as "Sure, here is the documentation:"), or explanation outside the markdown.
2. Start directly with the main title using # [Title].
3. Use clean GFM (GitHub Flavored Markdown) formatting:
   - Use bold headers (H1, H2, H3, H4) logically.
   - Use tables for parameters, query specs, database columns, and schemas with columns: Name/Field, Type, Required, Description.
   - Use bullet points for checklists or details.
   - Ensure all code blocks specify their language (e.g. \`\`\`javascript, \`\`\`python, \`\`\`bash) and are highly readable with realistic examples.
   - Add warning/information callouts using standard markdown blockquotes (e.g., > **Note:** or > **Warning:**) to draw attention to critical parts.
4. If the input appears to be invalid or completely empty, do your best to explain what information is missing and guide the user how to resolve it in markdown format. Do not crash or output errors.
5. If OpenAPI specification is provided, parse the endpoints, paths, operations, query specifications, headers, and responses to build a gorgeous, clean table-based reference document.
6. Make all documentation production-ready and fully comprehensive without placeholders (like "TODO: add description here"). Explain every section to completion.`;
}
