import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()
const text =
  'This is a long description that will reach over the threshold so that we get the toggle.'

describe('matter_overview_edit_name_inplace.cy', () => {
  let testUser, user_2, fixture

  before(() => {
    createUser().then(u => {
      user_2 = u
      createUser().then(createdUser => {
        testUser = createdUser
        const seed = {
          matter: {
            matterAdmins: [testUser],
            teamMembers: [user_2, testUser],
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
      })
    })
  })
  describe('as a matter admin', () => {
    before(() => {
      cy.login(testUser.username)
      cy.backendRoute('/matter/*/overview').as('matterOverview')
      visitHelpers.visitMatterOverview(fixture.matter.id)
      cy.wait('@matterOverview')
      cy.get('[data-test=options-button]', { timeout: 30000 }).click()
      cy.get('[data-test="rename-option"]').click()
    })
    it('should open the edit field', () => {
      cy.get('[data-test=rename-field]').find('input').should('exist')
    })
    describe('when editing the name', () => {
      before(() => {
        cy.get('[data-test=rename-field]')
          .find('input')
          .clear()
          .type('new name{enter}')
        cy.wait(3000)
      })
      it('should save', () => {
        cy.get('[data-test=bread1]').should('contains.text', 'new name')
      })
    })
  })
  describe('as a matter editor', () => {
    before(() => {
      cy.login(user_2.username)
      visitHelpers.visitMatterOverview(fixture.matter.id)
      cy.get('[data-test=options-button]', { timeout: 30000 }).click()
    })
    it('should not open the edit field', () => {
      cy.get('[data-test="rename-option"]').should('not.exist')
    })
    describe('as a matter admin', () => {
      before(() => {
        cy.login(testUser.username)
        cy.backendRoute('/matter/*/workstreams/*/overview').as(
          'workstreamOverview'
        )

        visitHelpers.visitProjectOverview(
          fixture.matter.id,
          fixture.projects[0].id
        )
        cy.wait('@workstreamOverview')
        cy.get('[data-test=options-button]', { timeout: 30000 }).click()
        cy.get('[data-test="rename-option"]').click()
      })
      it('should open the edit field', () => {
        cy.get('[data-test=rename-field]').find('input').should('exist')
      })
      describe('when editing the name', () => {
        before(() => {
          cy.get('[data-test=rename-field]')
            .find('input')
            .clear()
            .type('new name1 {enter}')
          cy.wait(3000)
        })
        it('should save', () => {
          cy.get('[data-test=bread1]').should('contain.text', 'new name1')
        })
        describe('when editing the name to be an exisitng name', () => {
          before(() => {
            cy.get('[data-test=options-button]', { timeout: 30000 }).click()
            cy.get('[data-test="rename-option"]').click()
            cy.get('[data-test=rename-field]')
              .find('input')
              .clear()
              .type('Project 2{enter}')
            cy.wait(3000)
          })
          it('should not save', () => {
            cy.get('[data-test=bread1]').should('contains.text', 'new name1')
          })
        })
      })
      describe('as a matter editor', () => {
        before(() => {
          cy.login(user_2.username)
          visitHelpers.visitProjectOverview(
            fixture.matter.id,
            fixture.projects[0].id
          )
          cy.get('[data-test=options-button]', { timeout: 30000 }).click()
        })
        it('should not open the edit field', () => {
          cy.get('[data-test="rename-option"]').should('not.exist')
        })
      })
    })
  })
})
