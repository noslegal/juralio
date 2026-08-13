import HttpStatus from 'http-status-codes'
import {
  createSimpleFixture,
  getTask,
  setPlannedEndDateForTask,
  setPlannedStartDateForTask,
} from './task-date-helpers'

describe('C1.1', () => {
  let user, fixture, workstreamId, matterId
  before(() => {
    createSimpleFixture([[]]).then(e => {
      user = e.user
      fixture = e.fixture
      workstreamId = fixture.projects[fixture.projects.length - 1].id
      matterId = fixture.matter.id
    })
  })
  describe('initial setup ', () => {
    before(() => {
      cy.login(user)
      setPlannedEndDateForTask(
        new Date(2025, 5, 31).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
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

  describe('when updating the PED with no PSD', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedEndDateForTask(
        new Date(2025, 5, 21).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
        expect(res.body.plannedStartDate).to.eq(null)
      })
    })
  })
})

describe('C1.2', () => {
  let user, fixture, workstreamId, matterId
  before(() => {
    createSimpleFixture([[]]).then(e => {
      user = e.user
      fixture = e.fixture
      workstreamId = fixture.projects[fixture.projects.length - 1].id
      matterId = fixture.matter.id
    })
  })
  describe('initial setup ', () => {
    before(() => {
      cy.login(user)
      setPlannedStartDateForTask(
        new Date(2025, 4, 15).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 5, 21).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
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

  describe('when updating the PED with PSD', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedEndDateForTask(
        new Date(2025, 5, 13).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
        expect(new Date(res.body.plannedStartDate).getTime()).to.eq(
          new Date(2025, 4, 15).getTime()
        )
        expect(new Date(res.body.plannedEndDate).getTime()).to.eq(
          new Date(2025, 5, 13).getTime()
        )
      })
    })
  })
})

describe('C1.3', () => {
  let user, fixture, workstreamId, matterId
  before(() => {
    createSimpleFixture([[[], [], [], []]]).then(e => {
      user = e.user
      fixture = e.fixture
      workstreamId = fixture.projects[fixture.projects.length - 1].id
      matterId = fixture.matter.id
    })
  })
  describe('initial setup ', () => {
    before(() => {
      cy.login(user)
      setPlannedStartDateForTask(
        new Date(2025, 4, 15).toISOString(),
        fixture.tasks[fixture.tasks.length - 4].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 5, 13).toISOString(),
        fixture.tasks[fixture.tasks.length - 4].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 4, 15).toISOString(),
        fixture.tasks[fixture.tasks.length - 3].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 5, 25).toISOString(),
        fixture.tasks[fixture.tasks.length - 3].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 5, 13).toISOString(),
        fixture.tasks[fixture.tasks.length - 2].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 5, 15).toISOString(),
        fixture.tasks[fixture.tasks.length - 2].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 4, 20).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedEndDateForTask(
        new Date(2025, 5, 1).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
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

  describe('when updating the PED with PSD', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedEndDateForTask(
        new Date(2025, 5, 13).toISOString(),
        fixture.tasks[fixture.tasks.length - 4].id,
        workstreamId,
        matterId,
        'squeeze'
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
        expect(new Date(res.body.plannedStartDate).getTime()).to.eq(
          new Date(2025, 4, 15).getTime()
        )
        expect(new Date(res.body.plannedEndDate).getTime()).to.eq(
          new Date(2025, 5, 13).getTime()
        )
      })
      getTask(
        fixture.tasks[fixture.tasks.length - 4].id,
        workstreamId,
        matterId
      ).then(response => {
        expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
          new Date(2025, 4, 15).getTime()
        )
        expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
          new Date(2025, 5, 13).getTime()
        )
      })

      getTask(
        fixture.tasks[fixture.tasks.length - 4].id,
        workstreamId,
        matterId
      ).then(response => {
        expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
          new Date(2025, 4, 15).getTime()
        )
        expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
          new Date(2025, 5, 13).getTime()
        )
      })

      getTask(
        fixture.tasks[fixture.tasks.length - 2].id,
        workstreamId,
        matterId
      ).then(response => {
        expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
          new Date(2025, 5, 13).getTime()
        )
      })

      getTask(
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(response => {
        expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
          new Date(2025, 5, 1).getTime()
        )
      })
    })
  })
})

