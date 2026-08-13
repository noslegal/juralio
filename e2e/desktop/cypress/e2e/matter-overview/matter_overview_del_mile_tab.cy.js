import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

describe('matter_overview_del_mile_tab.cy', () => {
  let testUser, fixture, matter, project

  before(() => {
    createUser('ZZZ')
      .then(createdUser => {
        testUser = createdUser
        const seed = {
          matter: {
            teamMembers: [testUser],
            matterAdmins: [testUser],
            projects: [
              {
                name: 'Overview Spec with Tasks',
                tasks: [
                  {
                    name: 'Task1',
                    tasks: [{ name: 'Task2' }],
                  },
                  {
                    name: 'deliverable',
                    properties: {
                      isDeliverable: true,
                    },
                  },
                  {
                    name: 'milestone',
                    properties: {
                      isMilestone: true,
                    },
                  },
                ],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
      .then(() => {
        matter = fixture.matter
        project = fixture.projects[0]
      })
  })

  describe('when selecting the tasks tab', () => {
    before(() => {
      cy.login(testUser.username)
      visitHelpers.visitMatterOverview(matter.id)
      cy.get('[data-test=menuItem]').eq(2).click()
      cy.get('[data-test=deliverables-and-milestones-tab]').eq(0).click()
    })
    it('should display the projects tasks', () => {
      cy.get('[data-test=taskColumnHeader]').should('be.visible')
    })
    it('should display the matter deliverables and milestones', () => {
      cy.get('[data-test=task-chip-wrapper]').should('have.length', 2)
    })

    describe('clicking a row', () => {
      before(() => {
        cy.get('[data-test="juralio-chip-task"]').eq(1).click()
      })
      it('should redirect to the task details', () => {
        cy.url().should(
          'contain',
          `/#/matter/${fixture.matter.id}/workstream/${fixture.projects[0].id}/task/${fixture.tasks[3].id}`
        )
      })
    })
  })
  describe('when visting the overview tasks url', () => {
    before(() => {
      cy.login(testUser.username)
      visitHelpers.visitMatterOverview(matter.id)
      cy.get('[data-test=menuItem]').eq(2).click()
      cy.get('[data-test=deliverables-and-milestones-tab]').eq(0).click()
    })
    it('should display the projects tasks', () => {
      cy.get('[data-test=taskColumnHeader]').should('be.visible')
    })
    it('should render all of the tasks', () => {
      cy.get('[data-rowindex=0]').should('exist')
      cy.get('[data-rowindex=1]').should('exist')
    })
  })
})
