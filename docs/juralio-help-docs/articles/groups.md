---
id: groups
title: "Groups"
type: concept
role: [org-admin, matter-admin]
object: [group, organisation]
surface: [org-admin]
lifecycle: set-up
summary: "Every account belongs to exactly one group; groups represent your own organisation or the companies you work with."
related: [manage-groups, matter-positions, account-types]
---

# Groups

The **Groups** tab lets an organisation admin associate individual user accounts with a group. Groups represents a company or other entity, e.g. Acme Inc. Every individual Juralio account must belong to one (and only one) group.

To create, amend and reassign people to groups, go to **Organisation admin** → **Accounts and groups**, on the **Groups tab**.

## Internal and external groups

Every organisation has **one internal group**. Your own organisation's people's individual accounts belong to this group. It is labelled *(internal)*. It cannot be deleted. At least one account from the internal group must be a member of each matter.

All other groups you create are **external groups.** These represent the other companies or entities you work with on matters, such as clients or advisors. If you are working with an individual who is not part of a larger group then there will still be a single-member group for that individual.

## What a group has

* **A name** - must be unique within your organisation (up to 70 characters).
* **A logo (optional)** - JPEG or PNG only, maximum file size 200KB. If no logo is set, the group is shown as a coloured avatar with the first letter of its name.
* **A default position on matters** - either Client or Advisor. This is the position the group will be given by default when it is added to a new matter. (See [Matter positions](./matter-positions.md).)

## How people join a group

You do not add members from the group screen itself. Instead, a person is placed in a group when their account is **created or edited** - each account has an **Associated group** setting. You can also create a brand-new group on the fly from the create-account flow.

Changing which group an account belongs to changes that person's group membership. This can only be done at sysadmin level.
