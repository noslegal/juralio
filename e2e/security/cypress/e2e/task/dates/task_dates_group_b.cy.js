// Stretches in NS tasks

import HttpStatus from 'http-status-codes'
import {
  createSimpleFixture,
  getTask,
  setPlannedEndDateForTask,
  setPlannedStartDateForTask,
} from './task-date-helpers'

describe('B1.1', () => {
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
        new Date(2025, 4, 31).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
    })
  })

  describe('when shifting a task into the future', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedEndDateForTask(
        new Date(2025, 5, 10).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
        expect(res.body.plannedStartDate).to.eq(null)
        expect(new Date(res.body.plannedEndDate).getTime()).to.eq(
          new Date(2025, 5, 10).getTime()
        )
      })
    })
  })
})

describe('B1.2', () => {
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
        new Date(2025, 3, 15).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 5, 10).toISOString(),
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

  describe('when shifting a task into the future', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedEndDateForTask(
        new Date(2025, 5, 18).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
        expect(new Date(res.body.plannedStartDate).getTime()).to.eq(
          new Date(2025, 3, 15).getTime()
        )
        expect(new Date(res.body.plannedEndDate).getTime()).to.eq(
          new Date(2025, 5, 18).getTime()
        )
      })
    })
  })
})

describe('B1.3', () => {
  let user, fixture, workstreamId, matterId
  before(() => {
    createSimpleFixture([[[], [], []]]).then(e => {
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
        fixture.tasks[fixture.tasks.length - 4].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 5, 18).toISOString(),
        fixture.tasks[fixture.tasks.length - 4].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 3, 15).toISOString(),
        fixture.tasks[fixture.tasks.length - 3].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 3, 25).toISOString(),
        fixture.tasks[fixture.tasks.length - 3].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 3, 20).toISOString(),
        fixture.tasks[fixture.tasks.length - 2].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedEndDateForTask(
        new Date(2025, 5, 16).toISOString(),
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

  describe('when stretching a task into the future', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedEndDateForTask(
        new Date(2025, 5, 26).toISOString(),
        fixture.tasks[fixture.tasks.length - 4].id,
        workstreamId,
        matterId,
        'stretched'
      ).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
        expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
          new Date(2025, 3, 15).getTime()
        )
        expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
          new Date(2025, 5, 26).getTime()
        )
        getTask(
          fixture.tasks[fixture.tasks.length - 3].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
            new Date(2025, 3, 15).getTime()
          )
          expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
            new Date(2025, 3, 25).getTime()
          )
        })
        getTask(
          fixture.tasks[fixture.tasks.length - 2].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
            new Date(2025, 3, 20).getTime()
          )
          expect(response.body.plannedEndDate).to.eq(null)
        })
        getTask(
          fixture.tasks[fixture.tasks.length - 1].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
            new Date(2025, 5, 16).getTime()
          )
          expect(response.body.plannedStartDate).to.eq(null)
        })
      })
    })
  })
})

describe('B1.4', () => {
  let user, fixture, workstreamId, matterId
  before(() => {
    createSimpleFixture([[[], [], []]]).then(e => {
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
        new Date(2025, 3, 14).toISOString(),
        fixture.tasks[fixture.tasks.length - 4].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 5, 26).toISOString(),
        fixture.tasks[fixture.tasks.length - 4].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 3, 15).toISOString(),
        fixture.tasks[fixture.tasks.length - 3].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 3, 27).toISOString(),
        fixture.tasks[fixture.tasks.length - 3].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 3, 20).toISOString(),
        fixture.tasks[fixture.tasks.length - 2].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedEndDateForTask(
        new Date(2025, 5, 16).toISOString(),
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

  describe('when stretching a task into the future', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedEndDateForTask(
        new Date(2025, 6, 7).toISOString(),
        fixture.tasks[fixture.tasks.length - 4].id,
        workstreamId,
        matterId
      ).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
        expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
          new Date(2025, 3, 14).getTime()
        )
        expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
          new Date(2025, 6, 7).getTime()
        )
        getTask(
          fixture.tasks[fixture.tasks.length - 3].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
            new Date(2025, 3, 15).getTime()
          )
          expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
            new Date(2025, 3, 27).getTime()
          )
        })
        getTask(
          fixture.tasks[fixture.tasks.length - 2].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
            new Date(2025, 3, 20).getTime()
          )
          expect(response.body.plannedEndDate).to.eq(null)
        })
        getTask(
          fixture.tasks[fixture.tasks.length - 1].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
            new Date(2025, 5, 16).getTime()
          )
          expect(response.body.plannedStartDate).to.eq(null)
        })
      })
    })
  })
})

