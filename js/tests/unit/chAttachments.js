module('chAttachments',{
    setup: function(){
        this.firstFile = {name: 'file1'};
        this.firstID = 'ключ1';
        this.secondFile = {name: 'file2', property: 'white'};
        this.secondID = 'второй ключ';
        this.thirdFile = {size: '512 byte'};
    },
    teardown: function(){
        ChAttachments.files = [];
    }
});
test('chAttachments.push', function(){
    expect(2);
    ChAttachments.push(this.firstID, this.firstFile);
    ChAttachments.push(this.secondID, this.secondFile);
    ChAttachments.push(this.firstID, this.thirdFile);
    var firstExpectedObj =[this.firstFile, this.thirdFile]
       ,secondExpectedObj =[this.secondFile];
    deepEqual(ChAttachments.files[this.secondID], secondExpectedObj, 'Добавление вложений.');
    deepEqual(ChAttachments.files[this.firstID], firstExpectedObj, 'Добавление нескольких вложений к одной сущности(ключу)');
});
test('chAttachments.isSet', function(){
    expect(2);
    ChAttachments.files[this.firstID] = [this.firstFile];
    ok(ChAttachments.isSet(this.secondID) ===false, 'Если для сущности(ключа) нет вложений - возвращается false');
    ok(ChAttachments.isSet(this.firstID) === true, 'Если для сущности(ключа) есть вложения - возвращается true');
});
test('chAttachments.clear', function(){
    expect(3);
    ChAttachments.files[this.firstID] = [this.firstFile, this.thirdFile];
    ChAttachments.files[this.secondID] = [this.secondFile];
    ChAttachments.clear(this.firstID);

    ok(typeof ChAttachments.files[this.firstID] == 'undefined', 'Удаление вложение для сущности');

    deepEqual(ChAttachments.files[this.secondID], [this.secondFile], 'Удаление вложение для одной сущности не затрагивает другие сущности');

    var clearSpy = this.spy(ChAttachments, 'clear');
    ChAttachments.clear(this.firstID);
    ok(!clearSpy.threw(), 'При удалении несуществующих вложений - НЕ генерируется ошибка');
    clearSpy.reset();

});
test('chAttachments.isNotEmpty', function(){
    expect(3);
    ChAttachments.files[this.firstID] = [this.firstFile, this.thirdFile];
    ChAttachments.files[this.secondID] = [];
    var invalidID = 'bad-id';
    ok(ChAttachments.isNotEmpty(this.firstID)===true, 'Сущность со вложениями возвращает true');
    ok(ChAttachments.isNotEmpty(this.secondID)===false, 'Сущность без вложений возвращает false');
    ok(ChAttachments.isNotEmpty(invalidID)===false, 'Несуществующая сущность без вложений возвращает false');
});
test('chAttachments.isEmpty', function(){
    expect(2);
    ChAttachments.files[this.firstID] = [this.firstFile, this.secondFile];
    ChAttachments.files[this.secondID] = [];
    ok(ChAttachments.isEmpty(this.firstID)===false, 'Сущность со вложениями возвращает false');
    ok(ChAttachments.isEmpty(this.secondID)===true, 'Сущность без вложений возвращает true');
});

test('chAttachments.pop', function(){
    expect(3);
    ChAttachments.files[this.firstID] = [this.firstFile, this.secondFile];
    ChAttachments.files[this.secondID] = [];
    var invalidID = 'bad-id';

    deepEqual(ChAttachments.pop(this.firstID), this.secondFile, 'Для сущности, содержащей вложения достается последнее добавленое вложение')
    deepEqual(ChAttachments.pop(this.secondID), null, 'Для сущности, не содержащей вложения возвращается Null')
    deepEqual(ChAttachments.pop(invalidID), null, 'Для несуществующей сущности вложения возвращается Null')
});
