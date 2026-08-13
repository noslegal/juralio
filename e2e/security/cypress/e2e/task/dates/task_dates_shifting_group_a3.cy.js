import HttpStatus from 'http-status-codes'
import {
  createSimpleFixture,
  getTask,
  setPlannedEndDateForTask,
  setPlannedStartDateForTask,
  shift,
} from './task-date-helpers'
import dayjs from 'dayjs'

let utc = require('dayjs/plugin/utc')

dayjs.extend(utc)

describe('A2.1', () => {
  let user, fixture, workstreamId, matterId
  before(() => {
    createSimpleFixture([[]]).then(e => {
      user = e.user
      fixture = e.fixture
      workstreamId = fixture.projects[0].id
      matterId = fixture.matter.id
    })
  })
  describe('initial setup ', () => {
    before(() => {
      cy.login(user)
      setPlannedStartDateForTask(
        new Date(2025, 3, 15).toISOString(),
        fixture.tasks[0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 4, 31).toISOString(),
        fixture.tasks[0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
    })
    it('fake test', () => {
      expect(1).to.eq(1)
    })
  })

  describe('When shifting the dates backward ', () => {
    it('Should allow the update', () => {
      cy.login(user)
      shift(matterId, workstreamId, fixture.tasks[0].id, {
        directionInTime: 'forward',
        amount: 10,
        includeSubtasks: true,
      })
      getTask(fixture.tasks[0].id, workstreamId, matterId).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)

        expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
          new Date(2025, 3, 25).getTime()
        )
        expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
          new Date(2025, 5, 10).getTime()
        )
      })
    })
  })
})
