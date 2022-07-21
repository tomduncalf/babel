realm.objects('Test').filtered(o => o.relatedItems.any(x => x.age > 30));
