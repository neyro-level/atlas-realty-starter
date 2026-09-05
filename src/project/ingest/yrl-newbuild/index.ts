import type { FeedParser } from '@/shared/types/feed-import'
import { parseYrl } from '@/core/ingest/yrl-parser'

export const yrlNewbuildParser: FeedParser = { parse: (stream, context) => parseYrl(stream, context, 'newbuild') }
