import { generateFixture } from '../../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../../helpers/matterprojects/visit_helpers'
import { openTemplateTaskCopy } from '../../../../../../helpers/tasks/task_operations_helpers'
import { createTemplate } from '../../../../../../helpers/templates/template_api_helper'
import { populateTemplateWithPosts } from '../../../../../../helpers/templates/template_helper'
import { createKnowledgeManagerUser } from '../../../../../../helpers/users/user_api_helper'

const taskStructure = [
  {
    tasks: [
      {
        tasks: [{}],
      },
    ],
  },
  {},
  {},
]

describe('template_task_copy_another_template_with_posts.cy', () => {
  let user, fixture, visitHelpers

  before(() => {
    createKnowledgeManagerUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'TmplTaskCopyTest',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Project to be template',
              tasks: taskStructure,
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      visitHelpers = new VisitHelpers()
    })
  })

  describe('When the template task details are loaded', () => {
    let template1, template2

    before(() => {
      cy.login(user.username)
      createTemplate(crypto.randomUUID(), fixture.projects[0].id).then(template => {
        template1 = template
        createTemplate(crypto.randomUUID(), fixture.projects[0].id).then(template => {
          template2 = template
        })
      })
    })

    describe('When trying to copy a task', () => {
      before(() => {
        populateTemplateWithPosts(template1)
        visitHelpers.visitTemplateTaskMap(template1.id)
        cy.get('[data-test=task-cell-test]').eq(0).click()
        cy.wait(1000)
        openTemplateTaskCopy()
      })

      it('should display the copy task dialog', () => {
        cy.get('[data-test="dialog-header-title-text"]').should('be.visible')
      })

      describe('When choosing a copied tasks destination', () => {
        before(() => {
          cy.get('[data-test=new-task-name-text-field]')
            .find('input')
            .type('Target Copy Task')
          cy.get('[data-test=new-task-destination-type]').click()
          cy.get('[data-test=another-template]').click()
        })

        it('should display the copy task dialog', () => {
          cy.get('[data-test="juralio-dialog"]').should('be.visible')
        })

        describe('When proceeding with the copying of a task', () => {
          before(() => {
            cy.get(
              '[data-test=dialog-content] [data-test=auto-complete-search-term]'
            )
              .find('input')
              .type(template2.name)
            cy.get('[data-test=search-result-list-item]').first().click()
            cy.get('[data-test="destination-selection-dropdown"]').click()
            cy.get('[data-test=destination-level-a]').click()
            cy.get('[data-test=action-dialog-button]').click()
          })

          it('should show the task map with the new task', () => {
            cy.url().should('include', template2.id)
            cy.get('[data-test=task-cell-test]').should('have.length', 8)
          })
          it('should show have copied over the posts aswell', () => {
            cy.get('[data-test="icicle-minimap-minimized"]').click()
            cy.get('[data-test=minimap-view-menu]').click()
            cy.get('[data-test=standard-view-filter]').click()
            cy.get('[data-test="task-cell-post-count-wrapper"]').should(
              'have.length',
              3
            )
          })
        })
      })
    })
  })
})
