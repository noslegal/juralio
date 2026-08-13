databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1662383473000-1) {  
      addColumn(tableName: "template_provider_source") {
        column(name: "name", type: "VARCHAR(70)", defaultValue: null)
    }
  }
}
