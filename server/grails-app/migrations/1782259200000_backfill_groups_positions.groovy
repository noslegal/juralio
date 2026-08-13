databaseChangeLog = {
    // One-time backfill of groups/positions for data that predates the groups-positions feature.
    // Mirrors OrganisationGroupService.generateDefaults + the matter/costs defaulting, but set-based
    // and idempotent (every statement is guarded by NOT EXISTS / IS NULL). New environments created
    // after this feature already have groups/positions, so this is a no-op there.
    changeSet(author: "juralio", id: "1782259200000-1") {
        grailsChange {
            change {
                // Client + Advisor positions for organisations that have no group yet
                sql.execute("""INSERT INTO group_position (version, organisation_id, matter_id, name)
                    SELECT 0, o.id, NULL, 'Client' FROM organisation o
                    WHERE NOT EXISTS (SELECT 1 FROM organisation_group og WHERE og.organisation_id = o.id)""")
                sql.execute("""INSERT INTO group_position (version, organisation_id, matter_id, name)
                    SELECT 0, o.id, NULL, 'Advisor' FROM organisation o
                    WHERE NOT EXISTS (SELECT 1 FROM organisation_group og WHERE og.organisation_id = o.id)""")

                // Internal group per organisation. An org that already has cost config is an advisor
                // org (its legacy costs are advisor-side and get tagged Advisor below), so its internal
                // group must be Advisor — otherwise position-scoped costs lookups for its matters would
                // miss the Advisor-tagged config. Orgs with no cost config default to Client (harmless,
                // matching generateDefaults).
                sql.execute("""INSERT INTO organisation_group (version, organisation_id, name, is_internal, group_position_id)
                    SELECT 0, o.id, o.name, true,
                      (SELECT gp.id FROM group_position gp
                       WHERE gp.organisation_id = o.id AND gp.matter_id IS NULL
                         AND gp.name = CASE
                            WHEN EXISTS (SELECT 1 FROM rate_table_details r WHERE r.organisation_id = o.id)
                              OR EXISTS (SELECT 1 FROM grade g           WHERE g.organisation_id = o.id)
                              OR EXISTS (SELECT 1 FROM rate_type rt      WHERE rt.organisation_id = o.id)
                              OR EXISTS (SELECT 1 FROM other_cost oc     WHERE oc.organisation_id = o.id)
                              OR EXISTS (SELECT 1 FROM grade_category gc WHERE gc.organisation_id = o.id)
                            THEN 'Advisor' ELSE 'Client' END
                       ORDER BY gp.id LIMIT 1)
                    FROM organisation o
                    WHERE NOT EXISTS (SELECT 1 FROM organisation_group og WHERE og.organisation_id = o.id)""")

                // Every org member must belong to a group: link any org user that has none
                sql.execute("""UPDATE app_user u SET organisation_group_id =
                      (SELECT og.id FROM organisation_group og
                       WHERE og.organisation_id = u.organisation_id AND og.is_internal = true
                       ORDER BY og.id LIMIT 1)
                    WHERE u.organisation_group_id IS NULL AND u.organisation_id IS NOT NULL""")

                // A MatterGroupPosition for matters with none, using the internal group's position
                // (Advisor for cost-bearing orgs, Client otherwise) so matter costs resolve correctly.
                sql.execute("""INSERT INTO matter_group_position (version, matter_id, organisation_group_id, group_position_id)
                    SELECT 0, m.id, og.id, og.group_position_id
                    FROM matter m
                    JOIN organisation_group og ON og.organisation_id = m.organisation_id AND og.is_internal = true
                    WHERE og.group_position_id IS NOT NULL
                      AND NOT EXISTS (SELECT 1 FROM matter_group_position mgp WHERE mgp.matter_id = m.id)""")

                // Default any org costs records with no position to the org's Advisor position
                // Table name is interpolated from a fixed safe list, not user input. Render the GString to
                // a plain String so Groovy SQL runs it as a literal statement rather than treating ${table}
                // as a bind parameter (a bind param is not valid in the table-name position).
                ['grade_category', 'grade', 'rate_type', 'other_cost', 'rate_table_details'].each { table ->
                    sql.execute("""UPDATE ${table} c SET group_position_id =
                          (SELECT gp.id FROM group_position gp
                           WHERE gp.organisation_id = c.organisation_id AND gp.name = 'Advisor' AND gp.matter_id IS NULL
                           ORDER BY gp.id LIMIT 1)
                        WHERE c.group_position_id IS NULL""".toString())
                }
            }
        }
    }
}
