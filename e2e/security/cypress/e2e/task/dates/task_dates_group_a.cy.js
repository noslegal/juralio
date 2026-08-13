// Shilfts in NS tasks
import HttpStatus from 'http-status-codes'
import {
  createSimpleFixture,
  setPlannedEndDateForTask,
  setPlannedStartDateForTask,
} from './task-date-helpers'

describe('A1.0', () => {
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
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 4, 31).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
    })
    it('fake task', () => {
      expect(1).to.eq(1)
    })
  })

  //   describe('when shifting a task into the future', () => {
  //     it('should allow the update', () => {
  //       cy.login(user)
  //       shiftTaskIntoTheFuture(
  //         'planned',
  //         1,
  //         fixture.tasks[fixture.tasks.length - 1].id,
  //         workstreamId,
  //         matterId
  //       ).then(res => {
  //         expect(res.status).to.eq(HttpStatus.OK)
  //         expect(new Date(res.body.plannedStartDate).getTime()).to.eq(
  //           new Date(2025, 3, 16).getTime()
  //         )
  //         expect(new Date(res.body.plannedEndDate).getTime()).to.eq(
  //           new Date(2025, 5, 1).getTime()
  //         )
  //       })
  //     })
  //   })
})

// describe('A1.1', () => {
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
//     it('fake task', () => {
//       expect(1).to.eq(1)
//     })
//   })

//   describe('when shifting a task into the past', () => {
//     it('should allow the update', () => {
//       shiftTaskIntoThePast(
//         'planned',
//         10,
//         fixture.tasks[0].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//         expect(new Date(res.body.plannedStartDate).getTime()).to.eq(
//           new Date(2025, 3, 5).getTime()
//         )
//         expect(new Date(res.body.plannedEndDate).getTime()).to.eq(
//           new Date(2025, 4, 21).getTime()
//         )
//       })
//     })
//   })
// })
// describe('A1.2', () => {
//   let user, fixture, workstreamId, matterId
//   before(() => {
//     createSimpleFixture([[[], [], []]]).then(e => {
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
//         new Date(2025, 3, 5).toISOString(),
//         fixture.tasks[0].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       setPlannedEndDateForTask(
//         new Date(2025, 4, 21).toISOString(),
//         fixture.tasks[0].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })

//       setPlannedStartDateForTask(
//         new Date(2025, 3, 10).toISOString(),
//         fixture.tasks[1].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       setPlannedEndDateForTask(
//         new Date(2025, 4, 14).toISOString(),
//         fixture.tasks[1].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })

//       setPlannedStartDateForTask(
//         new Date(2025, 3, 12).toISOString(),
//         fixture.tasks[2].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })

//       setPlannedEndDateForTask(
//         new Date(2025, 4, 14).toISOString(),
//         fixture.tasks[3].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//     })
//     it('fake task', () => {
//       expect(1).to.eq(1)
//     })
//   })

//   describe('when shifting a task 7 days into the past', () => {
//     it('should allow the update', () => {
//       shiftTaskIntoThePast(
//         'planned',
//         7,
//         fixture.tasks[0].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//         expect(new Date(res.body.plannedStartDate).getTime()).to.eq(
//           new Date(2025, 2, 29).getTime()
//         )
//         expect(new Date(res.body.plannedEndDate).getTime()).to.eq(
//           new Date(2025, 4, 14).getTime()
//         )

//         getTask(fixture.tasks[1], workstreamId, matterId).then(response => {
//           expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
//             new Date(2025, 3, 3).getTime()
//           )
//           expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
//             new Date(2025, 3, 7).getTime()
//           )
//         })
//         getTask(fixture.tasks[2], workstreamId, matterId).then(response => {
//           expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
//             new Date(2025, 3, 5).getTime()
//           )
//           expect(response.body.plannedEndDate).to.eq(null)
//         })
//         getTask(fixture.tasks[2], workstreamId, matterId).then(response => {
//           expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
//             new Date(2025, 3, 7).getTime()
//           )
//           expect(response.body.plannedStartDate).to.eq(null)
//         })
//       })
//     })
//   })
// })
// describe('A1.3', () => {
//   let user, fixture, workstreamId, matterId
//   before(() => {
//     createSimpleFixture([[[], [], [], [], [], [], [], []]]).then(e => {
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
//         new Date(2025, 8, 15).toISOString(),
//         fixture.tasks[0].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       setPlannedEndDateForTask(
//         new Date(2025, 9, 31).toISOString(),
//         fixture.tasks[0].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })

