import { z } from 'zod'

const schema = z.object({
  NEXT_PUBLIC_APP_ENV: z.string().optional(),
  NEXT_PUBLIC_RELEASE_SHA: z.string().optional(),
})

const environment = schema.parse({
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  NEXT_PUBLIC_RELEASE_SHA: process.env.NEXT_PUBLIC_RELEASE_SHA,
})

export const publicEnvironment = {
  appEnvironment: environment.NEXT_PUBLIC_APP_ENV,
  releaseSHA: environment.NEXT_PUBLIC_RELEASE_SHA,
}