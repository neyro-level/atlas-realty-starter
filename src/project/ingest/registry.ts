import type { FeedParser } from '@/shared/types/feed-import'
import { yrlNewbuildParser } from './yrl-newbuild'
import { yrlSecondaryParser } from './yrl-secondary'

const parsers = { 'yrl-newbuild': yrlNewbuildParser, 'yrl-secondary': yrlSecondaryParser } satisfies Record<string, FeedParser>
export type ParserName = keyof typeof parsers
export function getFeedParser(name: string): FeedParser {
  if (!(name in parsers)) throw new Error('Feed parser is not allowlisted')
  return parsers[name as ParserName]
}
