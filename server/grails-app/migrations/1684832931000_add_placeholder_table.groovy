databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1684832931000-1) {
          createTable(tableName: 'placeholders'){
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "placeholdersPK")
            }
            column(name: "version", type: "bigint", {
                constraints(nullable: "true")
            })
            column(name: "first_name", type: "VARCHAR(35)") {
                constraints(nullable: "false")
            }
            column(name: "last_name", type: "VARCHAR(35)") {
                constraints(nullable: "false")
            }
            column(name: "email_address", type: "VARCHAR(255)") {
                constraints(nullable: "true")
            }
            column(name: "matter_id", type: "bigint", {
                constraints(nullable: "false")
            })
            column(name: "organisation_id", type: "bigint", {
                constraints(nullable: "true")
            })
            column(name: "enabled", type: "boolean",{
                constraints(nullable: "true",defaultNullValue:'true')
            })
        }
    }
}
