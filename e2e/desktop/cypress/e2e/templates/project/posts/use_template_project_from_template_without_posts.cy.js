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

const newTemplateName = nameGenerator.generate().spaced

describe('use_template_project_from_template_without_posts.cy', () => {
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
              name: 'Workstream',
              tasks: [{}],
            },
            { name: 'project2', tasks: [] },
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
          populateTemplateWithPosts(template)
        })
        .then(() => {
          publishTemplate(newTemplate.id)
          visitHelpers.visitTemplateOverview(newTemplate.id)
        })
    })

    describe('When a project creation is initiated', () => {
      before(() => {
        cy.get('[data-test=use-template-button]').click()
      })

      it('should display a "Include posts" checkbox', () => {
        checkIncludePostsTicked({ checked: true })
      })

      describe('when the flow is completed', () => {
        const projectName = 'AAANewProjectName'
        before(() => {
          createProjectFromTemplateSingle({
            name: projectName,
            matterText: 'monkey',
            disablePosts: true,
          })
        })

        describe('When the user navigates to the task map', () => {
          before(() => {
            cy.get('[data-test=subheader-location-name]').eq(0).click()
          })

          it('should show a project card with the newly created project', () => {
            cy.get('[data-test=task-cell-test]').should('have.length', 1)
          })

          describe('When the user navigates to a task', () => {
            before(() => {
              cy.get('[data-test=task-cell-test]').eq(0).click()
            })

            notesHelper.checkNoteCount(0)
          })
        })
      })
    })
  })
})
