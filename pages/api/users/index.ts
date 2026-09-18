import { createUsersHandler } from '../../../server/userHandlers'
import { userRepository } from '../../../server/userRepository'
import { getViewer } from '../../../server/viewer'

export const getUsers = userRepository.list
export default createUsersHandler({ getViewer, repository: userRepository, reportError: console.error })
