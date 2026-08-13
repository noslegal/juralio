import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import {
  addMatterAdmin,
  addTeamMember,
  createMatter,
} from '../../../../../helpers/matterprojects/matter_api_helper'
import { createProject } from '../../../../../helpers/matterprojects/projects_api_helper'
import { createTask } from '../../../../../helpers/matterprojects/task_api_helper'
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

const visitHelpers = new VisitHelpers()

describe('create_workstream.cy', () => {
  let matterAdmin, teamMember, userHasBothRole, knowledgeManager, matter

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
                name: 'Create Workstream Spec',
                tasks: [{ name: 'Task1' }],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
      .then(() => {
        workstream = fixture.projects[0]
        cy.login(knowledgeManager.username)
        createTemplate('newTemplateName', workstream.id).then(
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
      .then(m => {
        matter = m
        addTeamMember(matter.id, teamMember.id)
      })
  })

  describe('when trying to create workstream', () => {
    describe('when logged in as a non-matter-admin user', () => {
      before(() => {
        cy.login(teamMember.username)
        visitHelpers.visitMatter(matter.id)
      })

      it('should not display create workstream component', () => {
        cy.url().should('contains', '/404')
      })
    })

    describe('when logged in as a matter-admin only user', () => {
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
            cy.wait(2000)
            cy.get('[data-test=projects]').click()
          })
      })

      it('should display create workstream component', () => {
        cy.get('[data-test="no-permissions"]').should(
          'contain',
          'Only a user with the matter admin and matter editor role can create and edit workstreams'
        )
      })
    })

    describe('when logged in as a user who is both team member and matter admin', () => {
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
            createProject(matterId, 'workstream supreme').then(workstream => {
              createTask(
                matter.id,
                workstream.id,
                'not-started',
                'original workstream task'
              )
            })
            addMatterAdmin(matter.id, userHasBothRole.id)
            addTeamMember(matter.id, userHasBothRole.id)
            cy.login(userHasBothRole.username)
            visitHelpers.visitMatter(matter.id)
          })
      })

      it('should display a single "Create new workstream" button', () => {
        cy.wait(2000)
        cy.get('[data-test=projects]').click()
        cy.get('[data-test=create-new-workstream]').should('be.visible')
      })

      describe('when clicking the "Create new worksteam" button', () => {
        before(() => {
          cy.get('[data-test=create-new-workstream]').click()
        })

        it('should bring up a dialog', () => {
          cy.get('[data-test=dialog-header-title-text]').should(
            'have.text',
            'Create a workstream'
          )
        })

        it('should have two mandatory text fields to allow the user to name the original and new workstreams', () => {
          cy.get('[data-test=workstream-name]').should('have.length', 2)
        })

        it('should allow the user the option to split original workstream', () => {
          cy.get('[data-test=split-workstream]').should(
            'have.text',
            'Split original workstream'
          )
        })

        it('should allow the user the option to create blank workstream', () => {
          cy.get('[data-test=blank-workstream]').should(
            'have.text',
            "I'll create my own tasks"
          )
        })

        it('should allow the user the option to create workstream from template', () => {
          cy.get('[data-test=create-workstream-from-template]').should(
            'have.text',
            'Use a template'
          )
        })

        describe('when clicking the "Split original workstream" button, filling in the workstream names and clicking "Next"', () => {
          before(() => {
            cy.get('[data-test=split-workstream]').click()
            cy.get('[data-test=workstream-name]').eq(0).type('original')
            cy.get('[data-test=workstream-name]').eq(1).type('new')
            cy.get('[data-test=split-workstream-select]').click()
            cy.get('li').eq(4).click()
            cy.get('[data-test=action-dialog-button]').click()
          })

          it('should open the task map in selection mode', () => {
            cy.get('[data-test=task-selection-panel-text]').should(
              'have.text',
              'Select task you want to move to the new workstream'
            )
          })

          it('should have the "Continue" button disabled', () => {
            cy.get('[data-test=confirm-selection-button]').should('be.disabled')
          })

          describe('when selecting a task and clicking continue', () => {
            before(() => {
              cy.get('[data-test=task-cell-test]').eq(0).click({ force: true })
              cy.get('[data-test=confirm-selection-button]').click()
            })

            it('should open the new workstream', () => {
              cy.get('[data-test=task-selection-panel-text]').should(
                'not.exist'
              )
              // breadcrumb not always set in CI so testing Url.
              cy.url().then(url => {
                if (url.includes('workstream/' + workstream.id)) {
                  throw 'Wrong workstream'
                }
              })
              cy.get('[data-test=task-cell-test]')
                .eq(0)
                .contains('original workstream task')
            })
          })
        })
      })
    })
  })
})