describe('C1.4', () => {
  let user, fixture, workstreamId, matterId
  before(() => {
    createSimpleFixture([[[], []], [], []]).then(e => {
      user = e.user
      fixture = e.fixture
      workstreamId = fixture.projects[fixture.projects.length - 1].id
      matterId = fixture.matter.id
    })
  })
  describe('initial setup ', () => {
    before(() => {
      cy.login(user)

      setPlannedStartDateForTask(
        new Date(2025, 3, 15).toISOString(),
        fixture.tasks[fixture.tasks.length - 5].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 4, 5).toISOString(),
        fixture.tasks[fixture.tasks.length - 5].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 3, 15).toISOString(),
        fixture.tasks[fixture.tasks.length - 4].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 3, 22).toISOString(),
        fixture.tasks[fixture.tasks.length - 4].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedEndDateForTask(
        new Date(2025, 4, 1).toISOString(),
        fixture.tasks[fixture.tasks.length - 3].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 3, 17).toISOString(),
        fixture.tasks[fixture.tasks.length - 2].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 3, 22).toISOString(),
        fixture.tasks[fixture.tasks.length - 2].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 3, 18).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 3, 19).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
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

  describe('when shifting a task into the past', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedEndDateForTask(
        new Date(2025, 3, 21).toISOString(),
        fixture.tasks[fixture.tasks.length - 5].id,
        workstreamId,
        matterId
      ).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
        expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
          new Date(2025, 3, 21).getTime()
        )
        expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
          new Date(2025, 3, 15).getTime()
        )
        getTask(
          fixture.tasks[fixture.tasks.length - 5].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
            new Date(2025, 3, 15).getTime()
          )
          expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
            new Date(2025, 3, 21).getTime()
          )
        })
        getTask(
          fixture.tasks[fixture.tasks.length - 4].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
            new Date(2025, 3, 15).getTime()
          )
          // expect(response.body.plannedEndDate).to.eq(null)
        })
        getTask(
          fixture.tasks[fixture.tasks.length - 3].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
            new Date(2025, 3, 21).getTime()
          )
          expect(response.body.plannedStartDate).to.eq(null)
        })
        getTask(
          fixture.tasks[fixture.tasks.length - 2].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
            new Date(2025, 3, 17).getTime()
          )
          expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
            new Date(2025, 3, 22).getTime()
          )
        })
        getTask(
          fixture.tasks[fixture.tasks.length - 1].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
            new Date(2025, 3, 18).getTime()
          )
          expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
            new Date(2025, 3, 19).getTime()
          )
        })
      })
    })
  })
})

describe('C1.4a', () => {
  let user, fixture, workstreamId, matterId
  before(() => {
    createSimpleFixture([[[], [], [], []]]).then(e => {
      user = e.user
      fixture = e.fixture
      workstreamId = fixture.projects[fixture.projects.length - 1].id
      matterId = fixture.matter.id
    })
  })
  describe('initial setup ', () => {
    before(() => {
      cy.login(user)
      setPlannedEndDateForTask(
        new Date(2025, 5, 13).toISOString(),
        fixture.tasks[fixture.tasks.length - 5].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      // setPlannedStartDateForTask(
      //   new Date(2025, 4, 15).toISOString(),
      //   fixture.tasks[fixture.tasks.length - 6].id,
      //   workstreamId,
      //   matterId
      // ).then(res => {
      //   expect(res.status).to.eq(HttpStatus.OK)
      // })
      setPlannedEndDateForTask(
        new Date(2025, 5, 25).toISOString(),
        fixture.tasks[fixture.tasks.length - 5].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 5, 5).toISOString(),
        fixture.tasks[fixture.tasks.length - 4].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 5, 12).toISOString(),
        fixture.tasks[fixture.tasks.length - 3].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 4, 20).toISOString(),
        fixture.tasks[fixture.tasks.length - 2].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedEndDateForTask(
        new Date(2025, 5, 1).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
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

  describe('when updating the PED with PSD', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedEndDateForTask(
        new Date(2025, 5, 13).toISOString(),
        fixture.tasks[fixture.tasks.length - 5].id,
        workstreamId,
        matterId,
        'sque(res)'
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
        // expect(res.body.plannedStartDate).to.eq(null)

        expect(new Date(res.body.plannedEndDate).getTime()).to.eq(
          new Date(2025, 5, 13).getTime()
        )
      })
      getTask(
        fixture.tasks[fixture.tasks.length - 4].id,
        workstreamId,
        matterId
      ).then(response => {
        expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
          new Date(2025, 5, 5).getTime()
        )
        // expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
        //   new Date(2025, 5, 5).getTime()
        // )
      })
      getTask(
        fixture.tasks[fixture.tasks.length - 3].id,
        workstreamId,
        matterId
      ).then(response => {
        // expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
        //   new Date(2025, 4, 30).getTime()
        // )
        expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
          new Date(2025, 5, 12).getTime()
        )
      })
      getTask(
        fixture.tasks[fixture.tasks.length - 2].id,
        workstreamId,
        matterId
      ).then(response => {
        expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
          new Date(2025, 4, 20).getTime()
        )
      })
      getTask(
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(response => {
        expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
          new Date(2025, 5, 1).getTime()
        )
      })
    })
  })
})

