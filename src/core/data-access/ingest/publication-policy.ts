export function shouldPublishImportedRecords(input: { mode: 'automatic' | 'review'; runStatus: 'failed' | 'success' | 'suspicious' }) {
  return input.mode === 'automatic' && input.runStatus === 'success'
}
