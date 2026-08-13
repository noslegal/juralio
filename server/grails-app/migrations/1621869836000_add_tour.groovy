databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1621869836000 - 1) {
        createTable(tableName: "tour") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "tourRK")
            }

            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }
            column(name: "status_filter", type: "Boolean") {
                constraints(nullable: "false")
            }
            column(name: "template_draft", type: "Boolean") {
                constraints(nullable: "false")
            }
            column(name: "user_id", type: "BIGINT") {
                constraints(nullable: "false")
            }
        }
    }
}
