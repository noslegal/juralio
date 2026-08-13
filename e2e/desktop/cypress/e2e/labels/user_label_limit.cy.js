/*
  Purpose: Tests reaching the limits for hashtags in a matter.

  Test flow:  Adds labels to the max on a task and checks limit applies.
  Also checks on another task in same matter and then checks a separate matter is
  not affected by the limit.


  Date created: 26/11/2021
*/
import {
    generateFixture,
    getWrapper
} from '../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'


let fixture, appPage
let fixture2, appPage2

const openLabelFlow = () => {
  cy.backendRoute(
    'GET',
    `/matter/${fixture.matter.id}/labels**`
  ).as('fetchLabels')

  cy.get('[data-test=add-label-button]').click()
  cy.wait('@fetchLabels')
  cy.wait(1000)
}

describe('user_label_limit.cy', () => {
  before(() => {
    createUser().then(createdUser => {
      testUser = createdUser
      const seed = {
        matter: {
          prefix: 'user_label_limit.cy',
          teamMembers: [testUser],
          matterAdmins: [testUser],
          projects: [
            {
              name: 'P1',
              tasks: [{ name: 'Ape' }, { name: 'Pine Martin' }],
            },
          ],
        },
      }
      const seed2 = {
        matter: {
          prefix: 'user_label_limit.cy',
          teamMembers: [testUser],
          matterAdmins: [testUser],
          projects: [
            {
              name: 'P2',
              tasks: [{ name: 'Apple' }],
            },
          ],
        },
      }
      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
      fixture2 = generateFixture(seed2)
      appPage2 = getWrapper(fixture2)
    })
  })

  describe('When labels are added to a task', () => {
    before(() => {
      cy.login(testUser.username)
      appPage.visitTaskByName('Ape')

      for (let j = 0; j < 20; j++) {
        openLabelFlow()
        cy.get('[data-test=label-search-field]')
          .find('input')
          .type('Monkey' + j)
        cy.get('[data-test=add-user-defined-label-button]').click()
      }
    })

    it('should add the labels to the task', () => {
      cy.get('[data-test=label-chip-text]').should('have.length', 20)
    })

    describe('When the label flow is opened again', () => {
      before(() => {
        openLabelFlow()
      })

      it('displays a message stating that no new labels can be created', () => {
        cy.get('[data-test=no-more-labels-in-matter]').should(
          'have.text',
          'No more labels can be created in this matter as the label limit has been reached.'
        )
      })

      describe('When the label flow is opened on another task', () => {
        before(() => {
          cy.login(testUser.username)
          appPage.visitTaskByName('Pine Martin')
          openLabelFlow()
        })

        it('displays a message stating that no new labels can be created', () => {
          cy.get('[data-test=no-more-labels-in-matter]').should(
            'have.text',
            'No more labels can be created in this matter as the label limit has been reached.'
          )
        })

        describe('When visiting another matter', () => {
          before(() => {
            cy.login(testUser.username)
            appPage2.visitTaskByName('Apple')
            cy.get('[data-test=add-label-button]').click()
          })

          it('does not display a message stating that no new labels can be created', () => {
            cy.get('[data-test=no-more-labels-in-matter]').should('not.exist')
          })

          describe('When adding a new hashtag to a task', () => {
            before(() => {
              cy.get('[data-test=label-search-field]')
                .find('input')
                .type('Monkey')
              cy.get('[data-test=add-user-defined-label-button]').click()
            })

            it('should add the label to the task', () => {
              cy.get('[data-test=label-chip-text]').should('have.length', 1)
            })
          })
        })
      })
    })
  })
})
