import {
  generateFixture,
  getWrapper,
} from '../../../../helpers/matterprojects/fixture_helper'
import { updateProject } from '../../../../helpers/matterprojects/projects_api_helper'
import { openSelector } from '../../../../helpers/navigation/project-selector-helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('matter_selector_workstreams_content.cy', () => {
  let fixture1, fixture2, fixture3, user, matterId, project, appPage

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      let seed = {
        matter: {
          prefix: 'matter_with_1_workstream',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'A lonely workstream',
            },
          ],
        },
      }
      fixture1 = generateFixture(seed)

      seed = {
        matter: {
          prefix: 'matter_with_2_workstreams',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Workstream 1',
            },
            {
              name: 'Workstream 2',
            },
          ],
        },
      }
      fixture2 = generateFixture(seed)

      seed = {
        matter: {
          prefix: 'matter_with_no_workstreams',
          teamMembers: [user],
          matterAdmins: [user],
        },
      }
      fixture3 = generateFixture(seed)
      appPage = getWrapper(fixture1)
    })
  })

  describe('when a user opens the matter selector', () => {
    before(() => {
      matterId = fixture1.matter.id
      project = fixture1.projects[0]

      cy.login(user.username)
      appPage.visitHome()
      openSelector()
      cy.backendRoute('/matter/*/team*').as('teamFetch')
      cy.backendRoute('/matter/*/workstream**').as('projectFetch')
      cy.get('[data-test=matter-switcher-matter-item]').eq(0).click()
      cy.wait(['@teamFetch', '@projectFetch'])
    })

    describe('when select the matter with 1 workstreams', () => {
      it('should not have a workstreams label', () => {
        cy.get('[data-test=selector-title]').should('not.exist')
      })

      it('should have one workstream', () => {
        cy.get('[data-test=matter-switcher-mask]')
          .find('[data-test=matter-switcher-workstream-chip]')
          .should('have.length', 1)
      })

      it('should not have the workstream title', () => {
        cy.get('[data-test=matter-switcher-mask]')
          .find('[data-test=workstream-chip-title]')
          .should('not.exist')
      })
    })

    describe('when select the matter with 2 workstreams', () => {
      before(() => {
        cy.get('[data-test=matter-switcher-mask]')
          .find('[data-test=matter-switcher-matter-item]')
          .eq(1)
          .click()
      })

      it('should have two workstreams', () => {
        cy.get('[data-test=matter-switcher-mask]')
          .find('[data-test=matter-switcher-workstream-chip]')
          .should('have.length', 2)
      })

      it('should have the correct workstream titles', () => {
        cy.get('[data-test=workstream-chip-title]')
          .eq(0)
          .should('have.text', 'Workstream 1')
        cy.get('[data-test=workstream-chip-title]')
          .eq(1)
          .should('have.text', 'Workstream 2')
      })
    })

    describe('when select the matter with no workstreams', () => {
      before(() => {
        cy.get('[data-test=matter-switcher-matter-item]').eq(2).click()
      })

      it('should not have a workstreams label', () => {
        cy.get('[data-test=matter-switcher-mask]')
          .find('[data-test=matter-switcher-workstream-chip]')
          .should('have.length', 0)
      })

      it('should have no workstreams', () => {
        cy.get('[data-test=project-overview-link]').should('have.length', 0)
      })
    })

    describe('when the workstream of the matter with 1 workstream is made inactive', () => {
      before(() => {
        cy.login('matter.creator@juralio.com')
        updateProject(matterId, project, { active: false })
        cy.login(user.username)
        cy.get('[data-test=matter-switcher-matter-item]').eq(0).click()
      })

      it('should now not have a workstreams label', () => {
        cy.get('[data-test=selector-title]').should('not.exist')
      })

      it('should now have no workstreams', () => {
        cy.get('[data-test=matter-switcher-mask]')
          .find('[data-test=matter-switcher-workstream-chip]')
          .should('have.length', 0)
      })
    })
  })
})
