import {
  generateFixture,
  getWrapper,
} from '../../../../helpers/matterprojects/fixture_helper'
import {
  createUser,
  updateFTUE,
} from '../../../../helpers/users/user_api_helper'

describe('project_creation.cy', () => {
  let testUser, fixture, appPage, matterDetailsUrl
  const randomNumber = new Date().toISOString()
  const workstreamName = 'test Workstream Name ' + randomNumber
  function visitMatterDetails() {
    cy.backendRoute('/matter/*').as('matterFetch')
    cy.backendRoute('/matter/*/team*').as('teamFetch')

    cy.visit(matterDetailsUrl)

    cy.wait('@matterFetch')
    cy.wait('@teamFetch')
  }

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
                name: 'A workstream',
                tasks: [],
              },
              { name: 'second workstream', tasks: [] },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
      .then(() => {
        appPage = getWrapper(fixture)
        matterDetailsUrl = `/#/matteradmin/${fixture.matter.id}`
      })
  })
  describe('when creating a new workstream', () => {
    before(() => {
      updateFTUE(testUser, { hasSeenMatterAdmin: true })
      cy.login(testUser)
      visitMatterDetails()
      cy.wait(2000)
      cy.get('[data-test=projects]').click()
      cy.get('[data-test="create-new-workstream"]').click()
      cy.get('[data-test=blank-workstream]').click()
      cy.get('[data-test=workstream-name]').find('input').type(workstreamName)
      cy.get('[data-test=action-dialog-button]').click()
      cy.wait(2000)
    })
    it('should show the workstream details', () => {
      cy.get('[data-test=workstream-item-reference-number]')
        .eq(2)
        .should('contain.text', '3')
    })
  })
})
