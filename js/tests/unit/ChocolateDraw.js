module('ChocolateDraw',{
    setup: function(){
    },
    teardown: function(){
    }
});
test('ChocolateDraw.drawCardGrid', function(){
    expect(2);
    var sectionID = 'test-section';
    var $section = $('<section>').attr('id', sectionID);
    var height = 500;
    var $fakeCardGrid = $('<div><div class="card-grid"></div></div>');
    $fakeCardGrid.find('.card-grid').height(height).append($section);
    var _drawGridFormStub =this.stub(chApp.draw, "_layoutForm");
    chApp.getDraw().drawCardGrid($fakeCardGrid);
    equal($section.height(), height, 'section присваивает высота родительского элемента .card-grid');
    ok(_drawGridFormStub.calledOnce, 'Вызывает метод для прорисовки section');
    chApp.draw._layoutForm.restore();
    _drawGridFormStub.reset();
});
test('ChocolateDraw._isDiscussionForm', function(){
        expect(2);
    var discussionClass = chApp.getOptions().classes.discussionForm;
    var $discussionForm = $('<form>').addClass(discussionClass),
        $simpleForm = $('<form>');
    ok(chApp.getDraw()._isDiscussionForm($discussionForm)===true, 'Форма, содержащая discussion class определяется как форма дискуссии');
    ok(chApp.getDraw()._isDiscussionForm($simpleForm)===false, 'Форма, НЕ содержащая discussion class определяется как обычная форма');
});