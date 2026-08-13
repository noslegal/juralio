import faker from 'faker'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../helpers/organisation/organisation_api_helper'
import {
  createBlankTemplate,
  createTemplateTask,
  publishTemplate,
} from '../../../../helpers/templates/template_api_helper'
import {
  createUser,
  updateFTUE,
} from '../../../../helpers/users/user_api_helper'
import { wrapInput } from '../../../../page/wrapper/text-field-wrapper'

const FIELD_MAX_LENGTHS = 60
const MAX_LENGTH_STRING = faker.random.alphaNumeric(FIELD_MAX_LENGTHS)
const MAX_LENGTH_REFERENCE_NUMBER = faker.random.alphaNumeric(20)

const openFabAndClickCreateMatter = () => {
  cy.get('[data-test=fab-button]').click()
  cy.get('[data-test=create-matter-button]').click()
  cy.wait(3000)
}

const visitHelpers = new VisitHelpers()

describe('matter_create_validation.cy', () => {
  let organisation, orgAdmin

  const navigateToOrgDetail = () => {
    cy.login(orgAdmin.username)
    updateFTUE(orgAdmin, { hasSeenInbox: true })
    cy.login(orgAdmin.username)
    visitHelpers.visitHome()
  }

  const getClientNameInput = () =>
    wrapInput(() => cy.get('[data-test=client-name]'))
  const getMatterNameInput = () => wrapInput(() => cy.get('[data-test=name]'))
  const getMatterReferenceNumberInput = () =>
    wrapInput(() => cy.get('[data-test=reference-number]'))

  before(() => {
    const createOrgAdmin = () =>
      createUser(undefined, true, false, {
        roles: [
          'ROLE_ORG_ADMIN',
          'ROLE_MATTER_CREATOR',
          'ROLE_KNOWLEDGE_MANAGER',
        ],
      }).then(user => (orgAdmin = user))
    const associateOrgAdminWithOrg = () =>
      sysadminAddUserToOrganisation(organisation, orgAdmin)

    createOrganisation('', false)
      .then(_organisation => {
        organisation = _organisation.body
      })
      .then(createOrgAdmin)
      .then(associateOrgAdminWithOrg)
  })

  before(navigateToOrgDetail)

  describe('when logged in as a matter creator', () => {
    before(() => {
      cy.get('body').type('{esc}')
      cy.get('[data-test=ftueSkipButton]').click()
    })

    describe('when attempting click on create workstream from template', () => {
      describe('create a template', () => {
        let template
        before(() => {
          cy.login(orgAdmin.username)
          createBlankTemplate(crypto.randomUUID()).then(t => {
            template = t
          })
        })

        it('the template list will not display', () => {
          cy.get('[data-test="template"]').should('not.exist')
        })

        describe('When there is a task created on the template but it is not published', () => {
          before(() => {
            cy.login(orgAdmin.username)
            createTemplateTask(template.id, undefined, crypto.randomUUID())
            visitHelpers.visitHome()
            openFabAndClickCreateMatter()
          })

          it('the template list will not be displayed as the template is not published', () => {
            cy.get('[data-test="template"]').should('not.exist')
          })
        })

        describe('When there is a task created on the template but it is published', () => {
          before(() => {
            cy.login(orgAdmin.username)
            publishTemplate(template.id)
            cy.reload()
            cy.login(orgAdmin.username)
            visitHelpers.visitHome()

            openFabAndClickCreateMatter()
            cy.get('[data-test=create-workstream-from-template]').click()
          })

          it('the template list will be displayed as the template is published', () => {
            cy.get('[data-test="template"]').should('exist')
          })
        })
      })
    })
  })
})
