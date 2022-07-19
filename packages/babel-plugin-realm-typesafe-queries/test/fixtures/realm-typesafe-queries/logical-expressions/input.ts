realm.objects('Test').filtered(o => o.age === age && !o.married);
realm.objects('Test').filtered(o => o.age === age && o.name === name);
realm.objects('Test').filtered(o => (o.age === age || o.name === name) && o.middleName === middleName);
// realm.objects('Test').filtered(o => (o.age === age || o.name === name) && o.parent.name === parentName);