var DiscussionView = (function ($, _, moment, optionsModule, helpersModule) {
    'use strict';
    return AbstractView.extend(
        /** @lends DiscussionView */
        {
            myMessage: 'ismymessage',
            insDate: 'insdate',
            userName: 'username',
            textMessage: 'textmessage',
            messageTemplate: _.template(
                [
                    '<div class="<%= class %>"><ul><%= user %>',
                    '<li class="bubble-date"><%= date %></li>',
                    '<li class="bubble-msg"><%= message %></li></ul></div>'
                ].join('')
            ),
            template: _.template(
                [
                    '<form id="<%= formID%>" class="discussion-form">',
                    '<section data-id="grid-section"><section class="discussion-content">',
                    '</section></section></form>',
                    '<section class="discussion-footer">',
                    '<textarea class="discussion-input"></textarea>',
                    '<button class="discussion-submit">Отправить</button>',
                    '</section>'
                ].join('')
            ),
            events: {
                'click .discussion-submit': '_sendMessageHandler'
            },
            /**
             * @param {Object} data
             * @override
             */
            save: function (data) {
                $('#' + this.getFormID())
                    .next('.discussion-footer')
                    .children('.discussion-input').val('');
                this.getModel()
                    .runAsyncTaskSave(data)
                    .done(this._scrollToBottom)
                    .fail(this._showError);
            },
            /**
             * @override
             */
            refresh: function () {
                var _this = this,
                    model = this.getModel();
                model.runAsyncTaskBindingReadProc()
                    .done(
                    /** @param {SqlBindingResponse} data */
                        function (data) {
                        model
                            .runAsyncTaskGetData(data.sql)
                            .done(
                            /** @param {RecordsetDTO} res */
                                function (res) {
                                _this._layout(res.data, res.order);
                            })
                            .fail(_this._showError);
                    })
                    .fail(_this._showError);
            },
            /**
             * @desc Render Form
             */
            render: function () {
                this.$el.html(this.template({
                    formID: this.getFormID()
                }));
                this.refresh();

            },
            /**
             * @param {String} error
             * @override
             *
             */
            _showError: function (error) {
                var html = this._createErrorMessageHtml(error);
                this
                    ._appendMessage(html)
                    ._scrollToBottom();
            },
            /**
             * @param {Object} data
             * @param {Array} order
             * @private
             */
            _layout: function (data, order) {
                var html = [],
                    _this = this;
                order.forEach(function (key) {
                    html.push(_this._createMessageHtml(data[key]));
                });
                this.getJqueryForm().find('.discussion-content').html(html.join(''));
                mediator.publish(optionsModule.getChannel('reflowTab'));
                this
                    ._scrollToBottom()
                    ._focusToInput();
            },
            /**
             * @desc Create html for error
             * @param {String} error
             * @returns {String}
             * @private
             */
            _createErrorMessageHtml: function(error){
                var msgClass = 'bubble-left bubble-error',
                    user = '<li class="bubble-name">' + optionsModule.getMessage('projectName') + '</li>';
                return this.messageTemplate({
                    'class': msgClass,
                    user: user,
                    date: moment()
                        .format(optionsModule.getSetting('signatureFormat')),
                    message: error
                });
            },
            /**
             * @desc Create html for user message
             * @param {Object} data
             * @returns {String}
             * @private
             */
            _createMessageHtml: function (data) {
                var msgClass = 'bubble-left',
                    user = '<li class="bubble-name">' + data[this.userName] + '</li>';
                if (this._isMyMessage(data)) {
                    msgClass = 'bubble-right';
                    user = '<li class="bubble-name">Я</li>';
                }
                return this.messageTemplate({
                    'class': msgClass,
                    user: user,
                    date: moment(data[this.insDate], optionsModule.getSetting('userDateFormat'))
                        .format(optionsModule.getSetting('signatureFormat')),
                    message: data[this.textMessage]
                });
            },
            /**
             * @desc Return true, if message of current user
             * @param {Object} msgData
             * @returns {boolean}
             * @private
             */
            _isMyMessage: function (msgData) {
                return parseInt(msgData[this.myMessage], 10) ? true : false;
            },
            /**
             * @param {Event} e
             * @private
             */
            _sendMessageHandler: function (e) {
                var $this = $(e.target),
                    msg = $this.prev('.discussion-input').val();
                this._sendMessage(msg);
            },
            /**
             * @desc Append Message to form
             * @param {String} html
             * @returns {*}
             * @private
             */
            _appendMessage: function (html) {
                this.getJqueryForm()
                    .find('.discussion-content')
                    .append(html);
                return this;
            },
            /**
             * @desc Send user Message and Save it
             * @param {String} msg
             * @private
             */
            _sendMessage: function (msg) {
                var data = {};
                data[this.insDate] = moment();
                data[this.textMessage] = helpersModule.newLineToBr(msg);
                data[this.myMessage] = 1;
                data[this.userName] = '';

                var html = this._createMessageHtml(data);
                this._appendMessage(html);
                var dateToSave = {
                    id: {
                        id: helpersModule.uniqueID(),
                        textmessage: msg
                    }
                };
                this.save(dateToSave);
            },
            /**
             * @desc Scroll form view to bottom
             * @returns {*}
             * @private
             */
            _scrollToBottom: function () {
                var $form = this.getJqueryForm();
                $form.scrollTop($form.height());
                return this;
            },
            /**
             * @desc Set focus to text input
             * @returns {*}
             * @private
             */
            _focusToInput: function () {
                this.getJqueryForm()
                    .next('.discussion-footer')
                    .children('.discussion-input').focus();
                return this;
            }
        });
})
(jQuery, _, moment, optionsModule, helpersModule);
