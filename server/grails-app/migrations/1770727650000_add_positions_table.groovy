databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1770727650000-1) {
      createTable(tableName: "group_position"){
                column(autoIncrement: "true", name: "id", type: "BIGINT") {
                    constraints(primaryKey: "true", primaryKeyName: "groupPositionPK")
                }

                column(name: "version", type: "bigint", {
                    constraints(nullable: "false")
                })

                column(name: "organisation_id", type: "bigint", {
                    constraints(nullable: "false")
                })

                column(name: "matter_id", type: "bigint", {
                    constraints(nullable: "true")
                })

                column(name: 'name', type:"VARCHAR(255)",  {
                    constraints(nullable: "false")
                })

            }

        createTable(tableName: "matter_group_position") {
          column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "matter_group_positionPK")
            }
            column(name: "version", type: "bigint", {
                constraints(nullable: "true")
            })
            column(name: "matter_id", type: "BIGINT") {
                    constraints(nullable: "false")
            }

            column(name: "organisation_group_id", type: "BIGINT") {
                    constraints(nullable: "false")
            }

            column(name: "group_position_id", type: "BIGINT") {
                    constraints(nullable: "false")
            }
        }

        addColumn(tableName: "organisation_group"){
            column(name: "group_position_id", type: "BIGINT",{
              constraints(nullable: "true")
            })
        }
    }
}
