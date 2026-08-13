// Basic consistency for planned dates
import HttpStatus from 'http-status-codes'

import {
  createSimpleFixture,
  getTask,
  linkTasks,
  setActualStartDateForTask,
  setPlannedEndDateForTask,
  setPlannedStartDateForTask,
  setTaskDone,
  setTaskInProgress,
  setTaskNotStarted,
} from './task-date-helpers'

describe('E1.1', () => {
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

  describe('when updating the end date to be earlier than the psd', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedEndDateForTask(
        new Date(2025, 4, 14).toISOString(),
        fixture.tasks[0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.BAD_REQUEST)
      })
    })
  })
})
describe('E1.2', () => {
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
        fixture.tasks[fixture.tasks.length - 1 + 0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedEndDateForTask(
        new Date(2025, 4, 31).toISOString(),
        fixture.tasks[fixture.tasks.length - 1 + 0].id,
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

  describe('when setting the ped to equal the psd', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedEndDateForTask(
        new Date(2025, 4, 15).toISOString(),
        fixture.tasks[fixture.tasks.length - 1 + 0].id,
        workstreamId,
        matterId
      ).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
        expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
          new Date(2025, 4, 15).getTime()
        )
        expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
          new Date(2025, 4, 15).getTime()
        )
      })
    })
  })
})
describe('E1.3', () => {
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
        fixture.tasks[fixture.tasks.length - 1 + 0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedEndDateForTask(
        new Date(2025, 4, 31).toISOString(),
        fixture.tasks[fixture.tasks.length - 1 + 0].id,
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

  describe('when setting the psd to equal the ped', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedStartDateForTask(
        new Date(2025, 4, 31).toISOString(),
        fixture.tasks[fixture.tasks.length - 1 + 0].id,
        workstreamId,
        matterId
      ).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
        expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
          new Date(2025, 4, 31).getTime()
        )
        expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
          new Date(2025, 4, 31).getTime()
        )
      })
    })
  })
})

describe('E1.4', () => {
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
      //set in progress
      setTaskInProgress(
        fixture.tasks[fixture.tasks.length - 1 + 0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setActualStartDateForTask(
        new Date(2000, 4, 15).toISOString(),
        fixture.tasks[fixture.tasks.length - 1 + 0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedEndDateForTask(
        new Date(2000, 4, 31).toISOString(),
        fixture.tasks[fixture.tasks.length - 1 + 0].id,
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

  describe('when setting the ped to be before the asd', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedEndDateForTask(
        new Date(2000, 4, 14).toISOString(),
        fixture.tasks[fixture.tasks.length - 1 + 0].id,
        workstreamId,
        matterId,
        false,
        false
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
    })
  })
})

describe('E1.5a', () => {
  let user, fixture, workstreamId, matterId
  before(() => {
    createSimpleFixture([[[[]]]]).then(e => {
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
        new Date(2025, 5, 1).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 5, 3).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 4, 5).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 2].id,
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

  describe('when setting the start date before the parent', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedStartDateForTask(
        new Date(2025, 5, 1).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 2].id,
        workstreamId,
        matterId,
        false,
        false
      ).then(res => {
        expect(res.status).to.eq(320)
      })
    })
  })
})
describe('E1.5b', () => {
  let user, fixture, workstreamId, matterId
  before(() => {
    createSimpleFixture([[[[]]]]).then(e => {
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
        new Date(2025, 5, 1).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 5, 3).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 4, 5).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 2].id,
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

  describe('when setting the start date before the grandparentparent', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedStartDateForTask(
        new Date(2025, 4, 29).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 2].id,
        workstreamId,
        matterId,
        false,
        false
      ).then(res => {
        expect(res.status).to.eq(320)
      })
    })
  })
})

describe('E1.5c', () => {
  let user, fixture, workstreamId, matterId
  before(() => {
    createSimpleFixture([[[[]]]]).then(e => {
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
        new Date(2025, 5, 1).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 4, 5).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 2].id,
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

  describe('when setting the start date before the grandparentparent', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedStartDateForTask(
        new Date(2025, 4, 29).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 2].id,
        workstreamId,
        matterId,
        false,
        false
      ).then(res => {
        expect(res.status).to.eq(320)
      })
    })
  })
})

