var optionsModule = (function () {
    'use strict';
    var keys = {
            ENTER: 13,
            BACKSPACE: 8,
            F4: 115,
            F5: 116,
            UP: 38,
            DOWN: 40,
            DEL: 46,
            ESCAPE: 27
        },
        constants = {
            multiTaskService: '81',
            tasksXml: 'tasks.xml',
            tasksForTopsXml: 'tasksfortops.xml',
            userSettingsXml: 'usersettings.xml',
            standardDesignType: '1',
            mobileDesignType: '2',
            topsIdList: [1472, 87, 1473, 1705, 1471, 1330, 1130, 1, 50, 326, 1087, 33, 186, 13, 1292, 1390, 337, 1470, 1474]

        },
        channels = {
            socketRequest: 'socket_request',
            socketMultiplyExec: 'socket_multiply_exec',
            socketResponse: 'socket_response',
            socketFileRequest: 'socket_file_request',
            socketExportToExcel: 'socket_export_to_excel',
            socketFileResponse: 'socket_file_response',
            socketFileUpload: 'socket_file_upload',
            logError: 'log_error',
            showError: 'show_error',
            setIdentity: 'set_identity',
            reflowTab: 'reflow_tab',
            openForm: 'open_form',
            xmlRequest: 'xml_request',
            xmlResponse: 'xml_response'
        },
        settings = {
            locale: 'ru',
            key: 'test6543210',
            defaultColumnsWidth: '150',
            defaultAutoUpdateMS: 100000,
            formatDate: 'YYYY.MM.DD HH:mm:ss',
            signatureFormat: 'DD.MM.YYYY HH:mm',
            userDateFormat: 'MM.DD.YYYY HH:mm:ss',
            ddmmyyyyFormat: 'dd.mm.yyyy',
            emailCol: 'emails',
            titleRowHeight: 26,
            systemCols: ['lastmodifier', 'lastmodifydate', 'insdate', 'username', 'userid'],
            topsViews: ['tasksfortops.xml'],
            viewsWithoutFilters: [' tasksfortops.xml', 'attachmentstasks.xml'],
            keyCaption: 'ключ',
            controlColumn: 'chocolate-control-column',
            attention: 'attention',
            notView: 'not-view'
        },
        sql = {
            getForms: 'core.UserFormsGet [userid]',
            getRoles: 'core.UserRolesGet [userid]',
            getServices: 'Tasks.ServicesGet',
            makeCall: 'crm.makeCall [userid], [phoneto]',
            getProcParams: 'dbo.uspGetProcParameters [name], [schema]',
            getExecutors: 'tasks.uspGetUsersListForTasksUsers',
            types: {
                mainForm: 'main_form',
                forms: 'forms',
                roles: 'roles',
                jquery: 'jquery',
                wizardServices: 'wizard_services',
                wizardExecutors: 'wizard_executors',
                chFormRefresh: 'ch_form_refresh',
                deferred: 'deferred'
            }
        },
        classes = {
            allowHideColumn: 'data-col-hide',
            activeRow: 'row-active',
            selectedRow: 'row-selected',
            filterSection: 'section-filters',
            gridSection: 'section-grid',
            headerSection: 'section-header',
            selectedMouseArea: 'sel-mouse',
            selectedKeyboardArea: 'sel-keyboard',
            selectedArea: 'sel-area',
            filterClass: 'filter-item',
            activeTab: 'ui-tabs-active',
            card: 'chocolate-card',
            tabMenuClass: 'ui-tabs-nav',
            staticCardElement: 'card-static',
            ipLink: 'fm-iplink',
            notChanged: 'not-changed',
            menuButtonSelected: 'menu-button-selected',
            searchedColumn: 'grid-column-searched',
            discussionForm: 'discussion-form'
        },
        urls = {
            bp: 'bp.78stroy.ru',
            openFromEmail: '/grid/searchbyid',
            webSocketServer: 'http://crm.78stroy.ru',
            imagesUrls: '/majestic/images',
            bpOneTask: 'http://bp.78stroy.ru/grid/searchByID?view=tasks%5Ctasksfortops.xml&id='
        },
        messages = {
            ru: {
                noConnectWebsocket: 'Нет подключения к WebSocket серверу. Некоторые функции могут быть недоступны',
                projectName: 'Шоколад',
                chocolateHasChange: 'ВНИМАНИЕ! У Вас есть несохраненные изменения. В результате перехода они могут быть потеряны.',
                refreshForm: 'Сохранить изменения?',
                Yes: 'Да',
                successSave: 'Данные сохранены.',
                successRefresh: 'Данные обновлены.',
                No: 'Нет',
                Cancel: 'Отмена',
                Delete: 'Удалить',
                NotFilledRequiredFields: 'Заполнены не все обязательные поля'
            }
        },
        _private = {
            getSetting: function (key) {
                return settings[key];
            },
            getMessage: function (key) {
                return messages[_private.getSetting('locale')][key];
            },
            getUrl: function (key) {
                return urls[key];
            },
            getRequestType: function (key) {
                return sql.types[key];
            },
            getChannel: function (key) {
                return channels[key];
            },
            getSql: function (key) {
                return sql[key];
            },
            getClass: function (key) {
                return classes[key];
            },
            getConstants: function (key) {
                return constants[key];
            }
        };
    return {
        /**
         *
         * @param {string} key
         * @returns {string}
         */
        getMessage: function (key) {
            return _private.getMessage(key);
        },
        /**
         *
         * @param {string} key
         * @returns {string}
         */
        getUrl: function (key) {
            return _private.getUrl(key);
        },
        /**
         *
         * @param {string} key
         * @returns {string}
         */
        getRequestType: function (key) {
            return _private.getRequestType(key);
        },
        /**
         *
         * @param {string} key
         * @returns {string}
         */
        getChannel: function (key) {
            return _private.getChannel(key);
        },
        /**
         *
         * @param {string} key
         * @returns {string}
         */
        getSetting: function (key) {
            return _private.getSetting(key);
        },
        /**
         *
         * @param {string} key
         * @returns {string}
         */
        getSql: function (key) {
            return _private.getSql(key);
        },
        /**
         *
         * @param {string} key
         * @returns {string}
         */
        getClass: function (key) {
            return _private.getClass(key);
        },
        /**
         *
         * @param {string} key
         * @returns {string}
         */
        getConstants: function (key) {
            return _private.getConstants(key);
        },
        /**
         *
         * @param {string} key
         * @returns {string}
         */
        getKeyCode: function (key) {
            return keys[key.toUpperCase()];
        }
    };
}());