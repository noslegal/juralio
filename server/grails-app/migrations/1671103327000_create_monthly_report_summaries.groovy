databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1671103327000-1) {
        createTable(tableName: 'monthly_users_report_summary'){
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "monthlys_user_report_summaryPK")
            }
            column(name: "version", type: "bigint", {
                constraints(nullable: "true")
            })
            column(name: "confirmed_active_users", type: "bigint", {
                constraints(nullable: "false")
            })
            column(name: "seats", type: "bigint", {
                constraints(nullable: "false")
            })
            column(name: "org_id", type: "bigint", {
                constraints(nullable: "false")
            })
            column(name: "summary_date", type: "timestamp", {
                constraints(nullable: "false")
            })
        }
    }
}