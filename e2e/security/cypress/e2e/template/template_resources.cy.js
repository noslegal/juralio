import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import {
    createDefaultOrgTestUsers,
    createPopulatedDummyOrg
} from '../../../../helpers/organisation/organisation_api_helper'
import {
    createTemplate,
    createTemplateResource,
    deleteTemplateResource,
    getTemplateResource,
    getTemplateResources,
    publishTemplate,
    updateTemplateResource
} from '../../../../helpers/templates/template_api_helper'

describe('template_resources.cy', () => {
  let orgUsers, otherOrgUsers, fixture
  let draftTemplateID, publishedTemplateID, url, anotherTemplateId, resource

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
              orgUsers.knowledgeManager,
            ],
            matterAdmins: [
              orgUsers.matterAdmin,
              orgUsers.matterAdminAndTeamMember,
            ],
            projects: [
              {
                name: 'Project 1',
                tasks: [{ name: 'task a' }, { name: 'task a1' }],
              },
              { name: 'Other Project', tasks: [] },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
  })

  describe('after creating a template', () => {
    before(() => {
      cy.login(orgUsers.knowledgeManager.username)
      createTemplate('draft template', fixture.projects[0].id)
        .then(template => {
          draftTemplateID = template.id
        })
        .then(() => {
          createTemplate('published template', fixture.projects[0].id).then(
            template => {
              publishedTemplateID = template.id
              publishTemplate(publishedTemplateID)
            }
          )
        })
    })
    describe('as a knowledge manager', () => {
      before(() => {
        cy.login(orgUsers.knowledgeManager.username)
      })
      it('should be able to add a resource', () => {
        createTemplateResource(
          draftTemplateID,
          'resource 1',
          'https://google.com'
        ).then(res => {
          expect(res.status).to.eq(201)
          resource = res.body
        })
      })
      it('should be able to list the resources', () => {
        cy.login(orgUsers.knowledgeManager.username)
        getTemplateResources(draftTemplateID).then(res => {
          expect(res.status).to.eq(200)
          expect(res.body.length).to.eq(1)
          expect(res.body[0].id).to.eq(resource.id)
        })
      })
      it('should be able to list a single resource', () => {
        cy.login(orgUsers.knowledgeManager.username)
        getTemplateResource(draftTemplateID, resource.id).then(res => {
          expect(res.status).to.eq(200)
          expect(res.body.id).to.eq(resource.id)
        })
      })
      it('should be able to update a single resource', () => {
        cy.login(orgUsers.knowledgeManager.username)
        updateTemplateResource(draftTemplateID, resource.id, {
          name: 'updated resource',
        }).then(res => {
          expect(res.status).to.eq(200)
          expect(res.body.id).to.eq(resource.id)
          expect(res.body.name).to.eq('updated resource')
        })
      })
      it('should be able to delete a single resource', () => {
        cy.login(orgUsers.knowledgeManager.username)
        deleteTemplateResource(draftTemplateID, resource.id).then(res => {
          expect(res.status).to.eq(204)
          getTemplateResources(draftTemplateID).then(res => {
            expect(res.status).to.eq(200)
            expect(res.body.length).to.eq(0)
          })
        })
      })
    })
    describe('as a non knowledge manager', () => {
      before(() => {
        cy.login(orgUsers.knowledgeManager.username)
        createTemplateResource(
          publishedTemplateID,
          'resource 1',
          'https://google.com'
        ).then(res => {
          expect(res.status).to.eq(201)
          resource = res.body
        })
        cy.login(orgUsers.teamMember.username)
      })
      it('should not be able to add a resource', () => {
        createTemplateResource(
          publishedTemplateID,
          'resource 1',
          'https://google.com'
        ).then(res => {
          expect(res.status).to.eq(403)
        })
      })
      it('should be able to list the resources', () => {
        cy.login(orgUsers.teamMember.username)
        getTemplateResources(publishedTemplateID).then(res => {
          expect(res.status).to.eq(200)
          expect(res.body.length).to.eq(1)
          expect(res.body[0].id).to.eq(resource.id)
        })
      })
      it('should be able to list a single resource', () => {
        cy.login(orgUsers.teamMember.username)
        getTemplateResource(publishedTemplateID, resource.id).then(res => {
          expect(res.status).to.eq(200)
          expect(res.body.id).to.eq(resource.id)
        })
      })
      it('should not be able to update a single resource', () => {
        cy.login(orgUsers.teamMember.username)
        updateTemplateResource(publishedTemplateID, resource.id, {
          name: 'updated resource',
        }).then(res => {
          expect(res.status).to.eq(403)
        })
      })
      it('should not  be able to delete a single resource', () => {
        cy.login(orgUsers.teamMember.username)
        deleteTemplateResource(publishedTemplateID, resource.id).then(res => {
          expect(res.status).to.eq(400)
          getTemplateResources(publishedTemplateID).then(res => {
            expect(res.status).to.eq(200)
            expect(res.body.length).to.eq(1)
          })
        })
      })
    })

    describe('as a knowledge manager in another org', () => {
      before(() => {
        cy.login(otherOrgUsers.knowledgeManager.username)
      })
      it('should be able to add a resource', () => {
        createTemplateResource(
          draftTemplateID,
          'resource 1',
          'https://google.com'
        ).then(res => {
          expect(res.status).to.eq(403)
        })
      })
      it('should be able to list the resources', () => {
        cy.login(otherOrgUsers.knowledgeManager.username)
        getTemplateResources(draftTemplateID).then(res => {
          expect(res.status).to.eq(403)
        })
      })
      it('should be able to list a single resource', () => {
        cy.login(otherOrgUsers.knowledgeManager.username)
        getTemplateResource(draftTemplateID, resource.id).then(res => {
          expect(res.status).to.eq(400)
        })
      })
      it('should be able to update a single resource', () => {
        cy.login(otherOrgUsers.knowledgeManager.username)
        updateTemplateResource(draftTemplateID, resource.id, {
          name: 'updated resource',
        }).then(res => {
          expect(res.status).to.eq(403)
        })
      })
      it('should be able to delete a single resource', () => {
        cy.login(otherOrgUsers.knowledgeManager.username)
        deleteTemplateResource(draftTemplateID, resource.id).then(res => {
          expect(res.status).to.eq(400)
        })
      })
    })
    describe('as a non knowledge manager in another org', () => {
      before(() => {
        cy.login(orgUsers.knowledgeManager.username)
        createTemplateResource(
          publishedTemplateID,
          'resource 1',
          'https://google.com'
        ).then(res => {
          expect(res.status).to.eq(201)
          resource = res.body
        })
        cy.login(otherOrgUsers.teamMember.username)
      })
      it('should not be able to add a resource', () => {
        createTemplateResource(
          publishedTemplateID,
          'resource 1',
          'https://google.com'
        ).then(res => {
          expect(res.status).to.eq(403)
        })
      })
      it('should be able to list the resources', () => {
        cy.login(otherOrgUsers.teamMember.username)
        getTemplateResources(publishedTemplateID).then(res => {
          expect(res.status).to.eq(403)
        })
      })
      it('should be able to list a single resource', () => {
        cy.login(otherOrgUsers.teamMember.username)
        getTemplateResource(publishedTemplateID, resource.id).then(res => {
          expect(res.status).to.eq(400)
        })
      })
      it('should not be able to update a single resource', () => {
        cy.login(otherOrgUsers.teamMember.username)
        updateTemplateResource(publishedTemplateID, resource.id, {
          name: 'updated resource',
        }).then(res => {
          expect(res.status).to.eq(403)
        })
      })
      it('should not  be able to delete a single resource', () => {
        cy.login(otherOrgUsers.teamMember.username)
        deleteTemplateResource(publishedTemplateID, resource.id).then(res => {
          expect(res.status).to.eq(400)
          getTemplateResources(publishedTemplateID).then(res => {
            expect(res.status).to.eq(403)
          })
        })
      })
    })
  })
})
