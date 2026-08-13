import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import {
  createDefaultOrgTestUsers,
  createPopulatedDummyOrg,
  getDummyOrgUserProperties,
} from '../../../../../helpers/organisation/organisation_api_helper'
import {
  createTemplate,
  createTemplateResource,
  getTemplateResources,
} from '../../../../../helpers/templates/template_api_helper'

describe('template_copy.cy', () => {
  let fixture, orgUsers, otherOrgUsers, template

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
            prefix: 'Matter',
            teamMembers: [
              orgUsers.teamMember,
              orgUsers.matterAdminAndTeamMember,
              orgUsers.knowledgeManager,
            ],
            matterAdmins: [
              orgUsers.matterAdmin,
              orgUsers.matterAdminAndTeamMember,
            ],
            projects: [
              {
                name: 'Project',
                tasks: [],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
  })

  describe('when trying to copy a template', () => {
    let url
    const createTemplateForTest = () => {
      cy.login(orgUsers.knowledgeManager)

      createTemplate('Template', fixture.projects[0].id).then(body => {
        template = body
        url = `${Cypress.env('serverBaseUrl')}/projecttemplates/${
          template.id
        }/copy`
        createTemplateResource(body.id, 'resource 1', 'https://google.com')
      })
    }

    describe('as a user in the same organisation with KM role', () => {
      before(() => {
        createTemplateForTest()
        cy.login(orgUsers.knowledgeManager.username)
      })

      it('should return CREATED status', () => {
        cy.apiSpecRequest({
          url,
          method: 'POST',
          body: { name: 'copied template', includePosts: false },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.CREATED)
          getTemplateResources(template.id).then(res => {
            expect(res.status).to.eq(200)
            expect(res.body.length).to.eq(1)
          })
        })
      })
    })

    describe('as a user in the same organisation', () => {
      before(() => {
        createTemplateForTest()
        cy.login(orgUsers.nonTeamMember.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url,
          method: 'POST',
          body: { name: 'copied template', includePosts: false },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('as a MATTER TEAM MEMBER in the same organisation', () => {
      before(() => {
        createTemplateForTest()
        cy.login(orgUsers.teamMember.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url,
          method: 'POST',
          body: { name: 'copied template', includePosts: false },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('as a MATTER ADMIN in the same organisation', () => {
      before(() => {
        createTemplateForTest()
        cy.login(orgUsers.matterAdmin.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url,
          method: 'POST',
          body: { name: 'copied template', includePosts: false },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('as a MATTER ADMIN and TEAM MEMBER in the same organisation', () => {
      before(() => {
        createTemplateForTest()
        cy.login(orgUsers.matterAdminAndTeamMember.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url,
          method: 'POST',
          body: { name: 'copied template', includePosts: false },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })

    describe('as users from a DIFFERENT ORGANISATION', () => {
      getDummyOrgUserProperties().forEach(c => {
        it(`should return FORBIDDEN status when logged in as ${c.name}`, () => {
          cy.login(otherOrgUsers[c.name].username)
          cy.apiSpecRequest({
            url,
            method: 'POST',
            body: { name: 'copied template', includePosts: false },
          }).then(response => {
            expect(response.status).to.eq(HttpStatus.FORBIDDEN)
          })
        })
      })
    })
  })
})
