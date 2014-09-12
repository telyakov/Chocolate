module('ChCardInitCallback', {
    setup: function(){
        this.cardCallback = sinon.stub();
        this.anotherCardCallback = sinon.stub();
    },
    teardown: function(){
    }
});
test('ChCardInitCallback.add', function(){
    expect(1);

    ChCardInitCallback.add(this.cardCallback);
    ChCardInitCallback.add(this.anotherCardCallback);
    ok(
        ChCardInitCallback.callbacks.has(this.cardCallback) && ChCardInitCallback.callbacks.has(this.anotherCardCallback),
        'Функции добавляются в объект $.Callback'
    )
});
test('ChCardInitCallback._clear', function(){
    expect(1);
    ChCardInitCallback.add(this.cardCallback);
    ChCardInitCallback.add(this.anotherCardCallback);
    ChCardInitCallback._clear();
    ok(
        !ChCardInitCallback.callbacks.has(this.cardCallback) && !ChCardInitCallback.callbacks.has(this.anotherCardCallback),
        'Функции удаляются из объекта $.Callback'
    )
});
test('ChCardInitCallback.fireOnce', function(){
    expect(1);
    ChCardInitCallback.add(this.cardCallback);
    var $context = $('<span id="test"></span>');
    ChCardInitCallback.fireOnce($context);
    ChCardInitCallback.add(this.anotherCardCallback);
    ChCardInitCallback.fireOnce($context);
    ChCardInitCallback.fireOnce($context);
    ok(
        this.cardCallback.calledOnce && this.cardCallback.calledWithExactly($context) && this.anotherCardCallback.calledOnce && this.anotherCardCallback.calledWithExactly($context),
        'Каждая функция вызывается один раз вызываются один раз')

});

