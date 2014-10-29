module('bindingService');
test('bindingService.fromData',function(){
    expect(1);
    var sql = 'test.ExecParentIDtest [ID], 11, [name], [Description], []',
        data = {id: 119, name: 'Tiesto'},
        bindingSql = 'test.ExecParentIDtest ' + data.id+', 11, ' + data.name +', [Description], []';

    equal(facade.getBindModule().bindSql(sql, data), bindingSql, 'Все атрибуты, которые возможно забиндить - биндятся, остальные остаются неизменными.');
});
