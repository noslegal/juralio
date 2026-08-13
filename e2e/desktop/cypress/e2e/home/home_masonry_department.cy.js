import {
  generateFixture,
  getWrapper,
} from '../../../../helpers/matterprojects/fixture_helper'
import {
  createUser,
  updateFTUE,
} from '../../../../helpers/users/user_api_helper'

describe('home_masonry_department.cy', () => {
  let user, fixture, appPage
  const DEPARTMENT = 'Legal Operations'
  const SEPARATOR = ' | '

  before(() => {
    createUser('', true, true, {
      roles: ['ROLE_MATTER_CREATOR', 'ROLE_USER'],
    }).then(createdUser => {
      user = createdUser
      updateFTUE(user, { hasSeenMatterAdmin: true })
      const seed = {
        matter: {
          prefix: 'masonry_dept',
          teamMembers: [user],
          matterAdmins: [user],
          department: DEPARTMENT,
          projects: [{ name: 'Workstream 1', tasks: [] }],
        },
      }
      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('when the matter has a department set', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitHome()
    })

    it('should show client name and department separated by | on the masonry card', () => {
      cy.get('[data-test=masonry-client-name]').should(
        'contain.text',
        fixture.matter.clientName + SEPARATOR + DEPARTMENT
      )
    })

    it('should show client name and department separated by | in the matter switcher', () => {
      cy.get('[data-test=matter-switcher-button]').click()
      cy.get('[data-test=matter-item-client-name]').should(
        'contain.text',
        fixture.matter.clientName + SEPARATOR + DEPARTMENT
      )
    })
  })
})
