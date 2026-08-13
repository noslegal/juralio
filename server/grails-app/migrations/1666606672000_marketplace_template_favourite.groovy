databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1666606672000-1) {
        createTable(tableName: "marketplace_project_favourite") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "marketplace_project_favouritePK")
            }

            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "app_user_id", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "marketplace_project_database_id", type: "VARCHAR(500)") {
                constraints(nullable: "false")
            }
        }
    }
}