describe('E1.5d', () => {
  let user, fixture, workstreamId, matterId
  before(() => {
    createSimpleFixture([[[[]]]]).then(e => {
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
        new Date(2025, 5, 1).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 5, 3).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 1].id,
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

  describe('when setting the start date before the parent', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedStartDateForTask(
        new Date(2025, 5, 2).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 2].id,
        workstreamId,
        matterId,
        false,
        false
      ).then(res => {
        expect(res.status).to.eq(320)
      })
    })
  })
})
describe('E1.5e', () => {
  let user, fixture, workstreamId, matterId
  before(() => {
    createSimpleFixture([[[[]]]]).then(e => {
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
        new Date(2025, 5, 1).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedStartDateForTask(
        new Date(2025, 5, 3).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 2].id,
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

  describe('when setting the start date before the grandparent', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedStartDateForTask(
        new Date(2025, 4, 2).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 2].id,
        workstreamId,
        matterId,
        false,
        false
      ).then(res => {
        expect(res.status).to.eq(320)
      })
    })
  })
})
describe('E1.5f', () => {
  let user, fixture, workstreamId, matterId
  before(() => {
    createSimpleFixture([[[[]]]]).then(e => {
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
        new Date(2025, 5, 1).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 0].id,
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

  describe('when setting the start date before the grandparent', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedStartDateForTask(
        new Date(2025, 4, 2).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 2].id,
        workstreamId,
        matterId,
        false,
        false
      ).then(res => {
        expect(res.status).to.eq(320)
      })
    })
  })
})
describe('E1.6a', () => {
  let user, fixture, workstreamId, matterId
  before(() => {
    createSimpleFixture([[[[]]]]).then(e => {
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
        new Date(2025, 5, 10).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedEndDateForTask(
        new Date(2025, 5, 8).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedEndDateForTask(
        new Date(2025, 4, 5).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 2].id,
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

  describe('when setting the end date after the parent', () => {
    it('should not allow the update', () => {
      cy.login(user)
      setPlannedEndDateForTask(
        new Date(2025, 5, 9).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 2].id,
        workstreamId,
        matterId,
        false,
        false
      ).then(res => {
        expect(res.status).to.eq(320)
      })
    })
  })
})
describe('E1.6b', () => {
  let user, fixture, workstreamId, matterId
  before(() => {
    createSimpleFixture([[[[]]]]).then(e => {
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
        new Date(2025, 5, 10).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedEndDateForTask(
        new Date(2025, 5, 8).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedEndDateForTask(
        new Date(2025, 4, 5).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 2].id,
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

  describe('when setting the end date after the grandparent', () => {
    it('should not allow the update', () => {
      cy.login(user)
      setPlannedEndDateForTask(
        new Date(2025, 5, 11).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 2].id,
        workstreamId,
        matterId,
        false,
        false
      ).then(res => {
        expect(res.status).to.eq(320)
      })
    })
  })
})
describe('E1.6c', () => {
  let user, fixture, workstreamId, matterId
  before(() => {
    createSimpleFixture([[[[]]]]).then(e => {
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
        new Date(2025, 5, 10).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedEndDateForTask(
        new Date(2025, 4, 5).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 2].id,
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

  describe('when setting the end date after the grandparent', () => {
    it('should not allow the update', () => {
      cy.login(user)
      setPlannedEndDateForTask(
        new Date(2025, 5, 11).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 2].id,
        workstreamId,
        matterId,
        false,
        false
      ).then(res => {
        expect(res.status).to.eq(320)
      })
    })
  })
})
describe('E1.6d', () => {
  let user, fixture, workstreamId, matterId
  before(() => {
    createSimpleFixture([[[[]]]]).then(e => {
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
        new Date(2025, 5, 10).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedEndDateForTask(
        new Date(2025, 5, 8).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 1].id,
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

  describe('when setting the end date after the parent', () => {
    it('should not allow the update', () => {
      cy.login(user)
      setPlannedEndDateForTask(
        new Date(2025, 5, 9).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 2].id,
        workstreamId,
        matterId,
        false,
        false
      ).then(res => {
        expect(res.status).to.eq(320)
      })
    })
  })
})
describe('E1.6e', () => {
  let user, fixture, workstreamId, matterId
  before(() => {
    createSimpleFixture([[[[]]]]).then(e => {
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
        new Date(2025, 5, 10).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedEndDateForTask(
        new Date(2025, 5, 8).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 1].id,
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

  describe('when setting the end date after the parent', () => {
    it('should not allow the update', () => {
      cy.login(user)
      setPlannedEndDateForTask(
        new Date(2025, 5, 11).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 2].id,
        workstreamId,
        matterId,
        false,
        false
      ).then(res => {
        expect(res.status).to.eq(320)
      })
    })
  })
})
describe('E1.6f', () => {
  let user, fixture, workstreamId, matterId
  before(() => {
    createSimpleFixture([[[[]]]]).then(e => {
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
        new Date(2025, 5, 10).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 0].id,
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

  describe('when setting the end date after the grandparent', () => {
    it('should not allow the update', () => {
      cy.login(user)
      setPlannedEndDateForTask(
        new Date(2025, 5, 11).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 2].id,
        workstreamId,
        matterId,
        false,
        false
      ).then(res => {
        expect(res.status).to.eq(320)
      })
    })
  })
})
describe('E1.7a', () => {
  let user, fixture, workstreamId, matterId
  before(() => {
    createSimpleFixture([[[[]]]]).then(e => {
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
        new Date(2025, 5, 1).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 5, 3).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 4, 5).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 2].id,
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

  describe('when setting the start date after the children', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedStartDateForTask(
        new Date(2025, 5, 4).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 0].id,
        workstreamId,
        matterId
      ).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
        expect(response.body.plannedEndDate).to.eq(null)
        expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
          new Date(2025, 5, 4).getTime()
        )
        getTask(
          fixture.tasks[fixture.tasks.length - 3 + 1].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
            new Date(2025, 5, 4).getTime()
          )
          expect(response.body.plannedEndDate).to.eq(null)
        })
        getTask(
          fixture.tasks[fixture.tasks.length - 3 + 2].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
            new Date(2025, 5, 4).getTime()
          )
          expect(response.body.plannedEndDate).to.eq(null)
        })
      })
    })
  })
})
describe('E1.7b', () => {
  let user, fixture, workstreamId, matterId
  before(() => {
    createSimpleFixture([[[[]]]]).then(e => {
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
        new Date(2025, 5, 1).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 5, 3).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 4, 5).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 2].id,
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

  describe('when setting the start date after the children', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedStartDateForTask(
        new Date(2025, 5, 6).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
        expect(res.body.plannedEndDate).to.eq(null)
        expect(new Date(res.body.plannedStartDate).getTime()).to.eq(
          new Date(2025, 5, 6).getTime()
        )
        getTask(
          fixture.tasks[fixture.tasks.length - 3 + 1].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
            new Date(2025, 5, 6).getTime()
          )
          expect(response.body.plannedEndDate).to.eq(null)
        })
        getTask(
          fixture.tasks[fixture.tasks.length - 3 + 2].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
            new Date(2025, 5, 6).getTime()
          )
          expect(response.body.plannedEndDate).to.eq(null)
        })
      })
    })
  })
})
describe('E1.8a', () => {
  let user, fixture, workstreamId, matterId
  before(() => {
    createSimpleFixture([[[[]]]]).then(e => {
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
        new Date(2025, 5, 10).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedEndDateForTask(
        new Date(2025, 5, 9).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedEndDateForTask(
        new Date(2025, 4, 7).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 2].id,
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

  describe('when setting the end date before the children', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedEndDateForTask(
        new Date(2025, 5, 8).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
        expect(res.body.plannedStartDate).to.eq(null)
        expect(new Date(res.body.plannedEndDate).getTime()).to.eq(
          new Date(2025, 5, 8).getTime()
        )
        getTask(
          fixture.tasks[fixture.tasks.length - 3 + 1].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
            new Date(2025, 5, 8).getTime()
          )
          expect(response.body.plannedStartDate).to.eq(null)
        })
        getTask(
          fixture.tasks[fixture.tasks.length - 3 + 2].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
            new Date(2025, 4, 7).getTime()
          )
          expect(response.body.plannedStartDate).to.eq(null)
        })
      })
    })
  })
})

