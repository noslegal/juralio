import {
    generateFixture,
    getWrapper
} from '../../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../../../helpers/users/user_api_helper'
import { changeUserActiveStatus } from '../../../../../../helpers/users/user_helper'

describe('task_team_member_hide_inactive_from_search.cy', () => {
  let appPage, fixture
  let user1, user2, user3
  const visitHelpers = new VisitHelpers()

  before(() => {
    //Prefix is used to generate users in order to test ordering
    const createUser1 = () =>
      createUser('Y').then(createdUser => (user1 = createdUser))
    const createUser2 = () =>
      createUser('F').then(createdUser => (user2 = createdUser))
    const createUser3 = () =>
      createUser('INACTIVE').then(createdUser => (user3 = createdUser))

    createUser1()
      .then(createUser2)
      .then(createUser3)
      .then(() => {
        const seed = {
          matter: {
            prefix: 'ttmHideInactiveSearchSpec',
            teamMembers: [user1, user2, user3],
            matterAdmins: [user1],
            projects: [
              {
                name: 'Test Project',
                teamMembers: [user1],
                tasks: [
                  {
                    name: 'Transfer Documents',
                    teamMembers: [user1, user2],
                  },
                ],
              },
            ],
          },
        }

        fixture = generateFixture(seed)
        appPage = getWrapper(fixture)
      })
  })

  before(() => {
    cy.login(user1.username)
    appPage.visitTaskByName('Transfer Documents')
    cy.get('[data-test=avatar-group]').click()
  })

  it('should display 2 team members', () => {
    cy.get('[data-test=user-list-item]').should('have.length', 2)
  })

  describe('When navigating to a task and attempting to search for an inactive user account', () => {
    before(() => {
      cy.login(user1.username)
      visitHelpers.visitOrgUsers()
      changeUserActiveStatus(user3)
      appPage.visitTaskByName('Transfer Documents')
      cy.get('[data-test=add-team-member-button]').click()
      searchInput().type('INACTIVE')
    })
    it('should not display any team members', () => {
      cy.get('[data-test=overflow-list]').should('not.exist')
    })
  })
})

const searchInput = () =>
  cy.get('[data-test=autocomplete-search]').find('input').clear()
