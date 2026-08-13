databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1665571880000-1) {
        createTable(tableName: "project_template_image_tag") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "project_template_image_tagPK")
            }

            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "project_template_id", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "project_template_image_tag", type: "VARCHAR(500)") {
                constraints(nullable: "false")
            }
        }
    }
}
