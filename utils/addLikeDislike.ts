import { LikeActions } from '@/services/feedback/useFeedbackCRUD'
import { LikeKeys, LikeRecord, LikeType } from '@/utils/useLikes'

export const addLikeOrDislike = <T extends LikeRecord>({
    type,
    record,
    userId,
}: LikeType<T>) => {
    const key: LikeKeys = type === LikeActions.LIKE ? 'likes' : 'dislikes'
    const oppositeKey: LikeKeys = key === 'likes' ? 'dislikes' : 'likes'

    return {
        [key]: record[key].includes(userId || '')
            ? [...record[key]]
            : [...record[key], userId],
        [oppositeKey]: record[oppositeKey].filter(id => id !== userId),
    } as LikeRecord
}
