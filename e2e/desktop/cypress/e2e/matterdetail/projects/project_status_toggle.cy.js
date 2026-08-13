import {
  addMatterAdmin,
  createMatter,
} from '../../../../../helpers/matterprojects/matter_api_helper'
import { createProject } from '../../../../../helpers/matterprojects/projects_api_helper'
import {
  createUser,
  updateFTUE,
} from '../../../../../helpers/users/user_api_helper'

const activeProjectStatusToggle = () =>
  cy.get('[data-test=status-select-selection-dropdown]').eq(0)

const closedProjectStatusToggle = () =>
  cy.get('[data-test=status-select-selection-dropdown]').eq(0)

describe('project_status_toggle.cy', () => {
  let returnedUser
  before(() => {
    createUser().then(user =>
      createMatter().then(matter => {
        returnedUser = user
        updateFTUE(returnedUser, { hasSeenMatterAdmin: true })
        addMatterAdmin(matter.id, user.id)
        cy.login(user.username)
        createProject(matter.id, 'Active project')
        createProject(matter.id, 'Closed project', {
          active: false,
        })

        cy.visit(`/#/matteradmin/${matter.id}`)
      })
    )
    cy.get('[data-test=projects]').click()
  })

  describe('given an active project', () => {
    describe('when the status is toggled to closed position', () => {
      before(() => {
        cy.get('[data-rowindex="1"] [data-colindex="0"]').click()
        activeProjectStatusToggle().click()
        cy.get('[data-test=status-select-off-option]').click()
      })

      it('should display the closed project status', () => {
        activeProjectStatusToggle().should('contain', 'Closed')
      })

      describe('when the page is refreshed', () => {
        before(() => {
          cy.login(returnedUser.username)
          cy.reload()
          cy.get('[data-test=projects]').click()
          cy.get('[data-rowindex="1"] [data-colindex="0"]').click()
        })

        it('should continue to be closed', () => {
          activeProjectStatusToggle().should('contain', 'Closed')
        })
      })
    })
  })

  describe('given a closed project', () => {
    describe('when the status is toggled to active position', () => {
      before(() => {
        closedProjectStatusToggle().click()
        cy.get('[data-test=status-select-on-option]').click()
      })

      it('should display the active project status', () => {
        activeProjectStatusToggle().should('contain', 'Active')
      })
    })

    describe('when the page is refreshed', () => {
      before(() => {
        cy.login(returnedUser.username)
        cy.reload()
        cy.get('[data-test=projects]').click()
        cy.get('[data-rowindex="1"] [data-colindex="0"]').click()
      })

      it('should continue to be active', () => {
        activeProjectStatusToggle().should('contain', 'Active')
      })
    })
  })
})
