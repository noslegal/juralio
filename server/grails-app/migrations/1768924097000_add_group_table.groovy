databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1768924097000-1) {
        createTable(tableName: "organisation_group"){
                column(autoIncrement: "true", name: "id", type: "BIGINT") {
                    constraints(primaryKey: "true", primaryKeyName: "organisationGroupPK")
                }

                column(name: "version", type: "bigint", {
                    constraints(nullable: "false")
                })

                column(name: "organisation_id", type: "bigint", {
                    constraints(nullable: "false")
                })

                column(name: 'name', type:"VARCHAR(255)",  {
                constraints(nullable: "false")
                })

                column(name: "is_internal", type: "boolean",{
                constraints(nullable: "false")
                })
            }

        addColumn(tableName: "app_user"){
            column(name: "organisation_group_id", type: "BIGINT",{
              constraints(nullable: "true")
            })
        }
    }
}
