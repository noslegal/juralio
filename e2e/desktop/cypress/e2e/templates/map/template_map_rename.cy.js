import nameGenerator from 'project-name-generator'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { createTemplate } from '../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'

describe('template_map_rename.cy', () => {
  let user, fixture, newTemplate

  before(() => {
    createKnowledgeManagerUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'template_map_rename.cy',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              tasks: [{ name: 'MOON' }],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
    })
  })

  describe('when navigating to template map', () => {
    const newTemplateName = nameGenerator.generate().spaced

    before(() => {
      cy.login(user.username)
      createTemplate(newTemplateName, fixture.projects[0].id).then(template => {
        newTemplate = template
        cy.visit('/#/templates')
        cy.get(
          `[data-recordid=${newTemplate.id}] [data-test=template-name]`
        ).click()
        cy.get('[data-test=taskmap-navigation]').click()
        // cy.get('.reactour__close').click({ force: true })
      })
    })

    it('should display the expected number of task cells', () => {
      cy.get('[data-test=task-cell-test]', { timeout: 30000 }).should(
        'have.length',
        1
      )
    })

    describe('and trying to change task name by clicking the operation menu', () => {
      before(() => {
        cy.login(user.username)
        cy.reload()

        cy.get('[data-test=options-dropdown]').eq(0).click()
      })

      it('should display rename option', () => {
        cy.get('[data-test=task-card-option-menu-rename]')
          .should('be.visible')
          .should('contain', 'Rename')
      })

      // describe('and continue to click "Rename" option', () => {
      //   before(() => {
      //     cy.get('[data-test=task-card-option-menu-rename]').click({})
      //   })

      //   it('should display name input field populated with template task name', () => {
      //     cy.get('[data-test=edit-name-field]').should('be.visible')
      //     cy.get('[data-test=edit-name-field] input').should(
      //       'have.value',
      //       'MOON'
      //     )
      //   })

      //   describe('and try to update the task name', () => {
      //     before(() => {
      //       cy.get('[data-test=edit-name-field] input').type('{END} SUN{ENTER}')

      //       cy.login(user.username)
      //       cy.visit(`/#/template/${newTemplate.id}/taskmap`)
      //     })

      //     it('should update the template task name', () => {
      //       cy.get('[data-test=task-cell-test] [data-task-name]')
      //         .eq(0)
      //         .should('have.text', 'MOON SUN')
      //     })
      //   })
      // })
    })
  })
})
