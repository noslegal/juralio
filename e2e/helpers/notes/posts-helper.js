import { addNoteToTask } from '../matterprojects/task_api_helper'

const largeText =
  '<p>This is a big note. Don\'t worry too much as it is still <em>DRAFT</em>.</p><p><strong><u>TAKE NOTICE OF ME</u></strong></p><p><strong>Monkey</strong> is a common name that may refer to groups or species of mammals, in part, the simians of infraorder Simiiformes. The term is applied descriptively to groups of primates, such as families of New World monkeys and Old World monkeys. Many monkey species are tree-dwelling (arboreal), although there are species that live primarily on the ground, such as baboons. Most species are also active during the day (diurnal). Monkeys are generally considered to be intelligent, especially the Old World monkeys of Catarrhini.</p><p>This is a square list:</p><ul style="list-style-type:square;"><li>King kong</li><li>Ceaser</li><li>George</li><li>Jack</li><li>Jill</li></ul><p>This is a circle list:</p><ul><li>King kong</li><li>Ceaser</li><li>George</li><li>Jack</li><li>Jill</li></ul><p>What a way to test a post!</p><p style="color: rgb(65, 65, 65); font-family: sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial;">This is a list:</p><ul style="color: rgb(65, 65, 65); font-family: sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial;"><li>King kong</li><li>Ceaser</li><li>George</li><li>Jack</li><li>Jill</li></ul><p style="color: rgb(65, 65, 65); font-family: sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial;">This is a list:</p><ul style="color: rgb(65, 65, 65); font-family: sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-style: initial; text-decoration-color: initial;"><li>King kong</li><li>Ceaser</li><li>George</li><li>Jack</li><li>Jill</li></ul><p><strong>Monkey</strong> is a common name that may refer to groups or species of mammals, in part, the simians of infraorder Simiiformes. The term is applied descriptively to groups of primates, such as families of New World monkeys and Old World monkeys. Many monkey species are tree-dwelling (arboreal), although there are species that live primarily on the ground, such as baboons. Most species are also active during the day (diurnal). Monkeys are generally considered to be intelligent, especially the Old World monkeys of Catarrhini.</p><p><br></p><p><strong><u>Monkey</u></strong><u>&nbsp;is a common name that may refer to groups or species of mammals, in part, the simians of infraorder Simiiformes. The term is applied descriptively to groups of primates, such as families of New World monkeys and Old World monkeys. Many monkey species are tree-dwelling (arboreal), although there are species that live primarily on the ground, such as baboons. Most species are also active during the day (diurnal). Monkeys are generally considered to be intelligent, especially the Old World monkeys of Catarrhini.</u></p><p><br></p><p><strong>Monkey</strong> is a common name that may refer to groups or species of mammals, in part, the simians of infraorder Simiiformes. The term is applied descriptively to groups of primates, such as families of New World monkeys and Old World monkeys. Many monkey species are tree-dwelling (arboreal), although there are species that live primarily on the ground, such as baboons. Most species are also active during the day (diurnal). Monkeys are generally considered to be intelligent, especially the Old World monkeys of Catarrhini.<br></p><p><br></p><p><br></p><p><br></p>'

// eslint-disable-next-line import/prefer-default-export
export const addSelectionOfPosts = (matterId, projectId, taskId) => {
  const addPost = content => {
    addNoteToTask(matterId, projectId, taskId, content)
    cy.wait(2000) //Backend route was not working.
  }

  addPost({
    name: 'A Large new note',
    description: largeText + largeText + largeText,
  })
  addPost({ name: 'Another ace new note - no description' })
  addPost({
    name: 'This is a link.',
    url: 'http://www.bing.com',
    type: 'Link',
    description: '<p>Best <b>search</b> engine in the world.</p>',
  })
  addPost({
    name: 'Word Document.',
    url: 'http://www.bing.com',
    type: 'Word document',
    description: '<p>Best search engine in the world.</p>',
  })
  addPost({
    name: 'Image of plans',
    url: 'http://www.bing.com',
    type: 'Link',
    description: '<p>Best search engine in the world.</p>',
  })
  addPost({
    name: 'CCTV Video',
    url: 'http://www.bing.com',
    type: 'Link',
    description: '<p>Best search engine in the world.</p>',
  })

  addPost({
    name: 'Key Presentation',
    url: 'http://www.bing.com',
    type: 'Powerpoint deck',
    description: '<p>Best search engine in the world.</p>',
  })
  addPost({
    name: 'Revealing Email - Private Post',
    url: 'http://www.bing.com',
    type: 'Email',
    description: '<p>Best search engine in the world.</p>',
    privatePost: true,
  })
  addPost({
    name: 'PDF - blue prints - Finalised',
    url: 'http://www.bing.com',
    type: 'PDF',
    description: '<p>Best search engine in the world.</p>',
  })
  addPost({
    name: 'Meeting note',
    privatePost: false,
    type: 'Meeting',
  })
}
