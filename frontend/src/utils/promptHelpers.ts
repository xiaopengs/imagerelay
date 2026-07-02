const gradients = [
  '#667eea, #764ba2', '#f093fb, #f5576c', '#4facfe, #00f2fe', '#43e97b, #38f9d7',
  '#fa709a, #fee140', '#a18cd1, #fbc2eb', '#fccb90, #d57eeb', '#e0c3fc, #8ec5fc',
  '#f5576c, #ff6a88', '#89f7fe, #66a6ff', '#fddb92, #d1fdff', '#a1c4fd, #c2e9fb',
  '#d4fc79, #96e6a1', '#84fab0, #8fd3f4', '#fbc2eb, #a6c1ee', '#f6d365, #fda085',
  '#ffecd2, #fcb69f', '#ff9a9e, #fecfef', '#a8edea, #fed6e3', '#d299c2, #fef9d7',
  '#e8cbc0, #636fa4', '#7f7fd5, #91eae4', '#654ea3, #eaafc8', '#feada6, #f5efef',
  '#a6c0fe, #f68084', '#fccb90, #d57eeb', '#30cfd0, #330867', '#c1dfc4, #de9e89',
  '#0ba360, #3cba92', '#d4fc79, #96e6a1',
]

export function getGradient(id: string): string {
  const num = parseInt(id.replace(/\D/g, ''), 10)
  if (isNaN(num)) return gradients[0]
  return gradients[num % gradients.length]
}

const emojiMap: Record<string, string> = {
  'portrait-selfie': '\u{1F464}', 'landscape': '\u{1F3D4}', 'product': '\u{1F4E6}', 'character': '\u{1F9D1}',
  'animal': '\u{1F43E}', 'food': '\u{1F35C}', 'architecture': '\u{1F3F0}', 'street': '\u{1F327}', 'scifi': '\u{1F680}',
  'botanical': '\u{1F338}', 'logo': '\u2726', 'banner': '\u{1F3F7}', 'data': '\u{1F4CA}', 'ui-design': '\u{1F4F1}',
  'abstract': '\u{1F3A8}', 'horror': '\u{1F47B}', 'miniature': '\u{1F52C}', 'astronomy': '\u2728',
  'action': '\u2694', 'children': '\u{1F4DA}', 'people': '\u{1F465}', 'social': '\u{1F4F9}',
}

export function getEmoji(prompt: { categories: { subjects: string[] } }): string {
  for (const subj of prompt.categories.subjects) {
    if (emojiMap[subj]) return emojiMap[subj]
  }
  return '\u{1F3A8}'
}

/**
 * Replace all {name} placeholders in content with values from the args map.
 * Uses replaceAll semantics (global replacement) to handle repeated placeholders.
 */
export function replaceArguments(content: string, args: Record<string, string>): string {
  let result = content
  for (const [name, value] of Object.entries(args)) {
    const placeholder = `{${name}}`
    // split + join is equivalent to replaceAll (works in all browsers)
    result = result.split(placeholder).join(value || '')
  }
  return result
}
