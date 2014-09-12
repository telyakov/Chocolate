module('chAjaxQueue', {
    setup: function(){
        this.firstTask = new ChAjaxTask('id1', 'FirstClass', []);
        this.secondTask = new ChAjaxTask('id2', 'SecondClass', {name: 'Batman'});
        this.thirdTask = new ChAjaxTask('id3', 'ThirdClass', {name: 'Robin', friend: 'Batman'});
    },
    teardown: function(){
        chAjaxQueue.queue = [];
    }
});
test('chAjaxQueue.enqueue',function(){
    expect(1);
    chAjaxQueue.enqueue(this.firstTask);
    deepEqual(chAjaxQueue.queue, [this.firstTask], 'Задача добавляется в очередь.')
});
test('chAjaxQueue.dequeueAll',function(){
    expect(2);
    chAjaxQueue
        .enqueue(this.firstTask)
        .enqueue(this.secondTask)
        .enqueue(this.thirdTask);
    var data = chAjaxQueue.dequeueAll(),
        expectedData ={
            1:{
                id: this.firstTask.id,
                type: this.firstTask.chObjectClass,
                params: this.firstTask.params
            },
            2:{
                id: this.secondTask.id,
                type: this.secondTask.chObjectClass,
                params: this.secondTask.params
            },
            3:{
                id: this.thirdTask.id,
                type: this.thirdTask.chObjectClass,
                params: this.thirdTask.params
            }
        };
    deepEqual(chAjaxQueue.queue, [], 'После удаления всех задач из очереди очередь становится равной первоначальному значению');
    deepEqual(data, expectedData, 'Возращаемая дата, сооветствует ожидаемому формату');

});
test('chAjaxQueue.isNotEmpty', function(){
   expect(2);
    ok(chAjaxQueue.isNotEmpty() === false, 'Изначально очередь пустая');
    chAjaxQueue.enqueue(this.firstTask);
    ok(chAjaxQueue.isNotEmpty() === true, 'После добавления задачи, очередь не пустая');
});
test('chAjaxQueue.send',function(){
    expect(4);
    var postSpy = this.spy(jQuery, 'post');
    chAjaxQueue.send();
    ok(postSpy.notCalled, 'Пустая очередь не должна инициализировать AJAX - запрос');

    var fakeServer= this.sandbox.useFakeServer();
    chAjaxQueue
        .enqueue(this.firstTask)
        .enqueue(this.secondTask)
        .enqueue(this.thirdTask);
    var errorSpy = this.stub(Chocolate.log, 'error')
    fakeServer.respondWith(
        'POST',
        ChOptions.urls.queueExecute,
        [
            200,
            { 'Content-Type': 'text/html' },
            ''
        ]
    );
     chAjaxQueue.send();
    fakeServer.respond();
    ok(errorSpy.calledOnce, 'В случае успешного ответа, но в неправильном формате ошибка логируется');

    errorSpy.reset()

    var spyApplyResponse = this.stub(ChPackageResponse.prototype, 'applyResponse');
    chAjaxQueue
        .enqueue(this.firstTask)
        .enqueue(this.secondTask)
        .enqueue(this.thirdTask);
    fakeServer.respondWith(
        'POST',
        ChOptions.urls.queueExecute,
        [
            200,
            { 'Content-Type': 'text/html' },
            '{}'
        ]
    );
    chAjaxQueue.send();
    fakeServer.respond();
    ok(spyApplyResponse.calledOnce, 'В случае успешного ответа в форматe json - вызывается метод ChPackageResponse.applyResponse');
    ChPackageResponse.prototype.applyResponse.restore();
    spyApplyResponse.restore()

    chAjaxQueue
        .enqueue(this.firstTask)
        .enqueue(this.secondTask)
        .enqueue(this.thirdTask);
    fakeServer.respondWith(
        'POST',
        ChOptions.urls.queueExecute,
        [
            500,
            { 'Content-Type': 'text/html' },
            '{}'
        ]
    );
    chAjaxQueue.send();
    fakeServer.respond();
    ok(errorSpy.calledOnce, 'В случае серверной ошибки - логируется исключение.');
    errorSpy.reset();
    Chocolate.log.error.restore();
});