module('ChObjectStorage', {
    setup: function(){
        this.chForm = new ChGridForm('<form></form>');
        this.chTab = new ChTab($('<a></a>'));
        this.chCard = new ChCard('<div></div>');
    },
    teardown: function(){
        ChObjectStorage._objectStorage = [];
    }
});
test('ChObjectStorage._set', function(){
    expect(1);
    var formId = 'form-by-ch';
    ChObjectStorage._set(formId, this.chForm);
    deepEqual(ChObjectStorage._objectStorage[formId], this.chForm, 'Объект сохраняется в коллекцию с заданным ключом');
});
test('ChObjectStorage.getByID', function(){
    expect(2)
    var formId = 'form-by-ch', invalidID = 'fsasaas';
    ChObjectStorage._set(formId, this.chForm);
    ok(ChObjectStorage.getByID(invalidID)===null, 'В случае отсутствия объекта, возвращается null');
    deepEqual(ChObjectStorage.getByID(formId), this.chForm, 'Возвращается объект из хранилища с заданным ключом');
});
test('ChObjectStorage.getChCard', function(){
    expect(2);
    var spyCreate = this.spy(ChObjectStorage, 'create'),
        $gridTabs = $('<div></div>');
    var card = ChObjectStorage.getChCard($gridTabs);
    ok(card instanceof ChCard, 'Вернулся объект типа ChCard');
    ok(spyCreate.calledWithExactly($gridTabs, 'ChCard'), 'В метод create передались правильные параметры');
    spyCreate.reset();
});
test('ChObjectStorage.getChTab', function(){
    expect(2);
    var spyCreate = this.spy(ChObjectStorage, 'create'),
        $tabs = $('<div></div>');
    var card = ChObjectStorage.getChTab($tabs);
    ok(card instanceof ChTab, 'Вернулся объект типа ChTab');
    ok(spyCreate.calledWithExactly($tabs, 'ChTab'), 'В метод create передались правильные параметры');
    spyCreate.reset();
});
test('ChObjectStorage.getChGridForm', function(){
    expect(2);
    var spyCreate = this.spy(ChObjectStorage, 'create'),
        form = $('<div></div>');
    var card = ChObjectStorage.getChGridForm(form);
    ok(card instanceof ChGridForm, 'Вернулся объект типа ChGridForm');
    ok(spyCreate.calledWithExactly(form, 'ChGridForm'), 'В метод create передались правильные параметры');
    spyCreate.reset();
});
test('ChObjectStorage.create', function(){
    expect(4);
    var elemID = 'dfdsdsvv3';
    var $elemWithID = $('<div></div>').attr('id', elemID),
        $elem = $('<a></a>');
    ChObjectStorage.create($elemWithID, 'ChGridForm');
    var card = ChObjectStorage.create($elem, 'ChCard');
    ok(ChObjectStorage.getByID(elemID) instanceof ChGridForm, 'jQuery объект с ключом должен сохранить свой ключ при сохранении');
    ok(card instanceof ChCard, 'jQuery объект без ключа получает уникальный ключ и сохраняется в хранилище');

//    var mockID = 'yj43dfdw';
//    var $mockElem = $('<div></div>').attr('id', mockID);
//    var form = ChObjectStorage.create($mockElem, 'ChGridForm');
//    var tab = ChObjectStorage.create($mockElem, 'ChTab');
//    ok(tab instanceof ChTab, 'Создается новый объект указанного типа, если его не было в хранилище или с этим ключом был другой объект');

    var spyCreate = this.spy(ChObjectStorage, 'create');
    var stubErrorLog = this.stub(Chocolate.log, 'error');
    var invalidObj = ChObjectStorage.create($('<a></a>'), 'invalidObj');
    ok(!spyCreate.threw() && invalidObj === null, 'Если указанного объекта не существует, возвращается null и логируется ошибка;');
    spyCreate.reset();
    stubErrorLog.reset();
    Chocolate.log.error.restore();
    var formID = 'qodfskl342';
    var $formElem = $('<div></div>').attr('id', formID);
    var spySet =  this.spy(ChObjectStorage, '_set');
    ChObjectStorage.create($formElem, 'ChGridForm');
    ChObjectStorage.create($formElem, 'ChGridForm');
    ok(spySet.calledOnce, 'Если в хранилище уже есть объект указанного типа, с заданным ключом, то возвращается он, а не создается новый');
    spySet.reset();
});
test('ChObjectStorage.garbageCollection', function(){
    expect(3);
    var formID = 'fdfsdfdss1', cardID = 'nvb545', tabID = 'dfd13ds';
    var $form = $('<form></form>').attr('id', formID),
        $card = $('<div></div>').attr('id', cardID),
        $tab = $('<div></div>').attr('id', tabID);

    Chocolate.storage.session[formID] = { combo: 'flash'};
    var card =ChObjectStorage.getChCard($card);
    ChObjectStorage.getChGridForm($form);
    ChObjectStorage.getChTab($tab);
    $('body').append($card);
    ChObjectStorage.garbageCollection();
    ok(typeof Chocolate.storage.session[formID] == 'undefined', 'Хранилище для удаленных объектов очищается');
    deepEqual(ChObjectStorage.getByID(cardID), card, 'Объекты, присутствующие в DOM не удаляются');
    ok(ChObjectStorage.getByID(formID) ==null && ChObjectStorage.getByID(tabID) ==null, 'Объекты, уже не присутствующие в DOM удаляются')
    $card.remove();
});
