import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('matter_overview_people_display.cy', () => {
  let user1, user2, user3, user4, fixture
  const visitHelper = new VisitHelpers()
  before(() => {
    createUser().then(u => {
      user1 = u
      createUser().then(u => {
        user2 = u
        createUser().then(u => {
          user3 = u
          createUser().then(u => {
            user4 = u
            const seed = {
              matter: {
                prefix: '',
                matterViewer: [user4],
                teamMembers: [user2, user3],
                matterAdmins: [user1, user2],
                projects: [
                  {
                    name: 'P1',
                    tasks: [{ name: 'Task 1' }],
                  },

                  { name: 'p2' },
                ],
              },
            }
            fixture = generateFixture(seed)
          })
        })
      })
    })
  })
})
