import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('matter_overview_header_text.cy', () => {
  let user, singleWorkstreamMatterFixture, multipleWorkstreamMatterFixture
  const visitHelpers = new VisitHelpers()

  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const singleWorkstreamMatter = {
        matter: {
          prefix: '',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'P1',
              tasks: [{ name: 'Task 1' }],
            },
          ],
        },
      }
      const multipleWorkstreamMatter = {
        matter: {
          prefix: '',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'P1',
              tasks: [{ name: 'Task 1' }],
            },
            {
              name: 'P2',
              tasks: [{ name: 'Task 1' }],
            },
          ],
        },
      }

      singleWorkstreamMatterFixture = generateFixture(singleWorkstreamMatter)
      multipleWorkstreamMatterFixture = generateFixture(
        multipleWorkstreamMatter
      )
    })
  })

  describe('When visiting a matter with a single unnamed workstream', () => {
    before(() => {
      cy.login(user)
      visitHelpers.visitMatterOverview(singleWorkstreamMatterFixture.matter.id)
    })

    it('the correct header text is displayed', () => {
      cy.get('[data-test=workstream-title]', { timeout: 30000 }).should(
        'have.text',
        'Progess of the matter'
      )
    })
  })

  describe('When visiting a matter with multiple workstreams', () => {
    before(() => {
      cy.login(user)
      visitHelpers.visitMatterOverview(
        multipleWorkstreamMatterFixture.matter.id
      )
    })

    it('the correct header text is displayed', () => {
      cy.get('[data-test=matter-title]', { timeout: 30000 }).should(
        'have.text',
        '2 active workstreams'
      )
    })
  })

  describe('When visiting a workstream', () => {
    before(() => {
      cy.login(user)

      visitHelpers.visitProjectOverview(
        multipleWorkstreamMatterFixture.matter.id,
        multipleWorkstreamMatterFixture.projects[1].id
      )
    })

    it('the correct header text is displayed', () => {
      cy.get('[data-test=workstream-title]').should(
        'have.text',
        'Progress of this workstream'
      )
    })
  })
})
