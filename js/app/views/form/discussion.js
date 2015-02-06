var DiscussionView = (function ($, _, moment, optionsModule, helpersModule) {
    'use strict';
    return AbstractView.extend({
        myMessage: 'ismymessage',
        insDate: 'insdate',
        userName: 'username',
        textMessage: 'textmessage',
        template: _.template(
            [
                '<form id="<%= formID%>" class="discussion-form" data-parent-view="<%= parentView %>" data-parent-id="<%= parentID %>">',
                '<section data-id="grid-section"><section class="discussion-content">',
                '</section></section>',
                '</form>',
                '<section class="discussion-footer">',
                '<textarea class="discussion-input"></textarea>',
                '<button class="discussion-submit">Отправить</button>',
                '</section>'
            ].join('')
        ),
        events: {
            'click .discussion-submit': 'sendMessageHandler'
        },
        sendMessageHandler: function (e) {
            var $this = $(e.target),
                msg = $this.prev('.discussion-input').val();
            this.sendMessage(msg);
        },
        sendMessage: function (msg) {
            var data = {};
            data[this.insDate] = moment();
            data[this.textMessage] = msg.replace(/\n/g, '<br/>');
            data[this.myMessage] = 1;
            data[this.userName] = '';

            var html = this.renderMessage(data);
            this.getJqueryForm().find('.discussion-content').append(html);
            var id = helpersModule.uniqueID();
            var dateToSave = {
                id: {
                    id: id,
                    textmessage: msg
                }
            };
            this.model.trigger('save:form', dateToSave);
        },
        scrollToBottom: function () {
            var $form = this.getJqueryForm();
            $form.scrollTop($form.height());
            return this;
        },
        focusToInput: function () {
            this.getJqueryForm()
                .next('.discussion-footer')
                .children('.discussion-input').focus();
            return this;
        },
        save: function (data) {
            var _this = this;
            $('#' + this.getFormID())
                .next('.discussion-footer').children('.discussion-input').val('');
             this.model
                .deferSave(data)
                .done(function () {
                    _this.scrollToBottom();
                });
        },
        refresh: function () {
            var _this = this;
            this.model.runAsyncTaskBindingReadProc()
                .done(function (data) {
                    var defer = _this.model.runAsyncTaskGetData(data.sql);
                    defer.done(function (res) {
                        _this.layout(res.data, res.order);

                    });
                });
        },
        render: function () {
            var parentModel = this.model.get('parentModel');
            this.$el.html(this.template({
                formID: this.getFormID(),
                parentView: parentModel.getView(),
                parentID: this.model.get('parentId')
            }));
            this.refresh();
        },
        layout: function (data, order) {
            var html = [],
                _this = this;
            order.forEach(function (key) {
                html.push(_this.renderMessage(data[key]));
            });
            this.getJqueryForm().find('.discussion-content').html(html.join(''));
            mediator.publish(optionsModule.getChannel('reflowTab'));
            this
                .scrollToBottom()
                .focusToInput();
        },
        isMyMessage: function (msgData) {
            return parseInt(msgData[this.myMessage], 10) ? true : false;
        },
        messageTemplate: _.template(
            [
                '<div class="<%= class %>"><ul><%= user %>',
                '<li class="bubble-date"><%= date %></li>',
                '<li class="bubble-msg"><%= message %></li></ul></div>'
            ].join('')
        ),
        renderMessage: function (data) {
            var msgClass = 'bubble-left',
                user = '<li class="bubble-name">' + data[this.userName] + '</li>';
            if (this.isMyMessage(data)) {
                msgClass = 'bubble-right';
                user = '<li class="bubble-name">Я</li>';
            }
            return this.messageTemplate({
                'class': msgClass,
                user: user,
                date: moment(data[this.insDate], "MM.DD.YYYY HH:mm:ss")
                    .format(optionsModule.getSetting('signatureFormat')),
                message: data[this.textMessage]
            });
        }
    });
})
(jQuery, _, moment, optionsModule, helpersModule);
