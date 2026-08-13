---
id: removing-task-links
title: "When task links are removed"
type: reference
role: [matter-editor]
object: [link, task]
surface: [task-details]
lifecycle: work
summary: "The five situations in which Juralio removes a blocking link, and why."
related: [blocking-links, overriding-block-links, move-copy-tasks]
---

# When task links are removed

There are some scenarios where a [blocking link](./blocking-links.md) cannot exist.

When this happens, you will be warned by Juralio and asked to confirm the removal of the block. Once a block is removed from the relevant tasks it cannot be undone.

## Scenarios where links will be removed

| Scenario | Why are links removed? |
| :---- | :---- |
| Blocker task is marked as Done | The completion has unblocked the relevant tasks and the work can now progress |
| Linked task is Archived | Tasks cannot be linked to tasks with no status |
| Linked task is marked as Not required | Tasks cannot be linked to tasks with no status |
| Blocked/blocker task is moved into the tree of its blocker/block | Block links cannot be created up and down trees (parents/subtasks) due to bad logic |
| Linked task is moved outside of the workstream | Links can currently only exist between tasks in the same workstream |
