databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1710172122000-1) {

        createTable(tableName: "cost_snapshot") {
            column(name: "id", type: "int8",   constraints(primaryKey: "true", primaryKeyName: "snapshotPK"))
            column(name: "version", type: "int8",constraints(primaryKey: "true", primaryKeyName: "snapshotPK"))
            column(name: "matter_id", type: "BIGINT")
            column(name: "snapshot", type: "text")
            column(name: "snapshot_date", type: "TIMESTAMP WITHOUT TIME ZONE")
        }
        }
    }
