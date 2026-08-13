import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { updateTask } from '../../../../../helpers/matterprojects/task_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import { addBlocked, addBlocker } from './task_blocker_helpers'

describe('task_blockers_restrictions.cy', () => {
  let teamMember, nonTeamMember, matterAdmin, fixture, viewer
  before(() => {
    createUser().then(createdUser => {
      nonTeamMember = createdUser
      createUser().then(createdUser => {
        teamMember = createdUser
        createUser().then(createdUser => {
          matterAdmin = createdUser
          const seed = {
            matter: {
              teamMembers: [teamMember],
              matterAdmins: [matterAdmin],
              projects: [
                {
                  name: 'Project 1',
                  tasks: [
                    { name: 'Task' },
                    {
                      name: 'Task 2',
                    },
                    {
                      name: 'Task 3',
                      properties: { status: 'task-not-required' },
                    },
                    { name: 'Task 4', properties: { status: 'done' } },
                  ],
                },
                {
                  name: 'Project 2',
                  tasks: [{ name: 'Other project task' }],
                },
                {
                  name: 'Project 3',
                  tasks: [
                    {
                      name: 'A',
                      tasks: [{ name: 'B', tasks: [{ name: 'C' }] }],
                    },
                    { name: 'A2' },
                  ],
                },
                {
                  name: 'Project 4',
                  tasks: [
                    { name: '0' },
                    {
                      name: '1',
                      tasks: [
                        { name: '1' },
                        { name: '1' },
                        { name: '1' },
                        { name: '1' },
                        { name: '1' },
                      ],
                    },
                    {
                      name: '1',
                      tasks: [
                        { name: '1' },
                        { name: '1' },
                        { name: '1' },
                        { name: '1' },
                        { name: '1' },
                      ],
                    },
                    {
                      name: '1',
                      tasks: [
                        { name: '1' },
                        { name: '1' },
                        { name: '1' },
                        { name: '1' },
                        { name: '1' },
                      ],
                    },
                    {
                      name: '1',
                      tasks: [
                        { name: '1' },
                        { name: '1' },
                        { name: '1' },
                        { name: '1' },
                        { name: '1' },
                      ],
                    },
                    {
                      name: '1',
                      tasks: [
                        { name: '1' },
                        { name: '1' },
                        { name: '1' },
                        { name: '1' },
                        { name: '1' },
                      ],
                    },
                    {
                      name: '1',
                      tasks: [
                        { name: '1' },
                        { name: '1' },
                        { name: '1' },
                        { name: '1' },
                        { name: '1' },
                      ],
                    },
                  ],
                },
              ],
            },
          }
          fixture = generateFixture(seed)
        })
      })
    })
  })
  describe('when trying to add blocks between workstreams', () => {
    it('should not allow this', () => {
      cy.login(teamMember.username).then(() =>
        addBlocked(
          fixture.tasks[0].id,
          fixture.tasks[4].id,
          fixture.projects[0].id,
          fixture.matter.id
        ).then(res => {
          expect(res.status).to.eq(400)
        })
      )
    })
    it('should not allow this', () => {
      cy.login(teamMember.username).then(() =>
        addBlocker(
          fixture.tasks[0].id,
          fixture.tasks[4].id,
          fixture.projects[0].id,
          fixture.matter.id
        ).then(res => {
          expect(res.status).to.eq(400)
        })
      )
    })
  })
  describe('when trying to make a circular block', () => {
    before(() => {
      cy.login(teamMember.username)
      addBlocked(
        fixture.tasks[0].id,
        fixture.tasks[1].id,
        fixture.projects[0].id,
        fixture.matter.id
      ).then(res => {
        expect(res.status).to.eq(201)
      })
    })
    it('should not allow this', () => {
      cy.login(teamMember.username).then(() =>
        addBlocked(
          fixture.tasks[1].id,
          fixture.tasks[0].id,
          fixture.projects[0].id,
          fixture.matter.id
        ).then(res => {
          expect(res.status).to.eq(400)
        })
      )
    })
  })
  describe('when trying to block an not-required task', () => {
    it('should not allow this', () => {
      cy.login(teamMember.username).then(() =>
        addBlocked(
          fixture.tasks[0].id,
          fixture.tasks[2].id,
          fixture.projects[0].id,
          fixture.matter.id
        ).then(res => {
          expect(res.status).to.eq(400)
        })
      )
    })
  })
  describe('when trying to block an done task', () => {
    it('should not allow this', () => {
      cy.login(teamMember.username).then(() =>
        addBlocked(
          fixture.tasks[0].id,
          fixture.tasks[3].id,
          fixture.projects[0].id,
          fixture.matter.id
        ).then(res => {
          expect(res.status).to.eq(400)
        })
      )
    })
  })
  describe('when trying to block an archived task', () => {
    before(() => {
      cy.login(teamMember.username)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/task/${
          fixture.tasks[3].id
        }/archive`,
        method: 'POST',
        body: {},
      }).then(res => {
        expect(res.status).to.eq(200)
      })
    })
    it('should not allow this', () => {
      cy.login(teamMember.username).then(() =>
        addBlocked(
          fixture.tasks[0].id,
          fixture.tasks[3].id,
          fixture.projects[0].id,
          fixture.matter.id
        ).then(res => {
          expect(res.status).to.eq(400)
        })
      )
    })
  })

  describe('when trying to block up the tree', () => {
    it('should not allow this', () => {
      cy.login(teamMember.username).then(() =>
        addBlocked(
          fixture.tasks[6].id,
          fixture.tasks[5].id,
          fixture.projects[2].id,
          fixture.matter.id
        ).then(res => {
          expect(res.status).to.eq(400)
        })
      )
    })
  })
  describe('when trying to block down the tree', () => {
    it('should not allow this', () => {
      cy.login(teamMember.username).then(() =>
        addBlocked(
          fixture.tasks[6].id,
          fixture.tasks[7].id,
          fixture.projects[2].id,
          fixture.matter.id
        ).then(res => {
          expect(res.status).to.eq(400)
        })
      )
    })
  })
  describe('when trying to block between trees', () => {
    it('should not allow this', () => {
      cy.login(teamMember.username).then(() =>
        addBlocked(
          fixture.tasks[6].id,
          fixture.tasks[8].id,
          fixture.projects[2].id,
          fixture.matter.id
        ).then(res => {
          expect(res.status).to.eq(201)
        })
      )
    })
  })
  describe('when trying to block between trees', () => {
    it('should not allow this', () => {
      cy.login(teamMember.username).then(() =>
        addBlocked(
          fixture.tasks[5].id,
          fixture.tasks[8].id,
          fixture.projects[2].id,
          fixture.matter.id
        ).then(res => {
          expect(res.status).to.eq(201)
        })
      )
    })
  })

  function addAtIndex(i) {
    addBlocked(
      fixture.tasks[9].id,
      fixture.tasks[i].id,
      fixture.projects[3].id,
      fixture.matter.id
    ).then(res => {
      expect(res.status).to.eq(201)
    })
  }
  describe('when the 20 limit has been reached', () => {
    before(() => {
      cy.login(teamMember.username)
      for (i = 10; i < 30; i++) {
        addAtIndex(i)
      }
    })
    it('should not allow the 21st block', () => {
      cy.login(teamMember.username).then(() =>
        addBlocked(
          fixture.tasks[9].id,
          fixture.tasks[31].id,
          fixture.projects[3].id,
          fixture.matter.id
        ).then(res => {
          expect(res.status).to.eq(400)
        })
      )
    })
  })
  describe('when the trying to block an in progress task', () => {
    before(() => {
      cy.login(teamMember.username)
      updateTask(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[1].id,
        {
          status: 'in-progress',
        }
      )
    })
    it('should not allow this', () => {
      cy.login(teamMember.username).then(() =>
        addBlocked(
          fixture.tasks[0].id,
          fixture.tasks[1].id,
          fixture.projects[0].id,
          fixture.matter.id
        ).then(res => {
          expect(res.status).to.eq(400)
        })
      )
    })
  })
})
