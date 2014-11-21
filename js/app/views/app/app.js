var AppView = Backbone.View.extend({
    initialize: function (options) {
        _.bindAll(this, 'render');
        this.model = options.model;
        this.render();
    },
    render: function () {
        mediator.publish(
            optionsModule.getChannel('setIdentity'),
            this.model.get('userId'),
            this.model.get('userName')
        );
        var $downloadAttachmentTmpl = $('<script>', {
                type: 'text/x-tmpl',
                id: 'template-download',
                text: [
                    '{% for (var i=0, file; file=o.files[i]; i++) { %}',
                    '<tr class="template-download fade" data-id="{%=file.id%}">',
                    '<td class="attachment-grid-menu">',
                    '<span class="card-button" data-id = "card-button" title="Открыть карточку"></span>',
                    '</td>',
                    '<td>',
                    '<div class="table-td">',
                    '<a class="attachment-file" data-id="{%=file.fileid%}" title="{%=file.name%}" download="{%=file.name%}">{%=file.name%}</a>',
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
        $('body')
            .append($downloadAttachmentTmpl)
            .append($uploadAttachmentTmpl);
    }
});