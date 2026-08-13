databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1661269169000 - 1) {
        sql """
          		    ALTER TABLE project_template ADD COLUMN url VARCHAR(500);
          		    ALTER TABLE project_template ADD COLUMN url_credit VARCHAR(500);
          		    ALTER TABLE project_template ADD COLUMN url_credit_name VARCHAR(500);
        """
    }
}
