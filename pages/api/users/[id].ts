import { createUserHandler } from '../../../server/userHandlers'
import { userRepository } from '../../../server/userRepository'
import { getViewer } from '../../../server/viewer'

export default createUserHandler({ getViewer, repository: userRepository, reportError: console.error })
