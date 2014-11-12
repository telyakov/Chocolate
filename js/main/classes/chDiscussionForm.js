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
        _this.$form.scrollTop(_this.$form.height());

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
    mediator.publish(optionsModule.getChannel('reflowTab'));
    this.$form.next('.discussion-footer').children('.discussion-input').focus()
};
ChDiscussionForm.prototype.renderMessage = function (data, isMyMsg) {
    var msgClass = 'bubble-left';
    var user = '<li class="bubble-name">' + data[this.username] + '</li>';
    if (isMyMsg) {
        msgClass = 'bubble-right';
        user =  '<li class="bubble-name">Я</li>';
    }
    var template = '<div class="' + msgClass + '"><ul>{*User*}<li class="bubble-date">{*Date*}</li><li class="bubble-msg">{*Message*}</li></ul></div>';
    return template
        .replace('{*Date*}', moment(data[this.insDate], "MM.DD.YYYY HH:mm:ss").format(chApp.getOptions().settings.signatureFormat))
        .replace('{*User*}', user)
        .replace('{*Message*}', data[this.textmessage]);
};
ChDiscussionForm.prototype.getParentView = function(){
    return this.$form.attr('data-parent-view');
};
ChDiscussionForm.prototype.getParentID = function(){
    return this.$form.attr('data-parent-id');
};
ChDiscussionForm.prototype.sendMessage = function (msg) {
    var _this = this;
    var url = chApp.getOptions().urls.formSave + '?view=' + encodeURI('discussions.xml') + '&parentView=' + this.getParentView() + '&parentID=' +this.getParentID();
    var data ={};
    data[this.insDate] = moment();
    data[this.textmessage] = msg;
    data[this.username] = '';
    var htmlMsg = _this.renderMessage(data, true);
    this.$form.find('.discussion-content').append(htmlMsg);
    $.post(url, {
        jsonChangedData: JSON.stringify({
            a: {

                id: 'a',
                textmessage: msg
            }
        })
    }).done(function () {
        _this.refresh();
        _this.$form.next('.discussion-footer').children('.discussion-input').val('');
    }).fail(function(e){
        alert('возникла ошибка при отправке сообщения')
    })
}