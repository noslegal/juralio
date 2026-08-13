import {
  generateFixture,
  getWrapper,
} from '../../../../helpers/matterprojects/fixture_helper'
import { createTemplate } from '../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../helpers/users/user_api_helper'

describe('fab_actions_contextual.cy', () => {
  let appPage, fixture, newTemplate, user

  before(() => {
    createKnowledgeManagerUser().then(createdUser => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'fab_actions_contextual.cy',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Context is King',
              tasks: [{ name: 'Monkey is Kong' }],
            },
          ],
        },
      }
      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('when visiting the different contexts', () => {
    let projectId

    before(() => {
      projectId = fixture.projects[0].id
      createTemplate('Context Template', projectId).then(template => {
        newTemplate = template
      })
    })

    describe('when visiting the Home page', () => {
      before(() => {
        cy.login(user.username)
        cy.visit('/#/home')
        cy.get('[data-test=fab-button]').click()
      })
      checkFabButtons(['create-task-button', 'create-post-fab-button'])
    })

    describe('when visiting the Task map page', () => {
      before(() => {
        cy.login(user.username)
        appPage.visitTaskMap()
        cy.get('[data-test=fab-button]').click()
      })
      checkFabButtons(['create-task-button', 'create-post-fab-button', 'create-task-from-template-button'])
    })

    describe('when visiting the Project Task details page', () => {
      before(() => {
        cy.login(user.username)
        appPage.visitTaskByName('Monkey is Kong')
        cy.get('[data-test=fab-button]').click()
      })
      checkFabButtons(['create-task-button', 'create-post-fab-button', 'create-task-from-template-button'])
    })

    describe('when visiting the Templates page', () => {
      before(() => {
        cy.login(user.username)
        appPage.visitTemplates()
        cy.get('[data-test=fab-button]').click()
      })
      checkFabButtons([
        'create-template-flow-dialog-button',
        'create-template-task-button',

        'create-post-fab-button',
      ])
      it('does not have the create milestone button', () => {
        cy.get('[data-test=create-milestone-button]').should('not.exist')
      })
    })

    describe('when visiting the Template task map page', () => {
      before(() => {
        cy.login(user.username)
        appPage.visitTemplates()
        cy.get(
          `[data-recordid=${newTemplate.id}] [data-test=template-name]`
        ).click()

        cy.get('[data-test=fab-button]').click()
      })
      checkFabButtons(['create-template-task-button', 'create-post-fab-button'])
    })

    describe('when visiting the Template task details page', () => {
      before(() => {
        cy.login(user.username)
        appPage.visitTemplates()

        cy.get(
          `[data-recordid=${newTemplate.id}] [data-test=template-name]`
        ).click()

        cy.get('[data-test=taskmap-navigation]').click()

        cy.get('[data-test=task-cell-test]', { timeout: 30000 })
          .eq(0)
          .click({ force: true })

        cy.get('[data-test=fab-button]').click()
      })
      checkFabButtons(['create-template-task-button', 'create-post-fab-button'])
    })
  })
})

function checkFabButtons(buttonIds) {
  it('the FAB actions should be displayed', () => {
    cy.get('[data-test=fab-actions]').should('exist')
  })

  it(`there should be ${buttonIds.length} FAB actions should be `, () => {
    cy.get('[data-test=action-label]').should('have.length', buttonIds.length)
  })

  buttonIds.forEach(actionButtonId => {
    it(`should have the correct action button ${actionButtonId}`, () => {
      cy.get(`[data-test=${actionButtonId}]`).should('be.visible')
    })
  })
}
