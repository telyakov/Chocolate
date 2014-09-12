module('bindingService');
test('bindingService.fromParentData',function(){
   expect(3);
    var sql = 'test.ExecParentIDtest [ParentID], 11, [ParentID]',
        parentData = {id: 119, name: 'Tiesto'},
        bindingSql = 'test.ExecParentIDtest '+parentData.id+', 11, '+parentData.id;
    equal(bindingService.fromParentData(sql, parentData), bindingSql, 'Атрибут [ParentID] биндидится в любом количестве вхождений и без учета регистра');

    var invalidParentData = {city: 'LA'};
    equal(bindingService.fromParentData(sql, invalidParentData), sql, 'Незабинденное свойство, должно сохранять свое прежнее значение');

    var invalidRegisterData = {ID: 90};
    equal(bindingService.fromParentData(sql, invalidRegisterData), sql, 'Свойства объекта данных чувствительны к регистру(подходит только нижний регистр)');

});
test('bindingService.fromData',function(){
    expect(1);
    var sql = 'test.ExecParentIDtest [ID], 11, [name], [Description], []',
        data = {id: 119, name: 'Tiesto'},
        bindingSql = 'test.ExecParentIDtest ' + data.id+', 11, ' + data.name +', [Description], []';

    equal(bindingService.fromData(sql, data), bindingSql, 'Все атрибуты, которые возможно забиндить - биндятся, остальные остаются неизменными.');
});
