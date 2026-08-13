databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: "1600956551000-1") {
        createTable(tableName: "project_template_favourite") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "project_template_favouritePK")
            }

            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "app_user_id", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "project_template_id", type: "BIGINT") {
                constraints(nullable: "false")
            }
        }
    }
}
