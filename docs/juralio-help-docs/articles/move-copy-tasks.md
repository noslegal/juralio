---
id: move-copy-tasks
title: "Move or copy tasks"
type: how-to
role: [matter-editor, matter-admin]
object: [task, workstream]
surface: [taskmap, task-details]
lifecycle: work
summary: "What happens to content, subtasks and status when you move or copy a task, and who is allowed to."
related: [split-merge-workstreams, archiving-and-closing, matter-permissions]
---

# Move or copy tasks

* Moving tasks allows you to restructure a workstream, or to merge/split workstreams.
* Copying tasks helps you efficiently to address activities which repeat or have a pattern, without the need to rely on a template.
* Effect of moving or copying
  * If you move or copy a task, its subtasks will be moved or copied with it.
  * If you move a task, its content is retained.
  * If you copy a task, its content is not carried over into the copy - this is because such content is likely to be different in the copied task
* Task status (not started / in progress / done)
  * Status is retained on moving a task, In some cases if the task is moved to be a subtask of a "not started" or "done" task the parent task's status will be automatically changed to be "in progress"
  * A new copy of a task will have "not started" status unless you make it a subtask of a "done" task (in which case it will be marked as "done" for consistency)
* Who can move or copy a task?
  * Only internal accounts who are matter editors can move tasks.
  * Any matter editor can copy tasks.

## How to copy tasks

Copying tasks is useful if you want to quickly replicate a group of tasks within a workstream. Copying a task will also copy its subtasks, but not their posts.

Any matter editor can copy a task:

* Go to the task details of the task you want to move
* Select the options button at top right
* Select "copy" and choose the name of the new task

The new task appears as a sibling of the original task.

## How to move tasks

You need to be a matter admin to move a task.

Moving a task also moves its subtasks and posts.

There are two ways to do so.

1. In the taskmap, drag the task you want to move out of its sibling group and release it. You'll see an option at bottom left of the screen to move it. Confirming that you wish to move it will allow you to choose the destination.
2. Within the options menu for a task, choose "move". You can move it within the current workstream or to another workstream of your choice within the same matter (the "same matter" restriction is to avoid accidental leakage of confidential information to a different matter team)
* Unavailable destinations will not be shown, e.g.
  * if a potential new parent task already has 8 sub-tasks
  * if the moved/copied task has too many levels of sub-tasks to fit under a potential new parent task (remember that Juralio task levels are limited to 6 in order to keep the task map digestible)
