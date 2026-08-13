databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1701791543000-1) {
    createTable(tableName: 'cost_ratio'){
        column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "costRatioPK")
            }
        column(name: "version", type: "bigint", {
                constraints(nullable: "true")
            })
        column(name: "matter_id", type: "bigint") {
                constraints(nullable: "false")
            }
        column(name: "grade_id", type: "bigint", {
                constraints(nullable: "false")
            })
        column(name: "ratio_value", type: "bigint", {
                constraints(nullable: "true")
            })
        column(name: "recovery_rate", type: "bigint", {
                constraints(nullable: "true")
            })
      }

         createTable(tableName: 'cost_time_estimate'){
        column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "costTimeEstimatePK")
            }
        column(name: "version", type: "bigint", {
                constraints(nullable: "true")
            })
        column(name: "period_id", type: "bigint") {
                constraints(nullable: "false")
            }
        column(name: "task_id", type: "bigint", {
                constraints(nullable: "false")
            })
        column(name: "hour_value", type: "bigint", {
                constraints(nullable: "true")
            })
      }

       addColumn(tableName: "period") {
            column(name: "matter_id", type: "bigint", {constraints(nullable:"true")})
        }
    }
}
