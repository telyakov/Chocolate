var AttachmentView = (function (Backbone) {
    'use strict';
    return AbstractView.extend({
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
                '<table class="items table-bordered" tabindex="0"><thead>',
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
                '<%= footer%>',
                '</form>',
                '</section>'

            ].join('')
        ),
        events: {
            'click .attachment-file': $.debounce(2000, true, function (e) {
                var id = $(e.target).attr('data-id');
                mediator.publish(optionsModule.getChannel('socketFileRequest'), {id: id});
            })
        },
        initScript: function (sectionID, formID, isNewRow, jsonDefaultValues) {
            $(function () {
                var $section = $('#' + sectionID),
                    $cnt = $section.parent();
                if (!$cnt.hasClass('card-grid')) {
                    facade.getRepaintModule().reflowGrid($cnt);
                }
                if (!isNewRow) {
                    $section
                        .on('drop', function (e) {
                            $(this).removeClass("attachment-dragover");
                            e.preventDefault();
                        })
                        .on('dragover', function (e) {
                            $(this).addClass("attachment-dragover");
                            e.preventDefault();
                        })
                        .on('dragleave', function () {
                            $(this).removeClass("attachment-dragover");
                        });
                }
                var $form = $('#' + formID),
                    form = facade.getFactoryModule().makeChGridForm($form);
                $form.on('fileuploadsubmit', function () {
                    return false;
                });
                var defaultValues = $.parseJSON(jsonDefaultValues);
                form.saveInStorage({}, {}, defaultValues, {}, {});
            });
        },
        stopHandler: function (formID) {
            var filesModule = facade.getFilesModule(),
                form = facade.getFactoryModule().makeChGridForm($('#' + formID));
            if (filesModule.hasErrors(formID)) {
                form.getMessagesContainer().sendMessage('Возникли ошибки при добавлении вложений', chApp.getResponseStatuses().ERROR);
                filesModule.clearErrors(formID);
            } else {
                if (form.isHasChange()) {
                    form.save();
                } else {
                    form.refresh();
                }
            }
        },
        refresh: function () {
            this.refreshData();
        },
        _callbacks: null,
        getCallbacks: function () {
            if (this._callbacks === null) {
                var callbacks = [],
                    $cnt = this.$el;
                this.model.getColumnsROCollection().each(function (column) {
                    callbacks.push(column.getJsFn($cnt));
                });
                this._callbacks = callbacks;
            }
            return this._callbacks;

        },
        refreshData: function () {
            var form = factoryModule.makeChGridForm($('#' + this.getFormID())),
                callbacks = this.getCallbacks(),
                defer = deferredModule.create(),
                deferID = deferredModule.save(defer),
                model = this.model,
                _this = this;
            var data = this.view.getFilterData();
            var mainSql;
            if (this.view.card) {
                mainSql = this.view.card.get('column').getSql();
            }
            model.readProcEval(deferID, data, mainSql);
            defer.done(function (data) {
                var sql = data.sql;
                var deferRead = deferredModule.create(),
                    deferReadID = deferredModule.save(deferRead);
                mediator.publish(optionsModule.getChannel('socketRequest'), {
                    query: sql,
                    type: optionsModule.getRequestType('chFormRefresh'),
                    id: deferReadID
                });
                var main = chApp.namespace('main');
                var chTable = facade.getFactoryModule().makeChTable($(main.idSel(_this.getFormID())).find('table'));
                chTable.initAttachmentScript();
                deferRead.done(function (data) {
                    form.updateStorage(data.data, data.order);
                    var correctData = [];
                    data.order.forEach(function (key) {
                        correctData.push(data.data[key]);
                    });
                    var tmpl_data = {'files': correctData},
                        content = window.tmpl('template-download', tmpl_data);
                    content = content.replace(new RegExp('fade', 'g'), 'fade in');
                    var $html = $(content);
                    form.getTable()
                        .find('tbody')
                        .html($html)
                        .trigger("update");
                    form._clearDeletedObj();
                    form._clearChangedObj();
                    form.clearSelectedArea();
                    form.setRowCount(Object.keys(data.data).length);
                });
            });
        },
        failHandler: function (formID, data) {
            var filesModule = facade.getFilesModule();
            filesModule.pushError(formID, data.errorThrown);
            filesModule.push(formID, data.files);
        },
        addedHandler: function (formID, data) {
            var $form = $('#' + formID),
                form = facade.getFactoryModule().makeChGridForm($form);
            if (data.isValidated) {
                var rowID = Chocolate.uniqueID();
                data.files[0].rowID = rowID;
                facade.getFilesModule().push(formID, data.files);
                data.context.attr("data-id", rowID);
                data.context.find("td input[type=file]").attr("parent-id", rowID);
                $form.find("div[data-id=user-grid] table").trigger("update");
                form.getSaveButton().addClass("active");
            } else {
                data.context.remove();
                form.getMessagesContainer().sendMessage("Слишком большой размер файла (максисмум 50мб.)", chApp.getResponseStatuses().ERROR);
            }
        },
        render: function () {
            var sectionID = this.$el.parent().attr('id'),
                formID = this.getFormID();
            var footer = this.footerTemplate();
            this.$el.html(this.template({
                isSaved: !this.model.isNotSaved(),
                formID: formID,
                parentView: this.model.getParentView(),
                parentID: this.model.get('parentId'),
                inputID: helpersModule.uniqueID(),
                gridViewID: helpersModule.uniqueID(),
                footer: footer
            }));

            this.initScript(
                sectionID,
                formID,
                '',
                ''
            );
            var _this = this;
            $('#' + formID).
                fileupload({
                    'autoUpload': false,
                    'maxFileSize': 50000000,
                    'acceptFileTypes': /(.*)$/i,
                    'added': function (e, data) {
                        _this.addedHandler(formID, data);
                    },
                    'stop': function () {
                        _this.stopHandler(formID);
                    },
                    'fail': function (e, data) {
                        _this.failHandler(formID, data);
                    },
                    'dropZone': this.model.isNotSaved() ? false : $("#" + sectionID),
                    'url': '/Attachment/upload?view=attachments.xml&ParentView=' + this.model.getParentView() + '&ParentID=' + this.model.get('parentId')
                });
            this.refreshData();
        }
    });
})(Backbone);