describe('C1.5', () => {
  let user, fixture, workstreamId, matterId
  before(() => {
    createSimpleFixture([[], [], [], [], [], [], [], []]).then(e => {
      user = e.user
      fixture = e.fixture
      workstreamId = fixture.projects[fixture.projects.length - 1].id
      matterId = fixture.matter.id
    })
  })
  describe('initial setup ', () => {
    before(() => {
      cy.login(user)
      setPlannedStartDateForTask(
        new Date(2025, 8, 15).toISOString(),
        fixture.tasks[fixture.tasks.length - 8].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 9, 31).toISOString(),
        fixture.tasks[fixture.tasks.length - 8].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 8, 20).toISOString(),
        fixture.tasks[fixture.tasks.length - 7].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 9, 25).toISOString(),
        fixture.tasks[fixture.tasks.length - 7].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 8, 30).toISOString(),
        fixture.tasks[fixture.tasks.length - 6].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 9, 20).toISOString(),
        fixture.tasks[fixture.tasks.length - 6].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedStartDateForTask(
        new Date(2025, 8, 21).toISOString(),
        fixture.tasks[fixture.tasks.length - 5].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 9, 10).toISOString(),
        fixture.tasks[fixture.tasks.length - 5].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 8, 22).toISOString(),
        fixture.tasks[fixture.tasks.length - 4].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 9, 25).toISOString(),
        fixture.tasks[fixture.tasks.length - 4].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 8, 22).toISOString(),
        fixture.tasks[fixture.tasks.length - 3].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      // setPlannedEndDateForTask(
      //   new Date(2025, 9, 11).toISOString(),
      //   fixture.tasks[fixture.tasks.length - 2].id,
      //   workstreamId,
      //   matterId
      // ).then(res => {
      //   expect(res.status).to.eq(HttpStatus.OK)
      // })

      setPlannedStartDateForTask(
        new Date(2025, 8, 27).toISOString(),
        fixture.tasks[fixture.tasks.length - 2].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 8, 28).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 9, 30).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      // linkTasks(
      //   fixture.tasks[fixture.tasks.length - 1].tasks.map((t) => t.id),
      //   fixture.tasks[fixture.tasks.length - 1].tasks.map((t) => true),
      //   fixture.tasks[1].id.workstreamId,
      //   matterId
      // )
    })
    it('fake test', () => {
      expect(1).to.eq(1)
    })
  })

  describe('when updating the PED with PSD', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedEndDateForTask(
        new Date(2025, 9, 13).toISOString(),
        fixture.tasks[fixture.tasks.length - 7].id,
        workstreamId,
        matterId
      ).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
        expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
          new Date(2025, 8, 20).getTime()
        )
        expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
          new Date(2025, 9, 13).getTime()
        )
      })
      getTask(
        fixture.tasks[fixture.tasks.length - 8].id,
        workstreamId,
        matterId
      ).then(response => {
        expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
          new Date(2025, 8, 15).getTime()
        )
        expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
          new Date(2025, 9, 31).getTime()
        )
      })
      getTask(
        fixture.tasks[fixture.tasks.length - 6].id,
        workstreamId,
        matterId
      ).then(response => {
        expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
          new Date(2025, 8, 30).getTime()
        )
        expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
          new Date(2025, 9, 20).getTime()
        )
      })
      getTask(
        fixture.tasks[fixture.tasks.length - 5].id,
        workstreamId,
        matterId
      ).then(response => {
        expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
          new Date(2025, 8, 21).getTime()
        )
        expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
          new Date(2025, 9, 10).getTime()
        )
      })
      getTask(
        fixture.tasks[fixture.tasks.length - 4].id,
        workstreamId,
        matterId
      ).then(response => {
        expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
          new Date(2025, 8, 22).getTime()
        )
      })
      getTask(
        fixture.tasks[fixture.tasks.length - 3].id,
        workstreamId,
        matterId
      ).then(response => {
        expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
          new Date(2025, 8, 22).getTime()
        )
        // expect(response.body.plannedEndDate).to.eq(null)
      })

      getTask(
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(response => {
        expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
          new Date(2025, 8, 28).getTime()
        )
        expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
          new Date(2025, 9, 30).getTime()
        )
      })
    })
  })
})

