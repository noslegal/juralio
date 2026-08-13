import {
  generateFixture,
  getWrapper,
} from '../../../../helpers/matterprojects/fixture_helper'
import { updateProject } from '../../../../helpers/matterprojects/projects_api_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

const DONT_USE_WAITS = false
const DONT_USE_CHECKS = false

describe('workstream_closed_matter_open_zero_state.cy', () => {
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
                tasks: [{ name: 'Task in a closed workstream' }],
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
    })

    describe('when navigating to the overview', () => {
      before(() => {
        cy.login(testUser.username)
        appPage.visitProjectOverview(fixture.matter.id, fixture.projects[0].id)
      })

      it('should say that the workstream is closed', () => {
        cy.get('[data-test=workstream-closed]', { timeout: 10000 }).should(
          'have.text',
          'This workstream has been closed'
        )
      })
    })

    describe('when navigating to the taskmap', () => {
      before(() => {
        cy.login(testUser.username)
        appPage.visitTaskMap()
      })

      it('should say that the workstream is closed', () => {
        cy.get('[data-test=zero-state-text]', { timeout: 10000 }).should(
          'have.text',
          'This workstream has been closed'
        )
      })
    })

    describe('when navigating to the roadmap', () => {
      before(() => {
        cy.login(testUser.username)
        appPage.visitRoadmap()
      })

      it('should say that the workstream is closed', () => {
        cy.get('[data-test=zero-state-text]', { timeout: 10000 }).should(
          'have.text',
          'This workstream has been closed'
        )
      })
    })

    describe('when navigating to task details', () => {
      before(() => {
        cy.login(testUser.username)
        appPage.visitTaskByName(
          'Task in a closed workstream',
          DONT_USE_WAITS,
          DONT_USE_CHECKS
        )
      })

      it('should say that the workstream is closed', () => {
        cy.get('[data-test=zero-state-text]', { timeout: 10000 }).should(
          'have.text',
          'This workstream has been closed'
        )
      })
    })
  })
})
