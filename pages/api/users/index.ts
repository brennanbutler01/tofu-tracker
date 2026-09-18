import { withVisitorGuard, visitorEnabled } from '@/server/visitorAccess'
import { createUsersHandler } from '../../../server/userHandlers'
import { userRepository } from '../../../server/userRepository'
import { getViewer } from '../../../server/viewer'

export const getUsers = async (userId: string) => {
    if (!visitorEnabled) return userRepository.list()
    const user = await userRepository.find(userId)
    return user ? [user] : []
}
export default withVisitorGuard(
    createUsersHandler({
        getViewer,
        repository: userRepository,
        reportError: console.error,
    })
)
