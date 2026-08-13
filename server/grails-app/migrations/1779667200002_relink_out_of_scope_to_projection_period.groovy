databaseChangeLog = {
    changeSet(author: "juralio", id: 1779667200002-1) {
        addColumn(tableName: "out_of_scope_details") {
            column(name: "projection_period_id", type: "BIGINT") {
                constraints(nullable: "true")
            }
        }
    }

    changeSet(author: "juralio", id: 1779667200002-2) {
        // Backfill the new link from the old one: each record's rate table details
        // resolves to a matter, and that matter's projection period becomes the owner.
        // A matter can have more than one projection period, so pick the most recent.
        sql('''
            UPDATE out_of_scope_details oos
            SET projection_period_id = (
                SELECT pp.id
                FROM projection_period pp
                JOIN rate_table_details rtd ON rtd.matter_id = pp.matter_id
                WHERE rtd.id = oos.rate_table_details_id
                ORDER BY pp.id DESC
                LIMIT 1
            )
            WHERE oos.rate_table_details_id IS NOT NULL
        ''')
    }

    changeSet(author: "juralio", id: 1779667200002-3) {
        dropColumn(columnName: "rate_table_details_id", tableName: "out_of_scope_details")
    }
}
