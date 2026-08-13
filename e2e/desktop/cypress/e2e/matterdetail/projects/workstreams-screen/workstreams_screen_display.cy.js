import {
  addMatterAdmin,
  addTeamMember,
  createMatter,
} from '../../../../../../helpers/matterprojects/matter_api_helper'
import { createProject } from '../../../../../../helpers/matterprojects/projects_api_helper'
import {
  createUser,
  updateFTUE,
} from '../../../../../../helpers/users/user_api_helper'

describe('workstreams_screen_display.cy', () => {
  let returnedMatter, matterUser, user

  const ACTIVE_WORKSTREAM = 'activeProject'

  before(() => {
    createUser()
      .then(user => {
        matterUser = user
        createMatter().then(matter => {
          returnedMatter = matter
          addTeamMember(matter.id, user.id)
          addMatterAdmin(matter.id, user.id)
          cy.login(user.username)
        })
      })
      .then(() => {
        createProject(returnedMatter.id, ACTIVE_WORKSTREAM)
        createProject(returnedMatter.id, 'Closed project', {
          active: false,
        })
        return createUser()
      })
      .then(u => {
        addTeamMember(returnedMatter.id, u.id)
        addMatterAdmin(returnedMatter.id, u.id)
        user = u
      })
  })

  describe('when navigate to a workstream details screen', () => {
    before(() => {
      updateFTUE(user, { hasSeenMatterAdmin: true })
      cy.login(user.username)
      cy.visit(`/#/matteradmin/${returnedMatter.id}`)
      cy.get('[data-test=projects]').click()
      // cy.get('[data-test=project-list-item]').eq(0).click()
      // cy.get('[data-test=private-workstream-settings]').eq(0).click()
    })

    it('should have the name of the workstream', () => {
      cy.get('[data-test=read-field]')
        .eq(0)
        .should('have.text', ACTIVE_WORKSTREAM)
    })

    describe('when click on workstream name', () => {
      before(() => {
        cy.get('[data-test=read-field]').eq(0).click()
      })

      it('should be editable', () => {
        cy.get('[data-test=edit-field]').should('be.visible')
      })

      after(() => {
        cy.get('[data-test="projects-content"]').click()
      })
    })

    it('should display the created / closed info', () => {
      cy.get('[data-test=project-created-on]').should('be.visible')
    })

    it('should display a toggle for active / closed', () => {
      cy.get('[data-test=status-select-selection-dropdown]')
        .eq(0)
        .contains('Active')
    })

    it('should display a toggle for private / Visible', () => {
      cy.get('[data-test=status-select-selection-dropdown]')
        .eq(1)
        .contains('Visible')
    })

    describe('when update workstream to be private', () => {
      before(() => {
        cy.get('body').type('{esc}')
        cy.get('[data-test=status-select-selection-dropdown]').eq(1).click()
        cy.get('[data-test="status-select-on-option"]').click()
      })

      it('should display the People options', () => {
        cy.get('[data-test=private-workstream-settings]').should('be.visible')
      })
    })
  })
})
