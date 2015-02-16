var AppView = (function (location, window, Backbone, $, optionsModule, mediator, helpersModule, deferredModule) {
    'use strict';
    return Backbone.View.extend(
        /** @lends AppView */
        {
            events: {
                'click .menu-root': '_openFormFromMenu',
                'click .filter-button': '_toggleTreeFiltersElements',
                'click .widget-elem-close': '_deselectTreeElementHandler',
                'keydown': '_unbindDefaultBrowserEventsAndBindFastClose',
                'click .fm-phone': '_makeCallHandler',
                'click .section-filters div > label': '_disableFilter',
                'click .filter-mock-no-edit': '_enableFilter',
                'keydown textarea': '_addSignToText',
                'click #tabs>ul>li': '_addToTabHistoryLog',
                'mouseup .ui-tabs-anchor[href=1]': '_reflowTab',
                'click .ui-tabs-anchor[href^=#]': '_reflowTab',
                'click .message-close': '_closeApplicationMessage'
            },
            /**
             * @class AppView
             * @augments Backbone.View
             * @param {Object} options
             * @constructs
             */
            initialize: function (options) {
                _.bindAll(this);
                this.$el = $('body');
                this.model = options.model;
                this._settings = null;
            },
            /**
             * @desc Render application
             */
            render: function () {
                /**
                 *
                 * @type {AppModel}
                 */
                var model = this.model;
                mediator.publish(
                    optionsModule.getChannel('setIdentity'),
                    model.get('userId'),
                    model.get('employeeId'),
                    model.get('userName')
                );
                this._renderStartPage();
                var $downloadAttachmentTmpl = $('<script>', {
                        type: 'text/x-tmpl',
                        id: 'template-download',
                        text: [
                            '{% for (var i=0, file; file=o.files[i]; i++) { %}',
                            '<tr class="template-download fade in" data-id="{%=file.id%}">',
                            '<td class="attachment-grid-menu">',
                            '<span class="card-button" data-id = "card-button" title="Открыть карточку"></span>',
                            '</td>',
                            '<td>',
                            '<div class="table-td">',
                            '<a class="attachment-file" data-id="{%=file.filesid%}" title="{%=file.name%}" download="{%=file.name%}">{%=file.name%}</a>',
                            '</div>',
                            '</td>',
                            '<td>',
                            '<div class="table-td">',
                            '<span class="attachment-td">{%=file.version%}</span>',
                            '</div>',
                            '</td>',
                            '<td>',
                            '<div class="table-td">',
                            '<span class="attachment-td">{%=file.insusername%}</span>',
                            '</div>',
                            '</td>',
                            '<td>',
                            '<div class="table-td">',
                            '<span class="attachment-td">{%=file.insdate%}</span>',
                            '</div>',
                            '</td>',
                            '</tr>',
                            '{% } %}'
                        ].join('')
                    }),
                    $uploadAttachmentTmpl = $('<script>', {
                        type: 'text/x-tmpl',
                        id: 'template-upload',
                        text: [
                            '{% for (var i=0, file; file=o.files[i]; i++) { %}',
                            '<tr class="template-upload fade" >',
                            '<td class="attachment-grid-menu">',
                            '<span class="card-button" data-id = "card-button" title="Открыть карточку"></span>',
                            '</td>',
                            '<td>',
                            '<div class="table-td attachment-new-file">',
                            '<span>{%=file.name%}</span>',
                            '</div>',
                            '</td>',
                            '<td>',
                            '<div class="table-td start">',
                            '<span>1</span>',
                            '<button style="display:none"> </button>',
                            '</div>',
                            '</td>',
                            '<td>',
                            '<div class="table-td">',
                            '</div>',
                            '</td>',
                            '<td>',
                            '<div class="table-td">',
                            '</div>',
                            '</td>',
                            '</tr>',
                            '{% } %}'
                        ].join('')
                    });
                this.$el
                    .append($downloadAttachmentTmpl)
                    .append($uploadAttachmentTmpl);
                this._createGlobalEvents();
            },
            /**
             * @desc make reflow tab
             * @private
             */
            _reflowTab: function () {
                mediator.publish(facade.getOptionsModule().getChannel('reflowTab'));
            },
            /**
             * @desc Logging order for opening tabs
             * @param {Event} e
             * @private
             */
            _addToTabHistoryLog: function (e) {
                facade.getTabsModule().push($(e.target).closest('li'));
            },
            /**
             *
             * @param {Event} e
             * @returns {boolean}
             * @private
             */
            _addSignToText: function (e) {
                if (e.keyCode === optionsModule.getKeyCode('f4')) {
                    var userModule = facade.getUserModule();
                    $(e.target).insertAtCaret(userModule.getSign());
                    return false;
                }
                return true;
            },
            /**
             *
             * @param {Event} e
             * @returns {boolean}
             * @private
             */
            _enableFilter: function (e) {
                var $this = $(e.target),
                    $controls = $this.parent().find('select, input');
                $controls.prop('disabled', false);
                $controls
                    .filter('input')
                    .eq(0)
                    .focus();
                $this.remove();

                return false;
            },
            /**
             *
             * @param {Event} e
             * @private
             */
            _disableFilter: function (e) {
                var $this = $(e.target);
                $this.siblings('select, input').prop('disabled', true);
                $this
                    .closest('.filter-item')
                    .prepend('<div class="filter-mock-no-edit"></div>');
            },
            /**
             *
             * @param {Event} e
             * @private
             */
            _makeCallHandler: function (e) {
                var phoneTo = $(e.target).attr('data-phone');
                facade.getPhoneModule().makeCall(phoneTo);
            },
            /**
             *
             * @param {Event} e
             * @private
             */
            _unbindDefaultBrowserEventsAndBindFastClose: function (e) {
                var isNotTextEditMode = (['INPUT', 'TEXTAREA'].indexOf(e.target.tagName) === -1);
                if (isNotTextEditMode) {
                    if (e.keyCode === optionsModule.getKeyCode('backspace')) {
                        e.preventDefault();
                    }
                    if (e.keyCode === optionsModule.getKeyCode('escape') && e.target.tagName === 'BODY') {
                        var $target = $(e.target);
                        if (!this._isFancyBoxOpen($target)) {

                            var $closedLink = $('#tabs').children('ul').children('.ui-state-active').find('.tab-closed');
                            $closedLink.trigger('click', {
                                isFastClose: true
                            });
                        }
                    }
                }
            },
            /**
             *
             * @param {jQuery} $target
             * @returns {boolean}
             * @private
             */
            _isFancyBoxOpen: function ($target) {
                return $target.children('.fancybox-overlay').length > 0;
            },
            /**
             *
             * @param {Event} e
             * @private
             */
            _deselectTreeElementHandler: function (e) {
                var $panelElem = $(e.target).closest('.widget-panel-elm'),
                    key = $panelElem.attr('data-key'),
                    tree = $panelElem
                        .closest('.widget-panel')
                        .prev('.widget-tree-compact')
                        .dynatree('getTree');
                tree.selectKey(key, false);
                $panelElem.remove();
            },
            /**
             *
             * @param {Event} e
             * @private
             */
            _toggleTreeFiltersElements: function (e) {
                var $this = $(e.target).closest('button'),
                    $tree = $this.closest('div').siblings('.widget-tree'),
                    nodes = $tree.find('li');
                $this.toggleClass('menu-button-selected');
                var selectedNodes = nodes.filter(function () {
                    return $(this).has('.dynatree-selected').length === 0;
                });
                if ($this.hasClass('menu-button-selected')) {
                    selectedNodes.hide();
                } else {
                    selectedNodes.show();
                }
            },
            /**
             * @desc Open form
             * @param {String} form
             * @returns {boolean}
             * @private
             */
            _openForm: function (form) {
                mediator.publish(optionsModule.getChannel('xmlRequest'), {
                    name: form,
                    type: optionsModule.getRequestType('mainForm')
                });
                return false;
            },
            /**
             * @desc Open form in side menu
             * @param {Event} e
             * @returns {boolean}
             * @private
             */
            _openFormFromMenu: function (e) {
                var $this = $(e.target),
                    $subMenu = $this.siblings('.gn-submenu');
                if ($subMenu.length) {
                    $subMenu.toggle();
                } else {
                    mediator.publish(optionsModule.getChannel('xmlRequest'), {
                        name: $this.attr('href'),
                        type: optionsModule.getRequestType('mainForm')
                    });
                    $this
                        .closest('.gn-menu-wrapper')
                        .removeClass('gn-open-all')
                        .prev('.gn-icon-menu')
                        .removeClass('gn-selected');
                }
                return false;
            },
            /**
             * @desc add global application messages
             * @private
             */
            _createGlobalEvents: function () {
                $(window)
                    .on('beforeunload', this._warningMessageHandler)
                    .on('resize', $.debounce(300, false, this._reflowOpenedTab));

            },
            /**
             * @desc Reflow current tab
             * @private
             */
            _reflowOpenedTab: function () {
                facade.getRepaintModule().clearCache();
                mediator.publish(optionsModule.getChannel('reflowTab'));
            },
            /**
             * @desc Prevent closed window, when app has unsaved data, and display warning
             * @returns {*}
             * @private
             */
            _warningMessageHandler: function () {
                if (helpersModule.appHasChange()) {
                    return optionsModule.getMessage('chocolateHasChange');
                }
            },
            /**
             * @desc Render star page of application
             * @private
             */
            _renderStartPage: function () {
                var path = location.pathname.toLowerCase();
                if (path === optionsModule.getUrl('openFromEmail')) {
                    this._startFormFromQueryParams();
                } else {
                    this._startDefaultForm();
                }
                this._renderProfile();
            },
            /**
             *
             * @private
             */
            _startFormFromQueryParams: function () {
                var rawParams = location.search.split('&'),
                    params = {};
                rawParams.forEach(function (par) {
                    var tokens = par.split('='),
                        name = tokens[0],
                        value = tokens[1];
                    if (name.indexOf('?') === 0) {
                        name = name.substr(1);
                    }
                    params[name] = value;
                });
                var view = params.view,
                    idList = params.id;
                setTimeout(function () {
                    var defer = deferredModule.create(),
                        deferId = deferredModule.save(defer);
                    mediator.publish(optionsModule.getChannel('xmlRequest'), {
                        name: view,
                        type: optionsModule.getRequestType('deferred'),
                        id: deferId
                    });
                    defer.done(function (res) {
                        var $xml = res.data,
                            model = new FormModel({
                                $xml: $xml,
                                write: true
                            }),
                            view = new FormView({
                                model: model
                            }),
                            filterModel = model.getFiltersROCollection(view).findWhere({key: 'idlist'});
                        if (filterModel) {
                            filterModel.set('value', idList);
                        }

                        view.render();
                    })
                }, 300);
            },
            /**
             *
             * @private
             */
            _startDefaultForm: function () {
                var form = this.model.getAutoStartForm();
                if (form) {
                    setTimeout(function () {
                        mediator.publish(optionsModule.getChannel('xmlRequest'), {
                            name: form,
                            type: optionsModule.getRequestType('mainForm')
                        });
                    }, 300);
                }
            },
            /**
             *
             * @private
             */
            _renderProfile: function () {
                var $profile = $('<div></div>', {
                    html: this.model.get('userName') + '<span class="fa-caret-down"></span>',
                    'class': 'ch-app-profile'
                });
                var _this = this;
                $profile.on('click', function () {
                    $profile.contextmenu('open', $profile)
                });
                $profile.contextmenu({
                    show: {effect: 'blind', duration: 0},
                    menu: [
                        {
                            title: 'Профиль',
                            cmd: 'profile'
                        },
                        {
                            title: 'Настройки',
                            cmd: 'settings'
                        },
                        {
                            title: 'Выйти',
                            cmd: 'exit'
                        }

                    ],
                    select: function (e, ui) {
                        switch (ui.cmd) {
                            case 'profile':
                                _this._openForm(optionsModule.getConstants('userSettingsXml'));
                                break;
                            case 'settings':
                                _this._openApplicationSettings();
                                break;
                            case 'exit':
                                window.location = '/site/logout';
                                break;
                            default :
                                break;
                        }
                    }

                });
                this.$el.append($profile);
            },
            /**
             * @desc open application settings
             * @private
             */
            _openApplicationSettings: function () {
                if (this._settings) {
                    this._settings.dialog('open');
                } else {
                    var model = this.model,
                        currentForm = model.getAutoStartForm(),
                        $dialog = $('<div></div>'),
                        $autoStartSettings = $('<div></div>', {
                            'class': 'setting-item',
                            html: '<span class="setting-caption">Укажите стартовую форму при запуcке приложения:</span>'
                        });
                    var selectOptions = [
                            '<option value="',
                            '',
                            '"></option><option value="',
                            optionsModule.getConstants('tasksForTopsXml'),
                            '">Поручения топ менеджеров</option><option value="',
                            optionsModule.getConstants('tasksXml'),
                            '">Поручения</option>'
                        ].join(''),
                        $select = $('<select></select>', {
                            html: selectOptions
                        });
                    $select.val(currentForm);
                    $autoStartSettings.append($select);
                    $dialog.append($autoStartSettings);
                    $dialog.dialog({
                        title: optionsModule.getMessage('projectName'),
                        dialogClass: 'wizard-dialog',
                        resizable: false,
                        modal: true,
                        buttons: {
                            'Сохранить': function () {
                                model.setAutoStartForm($select.val());
                                $(this).dialog('close');
                            },
                            'Отменить': function () {
                                $(this).dialog('close');
                            }
                        },
                        create: function () {
                            $(this)
                                .siblings('div')
                                .find('button')
                                .first()
                                .addClass('wizard-next-button')
                                .nextAll()
                                .addClass('wizard-cancel-button');
                        }
                    });
                    this._settings = $dialog;
                }
            },
            /**
             *
             * @param {Event} e
             * @private
             */
            _closeApplicationMessage: function (e) {
                $(e.target)
                    .closest('.notice')
                    .animate({
                        border: 'none',
                        height: 0,
                        marginBottom: 0,
                        marginTop: '-6px',
                        opacity: 0,
                        paddingBottom: 0,
                        paddingTop: 0,
                        queue: false
                    }, 1000, function () {
                        $(this).remove();
                    });
            }
        })
})
(location, window, Backbone, jQuery, optionsModule, mediator, helpersModule, deferredModule);