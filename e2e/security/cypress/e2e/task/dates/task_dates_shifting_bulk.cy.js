import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import {
  getTask,
  setPlannedEndDateForTask,
  setPlannedStartDateForTask,
  bulkShift,
} from './task-date-helpers'
import HttpStatus from 'http-status-codes'

describe('task_dates_shifting', () => {
  let user, fixture
  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Project 1',
              tasks: [
                { name: 'Level A' },
                { name: 'Other level A', tasks: [{ name: 'level B' }] },
                {
                  name: 'Other level A',
                  tasks: [{ name: 'level B', tasks: [{ name: 'level C' }] }],
                },
                { name: 'IP', properties: { status: 'in-progress' } },
              ],
            },
          ],
        },
      }
      fixture = generateFixture(seed)
    })
  })
  describe('when shifting level A', () => {
    before(() => {
      cy.login(user)
      setPlannedStartDateForTask(
        new Date(2000, 4, 20).toISOString(),
        fixture.tasks[0].id,
        fixture.projects[0].id,
        fixture.matter.id
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedStartDateForTask(
        new Date(2000, 4, 20).toISOString(),
        fixture.tasks[1].id,
        fixture.projects[0].id,
        fixture.matter.id
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
    })
    it('should shift the date forward', () => {
      cy.login(user)
      bulkShift(fixture.matter.id, fixture.projects[0].id, {
        directionInTime: 'forward',
        amount: 1,
        includeSubtasks: true,
        tasks: [fixture.tasks[0].id, fixture.tasks[1].id],
      }).then(res => {
        expect(res.status).to.eq(200)
        getTask(
          fixture.tasks[0].id,
          fixture.projects[0].id,
          fixture.matter.id
        ).then(taskRes => {
          expect(taskRes.body.plannedStartDate).to.eq(
            new Date(2000, 4, 21).toISOString().replace('00.000Z', '00Z')
          )
        })
        getTask(
          fixture.tasks[1].id,
          fixture.projects[0].id,
          fixture.matter.id
        ).then(taskRes => {
          expect(taskRes.body.plannedStartDate).to.eq(
            new Date(2000, 4, 21).toISOString().replace('00.000Z', '00Z')
          )
        })
      })
    })
    it('should shift the date backward', () => {
      cy.login(user)
      bulkShift(
        fixture.matter.id,
        fixture.projects[0].id,

        {
          directionInTime: 'backward',
          amount: 1,
          includeSubtasks: true,
          tasks: [fixture.tasks[0].id, fixture.tasks[1].id],
        }
      ).then(res => {
        expect(res.status).to.eq(200)
        getTask(
          fixture.tasks[0].id,
          fixture.projects[0].id,
          fixture.matter.id
        ).then(taskRes => {
          expect(taskRes.body.plannedStartDate).to.eq(
            new Date(2000, 4, 20).toISOString().replace('00.000Z', '00Z')
          )
        })
        getTask(
          fixture.tasks[1].id,
          fixture.projects[0].id,
          fixture.matter.id
        ).then(taskRes => {
          expect(taskRes.body.plannedStartDate).to.eq(
            new Date(2000, 4, 20).toISOString().replace('00.000Z', '00Z')
          )
        })
      })
    })
  })
  describe('when shifting level A with both dates', () => {
    before(() => {
      cy.login(user)
      setPlannedEndDateForTask(
        new Date(2000, 4, 21).toISOString(),
        fixture.tasks[0].id,
        fixture.projects[0].id,
        fixture.matter.id
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2000, 4, 21).toISOString(),
        fixture.tasks[1].id,
        fixture.projects[0].id,
        fixture.matter.id
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
    })
    it('should shift the date forward', () => {
      cy.login(user)
      bulkShift(
        fixture.matter.id,
        fixture.projects[0].id,

        {
          directionInTime: 'forward',
          amount: 1,
          includeSubtasks: true,
          tasks: [fixture.tasks[0].id, fixture.tasks[1].id],
        }
      ).then(res => {
        expect(res.status).to.eq(200)
        getTask(
          fixture.tasks[0].id,
          fixture.projects[0].id,
          fixture.matter.id
        ).then(taskRes => {
          expect(taskRes.body.plannedStartDate).to.eq(
            new Date(2000, 4, 21).toISOString().replace('00.000Z', '00Z')
          )
          expect(taskRes.body.plannedEndDate).to.eq(
            new Date(2000, 4, 22).toISOString().replace('00.000Z', '00Z')
          )
        })
        getTask(
          fixture.tasks[1].id,
          fixture.projects[0].id,
          fixture.matter.id
        ).then(taskRes => {
          expect(taskRes.body.plannedStartDate).to.eq(
            new Date(2000, 4, 21).toISOString().replace('00.000Z', '00Z')
          )
          expect(taskRes.body.plannedEndDate).to.eq(
            new Date(2000, 4, 22).toISOString().replace('00.000Z', '00Z')
          )
        })
      })
    })
    it('should shift the date backward', () => {
      cy.login(user)
      bulkShift(fixture.matter.id, fixture.projects[0].id, {
        directionInTime: 'backward',
        amount: 1,
        includeSubtasks: true,
        tasks: [fixture.tasks[0].id, fixture.tasks[1].id],
      }).then(res => {
        expect(res.status).to.eq(200)
        getTask(
          fixture.tasks[0].id,
          fixture.projects[0].id,
          fixture.matter.id
        ).then(taskRes => {
          expect(taskRes.body.plannedStartDate).to.eq(
            new Date(2000, 4, 20).toISOString().replace('00.000Z', '00Z')
          )
          expect(taskRes.body.plannedEndDate).to.eq(
            new Date(2000, 4, 21).toISOString().replace('00.000Z', '00Z')
          )
        })
        getTask(
          fixture.tasks[1].id,
          fixture.projects[0].id,
          fixture.matter.id
        ).then(taskRes => {
          expect(taskRes.body.plannedStartDate).to.eq(
            new Date(2000, 4, 20).toISOString().replace('00.000Z', '00Z')
          )
          expect(taskRes.body.plannedEndDate).to.eq(
            new Date(2000, 4, 21).toISOString().replace('00.000Z', '00Z')
          )
        })
      })
    })
  })
  describe('when shifting level A with subtasks', () => {
    before(() => {
      cy.login(user)
      setPlannedStartDateForTask(
        new Date(2000, 4, 20).toISOString(),
        fixture.tasks[1].id,
        fixture.projects[0].id,
        fixture.matter.id
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
        setPlannedStartDateForTask(
          new Date(2000, 4, 21).toISOString(),
          fixture.tasks[2].id,
          fixture.projects[0].id,
          fixture.matter.id
        ).then(res => {
          expect(res.status).to.eq(HttpStatus.OK)
        })
      })
    })
    it('should shift the date forward', () => {
      cy.login(user)
      bulkShift(
        fixture.matter.id,
        fixture.projects[0].id,

        {
          directionInTime: 'forward',
          amount: 1,
          includeSubtasks: true,
          tasks: [fixture.tasks[1].id],
        }
      ).then(res => {
        expect(res.status).to.eq(200)
        getTask(
          fixture.tasks[1].id,
          fixture.projects[0].id,
          fixture.matter.id
        ).then(taskRes => {
          expect(taskRes.body.plannedStartDate).to.eq(
            new Date(2000, 4, 21).toISOString().replace('00.000Z', '00Z')
          )
          getTask(
            fixture.tasks[2].id,
            fixture.projects[0].id,
            fixture.matter.id
          ).then(taskRes => {
            expect(taskRes.body.plannedStartDate).to.eq(
              new Date(2000, 4, 22).toISOString().replace('00.000Z', '00Z')
            )
          })
        })
      })
    })
    it('should shift the date backward', () => {
      cy.login(user)
      bulkShift(fixture.matter.id, fixture.projects[0].id, {
        directionInTime: 'backward',
        amount: 1,
        includeSubtasks: true,
        tasks: [fixture.tasks[1].id],
      }).then(res => {
        expect(res.status).to.eq(200)
        getTask(
          fixture.tasks[1].id,
          fixture.projects[0].id,
          fixture.matter.id
        ).then(taskRes => {
          expect(taskRes.body.plannedStartDate).to.eq(
            new Date(2000, 4, 20).toISOString().replace('00.000Z', '00Z')
          )
          getTask(
            fixture.tasks[2].id,
            fixture.projects[0].id,
            fixture.matter.id
          ).then(taskRes => {
            expect(taskRes.body.plannedStartDate).to.eq(
              new Date(2000, 4, 21).toISOString().replace('00.000Z', '00Z')
            )
          })
        })
      })
    })
  })
  describe('when shifting level A with a subtask with both dates', () => {
    before(() => {
      cy.login(user)
      setPlannedEndDateForTask(
        new Date(2000, 4, 23).toISOString(),
        fixture.tasks[1].id,
        fixture.projects[0].id,
        fixture.matter.id
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
        setPlannedEndDateForTask(
          new Date(2000, 4, 22).toISOString(),
          fixture.tasks[2].id,
          fixture.projects[0].id,
          fixture.matter.id
        ).then(res => {
          expect(res.status).to.eq(HttpStatus.OK)
        })
      })
    })
    it('should shift the date forward', () => {
      cy.login(user)
      bulkShift(fixture.matter.id, fixture.projects[0].id, {
        directionInTime: 'forward',
        amount: 1,
        includeSubtasks: true,
        tasks: [fixture.tasks[1].id],
      }).then(res => {
        expect(res.status).to.eq(200)
        getTask(
          fixture.tasks[1].id,
          fixture.projects[0].id,
          fixture.matter.id
        ).then(taskRes => {
          expect(taskRes.body.plannedStartDate).to.eq(
            new Date(2000, 4, 21).toISOString().replace('00.000Z', '00Z')
          )
          expect(taskRes.body.plannedEndDate).to.eq(
            new Date(2000, 4, 24).toISOString().replace('00.000Z', '00Z')
          )
          getTask(
            fixture.tasks[2].id,
            fixture.projects[0].id,
            fixture.matter.id
          ).then(taskRes => {
            expect(taskRes.body.plannedStartDate).to.eq(
              new Date(2000, 4, 22).toISOString().replace('00.000Z', '00Z')
            )
            expect(taskRes.body.plannedEndDate).to.eq(
              new Date(2000, 4, 23).toISOString().replace('00.000Z', '00Z')
            )
          })
        })
      })
    })
    it('should shift the date backward', () => {
      cy.login(user)
      bulkShift(fixture.matter.id, fixture.projects[0].id, {
        directionInTime: 'backward',
        amount: 1,
        includeSubtasks: true,
        tasks: [fixture.tasks[1].id],
      }).then(res => {
        expect(res.status).to.eq(200)
        getTask(
          fixture.tasks[1].id,
          fixture.projects[0].id,
          fixture.matter.id
        ).then(taskRes => {
          expect(taskRes.body.plannedStartDate).to.eq(
            new Date(2000, 4, 20).toISOString().replace('00.000Z', '00Z')
          )
          expect(taskRes.body.plannedEndDate).to.eq(
            new Date(2000, 4, 23).toISOString().replace('00.000Z', '00Z')
          )
          getTask(
            fixture.tasks[2].id,
            fixture.projects[0].id,
            fixture.matter.id
          ).then(taskRes => {
            expect(taskRes.body.plannedStartDate).to.eq(
              new Date(2000, 4, 21).toISOString().replace('00.000Z', '00Z')
            )
            expect(taskRes.body.plannedEndDate).to.eq(
              new Date(2000, 4, 22).toISOString().replace('00.000Z', '00Z')
            )
          })
        })
      })
    })
  })
  describe('when shifting level B', () => {
    before(() => {
      cy.login(user)
      setPlannedStartDateForTask(
        new Date(2000, 4, 20).toISOString(),
        fixture.tasks[3].id,
        fixture.projects[0].id,
        fixture.matter.id
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
        setPlannedEndDateForTask(
          new Date(2000, 4, 30).toISOString(),
          fixture.tasks[3].id,
          fixture.projects[0].id,
          fixture.matter.id
        ).then(res => {
          expect(res.status).to.eq(HttpStatus.OK)
          setPlannedStartDateForTask(
            new Date(2000, 4, 23).toISOString(),
            fixture.tasks[4].id,
            fixture.projects[0].id,
            fixture.matter.id
          ).then(res => {
            expect(res.status).to.eq(HttpStatus.OK)
          })
        })
      })
    })
    it('should shift the date forward', () => {
      cy.login(user)
      bulkShift(
        fixture.matter.id,
        fixture.projects[0].id,

        {
          directionInTime: 'forward',
          amount: 1,
          includeSubtasks: true,
          tasks: [fixture.tasks[4].id],
        }
      ).then(res => {
        expect(res.status).to.eq(200)
        getTask(
          fixture.tasks[4].id,
          fixture.projects[0].id,
          fixture.matter.id
        ).then(taskRes => {
          expect(taskRes.body.plannedStartDate).to.eq(
            new Date(2000, 4, 24).toISOString().replace('00.000Z', '00Z')
          )
        })
      })
    })
    it('should shift the date backward', () => {
      cy.login(user)
      bulkShift(fixture.matter.id, fixture.projects[0].id, {
        directionInTime: 'backward',
        amount: 1,
        includeSubtasks: true,
        tasks: [fixture.tasks[4].id],
      }).then(res => {
        expect(res.status).to.eq(200)
        getTask(
          fixture.tasks[4].id,
          fixture.projects[0].id,
          fixture.matter.id
        ).then(taskRes => {
          expect(taskRes.body.plannedStartDate).to.eq(
            new Date(2000, 4, 23).toISOString().replace('00.000Z', '00Z')
          )
        })
      })
    })
  })
  describe('when shifting level B to burst parent', () => {
    it('should not shift the date forward', () => {
      cy.login(user)
      bulkShift(fixture.matter.id, fixture.projects[0].id, {
        directionInTime: 'forward',
        amount: 100,
        includeSubtasks: true,
        tasks: [fixture.tasks[4].id],
      }).then(res => {
        expect(res.status).to.eq(400)
      })
    })
    it('should not shift the date backward', () => {
      cy.login(user)
      bulkShift(fixture.matter.id, fixture.projects[0].id, {
        directionInTime: 'backward',
        amount: 100,
        includeSubtasks: true,
        tasks: [fixture.tasks[4].id],
      }).then(res => {
        expect(res.status).to.eq(400)
      })
    })
  })
  describe('cant shift a non ns date', () => {
    it('should not shift the date', () => {
      cy.login(user)
      bulkShift(fixture.matter.id, fixture.projects[0].id, {
        directionInTime: 'forward',
        amount: 100,
        includeSubtasks: true,
        tasks: [fixture.tasks[6].id],
      }).then(res => {
        expect(res.status).to.eq(400)
      })
    })
  })
})
