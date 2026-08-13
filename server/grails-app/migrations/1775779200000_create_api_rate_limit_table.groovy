databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: "1775779200000-1") {
        createTable(tableName: "api_rate_limit") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "api_rate_limitPK")
            }
            column(name: "ip_address", type: "VARCHAR(45)") {
                constraints(nullable: "false")
            }
            column(name: "window_key", type: "BIGINT") {
                constraints(nullable: "false")
            }
            column(name: "request_count", type: "INT", defaultValueNumeric: "1") {
                constraints(nullable: "false")
            }
            column(name: "created_at", type: "TIMESTAMP", defaultValueComputed: "NOW()") {
                constraints(nullable: "false")
            }
        }
    }

    changeSet(author: "juralio (generated)", id: "1775779200000-2") {
        sql('CREATE UNIQUE INDEX uq_api_rate_limit_ip_window ON api_rate_limit (ip_address, window_key)')
    }

    changeSet(author: "juralio (generated)", id: "1775779200000-3") {
        sql('CREATE INDEX idx_api_rate_limit_window_key ON api_rate_limit (window_key)')
    }
}