describe('C2.1', () => {
  let user, fixture, workstreamId, matterId
  before(() => {
    createSimpleFixture([[]]).then(e => {
      user = e.user
      fixture = e.fixture
      workstreamId = fixture.projects[fixture.projects.length - 1].id
      matterId = fixture.matter.id
    })
  })
  describe('initial setup ', () => {
    before(() => {
      cy.login(user)
      setPlannedStartDateForTask(
        new Date(2025, 5, 31).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
    })
  })

  describe('when updating the PED with no PSD', () => {
    it('should allow the update', () => {
      setPlannedEndDateForTask(
        new Date(2025, 6, 10).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
        expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
          new Date(2025, 6, 10).getTime()
        )
        expect(response.body.plannedStartDate).to.eq(null)
      })
    })
  })
})

describe('C2.2', () => {
  let user, fixture, workstreamId, matterId
  before(() => {
    createSimpleFixture([[]]).then(e => {
      user = e.user
      fixture = e.fixture
      workstreamId = fixture.projects[fixture.projects.length - 1].id
      matterId = fixture.matter.id
    })
  })
  describe('initial setup ', () => {
    before(() => {
      cy.login(user)
      setPlannedStartDateForTask(
        new Date(2025, 6, 10).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 7, 15).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
    })
    it('fake test', () => expect(1).to.eq(1))
  })

  describe('when updating the PED with no PSD', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedStartDateForTask(
        new Date(2025, 6, 18).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
        expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
          new Date(2025, 6, 18).getTime()
        )
        expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
          new Date(2025, 7, 15).getTime()
        )
      })
    })
  })
})

describe('C2.2', () => {
  let user, fixture, workstreamId, matterId
  before(() => {
    createSimpleFixture([[]]).then(e => {
      user = e.user
      fixture = e.fixture
      workstreamId = fixture.projects[fixture.projects.length - 1].id
      matterId = fixture.matter.id
    })
  })
  describe('initial setup ', () => {
    before(() => {
      cy.login(user)
      setPlannedStartDateForTask(
        new Date(2025, 6, 10).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 7, 15).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
    })
    it('fake test', () => expect(1).to.eq(1))
  })

  describe('when updating the PED with no PSD', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedStartDateForTask(
        new Date(2025, 6, 18).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
        expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
          new Date(2025, 6, 18).getTime()
        )
        expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
          new Date(2025, 7, 15).getTime()
        )
      })
    })
  })
})

