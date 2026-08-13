---
id: matter-permissions
title: "Matter permissions"
type: reference
role: [matter-admin, matter-editor, matter-viewer, matter-creator]
object: [matter, workstream, task, post]
surface: [matter-admin]
lifecycle: set-up
summary: "What matter creators, admins, editors and viewers can each see and change."
related: [matter-roles, add-remove-matter-people, account-types]
---

# Matter permissions

## What a matter creator can do

Matter creators can create and activate matters.

Two other permissions are tied to specific matters

* Matter admins manage issues such as who is a matter admin or editor, closing and reopening of a matter.
* Matter editors can see and change the contents of a workstream within the matter

Moving and archiving of tasks can only be done by matter editors who are internal accounts.

## What a matter admin can do

Only a matter admin can

* [add or remove matter admins to or from a matter](./add-remove-matter-people.md)
  * Exception: an organisation admin can also do so - this enables a matter's administration to be unblocked if no matter admin is available
* [add or remove matter editors to or from a matter](./add-remove-matter-people.md)
* [rename a matter, its client or workstreams](./rename-client-matter-workstream.md)
* close or reopen a matter

## What a matter editor can do

Only a matter editor can see and update the matter's content, i.e. the tasks within its workstreams and any posts within its tasks.

"Updating" includes editing the content, changing the workflow status (not started / in progress / done) or [copying](./move-copy-tasks.md) a task.

## Only a matter admin who is also a matter editor can create workstreams

Only someone who is a matter admin **and** a matter editor can [create workstreams within the matter.](./matters-and-workstreams.md)

## What a matter viewer can do

Matter viewers can see but not edit the matter's tasks and posts.

Matter admins can toggle someone's access between viewer / editor in the People section of the Matter admin area.

## Matter roles list

A list of people with access to a matter and their roles (admin, editor, viewer) can been seen within the **People** tab in the [Matter and workstream overviews](./matter-workstream-overviews.md). Any matter editor or matter viewer can see this.
