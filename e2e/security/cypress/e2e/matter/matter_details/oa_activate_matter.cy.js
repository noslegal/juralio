import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('oa_activate_matter.cy', () => {
  let userOA1, userMA1
  let fixture

  before(() => {
    createUser().then(createdUser => {
      userMA1 = createdUser

      createUser('ORGADMIN', undefined, true, {
        roles: ['ROLE_ORG_ADMIN'],
      }).then(createdUser => {
        userOA1 = createdUser

        cy.login(userMA1.username).then(() => {
          const seed = {
            matter: {
              prefix: 'importantMatter',
              teamMembers: [userMA1],
              matterAdmins: [userMA1],
              projects: [],
            },
          }
          fixture = generateFixture(seed)
        })
      })
    })
  })

  describe('When attempting to update a closed matter to active as OA', () => {
    before(() => {
      cy.login(userMA1.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
          fixture.matter.id
        }`,
        method: 'PATCH',
        body: { matterStatus: 'closed' },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })

    it('should return OK status', () => {
      cy.login(userOA1.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
          fixture.matter.id
        }`,
        method: 'PATCH',
        body: { matterStatus: 'active' },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })

    describe('When attempting to close an active matter as an OA', () => {
      before(() => {
        cy.login(userOA1.username)
      })

      it('should return FORBIDDEN status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
            fixture.matter.id
          }`,
          method: 'PATCH',
          body: { matterStatus: 'close' },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.FORBIDDEN)
        })
      })
    })
  })
})
