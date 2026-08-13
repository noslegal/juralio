import nameGenerator from 'project-name-generator'
import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../../helpers/matterprojects/visit_helpers'
import notesHelper from '../../../../../../helpers/notes/notes-helper'
import { checkIncludePostsTicked } from '../../../../../../helpers/templates/project_from_template_helper'
import {
  createTemplate,
  publishTemplate,
} from '../../../../../../helpers/templates/template_api_helper'
import {
  createProjectFromTemplateSingle,
  populateTemplateWithPosts,
} from '../../../../../../helpers/templates/template_helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'
import taskdetail_page from '../../../../../../page/taskdetail/taskdetail_page'

const newTemplateName = nameGenerator.generate().spaced

describe('use_template_project_from_template_with_posts.cy', () => {
  const visitHelpers = new VisitHelpers()
  let user, fixture, newTemplate, appPage

  before(() => {
    createUser('aaa', true, true, {
      roles: ['ROLE_MATTER_CREATOR', 'ROLE_KNOWLEDGE_MANAGER'],
    }).then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'monkey',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              tasks: [
                {},
                {},
                { tasks: [{}, { tasks: [{}, { tasks: [{}, {}, {}] }] }] },
                {},
              ],
            },
            { name: 'Project 2', tasks: [] },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('When visiting the template overview', () => {
    before(() => {
      cy.login(user.username)
      createTemplate(newTemplateName, fixture.projects[0].id)
        .then(template => {
          newTemplate = template
        })
        .then(() => {
          publishTemplate(newTemplate.id)
          populateTemplateWithPosts(newTemplate)
          visitHelpers.visitTemplateTaskMap(newTemplate.id)
          cy.wait(5000)
          cy.get('[data-test=task-cell-test]', { timeout: 30000 }).eq(1).click()
          cy.wait(5000)
          cy.get('[data-test=note-list-item]', { timeout: 30000 }).eq(0).click()
          cy.get('[data-test=finalise-button]').click()
          cy.wait(1000)
          cy.get('[data-test=note-list-item]').eq(0).click()
          cy.wait(1000)

          cy.get('[data-test=finalise-button]').click()
          visitHelpers.visitTemplateOverview(newTemplate.id)
        })
    })

    describe('When a project creation is initiated', () => {
      before(() => {
        cy.get('[data-test=use-template-button]', { timeout: 30000 }).click()
      })

      it('should display a "Include posts" checkbox', () => {
        checkIncludePostsTicked({ checked: true })
      })

      describe('when the flow is completed', () => {
        const projectName = 'AAANewProjectName'
        before(() => {
          cy.get('[data-test=action-dialog-button]').click()

          createProjectFromTemplateSingle({
            name: projectName,
            matterText: 'monkey',
          })
        })

        describe('When the user navigates to the task map', () => {
          before(() => {
            cy.get('[data-test=subheader-location-name]').eq(0).click()
          })

          it('should show a project card with the newly created project', () => {
            cy.get('[data-test=task-cell-test]', { timeout: 30000 }).should(
              'have.length',
              11
            )
          })

          describe('When the user navigates to a task', () => {
            before(() => {
              cy.wait(5000) //Detached from DOM issue/
              //http://localhost:3000/#/matter/1320/workstream/1372/task/1406
              cy.get('[data-test=task-cell-test]', { timeout: 30000 })
                .eq(1)
                .click(0, 0, { force: true })
              cy.wait(1000)
            })

            notesHelper.checkNoteCount(2)

            describe('When the clicking on a post', () => {
              before(() => {
                cy.get('[data-test=note-listitem-name]').eq(1).click()
                taskdetail_page.noteDetails.get.name()
                cy.get('[data-test=post-people-people-manager]').click({
                  force: true,
                }) // Authors tab
              })

              notesHelper.checkAuthorDetails()
              notesHelper.checkAuthorCount(1)

              describe('When adding an author to a post', () => {
                before(() => {
                  taskdetail_page.postAuthors.get
                    .addAuthor()
                    .click({ force: true })
                  notesHelper.addAuthor('a', 0)
                })

                notesHelper.checkAuthorCount(2)
              })
            })
          })
        })
      })
    })
  })
})
