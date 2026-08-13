import HttpStatus from 'http-status-codes'
import {
  createSimpleFixture,
  setPlannedEndDateForTask,
  setPlannedStartDateForTask,
} from './task-date-helpers'

describe('D1.1', () => {
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

  describe('When changing the PED to before the PSD', () => {
    it('Should not allow the update', () => {
      cy.login(user)
      setPlannedEndDateForTask(
        new Date(2025, 3, 1).toISOString(),
        fixture.tasks[0].id,
        workstreamId,
        matterId,
        false,
        false
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.BAD_REQUEST)
      })
    })
  })
})

// describe('D1.2',()=>{
//   let user, fixture, workstreamId, matterId
//   before(() => {
//     createSimpleFixture([[]]).then(e => {
//       user = e.user
//       fixture = e.fixture
//       workstreamId = fixture.projects[0].id
//       matterId = fixture.matter.id
//     })
//   })
//   describe('initial setup ', () => {
//     before(() => {
//       cy.login(user)
//       setPlannedStartDateForTask(
//         new Date(2025, 3, 15).toISOString(),
//         fixture.tasks[0].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       setPlannedEndDateForTask(
//         new Date(2025, 4, 31).toISOString(),
//         fixture.tasks[0].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//     })
//   })

//   describe('When changing the PED to before the PSD',()=>{
//     it('Should not allow the update',()=>{
//       setPlannedEndDateForTask(
//         new Date(2025, 3, 10).toISOString(),
//         fixture.tasks[0].id,
//         workstreamId,
//         matterId
//         ).then(res => {
//           expect(res.status).to.eq(HttpStatus.BAD_REQUEST)
//         })
//     })
//   })
// })

describe('D2.1', () => {
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
  })

  describe('When changing the PED to before the PSD', () => {
    it('Should not allow the update', () => {
      setPlannedStartDateForTask(
        new Date(2025, 5, 31).toISOString(),
        fixture.tasks[0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })
})
// describe('D2.2',()=>{
//   let user, fixture, workstreamId, matterId
//   before(() => {
//     createSimpleFixture([[]]).then(e => {
//       user = e.user
//       fixture = e.fixture
//       workstreamId = fixture.projects[0].id
//       matterId = fixture.matter.id
//     })
//   })
//   describe('initial setup ', () => {
//     before(() => {
//       cy.login(user)
//       setPlannedStartDateForTask(
//         new Date(2025, 3, 15).toISOString(),
//         fixture.tasks[0].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       setPlannedEndDateForTask(
//         new Date(2025, 4, 31).toISOString(),
//         fixture.tasks[0].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//     })
//   })

//   describe('When changing the PED to before the PSD',()=>{
//     it('Should not allow the update',()=>{
//       setPlannedEndDateForTask(
//         new Date(2025, 3, 10).toISOString(),
//         fixture.tasks[0].id,
//         workstreamId,
//         matterId
//         ).then(res => {
//           expect(res.status).to.eq(HttpStatus.BAD_REQUEST)
//         })
//     })
//   })
// })
