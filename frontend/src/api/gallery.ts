import promptsData from '@/data/prompts.json'

export interface PromptItem {
  id: string
  title: string
  titleEn: string
  description: string
  content: string
  arguments: Array<{ name: string; default: string; label: string }>
  categories: {
    useCases: string[]
    styles: string[]
    subjects: string[]
  }
  featured: boolean
  needReferenceImages: boolean
}

const allPrompts = promptsData as PromptItem[]

export const galleryApi = {
  getAll: () => allPrompts,

  getFeatured: () => allPrompts.filter(p => p.featured),

  search: (q: string) => {
    const lower = q.toLowerCase()
    return allPrompts.filter(p =>
      p.title.includes(lower) ||
      p.titleEn.toLowerCase().includes(lower) ||
      p.content.toLowerCase().includes(lower) ||
      p.description.includes(lower)
    )
  },

  getByCategory: (cat: string) => allPrompts.filter(p =>
    p.categories.useCases.includes(cat) ||
    p.categories.styles.includes(cat) ||
    p.categories.subjects.includes(cat)
  ),

  getById: (id: string) => allPrompts.find(p => p.id === id),
}
