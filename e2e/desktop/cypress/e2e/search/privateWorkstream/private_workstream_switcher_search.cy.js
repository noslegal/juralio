//SWM with private workstream
// as private team member
// as team member
//as admin
//as nobody
//MWM with private workstream
// as private team member
// as team member
//as admin
//as nobody
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import {
  createDefaultOrgTestUsers,
  createPopulatedDummyOrg,
} from '../../../../../helpers/organisation/organisation_api_helper'

const visitHelpers = new VisitHelpers()
describe('private_workstream_switcher_search.cy', () => {
  let orgUsers, otherOrgUsers, fixture_0, fixture_1, fixture_2

  before(() => {
    createDefaultOrgTestUsers()
      .then(users => {
        orgUsers = users
      })
      .then(() => createPopulatedDummyOrg('otherOrg'))
      .then(users => {
        otherOrgUsers = users
      })
      .then(() => {
        let seed = {
          matter: {
            prefix: 'AAAAA',
            teamMembers: [
              orgUsers.teamMember,
              orgUsers.knowledgeManager,
              orgUsers.matterAdminAndTeamMember,
            ],
            matterAdmins: [
              orgUsers.matterAdmin,
              orgUsers.matterAdminAndTeamMember,
            ],
            matterViewer: [orgUsers.matterViewer],
            projects: [
              {
                name: 'Private Single workstream matter',
                tasks: [],
                properties: { isPrivate: true },
              },
            ],
          },
        }
        fixture_0 = generateFixture(seed)
        seed = {
          matter: {
            prefix: 'BBBBBB',
            teamMembers: [
              orgUsers.teamMember,
              orgUsers.knowledgeManager,
              orgUsers.matterAdminAndTeamMember,
            ],
            matterAdmins: [
              orgUsers.matterAdmin,
              orgUsers.matterAdminAndTeamMember,
            ],
            matterViewer: [orgUsers.matterViewer],
            projects: [
              {
                name: 'Public Single workstream matter',
                tasks: [],
              },
            ],
          },
        }
        fixture_1 = generateFixture(seed)
        seed = {
          matter: {
            prefix: 'CCCCCC',
            teamMembers: [
              orgUsers.teamMember,
              orgUsers.knowledgeManager,
              orgUsers.matterAdminAndTeamMember,
            ],
            matterAdmins: [
              orgUsers.matterAdmin,
              orgUsers.matterAdminAndTeamMember,
            ],
            matterViewer: [orgUsers.matterViewer],
            projects: [
              {
                name: 'Private workstream',
                tasks: [],
                properties: { isPrivate: true },
              },
              {
                name: 'Public workstream',
                tasks: [],
              },
            ],
          },
        }
        fixture_2 = generateFixture(seed)
      })
  })
  describe('as a matter admin who is not a team member', () => {
    before(() => {
      cy.login(orgUsers.matterAdmin)
      visitHelpers.visitHome()
      cy.get('[data-test=matter-switcher-button]').click()
    })

    describe('when searching for a private single  workstream matter that I admin', () => {
      before(() => {
        // cy.backendRoute('/universal/fuzzysearch**').as('search')
        cy.get('[data-test=matter-switcher-filter-input]')
          .find('input')
          .clear()
          .type(`${fixture_0.matter.name}`)
        // cy.wait('@search')
      })
      it('should show the matter', () => {
        cy.get('[data-test=matter-switcher-matter-item]').should(
          'have.length',
          1
        )
      })
    })
    describe('when searching for a public single  workstream matter that I admin', () => {
      before(() => {
        cy.backendRoute('/universal/fuzzysearch').as('search')
        cy.get('[data-test=matter-switcher-filter-input]').find('input').clear()
        cy.get('[data-test=matter-switcher-filter-input]')
          .find('input')
          .type(`${fixture_1.matter.name}`)
      })
      it('should show the matter', () => {
        cy.get('[data-test=matter-switcher-matter-item]').should(
          'have.length',
          1
        )
      })
    })
    describe('when searching for a public multi  workstream matter that I admin', () => {
      before(() => {
        cy.backendRoute('/universal/fuzzysearch').as('search')
        cy.get('[data-test=matter-switcher-filter-input]').find('input').clear()
        cy.get('[data-test=matter-switcher-filter-input]')
          .find('input')
          .type(`${fixture_2.matter.name}`)
      })
      it('should show the matter', () => {
        cy.get('[data-test=matter-switcher-matter-item]').should(
          'have.length',
          1
        )
      })
    })
  })

  describe('as a matter admin who is  a team member', () => {
    before(() => {
      cy.login(orgUsers.matterAdminAndTeamMember)
      visitHelpers.visitHome()
      cy.get('[data-test=matter-switcher-button]').click()
    })

    describe('when searching for a private single  workstream matter that I admin', () => {
      before(() => {
        cy.backendRoute('/universal/fuzzysearch').as('search')
        cy.get('[data-test=matter-switcher-filter-input]')
          .find('input')
          .clear()
          .type(`${fixture_0.matter.name}`)
      })
      it('should show the matter', () => {
        cy.get('[data-test=matter-switcher-matter-item]').should(
          'have.length',
          1
        )
      })
    })
    describe('when searching for a public single  workstream matter that I admin', () => {
      before(() => {
        cy.backendRoute('/universal/fuzzysearch').as('search')
        cy.get('[data-test=matter-switcher-filter-input]')
          .find('input')
          .clear()
          .type(`${fixture_1.matter.name}`)
      })
      it('should show the matter', () => {
        cy.get('[data-test=matter-switcher-matter-item]').should(
          'have.length',
          1
        )
      })
    })
    describe('when searching for a public multi  workstream matter that I admin', () => {
      before(() => {
        cy.backendRoute('/universal/fuzzysearch').as('search')
        cy.get('[data-test=matter-switcher-filter-input]')
          .find('input')
          .clear()
          .type(`${fixture_2.matter.name}`)
      })
      it('should show the matter', () => {
        cy.get('[data-test=matter-switcher-matter-item]').should(
          'have.length',
          1
        )
      })
    })
  })
  describe('as a team member who is not a private team member', () => {
    before(() => {
      cy.login(orgUsers.teamMember)
      visitHelpers.visitHome()
      cy.get('[data-test=matter-switcher-button]').click()
    })

    describe('when searching for a private single workstream matter that i am not a private member of', () => {
      before(() => {
        cy.backendRoute('/universal/fuzzysearch').as('search')
        cy.get('[data-test=matter-switcher-filter-input]')
          .find('input')
          .clear()
          .type(`${fixture_0.matter.name}`)
      })
      it('should show the matter', () => {
        cy.get('[data-test=matter-switcher-matter-item]').should(
          'have.length',
          0
        )
      })
    })
    describe('when searching for a public single workstream matter that I am a member of', () => {
      before(() => {
        cy.backendRoute('/universal/fuzzysearch').as('search')
        cy.get('[data-test=matter-switcher-filter-input]')
          .find('input')
          .clear()
          .type(`${fixture_1.matter.name}`)
      })
      it('should show the matter', () => {
        cy.get('[data-test=matter-switcher-matter-item]').should(
          'have.length',
          1
        )
      })
    })
    describe('when searching for a public multi workstream matter that i am a member of', () => {
      before(() => {
        cy.backendRoute('/universal/fuzzysearch').as('search')
        cy.get('[data-test=matter-switcher-filter-input]')
          .find('input')
          .clear()
          .type(`${fixture_2.matter.name}`)
      })
      it('should show the matter', () => {
        cy.get('[data-test=matter-switcher-matter-item]').should(
          'have.length',
          1
        )
      })
    })
  })
  describe('as a team member who is  a private team member', () => {
    before(() => {
      cy.login(orgUsers.matterAdmin)

      let url = `${Cypress.env('serverBaseUrl')}/matter/${
        fixture_2.matter.id
      }/workstreams/${fixture_2.projects[0].id}/teammembers`
      cy.apiSpecRequest({
        url,
        method: 'POST',
        body: { users: [orgUsers.teamMember.id] },
      })
      cy.login(orgUsers.matterAdmin)
      url = `${Cypress.env('serverBaseUrl')}/matter/${
        fixture_0.matter.id
      }/workstreams/${fixture_0.projects[0].id}/teammembers`
      cy.apiSpecRequest({
        url,
        method: 'POST',
        body: { users: [orgUsers.teamMember.id] },
      })

      cy.login(orgUsers.teamMember)

      visitHelpers.visitHome()
      cy.get('[data-test=matter-switcher-button]').click()
    })

    describe('when searching for a private single  workstream matter that I am a private member of', () => {
      before(() => {
        cy.backendRoute('/universal/fuzzysearch**').as('search')
        cy.get('[data-test=matter-switcher-filter-input]')
          .find('input')
          .clear()
          .type(`${fixture_0.matter.name}`)
      })
      it('should show the matter', () => {
        cy.get('[data-test=matter-switcher-matter-item]').should(
          'have.length',
          1
        )
      })
    })
    describe('when searching for a public single  workstream matter that I am a member of', () => {
      before(() => {
        cy.backendRoute('/universal/fuzzysearch').as('search')
        cy.get('[data-test=matter-switcher-filter-input]')
          .find('input')
          .clear()
          .type(`${fixture_1.matter.name}`)
      })
      it('should show the matter', () => {
        cy.get('[data-test=matter-switcher-matter-item]').should(
          'have.length',
          1
        )
      })
    })
    describe('when searching for a public multi  workstream matter that i am mameber of', () => {
      before(() => {
        cy.backendRoute('/universal/fuzzysearch').as('search')
        cy.get('[data-test=matter-switcher-filter-input]')
          .find('input')
          .clear()
          .type(`${fixture_2.matter.name}`)
      })
      it('should show the matter', () => {
        cy.get('[data-test=matter-switcher-matter-item]').should(
          'have.length',
          1
        )
      })
    })
  })
  describe('as a non team member', () => {
    before(() => {
      cy.login(orgUsers.nonTeamMember)

      visitHelpers.visitHome()
      cy.get('[data-test=matter-switcher-button]').click()
    })

    describe('when searching for a private single  workstream matter that I am not a member of', () => {
      before(() => {
        cy.backendRoute('/universal/fuzzysearch**').as('search')
        cy.get('[data-test=matter-switcher-filter-input]')
          .find('input')
          .clear()
          .type(`${fixture_0.matter.name}`)
      })
      it('should show the matter', () => {
        cy.get('[data-test=matter-switcher-matter-item]').should(
          'have.length',
          0
        )
      })
    })
    describe('when searching for a public single  workstream matter that I am bot  a member of', () => {
      before(() => {
        cy.backendRoute('/universal/fuzzysearch').as('search')
        cy.get('[data-test=matter-switcher-filter-input]')
          .find('input')
          .clear()
          .type(`${fixture_1.matter.name}`)
      })
      it('should show the matter', () => {
        cy.get('[data-test=matter-switcher-matter-item]').should(
          'have.length',
          0
        )
      })
    })
    describe('when searching for a public multi  workstream matter that i am not a memeber of', () => {
      before(() => {
        cy.backendRoute('/universal/fuzzysearch').as('search')
        cy.get('[data-test=matter-switcher-filter-input]')
          .find('input')
          .clear()
          .type(`${fixture_2.matter.name}`)
      })
      it('should show the matter', () => {
        cy.get('[data-test=matter-switcher-matter-item]').should(
          'have.length',
          0
        )
      })
    })
  })
})