describe('B1.4a', () => {
  let user, fixture, workstreamId, matterId
  before(() => {
    createSimpleFixture([[[], [], []]]).then(e => {
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
        new Date(2025, 5, 26).toISOString(),
        fixture.tasks[fixture.tasks.length - 4].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 3, 15).toISOString(),
        fixture.tasks[fixture.tasks.length - 3].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 3, 27).toISOString(),
        fixture.tasks[fixture.tasks.length - 3].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 3, 20).toISOString(),
        fixture.tasks[fixture.tasks.length - 2].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedEndDateForTask(
        new Date(2025, 5, 16).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
    })
    it('fake test', () => expect(1).to.eq(1))
  })
  describe('when stretching a task into the future', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedEndDateForTask(
        new Date(2025, 6, 7).toISOString(),
        fixture.tasks[fixture.tasks.length - 4].id,
        workstreamId,
        matterId
      ).then(response => {
        expect(response.status).to.eq(HttpStatus.OK)
        expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
          new Date(2025, 6, 7).getTime()
        )
        getTask(
          fixture.tasks[fixture.tasks.length - 3].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
            new Date(2025, 3, 15).getTime()
          )
          expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
            new Date(2025, 3, 27).getTime()
          )
        })
        getTask(
          fixture.tasks[fixture.tasks.length - 2].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
            new Date(2025, 3, 20).getTime()
          )
          expect(response.body.plannedEndDate).to.eq(null)
        })
        getTask(
          fixture.tasks[fixture.tasks.length - 1].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
            new Date(2025, 5, 16).getTime()
          )
          expect(response.body.plannedStartDate).to.eq(null)
        })
      })
    })
  })
})
// describe('B1.5', () => {
//   let user, fixture, workstreamId, matterId
//   before(() => {
//     createSimpleFixture([[[], [], [], [], [], [], [], []]]).then(e => {
//       user = e.user
//       fixture = e.fixture
//       workstreamId = fixture.projects[fixture.projects.length - 1].id
//       matterId = fixture.matter.id
//     })
//   })
//   describe('initial setup', () => {
//     before(() => {
//       cy.login(user)
//       setPlannedStartDateForTask(
//         new Date(2025, 8, 15).toISOString(),
//         fixture.tasks[fixture.tasks.length - 9].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       setPlannedEndDateForTask(
//         new Date(2025, 9, 31).toISOString(),
//         fixture.tasks[fixture.tasks.length - 9].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })

//       setPlannedStartDateForTask(
//         new Date(2025, 8, 20).toISOString(),
//         fixture.tasks[fixture.tasks.length - 8].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       setPlannedEndDateForTask(
//         new Date(2025, 9, 25).toISOString(),
//         fixture.tasks[fixture.tasks.length - 8].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })

//       setPlannedStartDateForTask(
//         new Date(2025, 8, 30).toISOString(),
//         fixture.tasks[fixture.tasks.length - 7].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       setPlannedEndDateForTask(
//         new Date(2025, 9, 20).toISOString(),
//         fixture.tasks[fixture.tasks.length - 7].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })

//       setPlannedStartDateForTask(
//         new Date(2025, 8, 21).toISOString(),
//         fixture.tasks[fixture.tasks.length - 6].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       setPlannedEndDateForTask(
//         new Date(2025, 9, 10).toISOString(),
//         fixture.tasks[fixture.tasks.length - 6].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })

//       setPlannedStartDateForTask(
//         new Date(2025, 8, 22).toISOString(),
//         fixture.tasks[fixture.tasks.length - 5].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       setPlannedEndDateForTask(
//         new Date(2025, 9, 25).toISOString(),
//         fixture.tasks[fixture.tasks.length - 5].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       setPlannedStartDateForTask(
//         new Date(2025, 8, 22).toISOString(),
//         fixture.tasks[fixture.tasks.length - 4].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       setPlannedEndDateForTask(
//         new Date(2025, 9, 26).toISOString(),
//         fixture.tasks[fixture.tasks.length - 4].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       setPlannedStartDateForTask(
//         new Date(2025, 8, 27).toISOString(),
//         fixture.tasks[fixture.tasks.length - 3].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       setPlannedStartDateForTask(
//         new Date(2025, 8, 28).toISOString(),
//         fixture.tasks[fixture.tasks.length - 2].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       setPlannedEndDateForTask(
//         new Date(2025, 9, 30).toISOString(),
//         fixture.tasks[fixture.tasks.length - 1].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       // linkTasks(
//       //   fixture.tasks[0].tasks.map(t => t.id),
//       //   fixture.tasks[0].tasks.map(t => true),
//       //   fixture.tasks[1].id.workstreamId,
//       //   matterId
//       // )
//     })
//     it('fake test', () => expect(1).to.eq(1))
//   })
//   describe('when stretching a task PED into the future', () => {
//     it('should allow the update', () => {
//       cy.login(user)
//       setPlannedEndDateForTask(
//         new Date(2025, 9, 30).toISOString(),
//         fixture.tasks[fixture.tasks.length - 8].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//         expect(new Date(res.body.plannedStartDate).getTime()).to.eq(
//           new Date(2025, 8, 30).getTime()
//         )
//         expect(new Date(res.body.plannedEndDate).getTime()).to.eq(
//           new Date(2025, 9, 30).getTime()
//         )
//         getTask(
//           fixture.tasks[fixture.tasks.length - 9].id,
//           workstreamId,
//           matterId
//         ).then(response => {
//           expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
//             new Date(2025, 8, 15).getTime()
//           )
//           expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
//             new Date(2025, 9, 31).getTime()
//           )
//         })
//         getTask(
//           fixture.tasks[fixture.tasks.length - 8].id,
//           workstreamId,
//           matterId
//         ).then(response => {
//           expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
//             new Date(2025, 8, 20).getTime()
//           )
//           expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
//             new Date(2025, 9, 30).getTime()
//           )
//         })
//         getTask(
//           fixture.tasks[fixture.tasks.length - 6].id,
//           workstreamId,
//           matterId
//         ).then(response => {
//           expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
//             new Date(2025, 9, 1).getTime()
//           )
//           expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
//             new Date(2025, 9, 20).getTime()
//           )
//         })
//         getTask(
//           fixture.tasks[fixture.tasks.length - 5],
//           workstreamId,
//           matterId
//         ).then(response => {
//           expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
//             new Date(2025, 8, 22).getTime()
//           )
//           expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
//             new Date(2025, 9, 25).getTime()
//           )
//           expect(response.body.dateLinkedToSiblings).to.eq(false)
//         })
//         getTask(
//           fixture.tasks[fixture.tasks.length - 4].id,
//           workstreamId,
//           matterId
//         ).then(response => {
//           expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
//             new Date(2025, 8, 22).getTime()
//           )
//           expect(response.body.plannedEndDate).to.eq(null)
//         })
//         getTask(
//           fixture.tasks[fixture.tasks.length - 3].id,
//           workstreamId,
//           matterId
//         ).then(response => {
//           expect(response.body.plannedStartDate).to.eq(null)
//           expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
//             new Date(2025, 9, 26).getTime()
//           )
//           expect(response.body.dateLinkedToSiblings).to.eq(false)
//         })
//       })
//       getTask(
//         fixture.tasks[fixture.tasks.length - 2].id,
//         workstreamId,
//         matterId
//       ).then(response => {
//         expect(response.body.plannedEndDate).to.eq(null)
//         expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
//           new Date(2025, 9, 27).getTime()
//         )
//         expect(response.body.dateLinkedToSiblings).to.eq(false)
//       })
//       getTask(
//         fixture.tasks[fixture.tasks.length - 1].id,
//         workstreamId,
//         matterId
//       ).then(response => {
//         expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
//           new Date(2025, 9, 28).getTime()
//         )
//         expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
//           new Date(2025, 9, 30).getTime()
//         )
//         expect(response.body.dateLinkedToSiblings).to.eq(false)
//       })
//     })
//   })
// })
describe('B2.1', () => {
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
        new Date(2025, 3, 30).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
    })
    it('fake test', () => expect(1).to.eq(1))
  })

  describe('when shifting a task into the past', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedStartDateForTask(
        new Date(2025, 3, 21).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
        expect(res.body.plannedEndDate).to.eq(null)
        expect(new Date(res.body.plannedStartDate).getTime()).to.eq(
          new Date(2025, 3, 21).getTime()
        )
      })
    })
  })
})
describe('B2.2', () => {
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
        new Date(2025, 3, 21).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 4, 15).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
    })
    it('fake test', () => expect(1).to.eq(1))
  })

  describe('when shifting a task into the past', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedStartDateForTask(
        new Date(2025, 3, 16).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
        expect(new Date(res.body.plannedEndDate).getTime()).to.eq(
          new Date(2025, 4, 15).getTime()
        )
        expect(new Date(res.body.plannedStartDate).getTime()).to.eq(
          new Date(2025, 3, 16).getTime()
        )
      })
    })
  })
})
// describe('B2.3', () => {
//   let user, fixture, workstreamId, matterId
//   before(() => {
//     createSimpleFixture([[], [], []]).then(e => {
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
//         new Date(2025, 3, 16).toISOString(),
//         fixture.tasks[fixture.tasks.length - 3].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       setPlannedEndDateForTask(
//         new Date(2025, 4, 15).toISOString(),
//         fixture.tasks[fixture.tasks.length - 3].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })

