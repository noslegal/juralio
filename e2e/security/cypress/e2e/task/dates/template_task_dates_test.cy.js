import HttpStatus from 'http-status-codes'
import { createSimpleFixture } from './task-date-helpers'

describe('template_task_dates_test', () => {
  let user, fixture, workstreamId, matterId
  before(() => {
    createSimpleFixture([[], [], []]).then(e => {
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
        new Date().getUTCDate(),
        fixture.tasks[0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
    })
  })

  describe('test', () => {
    it('a', () => {
      expect(1).to.eq(1)
    })
  })
})
