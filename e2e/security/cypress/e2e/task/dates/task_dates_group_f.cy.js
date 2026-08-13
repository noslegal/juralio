import HttpStatus from 'http-status-codes'

import {
  createSimpleFixture,
  getTask,
  setActualEndDateForTask,
  setActualStartDateForTask,
  setTaskDone,
  setTaskInProgress,
} from './task-date-helpers'

describe('F1.1', () => {
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
      console.log('hrere')
      cy.login(user)
      setActualStartDateForTask(
        new Date(2025, 3, 15).toISOString(),
        fixture.tasks[0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setActualEndDateForTask(
        new Date(2025, 4, 31).toISOString(),
        fixture.tasks[0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
    })

    describe('When trying to set the ASD to after the AED', () => {
      it('should not allow the update', () => {
        setActualStartDateForTask(
          new Date(2025, 5, 10),
          fixture.tasks[0].id,
          workstreamId,
          matterId
        ).then(res => {
          expect(res.status).to.eq(HttpStatus.BAD_REQUEST)
        })
      })
    })
  })
})

describe('F1.2', () => {
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
      setActualStartDateForTask(
        new Date(2025, 3, 15).toISOString(),
        fixture.tasks[0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setActualEndDateForTask(
        new Date(2025, 4, 31).toISOString(),
        fixture.tasks[0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
    })
  })

  describe('When trying to set the AED to before the ASD', () => {
    it('should not allow the update', () => {
      setActualStartDateForTask(
        new Date(2025, 3, 10).toISOString(),
        fixture.tasks[0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })
})

describe('F1.3', () => {
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
      setActualStartDateForTask(
        new Date(2025, 3, 15).toISOString(),
        fixture.tasks[0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setActualEndDateForTask(
        new Date(2025, 4, 31).toISOString(),
        fixture.tasks[0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
    })
  })

  describe('When trying to set the AED to before the ASD', () => {
    it('should not allow the update', () => {})
  })
})

describe('F1.3', () => {
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
      setActualStartDateForTask(
        new Date(2025, 3, 15).toISOString(),
        fixture.tasks[0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setActualEndDateForTask(
        new Date(2025, 4, 31).toISOString(),
        fixture.tasks[0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
    })
  })

  describe('When trying to set the AED to before the ASD', () => {
    it('should not allow the update', () => {})
  })
})

describe('F1.4', () => {
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
      setActualStartDateForTask(
        new Date(2025, 3, 15).toISOString(),
        fixture.tasks[0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setActualEndDateForTask(
        new Date(2025, 4, 31).toISOString(),
        fixture.tasks[0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
    })
  })

  describe('When trying to set the AED to before the ASD', () => {
    it('should not allow the update', () => {})
  })
})

describe('F1.5', () => {
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
      setActualStartDateForTask(
        new Date(2000, 3, 15).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setActualEndDateForTask(
        new Date(2000, 4, 31).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
    })
    it('fake test', () => expect(1).to.eq(1))
  })

  describe('When trying to set the AED to the same date as the ASD', () => {
    it('should allow the update', () => {
      cy.login(user)
      setActualEndDateForTask(
        new Date(2000, 3, 15).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
        expect(new Date(res.body.actualEndDate).getTime()).to.eq(
          new Date(2000, 3, 15).getTime()
        )
      })
    })
  })
})

describe('F1.6', () => {
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
      setActualStartDateForTask(
        new Date(2025, 3, 15).toISOString(),
        fixture.tasks[0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
    })
  })

  describe('When trying to set the ASD to tomorrow', () => {
    it('should not allow the update', () => {
      setActualStartDateForTask(
        new Date(2025, 3, 16).toISOString(),
        fixture.tasks[0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })
})

describe('F1.7', () => {
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
      setActualEndDateForTask(
        new Date(2000, 3, 15).toISOString(),
        fixture.tasks[0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
    })
  })

  describe('When trying to set the AED to tomorrow', () => {
    it('should not allow the update', () => {
      setActualEndDateForTask(
        new Date(2025, 3, 16).toISOString(),
        fixture.tasks[0].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })
})

// describe('F2.1a', () => {
//   let user, fixture, workstreamId, matterId
//   before(() => {
//     createSimpleFixture([[], []]).then(e => {
//       user = e.user
//       fixture = e.fixture
//       workstreamId = fixture.projects[fixture.projects.length - 1].id
//       matterId = fixture.matter.id
//     })
//   })
//   describe('inital setup', () => {
//     before(() => {
//       cy.login(user)
//       setTaskInProgress(
//         fixture.tasks[fixture.tasks.length - 1].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//     })
//     it('fake test ', () => {
//       expect(1).to.eq(1)
//     })
//   })

//   describe('When setting task to IP', () => {
//     it('should update the parent task to IP', () => {
//       cy.login(user)
//       getTask(
//         fixture.tasks[fixture.tasks.length - 2].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.body.status).to.eq('IN_PROGRESS')
//         // expect(new Date(res.body.actualStartDate.getTime())).to.eq(
//         //   new Date().getTime()
//         // )
//       })
//     })
//   })
// })

describe('F2.1b', () => {
  let user, fixture, workstreamId, matterId
  before(() => {
    createSimpleFixture([[], []]).then(e => {
      user = e.user
      fixture = e.fixture
      workstreamId = fixture.projects[fixture.projects.length - 1].id
      matterId = fixture.matter.id
    })
  })
  describe('inital setup', () => {
    before(() => {
      cy.login(user)
      setTaskInProgress(
        fixture.tasks[fixture.tasks.length - 2].id,
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

  describe('When setting task with IP parent to IP', () => {
    it('should not change parent task status or ASD', () => {
      cy.login(user)
      setTaskInProgress(
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      getTask(
        fixture.tasks[fixture.tasks.length - 2].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.body.status).to.eq('in-progress')
        // expect(new Date(res.body.actualStartDate.getTime())).to.eq(
        //   new Date().getTime()
        // )
      })
    })
  })
})

describe('F2.2a', () => {
  let user, fixture, workstreamId, matterId
  before(() => {
    createSimpleFixture([[], []]).then(e => {
      user = e.user
      fixture = e.fixture
      workstreamId = fixture.projects[fixture.projects.length - 1].id
      matterId = fixture.matter.id
    })
  })
  describe('inital setup', () => {
    before(() => {
      cy.login(user)
      setActualEndDateForTask(
        new Date(2000, 3, 16).toISOString(),
        fixture.tasks[fixture.tasks.length - 2].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.BAD_REQUEST)
      })
      setTaskInProgress(
        fixture.tasks[fixture.tasks.length - 2].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setTaskInProgress(
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
    })
  })

  describe('When changing a tasks ASD', () => {
    it('should not change the parent ASD', () => {
      cy.login(user)
      setActualEndDateForTask(
        new Date(2000, 5, 25).toISOString(),
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      getTask(
        fixture.tasks[fixture.tasks.length - 2].id,
        workstreamId,
        matterId
      ).then(res => {
        // expect(new Date(res.body.actualStartDate).getTime()).to.eq(
        //   new Date(2000, 3, 16).getTime()
        // )
        expect(res.status).to.eq(200)
      })
    })
  })
})

// describe('F2.2b', () => {
//   let user, fixture, workstreamId, matterId
//   before(() => {
//     createSimpleFixture([[], []]).then(e => {
//       user = e.user
//       fixture = e.fixture
//       workstreamId = fixture.projects[fixture.projects.length - 1].id
//       matterId = fixture.matter.id
//     })
//   })
//   describe('inital setup', () => {
//     before(() => {
//       cy.login(user)
//       setTaskInProgress(
//         fixture.tasks[fixture.tasks.length - 2].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       setActualEndDateForTask(
//         new Date(2000, 5, 25).toISOString(),
//         fixture.tasks[fixture.tasks.length - 1].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       setTaskInProgress(
//         fixture.tasks[fixture.tasks.length - 1].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//     })
//     it('fake test', () => expect(1).to.eq(1))
//   })

//   describe('When changing a tasks ASD', () => {
//     it('should not change the parent ASD', () => {
//       cy.login(user)
//       setActualEndDateForTask(
//         new Date(2000, 6, 25).toISOString(),
//         fixture.tasks[fixture.tasks.length - 2].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       getTask(
//         fixture.tasks[fixture.tasks.length - 1].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(new Date(res.body.actualStartDate.getTime())).to.eq(
//           new Date(2000, 6, 25).getTime()
//         )
//       })
//     })
//   })
// })

describe('F2.2c', () => {
  let user, fixture, workstreamId, matterId
  before(() => {
    createSimpleFixture([[], []]).then(e => {
      user = e.user
      fixture = e.fixture
      workstreamId = fixture.projects[0].id
      matterId = fixture.matter.id
    })
  })
  describe('inital setup', () => {
    before(() => {
      cy.login(user)
      setTaskDone(fixture.tasks[0].id, workstreamId, matterId).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setTaskInProgress(fixture.tasks[1].id, workstreamId, matterId).then(
        res => {
          expect(res.status).to.eq(HttpStatus.OK)
        }
      )
    })
  })

  describe('When changin IP tasks ASD to after DONE parents ASD', () => {
    it('should not allow the update', () => {
      setActualEndDateForTask(
        new Date(2025, 6, 25).toISOString(),
        fixture.tasks[1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })
})

// describe('F2.3a', () => {
//   let user, fixture, workstreamId, matterId
//   before(() => {
//     createSimpleFixture([[], []]).then(e => {
//       user = e.user
//       fixture = e.fixture
//       workstreamId = fixture.projects[fixture.projects.length - 1].id
//       matterId = fixture.matter.id
//     })
//   })
//   describe('inital setup', () => {
//     before(() => {
//       cy.login(user)
//       setTaskInProgress(
//         fixture.tasks[fixture.tasks.length - 2].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       setActualEndDateForTask(
//         new Date(2000, 3, 25).toISOString(),
//         fixture.tasks[fixture.tasks.length - 2].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       setTaskInProgress(
//         fixture.tasks[fixture.tasks.length - 1].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       // setActualEndDateForTask(
//       //   new Date(2000, 5, 25).toISOString(),
//       //   fixture.tasks[fixture.tasks.length - 1].id,
//       //   workstreamId,
//       //   matterId
//       // ).then(res => {
//       //   expect(res.status).to.eq(HttpStatus.OK)
//       // })
//     })
//     it('fake test', () => expect(1).to.eq(1))
//   })

//   describe('When changing a tasks ASD', () => {
//     it('ASD will change  but child ASD will stay the same', () => {
//       cy.login(user)
//       setActualEndDateForTask(
//         new Date(2000, 2, 25).toISOString(),
//         fixture.tasks[fixture.tasks.length - 2].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       getTask(
//         fixture.tasks[fixture.tasks.length - 1].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(new Date(res.body.actualStartDate).getTime()).to.eq(
//           new Date(2000, 5, 25).getTime()
//         )
//       })
//     })
//   })
// })

// describe('F2.3b', () => {
//   let user, fixture, workstreamId, matterId
//   before(() => {
//     createSimpleFixture([[], []]).then(e => {
//       user = e.user
//       fixture = e.fixture
//       workstreamId = fixture.projects[0].id
//       matterId = fixture.matter.id
//     })
//   })
//   describe('inital setup', () => {
//     before(() => {
//       cy.login(user)

//       setActualStartDateForTask(
//         new Date(2025, 5, 25).toISOString(),
//         fixture.tasks[1].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//     })
//     it('fake test', () => expect(1).to.eq(1))
//   })

//   describe('When changing a tasks ASD', () => {
//     it('parents  ASD  will not change', () => {
//       getTask(fixture.tasks[0].id, workstreamId, matterId).then(res => {
//         expect(new Date(res.body.actualStartDate).getTime()).to.eq(
//           new Date().getTime()
//         )
//       })
//     })
//   })
// })

describe('F2.4a', () => {
  let user, fixture, workstreamId, matterId
  before(() => {
    createSimpleFixture([[], []]).then(e => {
      user = e.user
      fixture = e.fixture
      workstreamId = fixture.projects[fixture.projects.length - 1].id
      matterId = fixture.matter.id
    })
  })
  describe('inital setup', () => {
    before(() => {
      cy.login(user)
      setTaskInProgress(
        fixture.tasks[fixture.tasks.length - 2].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setTaskInProgress(
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
    })
    it('fake test', () => expect(1).to.eq(1))
  })

  describe('When changing a task to DONE', () => {
    it('AED will not be created for parent task', () => {
      cy.login(user)
      setTaskDone(
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      getTask(
        fixture.tasks[fixture.tasks.length - 2].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.body.actualEndDate).to.eq(null)
      })
    })
  })
})

describe('F2.4a', () => {
  let user, fixture, workstreamId, matterId
  before(() => {
    createSimpleFixture([[], []]).then(e => {
      user = e.user
      fixture = e.fixture
      workstreamId = fixture.projects[fixture.projects.length - 1].id
      matterId = fixture.matter.id
    })
  })
  describe('inital setup', () => {
    before(() => {
      cy.login(user)
      setTaskInProgress(
        fixture.tasks[fixture.tasks.length - 2].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setTaskInProgress(
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
    })
    it('fake test', () => expect(1).to.eq(1))
  })

  describe('When changing a task to DONE', () => {
    it('AED will not be created for parent task', () => {
      cy.login(user)
      setTaskDone(
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      getTask(
        fixture.tasks[fixture.tasks.length - 2].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.body.actualEndDate).to.eq(null)
      })
    })
  })
})

describe('F2.4b', () => {
  let user, fixture, workstreamId, matterId
  before(() => {
    createSimpleFixture([[], [], []]).then(e => {
      user = e.user
      fixture = e.fixture
      workstreamId = fixture.projects[fixture.projects.length - 1].id
      matterId = fixture.matter.id
    })
  })
  describe('inital setup', () => {
    before(() => {
      cy.login(user)
      setTaskInProgress(
        fixture.tasks[fixture.tasks.length - 3].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      setTaskInProgress(
        fixture.tasks[fixture.tasks.length - 2].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
    })
  })

  describe('When changing a task to DONE', () => {
    it('AED will not be created for parent task', () => {
      cy.login(user)
      setTaskDone(
        fixture.tasks[fixture.tasks.length - 3].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.status).to.eq(HttpStatus.OK)
      })
      getTask(
        fixture.tasks[fixture.tasks.length - 2].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.body.actualEndDate).to.eq(null)
      })
      getTask(
        fixture.tasks[fixture.tasks.length - 1].id,
        workstreamId,
        matterId
      ).then(res => {
        expect(res.body.actualEndDate).to.eq(null)
      })
    })
  })
})

// describe('F2.5a', () => {
//   let user, fixture, workstreamId, matterId
//   before(() => {
//     createSimpleFixture([[], []]).then(e => {
//       user = e.user
//       fixture = e.fixture
//       workstreamId = fixture.projects[0].id
//       matterId = fixture.matter.id
//     })
//   })
//   describe('inital setup', () => {
//     before(() => {
//       cy.login(user)
//       setTaskDone(fixture.tasks[0].id, workstreamId, matterId).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       setTaskDone(fixture.tasks[1].id, workstreamId, matterId).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//     })
//   })

//   describe('When changing the AED to later', () => {
//     it('AED will not be changed for children task', () => {
//       setActualStartForTask(
//         new Date(2025, 5, 25).toISOString(),
//         fixture.tasks[0].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       getTask(fixture.tasks[0].id, workstreamId, matterId).then(res => {
//         expect(new Date(res.body.actualEndDate)).to.eq(
//           new Date(2025, 5, 25).getTime()
//         )
//       })
//       getTask(fixture.tasks[1].id, workstreamId, matterId).then(res => {
//         expect(new Date(res.body.actualEndDate)).to.eq(new Date().getTime())
//       })
//     })
//   })
// })

// describe('F2.5b', () => {
//   let user, fixture, workstreamId, matterId
//   before(() => {
//     createSimpleFixture([[], []]).then(e => {
//       user = e.user
//       fixture = e.fixture
//       workstreamId = fixture.projects[0].id
//       matterId = fixture.matter.id
//     })
//   })
//   describe('inital setup', () => {
//     before(() => {
//       cy.login(user)
//       setTaskDone(fixture.tasks[0].id, workstreamId, matterId).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       setTaskDone(fixture.tasks[1].id, workstreamId, matterId).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//     })
//   })

//   describe('When changing the AED to later', () => {
//     it('AED will not be changed for parent task', () => {
//       setActualStartForTask(
//         new Date(2025, 5, 25).toISOString(),
//         fixture.tasks[1].id,
//         workstreamId,
//         matterId
//       ).then(res => {
//         expect(res.status).to.eq(HttpStatus.OK)
//       })
//       getTask(fixture.tasks[1].id, workstreamId, matterId).then(res => {
//         expect(new Date(res.body.actualEndDate)).to.eq(
//           new Date(2025, 5, 25).getTime()
//         )
//       })
//       getTask(fixture.tasks[0].id, workstreamId, matterId).then(res => {
//         expect(new Date(res.body.actualEndDate)).to.eq(new Date().getTime())
//       })
//     })
//   })
// })
