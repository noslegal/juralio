databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1672846932000-1) {
      addColumn(tableName: "organisation") {
            column(name: "google_sso_enabled", type: "boolean", valueBoolean: false)
        }
        addColumn(tableName: "instance_settings") {
            column(name: "google_sso_enabled", type: "boolean", valueBoolean: false)
        }
        addDefaultValue(tableName: "organisation", columnName: "google_sso_enabled", defaultValueBoolean: false)
        addDefaultValue(tableName: "instance_settings", columnName: "google_sso_enabled", defaultValueBoolean: false)
    }
}
