module('ChEditableCallback', {
    setup: function(){
        this.firstCallback = sinon.stub();
        this.anotherCallback = sinon.stub();
        this.thirdCallback = sinon.stub();
    },
    teardown: function(){
    }
});
test('ChEditableCallback.add',function(){
    expect(1);
    var callbackID = 'first', anotherCallbackID = 'second';
    ChEditableCallback.add(this.firstCallback, callbackID);
    ChEditableCallback.add(this.thirdCallback, callbackID);
    ChEditableCallback.add(this.anotherCallback, anotherCallbackID);
    ok(
        ChEditableCallback.callbacks[callbackID].has(this.firstCallback)
     && ChEditableCallback.callbacks[callbackID].has(this.thirdCallback)
     && ChEditableCallback.callbacks[anotherCallbackID].has(this.anotherCallback),
        'Функции добавляются в свои Callback объекты');
});
test('ChEditableCallback.remove',function(){
    expect(2);
    var callbackID = 'first', anotherCallbackID = 'second';
    ChEditableCallback.add(this.firstCallback, callbackID);
    ChEditableCallback.add(this.thirdCallback, callbackID);
    ChEditableCallback.add(this.anotherCallback, anotherCallbackID);
    ChEditableCallback.remove(callbackID);
    ok(ChEditableCallback.callbacks[anotherCallbackID].has(this.anotherCallback),'Удаление по ключу, не затрагивает другие ключи');
    ok(typeof ChEditableCallback.callbacks[callbackID] == 'undefined', 'Удаление по ключу, удаляет callback - объект');

});
test('ChEditableCallback.fire',function(){
    expect(3);
    var callbackID = 'first', anotherCallbackID = 'second', invalidCallbackID = 'no-exist-callback';
    var $firstContext = $('<li id="my-li"></li>'),
        $secondContext = $('<b></b>');

    ChEditableCallback.add(this.firstCallback, callbackID);
    ChEditableCallback.add(this.thirdCallback, callbackID);
    ChEditableCallback.add(this.anotherCallback, anotherCallbackID);
    ChEditableCallback.fire($firstContext, callbackID);
    ChEditableCallback.fire($secondContext, anotherCallbackID);
    ChEditableCallback.fire($secondContext, callbackID);
    ok(
        this.firstCallback.calledTwice && this.thirdCallback.calledTwice && this.anotherCallback.calledOnce,
        'При каждом вызове fire с ключом, вызывают все функции указанного callback объекта'
    );
    ok(
        this.firstCallback.calledWithExactly($firstContext)
        && this.thirdCallback.calledWithExactly($secondContext)
        ,
        'Контекст передается в функции в качестве единственного параметра'
    );

    var spyFire = this.spy(jQuery, 'Callbacks');
    ChEditableCallback.fire($('<a></a>'), invalidCallbackID);
    ok(spyFire.notCalled, 'Для некорректного ключа, не должна вызывать никакая Callback функция');
    spyFire.reset();
});

test('ChEditableCallback._hasCallback',function(){
    expect(2);
    var callbackID = 'first', invalidCallbackID = 'no-exist-callback';
    ChEditableCallback.add(this.firstCallback, callbackID);
    ChEditableCallback.add(this.thirdCallback, callbackID);
    ok(ChEditableCallback._hasCallback(callbackID), 'Если функция ИМЕЕТ Callback с указанным ключем возвращается true');
    ok(!ChEditableCallback._hasCallback(invalidCallbackID), 'Если функция НЕ ИМЕЕТ Callback с указанным ключем возвращается false');
});