describe('C2.3', () => {
  let user, fixture, workstreamId, matterId
  before(() => {
    createSimpleFixture([[[], [], [], []]]).then(e => {
      user = e.user
      fixture = e.fixture
      workstreamId = fixture.projects[fixture.projects.length - 1].id
      matterId = fixture.matter.id
    })
  })
  describe('initial setup ', () => {
    before(() => {
      cy.login(user)
      setPlannedStartDateForTask(
        new Date(2025, 6, 18).toISOString(),
        fixture.tasks[fixture.tasks.length - 5 - 0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 7, 15).toISOString(),
        fixture.tasks[fixture.tasks.length - 5 - 0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 6, 19).toISOString(),
        fixture.tasks[fixture.tasks.length - 5 + 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 7, 10).toISOString(),
        fixture.tasks[fixture.tasks.length - 5 + 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 6, 20).toISOString(),
        fixture.tasks[fixture.tasks.length - 5 + 2].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 7, 10).toISOString(),
        fixture.tasks[fixture.tasks.length - 5 + 3].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedEndDateForTask(
        new Date(2025, 7, 11).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
    })
    it('fake test', () => expect(1).to.eq(1))
  })

  describe('when updating the PED with no PSD', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedStartDateForTask(
        new Date(2025, 6, 26).toISOString(),
        fixture.tasks[fixture.tasks.length - 5 - 0].id,
        workstreamId,
        matterId
      ).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
        expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
          new Date(2025, 6, 26).getTime()
        )
        expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
          new Date(2025, 7, 15).getTime()
        )
        getTask(
          fixture.tasks[fixture.tasks.length - 5 + 1].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
            new Date(2025, 6, 26).getTime()
          )
          expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
            new Date(2025, 7, 10).getTime()
          )
        })
        getTask(
          fixture.tasks[fixture.tasks.length - 5 + 2].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
            new Date(2025, 6, 26).getTime()
          )
        })
        getTask(
          fixture.tasks[fixture.tasks.length - 5 + 3].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
            new Date(2025, 7, 10).getTime()
          )
        })
        getTask(
          fixture.tasks[fixture.tasks.length - 5 + 4].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
            new Date(2025, 7, 11).getTime()
          )
        })
      })
    })
  })
})

describe('C2.4', () => {
  let user, fixture, workstreamId, matterId
  before(() => {
    createSimpleFixture([[[], []], [], [], [], [], [], []]).then(e => {
      user = e.user
      fixture = e.fixture
      workstreamId = fixture.projects[fixture.projects.length - 1].id
      matterId = fixture.matter.id
    })
  })
  describe('initial setup ', () => {
    before(() => {
      cy.login(user)

      setPlannedStartDateForTask(
        new Date(2025, 6, 26).toISOString(),
        fixture.tasks[fixture.tasks.length - 9 + 0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 7, 15).toISOString(),
        fixture.tasks[fixture.tasks.length - 9 + 0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 6, 26).toISOString(),
        fixture.tasks[fixture.tasks.length - 9 + 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 7, 10).toISOString(),
        fixture.tasks[fixture.tasks.length - 9 + 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 6, 26).toISOString(),
        fixture.tasks[fixture.tasks.length - 9 + 2].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 7, 10).toISOString(),
        fixture.tasks[fixture.tasks.length - 9 + 3].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 7, 12).toISOString(),
        fixture.tasks[fixture.tasks.length - 9 + 4].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedEndDateForTask(
        new Date(2025, 7, 11).toISOString(),
        fixture.tasks[fixture.tasks.length - 9 + 5].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 7, 9).toISOString(),
        fixture.tasks[fixture.tasks.length - 9 + 6].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 6, 27).toISOString(),
        fixture.tasks[fixture.tasks.length - 9 + 7].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 6, 29).toISOString(),
        fixture.tasks[fixture.tasks.length - 9 + 7].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 7, 10).toISOString(),
        fixture.tasks[fixture.tasks.length - 9 + 8].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 7, 14).toISOString(),
        fixture.tasks[fixture.tasks.length - 9 + 8].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
    })
    it('fake update', () => expect(1).to.eq(1))
  })

  describe('when shifting a task into the past', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedEndDateForTask(
        new Date(2025, 7, 11).toISOString(),
        fixture.tasks[fixture.tasks.length - 9 + 0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
        expect(new Date(res.body.plannedStartDate).getTime()).to.eq(
          new Date(2025, 6, 26).getTime()
        )
        expect(new Date(res.body.plannedEndDate).getTime()).to.eq(
          new Date(2025, 7, 11).getTime()
        )
        getTask(
          fixture.tasks[fixture.tasks.length - 9 + 1].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
            new Date(2025, 6, 26).getTime()
          )
          expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
            new Date(2025, 7, 10).getTime()
          )
        })
        getTask(
          fixture.tasks[fixture.tasks.length - 9 + 2].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
            new Date(2025, 6, 26).getTime()
          )
          expect(response.body.plannedEndDate).to.eq(null)
        })
        getTask(
          fixture.tasks[fixture.tasks.length - 9 + 3].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
            new Date(2025, 7, 10).getTime()
          )
          expect(response.body.plannedEndDate).to.eq(null)
        })
        getTask(
          fixture.tasks[fixture.tasks.length - 9 + 4].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
            new Date(2025, 7, 12).getTime()
          )
          expect(response.body.plannedEndDate).to.eq(null)
        })
        getTask(
          fixture.tasks[fixture.tasks.length - 9 + 5].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(response.body.plannedStartDate).to.eq(null)
          expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
            new Date(2025, 7, 11).getTime()
          )
        })
        getTask(
          fixture.tasks[fixture.tasks.length - 9 + 6].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(response.body.plannedStartDate).to.eq(null)
          expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
            new Date(2025, 7, 9).getTime()
          )
        })
        getTask(
          fixture.tasks[fixture.tasks.length - 9 + 7].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
            new Date(2025, 6, 27).getTime()
          )
          expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
            new Date(2025, 6, 29).getTime()
          )
        })
        getTask(
          fixture.tasks[fixture.tasks.length - 9 + 8].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
            new Date(2025, 7, 10).getTime()
          )
          expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
            new Date(2025, 7, 14).getTime()
          )
        })
      })
    })
  })
})

