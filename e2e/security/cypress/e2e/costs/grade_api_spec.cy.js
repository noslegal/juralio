import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('grade_api_spec', () => {
  let orgAdminUser, matterCreatorUser
  let org, group, grade
  // Org-level costs are position-scoped (groups-positions work). These tests
  // exercise the Advisor flow, so list/generateDefaults requests must be told
  // which position to report on. clientPosition is used for the generateDefaults
  // success case — Advisor already has grades created above, so generating
  // defaults there is a no-op; Client is still empty so it actually generates.
  let advisorPosition
  let clientPosition
  before(() => {
    createOrganisation('', false).then(o => {
      org = o.body
      createUser('', true, false, {
        roles: ['ROLE_ORG_ADMIN', 'ROLE_MATTER_CREATOR'],
      }).then(u => {
        orgAdminUser = u
        sysadminAddUserToOrganisation(org, orgAdminUser)
        createUser('', true, false, {
          roles: ['ROLE_MATTER_CREATOR'],
        }).then(u => {
          matterCreatorUser = u
          sysadminAddUserToOrganisation(org, matterCreatorUser)
          cy.login(orgAdminUser).then(() => {
            cy.request({
              url: `${Cypress.env('serverBaseUrl')}/groupPositions`,
              method: 'GET',
            })
              .its('body')
              .then(positions => {
                advisorPosition = positions.find(p => p.name === 'Advisor')?.id
                clientPosition = positions.find(p => p.name === 'Client')?.id
              })
          })
        })
      })
    })
  })
  //create grade group
  describe('When creating a group as a  matter creator', () => {
    before(() => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/login`,
        method: 'POST',
        body: {
          username: matterCreatorUser.username,
          password: Cypress.env('defaultPassword'),
        },
      }).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.roles).to.not.contain('ROLE_ORG_ADMIN')
      })
    })
    it('Should not be allowed to create a grade group', () => {
      cy.login(matterCreatorUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/gradecategories`,
        method: 'POST',
        body: {
          name: 'testGroup',
        },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
      })
    })
    describe('creating as an org admin', () => {
      before(() => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/login`,
          method: 'POST',
          body: {
            username: orgAdminUser.username,
            password: Cypress.env('defaultPassword'),
          },
        }).then(response => {
          expect(response.status).to.eq(200)
          expect(response.body.roles).to.contain('ROLE_ORG_ADMIN')
        })
      })
      it('Should be allowed to create a grade group', () => {
        cy.login(orgAdminUser)
        cy.request({
          url: `${Cypress.env('serverBaseUrl')}/gradecategories`,
          method: 'POST',
          body: {
            name: 'testGroup',
            position: advisorPosition,
          },
        }).then(res => {
          group = res.body
          expect(res.status).to.eq(200)
          expect(group.name).to.eq('testGroup')
        })
      })
      //create grade
      describe('Creating a grade as a matter creator', () => {
        before(() => {
          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/login`,
            method: 'POST',
            body: {
              username: matterCreatorUser.username,
              password: Cypress.env('defaultPassword'),
            },
          }).then(response => {
            expect(response.status).to.eq(200)
            expect(response.body.roles).to.not.contain('ROLE_ORG_ADMIN')
          })
        })
        it('Should not be allowed to create a grade', () => {
          cy.login(matterCreatorUser)
          cy.request({
            url: `${Cypress.env('serverBaseUrl')}/grade`,
            method: 'POST',
            body: {
              name: 'testGrade',
              categoryId: group.id,
            },
            failOnStatusCode: false,
          }).then(res => {
            expect(res.status).to.eq(403)
          })
        })
        describe('creating as an org admin', () => {
          before(() => {
            cy.apiSpecRequest({
              url: `${Cypress.env('serverBaseUrl')}/login`,
              method: 'POST',
              body: {
                username: orgAdminUser.username,
                password: Cypress.env('defaultPassword'),
              },
            }).then(response => {
              expect(response.status).to.eq(200)
              expect(response.body.roles).to.contain('ROLE_ORG_ADMIN')
            })
          })
          it('Should be allowed to create a grade', () => {
            cy.login(orgAdminUser)
            cy.request({
              url: `${Cypress.env('serverBaseUrl')}/grade`,
              method: 'POST',
              body: {
                name: 'testGrade',
                categoryId: group.id,
                position: advisorPosition,
              },
            }).then(res => {
              grade = res.body
              expect(res.status).to.eq(200)
              expect(grade.name).to.eq('testGrade')
            })
          })
        })
      })
      //get grade
      describe('access a grade as a matter creator', () => {
        before(() => {
          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/login`,
            method: 'POST',
            body: {
              username: matterCreatorUser.username,
              password: Cypress.env('defaultPassword'),
            },
          }).then(response => {
            expect(response.status).to.eq(200)
            expect(response.body.roles).to.not.contain('ROLE_ORG_ADMIN')
          })
        })
        it('Should not be allowed to access a grade', () => {
          cy.login(matterCreatorUser)
          cy.request({
            url: `${Cypress.env('serverBaseUrl')}/grades`,
            method: 'POST',
            body: {},
            failOnStatusCode: false,
          }).then(res => {
            expect(res.status).to.eq(403)
          })
        })
        describe('access as an org admin', () => {
          before(() => {
            cy.apiSpecRequest({
              url: `${Cypress.env('serverBaseUrl')}/login`,
              method: 'POST',
              body: {
                username: orgAdminUser.username,
                password: Cypress.env('defaultPassword'),
              },
            }).then(response => {
              expect(response.status).to.eq(200)
              expect(response.body.roles).to.contain('ROLE_ORG_ADMIN')
            })
          })
          it('Should be allowed to access a grade', () => {
            cy.login(orgAdminUser)
            cy.request({
              url: `${Cypress.env('serverBaseUrl')}/grades`,
              method: 'POST',
              body: { position: advisorPosition },
            }).then(res => {
              expect(res.status).to.eq(200)
            })
          })
        })
      })
      //update grade
      describe('Updating a grade as a matter creator', () => {
        before(() => {
          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/login`,
            method: 'POST',
            body: {
              username: matterCreatorUser.username,
              password: Cypress.env('defaultPassword'),
            },
          }).then(response => {
            expect(response.status).to.eq(200)
            expect(response.body.roles).to.not.contain('ROLE_ORG_ADMIN')
          })
        })
        it('Should not be allowed to access a grade', () => {
          cy.login(matterCreatorUser)
          cy.request({
            url: `${Cypress.env('serverBaseUrl')}/grade/${grade.id}`,
            method: 'PATCH',
            body: {
              name: 'test2',
            },
            failOnStatusCode: false,
          }).then(res => {
            expect(res.status).to.eq(403)
          })
        })
        describe('Updating as an org admin', () => {
          before(() => {
            console.log(grade)
            cy.apiSpecRequest({
              url: `${Cypress.env('serverBaseUrl')}/login`,
              method: 'POST',
              body: {
                username: orgAdminUser.username,
                password: Cypress.env('defaultPassword'),
              },
            }).then(response => {
              expect(response.status).to.eq(200)
              expect(response.body.roles).to.contain('ROLE_ORG_ADMIN')
            })
          })
          it('Should be allowed to access a grade', () => {
            console.log(grade, 'POG')
            cy.login(orgAdminUser)
            cy.request({
              url: `${Cypress.env('serverBaseUrl')}/grade/${grade.id}`,
              method: 'PATCH',
              body: {
                name: 'test2',
              },
            }).then(res => {
              expect(res.status).to.eq(200)
            })
          })
        })
      })
    })
  })

  describe('When listing grade categories as a matter creator', () => {
    it('Should not be allowed', () => {
      cy.login(matterCreatorUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/gradecategory`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
      })
    })
  })

  describe('When listing grade categories as an org admin', () => {
    it('Should be allowed', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/gradecategory`,
        method: 'POST',
        body: { position: advisorPosition },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
  })

  describe('When generating default grades as a matter creator', () => {
    it('Should not be allowed', () => {
      cy.login(matterCreatorUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/grade/${org.id}/generateDefaults`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(403)
      })
    })
  })

  describe('When generating default grades for another org', () => {
    it('Should not be allowed', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/login`,
        method: 'POST',
        body: {
          username: 'matter.creator@juralio.com',
          password: 'Password2Password2$',
        },
      })
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/grade/${org.id}/generateDefaults`,
        method: 'POST',
        body: {},
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.be.oneOf([401, 403])
      })
    })
  })

  describe('When generating default grades as an org admin', () => {
    it('Should be allowed', () => {
      cy.login(orgAdminUser)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/grade/${org.id}/generateDefaults`,
        method: 'POST',
        body: { position: clientPosition },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
  })
})