describe('E1.8b', () => {
  let user, fixture, workstreamId, matterId
  before(() => {
    createSimpleFixture([[[[]]]]).then(e => {
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
        new Date(2025, 5, 10).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedEndDateForTask(
        new Date(2025, 5, 9).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedEndDateForTask(
        new Date(2025, 4, 8).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 2].id,
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

  describe('when setting the end date before the children', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedEndDateForTask(
        new Date(2025, 5, 6).toISOString(),
        fixture.tasks[fixture.tasks.length - 3 + 0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
        expect(res.body.plannedStartDate).to.eq(null)
        expect(new Date(res.body.plannedEndDate).getTime()).to.eq(
          new Date(2025, 5, 6).getTime()
        )
        getTask(
          fixture.tasks[fixture.tasks.length - 3 + 1].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
            new Date(2025, 5, 6).getTime()
          )
          expect(response.body.plannedStartDate).to.eq(null)
        })
        getTask(
          fixture.tasks[fixture.tasks.length - 3 + 2].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
            new Date(2025, 4, 8).getTime()
          )
          expect(response.body.plannedStartDate).to.eq(null)
        })
      })
    })
  })
})
describe('E2.1a', () => {
  before(() => {
    createSimpleFixture([[[]]]).then(e => {
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
        new Date(2025, 5, 9).toISOString(),
        fixture.tasks[fixture.tasks.length - 2 + 1].id,
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
  describe('when setting the start date before the children', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedStartDateForTask(
        new Date(2025, 5, 8).toISOString(),
        fixture.tasks[fixture.tasks.length - 2 + 0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
        expect(res.body.plannedEndDate).to.eq(null)
        expect(new Date(res.body.plannedStartDate).getTime()).to.eq(
          new Date(2025, 5, 8).getTime()
        )
        getTask(
          fixture.tasks[fixture.tasks.length - 2 + 1].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
            new Date(2025, 5, 9).getTime()
          )
          expect(response.body.plannedEndDate).to.eq(null)
        })
      })
    })
  })
})
describe('E2.1b', () => {
  before(() => {
    createSimpleFixture([[[]]]).then(e => {
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
        new Date(2025, 5, 9).toISOString(),
        fixture.tasks[fixture.tasks.length - 2 + 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 5, 10).toISOString(),
        fixture.tasks[fixture.tasks.length - 2 + 1].id,
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
  describe('when setting the end date after the children', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedEndDateForTask(
        new Date(2025, 5, 11).toISOString(),
        fixture.tasks[fixture.tasks.length - 2 + 0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
        expect(res.body.plannedStartDate).to.eq(null)
        expect(new Date(res.body.plannedEndDate).getTime()).to.eq(
          new Date(2025, 5, 11).getTime()
        )
        getTask(
          fixture.tasks[fixture.tasks.length - 2 + 1].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
            new Date(2025, 5, 9).getTime()
          )
          expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
            new Date(2025, 5, 10).getTime()
          )
        })
      })
    })
  })
})
describe('E2.2', () => {
  before(() => {
    createSimpleFixture([[[]]]).then(e => {
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
        new Date(2025, 5, 9).toISOString(),
        fixture.tasks[fixture.tasks.length - 2 + 0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 5, 10).toISOString(),
        fixture.tasks[fixture.tasks.length - 2 + 0].id,
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
  describe('when setting the start and end date of the children within the parent bounds', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedStartDateForTask(
        new Date(2025, 5, 9).toISOString(),
        fixture.tasks[fixture.tasks.length - 2 + 1].id,
        workstreamId,
        matterId
      ).then(res => {
        setPlannedEndDateForTask(
          new Date(2025, 5, 10).toISOString(),
          fixture.tasks[fixture.tasks.length - 2 + 1].id,
          workstreamId,
          matterId
        ).then(res => {
          expect(res.status).to.eq(HttpStatus.OK)
          expect(new Date(res.body.plannedStartDate).getTime()).to.eq(
            new Date(2025, 5, 9).getTime()
          )
          expect(new Date(res.body.plannedEndDate).getTime()).to.eq(
            new Date(2025, 5, 10).getTime()
          )
          getTask(
            fixture.tasks[fixture.tasks.length - 2 + 0].id,
            workstreamId,
            matterId
          ).then(response => {
            expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
              new Date(2025, 5, 9).getTime()
            )
            expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
              new Date(2025, 5, 10).getTime()
            )
          })
        })
      })
    })
  })
})
// describe('E2.3', () => {
//   before(() => {
//     createSimpleFixture([[], []]).then(e => {
//       user = e.user
//       fixture = e.fixture
//       workstreamId = fixture.projects[fixture.projects.length - 1].id
//       matterId = fixture.matter.id
//     })
//   })
//   describe('initial setup ', () => {
//     before(() => {
//       cy.login(user)

