import { z } from 'zod'

const bootstrapOwnerSchema = z.object({
  BOOTSTRAP_OWNER_NAME: z.string().trim().min(1).max(120),
  BOOTSTRAP_OWNER_PASSWORD: z.string().min(12).max(256),
  BOOTSTRAP_OWNER_USERNAME: z.string().regex(/^[a-z][a-z0-9._-]{2,63}$/i),
})

export function readBootstrapOwnerEnvironment(input: NodeJS.ProcessEnv) {
  const value = bootstrapOwnerSchema.parse(input)
  return {
    name: value.BOOTSTRAP_OWNER_NAME,
    password: value.BOOTSTRAP_OWNER_PASSWORD,
    username: value.BOOTSTRAP_OWNER_USERNAME,
  }
}
