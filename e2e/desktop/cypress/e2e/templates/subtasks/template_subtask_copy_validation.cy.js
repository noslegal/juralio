import nameGenerator from 'project-name-generator'
import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createTemplate } from '../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'

const newTemplateName = nameGenerator.generate().spaced

describe('template_subtask_copy_validation.cy', () => {
  let user, fixture, newTemplate, appPage

  before(() => {
    createKnowledgeManagerUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'template_subtask_copy_validation.cy',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Test Project',
              tasks: [
                {
                  name: 'Print Documents',
                  tasks: [
                    { name: 'Shred 1' },
                    { name: 'Shred 2' },
                    { name: 'Shred 3' },
                    { name: 'Shred 4' },
                    { name: 'Shred 5' },
                    { name: 'Shred 6' },
                    { name: 'Shred 7' },
                    { name: 'Shred 8' },
                  ],
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

  describe('When opening a task with no subtasks', () => {
    before(() => {
      cy.login(user.username)
      createTemplate(newTemplateName, fixture.projects[0].id).then(template => {
        newTemplate = template
        appPage.visitTemplates()

        cy.backendRoute('/projecttemplates/*/tasks*').as('getTemplateTasks')
        cy.get(
          `[data-recordid=${newTemplate.id}] [data-test=template-name]`
        ).click()
        cy.get('[data-test=taskmap-navigation]').click()
        cy.wait('@getTemplateTasks')

        cy.get('[depth=1]').should('have.length.at.least', 1).eq(0).click()
      })
    })

    it('the subtasks should be displayed', () => {
      cy.get('[data-test=task-cell-test]').should('have.length', 8)
    })

    describe('When clicking on the operations menu', () => {
      before(() => {
        cy.get('[data-test=options-dropdown]').eq(7).click()
      })

      it('should show the copy option', () => {
        cy.get('[data-test=menu-text-copy]').should('be.visible')
      })

      describe('When clicking on the copy operation', () => {
        before(() => {
          cy.get('[data-test=menu-text-copy]').click()
        })

        it('should have the "Another template" option selected by default', () => {
          cy.get('[data-test=new-task-destination-type]').should(
            'contain.text',
            'Another template'
          )
        })
      })
    })
  })
})
