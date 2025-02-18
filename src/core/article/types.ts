import { withMessage } from 'io-ts-types'
import { slugCodec, dateCodec, positiveCodec } from '@/core/types'
import { tagCodec } from '@/core/tag/types'
import { profileCodec, authorIdOutputCodec } from '@/core/profile/types'
import * as t from 'io-ts'

const articleCodecRequired = t.type({
  slug: slugCodec,
  title: t.string,
  description: t.string,
  body: t.string,
  tagList: t.array(t.string),
  createdAt: dateCodec,
  updatedAt: dateCodec,
  favorited: t.boolean,
  favoritesCount: positiveCodec,
})

const articleCodecOptional = t.partial({
  author: profileCodec,
})

export const articleCodec = t.intersection([
  articleCodecRequired,
  articleCodecOptional,
])

export type Article = t.TypeOf<typeof articleCodec>
export type ArticleOutput = t.OutputOf<typeof articleCodec>

export const articlesCodec = t.type({
  articles: t.array(articleCodec),
  articlesCount: positiveCodec,
})

export type Articles = t.TypeOf<typeof articlesCodec>

const createArticleCodecRequired = t.type({
  title: withMessage(t.string, () => 'Invalid title'),
  description: withMessage(t.string, () => 'Invalid description'),
  body: withMessage(t.string, () => 'Invalid body'),
  authorId: authorIdOutputCodec,
})

const createArticleCodecOptional = t.partial({
  tagList: t.array(tagCodec),
})

export const createArticleCodec = t.intersection([
  createArticleCodecRequired,
  createArticleCodecOptional,
])

export type CreateArticle = t.TypeOf<typeof createArticleCodec>
export type CreateArticleOutput = t.OutputOf<typeof createArticleCodec>
