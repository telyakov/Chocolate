module('filesModule', {
    setup: function () {
        this.module = facade.getFilesModule();
        this.firstFile = {name: 'file1'};
        this.firstID = 'ключ1';
        this.secondFile = {name: 'file2', property: 'white'};
        this.secondID = 'второй ключ';
        this.thirdFile = {size: '512 byte'};
    },
    teardown: function () {
        facade.getFilesModule().clear();
    }
});
test('chAttachments.push', function () {
    expect(3);
    this.module.push(this.firstID, this.firstFile);
    this.module.push(this.secondID, this.secondFile);
    this.module.push(this.firstID, this.thirdFile);
    deepEqual(this.module.pop(this.secondID), this.secondFile, 'Добавление вложений.');
    deepEqual(this.module.pop(this.firstID), this.thirdFile, 'Добавление нескольких вложений к одной сущности(ключу)');
    deepEqual(this.module.pop(this.firstID), this.firstFile, 'Добавление нескольких вложений к одной сущности(ключу)');
});
test('chAttachments.clear', function () {
    expect(3);
    this.module.push(this.firstID, this.firstFile);
    this.module.push(this.secondID, this.secondFile);
    this.module.push(this.firstID, this.thirdFile);
    this.module.clear(this.firstID);
    ok(this.module.pop(this.firstID) === null, 'Удаление вложение для сущности');
    deepEqual(this.module.pop(this.secondID), this.secondFile, 'Удаление вложение для одной сущности не затрагивает другие сущности');
    var clearSpy = this.spy(this.module, 'clear');
    this.module.clear(this.firstID);
    ok(!clearSpy.threw(), 'При удалении несуществующих вложений - НЕ генерируется ошибка');
    clearSpy.reset();

});
test('chAttachments.isNotEmpty', function () {
    expect(3);
    this.module.push(this.firstID, this.firstFile);
    this.module.push(this.firstID, this.thirdFile);
    var invalidID = 'bad-id';
    ok(this.module.isNotEmpty(this.firstID) === true, 'Сущность со вложениями возвращает true');
    ok(this.module.isNotEmpty(this.secondID) === false, 'Сущность без вложений возвращает false');
    ok(this.module.isNotEmpty(invalidID) === false, 'Несуществующая сущность без вложений возвращает false');
});

test('chAttachments.pop', function () {
    expect(3);
    this.module.push(this.firstID, this.firstFile);
    this.module.push(this.firstID, this.secondFile);
    var invalidID = 'bad-id';
    deepEqual(this.module.pop(this.firstID), this.secondFile, 'Для сущности, содержащей вложения достается последнее добавленое вложение');
    deepEqual(this.module.pop(this.secondID), null, 'Для сущности, не содержащей вложения возвращается Null');
    deepEqual(this.module.pop(invalidID), null, 'Для несуществующей сущности вложения возвращается Null');
});
