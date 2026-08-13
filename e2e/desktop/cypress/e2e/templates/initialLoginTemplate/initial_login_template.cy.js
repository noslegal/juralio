//no template set X
//bad template set X
//system template set X
//first visit X
//4th visit X
//after its used X
// taken to taskmap

import {
  addMatterAdmin,
  addTeamMember,
  createMatter,
} from '../../../../../helpers/matterprojects/matter_api_helper'
import { createProject } from '../../../../../helpers/matterprojects/projects_api_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { createPopulatedDummyOrg } from '../../../../../helpers/organisation/organisation_api_helper'
import {
  createSystemLevelTemplate,
  createTemplate,
  createTemplateTask,
  publishTemplate,
} from '../../../../../helpers/templates/template_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()
//ftue check
describe('initial_login_template.cy', () => {
  let otherOrgUsers, user, systemTemplate, user2, user3, matter
  before(() => {
    createPopulatedDummyOrg('').then(users => {
      otherOrgUsers = users
    })
  })
  describe('when login in without a tenmplate being set', () => {
    before(() => {
      cy.login(otherOrgUsers.orgAdmin.username)
      createUser(undefined, true, true, {
        roles: [
          'ROLE_ORG_ADMIN',
          'ROLE_MATTER_CREATOR',
          'ROLE_KNOWLEDGE_MANAGER',
        ],
      }).then(res => {
        user = res
        createUser().then(u2 => {
          user2 = u2
          createUser().then(u3 => {
            user3 = u3

            cy.login(res.username)
            createMatter('Matter 1', res.username, false, '', {}, '1234').then(
              m => {
                matter = m
                addMatterAdmin(m.id, u3.id, res.username)

                addTeamMember(m.id, u3.id, user.username).then(() => {
                  createProject(m.id, 'project 1').then(project => {
                    createTemplate('template', project.id).then(t => {
                      createTemplateTask(t.id, null, 'task 1')
                      addTeamMember(m.id, u2.id, user.username)
                      publishTemplate(t.id)
                      visitHelpers.visitHome(false)
                      cy.wait(5000)
                    })
                  })
                })
              }
            )
          })
        })
      })
    })
    it('should show a regular template', () => {
      cy.get('[data-test=template-card]').should('be.visible')
    })
    describe('when logging in when a bad template is set', () => {
      before(() => {
        cy.login('sysadmin@juralio.com', 'Password1Password1$').then(() => {
          cy.apiSpecRequest({
            url: `${Cypress.env('serverBaseUrl')}/instance/settings`,
            method: 'PATCH',
            body: {
              initialTemplateId: 0,
            },
          }).then(() => {
            cy.login(user.username)
            visitHelpers.visitHome(false)
            cy.wait(5000)
          })
        })
      })
      it('should show a regular template', () => {
        cy.get('[data-test=template-card]').should('be.visible')
      })
    })
    describe('when a template is set', () => {
      before(() => {
        createSystemLevelTemplate('system-template').then(st => {
          systemTemplate = st
          createTemplateTask(st.id, null, 'task 1').then(() => {
            publishTemplate(st.id).then(() => {
              cy.login('sysadmin@juralio.com', 'Password1Password1$').then(
                () => {
                  cy.apiSpecRequest({
                    url: `${Cypress.env(
                      'serverBaseUrl'
                    )}/admin/instance/settings`,
                    method: 'PATCH',
                    body: {
                      initialTemplateId: st.id,
                    },
                  }).then(res => {
                    cy.login(user2.username)
                    visitHelpers.visitHome(false)
                    cy.wait(5000)
                  })
                }
              )
            })
          })
        })
      })
      it('should show the system template', () => {
        cy.get('[data-test=template-card-initial]').should('be.visible')
        cy.get('[data-test=template-name]').should(
          'have.text',
          systemTemplate.name
        )
      })
      describe('after 3 logins', () => {
        before(() => {
          cy.login(user2.username)
          cy.login(user2.username)
          visitHelpers.visitHome(false)
          cy.wait(5000)
        })
        it('should not show the system template', () => {
          cy.get('[data-test=template-card]').should('be.visible')
        })
      })
      describe('after using the template', () => {
        before(() => {
          cy.login(user3.username).then(() => {
            visitHelpers.visitHome(false)
            cy.wait(5000)
            cy.get('[data-test=template-card-initial]').click()
            cy.wait(5000)
            cy.get('[data-test=use-template-button]', {
              timeout: 30000,
            }).click()

            cy.get('[data-test=action-dialog-button]').click()
            cy.get('[data-test=matter-switcher-filter]').eq(0).click()
            cy.get('[data-test=matter-switcher-filter]')
              .eq(0)
              .find('input')
              .type('Matter 1')
            cy.wait(1000)
            cy.get('[data-test=matter-switcher-matter-item]').eq(0).click()
            cy.wait(3000)

            cy.get('[data-test=action-dialog-button]').eq(0).click()
            cy.wait(3000)
            // cy.get('[data-test=auto-complete-search-term]')
            //   .eq(0)
            //   .find('input')
            //   .click()
            // cy.get('[data-test=search-result-list-item]').eq(0).click()
            // cy.get('[data-test=destination-select]').click()
            // cy.get('[data-test=new-stream]').click()
            // cy.get('[data-test=new-name]').find('input').type('1234')
            // cy.get('[data-test=matter-client-name]').find('input').type('1')
            // cy.get('[data-test=matter-name]').find('input').type('1')
            // cy.get('[data-test=matter-refernece-number]')
            //   .find('input')
            //   .type('1')
            cy.wait(5000)
            cy.login(user3.username).then(() => {
              visitHelpers.visitHome(false)
              cy.wait(5000)
            })
          })
        })
        it('should show the system template', () => {
          cy.get('[data-test=template-card-initial]').should('exist')
        })
      })
    })
  })
})
