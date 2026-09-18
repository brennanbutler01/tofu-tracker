import { SuperJSONResult } from 'superjson/dist/types'
import superjson from 'superjson'

export const serialize = <T>(item: T) => superjson.serialize(item)
export const deserialize = <T>(item: SuperJSONResult) =>
    superjson.deserialize(item) as T
