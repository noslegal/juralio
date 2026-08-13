---
id: blocking-links
title: "Blocking links"
type: concept
role: [matter-editor]
object: [link, task]
surface: [task-details]
lifecycle: work
summary: "Soft blocks that show one task should be finished before another starts, and which tasks cannot be linked."
related: [overriding-block-links, removing-task-links, task-status]
---

# Blocking links

Blocking links in Juralio allow matter editors to show team members that another task should be completed before this task is started.

As work isn't always predictable, these blocks are known as "soft blocks". If necessary, the blocking link can be overridden or removed.

## Adding a blocking link

Blocking links can currently only be added within individual workstreams in matters. Blocks between workstreams and within templates will be available in the near future.

Links are added through task details. Select if you are creating a "block" or "blocked by" link and search for the task that you want to link.

The following tasks cannot have blocking links due to bad logic and so will not appear in the search results:

* Done tasks
* Tasked marked as Not required
* Archived tasks
* Tasks that are a parent/ subtask of the task you are trying to link
* Tasks in another workstream
* Tasks that are already blocking/ blocked by the task you're trying to link (if X blocks Y, Y cannot block X)

## Editing a block

Blocks can be edited and removed within the blocking links page in task details.

[This article](./removing-task-links.md) outlines scenarios when block links must be removed due to bad logic.

Status changes to blocked links requires the block to be overridden - [find out more here](./overriding-block-links.md).

## Completing a blocker task

Once a blocker task is marked as Done, the related tasks will become unblocked and teams can progress with the work.
