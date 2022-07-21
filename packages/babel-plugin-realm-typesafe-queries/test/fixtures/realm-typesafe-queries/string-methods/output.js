realm.objects('Test').filtered("name BEGINSWITH \"a\"");
realm.objects('Test').filtered("name BEGINSWITH[c] \"a\"");
realm.objects('Test').filtered("name BEGINSWITH $0", nameQuery);
