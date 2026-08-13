/*
Purpose: Tests handling of recent task handling..

Test flow:  Creates 2 matters with tasks and visits them. Then checks result on home screen.


Date created: 24/01/2022
*/

import {
    generateFixture,
    getWrapper
} from '../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../helpers/users/user_api_helper'

describe('recency_bulk_test.cy', () => {
  let testUser
  let fixture1, fixture2
  let appPage

  const taskStructure = [
    { name: 'LA 1', tasks: [{}, {}, {}, {}, {}, {}] },
    { name: 'LA 2', tasks: [] },
    { name: 'LA 3', tasks: [] },
    { name: 'LA 4', tasks: [] },
    { name: 'LA 5', tasks: [] },
    { name: 'LA 6', tasks: [] },
    { name: 'LA 7', tasks: [] },
    { name: 'LA 8', tasks: [] },
  ]

  before(() => {
    createUser()
      .then(createdUser => {
        testUser = createdUser
        const seed = {
          matter: {
            teamMembers: [testUser],
            matterAdmins: [testUser],
            projects: [
              {
                name: 'Workstream1',
                tasks: taskStructure,
              },
              { name: 'Workstream2', tasks: taskStructure },
            ],
          },
        }
        fixture1 = generateFixture(seed)
        fixture2 = generateFixture(seed)
      })
      .then(() => {
        appPage = getWrapper(fixture1)
      })
  })
  describe('when creating a new workstream', () => {
    before(() => {
      cy.login(testUser)
      for (let i = 0; i < fixture1.tasks.length; i++) {
        let task = fixture1.tasks[i]
        appPage.visitTaskById(task.matterId, task.project.id, task.id)
      }
      for (let i = 0; i < fixture2.tasks.length; i++) {
        let task = fixture2.tasks[i]
        appPage.visitTaskById(task.matterId, task.project.id, task.id)
      }
      appPage.visitHome()
      cy.wait(5000)
      cy.get('[data-test=home-recently-viewed-tab]').click()
    })

    it('should show the correct task information', () => {
      cy.get('[data-test=recently-viewed-matter-title]').should(
        'have.length',
        2
      )
      cy.get('[data-test=juralio-chip-task]').should('have.length', 20)
    })
  })
})
