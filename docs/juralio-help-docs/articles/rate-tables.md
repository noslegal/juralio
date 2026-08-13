---
id: rate-tables
title: "Rate tables"
type: how-to
role: [org-admin]
object: [cost, organisation]
surface: [org-admin, costs]
lifecycle: set-up
summary: "Build organisation and client rate tables from your grades and rate types, and retire or delete them later."
related: [cost-building-blocks, costs-setup, matter-costs, matter-positions]
---

# Rate tables

Grades and rate types come together in **rate tables**.

## Creating a rate table

When creating a rate table, you choose:

* A **currency** (e.g. GBP, EUR, USD).
* The **type of work** it applies to - this can be *any* type of work, or a specific type (e.g. Corporate, Disputes).
* The **location** it applies to - this can be *any* location, or specific location(s) (e.g. EMEA).

You then enter a rate for each **grade** × **rate type**.

* For each grade filled there must be a standard value and a break-even value, optionally there can also be a premium value.
* All available grades will appear but you can hide the grades not needed for the particular rate table
* You can **paste values** straight from a spreadsheet to save time.

## Advisor rate tables

The first table must be an organisation rate table as any client tables within advisor costs must be based on an organisation rate table

After this table is set up, tables can also be built for a specific **client** relationship, based on one of your organisation-level tables. Only tables matching the currency selected are offered as reference tables.

* Standard rates are visible within the client table alongside a % discount column
* Only the Agreed- Client rate column must be filled
* All available grades will appear but you can hide the grades not needed for the particular rate table

## Client rate tables

The same steps apply as above. Organisation rate tables are optional within client costs. Matter rates can be set up without any organisation tables, however we recommend setting these up to create some standards across the organisation.

The first client table can be an organisation or advisor rate table. Agreed - Advisor rates do not need to be paired with an organisation table, these can be standalone.

## Managing rate tables over time

* **Retire** a rate table to stop it being used as a basis for new tables (it stays visible under a "Show retired rate tables" filter and can be **restored** later). You cannot retire your last valid rate table.
* **Delete** a rate table only when it is not in use by any matter or other table. Deletion is permanent.
* **Edit** rates, table details, and periods at any time.
