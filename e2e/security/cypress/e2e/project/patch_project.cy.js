import faker from 'faker'
import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import {
  createDefaultOrgTestUsers,
  createPopulatedDummyOrg,
  getDummyOrgUserProperties,
} from '../../../../helpers/organisation/organisation_api_helper'

describe('patch_project.cy', () => {
  let orgUsers, otherOrgUsers, fixture

  before(() => {
    createDefaultOrgTestUsers()
      .then(createdUsers => {
        orgUsers = createdUsers
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
            projects: [{ name: 'Project 1' }],
          },
        }
        fixture = generateFixture(seed)
      })
  })

  describe('when patching a project', () => {
    let url

    before(() => {
      url = `${Cypress.env('serverBaseUrl')}/admin/matter/${
        fixture.matter.id
      }/workstreams/${fixture.projects[0].id}`
    })

    describe('as a MATTER TEAM MEMBER', () => {
      beforeEach(() => {
        cy.login(orgUsers.teamMember.username)
      })

      describe('when attemping to update the name', () => {
        it('should return BAD_REQUEST status', () => {
          cy.apiSpecRequest({
            url,
            method: 'PATCH',
            body: { name: faker.random.alphaNumeric(20) },
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
          })
        })
      })

      describe('when attemping to update the status', () => {
        it('should return BAD_REQUEST status', () => {
          cy.apiSpecRequest({
            url,
            method: 'PATCH',
            body: {
              active: false,
            },
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
          })
        })
      })

      describe('when attempting to update the description', () => {
        it('should return OK status', () => {
          cy.apiSpecRequest({
            url,
            method: 'PATCH',
            body: {
              description: faker.lorem.words(5),
            },
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.OK)
          })
        })
      })

      describe('when attempting to update the isPrivate', () => {
        it('should return BAD_REQUEST status', () => {
          cy.apiSpecRequest({
            url,
            method: 'PATCH',
            body: {
              isPrivate: true,
            },
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
          })
        })
      })
    })

    describe('as a user who is NOT a MATTER TEAM MEMBER', () => {
      before(() => {
        cy.login(orgUsers.nonTeamMember.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url,
          method: 'PATCH',
          body: {
            description: faker.lorem.words(5),
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('as a MATTER ADMIN', () => {
      beforeEach(() => {
        cy.login(orgUsers.matterAdmin.username)
      })

      it('should return OK status when updating any property', () => {
        cy.apiSpecRequest({
          url,
          method: 'PATCH',
          body: {
            name: faker.random.alphaNumeric(20),
            active: true,
            description: faker.lorem.words(5),
            isPrivate: true,
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })

    describe('as a MATTER ADMIN and MATTER TEAM MEMBER', () => {
      before(() => {
        cy.login(orgUsers.matterAdminAndTeamMember.username)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url,
          method: 'PATCH',
          body: {
            name: faker.random.alphaNumeric(20),
            active: false,
            description: faker.lorem.words(5),
          },
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
            method: 'PATCH',
            body: {
              description: faker.lorem.words(5),
            },
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })
    })
  })
})
