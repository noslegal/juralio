databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1700152479000-1) {
      createTable(tableName: "matter_pricing") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "matter_pricingPK")
            }

            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "matter_id", type: "BIGINT") {
                constraints(nullable: "false")
            }
            column(name: "reason", type: "VARCHAR(255)") {
                constraints(nullable: "true")
            }

            column(name: "value", type: "bigint") {
                constraints(nullable: "true")
            }

            column(name: "type", type: "bigint") {
                constraints(nullable: "false")
            }
        }
    }
}
