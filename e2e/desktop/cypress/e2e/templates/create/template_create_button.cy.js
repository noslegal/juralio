import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import snackbarHelper from '../../../../../helpers/snackbar/snackbar-helper'
import templatePostsHelper from '../../../../../helpers/templates/posts/template_posts_helper'
import { createTemplate } from '../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'
import templateSourceDialogPage from '../../../../../page/templatesourcedialog/templatesourcedialog_page'

describe('template_create_button.cy', () => {
  let fixture, user
  let templateUrl
  before(() => {
    createKnowledgeManagerUser().then(createdUser => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'TheMatter',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'TheProject',
              tasks: [{ name: 'Monkey is Kong' }, {}, {}, {}, {}, {}, {}, {}],
            },
          ],
        },
      }
      fixture = generateFixture(seed)
    })
  })

  describe('When user logged in and choose to create a template', () => {
    before(() => {
      cy.login(user.username)
      createTemplate('Context Template', fixture.projects[0].id)
      cy.visit('/#/templates')
      cy.get('[data-test=create-template-button]').click()
      // cy.get('[data-test=create-template-flow-dialog-button]').click()
    })

    describe('The create template dialog appears which', () => {
      it('should have the "Create from scratch" option checked by default', () => {
        cy.get('[data-test=create-from-scratch]').should(
          'have.text',
          'Create from scratch'
        )
        cy.get('[data-test=create-from-scratch]')
          .find('input')
          .should('have.attr', 'checked')
      })

      it('should display template name input field', () => {
        cy.get('[data-test=new-template-name]')
          .find('input')
          .should('have.attr', 'placeholder', 'Template name')
      })

      it('should not display project selector', () => {
        templateSourceDialogPage.get
          .matterSelector()
          .should('not.be', 'visible')

        templateSourceDialogPage.get
          .projectSelector()
          .should('not.be', 'visible')
      })

      it('should NOT have the CREATE action enabled', () => {
        cy.get('[data-test=action-dialog-button]').should(
          'have.attr',
          'disabled'
        )
      })
    })

    describe('When type in template name and hit CREATE', () => {
      before(() => {
        cy.get('[data-test=new-template-name]')
          .find('input')
          .type('testTemplate')
        cy.backendRoute('POST', '/projecttemplates').as('postTemplate')
        cy.get('[data-test=action-dialog-button]').click()
        cy.wait('@postTemplate')
      })

      it('should close the dialog', () => {
        cy.get('[data-test="cancel-dialog-button"]').should('not.exist')
      })

      it('should show the new template with 0 task', () => {
        cy.get('[data-test=template-name]')
          .last()
          .should('have.text', 'testTemplate')
      })

      snackbarHelper.checkShownAndHasExpectedText(
        'New template successfully created',
        'open'
      )

      describe('then click OPEN on the snackbar', () => {
        const newTaskName = 'New Template Task'
        before(() => {
          snackbarHelper.clickActionButton()
        })

        it('should display template map zero state', () => {
          cy.wait(3000)
          cy.get('[data-test="zero-state-title"]')
            .should('be.visible')
            .should('have.text', 'Your template is empty')
        })

        describe('and then trying to create a template task', () => {
          before(() => {
            cy.get('[data-test="taskmap-zero-state-button"]').click()
            cy.wait(2000)
            cy.get('input').eq(0).type(`${newTaskName}{enter}`)
          })

          it('should display the first task', () => {
            cy.get('[data-test="task-cell-test"]')
              .should('be.visible')
              .should('contain', newTaskName)
            cy.url().then(result => {
              templateUrl = result
            })
          })

          describe('when navigating to the new task and creating a note', () => {
            before(() => {
              cy.backendRoute('/projecttemplates/*/tasks/*/posts').as(
                'getPosts'
              )
              cy.reload()
              cy.login(user.username)
              cy.visit(templateUrl)
              cy.wait(5000)
              cy.get('[data-test=task-cell-test]').eq(0).click()
              cy.wait('@getPosts')
              cy.get('[data-test=create-post-button]').click()
              cy.get('[data-test=web-link]').click()
              templatePostsHelper.completeLinkNameDialog()
            })

            it('should display a success snackbar', () => {
              cy.get('[data-test=snackbar-message]')
                .should('be.visible')
                .should('have.text', 'Web Link successfully created')
            })
          })
        })
      })
    })
  })
})
