databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: "1607347534000-1") {
        createTable(tableName: "notice") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "noticeboardPK")
            }

            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "image_key", type: "varchar(500)") {
                constraints(nullable: "false")
            }

            column(name: "title", type: "varchar(255)") {
                constraints(nullable: "false")
            }

            column(name: "subtitle", type: "varchar(255)") {
                constraints(nullable: "false")
            }

            column(name: "live_start", type: "TIMESTAMP WITHOUT TIME ZONE") {
                constraints(nullable: "false")
            }

            column(name: "live_end", type: "TIMESTAMP WITHOUT TIME ZONE") {
                constraints(nullable: "false")
            }

            column(name: "weight", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "featured", type: "BOOLEAN") {
                constraints(nullable: "false")
            }
        }
    }
}