describe('C2.4a', () => {
  let user, fixture, workstreamId, matterId
  before(() => {
    createSimpleFixture([[[], []], [], [], [], [], [], []]).then(e => {
      user = e.user
      fixture = e.fixture
      workstreamId = fixture.projects[fixture.projects.length - 1].id
      matterId = fixture.matter.id
    })
  })
  describe('initial setup ', () => {
    before(() => {
      cy.login(user)
      setPlannedEndDateForTask(
        new Date(2025, 7, 15).toISOString(),
        fixture.tasks[fixture.tasks.length - 9 + 0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 6, 26).toISOString(),
        fixture.tasks[fixture.tasks.length - 9 + 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 7, 10).toISOString(),
        fixture.tasks[fixture.tasks.length - 9 + 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 6, 26).toISOString(),
        fixture.tasks[fixture.tasks.length - 9 + 2].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 7, 10).toISOString(),
        fixture.tasks[fixture.tasks.length - 9 + 3].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 7, 12).toISOString(),
        fixture.tasks[fixture.tasks.length - 9 + 4].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedEndDateForTask(
        new Date(2025, 7, 11).toISOString(),
        fixture.tasks[fixture.tasks.length - 9 + 5].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 7, 9).toISOString(),
        fixture.tasks[fixture.tasks.length - 9 + 6].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 6, 27).toISOString(),
        fixture.tasks[fixture.tasks.length - 9 + 7].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 6, 29).toISOString(),
        fixture.tasks[fixture.tasks.length - 9 + 7].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 7, 10).toISOString(),
        fixture.tasks[fixture.tasks.length - 9 + 8].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 7, 14).toISOString(),
        fixture.tasks[fixture.tasks.length - 9 + 8].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
    })
    it('fake result', () => {
      expect(1).to.eq(1)
    })
  })

  describe('when shifting a task into the past', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedEndDateForTask(
        new Date(2025, 7, 11).toISOString(),
        fixture.tasks[fixture.tasks.length - 9 + 0].id,
        workstreamId,
        matterId
      ).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
        // expect(response.body.plannedStartDate).to.eq(null)
        expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
          new Date(2025, 7, 11).getTime()
        )
        console.log(
          fixture.tasks.length - 8 + 1,
          fixture.tasks[fixture.tasks.length - 9 + 1]
        )
        getTask(
          fixture.tasks[fixture.tasks.length - 9 + 1].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
            new Date(2025, 6, 26).getTime()
          )
          expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
            new Date(2025, 7, 10).getTime()
          )
        })
        getTask(
          fixture.tasks[fixture.tasks.length - 9 + 2].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
            new Date(2025, 6, 26).getTime()
          )
          expect(response.body.plannedEndDate).to.eq(null)
        })
        getTask(
          fixture.tasks[fixture.tasks.length - 9 + 3].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
            new Date(2025, 7, 10).getTime()
          )
          expect(response.body.plannedEndDate).to.eq(null)
        })
        getTask(
          fixture.tasks[fixture.tasks.length - 9 + 4].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
            new Date(2025, 7, 12).getTime()
          )
          expect(response.body.plannedEndDate).to.eq(null)
        })
        getTask(
          fixture.tasks[fixture.tasks.length - 9 + 5].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(response.body.plannedStartDate).to.eq(null)
          expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
            new Date(2025, 7, 11).getTime()
          )
        })
        getTask(
          fixture.tasks[fixture.tasks.length - 9 + 6].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(response.body.plannedStartDate).to.eq(null)
          expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
            new Date(2025, 7, 9).getTime()
          )
        })
        getTask(
          fixture.tasks[fixture.tasks.length - 9 + 7].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
            new Date(2025, 6, 27).getTime()
          )
          expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
            new Date(2025, 6, 29).getTime()
          )
        })
        getTask(
          fixture.tasks[fixture.tasks.length - 9 + 8].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
            new Date(2025, 7, 10).getTime()
          )
          expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
            new Date(2025, 7, 14).getTime()
          )
        })
      })
    })
  })
})

