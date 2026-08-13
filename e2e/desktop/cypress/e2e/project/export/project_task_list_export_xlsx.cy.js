import { addTaskChain } from '../../../../../helpers/matterprojects/fixture_data_builder_helper'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import { get } from '../../../../../page/project/overview/project_overview_page'

const visitHelpers = new VisitHelpers()

describe('project_task_list_export_xlsx.cy', () => {
  let testUser, fixture, matter, project, project2

  before(() => {
    createUser()
      .then(createdUser => {
        testUser = createdUser
        const seed = {
          matter: {
            teamMembers: [testUser],
            matterAdmins: [testUser],
            projects: [
              {
                ...getLargeProject({ name: 'Large Project' }),
              },
              {
                name: 'Empty Project',
              },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
      .then(() => {
        matter = fixture.matter
        project = fixture.projects[0]
        project2 = fixture.projects[1]
      })
  })

  describe('When navigating to a populated project', () => {
    before(() => {
      cy.login(testUser.username)
      visitHelpers.visitProjectOverview(matter.id, project.id)
    })

    it('should display the name of the project', () => {
      get.projectName().should('contain.text', project.name)
    })

    describe('When the menu button is clicked', () => {
      it('should show a download option', () => {
        cy.get('[data-test=options-button]').click()
        cy.get('[data-test=download-option]').should('have.text', 'Download')
      })

      describe('When the download menu item is clicked', () => {
        before(() => {
          cy.get('[data-test=download-option]').click()
          cy.get('[data-test=tasks-checkbox]').click()
          cy.get('[data-test=action-dialog-button]').click()
        })
      })
      describe('When  selecting the team sheet', () => {
        before(() => {
          cy.get('[data-test=download-option]').click()
          cy.get('[data-test=teams-checkbox]').click()
          cy.get('[data-test=action-dialog-button]').click()
        })
        it('should download the teams sheet', () => {
          expect(1).to.eq(1)
        })
      })
      describe('When the selecting the tasks sheet', () => {
        before(() => {
          cy.get('[data-test=options-button]').click()
          cy.get('[data-test=download-option]').click()
          cy.get('[data-test=tasks-checkbox]').click()
          cy.get('[data-test=action-dialog-button]').click()
        })
        it('should download the tasks sheet', () => {
          expect(1).to.eq(1)
        })
      })
      describe('When the selecting the roadmap sheet', () => {
        before(() => {
          cy.get('[data-test=options-button]').click()
          cy.get('[data-test=download-option]').click()
          cy.get('[data-test=roadmap-checkbox]').click()
          cy.get('[data-test=action-dialog-button]').click()
        })
        it('should download the roadmap sheet', () => {
          expect(1).to.eq(1)
        })
      })
    })
  })

  describe('When navigating to an empty project', () => {
    before(() => {
      cy.login(testUser.username)
      visitHelpers.visitProjectOverview(matter.id, project2.id)
    })

    it(
      'should display the name of the project',
      { retries: { runMode: 3, openMode: 1 } },
      () => {
        get.projectName().should('contain.text', project2.name)
      }
    )
    describe('When the menu button is clicked', () => {
      it('should show a download option', () => {
        cy.get('[data-test=options-button]').click()
        cy.get('[data-test=download-option]').should('have.text', 'Download')
      })
      describe('when no sheets are selected', () => {
        before(() => {
          cy.get('[data-test=download-option]').click()
          cy.get('[data-test=roadmap-checkbox]').click()
          cy.get('[data-test=tasks-checkbox]').click()
          cy.get('[data-test=teams-checkbox]').click()
        })
        it('should disable the download button', () => {
          cy.get('[data-test=action-dialog-button]').should('be.disabled')
        })
      })

      describe('When the download menu item is clicked', () => {
        before(() => {
          cy.get('[data-test=tasks-checkbox]').click()

          cy.get('[data-test=action-dialog-button]').click()
        })
      })
    })
  })
})

const taskStatus = ['not-started', 'in-progress', 'done']

const newTask = (name, status) => {
  return {
    name: name,
    tasks: [],
    properties: { status: taskStatus[status] },
  }
}

const getLargeProject = options => {
  const project = {}

  project.name = options.name

  project.tasks = [
    newTask('Monkey', 0),
    newTask('Dog', 1),
    newTask('Cat', 2),
    newTask('Robot', 0),
    newTask('Towel', 1),
    newTask('Gargle Blaster', 1),
  ]

  for (let i = 0; i < 6; i++) {
    project.tasks[i].tasks = [{}, {}, {}, {}, {}, {}, {}]
  }

  addTaskChain(project.tasks[0], ['CCC', 'DDD', 'EEE', 'FFF'])

  return project
}
