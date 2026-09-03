import { Forbidden, type CollectionBeforeOperationHook } from 'payload'

export const denyEmailAuthOperations: CollectionBeforeOperationHook<'users'> = ({ args, operation }) => {
  if (operation === 'forgotPassword' || operation === 'resetPassword') throw new Forbidden()
  return args
}
