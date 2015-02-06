/**
 * Class AttachmentView
 * @class
 * @augments AbstractGridView
 */
var AttachmentView = (function (window, $, _, AbstractGridView, deferredModule, optionsModule, helpersModule, userModule) {
    'use strict';
    return AbstractGridView.extend(
        /** @lends AttachmentView */
        {
            template: _.template(
                [
                    '<form id="<%= formID %>" class="grid-form" ',
                    'enctype="multipart/form-data" multiple="multiple" method="post">',
                    '<% if (isSaved) { %>',
                    '<div class="fileupload-buttonbar">',
                    '<menu class="menu" type="toolbar">',
                    '<div class="messages-container"></div>',
                    '<span class="fileinput-button menu-button active">',
                    '<span class="menu-border-green"></span><span>Вложить</span>',
                    '<input id="<%= inputID %>" multiple="multiple" type="file" >',
                    '</span>',
                    '<button class="menu-button menu-button-save start" type="submit">',
                    '<span class="fa-save"></span><span title="Сохранить">Сохранить</span>',
                    '</button>',
                    '<button class="menu-button active menu-button-refresh" type="button">',
                    '<span class="fa-refresh" title="Обновить"></span>',
                    '<span title="Обновить">Обновить</span>',
                    '</button>',
                    '</menu></div>',
                    '<% } %>',
                    '<section data-id="grid">',
                    '<div class="grid-view" id="<%= gridViewID %>"">',
                    '<table class="items table-bordered" tabindex="0" ><thead>',
                    '<th data-id="chocolate-control-column"><div></div></th>',
                    '<th data-id="name"><div><a>',
                    '<span class="grid-caption">Скачать</span><span class="grid-sorting"></span>',
                    '</a></div></th>',
                    '<th data-id="version"><div><a>',
                    '<span class="grid-caption">Версия</span><span class="grid-sorting"></span>',
                    '</a></div></th>',
                    '<th data-id="insusername"><div><a>',
                    '<span class="grid-caption">Создатель</span><span class="grid-sorting"></span>',
                    '</a></div></th>',
                    '<th data-id="insdata"><div><a>',
                    '<span class="grid-caption">Дата создания</span><span class="grid-sorting"></span>',
                    '</a></div></th>',
                    '</thead><tbody class="files"></tbody></table></div>',
                    '</section>',
                    '</form>',
                    '</section>'

                ].join('')
            ),
            /**
             * @see http://backbonejs.ru/#View-delegateEvents
             * @returns {Object}
             */
            events: function () {
                return _.extend({}, AbstractGridView.prototype.events, {
                    'click .attachment-file': $.debounce(700, true, this._downloadFileHandler)
                });
            },
            /**
             * @abstract
             * @class AttachmentView
             * @augments AbstractGridView
             * @param {AbstractViewOptions} options
             * @constructs
             */
            initialize: function (options) {
                this._$zone = null;
                this._files = [];
                this._errors = [];
                AbstractGridView.prototype.initialize.call(this, options);
            },
            /**
             * @desc Destroy class
             */
            destroy: function () {
                this._destroyContextMenuWidget();
                this._destroyFileUploadWidget();
                delete this._errors;
                delete this._files;
                AbstractGridView.prototype.destroy.apply(this);
            },
            /**
             * @desc Render form
             */
            render: function () {
                var formID = this.getFormID();
                this.$el.html(this.template({
                    isSaved: !this.getModel().isNotSaved(),
                    formID: formID,
                    inputID: helpersModule.uniqueID(),
                    gridViewID: helpersModule.uniqueID()
                }));
                this.layoutFooter();
                this._initFileUploadWidget();
                this._makeRefresh(true);
            },
            /**
             * @returns {boolean}
             * @override
             */
            hasChange: function () {
                return this._hasUnsavedFiles()
                || !$.isEmptyObject(this.getModel().getDeletedDataFromStorage());
            },
            /**
             * @desc Save data in attachment form
             * @override
             */
            save: function () {
                if (this.hasChange()) {
                    var model = this.getModel(),
                        _this = this,
                        deletedData = model.getDeletedDataFromStorage();

                    if (this._hasUnsavedFiles()) {
                        var isEmpty = $.isEmptyObject(deletedData),
                            ownerLock = model.getColumnsDefaultValues().ownerlock,
                            filesTasks = [];
                        while (this._hasUnsavedFiles()) {
                            var taskDefer = deferredModule.create(),
                                taskDeferID = deferredModule.save(taskDefer);
                            filesTasks.push(taskDefer);
                            var files = _this._filePop(),
                                file = files[0],
                                rowID = file.rowID;
                            if (isEmpty || !deletedData[rowID]) {
                                var defer = deferredModule.create();
                                defer.done(function (file, taskDeferID) {
                                    var reader = new FileReader();
                                    reader.onload = function (evt) {
                                        var data = evt.target.result;
                                        var prepare = helpersModule.arrayBufferToBase64(data);
                                        model.runAsyncTaskBindReadProc({
                                            filestypesid: '4',
                                            ownerlock: ownerLock,
                                            source: '',
                                            description: 'загружено через web-service',
                                            userid: userModule.getID(),
                                            name: file.name,
                                            filedatetime: moment().format('YYYY-MM-DD HH:mm:ss')
                                        })
                                            .done(
                                            /** @param {SqlBindingResponse} res */
                                                function (res) {
                                                var sql = res.sql;
                                                mediator.publish(optionsModule.getChannel('socketFileUpload'), {
                                                    type: optionsModule.getRequestType('deferred'),
                                                    data: prepare,
                                                    sql: sql,
                                                    name: taskDeferID
                                                });
                                            });
                                    };
                                    reader
                                        .readAsArrayBuffer(file);
                                });
                                defer.resolve(file, taskDeferID);


                            }
                            $.when.apply($, filesTasks).done(function () {
                                _this._saveDeletedData();

                            });
                        }
                    }
                    else {
                        if (!$.isEmptyObject(model.getDeletedDataFromStorage())) {
                            this._saveDeletedData();
                        } else {
                            this.showMessage({
                                id: 2,
                                msg: 'Данные не были изменены.'
                            });
                        }
                    }
                } else {
                    this.showMessage({
                        id: 2,
                        msg: 'Данные не были изменены.'
                    });
                }
            },
            /**
             * @override
             */
            refresh: function () {
                this._makeRefresh();
            },
            /**
             * @returns {boolean}
             * @private
             */
            _hasUnsavedFiles: function () {
                return this._files.length > 0;
            },
            /**
             * @returns {*}
             * @private
             */
            _filePop: function () {
                return this._files.pop()
            },
            /**
             *
             * @param file
             * @private
             */
            _filePush: function (file) {
                this._files.push(file);
            },
            /**
             * @returns {boolean}
             * @private
             */
            _validate: function () {
                return this._errors.length === 0;
            },
            /**
             * @desc clear errors
             * @private
             */
            _resetErrors: function () {
                this._errors = [];
            },
            /**
             * @param {String} error
             * @private
             */
            _addError: function (error) {
                this._errors.push(error);
            },
            /**
             * @desc Trigger download file event
             * @param {Event} e
             * @fire mediator#socketFileRequest
             * @private
             */
            _downloadFileHandler: function (e) {
                var id = $(e.target).attr('data-id');
                mediator.publish(optionsModule.getChannel('socketFileRequest'), {id: id});
            },
            /**
             * @desc Save Deleted Data and refresh form
             * @private
             */
            _saveDeletedData: function () {
                var model = this.getModel(),
                    deletedData = model.getDeletedDataFromStorage(),
                    key,
                    _this = this,
                    hasOwn = Object.prototype.hasOwnProperty;
                for (key in deletedData) {
                    if (hasOwn.call(deletedData, key)) {
                        if (!$.isNumeric(key)) {
                            delete deletedData[key];
                        }
                    }
                }
                model
                    .runAsyncTaskSave({}, deletedData)
                    .done(function () {
                        model.trigger('refresh:form');
                    })
                    .fail(
                    /** @param {string} error */
                        function (error) {
                        _this.showMessage({
                            id: 3,
                            msg: error
                        });
                    });
            },
            /**
             * @desc Destroy FileUpload Widget
             * @private
             */
            _destroyFileUploadWidget: function () {
                if (this._$zone) {
                    this._$zone.off('drop').off('dragover').off('dragleave');
                }
                this.getJqueryForm().off('fileuploadsubmit').fileupload('destroy');
            },
            /**
             * @desc For fight with leak memory
             * @param {?jQuery} $zone
             * @private
             */
            _persistReferenceToDropZone: function ($zone) {
                this._$zone = $zone;
            },
            /**
             * @see https://github.com/blueimp/jQuery-File-Upload
             * @desc Initialize FileUpload Widget
             * @private
             */
            _initFileUploadWidget: function () {
                var model = this.getModel(),
                    $form = this.getJqueryForm(),
                    isSaved = !this.getModel().isNotSaved(),
                    _this = this,
                    $dropZone;
                if (isSaved) {
                    $dropZone = $form.closest('.attachment-grid');
                    this._persistReferenceToDropZone($dropZone);
                    $dropZone
                        .on('drop', function (e) {
                            $(this).removeClass('attachment-dragover');
                            e.preventDefault();
                        })
                        .on('dragover', function (e) {
                            $(this).addClass('attachment-dragover');
                            e.preventDefault();
                        })
                        .on('dragleave', function () {
                            $(this).removeClass('attachment-dragover');
                        });
                }
                $form
                    .on('fileuploadsubmit', function () {
                        return false;
                    })
                    .fileupload({
                        autoUpload: false,
                        maxFileSize: 50000000,
                        acceptFileTypes: /(.*)$/i,
                        added: function (e, data) {
                            if (data.isValidated) {
                                var rowID = helpersModule.uniqueID();
                                data.files[0].rowID = rowID;
                                _this._filePush(data.files);
                                data.context.attr('data-id', rowID);
                                data.context.find('td input[type=file]').attr('parent-id', rowID);
                                $form.find(".grid-view table").trigger("update");
                                _this._markAsChanged();
                            } else {
                                data.context.remove();
                                _this.showMessage({
                                    id: 3,
                                    msg: "Слишком большой размер файла (максисмум 50мб.)"
                                });
                            }
                        },
                        stop: function () {
                            if (_this._validate()) {
                                _this.showMessage({
                                    id: 3,
                                    msg: 'Возникли ошибки при добавлении вложений'
                                });
                                _this._resetErrors();
                            } else {
                                if (_this.hasChange()) {
                                    model.trigger('save:form');
                                } else {
                                    model.trigger('refresh:form');
                                }
                            }
                        },
                        fail: function (e, data) {
                            _this._addError(data.errorThrown);
                            _this._filePush(data.files);
                        },
                        dropZone: $dropZone
                    });
                this._initContextMenuWidget();
            },

            /**
             * @desc Destroy Context Menu widget
             * @private
             */
            _destroyContextMenuWidget: function () {
                this.$el.contextmenu('destroy');
            },
            /**
             * @desc Initialize Context Menu widget
             * @private
             */
            _initContextMenuWidget: function () {
                var _this = this;
                this.$el.contextmenu({
                    delegate: '.attachment-grid-menu',
                    show: {effect: 'blind', duration: 0},
                    menu: [
                        {
                            title: optionsModule.getMessage('Delete') + ' [DEL]',
                            cmd: 'delete',
                            uiIcon: 'ui-icon-trash'
                        }
                    ],
                    select: function (e, ui) {
                        switch (ui.cmd) {
                            case 'delete':
                                _this.removeSelectedRows();
                                break;
                            default :
                                break;
                        }
                    }
                });
            },
            /**
             *
             * @param {boolean} [isApplyJs]
             * @private
             */
            _makeRefresh: function (isApplyJs) {
                var model = this.getModel(),
                    view = this.getView(),
                    card = view.getCard(),
                    _this = this,
                    columnSql;
                if (card) {
                    columnSql = card.getColumn().getSql();
                }
                model
                    .runAsyncTaskBindingReadProc(view.getFilterData(), columnSql)
                    .done(
                    /** @param {SqlBindingResponse} data */
                        function (data) {
                        var sql = data.sql,
                            refreshAsyncTask = deferredModule.create();

                        mediator.publish(optionsModule.getChannel('socketRequest'), {
                            query: sql,
                            type: optionsModule.getRequestType('chFormRefresh'),
                            id: deferredModule.save(refreshAsyncTask)
                        });

                        if (isApplyJs) {
                            _this._initTableScripts();
                        }

                        refreshAsyncTask
                            .done(
                            /** @param {RecordsetDTO} data */
                                function (data) {
                                var recordset = data.data,
                                    order = data.order;
                                model.persistData(recordset, order);
                                var files = [];
                                order.forEach(function (key) {
                                    files.push(recordset[key]);
                                });
                                var content = window
                                    .tmpl('template-download', {files: files});
                                _this.getJqueryTbody()
                                    .html(content)
                                    .trigger('update');
                                _this
                                    .clearSelectedArea()
                                    .setRowCount(Object.keys(recordset).length);
                            })
                            .fail(
                            /** @param {string} error */
                                function (error) {
                                _this.showMessage({
                                    id: 3,
                                    msg: error
                                });
                            });
                    })
                    .fail(
                    /** @param {string} error */
                        function (error) {
                        _this.showMessage({
                            id: 3,
                            msg: error
                        });
                    });
            },
            /**
             * @desc Initialize all attachments table scripts
             * @private
             */
            _initTableScripts: function () {
                var $table = this.getJqueryDataTable();
                this
                    .initSettings()
                    .initTableSorterWidget($table)
                    .initResizeWidget($table)
                    .initFloatTheadWidget($table);
            }
        });
})(window, jQuery, _, AbstractGridView, deferredModule, optionsModule, helpersModule, userModule);