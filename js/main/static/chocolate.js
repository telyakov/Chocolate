var Chocolate = {
    ATTACHMENTS_VIEW: 'attachments.xml',
    ID_REG_EXP: /00pk00/g,
    locale: 'ru',
    storage: new ObjectStorage(),
    log: log4javascript.getLogger(),
    $window: null,
    $tabs: null,
    $header: null,
    $footer: null,
    $page: null,
    $content: null,
    socket: null,
    _idCounter: 1,
    _initStorage: function () {
        this.storage.session = {};
        if (typeof this.storage.local.settings == 'undefined') {
            this.storage.local.settings = {};
        }
        if (typeof this.storage.local.grid_settings == 'undefined') {
            this.storage.local.grid_settings = {};
        }
    },
    _initLog: function () {
        this.log.removeAllAppenders();
        this.log.addAppender(new log4javascript.BrowserConsoleAppender());
    },
    stripHtml: function strip(html) {
        var tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText;
    },
    _initSocket: function(){
        var context = this;
        this.socket = io.connect(chApp.getOptions().urls.webSocketServer, {reconnectionDelay: 3000});
        function connectError() {
            var $error = $('<div>', {
                id: 'no-internet',
                text: chApp.getMessages().noConnectWebsocket
            });
            chApp.getMain().$page.append($error);
            this.off('connect_error');
            context.socket
                .off('connect')
                .on('connect', connectSuccess);
        }
        function connectSuccess() {
            $('#no-internet').remove();
            this.off('connect');
            this.io
                .off('connect_error')
                .on('connect_error', connectError);
        }
        context.socket.io.on('connect_error', connectError);
        context.socket
            .on('connect', connectSuccess)
            .on('response', function (data) {
                var optionsModule = chApp.getOptions(),
                    mainModule = chApp.getMain();
                var type = data.type, error = data.error, resData;

                if (error) {
                    resData = {};
                } else {
                    resData = json_parse(data.data);
                }


                switch (type) {
                    case optionsModule.sql.types.roles:
                        mainModule.user.setRoles(resData);
                        break;
                    case optionsModule.sql.types.forms:
                        chApp.getFunctions().createMenu(resData);
                        break;
                    case optionsModule.sql.types.jquery:
                        var firstRow;
                        for (var i in resData) {
                            if (resData.hasOwnProperty(i)) {
                                firstRow = resData[i];
                                break;
                            }
                        }
                        var $elem = $('#' + data.id);
                        for (var j in firstRow) {
                            if (firstRow.hasOwnProperty(j)) {
                                $elem.html(firstRow[j]);
                                break;
                            }
                        }
                        break;
                    default:
                        console.log(data);
                }
            });
    },
    init: function () {
        this._initSocket();
        this.$window = $(window);
        this.$tabs = $('#tabs');
        this.$header = $('#header');
        this.$footer = $('#footer');
        this.$content = $('#content');
        this.$page = $('#pagewrap');
        this._initStorage();
        this._initLog();
    },
    /**
     * @param className {string}
     * @returns {string}
     */
    clsSel: function (className) {
        return ['.', className ].join('');
    },
    /**
     * @param id {string}
     * @returns {string}
     */
    idSel: function (id) {
        return ['#', id].join('');
    },
    createRequest: function (data) {
        data.key = chApp.getOptions().settings.key;
        chApp.getSocket().emit('request', data);
    },
    /**
     * @returns {ChTab}
     */
    getActiveChTab: function () {
        var $activeLink = Chocolate.$tabs
            .children(Chocolate.clsSel(ChOptions.classes.tabMenuClass))
            .children(Chocolate.clsSel(ChOptions.classes.activeTab))
            .children('a');
        return ChObjectStorage.getChTab($activeLink);
    },
    leaveFocus: function () {
        Chocolate.$content.trigger('click');
    },
    /**
     * @param number {string|integer}
     * @returns {string}
     */
    formatNumber: function (number) {
        if (number === null) {
            return null;
        }
        var result;
        if (typeof number == 'number') {
            result = number.toString();
        } else {
            result = number;
        }
        return result.replace(/(\d{1,3}(?=(\d{3})+(?:\.\d|\b)))/g, "\$1 ");
    },
    /**
     * @param str {string}
     * @returns {string}
     */
    eng2rus: function (str) {
        var dictionary = {
            "q": "й", "w": "ц", "e": "у", "r": "к", "t": "е", "y": "н", "u": "г",
            "i": "ш", "o": "щ", "p": "з", "[": "х", "]": "ъ", "a": "ф", "s": "ы",
            "d": "в", "f": "а", "g": "п", "h": "р", "j": "о", "k": "л", "l": "д",
            ";": "ж", "'": "э", "z": "я", "x": "ч", "c": "с", "v": "м", "b": "и",
            "n": "т", "m": "ь", ",": "б", ".": "ю", "/": "."
        };
        for (var i = 0; i < str.length; i++) {
            var lowerToken = str[i].toLowerCase();
            if (dictionary[lowerToken] != undefined) {
                var replace;
                if (str[i] == lowerToken) {
                    replace = dictionary[lowerToken];
                } else if (str[i] == str[i].toUpperCase()) {
                    replace = dictionary[lowerToken].toUpperCase();
                }

                str = str.replace(str[i], replace);
            }
        }
        return str;
    },
    /**
     * @returns {string}
     */
    uniqueID: function () {
        this._idCounter++;
        return ['ch', this._idCounter].join('');
    },
    /**
     * @param source {Object}
     * @param addition {Object}
     * @returns {Object}
     */
    mergeObj: function (source, addition) {
        return $.extend(false, source, addition);
    },
    /**
     * @param key {string|Object}
     * @param val {string|Object}
     * @returns {string|Object}
     */
    parse: function (key, val) {
        if (typeof val == 'string') {
            return decodeURIComponent(val);
        }
        return val;
    },
    /**
     * @param url {String}
     * @returns {boolean}
     * @private
     */
    _isValidFormUrl: function (url) {
        if (url == '#') {
            return false;
        }
        return (/\?view=(.+)\.xml/g).test(url)

    },
    /**
     * @returns {boolean}
     */
    hasChange: function () {
        var session = Chocolate.storage.session, chForm;
        for (var formID in session) {
            if (formID != 'user' && session.hasOwnProperty(formID)) {
                chForm = ChObjectStorage.getChGridForm($(Chocolate.idSel(formID)));
                if (chForm.isHasChange()) {
                    return true;
                }
            }
        }
        return false;
    },
    /**
     * @param url {string}
     */
    openForm: function (url) {
        if (this._isValidFormUrl(url)) {
            $.post(url)
                .done(function (res, status, jqXHR) {
                    var $form = $(res);
                    try {
                        Chocolate.$tabs.append($form);
                    } catch (e) {
                        $form.remove();
                        Chocolate.log.error(
                            'Ошибка при вставке js + html формы в дерево',
                            e
                        );
                    } finally {
                        delete jqXHR.responseText;
                    }
                })
                .fail(function (e) {
                    Chocolate.log.error(
                        'Ошибка при получении формы с сервера'
                        , e
                    )
                })
        }
    },
    /**
     * @param template {string}
     * @param id {string|int}
     * @returns {string}
     */
    layoutTemplate: function (template, id) {
        return template.replace(Chocolate.ID_REG_EXP, id);
    },
    user: {
        getSign: function () {
            return [
                '',
                Chocolate.user.getName(),
                moment(new Date()).format(ChOptions.settings.signatureFormat),
                ''
            ].join(' ')
        },
        /**
         * @param name {string}
         * @param id {string}
         */
        setIdentity: function (name, id) {

            Chocolate.storage.session.user = {
                id: id,
                name: name
            };

            var bindModule = chApp.getBindService(),
                optionsModule = chApp.getOptions(),
                mainModule = chApp.getMain();

            var rolesSql = bindModule.bindSql(optionsModule.sql.getRoles),
                formsSql = bindModule.bindSql(optionsModule.sql.getForms);
            mainModule.createRequest({
                query: rolesSql,
                type: optionsModule.sql.types.roles
            });
            mainModule.createRequest({
                query: formsSql,
                type: optionsModule.sql.types.forms
            });
        },
        setRoles: function (roles) {
            var result = [];
            var i,
                hasOwn = Object.prototype.hasOwnProperty,
                role;
            for (i in roles) {
                if (hasOwn.call(roles, i)) {
                    role = roles[i].name.toLowerCase();
                    result.push(role);
                }
            }
            if(typeof Chocolate.storage.session.user === 'undefined'){
                Chocolate.storage.session.user = {};
            }
            Chocolate.storage.session.user.roles = result;
        },
        /**
         * @returns {string}
         */
        getID: function () {
            return Chocolate.storage.session.user.id;
        },
        /**
         * @returns {string}
         */
        getName: function () {
            return Chocolate.storage.session.user.name;
        },
        /**
         * @param role {string}
         * @returns {boolean}
         */
        hasRole: function (role) {
            //#tips 1
            return Boolean(~$.inArray(role, Chocolate.storage.session.user.roles));
        }
    },
    tab: {
        closeActiveTab: function () {
            var $a = Chocolate.getActiveChTab().$a;
            Chocolate.tab.close($a);
        },
        /**
         * @param $a {jQuery}
         */
        close: function ($a) {
            var activeTab = ChObjectStorage.getChTab($a);
            if (activeTab.isCardTypePanel()) {
                var card = ChObjectStorage.getChCard(activeTab.getPanel().children('[data-id = grid-tabs]'));
                card._undoChange();
            } else {
                var form = ChObjectStorage.getChGridForm(activeTab.getPanel().find('.section-grid>form'));
                if (typeof form.isHasChange != 'undefined' && form.$form.length && form.isHasChange() && !confirm(form.getExitMessage())) {
                    return;
                }
            }
            var $tab = activeTab.getLi();
            if ($tab.hasClass(ChOptions.classes.activeTab)) {
                var nextIndex = ChTabHistory.pop();
                Chocolate.$tabs.tabs({ active: nextIndex });
                chApp.getDraw().reflowActiveTab();
            }
            var tabSelector = Chocolate.idSel($tab.remove().attr("aria-controls"));
            var $panel = $(tabSelector);
            try {
                $panel.find('.ui-resizable').each(function () {
                    $(this).resizable('destroy')
                });
            } catch (e) {
            }

            try {
                $panel.find('.editable').each(function () {
                    $(this).editable('destroy').remove()
                });
            } catch (e) {
                console.log(e)
            }
            try {
//                $panel.find('.toggle-button').each(function(){$(this).remove()});
                $panel.find('.menu-button, .tree-button, .tablesorter-filter, .tablesorter-header a, .tablesorter-header div, .form-vertical input').each(function () {
                    $(this).remove()
                });
                $panel.find(' .tablesorter-header,.form-vertical ').each(function () {
                    $(this).remove()
                });
                $panel.find('.tablesorter').trigger('destroy');
                $panel.find('.grid-view>table').floatThead('destroy');
                $panel.find(' .table-bordered').each(function () {
                    $(this).remove()
                });
                $panel.find(' .grid-view').each(function () {
                    $(this).remove()
                });
            } catch (e) {
                console.log(e)
            }

            $panel.remove();
            Chocolate.$tabs.tabs("refresh");
            ChObjectStorage.garbageCollection();
        },
        /**
         * @param id {string}
         * @param name {string}
         * @returns {jQuery}
         */
        add: function (id, name) {
            var $tabItem = $('<li>' + Chocolate.tab.createTabLink(id, name) + '</li>');
            Chocolate.$tabs.children('ul').append($tabItem);
            Chocolate.$tabs.tabs();
            Chocolate.$tabs.tabs('refresh');
            ChTabHistory.push($tabItem);
            return $tabItem;
        },
        /**
         * @param targetID {string}
         * @param name {string}
         * @returns {string}
         */
        createTabLink: function (targetID, name) {
            return [
                '<a id="',
                Chocolate.uniqueID(),
                '" href="#',
                targetID,
                '">',
                name,
                '</a><span class="tab-closed fa fa-times"></span>'
            ].join('');
        },
        /**
         * @param id {string}
         * @param name {string}
         * @returns {jQuery}
         */
        addAndSetActive: function (id, name) {
            var $item = Chocolate.tab.add(id, name);
            Chocolate.$tabs.tabs({ active: $item.index() });
            return $item;
        },
        card: {
            /**
             * @param ui {Object}
             * @param content {string|jQuery}
             * @param $context {jQuery}
             * @private
             */
            _initScripts: function (ui, content, $context) {
                ui.panel.html(content);
                ChCardInitCallback.fireOnce();
                chApp.getDraw().drawCardPanel(ui.panel, $context);
                setTimeout(function () {
                    chApp.getDraw().reflowActiveTab();
                }, 0);
                ui.tab.data('loaded', 1);
            },
            /**
             * #tips 2
             * @param e {Event}
             * @param ui {Object}
             * @param $tabPanel {jQuery}
             * @returns {boolean}
             * @private
             */
            _onBeforeLoad: function (e, ui, $tabPanel) {
                if (!ui.tab.data('loaded')) {
                    var chCard = ChObjectStorage.getChCard($(this)),
                        tabID = $(ui.tab).attr('data-id'),
                        pk = chCard.getKey(),
                        fmCardCollection = chCard.getFmCardCollection(),
                        isNumeric = $.isNumeric(pk),
                        template = fmCardCollection.getCardTemplate(tabID, isNumeric);
                    if (template == null) {
                        $.get(chCard.getTabDataUrl(tabID))
                            .done(function (template) {
                                var $content = $(Chocolate.layoutTemplate(template, pk));
                                try {
                                    Chocolate.tab.card._initScripts(ui, $content, $tabPanel);
                                    fmCardCollection.setCardTemplate(tabID, template, isNumeric);
                                } catch (e) {
                                    $content.remove();
                                    Chocolate.log.error(
                                        'Возникла ошибка при инициализации шаблона',
                                        e
                                    )
                                }
                            })
                            .fail(function (e) {
                                Chocolate.log.error(
                                    'Ошибка при получении с сервера шаблон закладки для карточки',
                                    e
                                )
                            })
                    } else {
                        Chocolate.tab.card._initScripts(ui, Chocolate.layoutTemplate(template, pk), $tabPanel);

                    }
                }
                return false;
            },
            /**
             * @param $tabPanel {jQuery}
             */
            init: function ($tabPanel) {
                $tabPanel.addClass(ChOptions.classes.card);
                $tabPanel.children('div').tabs({
                    beforeLoad: function (e, ui) {
                        return Chocolate.tab.card._onBeforeLoad.apply(this, [e, ui, $tabPanel]);
                    },
                    cache: true
                });
            }
        }
    }
};
