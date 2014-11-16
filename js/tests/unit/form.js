module('form', {
    setup: function () {
        this.module = facade.getFormModule();
        this.firstCallback = sinon.stub();
        this.anotherCallback = sinon.stub();
        this.thirdCallback = sinon.stub();
    },
    teardown: function () {
    }
});
test('form.fireCallbacks', function () {
    expect(3);
    var callbackID = 'first',
        anotherCallbackID = 'second',
        invalidCallbackID = 'no-exist-callback',
        $firstContext = $('<li>', {
            id: 'my-li'
        }),
        $secondContext = $('<b>');

    this.module.addCallback(this.firstCallback, callbackID);
    this.module.addCallback(this.thirdCallback, callbackID);
    this.module.addCallback(this.anotherCallback, anotherCallbackID);
    this.module.fireCallbacks($firstContext, callbackID);
    this.module.fireCallbacks($secondContext, anotherCallbackID);
    this.module.fireCallbacks($secondContext, callbackID);
    ok(
        this.firstCallback.calledTwice && this.thirdCallback.calledTwice && this.anotherCallback.calledOnce,
        'При каждом вызове fire с ключом, вызывают все функции указанного callback объекта'
    );
    ok(
        this.firstCallback.calledWithExactly($firstContext) && this.thirdCallback.calledWithExactly($secondContext),
        'Контекст передается в функции в качестве единственного параметра'
    );

    var spyFire = this.spy(jQuery, 'Callbacks');
    this.module.fireCallbacks($('<a>'), invalidCallbackID);
    ok(spyFire.notCalled, 'Для некорректного ключа, не должна вызывать никакая Callback функция');
    spyFire.reset();
});