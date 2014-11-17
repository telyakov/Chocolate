module('cardModule', {
    setup: function(){
        this.module = facade.getCardModule();
        this.cardCallback = sinon.stub();
        this.anotherCardCallback = sinon.stub();
    },
    teardown: function(){
    }
});

test('cardModule.fireOnce', function(){
    expect(1);
    this.module.addCallback(this.cardCallback);
    var $context = $('<span id="test"></span>');
    this.module.fireOnceCallback($context);
    this.module.addCallback(this.anotherCardCallback);
    this.module.fireOnceCallback($context);
    this.module.fireOnceCallback($context);
    ok(
        this.cardCallback.calledOnce && this.cardCallback.calledWithExactly($context) && this.anotherCardCallback.calledOnce && this.anotherCardCallback.calledWithExactly($context),
        'Каждая функция вызывается один раз');
});

