databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1734691152000-1) {
      sql('''
  		   ALTER TABLE public.period ALTER COLUMN start_date DROP NOT NULL;
        ''')
    }
}
