module("Chocolate", {
    setup: function(){
        $('body').append('<div id="tabs"><ul></ul></div>');
        Chocolate.init();
    },
    teardown: function(){
        Chocolate.$tabs.remove();
        Chocolate.storage.session = {};
    }
});
test('Chocolate.clsSel', function(){
    expect(1);
    var className = 'ui-controller', expectedClassSelector = '.' + className ;
    equal(Chocolate.clsSel(className), expectedClassSelector, 'Генерирует правильный селектор класса');
});
test('Chocolate.idSel', function(){
    expect(1);
    var id = 'author-917', expectedIdSelector = '#' + id ;
    equal(Chocolate.idSel(id), expectedIdSelector, 'Генерирует правильный селектор ключа(id)');
});
test('Chocolate.getActiveChTab', function(){
    expect(2);
    var tabStub =this.stub(window, "ChTab");
    Chocolate.getActiveChTab();
    ok(tabStub.calledOnce === true && tabStub.threw() === false, 'Если нет активных вкладок - объект возвращается без исключений');
//    console.log( a)
    window.ChTab.restore();
    tabStub.reset();
    var $mainMenu = $('<ul>').addClass(ChOptions.classes.tabMenuClass),
        $activeTab = $('<li>').addClass(ChOptions.classes.activeTab),
        $simpleTab =  $('<li>'),
        $anotherTab = $('<li>'),
        $content = $('<div>'),
        activeID = 'active-id',
        invalidActiveID = 'invalid-active-id',
        $activeLink = $('<a>').attr('id', activeID),
        $simpleLink = $('<a>'),
        $anotherLink = $('<a>');
    $simpleTab.append($simpleLink);
    $anotherTab.append($anotherLink);
    $activeTab.append($activeLink);
    $mainMenu
        .append($simpleTab)
        .append($activeTab)
        .append($anotherTab);

    var $secondMenu = $mainMenu.clone();
    $secondMenu.find(Chocolate.idSel(activeID)).attr('id', invalidActiveID);
    $content.append($secondMenu);
    Chocolate.$tabs
        .prepend($content)
        .append($mainMenu);
    equal(Chocolate.getActiveChTab().$a.attr('id'), activeID, 'Активная закладка определяется правильно');
});
test('Chocolate.uniqueID', function(){
    expect(1);
var firstID = Chocolate.uniqueID(),
    secondID = Chocolate.uniqueID(),
    thirdID = Chocolate.uniqueID();
    ok(firstID !== secondID && firstID !== thirdID && secondID !== thirdID, 'Каждый раз генерируется уникальный идентификатор');
});
test('Chocolate.formatNumber', function(){
    expect(5);
    var number = 1000, formattedNumber ='1 000';
    equal(Chocolate.formatNumber(number), formattedNumber,  'Число форматируется в строку с разделителем пробел по разрядам');

    var stringNumber = '1900123', formattedStringNumber ='1 900 123';
    equal(Chocolate.formatNumber(stringNumber), formattedStringNumber, 'Строка, содержащая число, форматируется в строку с разделителем по разрядам');

    var decimalNumber = 90123.11, formattedDecimalNumber = '90 123.11';
    equal(Chocolate.formatNumber(decimalNumber), formattedDecimalNumber, 'Десятичное число форматируется как и обычное, сохраняя десятичную дробь');

    var incorrectNumber = '12412chocolate99';
    equal(Chocolate.formatNumber(incorrectNumber), incorrectNumber, 'Некорректное число никак не форматируется');

    var nullNumber = null;
    equal(Chocolate.formatNumber(nullNumber), nullNumber, 'Ноль никак не форматируется');

//    var tooPreciseNumber = 1900400.123456, tooPreciseFormattedNumber = '1 900 400.12';
//    equal(Chocolate.formatNumber(tooPreciseNumber), tooPreciseFormattedNumber, 'После форматирования остается 2 разряда после запятой');

});
test('Chocolate.eng2rus', function(){
    expect(1);
    var engStr = 'IjrJkfl тест', ruStr ='ШокОлад тест';
    equal(Chocolate.eng2rus(engStr), ruStr, 'En - строка в смешанном регистре конвертируется в Ru - строку в таком же регистре');
});
test('Chocolate.mergeObj', function () {
    expect(5);
    var name = 'Анди Горсия', list = [1, 2, 3], object = { lake: 'Мичиган' };
    var source = {
        name: 'invalid Name',
        list: list,
        object: {
            date: 'invalid Date',
            город: 'Чикаго'
        }
    };
    var addition = {
        name: name,
        object: object
    };
   var clone =  function clone(o) {
       // не копирует массивы
        var obj = {};
        for(var i in o){
            if(typeof  o[i] ==='object' &&  !(o[i]  instanceof Array) ){
                obj[i] = clone(o[i]);
            }else{
            obj[i] = o[i];

            }
        }
        return obj;
    };
    var sourceExpected = clone(source);
    var additionExpected = clone(addition);
    var result = Chocolate.mergeObj(source, addition);

    deepEqual(source, sourceExpected, "Объект - источник не меняется");

    deepEqual(addition, additionExpected, "Объект - дополнение не меняется");

    equal(result.name, name, 'Примитивное свойство в addition должно перетирать свойство source');

    equal(result.list, list, 'Если свойства нет в addition, но есть в source, оно должно сохраниться.');

    deepEqual(result.object, object, 'Объекты, как и примитивные свойства, должны перетираться полностью.');
});
test('Chocolate.parse', function () {
    expect(2);
    var key = 'key', name = 'Вннни Пухt?*:;"\'',
        obj ={ id: encodeURIComponent('хеш11')};
    equal(Chocolate.parse(key, encodeURIComponent(name)), name, 'Строка должна деколироваться в первоначальное состояние');
    deepEqual(Chocolate.parse(key, obj), obj, 'Объект не должен декодироваться.');
});
test('Chocolate.openForm', function(){
    expect(4);
    var invalidUrl = '#', spyToPost = this.spy(jQuery, 'post');
    Chocolate.openForm(invalidUrl);
    ok(spyToPost.notCalled, 'Для некорректного url не отправляется ajax - запрос');

    var validUrl =  '/grid/index?view=tasks.xml', formID = 'form-id',
        fakeServer= this.sandbox.useFakeServer();
    fakeServer.respondWith(
        'POST',
        validUrl,
        [
            200,
            { 'Content-Type': 'text/html' },
            '<div id="'+ formID +'"></div>'
        ]
    );
    Chocolate.openForm(validUrl);
    fakeServer.respond();
    ok(Chocolate.$tabs.children('#'+formID).length, 'В случае успешного ajax - запроса, данные добавляются на страницу');

    var errorStub = this.stub(log4javascript.getLogger(), 'error');
    var spyToAppend = sinon.spy($.prototype, "append"), badContentID = 'bad-content';
    fakeServer.respondWith(
        'POST',
        validUrl,
        [
            200,
            { 'Content-Type': 'text/html' },
            '<div id ="' + badContentID + '">fd<a>dd</a></div><script>'+ 'console.log($(this).attr(&#039;rel&#039;))'+'</script>'
        ]
    );
    Chocolate.openForm(validUrl);
    fakeServer.respond();
    ok(spyToAppend.threw() && !$(Chocolate.idSel(badContentID)).length && errorStub.calledOnce, 'В случае успешного ajax - запроса, но' +
        'некорректных для вставки в DOM данных, логируется ошибка и данные не должны попадать в DOM');
    errorStub.reset();

    fakeServer.respondWith(
        'POST',
        validUrl,
        [
            500,
            {},
            ''
        ]
    );
    Chocolate.openForm(validUrl);
    fakeServer.respond();
    ok(errorStub.calledOnce, 'Ошибка на сервере, должна залогироваться');
    errorStub.reset();
    log4javascript.getLogger().error.restore();
});
test('Chocolate._isValidFormUrl', function(){
    expect(3);
    var validUrl = '/grid/index?view=tasks.xml',
        simpleInvalid = '#',
        hardInvalid = '/grid/index?view=.xml';
    ok(Chocolate._isValidFormUrl(validUrl), 'URL с GET параметром = имени xml-файла ВАЛИДЕН');
    ok(!Chocolate._isValidFormUrl(simpleInvalid), 'URL без GET параметра НЕВАЛИДЕН');
    ok(!Chocolate._isValidFormUrl(hardInvalid), 'URL с невалидным GET параметром НЕВАЛИДЕН');

});
test('Chocolate.layoutTemplate', function(){
    expect(1);
    var template = '<script>'+'00pk00'+'</script><div></div>333300pk00',
        id = 112, expected ='<script>'+id+'</script><div></div>3333'+id;
   equal(Chocolate.layoutTemplate(template, id), expected, 'Шаблон подставляет значение id вместо зарезервированного слова');
});
test('Chocolate.hasChange', function(){
   expect(3);
    ok(Chocolate.hasChange() === false, 'При отсуствии каких - либо данных возвращается false');

    var formID = '1234d66', anotherFormID = '89sklsdsa1';
    Chocolate.$tabs.append('<form id="' +formID +'" data-id="dsadas">');
    Chocolate.$tabs.append('<form id="' +anotherFormID +'" data-id="dsadaddf">');
    Chocolate.storage.session[formID] = {};
    Chocolate.storage.session[anotherFormID] = {};
    ok(Chocolate.hasChange() === false, 'При отсутствии изменении в формах возвращается false');

    Chocolate.storage.session[anotherFormID].change = {id:1};
    ok(Chocolate.hasChange(), 'При наличии изменении в формах возвращается true');

});
test('Chocolate.tab.close', function(){
    expect(5);
    var panelID = 'fdds11';
    var stubIsHasChange = this.stub(ChGridForm.prototype, 'isHasChange');
    stubIsHasChange.returns(false);
    this.stub(facade.getFactoryModule(), 'makeChGridForm', function(){
        return new ChGridForm('<form></form>');
    });
    var $panelContent = $('<div id="'+panelID+'"><span>ssssss</span>выфвыф</div>');
    Chocolate.$tabs.append($panelContent);
    var stubIsCardPanel = this.stub(ChTab.prototype, 'isCardTypePanel' , function(){
        return false;
    });
    var stubGetPanel = this.stub(ChTab.prototype, 'getPanel' , function(){
        return $('<div>');
    });
    var stubGetLi = this.stub(ChTab.prototype, 'getLi' , function(){
        return $('<li aria-controls="' + panelID + '">');
    });

    var stubGetExitMessage = this.stub(ChGridForm.prototype, 'getExitMessage' , function(){
        return 'message';
    });
    var stubConfirm = this.stub(window, 'confirm', function(){return true;});
    var stubReflow = this.stub(chApp.draw, 'reflowActiveTab');

    var stubTabs = this.stub($.fn, 'tabs');
    var stubUndoChange = this.stub(ChCard.prototype,'_undoChange');
    var spyGarbageCollection = this.spy(facade.getFactoryModule(), 'garbageCollection');

    Chocolate.tab.close($('<a>'));
    ok(Chocolate.$tabs.find(Chocolate.idSel(panelID)).length === 0, 'Закрытая закладка должна удаляться из DOM');
    ok(spyGarbageCollection.calledOnce, 'После закрытия закладки вызывается garbageCollection');
    spyGarbageCollection.reset();
    stubReflow.reset();
    stubTabs.reset();

    ChTab.prototype.getLi.restore();

     stubGetLi = this.stub(ChTab.prototype, 'getLi' , function(){
        return $('<li aria-controls="' + panelID + '" class="'+ChOptions.classes.activeTab+'">');
    });
    Chocolate.tab.close($('<a>'));
    ok(stubReflow.calledOnce && stubTabs.calledWithExactly({active: null}), 'Если закрывается активная вкладка, открывается предыдушая вкладки и выполняется ее перерисовка');
    stubIsHasChange.reset();
    stubIsHasChange.returns(true);

    Chocolate.tab.close($('<a>'));

    ok(stubConfirm.calledOnce, 'При наличии изменений в форме, выводится confirm с сообщением');
    stubConfirm.reset();
    stubUndoChange.reset();
    stubIsHasChange.reset();
    ChTab.prototype.isCardTypePanel.restore();
    stubIsCardPanel = this.stub(ChTab.prototype, 'isCardTypePanel' , function(){
        return true;
    });
    Chocolate.tab.close($('<a>'));
    ok(stubUndoChange.calledOnce, 'Закрытая закладка с типом Карточка, должна отменять изменение в карточке');
    window.confirm.restore();
    chApp.getDraw().reflowActiveTab.restore();
    ChTab.prototype.isCardTypePanel.restore();
    ChTab.prototype.getPanel.restore();
    ChTab.prototype.getLi.restore();
    ChGridForm.prototype.isHasChange.restore();
    ChGridForm.prototype.getExitMessage.restore();
    ChCard.prototype._undoChange.restore();
    facade.getFactoryModule().makeChGridForm.restore();
    $.fn.tabs.restore();


});
test('Chocolate.tab.card._onBeforeLoad', function(){
    expect(7);
    var fakeEvent = document.createEvent("KeyboardEvent"),
        fakeUi = {
            panel: $('<div></div>'),
            tab: $('<div></div>')
        },
        $tabPanel = $('<div>');

    var spyGet = this.spy(jQuery, 'get');
    fakeUi.tab.data('loaded', 1);
    var result = Chocolate.tab.card._onBeforeLoad(fakeEvent, fakeUi, $tabPanel);
    ok(!result, 'Обработчик события всегда возвращает false');
    ok(!spyGet.called, 'Для уже загруженных данных не должен вызываться ajax - запрос');
    fakeUi.tab.data('loaded', 0);
    spyGet.reset();

    var tabID = 11, fakeUrl ='param.param.pam';
    var stubAttr = this.stub(jQuery, 'attr', function(){return tabID;}),
        stubGetKey = this.stub(ChCard.prototype, 'getKey', function(){return '11';}),
        stubGetFmCardCollection = this.stub(ChCard.prototype, 'getFmCardCollection', function(){return new FmCardsCollection();}),
        stubGetCardTemplate =  this.stub(FmCardsCollection.prototype, 'getCardTemplate', function(){return 'template';}),
        stubGetTabDataUrl = this.stub(ChCard.prototype, 'getTabDataUrl', function(){return fakeUrl;});

    var stubInitScripts = this.stub(Chocolate.tab.card, '_initScripts');
    var chCardStub =this.spy(window, "ChCard");
    Chocolate.tab.card._onBeforeLoad(fakeEvent, fakeUi, $tabPanel);
    ok(!spyGet.called && stubInitScripts.calledOnce, 'Если шаблон уже загружен с сервера, не создается лишний AJAX запрос, а просто инициализируется шаблон.');
    spyGet.reset();
    stubAttr.reset();
    stubGetKey.reset();
    stubGetFmCardCollection.reset();
    stubGetCardTemplate.reset();
    stubGetTabDataUrl.reset();
    chCardStub.reset();
    stubInitScripts.reset();

    var stubSetCardTemplate = this.stub(FmCardsCollection.prototype, 'setCardTemplate');
    FmCardsCollection.prototype.getCardTemplate.restore();

    stubGetCardTemplate =  this.stub(FmCardsCollection.prototype, 'getCardTemplate', function(){return null;});
    var rightTemplate = '<b>sdfsa</b>template 11';
    var fakeServer= this.sandbox.useFakeServer();
    fakeServer.respondWith(
        'GET',
        fakeUrl,
        [
            200,
            { 'Content-Type': 'text/html' },
            rightTemplate
        ]
    );
    Chocolate.tab.card._onBeforeLoad(fakeEvent, fakeUi, $tabPanel);
    fakeServer.respond();
    ok(stubSetCardTemplate.calledOnce, 'В случае успешного ajax - запроса, полученный шаблон от сервера запоминается для формы.');
    ok(stubInitScripts.calledOnce, 'В случае успешного ajax - запроса, полученный шаблон от сервера инициализируется и добавляется в DOM');
    spyGet.reset();
    stubAttr.reset();
    stubGetKey.reset();
    stubGetFmCardCollection.reset();
    stubGetCardTemplate.reset();
    stubGetTabDataUrl.reset();
    chCardStub.reset();
    stubInitScripts.reset();
    stubSetCardTemplate.reset();


    Chocolate.tab.card._initScripts.restore();
   var  stubData = this.stub($.fn, 'data'),
        stubFireOnce = this.stub(ChCardInitCallback, 'fireOnce'),
        stubReflowActiveTab = this.stub(chApp.draw, 'reflowActiveTab'),
        stubDrawCardPanel = this.stub(chApp.draw, 'drawCardPanel');
    var badTemplate = '<div id ="' + 'dsad' + '">fd<a>dd</a></div><script>'+ 'console.log($(this).attr(&#039;rel&#039;))'+'</script>';
    fakeServer.respondWith(
        'GET',
        fakeUrl,
        [
            200,
            { 'Content-Type': 'text/html' },
            badTemplate
        ]
    );

    var stubErrorLog = this.stub(log4javascript.getLogger(), 'error');
    Chocolate.tab.card._onBeforeLoad(fakeEvent, fakeUi, $tabPanel);
    fakeServer.respond();
    ok(!stubSetCardTemplate.called && fakeUi.panel.html() === '' && stubErrorLog.calledOnce, 'Если при вставке шаблона в DOM генерируется ошибка - данные не должны быть добавлены на страницу(DOM) и не сохраняются в шаблоне + логируется ошибка');
    stubErrorLog.reset();
    spyGet.reset();
    stubAttr.reset();
    stubData.reset();
    stubFireOnce.reset();
    stubReflowActiveTab.reset();
    stubDrawCardPanel.reset();
    stubGetKey.reset();
    stubGetFmCardCollection.reset();
    stubGetCardTemplate.reset();
    stubGetTabDataUrl.reset();
    chCardStub.reset();
    stubInitScripts.reset();
    stubSetCardTemplate.reset();

    fakeServer.respondWith(
        'GET',
        fakeUrl,
        [
           500,
            {},
            ''
        ]
    );

    Chocolate.tab.card._onBeforeLoad(fakeEvent, fakeUi, $tabPanel);
    fakeServer.respond();
    ok(stubErrorLog.calledOnce, 'Логируется ошибка на стороне сервера');
    stubErrorLog.reset();
    spyGet.reset();
    stubAttr.reset();
    stubGetKey.reset();
    stubGetFmCardCollection.reset();
    stubGetCardTemplate.reset();
    stubGetTabDataUrl.reset();
    chCardStub.reset();
    stubSetCardTemplate.reset();


//    Chocolate.log.error.restore();
    $.fn.data.restore();
    ChCardInitCallback.fireOnce.restore();
    chApp.getDraw().reflowActiveTab.restore();
    jQuery.attr.restore();
    ChCard.prototype.getKey.restore();
    ChCard.prototype.getFmCardCollection.restore();
    FmCardsCollection.prototype.getCardTemplate.restore();
    FmCardsCollection.prototype.setCardTemplate.restore();
    ChCard.prototype.getTabDataUrl.restore();

});
test('Chocolate.tab.add', function(){
    expect(4);
    var tabID = 'id673', tabName = 'First item';
    var jqueryTabsStub = this.stub($.fn, 'tabs');
    var $tabItem = Chocolate.tab.add(tabID, tabName);
    equal($tabItem.get(0).nodeName, 'LI', 'Возвращается добавленныый в DOM элемент');
    ok(jqueryTabsStub.calledTwice, 'tabs() вызывается два раза');
    ok(jqueryTabsStub.calledWithExactly('refresh'), 'Вызываетмя метод refresh просле добавления таба.');
    equal(Chocolate.$tabs.find('li').length, 1, 'Добавляется 1 вкладка в DOM');
    jqueryTabsStub.reset();
    $.fn.tabs.restore();

});
test('Chocolate.tab.createTabLink', function(){
    expect(2);
    var tabId ='Hhfd1', tabName = 'Закладка 1';
    var $link = $(Chocolate.tab.createTabLink(tabId, tabName));
    equal($link.eq(0).html(), tabName, 'Имя ссылки для закладки подставляется правильно.');
    equal($link.get(1).tagName, 'SPAN', 'Элемент для закрытия закладки генерируется.');
});
test('Chocolate.tab.addAndSetActive', function(){
    expect(3);
    var idActiveTabLink = 'lodas93', tabName = 'Просто закладка';
    Chocolate.tab.addAndSetActive('', tabName);
    var $tabItem = Chocolate.tab.addAndSetActive(idActiveTabLink, tabName);
    ok($('[href ="#'+idActiveTabLink+'"]').parent().hasClass(ChOptions.classes.activeTab), 'Последняя добавленная вкладка является активной');
    equal($(Chocolate.clsSel(ChOptions.classes.activeTab)).length, 1, 'Одновременно активной является только 1 вкладка');
    equal($tabItem.get(0).nodeName, 'LI', 'Возвращается добавленныый в DOM элемент');
});
test('Chocolate.tab.card._initScripts', function(){
    expect(4);
    var fakeUi = {
            panel: $('<div></div>'),
            tab: $('<div></div>')
        },
        fakeContent = 'Какой-то контент',
        $fakeContext = $('<div>');
    var stubHtml = this.stub($.fn, 'html'),
        stubData = this.stub($.fn, 'data'),
        stubFireOnce = this.stub(ChCardInitCallback, 'fireOnce'),
        stubDrawCardPanel = this.stub(chApp.draw, 'drawCardPanel');
    Chocolate.tab.card._initScripts(fakeUi, fakeContent, $fakeContext);
    ok(stubFireOnce.calledAfter(stubHtml), 'Сначала вставляются данные, потом инициализируются скрипты.');
    ok(stubDrawCardPanel.calledAfter(stubFireOnce), 'После инициализации скриптов рисуется карточка');
    ok(stubData.calledWithExactly('loaded', 1), 'Для предтовращения повторного ajax запроса, ставится метка об успешной загрузке');
    stubHtml.reset();
    stubData.reset();
    stubFireOnce.reset();
    $.fn.html.restore();


    var spyInitScripts = this.spy( Chocolate.tab.card, '_initScripts');
    var $fakeContent = $(fakeContent);
    Chocolate.tab.card._initScripts(fakeUi, $fakeContent, $fakeContext);
    ok(!spyInitScripts.threw(), 'Должна поддерживаться передача jQuery в качестве параметра content');
    spyInitScripts.reset();
    $.fn.data.restore();
    ChCardInitCallback.fireOnce.restore();
});
test('Chocolate.tab.card.init', function(){
    expect(3);
    var $tabPanel = $('<div>'),
        linkID = 'afmysfas1112d',
        $card = $('<div><ul><li><a href="1" id="'+linkID+'"></a></li></ul></div>');
    $tabPanel.append($card);
    var spyTabs = this.spy($.fn, 'tabs');
    Chocolate.$tabs.append($tabPanel);
    var beforeLoadStub = this.stub(Chocolate.tab.card, '_onBeforeLoad');
    Chocolate.tab.card.init($tabPanel);
    ok(spyTabs.calledOnce, 'Инициализация закладок в карточке вызывается один раз');
    var $paramsFirstCall = spyTabs.args[0];
    ok($paramsFirstCall[0].hasOwnProperty('beforeLoad'), 'Параметр beforeLoad инициализируется');
    $(Chocolate.idSel(linkID)).trigger('click');
    ok(beforeLoadStub.calledOnce, 'При клике на закладку инициализируется содержимое закладки');
    Chocolate.tab.card._onBeforeLoad.restore();
    spyTabs.reset();
    beforeLoadStub.reset();

});
