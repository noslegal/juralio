import nameGenerator from 'project-name-generator'
import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelper from '../../../../../helpers/matterprojects/visit_helpers'
import { selectTemplateTaskAndConfirm } from '../../../../../helpers/templates/project_from_template_helper'
import {
  createTemplate,
  publishTemplate,
} from '../../../../../helpers/templates/template_api_helper'
import { populateTemplateWithPosts } from '../../../../../helpers/templates/template_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import {
  clickHoverButton,
  triggerHoverButtons,
} from '../../../../../helpers/taskmap/task-map-helper'

const newTemplateName = nameGenerator.generate().spaced

describe('use_template_partial_as_subtask.cy', () => {
  let user, fixture, newTemplate
  const visitHelpers = new VisitHelper()

  before(() => {
    createUser('', true, true, {
      roles: ['ROLE_MATTER_CREATOR', 'ROLE_KNOWLEDGE_MANAGER'],
    }).then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'UseTemplate ',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              tasks: [
                {
                  name: 'MOON',
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

  describe('When trying to use template task as a subtask of', () => {
    before(() => {
      cy.login(user.username)
      createTemplate(newTemplateName, fixture.projects[0].id)
        .then(template => {
          newTemplate = template
          populateTemplateWithPosts(template)
        })
        .then(() => {
          publishTemplate(newTemplate.id)
          visitHelpers.visitTemplateOverview(newTemplate.id)
        })

      it('should have map displayed', () => {
        cy.get('[data-test=container]').should('have.length', 1)
      })
    })

    const createSubtaskFromTemplateTask = (
      templateTaskIndex,
      parentTaskName
    ) => {
      selectTemplateTaskAndConfirm(templateTaskIndex)
      cy.get('[data-test=matter-switcher-filter]').eq(0).click()
      cy.get('[data-test=matter-switcher-filter]')
        .eq(0)
        .find('input')
        .type(fixture.matter.name)
      cy.wait(1000)
      cy.get('[data-test=matter-switcher-matter-item]').eq(0).click()
      cy.wait(5000)
      cy.get('[data-test=action-dialog-button]').click()
      cy.backendRoute('POST', '/matter/*/workstreams/*/tasks**').as(
        'postNewTask'
      )
      cy.wait(5000)
      triggerHoverButtons(parentTaskName)
      clickHoverButton('[data-test=hover-button-right]')
      cy.wait('@postNewTask')
    }

    describe('a NOT STARTED parent - ', () => {
      before(() => {
        createSubtaskFromTemplateTask(0, 'MOON')
      })

      describe('click OPEN to navigate to the created task details', () => {
        before(() => {
          cy.login(user.username)
          cy.get('[data-test=matter-switcher-button]').click()
          cy.get('[data-test=matter-switcher-matter-item]').eq(0).click()
          cy.get('[data-test=matter-switcher-workstream-chip]', {
            timeout: 30000,
          })
            .eq(0)
            .click()
          cy.wait(3000)
        })

        it('should have 2 not-started tasks', () => {
          cy.get('[data-test="not-started-tasks"]').should('contain.text', 2)
        })
      })
    })
  })
})
