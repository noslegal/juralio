import {
  generateFixture,
  getWrapper,
} from '../../../../helpers/matterprojects/fixture_helper'
import { updateMatterStatus } from '../../../../helpers/matterprojects/matter_api_helper'
import { updateProject } from '../../../../helpers/matterprojects/projects_api_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

const DONT_USE_WAITS = false

const checkForMatterClosed = () => {
  it('should say that the matter is closed', () => {
    cy.get('[data-test=matter-closed]', { timeout: 10000 }).should('exist')
    cy.get('[data-test=zero-state-text]').should(
      'contain',
      'This matter is closed'
    )
  })
}

describe('workstream_matter_closed_zero_state.cy', () => {
  let testUser, otherUser, fixture, appPage

  before(() => {
    createUser()
      .then(u => {
        otherUser = u
      })
      .then(createUser)
      .then(createdUser => {
        testUser = createdUser
        const seed = {
          matter: {
            teamMembers: [testUser],
            matterAdmins: [testUser],
            projects: [
              {
                name: 'A closed workstream',
              },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
      .then(() => {
        appPage = getWrapper(fixture)
      })
  })

  describe('When a workstream is closed', () => {
    before(() => {
      cy.login(testUser.username)
      updateProject(fixture.matter.id, fixture.projects[0], {
        active: false,
      })
      updateMatterStatus(fixture.matter.id, 'closed')
    })

    describe('when navigating to the overview', () => {
      before(() => {
        cy.login(testUser.username)
        appPage.visitProjectOverview(fixture.matter.id, fixture.projects[0].id)
      })

      checkForMatterClosed()
    })

    describe('when navigating to the taskmap', () => {
      before(() => {
        cy.login(testUser.username)
        appPage.visitTaskMap()
      })

      checkForMatterClosed()
    })

    describe('when navigating to the roadmap', () => {
      before(() => {
        cy.login(testUser.username)
        appPage.visitRoadmap()
      })
      checkForMatterClosed()
    })
  })
})
