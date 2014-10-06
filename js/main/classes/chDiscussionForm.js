function ChDiscussionForm($form) {
    this.$form = $form;
    this.readSql = null;
    this.isMyMessage = 'ismymessage';
    this.insDate = 'insdate';
    this.username = 'username';
    this.textmessage = 'textmessage';
}
ChDiscussionForm.prototype.init = function (readSql) {
    this.readSql = readSql;

};
ChDiscussionForm.prototype.refresh = function () {
    var url = chApp.getOptions().urls.execute + '?sql=' + this.readSql;
    var _this = this;
    $.get(url).done(function (res) {
        var resObj = new ChResponse(res);
        _this.render(resObj.getData());
        resObj.destroy();
    })
        .fail(function (er) {
            console.log(er)
        })
};
ChDiscussionForm.prototype.render = function (data) {
    var html = [];
    for (var i in data) {
        if (data.hasOwnProperty(i)) {
            var isMyMsg = parseInt(data[i][this.isMyMessage], 10);
            html.push(this.renderMessage(data[i], isMyMsg));
        }
    }
    this.$form.find('.discussion-content').html(html.join(''));
};
ChDiscussionForm.prototype.renderMessage = function (data, isMyMsg) {
    var msgClass = 'bubble-left';
    var user = '<li class="bubble-name">' + data[this.username] + '</li>';
    if (isMyMsg) {
        msgClass = 'bubble-right';
        user = '';
    }
    var template = '<div class="' + msgClass + '"><ul>{*User*}<li class="bubble-date">{*Date*}</li><li class="bubble-msg">{*Message*}</li></ul></div>';
    var date = new Date(data[this.insDate]);
    return template
        .replace('{*Date*}', date.format(chApp.getOptions().settings.signatureFormat))
        .replace('{*User*}', user)
        .replace('{*Message*}', data[this.textmessage]);
};
ChDiscussionForm.prototype.sendMessage = function (msg) {
    var card = chApp.getFactory().getChCard(this.$form.closest('[data-id=grid-tabs]'));
    var _this = this;
    var url = chApp.getOptions().urls.formSave + '?view=' + encodeURI('discussions.xml') + '&parentView=' + card.getView() + '&parentID=' +card.getKey()
    $.post(url, {
        jsonChangedData: JSON.stringify({
            a: {

                id: 'a',
                textmessage: msg
            }
        })
    }).done(function () {
        _this.refresh()
        _this.$form.next('.discussion-footer').children('.discussion-input').val('');
    }).fail(function(e){
        alert('возникла ошибка при отправке сообщения')
    })
}