export type PublicLeadInput = {
  consent: true
  email?: string
  formType: string
  message?: string
  name?: string
  phone: string
  source: string
  sourcePage: string
}

export type PublicLeadResult =
  | { leadId: string; ok: true }
  | { code: 'RATE_LIMITED' | 'UNAVAILABLE' | 'VALIDATION_ERROR'; message: string; ok: false }

export interface PublicLeadActionAdapter {
  submit(input: PublicLeadInput): Promise<PublicLeadResult>
}

export type LeadgenAction =
  | { href: string; kind: 'link'; label: string }
  | { adapter: PublicLeadActionAdapter; formType: string; kind: 'form'; source: string; submitLabel: string }
