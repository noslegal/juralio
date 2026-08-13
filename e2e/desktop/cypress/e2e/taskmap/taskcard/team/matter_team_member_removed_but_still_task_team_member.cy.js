import { removeMatterTeamMemberByUserId } from '../../../../../../helpers/matter/matter_api_helper'
import {
    generateFixture,
    getWrapper
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'

const extendedTimeout = { timeout: 10000 }
describe('matter_team_member_removed_but_still_task_team_member.cy', () => {
  let user0, user1, user2, user3
  let fixture, appPage

  before(() => {
    // added prefix for sorting test
    const createUser0 = () =>
      createUser('autoTTM').then(createdUser => (user0 = createdUser))
    const createUser1 = () =>
      createUser('QWER_A').then(createdUser => (user1 = createdUser))

    createUser0()
      .then(createUser1)
      .then(() => {
        const seed = {
          matter: {
            prefix: 'ttmRemoveInactive',
            teamMembers: [user0, user1],
            matterAdmins: [user0, user1],
            projects: [
              {
                name: 'Test Project',
                tasks: [
                  {
                    name: 'Task',
                    teamMembers: [user0, user1],
                  },
                ],
              },
            ],
          },
        }

        fixture = generateFixture(seed)
        appPage = getWrapper(fixture)
      })
      .then(() => {
        removeMatterTeamMemberByUserId(user0, fixture.matter.id, user1.id)
      })
  })

  describe('when remove a task team member from the matter', () => {
    before(() => {
      cy.login(user0.username)

      appPage.visitTaskByName('Task')

      cy.get('[data-test=users-control]').click()
      cy.get('[data-test=pop-up-menu]').click('right')
    })

    it('no team members should be displayed', () => {
      cy.get('[data-test=name-text]').contains('Not in this matter')
    })

    describe('when the page is refreshed', () => {
      before(() => {
        cy.login(user0.username)
        cy.reload()
        cy.get('[data-test=users-control]').click()
        cy.get('[data-test=pop-up-menu]').click('right')
      })

      it('no team members should be displayed', () => {
        cy.get('[data-test=name-text]').contains('Not in this matter')
      })
    })
  })
})
