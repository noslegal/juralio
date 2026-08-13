import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createTask } from '../../../../../helpers/tasks/tasks_api_helper'

const {
  createUser,
  updateFTUE,
} = require('../../../../../helpers/users/user_api_helper')

describe('split_empty_workstream.cy', () => {
  let user, fixture, appPage
  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'split_empty_workstream.cy',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'pro1',
            },
            {
              name: 'pro2',
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })
  describe('when there are no tasks to split a workstream from', () => {
    before(() => {
      updateFTUE(user, { hasSeenMatterAdmin: true })
      cy.login(user)
      appPage.visitMatter()
      cy.wait(2000)
      cy.get('[data-test=projects]').click({ force: true })
    })
    it('should only show the create a blank workstream option', () => {
      cy.get('[data-test="create-new-workstream"]').click()
      cy.get('[data-test=blank-workstream]').should('be.visible')
      cy.get('[data-test=split-workstream]').should('not.exist')
    })
  })
  describe('when there are 2 workstreams, 1 with tasks, 1 without', () => {
    before(() => {
      cy.login('matter.creator@juralio.com')
      createTask(
        fixture.matter.id,
        fixture.projects[0].id,
        'not-started',
        'a task'
      )
      cy.login(user)
      appPage.visitMatter()
      cy.wait(2000)
      cy.get('[data-test=projects]').click()
    })
    it('should show an option to split from an existing workstream', () => {
      cy.get('[data-test="create-new-workstream"]').click()
      cy.get('[data-test=split-workstream]').should('be.visible')
    })
    describe('when trying to split from an existing workstream', () => {
      before(() => {
        cy.get('[data-test=split-workstream]').click()
        cy.get('[data-test=split-workstream-select]').click()
      })
      it('should only show workstreams with tasks for workstreams that can be split from', () => {
        cy.get('[data-test=split-workstream-option]').should(
          'contain.text',
          'pro1'
        )
        cy.get('[data-test=split-workstream-option]').should(
          'not.contain.text',
          'pro2'
        )
      })
    })
  })
})
