import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { addMatterViewer } from '../../../../../helpers/matterprojects/matter_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import {
  addBlocked,
  addBlocker,
  deleteBlocker,
  getBlockers,
} from './task_blocker_helpers'

describe('task_blockers_access.cy', () => {
  let teamMember, nonTeamMember, matterAdmin, fixture, matterViewer
  before(() => {
    createUser().then(createdUser => {
      nonTeamMember = createdUser
      createUser().then(createdUser => {
        teamMember = createdUser
        createUser().then(createdUser => {
          matterAdmin = createdUser
          createUser().then(createdUser => {
            matterViewer = createdUser
            const seed = {
              matter: {
                teamMembers: [teamMember],
                matterAdmins: [matterAdmin],
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
    })
  })

  describe('when accessing as a team member', () => {
    before(() => {
      cy.login(teamMember.username)
    })
    let userType = 'team member'
    let access = {
      add: 201,
      get: 200,
      delete: 200,
    }
    describe(`as a ${userType}`, () => {
      describe('when adding a block', () => {
        before(() => {
          cy.login(teamMember.username)
        })
        it(`should return ${access['add']}`, () => {
          addBlocker(
            fixture.tasks[0].id,
            fixture.tasks[1].id,
            fixture.projects[0].id,
            fixture.matter.id
          ).then(res => {
            expect(res.status).to.eq(access['add'])
          })
        })
        it(`should return ${access['add']}`, () => {
          cy.login(teamMember.username).then(() =>
            addBlocked(
              fixture.tasks[0].id,
              fixture.tasks[2].id,
              fixture.projects[0].id,
              fixture.matter.id
            ).then(res => {
              expect(res.status).to.eq(access['add'])
            })
          )
        })
      })
      describe('when getting the blocks', () => {
        before(() => {
          cy.login(teamMember.username)
        })
        it(`should return ${access['get']}`, () => {
          getBlockers(
            fixture.tasks[0].id,
            fixture.projects[0].id,
            fixture.matter.id
          ).then(res => {
            expect(res.status).to.eq(access['get'])
          })
        })
      })
      describe('when deleting the blocks', () => {
        before(() => {
          cy.login(teamMember.username)
        })
        it(`should return ${access['delete']}`, () => {
          deleteBlocker(
            fixture.tasks[0].id,
            fixture.tasks[1].id,
            fixture.projects[0].id,
            fixture.matter.id
          ).then(res => {
            expect(res.status).to.eq(access['delete'])
          })
        })
      })
    })
  })

  describe('when accessing as a matterAdmin', () => {
    before(() => {
      cy.login(matterAdmin.username)
    })
    let userType = 'matter admin'
    let access = {
      add: 400,
      get: 403,
      delete: 400,
    }
    describe(`as a ${userType}`, () => {
      describe('when adding a block', () => {
        before(() => {
          cy.login(matterAdmin.username)
        })
        it(`should return ${access['add']}`, () => {
          addBlocker(
            fixture.tasks[0].id,
            fixture.tasks[1].id,
            fixture.projects[0].id,
            fixture.matter.id
          ).then(res => {
            expect(res.status).to.eq(access['add'])
          })
        })
        it(`should return ${access['add']}`, () => {
          cy.login(matterAdmin.username).then(() =>
            addBlocked(
              fixture.tasks[0].id,
              fixture.tasks[2].id,
              fixture.projects[0].id,
              fixture.matter.id
            ).then(res => {
              expect(res.status).to.eq(access['add'])
            })
          )
        })
      })
      describe('when getting the blocks', () => {
        before(() => {
          cy.login(matterAdmin.username)
        })
        it(`should return ${access['get']}`, () => {
          getBlockers(
            fixture.tasks[0].id,
            fixture.projects[0].id,
            fixture.matter.id
          ).then(res => {
            expect(res.status).to.eq(access['get'])
          })
        })
      })
      describe('when deleting the blocks', () => {
        before(() => {
          cy.login(matterAdmin.username)
        })
        it(`should return ${access['delete']}`, () => {
          deleteBlocker(
            fixture.tasks[0].id,
            fixture.tasks[1].id,
            fixture.projects[0].id,
            fixture.matter.id
          ).then(res => {
            expect(res.status).to.eq(access['delete'])
          })
        })
      })
    })
  })

  describe('when accessing as a non team member', () => {
    before(() => {
      cy.login(nonTeamMember.username)
    })
    let userType = 'non team member'
    let access = {
      add: 400,
      get: 403,
      delete: 400,
    }
    describe(`as a ${userType}`, () => {
      describe('when adding a block', () => {
        before(() => {
          cy.login(nonTeamMember.username)
        })
        it(`should return ${access['add']}`, () => {
          addBlocker(
            fixture.tasks[0].id,
            fixture.tasks[1].id,
            fixture.projects[0].id,
            fixture.matter.id
          ).then(res => {
            expect(res.status).to.eq(access['add'])
          })
        })
        it(`should return ${access['add']}`, () => {
          cy.login(nonTeamMember.username).then(() =>
            addBlocked(
              fixture.tasks[0].id,
              fixture.tasks[2].id,
              fixture.projects[0].id,
              fixture.matter.id
            ).then(res => {
              expect(res.status).to.eq(access['add'])
            })
          )
        })
      })
      describe('when getting the blocks', () => {
        before(() => {
          cy.login(nonTeamMember.username)
        })
        it(`should return ${access['get']}`, () => {
          getBlockers(
            fixture.tasks[0].id,
            fixture.projects[0].id,
            fixture.matter.id
          ).then(res => {
            expect(res.status).to.eq(access['get'])
          })
        })
      })
      describe('when deleting the blocks', () => {
        before(() => {
          cy.login(nonTeamMember.username)
        })
        it(`should return ${access['delete']}`, () => {
          deleteBlocker(
            fixture.tasks[0].id,
            fixture.tasks[1].id,
            fixture.projects[0].id,
            fixture.matter.id
          ).then(res => {
            expect(res.status).to.eq(access['delete'])
          })
        })
      })
    })
  })

  describe('when accessing as a matter viewer', () => {
    before(() => {
      cy.login(matterAdmin.username)
      addMatterViewer(fixture.matter.id, matterViewer.id, matterAdmin.username)
      cy.login(matterViewer.username)
    })
    let userType = 'matter viewer'
    let access = {
      add: 400,
      get: 200,
      delete: 400,
    }
    describe(`as a ${userType}`, () => {
      describe('when adding a block', () => {
        before(() => {
          cy.login(matterViewer.username)
        })
        it(`should return ${access['add']}`, () => {
          addBlocker(
            fixture.tasks[0].id,
            fixture.tasks[1].id,
            fixture.projects[0].id,
            fixture.matter.id
          ).then(res => {
            expect(res.status).to.eq(access['add'])
          })
        })
        it(`should return ${access['add']}`, () => {
          cy.login(matterViewer.username).then(() =>
            addBlocked(
              fixture.tasks[0].id,
              fixture.tasks[2].id,
              fixture.projects[0].id,
              fixture.matter.id
            ).then(res => {
              expect(res.status).to.eq(access['add'])
            })
          )
        })
      })
      describe('when getting the blocks', () => {
        before(() => {
          cy.login(matterViewer.username)
        })
        it(`should return ${access['get']}`, () => {
          getBlockers(
            fixture.tasks[0].id,
            fixture.projects[0].id,
            fixture.matter.id
          ).then(res => {
            expect(res.status).to.eq(access['get'])
          })
        })
      })
      describe('when deleting the blocks', () => {
        before(() => {
          cy.login(matterViewer.username)
        })
        it(`should return ${access['delete']}`, () => {
          deleteBlocker(
            fixture.tasks[0].id,
            fixture.tasks[1].id,
            fixture.projects[0].id,
            fixture.matter.id
          ).then(res => {
            expect(res.status).to.eq(access['delete'])
          })
        })
      })
    })
  })
})