//       setPlannedStartDateForTask(
//         new Date(2025, 5, 4).toISOString(),
//         fixture.tasks[fixture.tasks.length - 2 + 0].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       setPlannedEndDateForTask(
//         new Date(2025, 5, 5).toISOString(),
//         fixture.tasks[fixture.tasks.length - 2 + 0].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       // linkTasks(
//       //   fixture.tasks.map((t) => t.id),
//       //   fixture.tasks.map((t) => true),
//       //   workstreamId,
//       //   matterId
//       // )
//     })
//     it('fake test', () => {
//       expect(1).to.eq(1)
//     })
//   })
//   describe('when adding dates to the linked taks with no dates', () => {
//     it('should allow the update', () => {
//       cy.login(user)
//       setPlannedStartDateForTask(
//         new Date(2025, 5, 10).toISOString(),
//         fixture.tasks[fixture.tasks.length - 2 + 1].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         setPlannedEndDateForTask(
//           new Date(2025, 5, 9).toISOString(),
//           fixture.tasks[fixture.tasks.length - 2 + 1].id,
//           workstreamId,
//           matterId
//         ).then(res => {
//           expect(res.status).to.eq(HttpStatus.OK)
//           expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
//             new Date(2025, 5, 9).getTime()
//           )
//           expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
//             new Date(2025, 5, 10).getTime()
//           )
//           getTask(
//             fixture.tasks[fixture.tasks.length - 2 + 0],
//             workstreamId,
//             matterId
//           ).then(response => {
//             expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
//               new Date(2025, 5, 4).getTime()
//             )
//             expect(new Date(response.body.plannedEnd).getTime()).to.eq(
//               new Date(2025, 5, 5).getTime()
//             )
//           })
//         })
//       })
//     })
//   })
// })
// describe('E3.1a', () => {
//   before(() => {
//     createSimpleFixture([[]]).then(e => {
//       user = e.user
//       fixture = e.fixture
//       workstreamId = fixture.projects[fixture.projects.length - 1].id
//       matterId = fixture.matter.id
//     })
//   })
//   describe('initial setup ', () => {
//     before(() => {
//       cy.login(user)