//       setPlannedStartDateForTask(
//         new Date(2025, 3, 18).toISOString(),
//         fixture.tasks[fixture.tasks.length - 2].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       setPlannedEndDateForTask(
//         new Date(2025, 3, 22).toISOString(),
//         fixture.tasks[fixture.tasks.length - 2].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })

//       setPlannedStartDateForTask(
//         new Date(2025, 3, 20).toISOString(),
//         fixture.tasks[fixture.tasks.length - 1].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })

//       setPlannedEndDateForTask(
//         new Date(2025, 4, 10).toISOString(),
//         fixture.tasks[fixture.tasks.length - 1].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//     })
//     it('fake test', () => expect(1).to.eq(1))
//   })

//   describe('when shifting a task into the past', () => {
//     it('should allow the update', () => {
//       cy.login(user)
//       setPlannedStartDateForTask(
//         new Date(2025, 3, 6).toISOString(),
//         fixture.tasks[fixture.tasks.length - 3].id,
//         workstreamId,
//         matterId,
//         'stretched'
//       ).then(response => {
//         expect(response.status).to.eq(HttpStatus.OK)
//         expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
//           new Date(2025, 4, 15).getTime()
//         )
//         expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
//           new Date(2025, 3, 6).getTime()
//         )
//         getTask(
//           fixture.tasks[fixture.tasks.length - 3].id,
//           workstreamId,
//           matterId
//         ).then(response => {
//           expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
//             new Date(2025, 3, 13).getTime()
//           )
//           expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
//             new Date(2025, 3, 22).getTime()
//           )
//         })
//         getTask(
//           fixture.tasks[fixture.tasks.length - 2].id,
//           workstreamId,
//           matterId
//         ).then(response => {
//           expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
//             new Date(2025, 3, 20).getTime()
//           )
//           expect(response.body.plannedEndDate).to.eq(null)
//         })
//         getTask(
//           fixture.tasks[fixture.tasks.length - 1].id,
//           workstreamId,
//           matterId
//         ).then(response => {
//           expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
//             new Date(2025, 4, 10).getTime()
//           )
//           expect(response.body.plannedStartDate).to.eq(null)
//         })
//       })
//     })
//   })
// })
describe('B2.4', () => {
  let user, fixture, workstreamId, matterId
  before(() => {
    createSimpleFixture([[[], [], []]]).then(e => {
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
        new Date(2025, 3, 6).toISOString(),
        fixture.tasks[fixture.tasks.length - 4].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 4, 15).toISOString(),
        fixture.tasks[fixture.tasks.length - 4].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 3, 13).toISOString(),
        fixture.tasks[fixture.tasks.length - 3].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 3, 22).toISOString(),
        fixture.tasks[fixture.tasks.length - 3].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 3, 20).toISOString(),
        fixture.tasks[fixture.tasks.length - 2].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedEndDateForTask(
        new Date(2025, 4, 10).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
    })
    it('fake test', () => expect(1).to.eq(1))
  })

  describe('when shifting a task into the past', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedStartDateForTask(
        new Date(2025, 2, 6).toISOString(),
        fixture.tasks[fixture.tasks.length - 4].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
        expect(new Date(res.body.plannedEndDate).getTime()).to.eq(
          new Date(2025, 4, 15).getTime()
        )
        expect(new Date(res.body.plannedStartDate).getTime()).to.eq(
          new Date(2025, 2, 6).getTime()
        )
        getTask(
          fixture.tasks[fixture.tasks.length - 3].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
            new Date(2025, 3, 13).getTime()
          )
          expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
            new Date(2025, 3, 22).getTime()
          )
        })
        getTask(
          fixture.tasks[fixture.tasks.length - 2].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
            new Date(2025, 3, 20).getTime()
          )
          expect(response.body.plannedEndDate).to.eq(null)
        })
        getTask(
          fixture.tasks[fixture.tasks.length - 1].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
            new Date(2025, 4, 10).getTime()
          )
          expect(response.body.plannedStartDate).to.eq(null)
        })
      })
    })
  })
})

