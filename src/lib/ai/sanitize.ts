/**
 * Sanitize user input before embedding in AI prompts.
 * Strips common injection patterns and wraps in delimiters.
 */

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|above|prior)\s+(instructions|prompts|rules)/gi,
  /you\s+are\s+now\s+/gi,
  /forget\s+(all\s+)?(previous|your)\s+(instructions|rules|constraints)/gi,
  /system\s*:\s*/gi,
  /\[INST\]/gi,
  /\[\/INST\]/gi,
  /<\|im_start\|>/gi,
  /<\|im_end\|>/gi,
  /\bsystem\s+prompt\b/gi,
];

export function sanitizePromptInput(input: string): string {
  let sanitized = input;
  for (const pattern of INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, "[filtered]");
  }
  return sanitized.trim();
}

export function wrapUserInput(input: string, label: string): string {
  const sanitized = sanitizePromptInput(input);
  return `<${label}>\n${sanitized}\n</${label}>`;
}
