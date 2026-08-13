databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: "1600871806000-1") {
        createTable(tableName: "project_template_recency") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "project_template_recencyPK")
            }

            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "last_visit", type: "timestamp") {
                constraints(nullable: "false")
            }

            column(name: "user_id", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "project_template_id", type: "BIGINT") {
                constraints(nullable: "false")
            }
        }
    }

}
