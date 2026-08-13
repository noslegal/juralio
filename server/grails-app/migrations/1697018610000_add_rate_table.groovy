databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1697018610000-1) {
        createTable(tableName: 'grade_category'){
        column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "grade_categoryPK")
            }
        column(name: "version", type: "bigint", {
                constraints(nullable: "true")
            })
        column(name: "name", type: "VARCHAR(255)") {
                constraints(nullable: "false")
            }
        column(name: "organisation_id", type: "bigint", {
                constraints(nullable: "false")
            })  
        column(name: "colour_idx", type: "INT",{
                constraints(nullable: "false")
            })
      }
      createTable(tableName: 'grade'){
        column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "gradePK")
            }
        column(name: "version", type: "bigint", {
                constraints(nullable: "true")
            })
        column(name: "name", type: "VARCHAR(255)") {
                constraints(nullable: "false")
            }
        column(name: "organisation_id", type: "bigint", {
                constraints(nullable: "false")
            })
        column(name: "grade_category_id", type: "bigint") 

        column(name: "grade_idx", type: "INT",{
                constraints(nullable: "false")
            })   
      }
      createTable(tableName: 'period'){
        column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "periodPK")
            }
        column(name: "version", type: "bigint", {
                constraints(nullable: "true")
            })
        column(name: "name", type: "VARCHAR(255)") {
                constraints(nullable: "false")
            }
        column(name: "organisation_id", type: "bigint", {
                constraints(nullable: "false")
            })
        column(name: "start_date", type: "TIMESTAMP WITHOUT TIME ZONE") {
                constraints(nullable: "false")
            }

        column(name: "end_date", type: "TIMESTAMP WITHOUT TIME ZONE") {
                constraints(nullable: "true")
            }
              column(name: "rate_table_details_id", type: "bigint", {
                constraints(nullable: "true")
            })
      }

      createTable(tableName: 'rate_type'){
        column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "rate_typePK")
            }
        column(name: "version", type: "bigint", {
                constraints(nullable: "true")
            })
        column(name: "name", type: "VARCHAR(255)") {
                constraints(nullable: "false")
            }
        column(name: "organisation_id", type: "bigint", {
                constraints(nullable: "false")
            })  
      }

      createTable(tableName: 'rate'){
        column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "ratePK")
            }
        column(name: "version", type: "bigint", {
                constraints(nullable: "true")
            })
        column(name: "organisation_id", type: "bigint", {
                constraints(nullable: "false")
            })
        column(name: "grade_id", type: "bigint", {
                constraints(nullable: "false")
            })
        column(name: "period_id", type: "bigint", {
                constraints(nullable: "false")
            })
        column(name: "rate", type: "FLOAT8") {
                constraints(nullable: "false")
            }
        column(name: "rate_type_id", type: "bigint") {
                constraints(nullable: "false")
        }
        column(name: "rate_table_details_id", type: "bigint") {
                constraints(nullable: "false")
        }
        
      }

      createTable(tableName: 'other_cost'){
        column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "other_costPK")
            }
        column(name: "version", type: "bigint", {
                constraints(nullable: "true")
            })
        column(name: "name", type: "VARCHAR(255)") {
                constraints(nullable: "false")
            }
        column(name: "organisation_id", type: "bigint", {
                constraints(nullable: "false")
            })  
      }

      createTable(tableName: 'rate_table_details'){
         column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "rate_table_detailsPK")
            }
        column(name: "version", type: "bigint", {
                constraints(nullable: "true")
            })
        column(name: "work_type", type: "VARCHAR(255)") {
                constraints(nullable: "false")
            }
        column(name: "location", type: "VARCHAR(255)") {
                constraints(nullable: "false")
            }
        column(name: "currency", type: "VARCHAR(255)") {
                constraints(nullable: "false")
            }
        column(name: "organisation_id", type: "bigint", {
                constraints(nullable: "false")
            })
        column(name: "rate_table_details_id", type: "bigint") {
                constraints(nullable: "true")
            } 
        column(name: "client", type: "boolean", defaultValue: "false", {
                constraints(nullable: "false")
            }) 
        column(name: "draft", type: "boolean", defaultValue: "true", {
                constraints(nullable: "false")
            })
        column(name: "client_name", type: "VARCHAR(255)", {
                constraints(nullable: "true")
            })
      }
    }
}
