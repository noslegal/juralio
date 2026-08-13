import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { createUser } from '../../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

describe('project_overview_people_active_counts.cy', () => {
  let testUser, fixture, matter, project, project2
  let user1, user2, user3, user4, user5, user6, user7, user8, user9

  before(() => {
    const createUser1 = () =>
      createUser('MMM').then(createdUser => (user1 = createdUser))

    const createUser2 = () =>
      createUser('CUSER2').then(createdUser => (user2 = createdUser))

    const createUser3 = () =>
      createUser('BUSER3').then(createdUser => (user3 = createdUser))

    const createUser4 = () =>
      createUser('AUSER4').then(createdUser => (user4 = createdUser))

    const createUser5 = () =>
      createUser('USER5').then(createdUser => (user5 = createdUser))

    const createUser6 = () =>
      createUser('USER6').then(createdUser => (user6 = createdUser))

    const createUser7 = () =>
      createUser('USER7').then(createdUser => (user7 = createdUser))

    const createUser8 = () =>
      createUser('USER8').then(createdUser => (user8 = createdUser))

    const createUser9 = () =>
      createUser('USER9').then(createdUser => (user9 = createdUser))

    createUser1()
      .then(createUser2)
      .then(createUser3)
      .then(createUser4)
      .then(createUser5)
      .then(createUser6)
      .then(createUser7)
      .then(createUser8)
      .then(createUser9)
    createUser('ZZZ')
      .then(createdUser => {
        testUser = createdUser
        const seed = {
          matter: {
            teamMembers: [
              testUser,
              user1,
              user2,
              user3,
              user4,
              user5,
              user6,
              user7,
            ],
            matterAdmins: [testUser],
            matterViewer: [user8, user9],
            projects: [
              {
                name: 'Overview Spec with Tasks',
                tasks: [
                  { name: 'Task1', teamMembers: [testUser, user2, user3] },
                ],
              },
              {
                name: 'Overview Spec without Tasks',
                tasks: [
                  {
                    name: 'Task1',
                    teamMembers: [testUser, user2, user3, user4, user5, user6],
                    properties: { status: 'in-progress' },
                  },
                  {
                    name: 'Task2',
                    teamMembers: [testUser, user2, user3, user5, user6, user8],
                    properties: { status: 'in-progress' },
                  },
                  {
                    name: 'Task3',
                    teamMembers: [testUser, user2, user3, user4],
                    properties: { status: 'in-progress' },
                  },
                  {
                    name: 'Task4',
                    teamMembers: [
                      testUser,
                      user2,
                      user3,
                      user4,
                      user5,
                      user6,
                      user7,
                      user8,
                      user9,
                    ],
                  },

                  {
                    name: 'Task5',
                    teamMembers: [
                      testUser,
                      user2,
                      user3,
                      user4,
                      user5,
                      user6,
                      user7,
                      user8,
                    ],
                    properties: { status: 'done' },
                  },
                ],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
      .then(() => {
        matter = fixture.matter
        project = fixture.projects[0]
        project2 = fixture.projects[1]
      })
  })

  describe('When navigating to project overview with 3 task team members and 6 matter members', () => {
    before(() => {
      cy.login(testUser.username)
      visitHelpers.visitProjectOverview(matter.id, project.id)
      cy.wait(1000)
    })

    it('should show the people header and the correct number of people', () => {
      cy.get('[data-test=peopleTab]').should('be.visible')
      cy.get('[data-test=people-menu-item] [data-test=avatar-group]')
        .children()
        .should('have.length', 3)
    })

    describe('When clicking on the people table', () => {
      before(() => {
        cy.get('[data-test=peopleTab]').click()
      })

      it('should show the people table and team members assigned to tasks', () => {
        cy.get('[data-test=projectPeopleTable]').should('be.visible')
        cy.get('[data-test=people-menu-item]')
          .get('[data-test=user-name-text]')
          .should('have.length', 3)
      })
    })
  })

  describe('When navigating to project overview with more task team members', () => {
    before(() => {
      cy.login(testUser.username)
      visitHelpers.visitProjectOverview(matter.id, project2.id)
      cy.wait(1000)
    })

    it('should show the people header and user list', () => {
      cy.get('[data-test=peopleTab]', { timeout: 10000 }).should('be.visible')
      cy.get('[data-test=people-menu-item] [data-test=avatar-group]')
        .eq(0)
        .children()
        .should('have.length', 8)
    })

    describe('When clicking on the people table', () => {
      before(() => {
        cy.get('[data-test=peopleTab]').click()
      })

      it('should show the people with table team members assigned to tasks', () => {
        cy.get('[data-test=projectPeopleTable]').should('be.visible')
        cy.get('[data-test=user-name-text]').should('have.length', 9)
        cy.get('[data-test=active-task-count]').should('have.length', 9)
        cy.get('[role="columnheader"][data-field="taskCount"]').click()
        cy.get('[role="columnheader"][data-field="taskCount"]').click()
      })

      it('should show the expected task counts', () => {
        cy.get('[data-test=active-task-count]').eq(0).should('have.text', '3')
        cy.get('[data-test=active-task-count]').eq(1).should('have.text', '3')
        cy.get('[data-test=active-task-count]').eq(2).should('have.text', '3')
        cy.get('[data-test=active-task-count]').eq(3).should('have.text', '2')
        cy.get('[data-test=active-task-count]').eq(4).should('have.text', '2')
        cy.get('[data-test=active-task-count]').eq(5).should('have.text', '2')
        cy.get('[data-test=active-task-count]').eq(6).should('have.text', '1')
        cy.get('[data-test=active-task-count]').eq(7).should('have.text', '0')
      })

      it('should show the expected usernames in the right names', () => {
        // Sort by the name column, ascending.
        cy.get('[role="columnheader"][data-field="displayName"]').click()
        cy.get('[data-test=user-name-text]')
          .eq(0)
          .should('contains.text', 'AUSER')
        cy.get('[data-test=user-name-text]')
          .eq(1)
          .should('contains.text', 'BUSER')
        cy.get('[data-test=user-name-text]')
          .eq(2)
          .should('contains.text', 'CUSER')
        cy.get('[data-test=user-name-text]')
          .eq(3)
          .should('contains.text', 'USER5')
        cy.get('[data-test=user-name-text]')
          .eq(4)
          .should('contains.text', 'USER6')
        cy.get('[data-test=user-name-text]')
          .eq(5)
          .should('contains.text', 'USER7')
        cy.get('[data-test=user-name-text]')
          .eq(6)
          .should('contains.text', 'USER8')
        cy.get('[data-test=user-name-text]')
          .eq(7)
          .should('contains.text', 'USER9')
        cy.get('[data-test=user-name-text]')
          .eq(8)
          .should('contains.text', 'You')
      })

      it('should show the correct roles in the table', () => {
        cy.get('[data-rowindex=0] [data-field=matterRolesDisplay]').should(
          'contain.text',
          'Editor'
        )
        cy.get('[data-rowindex=1] [data-field=matterRolesDisplay]').should(
          'contain.text',
          'Editor'
        )
        cy.get('[data-rowindex=2] [data-field=matterRolesDisplay]').should(
          'contain.text',
          'Editor'
        )
        cy.get('[data-rowindex=3] [data-field=matterRolesDisplay]').should(
          'contain.text',
          'Editor'
        )
        cy.get('[data-rowindex=4] [data-field=matterRolesDisplay]').should(
          'contain.text',
          'Editor'
        )
        cy.get('[data-rowindex=5] [data-field=matterRolesDisplay]').should(
          'contain.text',
          'Editor'
        )
        cy.get('[data-rowindex=6] [data-field=matterRolesDisplay]').should(
          'contain.text',
          'Viewer'
        )
        cy.get('[data-rowindex=7] [data-field=matterRolesDisplay]').should(
          'contain.text',
          'Viewer'
        )
        cy.get('[data-rowindex=8] [data-field=matterRolesDisplay]').should(
          'contain.text',
          'Admin, Editor'
        )
      })
    })
    describe('when visiting the overview tasks url', () => {
      before(() => {
        cy.login(testUser.username)
        visitHelpers.visitProjectOverviewPeople(matter.id, project.id)
      })
      it('should show the people header and user list', () => {
        cy.get('[data-test=peopleTab]', { timeout: 10000 }).should('be.visible')
        cy.get('[data-test=people-menu-item] [data-test=avatar-group]')
          .eq(0)
          .children()
          .should('have.length', 3)
      })
    })
  })
})
