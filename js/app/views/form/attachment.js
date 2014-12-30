var AttachmentView = (function (AbstractGridView, $, _, deferredModule, optionsModule, window, helpersModule) {
    'use strict';
    return AbstractGridView.extend({
        template: _.template(
            [
                '<form id="<%= formID %>" class="grid-form" data-id="attachments.xml" ',
                'parent-data-id="<%= parentView %>" ',
                'data-parent-pk="<%= parentID %>" enctype="multipart/form-data" multiple="multiple" ',
                ' action="/Attachment/upload?view=attachments.xml&amp;ParentView=<%= parentView %>&amp;ParentID=<%= parentID %>" method="post">',
                '<% if (isSaved) { %>',
                '<div class="fileupload-buttonbar"><menu class="menu" type="toolbar">',
                '<span class="fileinput-button menu-button active">',
                '<span class="menu-border-green"></span><span>Вложить</span>',
                '<input id="<%= inputID %>" multiple="multiple" type="file" name="FileModel[files]">',
                '</span>',
                '<button class="menu-button menu-button-save start" type="submit" data-url="/attachment/save">',
                '<span class="fa-save"></span><span title="Сохранить">Сохранить</span>',
                '</button>',
                '<button class="menu-button active menu-button-refresh" type="button">',
                '<span class="fa-refresh" title="Обновить"></span>',
                '<span title="Обновить">Обновить</span>',
                '</button>',
                '<div class="messages-container"></div>',
                '</menu></div>',
                '<% } %>',
                '<section data-id="grid">',
                '<div class="grid-view" data-id="user-grid" id="<%= gridViewID %>"">',
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
        events: function () {
            return _.extend({}, AbstractGridView.prototype.events, {
                'click .attachment-file': $.debounce(2000, true, this.downloadFileHandler)
            });
        },
        downloadFileHandler: function (e) {
            var id = $(e.target).attr('data-id');
            mediator.publish(optionsModule.getChannel('socketFileRequest'), {id: id});
        },
        render: function () {
            var formID = this.getFormID();
            this.$el.html(this.template({
                isSaved: !this.model.isNotSaved(),
                formID: formID,
                parentView: this.model.getParentView(),
                parentID: this.model.get('parentId'),
                inputID: helpersModule.uniqueID(),
                gridViewID: helpersModule.uniqueID()
            }));
            var $form = this.getJqueryForm();
            this.layoutFooter($form);
            this.layoutFooter($form);
            this.initScript($form);
            this.refreshData();
        },
        hasChange: function () {
            return facade.getFilesModule().isNotEmpty(this.getFormID()) || !$.isEmptyObject(this.getDeletedDataFromStorage());
        },
        //save: function () {
        //    console.log('save attahcments')
        //    var userGridID = this.getUserGridID(),
        //        ch_messages_container = this.getMessagesContainer(),
        //        _this = this,
        //        deleted_obj = $.extend({}, this.getDeletedObj());
        //
        //    var formID = this.getID(),
        //        fileModule = facade.getFilesModule();
        //
        //    if (fileModule.isNotEmpty(formID)) {
        //        var isEmpty = $.isEmptyObject(deleted_obj);
        //        while (fileModule.isNotEmpty(formID)) {
        //            var defObj = this.getDefaultObj(),
        //                ownerLock = defObj['ownerlock'],
        //                file = fileModule.pop(formID);
        //            var rowID = file[0].rowID;
        //            if (isEmpty || !deleted_obj[rowID]) {
        //                this.$form.fileupload({
        //                    formData: {FilesTypesID: 4, OwnerLock: ownerLock}
        //                });
        //                this.$form.fileupload('send', {files: file});
        //            }
        //        }
        //    }
        //    else {
        //        if (!$.isEmptyObject(deleted_obj)) {
        //            this.saveAttachment(this);
        //        } else {
        //            ch_messages_container.sendMessage('Данные не были изменены.', ChResponseStatus.WARNING);
        //        }
        //    }
        //    return [];
        //},
        //saveAttachment: function (chForm) {
        //    var delData = chForm.getDeletedObj();
        //    if (!$.isEmptyObject(delData)) {
        //        for (var property in delData) {
        //            if (!$.isNumeric(property)) {
        //                delete delData[property];
        //            }
        //        }
        //
        //        var chMsgContainer = chForm.getMessagesContainer(),
        //            data = {
        //                jsonChangedData: {},
        //                jsonDeletedData: JSON.stringify($.extend({}, delData))
        //            };
        //        $.ajax({
        //            type: 'POST',
        //            url: chForm.getSaveUrl(),
        //            data: data,
        //            async: false
        //        }).done(function (resp) {
        //            var chResp = new ChResponse(resp);
        //            if (chResp.isSuccess()) {
        //                //todo: вернуть код
        //                //chForm
        //                //    .clearChange()
        //                //    .refresh();
        //            }
        //            chResp.sendMessage(chMsgContainer);
        //        })
        //            .fail(function (resp) {
        //                chMsgContainer.sendMessage('Возникла непредвиденная ошибка при сохранении вложений.', ChResponseStatus.ERROR);
        //            });
        //    }
        //},
        initScript: function ($form) {
            var $dropZone = false;
            if (!this.model.isNotSaved()) {
                $dropZone = $form.closest('.attachment-grid');
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
            var _this = this;
            $form
                .on('fileuploadsubmit', function () {
                    return false;
                })
                .fileupload({
                    autoUpload: false,
                    maxFileSize: 50000000,
                    acceptFileTypes: /(.*)$/i,
                    added: function (e, data) {
                        console.log('added')
                        if (data.isValidated) {
                            var rowID = helpersModule.uniqueID();
                            data.files[0].rowID = rowID;
                            facade.getFilesModule().push(_this.getFormID(), data.files);
                            data.context.attr("data-id", rowID);
                            data.context.find("td input[type=file]").attr("parent-id", rowID);
                            $form.find("div[data-id=user-grid] table").trigger("update");
                            _this.getSaveButton().addClass("active");
                        } else {
                            data.context.remove();
                            _this.showMessage("Слишком большой размер файла (максисмум 50мб.)");
                        }
                    },
                    stop: function () {
                        console.log('stop')
                        var filesModule = facade.getFilesModule();
                        if (filesModule.hasErrors(_this.getFormID())) {
                            _this.showMessage("Возникли ошибки при добавлении вложений");
                            filesModule.clearErrors(_this.getFormID());
                        } else {
                            if (_this.hasChange()) {
                                _this.model.trigger('save:form');
                            } else {
                                _this.model.trigger('refresh:form');
                            }
                        }
                    },
                    fail: function (e, data) {
                        var filesModule = facade.getFilesModule();
                        filesModule.pushError(_this.getFormID(), data.errorThrown);
                        filesModule.push(_this.getFormID(), data.files);
                    },
                    dropZone: $dropZone,
                    url: '/Attachment/upload?view=attachments.xml&ParentView=' + this.model.getParentView() + '&ParentID=' + this.model.get('parentId')
                });
            this.initContextFormMenuEvent();
        },
        initContextFormMenuEvent: function () {
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
        refresh: function () {
            this.refreshData();
        },
        refreshData: function () {
            var $form = this.getJqueryForm(),
                model = this.model,
                _this = this,
                mainSql;
            if (this.view.card) {
                mainSql = this.view.card.get('column').getSql();
            }
            model
                .deferReadProc(this.view.getFilterData(), mainSql)
                .done(function (data) {
                    var sql = data.sql,
                        defer = deferredModule.create(),
                        deferID = deferredModule.save(defer);
                    mediator.publish(optionsModule.getChannel('socketRequest'), {
                        query: sql,
                        type: optionsModule.getRequestType('chFormRefresh'),
                        id: deferID
                    });
                    _this.initTableScript();
                    defer.done(function (data) {
                        _this.persistData(data.data, data.order);
                        var files = [];
                        data.order.forEach(function (key) {
                            files.push(data.data[key]);
                        });
                        var content = window
                            .tmpl('template-download', {'files': files})
                            .replace(new RegExp('fade', 'g'), 'fade in');
                        _this.getJqueryTbody()
                            .html($(content))
                            .trigger('update');
                        _this
                            .clearSelectedArea()
                            .setRowCount(Object.keys(data.data).length);
                    });
                });
        },
        initTableScript: function () {
            var $table = this.getJqueryDataTable();
            this.initSettings();
            this.initTableSorter($table);
            this.initResize($table);
            this.initFloatThead($table);
        }
    });
})(AbstractGridView, jQuery, _, deferredModule, optionsModule, window, helpersModule);