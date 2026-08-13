databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1779667200000-1) {
        createTable(tableName: "out_of_scope_details") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "out_of_scope_detailsPK")
            }

            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "written_approval_needed", type: "boolean") {
                constraints(nullable: "false")
            }

            column(name: "reason", type: "VARCHAR(255)") {
                constraints(nullable: "true")
            }

            column(name: "rate_table_details_id", type: "BIGINT") {
                constraints(nullable: "true")
            }
        }
    }
}