//       setPlannedStartDateForTask(
//         new Date(2025, 5, 9).toISOString(),
//         fixture.tasks[fixture.tasks.length - 1].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       setPlannedEndDateForTask(
//         new Date(2025, 5, 9).toISOString(),
//         fixture.tasks[fixture.tasks.length - 1].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//     })
//     it('fake test', () => {
//       expect(1).to.eq(1)
//     })
//   })
//   describe('when removing the dates', () => {
//     it('should allow the update', () => {
//       cy.login(user)
//       setPlannedStartDateForTask(
//         null,
//         fixture.tasks[fixture.tasks.length - 1].id,
//         workstreamId,
//         matterId,
//         false,
//         true
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//         setPlannedEndDateForTask(
//           null,
//           fixture.tasks[fixture.tasks.length - 1].id,
//           workstreamId,
//           matterId,
//           false,
//           true
//         ).then(res => {
//           expect(res.status).to.eq(HttpStatus.OK)
//           expect(res.body.plannedEndDate).to.eq(null)
//           expect(res.body.plannedStartDate).to.eq(null)
//         })
//       })
//     })
//   })
// })
describe('E3.1b', () => {
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
        new Date(2025, 5, 9).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 5, 9).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setTaskInProgress(
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      )
    })
    it('fake test', () => {
      expect(1).to.eq(1)
    })
  })
  describe('when removing the planend dates from ip tasks', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedEndDateForTask(
        null,
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(321)
      })
    })
  })
})
describe('E3.1c', () => {
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
        new Date(2025, 5, 9).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 5, 9).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setTaskDone(fixture.tasks[0].id, workstreamId, matterId)
    })
    it('fake test', () => {
      expect(1).to.eq(1)
    })
  })
  describe('when removing the planend dates from done tasks', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedEndDateForTask(
        null,
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(321)
      })
    })
  })
})
describe('E4.1', () => {
  before(() => {
    createSimpleFixture([[[]]]).then(e => {
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
        new Date(2025, 5, 9).toISOString(),
        fixture.tasks[fixture.tasks.length - 2].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedStartDateForTask(
        new Date(2025, 5, 10).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setTaskDone(
        fixture.tasks[fixture.tasks.length - 2].id,
        workstreamId,
        matterId
      )
    })
    it('fake test', () => {
      expect(1).to.eq(1)
    })
  })
  describe('when changing child psd to before parents', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedStartDateForTask(
        new Date(2025, 5, 8).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId,
        false,
        false
      ).then(res => {
        expect(res.status).to.eq(320)
      })
    })
  })
})
describe('E4.2', () => {
  before(() => {
    createSimpleFixture([[[]]]).then(e => {
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
        new Date(2025, 5, 9).toISOString(),
        fixture.tasks[fixture.tasks.length - 2].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 5, 8).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setTaskDone(
        fixture.tasks[fixture.tasks.length - 2].id,
        workstreamId,
        matterId
      )
    })
    it('fake test', () => {
      expect(1).to.eq(1)
    })
  })
  describe('when changing child ped to after parents', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedEndDateForTask(
        new Date(2025, 5, 10).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId,
        false,
        false
      ).then(res => {
        expect(res.status).to.eq(320)
      })
    })
  })
})
// describe('E7.2', () => {
//   before(() => {
//     createSimpleFixture([[[[]]]]).then(e => {
//       user = e.user
//       fixture = e.fixture
//       workstreamId = fixture.projects[fixture.projects.length - 1].id
//       matterId = fixture.matter.id
//     })
//   })
//   describe('initial setup ', () => {
//     before(() => {
//       cy.login(user)
//       setPlannedStartDateForTask(
//         new Date(2025, 5, 1).toISOString(),
//         fixture.tasks[fixture.tasks.length - 3].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })

//       setPlannedEndDateForTask(
//         new Date(2025, 5, 10).toISOString(),
//         fixture.tasks[fixture.tasks.length - 3].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })

//       setPlannedStartDateForTask(
//         new Date(2025, 5, 1).toISOString(),
//         fixture.tasks[fixture.tasks.length - 2].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })

//       setPlannedEndDateForTask(
//         new Date(2025, 5, 6).toISOString(),
//         fixture.tasks[fixture.tasks.length - 2].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })

//       setPlannedStartDateForTask(
//         new Date(2025, 5, 1).toISOString(),
//         fixture.tasks[fixture.tasks.length - 1].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })

//       setPlannedEndDateForTask(
//         new Date(2025, 5, 4).toISOString(),
//         fixture.tasks[fixture.tasks.length - 1].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//     })
//     it('fake test', () => {
//       expect(1).to.eq(1)
//     })
//   })
//   describe('when shrinking a task with childrn', () => {
//     it('should allow the update', () => {
//       cy.login(user)
//       setPlannedEndDateForTask(
//         new Date(2025, 5, 5).toISOString(),
//         fixture.tasks[fixture.tasks.length - 3].id,
//         workstreamId,
//         matterId,
//         'squeeze'
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)

//         expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
//           new Date(2025, 5, 5).getTime()
//         )
//         getTask(fixture.tasks[1], workstreamId, matterId).then(response => {
//           expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
//             new Date(2025, 8, 3).getTime()
//           )
//         })
//         getTask(fixture.tasks[2], workstreamId, matterId).then(response => {
//           expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
//             new Date(2025, 8, 2).getTime()
//           )
//         })
//       })
//     })
//   })
// })
describe('E8.1', () => {
  before(() => {
    createSimpleFixture([[], [[]]]).then(e => {
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
        new Date(2025, 5, 9).toISOString(),
        fixture.tasks[fixture.tasks.length - 3].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedStartDateForTask(
        new Date(2025, 5, 10).toISOString(),
        fixture.tasks[fixture.tasks.length - 2].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedStartDateForTask(
        new Date(2025, 5, 10).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      linkTasks(
        fixture.tasks.map(t => t.id),
        fixture.tasks.map(t => true),
        fixture.tasks[fixture.tasks.length - 3].id,
        workstreamId,
        matterId
      )
    })
    it('fake test', () => {
      expect(1).to.eq(1)
    })
  })
  describe('when changinglinked tasks ped', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedEndDateForTask(
        new Date(2025, 5, 10).toISOString(),
        fixture.tasks[fixture.tasks.length - 3].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)

        expect(new Date(res.body.plannedEndDate).getTime()).to.eq(
          new Date(2025, 5, 10).getTime()
        )
        // getTask(
        //   fixture.tasks[fixture.tasks.length - 3].id,
        //   workstreamId,
        //   matterId
        // ).then(response => {
        //   expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
        //     new Date(2025, 8, 11).getTime()
        //   )
        // })
        // getTask(
        //   fixture.tasks[fixture.tasks.length - 1].id,
        //   workstreamId,
        //   matterId
        // ).then(response => {
        //   expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
        //     new Date(2025, 8, 11).getTime()
        //   )
        // })
      })
    })
  })
})
describe('E10.1', () => {
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

      setTaskDone(
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      )
    })
    it('fake test', () => {
      expect(1).to.eq(1)
    })
  })
  // describe('when shifting a done task', () => {
  //   it('should allow the update', () => {
  //     cy.login(user)
  //     shiftTaskIntoTheFuture(
  //       'actual',
  //       1,
  //       fixture.tasks[fixture.tasks.length - 1].id,
  //       workstreamId,
  //       matterId,
  //       false,
  //       false
  //     ).then(response => {
  //       expect(response.status).to.eq(HttpStatus.FORBIDDEN)
  //     })
  //   })
  // })
})
// describe('E10.2a', () => {
//   before(() => {
//     createSimpleFixture([[]]).then(e => {
//       user = e.user
//       fixture = e.fixture
//       workstreamId = fixture.projects[fixture.projects.length - 1].id
//       matterId = fixture.matter.id
//     })
//   })
//   describe('initial setup ', () => {
//     before(() => {
//       cy.login(user)

