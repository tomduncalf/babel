realm.objects('Test').filtered(o => o.name.startsWith("a"));
realm.objects('Test').filtered(o => o.name.startsWith("a", true));
realm.objects('Test').filtered(o => o.name.startsWith(nameQuery));
