import HttpStatus from 'http-status-codes'
import dayjs from 'dayjs'
import {
  createSimpleFixture,
  getTask,
  setPlannedEndDateForTask,
  setPlannedStartDateForTask,
  shift,
} from './task-date-helpers'

let utc = require('dayjs/plugin/utc')

dayjs.extend(utc)

describe('A1.2', () => {
  let user, fixture, workstreamId, matterId
  before(() => {
    createSimpleFixture([[[], [], []]]).then((e) => {
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
        dayjs.utc('2025-04-05').toISOString(),
        fixture.tasks[0].id,
        workstreamId,
        matterId
      ).then((res) => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        dayjs.utc('2025-05-21').startOf('day').toISOString(),
        fixture.tasks[0].id,
        workstreamId,
        matterId
      ).then((res) => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        dayjs.utc('2025-04-10').startOf('day').toISOString(),
        fixture.tasks[1].id,
        workstreamId,
        matterId
      ).then((res) => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        dayjs.utc('2025-04-14').toISOString(),
        fixture.tasks[1].id,
        workstreamId,
        matterId
      ).then((res) => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        dayjs.utc('2025-04-12').toISOString(),
        fixture.tasks[2].id,
        workstreamId,
        matterId
      ).then((res) => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedEndDateForTask(
        dayjs.utc('2025-04-14').toISOString(),
        fixture.tasks[3].id,
        workstreamId,
        matterId
      ).then((res) => {
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
        directionInTime: 'backward',
        amount: 7,
        includeSubtasks: true,
      })
      getTask(fixture.tasks[0].id, workstreamId, matterId).then((response) => {
        expect(response.status).to.eq(HttpStatus.OK)

        expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
          new Date(2025, 2, 29).getTime()
        )
        expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
          dayjs.utc('2025-05-14').startOf('day').valueOf()
        )
      })
      getTask(fixture.tasks[1].id, workstreamId, matterId).then((response) => {
        expect(response.status).to.eq(HttpStatus.OK)

        expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
          dayjs.utc('2025-04-3').startOf('day').valueOf()
        )
        expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
          dayjs.utc('2025-04-7').startOf('day').valueOf()
        )
      })

      getTask(fixture.tasks[2].id, workstreamId, matterId).then((response) => {
        expect(response.status).to.eq(HttpStatus.OK)

        expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
          dayjs.utc('2025-04-5').startOf('day').valueOf()
        )
      })

      getTask(fixture.tasks[3].id, workstreamId, matterId).then((response) => {
        expect(response.status).to.eq(HttpStatus.OK)
        expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
          dayjs.utc('2025-04-7').startOf('day').valueOf()
        )
      })
    })
  })
})
