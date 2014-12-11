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
        render: function () {
           var sectionID = this.$el.parent().attr('id'),
               formID = helpersModule.uniqueID();
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

            var attachmentModule = chApp.getAttachment();
            attachmentModule.initScript(
                sectionID,
                formID,
                '',
                ''
            );
            $('#'+ formID).
                fileupload({
                    'autoUpload': false,
                    'maxFileSize': 50000000,
                    'acceptFileTypes': /(.*)$/i,
                    'added': function (e, data) {
                        attachmentModule.addedHandler(formID, data);},
                    'stop':function(){attachmentModule.stopHandler(formID);},
                    'fail':function(e,data){attachmentModule.failHandler(formID, data);},
                    'dropZone': this.model.isNotSaved()? false : $("#" + sectionID),
                    'url':'/Attachment/upload?view=attachments.xml&ParentView=' + this.model.getParentView() + '&ParentID='+  this.model.get('parentId')});
            chApp.namespace('attachments').initData(formID, this.model.isNotSaved(), this.model.getParentView());
        }
    });
})(Backbone);