describe('B2.4a', () => {
  let user, fixture, workstreamId, matterId
  before(() => {
    createSimpleFixture([[[], [], []]]).then(e => {
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
        new Date(2025, 4, 15).toISOString(),
        fixture.tasks[fixture.tasks.length - 4].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 3, 13).toISOString(),
        fixture.tasks[fixture.tasks.length - 3].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 3, 22).toISOString(),
        fixture.tasks[fixture.tasks.length - 3].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 3, 20).toISOString(),
        fixture.tasks[fixture.tasks.length - 2].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedEndDateForTask(
        new Date(2025, 4, 10).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
    })
    it('fake test', () => expect(1).to.eq(1))
  })

  describe('when shifting a task into the past', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedEndDateForTask(
        new Date(2025, 4, 30).toISOString(),
        fixture.tasks[fixture.tasks.length - 4].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
        expect(new Date(res.body.plannedEndDate).getTime()).to.eq(
          new Date(2025, 4, 30).getTime()
        )
        expect(res.body.plannedStartDate).to.eq(null)
        getTask(
          fixture.tasks[fixture.tasks.length - 3].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
            new Date(2025, 3, 13).getTime()
          )
          expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
            new Date(2025, 3, 22).getTime()
          )
        })
        getTask(
          fixture.tasks[fixture.tasks.length - 2].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
            new Date(2025, 3, 20).getTime()
          )
          expect(response.body.plannedEndDate).to.eq(null)
        })
        getTask(
          fixture.tasks[fixture.tasks.length - 1].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
            new Date(2025, 4, 10).getTime()
          )
          expect(response.body.plannedStartDate).to.eq(null)
        })
      })
    })
  })
})
describe('B2.5', () => {
  let user, fixture, workstreamId, matterId
  before(() => {
    createSimpleFixture([[[], [], []]]).then(e => {
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
        new Date(2025, 9, 15).toISOString(),
        fixture.tasks[fixture.tasks.length - 4].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 10, 30).toISOString(),
        fixture.tasks[fixture.tasks.length - 4].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 9, 20).toISOString(),
        fixture.tasks[fixture.tasks.length - 3].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 10, 30).toISOString(),
        fixture.tasks[fixture.tasks.length - 3].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })

      setPlannedStartDateForTask(
        new Date(2025, 9, 30).toISOString(),
        fixture.tasks[fixture.tasks.length - 2].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 10, 20).toISOString(),
        fixture.tasks[fixture.tasks.length - 2].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedStartDateForTask(
        new Date(2025, 9, 21).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setPlannedEndDateForTask(
        new Date(2025, 10, 20).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      // linkTasks(
      //   fixture.tasks[fixture.tasks.length - 4].tasks.map(t => t.id),
      //   fixture.tasks[fixture.tasks.length - 4].tasks.map(t => true),
      //   fixture.tasks[fixture.tasks.length - 3].id.workstreamId,
      //   matterId
      // )
    })
    it('fake test', () => expect(1).to.eq(1))
  })
  describe('when making the PSD of a subtask earlier', () => {
    it('should allow the update', () => {
      cy.login(user)
      setPlannedStartDateForTask(
        new Date(2025, 9, 15).toISOString(),
        fixture.tasks[fixture.tasks.length - 2].id,
        workstreamId,
        matterId
      ).then(response => {
        expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
          new Date(2025, 10, 20).getTime()
        )
        expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
          new Date(2025, 9, 15).getTime()
        )
        getTask(
          fixture.tasks[fixture.tasks.length - 4].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
            new Date(2025, 9, 15).getTime()
          )
          expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
            new Date(2025, 10, 30).getTime()
          )
        })
        getTask(
          fixture.tasks[fixture.tasks.length - 3].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
            new Date(2025, 9, 20).getTime()
          )
          expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
            new Date(2025, 10, 30).getTime()
          )
        })
        getTask(
          fixture.tasks[fixture.tasks.length - 1].id,
          workstreamId,
          matterId
        ).then(response => {
          expect(new Date(response.body.plannedStartDate).getTime()).to.eq(
            new Date(2025, 9, 21).getTime()
          )
          expect(new Date(response.body.plannedEndDate).getTime()).to.eq(
            new Date(2025, 10, 20).getTime()
          )
        })
      })
    })
  })
})
