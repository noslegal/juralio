databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1693406507000-1) {
      addColumn(tableName: "organisation") {
            column(name: "costs_enabled", type: "boolean", valueBoolean: false)
        }
        addColumn(tableName: "instance_settings") {
            column(name: "costs_enabled", type: "boolean", valueBoolean: false)
        }
        addDefaultValue(tableName: "organisation", columnName: "costs_enabled", defaultValueBoolean: false)
        addDefaultValue(tableName: "instance_settings", columnName: "costs_enabled", defaultValueBoolean: false)
    }
}