//       setPlannedStartDateForTask(
//         new Date(2025, 8, 20).toISOString(),
//         fixture.tasks[1].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       setPlannedEndDateForTask(
//         new Date(2025, 9, 25).toISOString(),
//         fixture.tasks[1].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })

//       setPlannedStartDateForTask(
//         new Date(2025, 8, 30).toISOString(),
//         fixture.tasks[2].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       setPlannedEndDateForTask(
//         new Date(2025, 9, 20).toISOString(),
//         fixture.tasks[2].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       setPlannedStartDateForTask(
//         new Date(2025, 8, 21).toISOString(),
//         fixture.tasks[3].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       setPlannedEndDateForTask(
//         new Date(2025, 9, 10).toISOString(),
//         fixture.tasks[3].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       setPlannedStartDateForTask(
//         new Date(2025, 8, 22).toISOString(),
//         fixture.tasks[4].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       setPlannedEndDateForTask(
//         new Date(2025, 9, 25).toISOString(),
//         fixture.tasks[4].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       setPlannedStartDateForTask(
//         new Date(2025, 8, 22).toISOString(),
//         fixture.tasks[5].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })

//       setPlannedEndDateForTask(
//         new Date(2025, 9, 11).toISOString(),
//         fixture.tasks[6].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })

//       setPlannedEndDateForTask(
//         new Date(2025, 9, 26).toISOString(),
//         fixture.tasks[7].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       setPlannedStartDateForTask(
//         new Date(2025, 9, 28).toISOString(),
//         fixture.tasks[8].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       setPlannedEndDateForTask(
//         new Date(2025, 9, 30).toISOString(),
//         fixture.tasks[8].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//     })
//     it('fake task', () => {
//       expect(1).to.eq(1)
//     })
//     // linkTasks(
//     //   fixture.tasks[0].tasks.map(t => t.id),
//     //   fixture.tasks[0].tasks.map(t => true),
//     //   fixture.tasks[1].id.workstreamId,
//     //   matterId
//     // )
//   })

//   describe('when shifting a task 10 days into the past', () => {
//     it('should allow the update', () => {
//       shiftTaskIntoThePast(
//         'planned',
//         10,
//         fixture.tasks[2].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//         expect(new Date(res.body.plannedStartDate).getTime()).to.eq(
//           new Date(2025, 8, 20).getTime()
//         )
//         expect(new Date(res.body.plannedEndDate).getTime()).to.eq(
//           new Date(2025, 9, 10).getTime()
//         )
//       })
//     })
//     getTask(fixture.tasks[0], workstreamId, matterId).then(response => {
//       expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
//         new Date(2025, 8, 15).getTime()
//       )
//       expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
//         new Date(2025, 9, 31).getTime()
//       )
//     })
//     getTask(fixture.tasks[1], workstreamId, matterId).then(response => {
//       expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
//         new Date(2025, 8, 20).getTime()
//       )
//       expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
//         new Date(2025, 9, 10).getTime()
//       )
//     })
//     getTask(fixture.tasks[3], workstreamId, matterId).then(response => {
//       expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
//         new Date(2025, 8, 21).getTime()
//       )
//       expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
//         new Date(2025, 9, 10).getTime()
//       )
//       expect(response.body.dateLinkedToSiblings).to.eq(false)
//     })
//     getTask(fixture.tasks[4], workstreamId, matterId).then(response => {
//       expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
//         new Date(2025, 8, 22).getTime()
//       )
//       expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
//         new Date(2025, 9, 25).getTime()
//       )
//       expect(response.body.dateLinkedToSiblings).to.eq(false)
//     })
//     getTask(fixture.tasks[5], workstreamId, matterId).then(response => {
//       expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
//         new Date(2025, 8, 22).getTime()
//       )
//       expect(response.body.plannedEndDate).to.eq(null)
//       expect(response.body.dateLinkedToSiblings).to.eq(false)
//     })
//     getTask(fixture.tasks[6], workstreamId, matterId).then(response => {
//       expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
//         new Date(2025, 9, 1).getTime()
//       )
//       expect(response.body.plannedStartDate).to.eq(null)
//       expect(response.body.dateLinkedToSiblings).to.eq(true)
//     })
//     getTask(fixture.tasks[7], workstreamId, matterId).then(response => {
//       expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
//         new Date(2025, 9, 16).getTime()
//       )
//       expect(response.body.plannedStartDate).to.eq(null)
//       expect(response.body.dateLinkedToSiblings).to.eq(true)
//     })
//     getTask(fixture.tasks[8], workstreamId, matterId).then(response => {
//       expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
//         new Date(2025, 9, 20).getTime()
//       )
//       expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
//         new Date(2025, 9, 18).getTime()
//       )
//       expect(response.body.dateLinkedToSiblings).to.eq(true)
//     })
//   })
// })
// describe('A2.1', () => {
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
//     it('fake task', () => {
//       expect(1).to.eq(1)
//     })
//   })

