import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'
import taskDetailPage from '../../../../../../page/taskdetail/taskdetail_page'

describe('milestone_details_display.cy', () => {
  let user, fixture, appPage

  const milestoneDetailsPage = taskDetailPage.get

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'milestone_display',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Test Project',
              tasks: [{ name: 'a milestone', isMilestone: true }],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('when opening a milestone', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('a milestone')
    })

    it('displays the milestone name', () => {
      milestoneDetailsPage.taskDetailName().should('have.text', 'a milestone')
      milestoneDetailsPage.milestoneIcon().should('be.visible')
      milestoneDetailsPage.taskReferenceText().should('have.text', 'Phase')
      cy.get('[data-test=task-details-layout]').should('not.contain', 'task')
      cy.get('[data-test=task-details-layout]').should('not.contain', 'Task')
    })

    it('displays the option menu button', () => {
      cy.get('[data-test="task-card-option-menu-button"').should('be.visible')
    })

    describe('clicking the option menu', () => {
      before(() => {
        cy.get('[data-test="task-card-option-menu-button"]').click()
        cy.get('[data-test=task-card-option-menu-more]').click()
      })

      it('opens the menu and displays move copy archive', () => {
        cy.get('[data-test="task-card-option-menu"]').should('be.visible')
        cy.get('[data-test="task-card-option-menu-move"]').should('be.visible')
        cy.get('[data-test="task-card-option-menu-copy"]').should('be.visible')
        cy.get('[data-test="task-card-option-menu-archive"]').should(
          'be.visible'
        )
      })
    })
  })

  describe('when archive milestone and navigate back to the archived milestone', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('a milestone')
      cy.get('[data-test="task-card-option-menu-button"]').click()
      cy.get('[data-test=task-card-option-menu-more]').click()
      cy.get('[data-test="task-card-option-menu-archive"]').click()
      cy.get('[data-test="action-dialog-button"]').click()
      cy.visit('/#/home/this-does-not-exist')
      cy.wait(1000)
      cy.visit(
        `/#/matter/${fixture.matter.id}/workstream/${fixture.projects[0].id}/task/${fixture.tasks[0].id}`
      )
    })

    it('show not found page', () => {
      cy.get('[data-test=not-found-page]').should('be.visible')
    })
  })
})
