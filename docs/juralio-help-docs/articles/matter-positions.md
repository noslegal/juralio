---
id: matter-positions
title: "Matter positions: Client and Advisor"
type: concept
role: [matter-admin, org-admin]
object: [matter, group, cost]
surface: [matter-admin, org-admin]
lifecycle: set-up
summary: "Every group on a matter is either Client or Advisor; positions control cost visibility and permissions."
related: [groups, manage-groups, matter-costs, cost-visibility]
---

# Matter positions: Client and Advisor

Each group which has one or more individual members of a matter, must have an assigned **position** in that matter. There are two possible positions: **Client** and **Advisor**. There can only be up to two groups in a matter: one Client and one Advisor.

An individual's position on a matter comes from the group they belong to - position is a property of the group, not of the individual.

Positions matter because they control what financial aspects of a matter someone can see and change - see [Matter costs](./matter-costs.md) for further information.

Every matter has both a Client side and an Advisor side. Where a position has no group filling it yet, the matter shows **Not yet selected**.

## How positions are set

* **Default position (organisation level)** - each group has a default position on matters, set in **Organisation admin** → **Accounts and groups** → **Groups**.
  * When a group is added to a new matter, it takes this default.
  * Changing a group's default affects future matters only; existing matters are unaffected.
* **Position on a specific matter (matter level)** - a matter admin can change a group's position on an individual matter;
  * During the matter setup process e.g. switching the internal group position, or
  * via **Matter admin** → **People** → **Group** **positions**.
  * This has no impact on the group's default position at organisation level or positions in other matters

## What positions control

* **Matter permissions** - positions restrict what each side can access on the matter.
* **Cost visibility** - see cost articles to understand the difference between client costs and advisor costs. External groups will only be able to see costs when the internal group has set these up.

## What you can do with positions

* **Set a group's default position** when creating a group, or change it later in organisation admin.
* **Switch a group's position** on a matter (matter admins). Switching flips both sides - the Client becomes the Advisor and vice versa.

### Important warnings when switching positions on a matter

Switching positions on a live matter is a significant change:

* It **permanently deletes any cost data** already set up on that matter - costs would need to be rebuilt from scratch.
* The **other (external) group's position is switched at the same time**, because a matter always has one Client and one Advisor.
* Because of this, you must type **UPDATE** to confirm before the switch is applied.

## Who can manage positions

* **Organisation admins** set each group's **default** position.
* **Matter admins** switch a group's position on a specific matter (blocked if the organisation is frozen).

The two types of positions available (Client and Advisor) are fixed.

## Managing group positions on a matter

When a group is added to a matter it is given a **position** (Client or Advisor). You can see and manage the groups on a matter in **Matter admin** → **People** → **Group positions**. From there a matter admin can:

* **Switch a group's position** on that matter. Because positions control what each side can see (including costs), switching a live matter's positions **permanently deletes any cost data** set up on the matter, so you are asked to type **UPDATE** to confirm
* **Remove an external group** from the matter. Removing a group also removes the people associated with that group from the matter. Individuals can instead be removed one at a time via the People tab

The internal group can never be removed from a matter.
