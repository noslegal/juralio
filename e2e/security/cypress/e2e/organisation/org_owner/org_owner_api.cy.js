//make internal user org owner
//make external user org owner
import faker from 'faker'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('org_owner_api.cy', () => {
  let org
  describe('when making an internal user the org owner', () => {
    let u1, u2
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      createOrganisation('', false).then(o => {
        org = o.body
        internalGroup = o.body.organisationGroup.id
        createUser('', true, false).then(u => {
          u1 = u
          sysadminAddUserToOrganisation(o.body, u)
          createUser('', true, false).then(v => {
            u2 = v
            sysadminAddUserToOrganisation(o.body, v).then(() => {
              cy.login('sysadmin@juralio.com', 'Password1Password1$')
              cy.apiSpecRequest({
                method: 'PATCH',
                url: `${Cypress.env('serverBaseUrl')}/users/${v.id}`,
                body: {
                  roles: ['ROLE_ORG_OWNER'],
                },
              })
            })
          })
        })
      })
    })
    it('should add them as an org admin', () => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.apiSpecRequest({
        method: 'GET',
        url: `${Cypress.env('serverBaseUrl')}/users/${u2.id}`,
      }).then(res => {
        expect(res.status).to.eq(200)
        expect(res.body.roles).to.contain('ROLE_ORG_ADMIN')
        expect(res.body.roles).to.contain('ROLE_ORG_OWNER')
      })
    })
  })
  describe('when making an internal user in an org as the org owner', () => {
    let u1, u2
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')

      cy.apiSpecRequest({
        method: 'POST',
        url: `${Cypress.env('serverBaseUrl')}/users`,
        body: {
          username: faker.internet.email().toLowerCase(),
          organisation: { id: org.id },
          roles: ['ROLE_ORG_OWNER'],
        },
      }).then(res => {
        expect(res.status).to.eq(201)
        u1 = res.body
      })
    })
    it('should add them as an org admin', () => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.apiSpecRequest({
        method: 'GET',
        url: `${Cypress.env('serverBaseUrl')}/users/${u1.id}`,
      }).then(res => {
        expect(res.status).to.eq(200)
        expect(res.body.roles).to.contain('ROLE_ORG_ADMIN')
      })
    })
  })
  describe('when making an internal with no roles as the first user of an org', () => {
    let org, u1, u2
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      createOrganisation('', false).then(o => {
        org = o.body

        cy.apiSpecRequest({
          method: 'POST',
          url: `${Cypress.env('serverBaseUrl')}/users`,
          body: {
            username: faker.internet.email().toLowerCase(),
            organisation: { id: o.body.id },
            roles: [],
          },
        }).then(res => {
          expect(res.status).to.eq(201)
          u1 = res.body
        })
      })
    })
    it('should add them as an org admin and rog owner', () => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.apiSpecRequest({
        method: 'GET',
        url: `${Cypress.env('serverBaseUrl')}/users/${u1.id}`,
      }).then(res => {
        expect(res.status).to.eq(200)
        expect(res.body.roles).to.contain('ROLE_ORG_ADMIN')
        expect(res.body.roles).to.contain('ROLE_ORG_OWNER')
      })
    })
  })
  describe('when making an external user the org owner', () => {
    let org, u1, u2
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      createOrganisation('', false).then(o => {
        org = o.body
        createUser('', true, false).then(u => {
          u1 = u
          sysadminAddUserToOrganisation(o.body, u)
          createUser('', true, false, { isExternal: true }).then(v => {
            u2 = v
            sysadminAddUserToOrganisation(o.body, v)
          })
        })
      })
    })
    it('should not allow them to be an org owner', () => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.apiSpecRequest({
        method: 'PATCH',
        url: `${Cypress.env('serverBaseUrl')}/users/${u2.id}`,
        body: {
          roles: ['ROLE_ORG_OWNER'],
        },
      }).then(res => {
        expect(res.status).to.eq(400)
      })
    })
  })
  describe('when moving an org owner to a new org that has users', () => {
    let org, u1, org2
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      createOrganisation().then(o1 => {
        org = o1
        createOrganisation().then(o2 => {
          org2 = o2.body
          cy.login('sysadmin@juralio.com', 'Password1Password1$')
          createUser('', true, false).then(nu => {
            sysadminAddUserToOrganisation(o2.body, nu)
            cy.apiSpecRequest({
              method: 'POST',
              url: `${Cypress.env('serverBaseUrl')}/users`,
              body: {
                username: faker.internet.email().toLowerCase(),
                organisation: { id: o1.body.id },
                roles: ['ROLE_ORG_OWNER'],
              },
            })
            cy.apiSpecRequest({
              method: 'POST',
              url: `${Cypress.env('serverBaseUrl')}/users`,
              body: {
                username: faker.internet.email().toLowerCase(),
                organisation: { id: o1.body.id },
                roles: ['ROLE_ORG_OWNER'],
              },
            }).then(res => {
              expect(res.status).to.eq(201)
              expect(res.body.roles).to.contain('ROLE_ORG_ADMIN')
              expect(res.body.roles).to.contain('ROLE_ORG_OWNER')
              u1 = res.body
              cy.login('sysadmin@juralio.com', 'Password1Password1$')
              cy.apiSpecRequest({
                method: 'DELETE',
                url: `${Cypress.env('serverBaseUrl')}/organisations/${
                  o1.body.id
                }/users`,
                body: {
                  username: res.body.username,
                },
              }).then(deleteRes => {
                expect(deleteRes.status).to.eq(200)
                cy.apiSpecRequest({
                  method: 'POST',
                  url: `${Cypress.env('serverBaseUrl')}/organisations/${
                    o2.body.id
                  }/users`,
                  body: {
                    username: res.body.username,
                  },
                })
              })
            })
          })
        })
      })
    })
    it('should not have the org owner role', () => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.apiSpecRequest({
        method: 'GET',
        url: `${Cypress.env('serverBaseUrl')}/users/${u1.id}`,
      }).then(res => {
        expect(res.status).to.eq(200)
        expect(res.body.roles).to.contain('ROLE_ORG_ADMIN')
        expect(res.body.roles).to.not.contain('ROLE_ORG_OWNER')
      })
    })
  })
  describe('when moving an org owner to a new org that has no users', () => {
    let org, u1, org2
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      createOrganisation().then(o1 => {
        org = o1
        createOrganisation().then(o2 => {
          org2 = o2.body
          cy.login('sysadmin@juralio.com', 'Password1Password1$')

          cy.apiSpecRequest({
            method: 'POST',
            url: `${Cypress.env('serverBaseUrl')}/users`,
            body: {
              username: faker.internet.email().toLowerCase(),
              organisation: { id: o1.body.id },
              roles: ['ROLE_ORG_OWNER'],
            },
          }).then(res => {
            expect(res.status).to.eq(201)
            expect(res.body.roles).to.contain('ROLE_ORG_ADMIN')
            expect(res.body.roles).to.contain('ROLE_ORG_OWNER')
            u1 = res.body
            cy.login('sysadmin@juralio.com', 'Password1Password1$')
            cy.apiSpecRequest({
              method: 'PATCH',
              url: `${Cypress.env('serverBaseUrl')}/users/${res.body.id}`,
              body: {
                organisation: { id: o2.body.id },
              },
            })
          })
        })
      })
    })
    it('should have the org owner role', () => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.apiSpecRequest({
        method: 'GET',
        url: `${Cypress.env('serverBaseUrl')}/users/${u1.id}`,
      }).then(res => {
        expect(res.status).to.eq(200)
        expect(res.body.roles).to.contain('ROLE_ORG_ADMIN')
        expect(res.body.roles).to.contain('ROLE_ORG_OWNER')
      })
    })
  })
  describe('when moving an user to a new org that has users', () => {
    let org, u1, org2
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      createOrganisation().then(o1 => {
        org = o1
        createOrganisation().then(o2 => {
          org2 = o2.body
          cy.login('sysadmin@juralio.com', 'Password1Password1$')
          createUser('', true, false).then(nu => {
            sysadminAddUserToOrganisation(o2.body, nu)
            cy.apiSpecRequest({
              method: 'POST',
              url: `${Cypress.env('serverBaseUrl')}/users`,
              body: {
                username: faker.internet.email().toLowerCase(),
                organisation: { id: o1.body.id },
                roles: ['ROLE_ORG_ADMIN'],
              },
            })
            cy.apiSpecRequest({
              method: 'POST',
              url: `${Cypress.env('serverBaseUrl')}/users`,
              body: {
                username: faker.internet.email().toLowerCase(),
                organisation: { id: o1.body.id },
                roles: ['ROLE_ORG_OWNER'],
              },
            }).then(res => {
              expect(res.status).to.eq(201)
              expect(res.body.roles).to.contain('ROLE_ORG_ADMIN')
              expect(res.body.roles).to.contain('ROLE_ORG_OWNER')
              u1 = res.body
              cy.login('sysadmin@juralio.com', 'Password1Password1$')

              cy.apiSpecRequest({
                method: 'DELETE',
                url: `${Cypress.env('serverBaseUrl')}/organisations/${
                  o1.body.id
                }/users`,
                body: {
                  username: res.body.username,
                },
              }).then(() => {
                cy.apiSpecRequest({
                  method: 'POST',
                  url: `${Cypress.env('serverBaseUrl')}/organisations/${
                    o2.body.id
                  }/users`,
                  body: {
                    username: res.body.username,
                  },
                })
              })
            })
          })
        })
      })
    })
    it('should not have the org owner role', () => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.apiSpecRequest({
        method: 'GET',
        url: `${Cypress.env('serverBaseUrl')}/users/${u1.id}`,
      }).then(res => {
        expect(res.status).to.eq(200)
        expect(res.body.roles).to.contain('ROLE_ORG_ADMIN')
        expect(res.body.roles).to.not.contain('ROLE_ORG_OWNER')
      })
    })
  })
  describe('when moving an user to a new org that has no users', () => {
    let org, u1, org2
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      createOrganisation().then(o1 => {
        org = o1
        createOrganisation().then(o2 => {
          org2 = o2.body
          cy.login('sysadmin@juralio.com', 'Password1Password1$')
          createUser('', true, false).then(nu => {
            // sysadminAddUserToOrganisation(o1.body, nu)

            cy.apiSpecRequest({
              method: 'POST',
              url: `${Cypress.env('serverBaseUrl')}/users`,
              body: {
                username: faker.internet.email().toLowerCase(),
                organisation: { id: o1.body.id },
                roles: [],
              },
            }).then(res => {
              expect(res.status).to.eq(201)
              expect(res.body.roles).to.contain('ROLE_ORG_ADMIN')
              expect(res.body.roles).to.contain('ROLE_ORG_OWNER')
              u1 = res.body
              cy.login('sysadmin@juralio.com', 'Password1Password1$')

              cy.apiSpecRequest({
                method: 'DELETE',
                url: `${Cypress.env('serverBaseUrl')}/organisations/${
                  o1.body.id
                }/users`,
                body: {
                  username: res.body.username,
                },
              }).then(() => {
                cy.apiSpecRequest({
                  method: 'POST',
                  url: `${Cypress.env('serverBaseUrl')}/organisations/${
                    o2.body.id
                  }/users`,
                  body: {
                    username: res.body.username,
                  },
                })
              })
            })
          })
        })
      })
    })
    it('should have the org owner role', () => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.apiSpecRequest({
        method: 'GET',
        url: `${Cypress.env('serverBaseUrl')}/users/${u1.id}`,
      }).then(res => {
        expect(res.status).to.eq(200)
        expect(res.body.roles).to.contain('ROLE_ORG_ADMIN')
        expect(res.body.roles).to.contain('ROLE_ORG_OWNER')
      })
    })
  })
  describe('when converting an org owner to external', () => {
    let u1, org
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      createOrganisation().then(o => {
        org = o.body
        cy.apiSpecRequest({
          method: 'POST',
          url: `${Cypress.env('serverBaseUrl')}/users`,
          body: {
            username: faker.internet.email().toLowerCase(),
            organisation: { id: o.body.id },
            roles: ['ROLE_ORG_OWNER'],
          },
        }).then(res => {
          expect(res.status).to.eq(201)
          cy.apiSpecRequest({
            method: 'POST',
            url: `${Cypress.env('serverBaseUrl')}/users`,
            body: {
              username: faker.internet.email().toLowerCase(),
              organisation: { id: o.body.id },
              roles: ['ROLE_ORG_OWNER'],
            },
          }).then(res => {
            expect(res.status).to.eq(201)
            expect(res.body.roles).to.contain('ROLE_ORG_ADMIN')
            expect(res.body.roles).to.contain('ROLE_ORG_OWNER')
            u1 = res.body
            cy.apiSpecRequest({
              method: 'PATCH',
              url: `${Cypress.env('serverBaseUrl')}/users/${res.body.id}`,
              body: {
                isExternal: true,
                forceUpdate: true,
              },
            }).then(r => {
              expect(r.status).to.eq(200)
            })
          })
        })
      })
    })
    it('should drop their owner role', () => {
      cy.apiSpecRequest({
        method: 'GET',
        url: `${Cypress.env('serverBaseUrl')}/users/${u1.id}`,
      }).then(res => {
        expect(res.status).to.eq(200)
        expect(res.body.roles).to.not.contain('ROLE_ORG_ADMIN')
        expect(res.body.roles).to.not.contain('ROLE_ORG_OWNER')
      })
    })
  })
  describe('when converting an org owner to external who is the only user in the org', () => {
    let u1
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      createOrganisation().then(o => {
        cy.apiSpecRequest({
          method: 'POST',
          url: `${Cypress.env('serverBaseUrl')}/users`,
          body: {
            username: faker.internet.email().toLowerCase(),
            organisation: { id: o.body.id },
            roles: ['ROLE_ORG_OWNER'],
          },
        }).then(res => {
          expect(res.status).to.eq(201)
          expect(res.body.roles).to.contain('ROLE_ORG_ADMIN')
          expect(res.body.roles).to.contain('ROLE_ORG_OWNER')
          u1 = res.body
        })
      })
    })
    it('should not make them extenral', () => {
      cy.apiSpecRequest({
        method: 'PATCH',
        url: `${Cypress.env('serverBaseUrl')}/users/${u1.id}`,
        body: {
          isExternal: true,
          forceUpdate: true,
        },
      }).then(r => {
        expect(r.status).to.eq(400)
        cy.apiSpecRequest({
          method: 'GET',
          url: `${Cypress.env('serverBaseUrl')}/users/${u1.id}`,
        }).then(res => {
          expect(res.status).to.eq(200)
          expect(res.body.roles).to.contain('ROLE_ORG_ADMIN')
          expect(res.body.roles).to.contain('ROLE_ORG_OWNER')
        })
      })
    })
  })
  describe('when converting an org owner to external when they are the only owner', () => {
    let u1
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      createOrganisation().then(o => {
        cy.apiSpecRequest({
          method: 'POST',
          url: `${Cypress.env('serverBaseUrl')}/users`,
          body: {
            username: faker.internet.email().toLowerCase(),
            organisation: { id: o.body.id },
            roles: [],
          },
        }).then(res => {
          expect(res.status).to.eq(201)
          expect(res.body.roles).to.contain('ROLE_ORG_ADMIN')
          expect(res.body.roles).to.contain('ROLE_ORG_OWNER')
          u1 = res.body
          cy.apiSpecRequest({
            method: 'POST',
            url: `${Cypress.env('serverBaseUrl')}/users`,
            body: {
              username: faker.internet.email().toLowerCase(),
              organisation: { id: o.body.id },
              roles: [],
            },
          })
        })
      })
    })
    it('should not allow the request', () => {
      cy.apiSpecRequest({
        method: 'PATCH',
        url: `${Cypress.env('serverBaseUrl')}/users/${u1.id}`,
        body: {
          isExternal: true,
          forceUpdate: true,
        },
      }).then(r => {
        expect(r.status).to.eq(400)
        cy.apiSpecRequest({
          method: 'GET',
          url: `${Cypress.env('serverBaseUrl')}/users/${u1.id}`,
        }).then(res => {
          expect(res.status).to.eq(200)
          expect(res.body.roles).to.contain('ROLE_ORG_ADMIN')
          expect(res.body.roles).to.contain('ROLE_ORG_OWNER')
        })
      })
    })
  })
  describe('when converting an org owner to external when there are multiple owners', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      createOrganisation().then(o => {
        cy.apiSpecRequest({
          method: 'POST',
          url: `${Cypress.env('serverBaseUrl')}/users`,
          body: {
            username: faker.internet.email().toLowerCase(),
            organisation: { id: o.body.id },
            roles: [],
          },
        }).then(() => {
          cy.apiSpecRequest({
            method: 'POST',
            url: `${Cypress.env('serverBaseUrl')}/users`,
            body: {
              username: faker.internet.email().toLowerCase(),
              organisation: { id: o.body.id },
              roles: ['ROLE_ORG_OWNER'],
            },
          }).then(res => {
            expect(res.status).to.eq(201)
            expect(res.body.roles).to.contain('ROLE_ORG_ADMIN')
            expect(res.body.roles).to.contain('ROLE_ORG_OWNER')
            u1 = res.body
          })
        })
      })
    })
    it('should drop their owner role', () => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.apiSpecRequest({
        method: 'PATCH',
        url: `${Cypress.env('serverBaseUrl')}/users/${u1.id}`,
        body: {
          isExternal: true,
          forceUpdate: true,
        },
      }).then(r => {
        expect(r.status).to.eq(200)
        cy.apiSpecRequest({
          method: 'GET',
          url: `${Cypress.env('serverBaseUrl')}/users/${u1.id}`,
        }).then(res => {
          expect(res.status).to.eq(200)
          expect(res.body.roles).to.not.contain('ROLE_ORG_ADMIN')
          expect(res.body.roles).to.not.contain('ROLE_ORG_OWNER')
        })
      })
    })
  })
  describe('when moving an org owner to another org when there are multiple owners', () => {
    let u1, org
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      createOrganisation().then(o => {
        org = o.body
        cy.apiSpecRequest({
          method: 'POST',
          url: `${Cypress.env('serverBaseUrl')}/users`,
          body: {
            username: faker.internet.email().toLowerCase(),
            organisation: { id: o.body.id },
            roles: [],
          },
        }).then(() => {
          cy.apiSpecRequest({
            method: 'POST',
            url: `${Cypress.env('serverBaseUrl')}/users`,
            body: {
              username: faker.internet.email().toLowerCase(),
              organisation: { id: o.body.id },
              roles: ['ROLE_ORG_OWNER'],
            },
          }).then(res => {
            expect(res.status).to.eq(201)
            expect(res.body.roles).to.contain('ROLE_ORG_ADMIN')
            expect(res.body.roles).to.contain('ROLE_ORG_OWNER')
            u1 = res.body
          })
        })
      })
    })
    it('should allow the move', () => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.apiSpecRequest({
        method: 'DELETE',
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}/users`,
        body: {
          username: u1.username,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
  })
  describe('when moving an org owner to another org when there are the only owner', () => {
    let u1, org
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      createOrganisation().then(o => {
        org = o.body
        cy.apiSpecRequest({
          method: 'POST',
          url: `${Cypress.env('serverBaseUrl')}/users`,
          body: {
            username: faker.internet.email().toLowerCase(),
            organisation: { id: o.body.id },
            roles: ['ROLE_ORG_OWNER'],
          },
        }).then(res => {
          expect(res.status).to.eq(201)
          expect(res.body.roles).to.contain('ROLE_ORG_ADMIN')
          expect(res.body.roles).to.contain('ROLE_ORG_OWNER')
          u1 = res.body
        })
      })
    })
    it('should allow the move', () => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.apiSpecRequest({
        method: 'DELETE',
        url: `${Cypress.env('serverBaseUrl')}/organisations/${org.id}/users`,
        body: {
          username: u1.username,
        },
      }).then(res => {
        expect(res.status).to.eq(400)
      })
    })
  })
  describe('when removing the org owner role when there are multiple owners', () => {
    let u1, org
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      createOrganisation().then(o => {
        org = o.body
        cy.apiSpecRequest({
          method: 'POST',
          url: `${Cypress.env('serverBaseUrl')}/users`,
          body: {
            username: faker.internet.email().toLowerCase(),
            organisation: { id: o.body.id },
            roles: [],
          },
        }).then(() => {
          cy.apiSpecRequest({
            method: 'POST',
            url: `${Cypress.env('serverBaseUrl')}/users`,
            body: {
              username: faker.internet.email().toLowerCase(),
              organisation: { id: o.body.id },
              roles: ['ROLE_ORG_OWNER'],
            },
          }).then(res => {
            expect(res.status).to.eq(201)
            expect(res.body.roles).to.contain('ROLE_ORG_ADMIN')
            expect(res.body.roles).to.contain('ROLE_ORG_OWNER')
            u1 = res.body
          })
        })
      })
    })
    it('should allow the removal', () => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.apiSpecRequest({
        method: 'PATCH',
        url: `${Cypress.env('serverBaseUrl')}/users/${u1.id}`,
        body: {
          roles: ['ROLE_ORG_ADMIN'],
        },
      }).then(res => {
        expect(res.status).to.eq(200)
        expect(res.body.roles).to.not.contain('ROLE_ORG_OWNER')
      })
    })
  })
  describe('when removing the org owner role when there is a single owner', () => {
    let u1, org
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      createOrganisation().then(o => {
        org = o.body
        cy.apiSpecRequest({
          method: 'POST',
          url: `${Cypress.env('serverBaseUrl')}/users`,
          body: {
            username: faker.internet.email().toLowerCase(),
            organisation: { id: o.body.id },
            roles: ['ROLE_ORG_OWNER'],
          },
        }).then(res => {
          expect(res.status).to.eq(201)
          expect(res.body.roles).to.contain('ROLE_ORG_ADMIN')
          expect(res.body.roles).to.contain('ROLE_ORG_OWNER')
          u1 = res.body
        })
      })
    })
    it('should not allow the removal', () => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.apiSpecRequest({
        method: 'PATCH',
        url: `${Cypress.env('serverBaseUrl')}/users/${u1.id}`,
        body: {
          roles: ['ROLE_ORG_ADMIN'],
        },
      }).then(res => {
        expect(res.status).to.eq(400)
      })
    })
  })

  describe('when deactivating the org owner role when there are multiple owners', () => {
    let u1, org
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      createOrganisation().then(o => {
        org = o.body
        cy.apiSpecRequest({
          method: 'POST',
          url: `${Cypress.env('serverBaseUrl')}/users`,
          body: {
            username: faker.internet.email().toLowerCase(),
            organisation: { id: o.body.id },
            roles: [],
          },
        }).then(() => {
          cy.apiSpecRequest({
            method: 'POST',
            url: `${Cypress.env('serverBaseUrl')}/users`,
            body: {
              username: faker.internet.email().toLowerCase(),
              organisation: { id: o.body.id },
              roles: ['ROLE_ORG_OWNER'],
            },
          }).then(res => {
            expect(res.status).to.eq(201)
            expect(res.body.roles).to.contain('ROLE_ORG_ADMIN')
            expect(res.body.roles).to.contain('ROLE_ORG_OWNER')
            u1 = res.body
          })
        })
      })
    })
    it('should allow the removal', () => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.apiSpecRequest({
        method: 'PATCH',
        url: `${Cypress.env('serverBaseUrl')}/users/${u1.id}`,
        body: {
          enabled: false,
        },
      }).then(res => {
        expect(res.status).to.eq(200)
        expect(res.body.enabled).to.eq(false)
      })
    })
  })
  describe('when deactivating the org owner role when there is a single owner', () => {
    let u1, org
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      createOrganisation().then(o => {
        org = o.body
        cy.apiSpecRequest({
          method: 'POST',
          url: `${Cypress.env('serverBaseUrl')}/users`,
          body: {
            username: faker.internet.email().toLowerCase(),
            organisation: { id: o.body.id },
            roles: ['ROLE_ORG_OWNER'],
          },
        }).then(res => {
          expect(res.status).to.eq(201)
          expect(res.body.roles).to.contain('ROLE_ORG_ADMIN')
          expect(res.body.roles).to.contain('ROLE_ORG_OWNER')
          u1 = res.body
        })
      })
    })
    it('should not allow the removal', () => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.apiSpecRequest({
        method: 'PATCH',
        url: `${Cypress.env('serverBaseUrl')}/users/${u1.id}`,
        body: {
          enabled: false,
        },
      }).then(res => {
        expect(res.status).to.eq(400)
      })
    })
  })
  describe('when adding a disabled user as the first user in an org', () => {
    let u1, org
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      createOrganisation().then(o => {
        org = o.body
        cy.apiSpecRequest({
          method: 'POST',
          url: `${Cypress.env('serverBaseUrl')}/users`,
          body: {
            username: faker.internet.email().toLowerCase(),
            enabled: false,
            roles: [],
          },
        }).then(res => {
          expect(res.status).to.eq(201)
          u1 = res.body
          sysadminAddUserToOrganisation(org, u1)
        })
      })
    })
    it('should not give the user org owner', () => {
      cy.apiSpecRequest({
        method: 'GET',
        url: `${Cypress.env('serverBaseUrl')}/users/${u1.id}`,
      }).then(res => {
        expect(res.status).to.eq(200)
        expect(res.body.roles).to.not.contain('ROLE_ORG_ADMIN')
        expect(res.body.roles).to.not.contain('ROLE_ORG_OWNER')
      })
    })
    describe('when adding a user to an org when the first user is nto an org owner', () => {
      let u
      before(() => {
        cy.login('sysadmin@juralio.com', 'Password1Password1$')
        cy.apiSpecRequest({
          method: 'POST',
          url: `${Cypress.env('serverBaseUrl')}/users`,
          body: {
            username: faker.internet.email().toLowerCase(),
            roles: [],
          },
        }).then(res => {
          expect(res.status).to.eq(201)
          u = res.body
          sysadminAddUserToOrganisation(org, u)
        })
      })

      it('should give the user org owner', () => {
        cy.login('sysadmin@juralio.com', 'Password1Password1$')
        cy.apiSpecRequest({
          method: 'GET',
          url: `${Cypress.env('serverBaseUrl')}/users/${u.id}`,
        }).then(res => {
          expect(res.status).to.eq(200)
          expect(res.body.roles).to.contain('ROLE_ORG_ADMIN')
          expect(res.body.roles).to.contain('ROLE_ORG_OWNER')
        })
      })
    })
  })
})
