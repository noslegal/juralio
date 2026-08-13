import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import {
  addBlocked,
  addBlocker,
  deleteBlocker,
  getBlockers,
} from './task_blocker_helpers'

describe('task_blockers_crud_api.cy', () => {
  let teamMember, nonTeamMember, fixture
  before(() => {
    createUser().then(createdUser => {
      nonTeamMember = createdUser

      createUser()
        .then(createdUser => {
          teamMember = createdUser
        })
        .then(() => {
          const seed = {
            matter: {
              teamMembers: [teamMember],
              matterAdmins: [teamMember],
              projects: [
                {
                  name: 'Project 1',
                  tasks: [
                    { name: 'Task' },
                    { name: 'Task 2' },
                    { name: 'Task 3' },
                    { name: 'Task 4' },
                  ],
                },
              ],
            },
          }
          fixture = generateFixture(seed)
        })
    })
  })
  describe('when adding a block', () => {
    before(() => {
      cy.login(teamMember.username)
    })
    it('should add the block', () => {
      addBlocker(
        fixture.tasks[0].id,
        fixture.tasks[1].id,
        fixture.projects[0].id,
        fixture.matter.id
      ).then(res => {
        expect(res.status).to.eq(201)
      })
    })
  })
  describe('when adding a second block', () => {
    before(() => {
      cy.login(teamMember.username)
    })
    it('should add the block', () => {
      addBlocker(
        fixture.tasks[0].id,
        fixture.tasks[2].id,
        fixture.projects[0].id,
        fixture.matter.id
      ).then(res => {
        expect(res.status).to.eq(201)
      })
    })
  })
  describe('when adding a blocker', () => {
    before(() => {
      cy.login(teamMember.username)
    })
    it('should add the block', () => {
      addBlocked(
        fixture.tasks[0].id,
        fixture.tasks[3].id,
        fixture.projects[0].id,
        fixture.matter.id
      ).then(res => {
        expect(res.status).to.eq(201)
      })
    })
  })
  describe('when getting the blocks for a task with only blocks', () => {
    before(() => {
      cy.login(teamMember.username)
    })
    it('should show the blocks and blockers', () => {
      getBlockers(
        fixture.tasks[1].id,
        fixture.projects[0].id,
        fixture.matter.id
      ).then(res => {
        expect(res.status).to.eq(200)
        expect(res.body.length).to.eq(1)
      })
    })
  })
  describe('when getting the blocks for a task with blocks and blockers', () => {
    before(() => {
      cy.login(teamMember.username)
    })
    it('should show the blocks and blockers', () => {
      getBlockers(
        fixture.tasks[0].id,
        fixture.projects[0].id,
        fixture.matter.id
      ).then(res => {
        expect(res.status).to.eq(200)
        expect(res.body.length).to.eq(3)
      })
    })
  })
  describe('when deleting a block', () => {
    before(() => {
      cy.login(teamMember.username)
    })
    it('should delete the blocker', () => {
      deleteBlocker(
        fixture.tasks[0].id,
        fixture.tasks[3].id,
        fixture.projects[0].id,
        fixture.matter.id
      ).then(res => {
        expect(res.status).to.eq(200)
      })
    })
  })
  describe('when getting the blocks after a delete', () => {
    before(() => {
      cy.login(teamMember.username)
    })
    it('should show the blocks and blockers without the deleted blocker', () => {
      getBlockers(
        fixture.tasks[0].id,
        fixture.projects[0].id,
        fixture.matter.id
      ).then(res => {
        expect(res.status).to.eq(200)
        expect(res.body.length).to.eq(2)
      })
    })
  })
  describe('when deleting a block that doesnt exist', () => {
    before(() => {
      cy.login(teamMember.username)
    })
    it('should delete the blocker', () => {
      deleteBlocker(
        fixture.tasks[0].id,
        fixture.tasks[3].id,
        fixture.projects[0].id,
        fixture.matter.id
      ).then(res => {
        expect(res.status).to.eq(400)
      })
    })
  })
  describe('when adding a blocked to a task that doesnt exist', () => {
    before(() => {
      cy.login(teamMember.username)
    })
    it('should not add the block', () => {
      addBlocked(
        fixture.tasks[0].id,
        -1,
        fixture.projects[0].id,
        fixture.matter.id
      ).then(res => {
        expect(res.status).to.eq(400)
      })
    })
  })
  describe('when adding a blocker task that doesnt exist', () => {
    before(() => {
      cy.login(teamMember.username)
    })
    it('should not add the block', () => {
      addBlocker(
        fixture.tasks[0].id,
        -1,
        fixture.projects[0].id,
        fixture.matter.id
      ).then(res => {
        expect(res.status).to.eq(400)
      })
    })
  })
  describe('when getting the blocks for a taskthat doesnt exist', () => {
    before(() => {
      cy.login(teamMember.username)
    })
    it('should show the blocks and blockers', () => {
      getBlockers(-1, fixture.projects[0].id, fixture.matter.id).then(res => {
        expect(res.status).to.eq(403)
      })
    })
  })
})
