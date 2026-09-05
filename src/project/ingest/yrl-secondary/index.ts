import type { FeedParser } from '@/shared/types/feed-import'
import { parseYrl } from '@/core/ingest/yrl-parser'

export const yrlSecondaryParser: FeedParser = { parse: (stream, context) => parseYrl(stream, context, 'secondary') }
