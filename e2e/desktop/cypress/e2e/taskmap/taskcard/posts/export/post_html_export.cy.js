// import i18n from 'i18next'
// import { DATE_FORMAT_FULL } from '../../../../../../../../frontend/src/app/constants.js'
// import { generateHtml } from '../../../../../../../../frontend/src/services/export/htmlGenerator/html-generator.jsx'
// import { getDateDisplayString } from '../../../../../../../../frontend/src/services/helpers/date-helper.js'
// import {
//   generateFixture,
//   getWrapper,
// } from '../../../../../../../helpers/matterprojects/fixture_helper'
// import { addNoteToTask } from '../../../../../../../helpers/matterprojects/task_api_helper.js'
// import { createUser } from '../../../../../../../helpers/users/user_api_helper'
// import '../../../../../../../i18n'

// describe('post_html_export.cy', () => {
//   let user, authorA, authorB, fixture, appPage

//   before(() => {
//     createUser('aaa')
//       .then(u => {
//         authorA = u
//       })
//       .then(() => createUser('bbb'))
//       .then(u => {
//         authorB = u
//       })
//       .then(createUser)
//       .then(createdUser => {
//         user = createdUser
//         const seed = {
//           matter: {
//             prefix: 'taskCardTest',
//             teamMembers: [user, authorA, authorB],
//             matterAdmins: [user],
//             projects: [
//               {
//                 name: 'Test Project',
//                 tasks: [
//                   {
//                     name: 'Transfer Documents',
//                     tasks: [
//                       {
//                         name: 'Acquire evidence',
//                         properties: { status: 'not-started' },
//                       },
//                     ],
//                   },
//                 ],
//               },
//             ],
//           },
//         }
//         fixture = generateFixture(seed)
//         appPage = getWrapper(fixture)
//       })
//   })
//   describe('when visiting a basic post', () => {
//     before(() => {
//       addNoteToTask(
//         fixture.matter.id,
//         fixture.projects[0].id,
//         fixture.tasks[0].id,
//         { name: 'This is a note.', description: '<p>this is a description</p>' }
//       ).then(post => {
//         let html = generateHtml(
//           i18n.t,
//           fixture.matter,
//           fixture.projects[0],
//           fixture.tasks[0],
//           post,
//           'post'
//         )
//         cy.writeFile('test-export.html', html[0], 'utf8')
//         cy.visit('test-export.html')
//       })
//     })
//     it('visits local file', { baseUrl: null }, () => {
//       cy.visit('test-export.html')
//     })
//     describe('the document title', () => {
//       it('should be build correctly', () => {
//         cy.get('[data-test=title-post-type]').should('have.text', 'post')
//         cy.get('[data-test=title-task-name]').should(
//           'have.text',
//           'Transfer Documents'
//         )
//         cy.get('[data-test=title-task-reference-number]').should(
//           'have.text',
//           '#JUR1'
//         )
//         cy.get('[data-test=title-post-name]').should(
//           'have.text',
//           'This is a note.'
//         )
//         cy.get('[data-test=title-draft-chip]').should('exist')
//         cy.get('[data-test=title-post-last-edited-or-finalised]').should(
//           'contain.text',
//           `${getDateDisplayString(new Date(), DATE_FORMAT_FULL, true)}`
//         )
//         cy.get('[data-test=post-description]').should(
//           'contain.text',
//           'this is a description'
//         )
//       })
//     })
//   })
// })
