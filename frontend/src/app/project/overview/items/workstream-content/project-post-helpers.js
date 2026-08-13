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

const getPosts = task => {
  let posts = task.posts || []
  if (posts.length) {
    posts.forEach(post => (post.taskId = task.id))
  }
  if (task.tasks && task.tasks.length) {
    let subPosts = task.tasks.map(t => getPosts(t))
    posts = posts.concat(subPosts).flat()
  }
  return posts
}

const getTask = (id, task) => {
  if (task?.id && task?.id === id) {
    return task
  }
  if (task?.tasks && task?.tasks?.length) {
    return task.tasks
      .map(t => getTask(id, t))
      .flat()
      .filter(t => t !== undefined)[0]
  }
}

export default { getPosts: getPosts, getTask: getTask }
