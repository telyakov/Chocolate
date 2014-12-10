var FormColumnRO = (function (Backbone, helpersModule, FilterProperties, bindModule) {
    'use strict';
    return ColumnRO.extend({
        getHeaderOptions: function(){
            var options = CheckBoxColumnRO.__super__.getHeaderOptions.apply(this, arguments);
            options['data-grid-button'] = 1;

            return options;
        },
        getClass: function () {
            var class_name = '';
            if (!this.isEdit()) {
                class_name += 'not-changed';
            }
            class_name += ' grid-button';
            return class_name;
        },
        getJsFn: function ($cnt) {
            var _this = this,
                allowEdit = this.getRawAllowEdit();
            return function () {
                $cnt.find('[rel$="' + _this.get('key') + '"]')
                    .editable({
                        mode: 'inline',
                        name: _this.get('key'),
                        showbuttons: false,
                        onblur: 'submit',
                        disabled: true,
                        type: 'text',
                        title: _this.getVisibleCaption(),
                        view: _this.getView(),
                        fromID: _this.getFromId(),
                        fromName: _this.getFromName(),
                        toName: _this.getToName(),
                        toID: _this.getToId()
                    })
                ;
            };
        }

    });
})(Backbone, helpersModule, FilterProperties, bindModule);