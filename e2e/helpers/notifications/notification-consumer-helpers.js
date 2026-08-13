import { createUser } from '../users/user_api_helper'

export const createNamedUsers = namedUsers => {
  const result = {}

  return Cypress.Promise.all(
    namedUsers.map(n =>
      createUser(n).then(createdUser => {
        result[n] = createdUser
      })
    )
  ).then(() => result)
}

export const NC_TASK_CREATOR = 'taskCreator'
export const NC_MATTER_TEAM_MEMBER = 'matterTeamMember'
export const NC_TASK_TEAM_MEMBER = 'taskTeamMember'
export const NC_TASK_TEAM_FOLLOWER = 'taskFollower'

export const createNotificationConsumers = () => {
  const consumerNames = [
    NC_TASK_CREATOR,
    NC_MATTER_TEAM_MEMBER,
    NC_TASK_TEAM_MEMBER,
    NC_TASK_TEAM_FOLLOWER,
  ]
  return createNamedUsers(consumerNames)
}
