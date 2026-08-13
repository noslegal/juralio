databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1710417332000-1) {
         createTable(tableName: 'projection_period'){
        column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "projectionPeriodPK")
            }
        column(name: "version", type: "bigint", {
                constraints(nullable: "true")
            })

        column(name: "matter_id", type: "bigint", {
                constraints(nullable: "false")
            })
        column(name: "start_date", type: "TIMESTAMP WITHOUT TIME ZONE") {
                constraints(nullable: "false")
            }

        column(name: "end_date", type: "TIMESTAMP WITHOUT TIME ZONE") {
                constraints(nullable: "true")
            }
      }

          addColumn(tableName: "cost_snapshot") {
            column(name: "projection_period_id", type: "bigint")
        }
          addColumn(tableName: "cost_ratio") {
            column(name: "projection_period_id", type: "bigint")
        }
          addColumn(tableName: "matter_pricing") {
            column(name: "projection_period_id", type: "bigint")
        }
        dropColumn(columnName: "period_id", tableName: "cost_time_estimate")

        addColumn(tableName: "cost_time_estimate") {
            column(name: "projection_period_id", type: "bigint")
        }
    }
}
