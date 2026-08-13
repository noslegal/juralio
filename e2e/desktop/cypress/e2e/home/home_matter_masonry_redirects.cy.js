import {
  generateFixture,
  getWrapper,
} from '../../../../helpers/matterprojects/fixture_helper'
import { createMatter } from '../../../../helpers/matterprojects/matter_api_helper'
import { createWorkstream } from '../../../../helpers/matterprojects/projects_api_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

let admin, seed, appPage, fixture, matter2, matter3

describe('home_matter_masonry_redirects.cy', () => {
  before(() => {
    createUser('', true, true, {
      roles: ['ROLE_MATTER_CREATOR'],
    }).then(user => {
      admin = user
      seed = {
        matter: {
          prefex: 'Multiple Workstreams',
          teamMembers: [admin],
          matterAdmins: [admin],
          projects: [
            {
              name: 'Project 1',
              tasks: [{ name: 'task1', teamMembers: [admin] }],
            },
            {
              name: 'Project 2',
              tasks: [{ name: 'task1', teamMembers: [admin] }],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })
  describe('when navigating to the home screen', () => {
    before(() => {
      cy.login(admin)
      matter2 = createMatter('Single Named Workstream', admin).then(res => {
        matter2 = res
        createWorkstream(matter2.id, 'Custom', [])
      })
      createMatter('Default Workstream', admin).then(res => {
        matter3 = res
        createWorkstream(matter3.id, 'Workstream', [])
      })
      appPage.visitHome()
    })

    describe('when clicking on a matter with one default workstream', () => {
      before(() => {
        cy.get('[data-test=masonry-matter-name]', { timeout: 10000 })
          .contains(matter3.name)
          .last()
          .click()
      })
      it('should show the matter overview page', () => {
        cy.url().should('contain', `/matter/${matter3.id}/overview`)
      })

      describe('when clicking on a matter with multiple workstreams', () => {
        before(() => {
          cy.login(admin)
          appPage.visitHome()
          cy.get('[data-test=masonry-matter-name]', { timeout: 10000 })
            .contains(fixture.matter.name)
            .last()
            .click()
        })
        it('should show the matter overview page', () => {
          cy.url().should('contain', `/matter/${fixture.matter.id}/overview`)
        })
      })

      describe('when clicking on a matter with a single active workstream', () => {
        before(() => {
          cy.login(admin)
          appPage.visitHome()
          cy.get('[data-test=masonry-matter-name]', { timeout: 10000 })
            .contains(matter2.name)
            .last()
            .click()
        })
        it('should redirect to the workstream overview page', () => {
          cy.url().should('contain', `/matter/${matter2.id}/overview`)
        })
      })
    })
  })
})
