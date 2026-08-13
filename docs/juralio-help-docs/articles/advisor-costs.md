---
id: advisor-costs
title: "Advisor costs"
type: how-to
role: [matter-admin, matter-editor]
object: [cost, matter]
surface: [costs]
lifecycle: plan
summary: "Set matter rates, build a projection across pricing types and grades, and monitor against the dashboard."
related: [matter-costs, client-costs, rate-tables, cost-snapshots, assumptions]
---

# Advisor costs

Setup follows three broad steps:

1. **Set the rates** that apply for this matter
2. Set up your **first projection**
3. **Monitor** costs as the matter progresses

## Matter rates

Set rates by adopting an organisation-level or client-level rate table as a starting point, then adjusting it for the matter:

1. Choose a rates table to use as a starting point
   * Filtered by currency, client, location or type of work
2. Decide whether to adopt the standard rates (optionally applying a **discount** or **premium** percentage) or set rates manually
   * The grades given values will be available for projection calculations
3. Set the **agreed rates for this matter** in the rate grid

Once set up, those with cost permissions can edit rates, add or remove rate periods, and replace the underlying table at a later date.

## Projections

Once the rate table has been set up for the matter the next step is to create a projection:

1. **Projection period** - choose a period that the projection will cover using the month pickers.
2. **Pricing type** - choose which pricing type/s this projection will use
   * There are four main pricing types to choose from
     1. Time-based - **open-ended**
     2. Time-based - **capped,** the value must be entered
     3. **Fixed fee** - the value must be entered
     4. **No fee** - the reason for no fee must be chosen from the options provided
   * Multiple pricing types can be chosen by selecting the "New pricing segment"
     1. Choosing multiple pricing types requires the scope of these segments to be outlined, to do this assign the phases that apply to each segment
3. **Calculate the fees** associated with the work
   * Choose how the grade time will be split
     1. The % of time must add up to 100%
     2. % can be adjusted for a grade group or individual grades
     3. Recovery rate for grade groups and grades should be set here
     4. These can be adjusted in the projection table later
   * Review the phase activity within the period
     1. Adjust the dates on phases to change the active days of each phase
     2. If a phase's dates are set outwith the current projection period, the phase will be removed from the projection
   * Estimate hours for each phase
     1. This is the estimation of hours contributed by all team members
     2. This can be adjusted in the next step within the table
4. **Resource table -** Review and adjust the resource tables to create an estimate that reflects the reality of the work
   * Switch tables to see what the estimated fees, costs, profits, and margins are based on the inputted hours
   * Hours can be adjusted on the hours table
   * Use the team % column to view and adjust the grade distributions at workstream or phase level
   * Navigate back to the pricing types to adjust values and phases associated
5. **Snapshot** - Once the estimate is reviewed, use the bottom button to finalise, this will create a snapshot of the projection (see below)

## The Advisor costs dashboard

Once at least one projection has been finalised, the cost dashboard tracks the fees against the work actually being done.

* The line graph displays the accumulation of estimated costs over projected periods.
* Key financial information is displayed in the top right
  * Gross profit margin
  * Distribution of projected hours across grade categories
* Access matter rates via the Rates button
