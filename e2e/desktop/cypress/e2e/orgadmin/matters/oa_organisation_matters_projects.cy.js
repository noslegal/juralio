import {
  addMatterAdmin,
  addTeamMember,
  createMatter,
} from '../../../../../helpers/matterprojects/matter_api_helper'
import { createProject } from '../../../../../helpers/matterprojects/projects_api_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

describe('oa_organisation_matters_projects.cy', () => {
  let standardMatter, standardUser, teamMember

  const navigateToOrgMatters = user => {
    cy.login(user.username)
    visitHelpers.visitOrgMatters()
    cy.wait(2000)
    cy.backendRoute('GET', '/matters?**').as('mattersList')
    cy.get('[data-test=search-button]').click()
    cy.wait(1000)
    cy.get('[data-test=Search]').click().type(standardMatter.name)
    cy.wait('@mattersList')
    cy.get('[data-test=matters-list-item]', { timeout: 10000 }).should(
      'contain',
      standardMatter.name
    )
    cy.wait(3000)
    cy.get('[data-rowindex=0] [data-colindex=0]').click()
  }

  before(() => {
    createUser()
      .then(user => {
        teamMember = user
      })
      .then(createUser)
      .then(user => {
        standardUser = user
        createMatter().then(matter => {
          standardMatter = matter
          addTeamMember(matter.id, standardUser.id)
          addMatterAdmin(matter.id, standardUser.id)
          addTeamMember(matter.id, teamMember.id)
        })
      })
  })

  describe('when going to matter info page', () => {
    before(() => {
      cy.login(standardUser.username)
      createProject(standardMatter.id, 'Project1')
      navigateToOrgMatters(standardUser)
    })

    it('should display a client avatar in the header with the users and projects tab', () => {
      cy.get('[data-test=client-avatar]').should('exist')
      cy.get('[data-test=users-tab]').should('contain', 'People')
      cy.get('[data-test=projects-tab]').should('contain', 'Workstreams')
    })

    describe('when going to the projects tab', () => {
      before(() => {
        cy.get('[data-test=projects-tab]').click()
      })
      it('should display explanatory text at the top', () => {
        cy.get('[data-test=workstreams-helper]').contains(
          'These attributes can only be edited by a matter administrator, within the matter admin screen'
        )
      })
      it('should link to the matter admin area', () => {
        cy.get('[data-test=link-to-matter-admin]').should('be.visible')
      })
      it('should display a client avatar in the header with the users and projects tab', () => {
        cy.get('[data-test=client-avatar]').should('exist')
        cy.get('[data-test=users-tab]').should('contain', 'People')
        cy.get('[data-test=projects-tab]').should('contain', 'Workstreams')
      })

      it('should display workstream name in column one', () => {
        cy.get('[role="columnheader"][data-field="name"]').should(
          'contain',
          'Workstream'
        )
      })
      it('should display status in column two', () => {
        cy.get('[role="columnheader"][data-field="_project"]').should(
          'contain',
          'Status'
        )
      })
      it('should display private? in column three', () => {
        cy.get('[role="columnheader"][data-field="isPrivate"]').should(
          'contain',
          'Private?'
        )
      })
      it('should contain one active project', () => {
        cy.get('[data-test=projectstatustoggle-wrapper]').should(
          'contain',
          'Active'
        )
      })
      it('should not be able to edit active/closed status', () => {
        cy.get('[data-test=status-select-readonly]').should('be.visible')
      })
      describe('when click on the go to matter admin link', () => {
        before(() => {
          cy.get('[data-test=link-to-matter-admin]').click()
        })
        it('should navigate to the matter admin workstreams area', () => {
          cy.get('[data-test="panel-title"]').should('have.text', 'Workstreams')
        })
      })
    })
    describe('when going to the projects tab, as a non Matter Admin', () => {
      before(() => {
        cy.login(teamMember.username)
        navigateToOrgMatters(teamMember)
        cy.get('[data-test=projects-tab]').click()
      })
      it('should display explanatory text at the top', () => {
        cy.get('[data-test=workstreams-helper]').contains(
          'These attributes can only be edited by a matter administrator, within the matter admin screen'
        )
      })
      it('should not link to the matter admin area', () => {
        cy.get('[data-test=link-to-matter-admin]').should('not.exist')
      })
    })
  })
})