//       setTaskDone(
//         fixture.tasks[fixture.tasks.length - 1].id,
//         workstreamId,
//         matterId
//       )
//     })
//     it('fake test', () => {
//       expect(1).to.eq(1)
//     })
//   })
//   describe('when linking a done task', () => {
//     it('should allow the update', () => {
//       cy.login(user)
//       linkTasks(
//         fixture.tasks.map(t => t.id),
//         [true],
//         fixture.tasks[fixture.tasks.length - 1].id,
//         workstreamId.matterId
//       ).then(response => {
//         expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
//       })
//     })
//   })
// })
describe('E10.2b', () => {
  before(() => {
    createSimpleFixture([[], []]).then(e => {
      user = e.user
      fixture = e.fixture
      workstreamId = fixture.projects[fixture.projects.length - 1].id
      matterId = fixture.matter.id
    })
  })
  describe('initial setup ', () => {
    before(() => {
      cy.login(user)

      setTaskDone(
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      )
    })
    it('fake test', () => {
      expect(1).to.eq(1)
    })
  })
  describe('when blocking a done task', () => {
    it('should allow the update', () => {
      cy.login(user)
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matterId}/workstreams/${workstreamId}/task/${
          fixture.tasks[fixture.tasks.length - 2].id
        }/block/${fixture.tasks[fixture.tasks.length - 1].id}`,
        method: 'POST',
        body: {
          tasks: [],
          // isLinked: isLinked,
        },
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.METHOD_NOT_ALLOWED)
      })
    })
  })
})
describe('E10.3a', () => {
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

      setTaskInProgress(
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
    it('fake test', () => {
      expect(1).to.eq(1)
    })
  })
  describe('when setting psd for ip task', () => {
    it('should not allow the update', () => {
      cy.login(user)
      setPlannedStartDateForTask(
        new Date().toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId,
        false,
        false
      ).then(response => {
        expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
      })
    })
  })
})
describe('E10.3b', () => {
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

      setTaskDone(
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      )
    })
    it('fake test', () => {
      expect(1).to.eq(1)
    })
  })
  describe('when setting psd for done task task', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedStartDateForTask(
        new Date().toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(response => {
        expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
      })
    })
  })
})
describe('E10.4', () => {
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

      setTaskDone(
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      )
    })
    it('fake test', () => {
      expect(1).to.eq(1)
    })
  })
  describe('when setting ped for done task task', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedEndDateForTask(
        new Date().toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(response => {
        expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
      })
    })
  })
})
describe('E10.6', () => {
  before(() => {
    createSimpleFixture([[[]]]).then(e => {
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
        new Date(2025, 5, 5).toISOString(),
        fixture.tasks[fixture.tasks.length - 2].id,
        workstreamId,
        matterId
      ).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
      setPlannedStartDateForTask(
        new Date(2025, 5, 6).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
      setTaskInProgress(
        fixture.tasks[fixture.tasks.length - 2].id,
        workstreamId,
        matterId
      )
    })
    it('fake test', () => {
      expect(1).to.eq(1)
    })
  })
  describe('when setting psd forchild task of IP', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedStartDateForTask(
        new Date(2025, 5, 4).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
    })
  })
})
// describe('E10.9a', () => {
//   before(() => {
//     createSimpleFixture([[[]]]).then(e => {
//       user = e.user
//       fixture = e.fixture
//       workstreamId = fixture.projects[fixture.projects.length - 1].id
//       matterId = fixture.matter.id
//     })
//   })
//   describe('initial setup ', () => {
//     before(() => {
//       cy.login(user)
//       setPlannedStartDateForTask(
//         new Date().toISOString(),
//         fixture.tasks[fixture.tasks.length - 1].id,
//         workstreamId,
//         matterId
//       ).then(response => {
//         expect(response.status).to.eq(HttpStatus.OK)
//       })
//       setTaskInProgress(
//         fixture.tasks[fixture.tasks.length - 2].id,
//         workstreamId,
//         matterId
//       )
//       setTaskDone(
//         fixture.tasks[fixture.tasks.length - 1].id,
//         workstreamId,
//         matterId
//       )
//     })
//     it('fake test', () => {
//       expect(1).to.eq(1)
//     })
//   })
//   describe('when setting done task to ns', () => {
//     it('should remove existing planned dates', () => {
//       cy.login(user)
//       setTaskNotStarted(
//         fixture.tasks[fixture.tasks.length - 1].id,
//         workstreamId,
//         matterId
//       ).then(() => {
//         getTask(
//           fixture.tasks[fixture.tasks.length - 1].id,
//           workstreamId,
//           matterId
//         ).then(res => {
//           expect(res.body.plannedStartDate).to.eq(null)
//         })
//       })
//     })
//   })
// })
// describe('E10.9b', () => {
//   before(() => {
//     createSimpleFixture([[[]]]).then((e) => {
//       user = e.user
//       fixture = e.fixture
//       workstreamId = fixture.projects[fixture.projects.length - 1].id
//       matterId = fixture.matter.id
//     })
//   })
//   describe('initial setup ', () => {
//     before(() => {
//       cy.login(user)
//       setPlannedStartDateForTask(
//         new Date().toISOString(),
//         fixture.tasks[fixture.tasks.length - 1].id,
//         workstreamId,
//         matterId
//       ).then((response) => {
//         expect(response.status).to.eq(HttpStatus.OK)
//       })
//       setTaskInProgress(
//         fixture.tasks[fixture.tasks.length - 2].id,
//         workstreamId,
//         matterId
//       )
//       setTaskInProgress(
//         fixture.tasks[fixture.tasks.length - 1].id,
//         workstreamId,
//         matterId
//       )
//     })
//     it('fake test', () => {
//       expect(1).to.eq(1)
//     })
//   })
//   describe('when setting inprogress task to ns', () => {
//     it('should remove existing planned dates', () => {
//       cy.login(user)
//       setTaskNotStarted(
//         fixture.tasks[fixture.tasks.length - 1].id,
//         workstreamId,
//         matterId
//       ).then(() => {
//         getTask(
//           fixture.tasks[fixture.tasks.length - 1].id,
//           workstreamId,
//           matterId
//         ).then((res) => {
//           expect(res.body.plannedStartDate).to.eq(null)
//         })
//       })
//     })
//   })
// })
describe('E10.10a', () => {
  before(() => {
    createSimpleFixture([[[]]]).then(e => {
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
        new Date().toISOString(),
        fixture.tasks[fixture.tasks.length - 2].id,
        workstreamId,
        matterId
      ).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date().toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
      setTaskInProgress(
        fixture.tasks[fixture.tasks.length - 2].id,
        workstreamId,
        matterId
      )
      setTaskDone(fixture.tasks[1].id, workstreamId, matterId)
    })
    it('fake test', () => {
      expect(1).to.eq(1)
    })
  })
  describe('when setting done task to ip', () => {
    it('should keep inbound existing planned dates', () => {
      cy.login(user)
      setTaskInProgress(
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(() => {
        getTask(
          fixture.tasks[fixture.tasks.length - 1].id,
          workstreamId,
          matterId
        ).then(res => {
          expect(res.status).to.eq(HttpStatus.OK)
          // expect(new Date(res.body.plannedEndDate).getTime() ).to.eq(new Date()) //sub 1s diff issues
        })
      })
    })
  })
})
describe('E10.10b', () => {
  before(() => {
    createSimpleFixture([[[]]]).then(e => {
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
        new Date().toISOString(),
        fixture.tasks[fixture.tasks.length - 2].id,
        workstreamId,
        matterId
      ).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 1, 1).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
      })
      setTaskInProgress(
        fixture.tasks[fixture.tasks.length - 2].id,
        workstreamId,
        matterId
      )
      setTaskDone(
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      )
    })
    it('fake test', () => {
      expect(1).to.eq(1)
    })
  })
  describe('when setting done task to ip', () => {
    it('should keep inbound existing planned dates', () => {
      cy.login(user)
      setTaskInProgress(
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(321)
        getTask(
          fixture.tasks[fixture.tasks.length - 1].id,
          workstreamId,
          matterId
        ).then(res => {
          expect(res.body.actualEndDate).to.eq(null)
          expect(res.body.plannedEndDate).to.eq(null)
        })
      })
    })
  })
})
