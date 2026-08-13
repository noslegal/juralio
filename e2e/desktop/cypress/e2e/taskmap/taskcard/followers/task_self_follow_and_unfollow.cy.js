import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'
import taskdetailPage from '../../../../../../page/taskdetail/taskdetail_page'

describe('task_self_follow_and_unfollow.cy', () => {
  let user1, user2, fixture, appPage

  before(() => {
    const createUser1 = () => {
      return createUser().then(createdUser => (user1 = createdUser))
    }

    const createUser2 = () => {
      return createUser().then(createdUser => (user2 = createdUser))
    }

    createUser1()
      .then(createUser2)
      .then(() => {
        const seed = {
          matter: {
            prefix: 'tfDisplaySpec',
            teamMembers: [user1, user2],
            matterAdmins: [user1],
            projects: [
              {
                name: 'Test Project',
                tasks: [{ name: 'Transfer Documents', teamMembers: [user1] }],
              },
            ],
          },
        }

        fixture = generateFixture(seed)
        appPage = getWrapper(fixture)
      })
  })

  describe('When visiting a task as neither TM or TF', () => {
    before(() => {
      cy.login(user2.username)
      appPage.visitTaskByName('Transfer Documents')
      cy.get('[data-test=avatar-group]').click()
      cy.get('[data-test=delete-icon]').first().click({ force: true })
    })

    it('Followers button should have the text "Follow this task"', () => {
      taskdetailPage.people.followers.get
        .button()
        .should('have.text', 'Follow this task')
    })

    describe('When the follow button is clicked', () => {
      before(() => {
        cy.backendRoute('POST', '/matter/*/workstreams/*/task/*/followers').as(
          'postFollower'
        )
        taskdetailPage.people.followers.get.button().click()
        cy.wait('@postFollower')
      })

      it('Follow button should have the text "Following"', () => {
        taskdetailPage.people.followers.get
          .button()
          .should('have.text', 'Stop following')
      })
      describe('When the page is loaded again', () => {
        before(() => {
          cy.login(user2.username)
          cy.reload()
        })

        it('Follow button should have the text "Following"', () => {
          taskdetailPage.people.followers.get
            .button()
            .should('have.text', 'Stop following')
        })

        describe('When the follow button is clicked again', () => {
          before(() => {
            taskdetailPage.people.followers.get.button().click()
          })

          it('Followers button should have the text "Follow this task"', () => {
            taskdetailPage.people.followers.get
              .button()
              .should('have.text', 'Follow this task')
          })
        })
      })
    })
  })

  describe('When visiting a task as a TM', () => {
    before(() => {
      cy.login(user1.username)
      appPage.visitTaskByName('Transfer Documents')
      cy.get('[data-test=add-team-member-button]').click()
      cy.get('[data-test=autocomplete-search]')
        .find('input')
        .type(`${user1.firstname}{enter}`)
      cy.wait(1000)
    })

    it('Followers button should not be visible', () => {
      taskdetailPage.people.followers.get.button().should('not.be.visible')
    })
  })
})
