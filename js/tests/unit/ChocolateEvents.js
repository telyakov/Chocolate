module('ChocolateEvents',{
    setup: function(){
    },
    teardown: function(){
//        $('body').remove();
    }
});
test('ChocolateEvents.warningMessageEvent',function(){
    expect(1);
    var stubOnBeforeLoad = this.spy(ChocolateEvents, 'warningMessageHandler');
    ChocolateEvents.warningMessageEvent(Chocolate.$window);
    Chocolate.$window.trigger('beforeunload');
    ok(stubOnBeforeLoad.called, 'При наступлении события beforeunload, срабатывает обработчик');
    stubOnBeforeLoad.reset();
});
test('ChocolateEvents.warningMessageHandler',function(){
    expect(2);
    ok(typeof ChocolateEvents.warningMessageHandler() == 'undefined', 'При отсутствии изменений ничего не возвращается');

    var stubHasChange = this.stub(Chocolate, 'hasChange', function(){ return true;});
    ok(ChocolateEvents.warningMessageHandler(), 'При наличии изменений возвращается сообщение');
    Chocolate.hasChange.restore();
    stubHasChange.reset();
});
test('ChocolateEvents.downloadFileHandler',function(){
    expect(1);
    var href = 'param param pam.bu';
    var $a = $('<a></a>').attr('href', href);
    var stubOpen = this.stub(jQuery, 'fileDownload');
    ChocolateEvents.downloadFileHandler.apply($a);
    ok(stubOpen.calledWithExactly(href), 'Файл скачивается в текущем окне');
    stubOpen.reset();
    jQuery.fileDownload.restore();
});
test('ChocolateEvents.downloadAttachmentEvent',function(){
    expect(1);
    var href = 'path-to-file';
    var stubDownload = this.stub(ChocolateEvents, 'downloadFileHandler');
    var $a = $('<a class="attachment-file"></a>').attr('href', href);
    var $content = $('<div id="content"><div id="tabs"></div></div>');
    $('body').append($content);
    Chocolate.init();
    ChocolateEvents.downloadAttachmentEvent(Chocolate.$content);
    Chocolate.$tabs.append($a);
    $a.trigger('click');
    $a.trigger('click');
    $a.trigger('click');
    ok(stubDownload.calledOnce, 'Несколько кликов группируется в один');
    stubDownload.reset();
    $content.remove();
    ChocolateEvents.downloadFileHandler.restore();

});
test('ChocolateEvents.openFormHandler',function(){
    expect(2);
    var spy = this.spy(Chocolate, 'openForm');
    var preventDefaultSpy = this.spy(Event.prototype, 'preventDefault');
    var $context =('<a></a>');

    var event = document.createEvent('MouseEvents')
// Define that the event name is 'build'.
    ChocolateEvents.openFormHandler.apply($context, [event]);
    ok(preventDefaultSpy.calledOnce, 'Предотвращается действие по умолчанию для ссылок');
    ok(spy.calledOnce, 'Вызывается функция открытия формы');
    spy.reset();
    preventDefaultSpy.reset();
    Event.prototype.preventDefault.restore()
});
test('ChocolateEvents.openFormEvent',function(){
    expect(3);
    var $content = $('<div id="footer"></div><div id="header"></div>');
    var profileID = 'dfdf112', linkID ='cfsddss1', footerLinkID ='footerdsf';
    var $profileLink = $('<li class="link-profile"></li>').attr('id', profileID);
    var $headerMenuItem = $('<li class="link-form" ><a id="' + linkID + '"></a></li>');
    var $footerMenuItem = $('<li class="link-form" ><a id="' + footerLinkID + '"></a></li>');
    $content.filter('#footer').append($profileLink);
    $content.filter('#footer').append($footerMenuItem);
    $content.filter('#header').append($headerMenuItem);
    $('body').append($content);

    var stubOnOpenForm = this.stub(ChocolateEvents, 'openFormHandler');
    Chocolate.init();
    ChocolateEvents.openFormEvent($content.filter('#footer'), $content.filter('#header'));
    $profileLink.trigger('click');
    ok(stubOnOpenForm.calledOnce, 'Клик по профилю пользователя вызывает загрузку специальной формы');
    stubOnOpenForm.reset();

    $headerMenuItem.children('a').trigger('click');
    ok(stubOnOpenForm.calledOnce, 'Клик по закладке верхнего меню инициирует открытие формы');
    stubOnOpenForm.reset();

    $footerMenuItem.children('a').trigger('click');
    ok(stubOnOpenForm.calledOnce, 'Клик по закладке нижнего меню инициирует открытие формы');
    stubOnOpenForm.reset();
    ChocolateEvents.openFormHandler.restore();
    stubOnOpenForm.reset();
    $content.remove();
});

