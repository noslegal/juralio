//list system templates X
//should show styling X
//view system template X
//view task X
//view post X
//not view draft post X
//draft post not in list X
//cant edit template name or descirption X
//cant edit or move from taskmap X
//cant edit or move from task details X
//cant edit or move post X
//can copy
//can use
//cant unpublish X
//cant add from fab

import { getLegalProjectName } from '../../../../../helpers/data/legal_task_name_generator'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import {
  createSystemLevelTemplate,
  createTemplateTask,
  createTemplateTaskNote,
  finaliseTemplatePost,
  publishTemplate,
} from '../../../../../helpers/templates/template_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()
describe('user_system_template_usage_spec', () => {
  let systemTemplate, task1, task2, post1, post2, user
  before(() => {
    cy.login('sysadmin@juralio.com', 'Password1Password1$').then(() => {
      createSystemLevelTemplate(getLegalProjectName()).then(res => {
        systemTemplate = res
        publishTemplate(res.id)
        createTemplateTask(res.id, null, 'Task 1').then(t1 => {
          task1 = t1
          createTemplateTask(res.id, t1.id, 'Task 2').then(t2 => {
            task2 = t2
            createTemplateTaskNote(
              systemTemplate.id,
              task1.id,
              'Post1',
              'desc 1'
            ).then(p1 => {
              post1 = p1
              createTemplateTaskNote(
                systemTemplate.id,
                task1.id,
                'Post2',
                'desc 2'
              ).then(p2 => {
                post2 = p2
                finaliseTemplatePost(systemTemplate.id, task1.id, p2.id)
                createUser().then(createdUser => {
                  user = createdUser
                })
              })
            })
          })
        })
      })
    })
  })
  describe('as a knowledge manager', () => {
    before(() => {
      cy.login(user.username)
      visitHelpers.visitTemplates()
    })
    it('should show the system template in the gallery', () => {
      cy.get('[data-test=template-name]')
        .contains(systemTemplate.name)
        .should('be.visible')

      cy.get('[data-test=system-template]').should('be.visible')
    })
    describe('when viewing the template overview', () => {
      before(() => {
        cy.get('[data-test=template-name]')
          .contains(systemTemplate.name)
          .click()
      })
      describe('should not be able to edit the description', () => {
        before(() => {})
        it('should not show the empty description', () => {
          cy.get('[data-test=zero-state-placeholder]').should('not.exist')
        })
      })

      describe('when viewing the context', () => {
        before(() => {
          cy.get('[data-test=menuItem]').eq(1).click()
        })
        it('should only show finalised posts', () => {
          cy.get('[data-test=post-tab]').eq(0).click()
          cy.get('[data-test=postColumnHeader]').should('have.length', 1)
        })
        it('should not show the add resources button', () => {
          cy.get('[data-test=add-resource-button]').should('not.exist')
        })
        describe('wghen looking at the tasks', () => {
          before(() => {
            cy.get('[data-test=task-tab]').eq(0).click()
          })
          it('should show both tasks', () => {
            cy.get('[data-test=taskColumnHeader]').should('have.length', 2)
          })
        })
      })
    })
    describe('when visiting a system task', () => {
      before(() => {
        cy.login(user.username)
        visitHelpers.visitTemplateTaskDetails(systemTemplate.id, task1.id)
      })
      describe('when clicking the name', () => {
        before(() => {
          cy.get('[data-test=task-name-full-panel]').click()
        })
        it('should not open a text input', () => {
          cy.get('[data-test=task-name-full-panel]')
            .find('input')
            .should('not.exist')
        })
      })

      it('should not show the zero state description', () => {
        cy.get('[data-test=zero-state-placeholder]').should('not.exist')
      })

      it('should not show the add subtask button', () => {
        cy.get('[data-test=create-subtask-button]').should('not.exist')
      })
      it('has no options', () => {
        cy.get('[data-test=template-card-option-menu-button]').should(
          'not.exist'
        )
      })
      it('should not list the draft post', () => {
        cy.get('[data-test=note-list-item]').should('have.length', 1)
        cy.get('[data-test=note-listitem-name]').should('have.text', 'Post2')
      })
    })
    describe('when viewing a system post', () => {
      before(() => {
        cy.login(user.username)
        visitHelpers.visitTemplateTaskDetails(systemTemplate.id, task1.id)
        cy.get('[data-test=note-list-item]').click()
      })
      describe('when trying to edit the name', () => {
        before(() => {
          cy.get('[data-test=note-details-name]').click({ force: true })
        })
        it('should not edit', () => {
          cy.get('[data-test=note-details-name]')
            .find('input')
            .should('not.exist')
        })
      })
      it('should not show the edit button', () => {
        cy.get('[data-test=finalise-button]').should('not.exist')
      })
      it('should havenot show the options', () => {
        cy.get('[data-test=task-content-header-menu-button]').should(
          'not.exist'
        )
      })
      describe('when trying to edit the description', () => {
        before(() => {
          cy.get('[data-test=notes-content-read-field]').click()
        })
        it('should not show the input', () => {
          cy.get('[data-test=notes-content-read-field]')
            .find('input')
            .should('not.exist')
        })
      })
    })
    describe('when visiting the taskmap', () => {
      before(() => {
        cy.login(user.username)
        visitHelpers.visitTemplateTaskMap(systemTemplate.id)
      })
      it('should not show task options', () => {
        cy.get('[data-test=options-dropdown]').should('not.exist')
      })
      describe('should not allow hover add', () => {
        before(() => {
          cy.get('div').contains('Task 1').trigger('mouseover', { force: true })
        })
        it('should not show the hover', () => {
          cy.wait(500)
          cy.get('[data-test=hover-button-right]').should('not.exist')
          cy.get('[data-test=hover-button-left]').should('not.exist')
          cy.get('[data-test=hover-button-top]').should('not.exist')
          cy.get('[data-test=hover-button-bottom]').should('not.exist')
        })
      })
    })
  })
})
