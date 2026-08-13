import faker from 'faker'
import dayjs from 'dayjs'
import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../helpers/users/user_api_helper'

let utc = require('dayjs/plugin/utc')
dayjs.extend(utc)

const visitHelpers = new VisitHelpers()
const text =
  'This is a long description that will reach over the threshold so that we get the toggle.'

describe('matter_overview_display.cy', () => {
  let testUser, fixture, matter, project, project2, matter2

  before(() => {
    createUser()
      .then(createdUser => {
        testUser = createdUser
        const seed = {
          matter: {
            position: 'Advisor',
            teamMembers: [testUser],
            matterAdmins: [testUser],
            description: text,
            projects: [
              {
                name: 'Project 1',
                tasks: [],
              },
              {
                name: 'Project 2',
                tasks: [
                  {
                    name: '1',
                    properties: {
                      actualStartDate: dayjs.utc('2000-04-03'),
                      status: 'in-progress',
                    },
                  },
                ],

                properties: {
                  description: 'Mock description',
                },
              },
            ],
          },
        }
        const seed2 = {
          matter: {
            teamMembers: [testUser],
            matterAdmins: [testUser],
            description: text,
            projects: [
              {
                name: 'Project 3',
                tasks: [],
                properties: {
                  active: false,
                },
              },
              {
                name: 'Project 4',
                tasks: [
                  {
                    name: '2',
                    properties: {
                      actualStartDate: new Date(2000, 3, 3),
                      status: 'in-progress',
                    },
                  },
                ],

                properties: {
                  description: 'Mock description',
                },
              },
            ],
          },
        }
        fixture = generateFixture(seed)
        fixture2 = generateFixture(seed2)
      })
      .then(() => {
        matter = fixture.matter
        matter2 = fixture2.matter
        project = fixture.projects[0]
        project2 = fixture.projects[1]
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
            matter.id
          }/placeholders`,
          method: 'POST',
          body: {
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
          },
        })
      })
  })

  describe('When navigating to matter from the project overview', () => {
    before(() => {
      cy.login(testUser.username)
      visitHelpers.visitTaskDetails(
        matter.id,
        fixture.tasks[0].parent.id,
        fixture.tasks[0].id
      )
      cy.get('[data-test=add-team-member-button]').click()
      cy.wait(1000)
      cy.get('body').type('{enter}')
      cy.wait(5000)
      visitHelpers.visitMatterOverview(matter.id)
    })
    it('should display the matter overview', () => {
      cy.get('[data-test=bread1]', { timeout: 30000 }).should(
        'contains.text',
        matter.name
      )
      cy.get('[data-test=bread1]').should(
        'contains.text',
        fixture.matter.clientName
      )
      // cy.get('[data-test=matter-ref-number]').should('have.text', '1234567890')
      // cy.get('[data-test=matter-overview-reference-number]').should(
      //   'have.text',
      //   matter.userDefinedReferenceNumber
      // )
      cy.get('[data-test=matter-description]').should('have.text', text)
      cy.get('[data-test=done-tasks]').should('have.text', 0)
      cy.get('[data-test=in-progress-tasks]').should('have.text', 1)
      cy.get('[data-test=not-started-tasks]').should('have.text', 0)
      cy.get('[data-test=avatar-group]').children().should('have.length', 3)
      //matter roadmaps and dates
      cy.get('[data-test=task-start-date]').should(
        'have.text',
        'Mon 3 Apr 2000'
      )
      cy.get('[data-test=task-end-date]').should('have.text', 'No end date set')
      cy.get('[data-test=no-set-dates]').should('have.length', 1)
      cy.get('[data-test=no-set-dates]')
        .eq(0)
        .should('have.text', 'This workstream does not have any tasks')
      cy.get('[data-test=matter-overview-workstream-title]').should(
        'have.length',
        2
      )
      cy.get('[data-test=overview-button]').should('have.text', 'Overview')
      cy.get('[data-test=global-sub-header]')
        .children()
        .should('have.length', 2)
      cy.get('[data-test=overview-button]').click()
      cy.get('[data-test=workstream-switcher-button]')
        .children()
        .should('have.length', 2)
      cy.get('body').trigger('keydown', { keyCode: 27 })
      cy.wait(500)
      cy.get('body').trigger('keyup', { keyCode: 27 })
    })
    describe('when clicking on the people tab', () => {
      before(() => {
        cy.get('[data-test=peopleTab]', { timeout: 30000 }).click({
          force: true,
        })
      })
      it('should render the people tab correctly', () => {
        //show correct people
        cy.get('[data-test=table-user-column]').should('have.length', 3)
        //shoe correct task counts
        cy.get('[data-field=taskCount]').eq(1).should('have.text', '1')
        cy.get('[data-field=taskCount]').eq(2).should('have.text', '0')
        //placeholder should have placeholder role
        cy.get('[data-field=matterRolesDisplay]')
          .eq(3)
          .should('have.text', 'Placeholder')
        //and placeholder avatar
        cy.get('[data-field=displayName]')
          .eq(3)
          .find('[data-test=placeholder-avatar]')
          .should('exist')
      })
    })
    describe('when clicking on the overview tab', () => {
      before(() => {
        cy.get('[data-test=menuItem]').eq(0).click()
      })

      describe('when clicking on a workstream', () => {
        before(() => {
          cy.get('[data-test=task-bar]').eq(0).click()
        })
        it('should take the user to the workstream overview', () => {
          cy.url().should('contain', '/workstream')
        })
      })
    })
    describe('when clicking on the go to overview then the matter admin button', () => {
      before(() => {
        cy.get('[data-test=overview-button]').click()
        cy.get('[data-test=go-to-matter-admin]').click()
      })

      it('should take the user to the matter admin section overview', () => {
        cy.url().should('contain', '/matteradmin')
      })
    })
  })
  describe('when navigating to a matter than has only 1 active workstream but has closed workstream', () => {
    before(() => {
      cy.login(testUser.username)
      cy.backendRoute('/matter/*/overview').as('matterOverview')
      visitHelpers.visitMatterOverview(matter.id)
      cy.wait('@matterOverview')
      cy.get('[data-test=matter-switcher-button]').click()
      cy.get('[data-test=matter-item-matter-name]')
        .contains(matter.name)
        .closest('[data-test=matter-switcher-matter-item]')
        .click()
      cy.wait(1000)
      cy.get('[data-test=go-to-matter-overview]').click()
    })
    it('should show the correct matter details', () => {
      cy.get('[data-test=bread1]').should('contains.text', matter.name)
      // cy.get('[data-test=matter-overview-reference-number]').should(
      //   'have.text',
      //   matter.userDefinedReferenceNumber
      // )
    })
    describe('when clicking on the go to matter admin button', () => {
      before(() => {
        cy.get('[data-test=go-to-matter-admin]').click()
      })

      it('should take the user to the matter admin section overview', () => {
        cy.url().should('contain', '/matteradmin')
      })
    })
  })
})