test('ChocolateEvents.searchInFilterHandler',function(){
    expect(2);
    var refreshFormStub = this.stub(ChGridForm.prototype, 'refresh');
    var preventDefaultSpy = this.spy(Event.prototype, 'preventDefault');


    var notCapturedEvent = document.createEvent('MouseEvents')
    var enterKeyDownEvent = $.Event("keydown", {keyCode: ChocolateEvents.KEY.ENTER})
    var result = ChocolateEvents.searchInFilterHandler(notCapturedEvent);

    ok(typeof result == 'undefined' && preventDefaultSpy.notCalled, 'Для произвольного нажатия клавиши выполняется действие по умолчанию');
    preventDefaultSpy.reset();

    var resultByEnterKeyHandler = ChocolateEvents.searchInFilterHandler(enterKeyDownEvent);
    ok(resultByEnterKeyHandler === false && refreshFormStub.calledOnce, 'При нажатии enter обработчик возвращает false и вызывается обновление формы');

    refreshFormStub.reset();
    ChGridForm.prototype.refresh.restore();
    Event.prototype.preventDefault.restore()
});
test('ChocolateEvents.searchInFilterEvent',function(){
    expect(2);
    var onSearchInFilterStub = this.stub(ChocolateEvents, 'searchInFilterHandler');
    var $content = $('<div id ="content"></div>');
    var $textFilter = $('<input type="text" class="filter">');
    var $dateFilter = $('<input type="date" class="filter">');
    $content.append($textFilter).append($dateFilter);
    $('body').append($content);
    Chocolate.init();
    ChocolateEvents.searchInFilterEvent(Chocolate.$content);

    $textFilter.trigger('keydown');
    ok(onSearchInFilterStub.calledOnce, 'При keydown по текстовому фильтру вызывается обработчик события');
    onSearchInFilterStub.reset();

    $dateFilter.trigger('keydown');
    ok(onSearchInFilterStub.notCalled, 'При keydown по любому другому фильтры НЕ вызывается обработчик');
    onSearchInFilterStub.reset();
    ChocolateEvents.searchInFilterHandler.restore();
    $content.remove();
});
test('ChocolateEvents.reflowWindowHandler',function(){
    expect(2);
    var clearSpy = this.spy(ChocolateDraw, 'clearReflowedTabs'),
        reflowStub = this.stub(ChocolateDraw, 'reflowActiveTab');
    ChocolateEvents.reflowWindowHandler();
    ok(clearSpy.calledOnce && reflowStub.calledOnce, 'Вызывается один раз очистка нарисованных вкладок и один раз перерисовка текущего активного таба');
    ok(reflowStub.calledAfter(clearSpy), 'Перерисовка вызывается после очистки');
    clearSpy.reset();
    reflowStub.reset();
    ChocolateDraw.clearReflowedTabs.restore();
    ChocolateDraw.reflowActiveTab.restore();

});
test('ChocolateEvents.reflowWindowEvent',function(){
    expect(2);
    var clock = sinon.useFakeTimers();
    var reflowStub = this.stub(ChocolateEvents, 'reflowWindowHandler');
    Chocolate.$window.unbind('resize');
    ChocolateEvents.reflowWindowEvent(Chocolate.$window);
    Chocolate.$window.trigger('resize');
    ok(reflowStub.notCalled, 'Обработчик ресайзинга не вызывается сразу');
    Chocolate.$window.trigger('resize');
    Chocolate.$window.trigger('resize');
    clock.tick(300);
    ok(reflowStub.calledOnce, 'Для нескольких событий resize подряд, вызывается только 1 раз обработчик');
    ChocolateEvents.reflowWindowHandler.restore();
    clock.restore();
});
test('ChocolateEvents.reflowTabEvent',function(){
    expect(1);
    var $content = $('<div id="tabs"></div>');
    var $link = $('<a class="ui-tabs-anchor"></a>');
    $content.append($link);
    $('body').append($content);
    var reflowStub = this.stub(ChocolateDraw, 'reflowActiveTab');
    Chocolate.init();
    ChocolateEvents.reflowTabEvent(Chocolate.$tabs);
    $link.trigger('click');
    ok(reflowStub.calledOnce, 'При клике по закладке таба перерисовывается tab');
    reflowStub.reset();
    $content.remove();
    ChocolateDraw.reflowActiveTab.restore();
});
//test('ChocolateEvents.',function(){
////    expect(1);
//});
//test('ChocolateEvents.',function(){
////    expect(1);
//});
//test('ChocolateEvents.',function(){
////    expect(1);
//});
//test('ChocolateEvents.',function(){
////    expect(1);
//});
//test('ChocolateEvents.',function(){
////    expect(1);
//});
//test('ChocolateEvents.',function(){
////    expect(1);
//});
//
