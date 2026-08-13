import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { addTeamMember } from '../../../../../helpers/matterprojects/matter_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('remove_matter_team_member.cy', () => {
  let user, user2, user3, fixture
  before(() => {
    createUser().then(createdUser => {
      user3 = createdUser
      createUser().then(createdUser => {
        user2 = createdUser
        createUser().then(createdUser => {
          user = createdUser

          const seed = {
            matter: {
              prefix: 'importantMatter',
              teamMembers: [user],
              matterAdmins: [user],
              projects: [
                {
                  name: 'Project 1',
                  tasks: [{ name: 'task a' }],
                },
                {
                  name: 'Project 2',
                  tasks: [{ name: 'task b' }],
                },
              ],
            },
          }
          fixture = generateFixture(seed)
        })
      })
    })
  })

  describe('when trying to remove an existing matter team member', () => {
    describe('as a MATTER_ADMIN', () => {
      let matterTeamMemberId

      before(() => {
        addTeamMember(fixture.matter.id, user3.id).then(res => {
          matterTeamMemberId = res[0].id
        })
        cy.login(user.username)
      })

      it('should return OK status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
            fixture.matter.id
          }/teammembers/${matterTeamMemberId}`,
          method: 'DELETE',
          body: {
            id: matterTeamMemberId,
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.OK)
        })
      })
    })
  })

  describe('when trying to remove an existing matter team member', () => {
    describe('when not a MATTER_ADMIN', () => {
      let matterTeamMemberId

      before(() => {
        addTeamMember(fixture.matter.id, user3.id).then(res => {
          matterTeamMemberId = res.id
        })
        cy.login(user2.username)
      })

      it('should return BAD_REQUEST status', () => {
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
            fixture.matter.id
          }/teammembers/${matterTeamMemberId}`,
          method: 'DELETE',
          body: {
            id: matterTeamMemberId,
          },
        }).then(response => {
          expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
        })
      })
    })
  })
})
