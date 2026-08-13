import {
    generateFixture,
    getWrapper
} from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import { changeUserActiveStatus } from '../../../../../helpers/users/user_helper'

describe('inactive_user_display.cy', () => {
  let user, inactiveUser, fixture, appPage
  const visitHelper = new VisitHelpers()
  before(() => {
    createUser().then(u => {
      user = u
      createUser().then(u2 => {
        inactiveUser = u2
        const seed = {
          matter: {
            prefix: 'inactive_user_display.cy',
            teamMembers: [user, inactiveUser],
            matterAdmins: [user],
            projects: [
              {
                name: 'inactive user project',
                tasks: [
                  {
                    teamMembers: [user, inactiveUser],
                    name: 'task1',
                  },
                ],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
        appPage = getWrapper(fixture)
      })
    })
  })

  describe('when a user is inactive', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitOrgUsers()
      changeUserActiveStatus(inactiveUser)
      cy.wait(5000)
      cy.get('[role="columnheader"][aria-colindex="6"]').click()
    })
    it('should show a grey background with initials', () => {
      cy.get(`[title="${inactiveUser.username}"]`)
        .find('[data-test=inactive-user-avatar]')
        .should('exist')
    })
    describe('when looking at the matter switcher', () => {
      before(() => {
        cy.get('[data-test=matter-switcher-button]').click()
        cy.get('[data-test=matter-switcher-matter-item]').eq(0).click()
      })
      it('should only display active users', () => {
        cy.get('[data-test=workstream-chip-people]').should(
          'contain.text',
          '1 Person'
        )
      })
      describe('when looking at a task with an inactive user', () => {
        before(() => {
          cy.login(user.username)
          visitHelper.visitTaskDetails(
            fixture.matter.id,
            fixture.projects[0].id,
            fixture.tasks[0].id
          )
        })
        it('should only display active users', () => {
          cy.get('[data-test=inactive-user-avatar]').should('exist')
        })
        describe('when a user is reactivated', () => {
          before(() => {
            cy.login(user.username)
            appPage.visitOrgUsers()
            changeUserActiveStatus(inactiveUser, 'on')
            visitHelper.visitTaskDetails(
              fixture.matter.id,
              fixture.projects[0].id,
              fixture.tasks[0].id
            )
          })
          it('should show a random avatar', () => {
            cy.get('[data-test=inactive-user-avatar]').should('not.exist')
          })
        })
      })
    })
  })
})
