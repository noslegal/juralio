---
id: task-dates
title: "Dates in tasks"
type: reference
role: [matter-editor]
object: [task, date]
surface: [task-details, roadmap]
lifecycle: plan
summary: "Planned and actual start and end dates, when they are added automatically, and how parent and subtask dates are kept consistent."
related: [task-status, roadmap, task-details, tasklist]
---

# Dates in tasks

## Tasks have up to four key dates

**Planned** dates are estimates, targets or deadlines for when a task is likely, or required, to start and end. **Actual** dates record when a task did, in fact, start and end.

* A **not started** task **may** have up to two dates: a planned start and a planned end.
* An **in progress** task **may** have planned dates, but **must** have an actual start date.
* A **done** task **may** have planned dates but **must** have actual start and end dates.

## Adding and editing task dates

Go to the task whose dates you wish to add or edit. Select the relevant date field. This will bring up a calendar which allows you to select a date.

If you want to change the year, a quick way to do so is by clicking on the year at the top of the calendar.

## Why use planned dates?

1. Planned dates help ensure you and your team don't miss things.
2. Tasks not yet completed appear as things **to do** in your workstream inbox and on the homescreen, based on their **planned end dates**. This helps you and your team plan and (if need be) re-plan.
3. **Roadmap** visualises planned and actual task duration based on the dates entered.

## Auto-addition of actual dates

When you mark a not started task as in progress or done, the current date will be added as its actual start date. When you mark a task as done, the current date will be added as its actual end date. You can always change an auto-added date if it's not right, e.g. if in fact you completed the task yesterday but only marked it as done in Juralio today.

If a task is moved backwards in workflow status (i.e. in progress to not started, or done to in progress or not started) then the relevant actual dates are removed.

## Auto-correction of parent task and subtask dates

Juralio helps you to keep dates consistent within phases and their subtasks in two ways.

### Keeping subtasks within the date bounds of their parent tasks

   Imagine that a phase and its subtask each have a planned end date of 30 April 2026 and you decide to change the subtask planned end date to 31 May 2026. Juralio will prompt you to change the parent task date to 31 May 2026 as well. These prompts are given via a dialog before any change is made, and you have the opportunity to back out by pressing "cancel."

### Adjusting dates by equivalent numbers of days within the date bounds

   Imagine that a phase has a planned end date of 30 April 2026 and that its subtask has a planned end date of 10 April 2026.
   You push the phase date back to 15 May 2026. You'll be presented with a choice of whether to push the corresponding subtask dates back by the same number of days. If you choose yes, the 10 April 2026 will be pushed back to 25 April 2026. If you choose not, it won't be changed.
