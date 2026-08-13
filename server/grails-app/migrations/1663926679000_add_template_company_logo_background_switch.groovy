databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1663926679000-1) {
      addColumn(tableName: "project_template") {
            column(name: "company_image_background", type: "BOOLEAN", defaultValue:true)
           
        }
    }
}
