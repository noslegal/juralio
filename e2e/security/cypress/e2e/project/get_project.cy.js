import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import {
  createDefaultOrgTestUsers,
  createPopulatedDummyOrg,
  getDummyOrgUserProperties,
} from '../../../../helpers/organisation/organisation_api_helper'

describe('get_project.cy', () => {
  let orgUsers, otherOrgUsers, fixture
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
        const seed = {
          matter: {
            prefix: 'importantMatter',
            teamMembers: [
              orgUsers.teamMember,
              orgUsers.matterAdminAndTeamMember,
            ],
            matterAdmins: [
              orgUsers.matterAdmin,
              orgUsers.matterAdminAndTeamMember,
            ],
            projects: [
              {
                name: 'Project 1',
                tasks: [{ name: 'Task' }],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
  })

  describe('when trying to retrieve a project', () => {
    let url

    before(() => {
      url = `${Cypress.env('serverBaseUrl')}/matter/${
        fixture.matter.id
      }/workstreams/${fixture.projects[0].id}`
    })

    describe('as a user who is NOT a MATTER TEAM MEMBER', () => {
      before(() => {
        cy.login(orgUsers.nonTeamMember.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('as a MATTER TEAM MEMBER', () => {
      before(() => {
        cy.login(orgUsers.teamMember.username)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('as a MATTER ADMIN', () => {
      before(() => {
        cy.login(orgUsers.matterAdmin.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('as a MATTER ADMIN and TEAM MEMBER', () => {
      before(() => {
        cy.login(orgUsers.matterAdminAndTeamMember.username)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url,
          method: 'GET',
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('as users from a DIFFERENT ORGANISATION', () => {
      getDummyOrgUserProperties().forEach(c => {
        it(`should return FORBIDDEN status when logged in as ${c.name}`, () => {
          cy.login(otherOrgUsers[c.name].username)
          cy.apiSpecRequest({
            url,
            method: 'GET',
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })
    })
  })

  //These do not currently work on Project Controller.
  //   describe('when trying to retrieve a project with unsupported verbs', () => {
  //     describe('as a MATTER TEAM MEMBER', () => {
  //       before(() => {
  //         cy.login(teamMember.username)
  //       })

  //       it('should return METHOD_NOT_ALLOWED status', () => {
  //         cy.apiSpecRequest({
  //           url: `${Cypress.env('serverBaseUrl')}/matter/${
  //             fixture.matter.id
  //           }/workstreams/${fixture.projects[0].id}`,
  //           method: 'POST',
  //         }).then(response => {
  //           expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
  //         })
  //       })

  //       it('should return METHOD_NOT_ALLOWED status', () => {
  //         cy.apiSpecRequest({
  //           url: `${Cypress.env('serverBaseUrl')}/matter/${
  //             fixture.matter.id
  //           }/workstreams/${fixture.projects[0].id}`,
  //           method: 'PATCH',
  //         }).then(response => {
  //           expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
  //         })
  //       })

  //       it('should return METHOD_NOT_ALLOWED status', () => {
  //         cy.apiSpecRequest({
  //           url: `${Cypress.env('serverBaseUrl')}/matter/${
  //             fixture.matter.id
  //           }/workstreams/${fixture.projects[0].id}`,
  //           method: 'DELETE',
  //         }).then(response => {
  //           expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
  //         })
  //       })
  //     })
  //   })
})