describe('C2.5', () => {
  let user, fixture, workstreamId, matterId
  before(() => {
    createSimpleFixture([[], [], [], []]).then(e => {
      user = e.user
      fixture = e.fixture
      workstreamId = fixture.projects[fixture.projects.length - 1].id
      matterId = fixture.matter.id
    })
  })
  describe('initial setup ', () => {
    before(() => {
      cy.login(user)
      setPlannedStartDateForTask(
        new Date(2025, 10, 15).toISOString(),
        fixture.tasks[fixture.tasks.length - 4 + 0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 11, 30).toISOString(),
        fixture.tasks[fixture.tasks.length - 4 + 0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedStartDateForTask(
        new Date(2025, 10, 20).toISOString(),
        fixture.tasks[fixture.tasks.length - 4 + 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 11, 25).toISOString(),
        fixture.tasks[fixture.tasks.length - 4 + 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedStartDateForTask(
        new Date(2025, 10, 30).toISOString(),
        fixture.tasks[fixture.tasks.length - 4 + 2].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 11, 20).toISOString(),
        fixture.tasks[fixture.tasks.length - 4 + 2].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedStartDateForTask(
        new Date(2025, 10, 21).toISOString(),
        fixture.tasks[fixture.tasks.length - 4 + 3].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 11, 10).toISOString(),
        fixture.tasks[fixture.tasks.length - 4 + 3].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      // linkTasks(
      //   fixture.tasks[fixture.tasks.length - 1].tasks.map((t) => t.id),
      //   fixture.tasks[fixture.tasks.length - 1].tasks.map((t) => true),
      //   fixture.tasks[1].id.workstreamId,
      //   matterId
      // )
    })
    it('fake test', () => {
      expect(1).to.eq(1)
    })
  })

  describe('when updating the PED with no PSD', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedStartDateForTask(
        new Date(2025, 10, 14).toISOString(),
        fixture.tasks[fixture.tasks.length - 4 + 2].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
        getTask(
          fixture.tasks[fixture.tasks.length - 4 + 0].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
            new Date(2025, 10, 15).getTime()
          )
          expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
            new Date(2025, 11, 30).getTime()
          )
        })
        getTask(
          fixture.tasks[fixture.tasks.length - 4 + 1].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
            new Date(2025, 10, 20).getTime()
          )
          expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
            new Date(2025, 11, 25).getTime()
          )
        })
        getTask(
          fixture.tasks[fixture.tasks.length - 4 + 2].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
            new Date(2025, 10, 14).getTime()
          )
          expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
            new Date(2025, 11, 20).getTime()
          )
        })
        getTask(
          fixture.tasks[fixture.tasks.length - 4 + 3].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
            new Date(2025, 10, 21).getTime()
          )
          expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
            new Date(2025, 11, 10).getTime()
          )
        })
      })
    })
  })
})
