/*
 * Copyright 2026 Graeme and Joanna Johnston
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export const splitTodosByRange = todos => {
  //split matches the enum range in the TodoContainer
  let splitTodos = {
    0: getOverdue(todos), //overdue
    1: getToday(todos), //today
    2: getThisWeek(todos), //this week
    3: todos, //all
  }
  return splitTodos
}

const addDays = (date, days) => {
  let result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

const getStartOfToday = () => {
  const today = new Date()
  today.setHours(0)
  today.setMinutes(0)
  today.setSeconds(0)
  today.setMilliseconds(0)
  return today
}

const getStartOfTomorrow = () => {
  let tomorrow = new Date()
  tomorrow = addDays(tomorrow, 1)
  tomorrow.setHours(0)
  tomorrow.setMinutes(0)
  tomorrow.setSeconds(0)
  tomorrow.setMilliseconds(0)
  return tomorrow
}

const getMostRecentMonday = () => {
  let prevMonday = new Date()
  prevMonday.setDate(prevMonday.getDate() - ((prevMonday.getDay() + 6) % 7))
  prevMonday.setHours(0)
  prevMonday.setMinutes(0)
  prevMonday.setSeconds(0)
  prevMonday.setMilliseconds(0)
  return prevMonday
}

const getNextSunday = () => {
  let nextSunday = new Date()
  nextSunday.setDate(nextSunday.getDate() + ((7 - nextSunday.getDay()) % 7))
  nextSunday.setHours(0)
  nextSunday.setMinutes(0)
  nextSunday.setSeconds(0)
  nextSunday.setMilliseconds(0)
  return nextSunday
}

const getOverdue = todos => {
  //use start of today
  const today = getStartOfToday()
  return todos.filter(
    todo => new Date(todo.plannedEndDate).getTime() < today.getTime()
  )
}

const getToday = todos => {
  //user 00:00 tomorrow for simplicity
  const startOfToday = getStartOfToday()
  const startOfTomorrow = getStartOfTomorrow()
  return todos.filter(
    todo =>
      (new Date(todo.plannedEndDate).getTime() < startOfTomorrow.getTime() &&
        new Date(todo.plannedEndDate).getTime() >= startOfToday) ||
      (new Date(todo.plannedStartDate).getTime() < startOfTomorrow.getTime() &&
        new Date(todo.plannedStartDate).getTime() >= startOfToday)
  )
}

const getThisWeek = todos => {
  let monday = getMostRecentMonday()
  let sunday = getNextSunday()
  sunday = addDays(sunday, 1) //use monday 00:00 fopr simplicity

  return todos.filter(
    todo =>
      (new Date(todo.plannedEndDate).getTime() >= monday.getTime() &&
        new Date(todo.plannedEndDate).getTime() < sunday) ||
      (new Date(todo.plannedStartDate).getTime() >= monday.getTime() &&
        new Date(todo.plannedStartDate).getTime() < sunday)
  )
}