//   describe('when shifting a task into the future', () => {
//     it('should allow the update', () => {
//       shiftTaskIntoTheFuture(
//         'planned',
//         10,
//         fixture.tasks[0].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//         expect(new Date(res.body.plannedStartDate).getTime()).to.eq(
//           new Date(2025, 3, 25).getTime()
//         )
//         expect(new Date(res.body.plannedEndDate).getTime()).to.eq(
//           new Date(2025, 5, 14).getTime()
//         )
//       })
//     })
//   })
// })
// describe('A2.2', () => {
//   let user, fixture, workstreamId, matterId
//   before(() => {
//     createSimpleFixture([[[], [], []]]).then(e => {
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
//         new Date(2025, 3, 25).toISOString(),
//         fixture.tasks[0].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       setPlannedEndDateForTask(
//         new Date(2025, 5, 14).toISOString(),
//         fixture.tasks[0].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })

//       setPlannedStartDateForTask(
//         new Date(2025, 3, 25).toISOString(),
//         fixture.tasks[1].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       setPlannedEndDateForTask(
//         new Date(2025, 5, 10).toISOString(),
//         fixture.tasks[1].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })

//       setPlannedStartDateForTask(
//         new Date(2025, 3, 12).toISOString(),
//         fixture.tasks[2].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })

//       setPlannedEndDateForTask(
//         new Date(2025, 3, 14).toISOString(),
//         fixture.tasks[3].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//     })
//     it('fake task', () => {
//       expect(1).to.eq(1)
//     })
//   })

//   describe('when shifting a task into the future', () => {
//     it('should allow the update', () => {
//       shiftTaskIntoTheFuture(
//         'planned',
//         7,
//         fixture.tasks[0].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//         expect(new Date(res.body.plannedStartDate).getTime()).to.eq(
//           new Date(2025, 4, 1).getTime()
//         )
//         expect(new Date(res.body.plannedEndDate).getTime()).to.eq(
//           new Date(2025, 5, 17).getTime()
//         )
//         getTask(fixture.tasks[1], workstreamId, matterId).then(response => {
//           expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
//             new Date(2025, 3, 17).getTime()
//           )
//           expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
//             new Date(2025, 3, 21).getTime()
//           )
//         })
//         getTask(fixture.tasks[2], workstreamId, matterId).then(response => {
//           expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
//             new Date(2025, 3, 19).getTime()
//           )
//           expect(response.body.plannedEndDate).to.eq(null)
//         })
//         getTask(fixture.tasks[2], workstreamId, matterId).then(response => {
//           expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
//             new Date(2025, 3, 21).getTime()
//           )
//           expect(response.body.plannedStartDate).to.eq(null)
//         })
//       })
//     })
//   })
// })
// describe('A2.3', () => {
//   let user, fixture, workstreamId, matterId
//   before(() => {
//     createSimpleFixture([[[], [], [], [], [], [], [], []]]).then(e => {
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
//         new Date(2025, 8, 15).toISOString(),
//         fixture.tasks[0].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       setPlannedEndDateForTask(
//         new Date(2025, 9, 31).toISOString(),
//         fixture.tasks[0].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })

//       setPlannedStartDateForTask(
//         new Date(2025, 8, 20).toISOString(),
//         fixture.tasks[1].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       setPlannedEndDateForTask(
//         new Date(2025, 9, 25).toISOString(),
//         fixture.tasks[1].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       setPlannedStartDateForTask(
//         new Date(2025, 8, 30).toISOString(),
//         fixture.tasks[2].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       setPlannedEndDateForTask(
//         new Date(2025, 9, 20).toISOString(),
//         fixture.tasks[2].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })

