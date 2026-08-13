export const addTask = (destination, taskName) => {
  let aTask = newTask(taskName)
  destination.tasks.push(aTask)
  return aTask
}

export const addTasks = (destination, taskNames) => {
  taskNames.forEach(name => addTask(destination, name))
}

export const addTaskChain = (destination, taskNames) => {
  let aTask = newTask(taskNames.shift())
  destination.tasks.push(aTask)
  if (taskNames.length > 0) addTaskChain(aTask, taskNames)
}

export const newTask = (name) => {
  return {
    name: name,
    tasks: [],
  }
}

export const getSingleProjectInList = () => {
  return [{ tasks: [] }]
}

export const getNewProject = (levelATaskNames) => {
  let projectList = getSingleProjectInList()
  projectList[0].tasks = taskListFromNames(levelATaskNames)
  projectList[0].parent = projectList
  return projectList[0]
}

export const taskListFromNames = (names) => {
  let tasks = []
  names.forEach(name => tasks.push(newTask(name)))
  return tasks
}
