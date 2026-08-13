import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'

import { createUser } from '../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

describe('convert_deliverables.cy', () => {
  let user, fixture

  const NON_DELIVERABLE_NAME_LEVEL_A = 'i am not a deliverable at level a'
  const DELIVERABLE_NAME_SUBTASK = 'i am a deliverable at subtask level'
  const TASK_NAME = 'i am a task'

  before(() => {
    createUser().then(createdUser => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'milestone_behaviour',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'workstream',
              tasks: [
                {
                  name: NON_DELIVERABLE_NAME_LEVEL_A,
                  properties: {
                    isDeliverable: false,
                    status: 'done',
                  },
                },
                {
                  name: TASK_NAME,
                  tasks: [
                    {
                      name: DELIVERABLE_NAME_SUBTASK,
                      properties: {
                        isDeliverable: true,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      }
      fixture = generateFixture(seed)
    })
  })
  describe('when visiting level a task details', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      const url = `${Cypress.env(
        'serverRootBaseUrl'
      )}/api/admin/instance/settings`

      cy.apiSpecRequest({
        url,
        method: 'PATCH',
        body: {
          enablePaymentPlatformIntegration: false,
        },
      })
      cy.login(user)
      cy.visit(
        '/#/matter/' +
          fixture.matter.id +
          '/workstream/' +
          fixture.projects[0].id +
          '/task/' +
          fixture.tasks[0].id
      )
    })
    it('should not show the deliverable indicator', () => {
      cy.get('[data-test=task-header-jur-number]').should(
        'contain.text',
        'A-phase'
      )
    })
    it('should not show the deliverable icon', () => {
      cy.get('[data-test=deliverable-icon]').should('not.exist')
    })
  })
  describe('when visiting subtask deliverable', () => {
    before(() => {
      cy.login(user)
      cy.visit(
        '/#/matter/' +
          fixture.matter.id +
          '/workstream/' +
          fixture.projects[0].id +
          '/task/' +
          fixture.tasks[1].id
      )
      cy.get('[data-test="task-cell-test"]').click()
    })
    it('should show the deliverable indicator', () => {
      cy.get('[data-test=task-header-jur-number]').should(
        'contain.text',
        'B-deliverable'
      )
    })
    it('should show the deliverable icon', () => {
      cy.get('[data-test=deliverable-icon]').should('be.visible')
    })
    it('should show the convert to task in the option menu ', () => {
      cy.get('[data-test=task-card-option-menu-button]').click()
      cy.get('[data-test=task-card-option-menu-more]').click()
      cy.get('[data-test=task-card-option-menu] [role=menuitem]').eq(10).click()
    })
    it('should show the phase indicator', () => {
      cy.get('[data-test=task-header-jur-number]').should(
        'contain.text',
        'B-subtask'
      )
    })
  })
})
