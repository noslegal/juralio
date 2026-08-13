databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1768819804000-1) {
      createTable(tableName: 'cost_assumption'){
        column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "assumptionsPK")
            }
        column(name: "version", type: "bigint", {
                constraints(nullable: "true")
            })
        column(name: "position", type: "bigint"){
                constraints(nullable: "true")
        }
        column(name: "matter_id", type: "bigint", {
                constraints(nullable: "false")
            })
        column(name: "task_id", type: "bigint", {
                constraints(nullable: "false")
            })
        column(name: "user_id", type: "bigint", {
                constraints(nullable: "false")
            })
        column(name: "assumption", type: "VARCHAR(300)", {
                constraints(nullable: "false")
            })
        column(name: "summary", type: "VARCHAR(70)", {
                constraints(nullable: "true")
            })
      }
    }
}
