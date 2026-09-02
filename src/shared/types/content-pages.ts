export type DirectoryHeaderContent = {
  description: string
  eyebrow: string
  title: string
}

export type ContentPagesConfig = {
  employees: DirectoryHeaderContent & {
    basePath: string
    emptyDescription: string
    emptyTitle: string
  }
  employeeProfile: {
    employeesHref: string
    employeesLabel: string
    homeHref: string
    homeLabel: string
  }
  journal: DirectoryHeaderContent & {
    emptyDescription: string
    emptyTitle: string
  }
  legal: DirectoryHeaderContent & {
    cards: Array<{ body: string; status: string; title: string }>
  }
  sitemap: DirectoryHeaderContent & {
    groups: Array<{ links: Array<{ href: string; label: string }>; title: string }>
  }
  leadgen: Record<'apartments' | 'construction' | 'new-buildings', {
    disclaimer: string
    eyebrow: string
    href: string
    image: string
    text: string
    title: string
  }>
  shell: {
    homeHref: string
    homeLabel: string
  }
}
