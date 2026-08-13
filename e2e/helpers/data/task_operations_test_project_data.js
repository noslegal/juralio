import {
  getNewProject,
  addTasks,
  addTaskChain,
} from '../matterprojects/fixture_data_builder_helper'

export const getTaskDestinationProjects = () => {
  let project = getNewProject(['Panda', 'Dog', 'Bear', 'Giraffe'])
  addTasks(project.tasks[0], ['Swan', 'Crow'])
  addTaskChain(project.tasks[3], [
    'Swallow',
    'Spider',
    'Beetle',
    'Ant',
    'Amoeba',
  ])
  return project.parent
}

export const getProjectAtoCLevelData = () => {
  let project = getNewProject(['task1', 'task2'])
  addTasks(project.tasks[0], ['subtask2', 'subtask3', 'subtask4'])
  addTasks(project.tasks[1], ['subtask5', 'subtask6', 'subtask7'])
  return project.parent
}

export const getProjectAtoCLevelDataDiffNames = () => {
  let project = getNewProject(['diff task1', 'diff task2'])
  addTasks(project.tasks[0], [
    'diff subtask2',
    'diff subtask3',
    'diff subtask4',
  ])
  addTasks(project.tasks[1], [
    'diff subtask5',
    'diff subtask6',
    'diff subtask7',
  ])
  return project.parent
}

export const get3LevelATasksWithSubsData = () => {
  let project = getNewProject(['task1', 'task2', 'task3'])
  addTasks(project.tasks[0], ['subtask2', 'subtask3', 'subtask4'])
  addTasks(project.tasks[1], ['subtask5', 'subtask6', 'subtask7'])
  addTasks(project.tasks[2], ['subtask8', 'subtask9', 'subtask10'])
  return project.parent
}

export const getProjectAToFLevelData = () => {
  let project = getNewProject(['task1 A', 'task2 A'])
  addTasks(project.tasks[0], ['subtask2 B', 'subtask3 B', 'subtask4 B'])
  addTasks(project.tasks[1], ['subtask5 B', 'subtask6 B'])
  addTaskChain(project.tasks[1], [
    'subtask7 B',
    'subtask8 C',
    'subtask9 D',
    'subtask10 D',
    'subtask11 F',
  ])
  return project.parent
}

export const getProjectForDepthTesting = () => {
  let project = getNewProject(['level A'])
  addTaskChain(project.tasks[0], [
    'level B',
    'level C',
    'level D',
    'level E',
    'level F',
  ])
  return project.parent
}

export const getProjectWithMultiFLevelData = () => {
  let project = getNewProject(['task1 A', 'task2 A'])
  addTasks(project.tasks[0], ['subtask2 B', 'subtask3 B', 'subtask4 B'])
  addTasks(project.tasks[1], ['subtask5 B', 'subtask6 B'])
  addTaskChain(project.tasks[0], [
    'subtask7 B',
    'subtask8 C',
    'subtask9 D',
    'subtask10 D',
    'subtask11 F',
  ])
  addTaskChain(project.tasks[1], [
    'subtask12 B',
    'subtask13 C',
    'subtask14 D',
    'subtask15 D',
    'subtask16 F',
  ])
  return project.parent
}

export const getProjectWithParentTaskWith8Subtasks = () => {
  let project = getNewProject(['task1'])
  addTasks(project.tasks[0], [
    'subtask1',
    'subtask2',
    'subtask3',
    'subtask4',
    'subtask5',
    'subtask6',
    'subtask7',
    'subtask8',
  ])
  return project.parent
}

export const getMoveProjectWithParentTaskWith8Subtasks = () => {
  let project = getNewProject(['task1', 'a task to move'])
  addTasks(project.tasks[0], [
    'subtask1',
    'subtask2',
    'subtask3',
    'subtask4',
    'subtask5',
    'subtask6',
    'subtask7',
    'subtask8',
  ])
  return project.parent
}

export const getCopyProjectWithParentTaskWith8Subtasks = () => {
  let project = getNewProject(['task1', 'a task to copy'])
  addTasks(project.tasks[0], [
    'subtask1',
    'subtask2',
    'subtask3',
    'subtask4',
    'subtask5',
    'subtask6',
    'subtask7',
    'subtask8',
  ])
  return project.parent
}

export const getProjectWith8LevelATasks = (extraTaskName) => {
  let project = getNewProject([
    'task1',
    'task2',
    'task3',
    'task4',
    'task5',
    'task6',
    'task7',
    'task8',
  ])
  if (extraTaskName) addTasks(project.tasks[0], [extraTaskName])
  return project.parent
}

export const getProjectWith16LevelATasks = extraTaskName => {
  let project = getNewProject([
    'task1',
    'task2',
    'task3',
    'task4',
    'task5',
    'task6',
    'task7',
    'task8',
    'task9',
    'task10',
    'task11',
    'task12',
    'task13',
    'task14',
    'task15',
    'task16',
  ])
  if (extraTaskName) addTasks(project.tasks[0], [extraTaskName])
  return project.parent
}

export const getProjectForValidation = (projectName) => {
  let project = getNewProject([
    'task1',
    'task2',
    'task3',
    'task4',
    'task5',
    'task6',
    'task7',
    'task8',
    'task9',
    'task10',
    'task11',
    'task12',
    'task13',
    'task14',
    'task15',
    'task16',
  ])
  addTasks(project.tasks[1], [
    'subtask1',
    'subtask2',
    'subtask3',
    'subtask4',
    'subtask5',
    'subtask6',
    'subtask7',
    'subtask8',
  ])
  addTaskChain(project.tasks[0], [
    'subtask B',
    'subtask C',
    'subtask D',
    'subtask E',
    'subtask F',
  ])
  project.name = projectName
  return project.parent
}
