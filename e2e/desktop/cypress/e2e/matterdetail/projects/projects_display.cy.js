import {
  addMatterAdmin,
  addTeamMember,
  createMatter,
} from '../../../../../helpers/matterprojects/matter_api_helper'
import {
  createMultipleProjects,
  getProjects,
} from '../../../../../helpers/matterprojects/projects_api_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import {
  createUser,
  updateFTUE,
} from '../../../../../helpers/users/user_api_helper'

describe('projects_display.cy', () => {
  let returnedMatter, returnedUser, visitHelpers

  before(() => {
    createUser().then(user =>
      createMatter().then(matter => {
        returnedMatter = matter
        addTeamMember(matter.id, user.id)
        addMatterAdmin(matter.id, user.id)
        cy.login(user.username)
        returnedUser = user
        updateFTUE(returnedUser, { hasSeenMatterAdmin: true })
        visitHelpers = new VisitHelpers()
      })
    )
  })

  describe('should display a header', () => {
    before(() => {
      cy.login(returnedUser.username)
      visitHelpers.visitMatter(returnedMatter.id)
      cy.wait(2000)
      cy.get('[data-test=projects]').click()
    })

    it('with the correct text', () => {
      cy.get('[data-test="projects-content"]')
        .find('[data-test="panel-title"]')
        .should('contain', 'Workstreams')
    })
  })

  describe('given a matter with projects', () => {
    before(() => {
      cy.login(returnedUser.username)
      createMultipleProjects(returnedMatter.id)(6)
    })

    describe('on which the user is an admin and a team-member', () => {
      before(() => {
        cy.login(returnedUser.username)
        visitHelpers.visitMatter(returnedMatter.id)
        cy.wait(2000)
        cy.get('[data-test=projects]').click()
        cy.wait(5000)
      })

      it('the projects list should contain sorted inputs', () => {
        cy.wait(5000)
        getProjects().forEach(project => {
          cy.get(`[data-test="project-${project.id}"]`).should(
            'contain',
            project.name
          )
        })
      })
    })

    describe('on which the user is just a teammember', () => {
      before(() => {
        createUser().then(user => {
          addTeamMember(returnedMatter.id, user.id)
          cy.login(user.username)
          visitHelpers.visitMatter(returnedMatter.id)
        })
      })
      it('the user should not be able to access the page', () => {
        cy.get('[data-test=not-found-page]').should('contain', 'Wrong turn')
      })
    })
  })

  describe('given a matter on which the user is an admin', () => {
    before(() => {
      cy.login('matter.creator@juralio.com')
      visitHelpers.visitMatter(returnedMatter.id)
      cy.wait(2000)
      cy.get('[data-test=projects]').click()
    })

    it('should display the project list and the status toggle', () => {
      getProjects().forEach(project => {
        cy.get(`[data-test="project-${project.id}"]`).should(
          'contain',
          project.name
        )
      })
      getProjects().forEach(project => {
        cy.get(`[data-test="project-${project.id}"]`)
          .get('[data-test=status-select-selection-dropdown]')
          .should('be.visible')
      })
    })
  })
})
