import nameGenerator from 'project-name-generator'
import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import { addNoteToTask } from '../../../../helpers/matterprojects/task_api_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../helpers/users/user_api_helper'

const newTemplateName = nameGenerator.generate().spaced

describe('external_user_display.cy', () => {
  let user2, user, matter1Fixture, newTemplate, visitHelpers

  before(() => {
    createUser().then(() => {
      createUser().then(createdUser1 => {
        user = createdUser1
        createUser('externalUser', true, true, {
          externalUser: true,
          roles: [],
        }).then(createdUser2 => {
          user2 = createdUser2
          const seed = {
            matter: {
              prefix: 'tcpds',
              teamMembers: [user2, user],
              matterAdmins: [user],
              projects: [
                {
                  tasks: [{ name: 'Task 1', posts: {} }],
                },
              ],
            },
          }
          matter1Fixture = generateFixture(seed)

          visitHelpers = new VisitHelpers()
        })
      })
    })
  })

  describe('when converting an internal user to extenral with no roles', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      visitHelpers.visitHome(false)
      cy.get('[data-test=accounts]').click()
      cy.get('[data-test=search-button]', { timeout: 30000 }).click()
      cy.get('[data-test=Search]').type(user.username)
      cy.get('[data-test=user-name-text]').eq(0).click()
      cy.get('[data-test=external-radio-button]').click()
      cy.get('[data-test=action-dialog-button]').click()
      cy.wait(3000)
      cy.get('[data-test="action-dialog-button"]').eq(1).click()
    })
    it('should work first time', () => {
      cy.get('[data-test=form-dialog-title]').should('not.exist')
    })

    describe('When trying to perform updates on a task', () => {
      before(() => {
        cy.login(user.username)
        addNoteToTask(
          matter1Fixture.matter.id,
          matter1Fixture.projects[0].id,
          matter1Fixture.tasks[0].id,
          {
            name: 'Note',
            description: 'Trains are wonderful machines.',
            finalised: false,
          }
        )
        visitHelpers.visitTaskMap(
          matter1Fixture.matter.id,
          matter1Fixture.projects[0].id
        )
      })
      it('should not have the option to switch task to not required', () => {
        cy.get('[data-test=options-dropdown]', { timeout: 30000 }).click()
        cy.get('[data-test=task-card-option-menu]', { timeout: 30000 }).should(
          'not.contain',
          'Set to not required'
        )
      })
      it('should not have the option to move task', () => {
        cy.get('[data-test=task-card-option-menu]', { timeout: 30000 }).should(
          'not.contain',
          'Move'
        )
      })
      it('should not have the option to copy a task', () => {
        cy.get('[data-test=task-card-option-menu]', { timeout: 30000 }).should(
          'not.contain',
          'Copy'
        )
      })
      it('should not have the option to archive a task', () => {
        cy.get('[data-test=task-card-option-menu]', { timeout: 30000 }).should(
          'not.contain',
          'Archive'
        )
      })
    })

    describe('When trying to perform updates on a post', () => {
      before(() => {
        cy.login(user.username)
        visitHelpers.visitTaskMap(
          matter1Fixture.matter.id,
          matter1Fixture.projects[0].id
        )
        cy.get('[data-test=task-cell-test]', { timeout: 30000 })
          .eq(0)
          .click('left')
        cy.wait(3000)
        cy.get('[data-test=note-list-item]', { timeout: 30000 }).click()
        cy.get('[data-test=task-content-header-menu-button]').click()
      })
      it('should not have the option to archive', () => {
        cy.get('[data-test=task-post-archive]').should('not.exist')
      })
      it('should not have the option to move task', () => {
        cy.get('[data-test=task-post-move]').should('not.exist')
      })
    })
  })
})
