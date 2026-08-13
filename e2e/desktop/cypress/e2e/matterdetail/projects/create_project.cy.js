import dayjs from 'dayjs'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import {
  addMatterAdmin,
  addTeamMember,
  createMatter,
} from '../../../../../helpers/matterprojects/matter_api_helper'
import { createProject } from '../../../../../helpers/matterprojects/projects_api_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import {
  createTemplate,
  publishTemplate,
} from '../../../../../helpers/templates/template_api_helper'
import {
  createKnowledgeManagerUser,
  createUser,
  updateFTUE,
} from '../../../../../helpers/users/user_api_helper'

function getDateDisplayString(date, dateFormat, fulldateOnly) {
  if (!date) {
    return undefined
  }
  if (!dateFormat) {
    dateFormat = DATE_FORMAT_FULL
  }

  const currentDate = dayjs().startOf('day')
  const endDate = dayjs(dayjs(date)).startOf('day')
  const comparison = endDate.diff(currentDate, 'day')

  if (!fulldateOnly) {
    if (comparison === 0) return 'Today'
    if (comparison === 1) return 'Tomorrow'
    if (comparison === -1) return 'Yesterday'
  }
  return dayjs(date).format(dateFormat)
}
const DATE_FORMAT_DAY_MONTH_YEAR = 'D MMM YYYY'

const visitHelpers = new VisitHelpers()

describe('create_project.cy', () => {
  let matterAdmin, teamMember, userHasBothRole, knowledgeManager

  const firstProjectToCreate = 'bird',
    secondProjectToCreate = 'cat'

  describe('when trying to create project', () => {
    describe('- as a non-matter-admin user', () => {
      before(() => {
        createKnowledgeManagerUser()
          .then(createdUser => {
            knowledgeManager = createdUser

            const seed = {
              matter: {
                teamMembers: [knowledgeManager],
                matterAdmins: [knowledgeManager],
                projects: [
                  {
                    name: 'Create Project Spec',
                    tasks: [{ name: 'Task1' }],
                  },
                  {
                    name: 'project',
                  },
                ],
              },
            }
            fixture = generateFixture(seed)
          })
          .then(() => {
            project = fixture.projects[0]
            cy.login(knowledgeManager.username)
            createTemplate('newTemplateName', project.id).then(
              createdTemplate => {
                template = createdTemplate
                publishTemplate(template.id)
              }
            )
          })

        createUser()
          .then(user => {
            teamMember = user
            return createMatter()
          })
          .then(matter => {
            addTeamMember(matter.id, teamMember.id)
            cy.login(teamMember.username)
            visitHelpers.visitMatter(matter.id)
          })
      })

      it('should not display create project component', () => {
        cy.url().should('contains', '/404')
      })
    })

    describe('- as a matter-admin only user', () => {
      before(() => {
        createUser()
          .then(user => {
            matterAdmin = user
            updateFTUE(matterAdmin, { hasSeenMatterAdmin: true })
            return createMatter()
          })
          .then(matter => {
            addMatterAdmin(matter.id, matterAdmin.id)
            cy.login(matterAdmin.username)
            visitHelpers.visitMatter(matter.id)
            cy.get('[data-test=projects]').click()
          })
      })

      it('should display create project component', () => {
        cy.get('[data-test="no-permissions"]').should(
          'contain',
          'Only a user with the matter admin and matter editor role can create and edit workstreams'
        )
      })
    })

    describe('- as a user who is both team member and matter admin', () => {
      let matterId
      before(() => {
        createUser()
          .then(user => {
            userHasBothRole = user
            updateFTUE(userHasBothRole, { hasSeenMatterAdmin: true })
            return createMatter()
          })
          .then(matter => {
            matterId = matter.id
            createProject(matterId, 'pro1')
            createProject(matterId, 'pro2')
            addMatterAdmin(matter.id, userHasBothRole.id)
            addTeamMember(matter.id, userHasBothRole.id)
            cy.login(userHasBothRole.username)
            visitHelpers.visitMatter(matter.id)
            cy.get('[data-test=projects]').click()
          })
      })

      it('should display create project component', () => {
        cy.get('[data-test="projects-content"]')
          .find('[data-test="create-new-workstream"]')
          .should('exist')
      })

      describe('with typing a valid project name to a blank project', () => {
        before(() => {
          cy.get('[data-test="create-new-workstream"]').click()
          cy.get('[data-test=blank-workstream]').click()
          cy.get('[data-test="workstream-name"]')
            .find('input')
            .clear()
            .type(firstProjectToCreate)
            .type('{enter}')
          cy.get('[data-test="project-list-item"]')
        })

        it('should add the project to list', () => {
          cy.wait(3000)
          cy.get('[data-test="project-list-item"]')
            .should('have.length', 3)
            .eq(2)
            .contains(firstProjectToCreate)
        })

        it('should show the project status as "Active"', () => {
          cy.get('[data-test=status-select-selection-dropdown]')
            .eq(2)
            .should('contain', 'Active')
        })
        it('should show the project creation date', () => {
          cy.get('[data-test=project-created-on]')
            .eq(2)
            .should('contain', 'Created by')
            .should('contain', userHasBothRole.firstname)
            .should('contain', userHasBothRole.lastname)
            .should(
              'contain',
              getDateDisplayString(new Date(), DATE_FORMAT_DAY_MONTH_YEAR, true)
            )
        })

        it('should display a snackbar', () => {
          cy.get('[data-test=snackbar-message]')
            .should('be.visible')
            .should('contain', `${firstProjectToCreate} created`)
        })

        describe('on adding another project', () => {
          before(() => {
            cy.get('[data-test="create-new-workstream"]').click()
            cy.get('[data-test="blank-workstream"]').click()
            cy.get('[data-test="workstream-name"]')
              .find('input')
              .clear()
              .type(secondProjectToCreate)
              .type('{enter}')
          })

          it('should add the project', () => {
            cy.get('[data-test="project-list-item"]').should('have.length', 4)
          })

          describe('refresh the page', () => {
            before(() => {
              cy.login(userHasBothRole.username)
              cy.reload()
              cy.get('[data-test=projects]').click()
            })

            it('should display the project list ', () => {
              cy.get('[data-test="project-list-item"]').should('have.length', 4)
            })
          })

          describe('when using the template filter', () => {
            before(() => {
              cy.wait(3000)
              cy.get('[data-test="create-new-workstream"]').click()

              cy.get('[data-test=create-workstream-from-template]').click()
              cy.get('[data-test=search-filter]')
                .find('input')
                .type(template.name)
            })
            it('should filter the templates', () => {
              cy.get('[data-test=template]').should('have.length', 1)
            })
          })

          describe('on adding another project', () => {
            before(() => {
              cy.login(userHasBothRole.username)
              cy.reload()
              cy.get('[data-test=projects]').click()
              cy.get('[data-test="create-new-workstream"]').click()
              cy.get('[data-test="create-workstream-from-template"]').click()
            })
            it('should let the user create from a existing template', () => {
              cy.get('[data-test=juralio-dialog]').should('exist')
            })
            it('should select a template from the list of templates', () => {
              cy.get('[data-test="template"]').eq(0).click()
              cy.get('[data-test=action-dialog-button]').click()
              cy.get('[data-test="workstream-name"]').should('exist')
            })
            it('should add a new project from a template', () => {
              cy.get('[data-test=action-dialog-button]').click()
            })
            it('should display the correct number of projects in the table', () => {
              cy.get('[data-test="project-list-item"]').should('have.length', 5)
            })
          })
        })
      })
    })
  })
})
