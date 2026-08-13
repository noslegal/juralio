import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import { get } from '../../../../../page/project/overview/project_overview_page'

const visitHelpers = new VisitHelpers()
const text =
  'This is a long description that will reach over the threshold so that we get the toggle. '

describe('project_overview_description.cy', () => {
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
                name: 'Project 1',
              },
              {
                name: 'Project 2',
                properties: {
                  description: 'Mock description',
                },
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

  describe('When navigating to project', () => {
    before(() => {
      cy.login(testUser.username)
      visitHelpers.visitProjectOverview(matter.id, project.id)
    })

    describe('without a description', () => {
      it('should display the expected placeholder', () => {
        get.froalaProjectDescription().contains('Describe this workstream')
      })
    })

    describe('with a description', () => {
      before(() => {
        cy.login(testUser.username)
        visitHelpers.visitProjectOverview(matter.id, project2.id)
      })

      it('should display the expected description', () => {
        get.froalaProjectDescription().should('contain', 'Mock description')
      })

      describe('and choosing to edit that description', () => {
        before(() => {
          get.froalaProjectDescription().click()
          get.froalaProjectDescription().find('[contenteditable]').type('Updated description')
          cy.wait(1000)
          cy.get('body').click()
        })

        it('should display the updated value', () => {
          get.froalaProjectDescription().contains('Updated description')
        })

        describe('when refreshing the page', () => {
          before(() => {
            cy.reload()
            cy.login(testUser.username)
            visitHelpers.visitProjectOverview(matter.id, project2.id)
          })

          it('should continue to show the updated value', () => {
            get
              .froalaProjectDescription()
              .should('contain', 'Updated description')
          })
        })
      })

      describe('and choosing to remove that description', () => {
        before(() => {
          get.froalaProjectDescription().click()
          get.froalaProjectDescription().find('[contenteditable]').clear()
          cy.wait(1000)
          cy.get('body').click()
        })

        it('should re-display the placeholder', () => {
          get.projectDescription().placeholder().should('be.visible')
        })

        describe('when refreshing the page', () => {
          it('should continue to show the placeholder', () => {
            get.projectDescription().placeholder().should('be.visible')
          })
        })
      })

      describe('when choosing to add a long description', () => {
        before(() => {
          cy.get('[data-test=zero-state-placeholder]').click()

          get.froalaProjectDescription().find('[contenteditable]').type(text + text + text + text)
          cy.wait(1000)
          cy.get('[data-test=global-header]').click('bottom')
        })

        it('should display the see more toggle', () => {
          cy.get('[data-test=toggle-see-more]').should('be.visible')
        })

        it('should not display the see less toggle', () => {
          cy.get('[data-test=toggle-see-less]').should('not.exist')
        })

        describe('when clicking the toggle ', () => {
          before(() => {
            cy.get('[data-test=toggle-see-more]').click()
          })

          it('should NOT display the see more toggle', () => {
            cy.get('[data-test=toggle-see-more]').should('not.exist')
          })

          it('should display the see less toggle', () => {
            cy.get('[data-test=toggle-see-less]').should('be.visible')
          })
        })
      })
    })
  })
})