//       setPlannedStartDateForTask(
//         new Date(2025, 8, 21).toISOString(),
//         fixture.tasks[3].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       setPlannedEndDateForTask(
//         new Date(2025, 9, 10).toISOString(),
//         fixture.tasks[3].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })

//       setPlannedStartDateForTask(
//         new Date(2025, 8, 22).toISOString(),
//         fixture.tasks[4].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       setPlannedEndDateForTask(
//         new Date(2025, 9, 25).toISOString(),
//         fixture.tasks[4].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })

//       setPlannedStartDateForTask(
//         new Date(2025, 8, 22).toISOString(),
//         fixture.tasks[5].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })

//       setPlannedEndDateForTask(
//         new Date(2025, 9, 11).toISOString(),
//         fixture.tasks[6].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })

//       setPlannedEndDateForTask(
//         new Date(2025, 9, 26).toISOString(),
//         fixture.tasks[7].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })

//       setPlannedStartDateForTask(
//         new Date(2025, 9, 27).toISOString(),
//         fixture.tasks[8].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       linkTasks(
//         fixture.tasks[0].tasks.map(t => t.id),
//         fixture.tasks[0].tasks.map(t => true),
//         fixture.tasks[1].id.workstreamId,
//         matterId
//       )
//     })
//     it('fake task', () => {
//       expect(1).to.eq(1)
//     })
//   })
//   describe('when moving 10 days into the future', () => {
//     it('should allow the update', () => {
//       shiftTaskIntoTheFuture(
//         'planned',
//         7,
//         fixture.tasks[2].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//         expect(new Date(res.body.plannedStartDate).getTime()).to.eq(
//           new Date(2025, 9, 10).getTime()
//         )
//         expect(new Date(res.body.plannedEndDate).getTime()).to.eq(
//           new Date(2025, 9, 30).getTime()
//         )
//         getTask(fixture.tasks[0], workstreamId, matterId).then(response => {
//           expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
//             new Date(2025, 8, 15).getTime()
//           )
//           expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
//             new Date(2025, 9, 31).getTime()
//           )
//           expect(response.body.dateLinkedToSiblings).to.eq(true)
//         })
//         getTask(fixture.tasks[1], workstreamId, matterId).then(response => {
//           expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
//             new Date(2025, 8, 20).getTime()
//           )
//           expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
//             new Date(2025, 9, 30).getTime()
//           )
//           expect(response.body.dateLinkedToSiblings).to.eq(true)
//         })
//         getTask(fixture.tasks[3], workstreamId, matterId).then(response => {
//           expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
//             new Date(2025, 9, 1).getTime()
//           )
//           expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
//             new Date(2025, 9, 20).getTime()
//           )
//           expect(response.body.dateLinkedToSiblings).to.eq(true)
//         })
//         getTask(fixture.tasks[4], workstreamId, matterId).then(response => {
//           expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
//             new Date(2025, 8, 22).getTime()
//           )
//           expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
//             new Date(2025, 9, 25).getTime()
//           )
//           expect(response.body.dateLinkedToSiblings).to.eq(false)
//         })
//         getTask(fixture.tasks[5], workstreamId, matterId).then(response => {
//           expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
//             new Date(2025, 9, 2).getTime()
//           )
//           expect(response.body.plannedEndDate).to.eq(null)
//           expect(response.body.dateLinkedToSiblings).to.eq(true)
//         })
//         getTask(fixture.tasks[6], workstreamId, matterId).then(response => {
//           expect(response.body.plannedStartDate).to.eq(null)
//           expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
//             new Date(2025, 9, 21).getTime()
//           )
//           expect(response.body.dateLinkedToSiblings).to.eq(true)
//         })
//         getTask(fixture.tasks[7], workstreamId, matterId).then(response => {
//           expect(response.body.plannedStartDate).to.eq(null)
//           expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
//             new Date(2025, 9, 26).getTime()
//           )
//           expect(response.body.dateLinkedToSiblings).to.eq(false)
//         })
//         getTask(fixture.tasks[8], workstreamId, matterId).then(response => {
//           expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
//             new Date(2025, 9, 27).getTime()
//           )
//           expect(response.body.plannedEndDate).to.eq(null)
//           expect(response.body.dateLinkedToSiblings).to.eq(false)
//         })
//       })
//     })
//   })
// })
