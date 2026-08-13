databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1586256872000 - 1) {
        sql('''
  		    ALTER TABLE public.post ALTER COLUMN date_created DROP NOT NULL;
        ''')
    }
    changeSet(author: "juralio (generated)", id: 1586256872000 - 2) {
        sql('''
  		    ALTER TABLE public.post ALTER COLUMN last_updated DROP NOT NULL;
        ''')
    }
    changeSet(author: "juralio (generated)", id: 1586256872000 - 3) {
        sql('''
  		     ALTER TABLE public.task ALTER COLUMN last_updated DROP NOT NULL;
        ''')
    }
    changeSet(author: "juralio (generated)", id: 1586256872000 - 4) {
        sql('''
  		   ALTER TABLE public.project_template ALTER COLUMN date_created DROP NOT NULL;
        ''')
    }
    changeSet(author: "juralio (generated)", id: 1586256872000 - 5) {
        sql('''
  		     ALTER TABLE public.project_template ALTER COLUMN last_updated DROP NOT NULL;
        ''')
    }
}
