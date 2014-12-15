var CardElement = (function (Backbone, helpersModule, FilterProperties, bindModule) {
    'use strict';
    return Backbone.Model.extend({
        labelTemplate: _.template([
                '<label for="<%= id%>" class="<%= class%>"><%= caption%></label>'
            ].join('')
        ),
        defaults: {
            collection: null,
            column: null,
            key: null
        },
        getMinHeight: function () {
            return 42;
        },
        isStatic: function () {
            return true;
        },
        isSingle: function () {
            return this.get('column').isSingle();
        },

        getName: function () {
            return this.get('column').getVisibleKey();
        },

        renderEndData: function () {
            return '</div>';
        },
        processBeforeRender: function (id) {
            return this.labelTemplate({
                id: id,
                caption: this.getCaption(),
                'class': this.isRequired() ? 'required' : null
            });
        },
        getCaption: function () {
            return this.get('column').getVisibleCaption();
        },
        isRequired: function () {
            return this.get('column').isRequired();
        },

        renderBeginData: function () {
            return '<div class="card-input ' + this.getEditClass() + '">';
        },

        getEditClass: function () {
            if (this.getAllowEdit()) {
                return '';
            }
            return 'card-input-no-edit';
        },

        getAllowEdit: function () {
            return this.get('column').getRawAllowEdit();
        },

        getType: function () {
            return this.get('column').getCardEditType();
        },

        getX: function () {
            return this.get('column').getCardX();
        },
        posY: null,
        getY: function () {
            if (this.posY) {
                return this.posY;
            }
            var posY = this.getRecursiveY(0, this.get('column'));
            this.posY = posY;
            return posY;
        },

        getRecursiveY: function (curPosY, columnRO) {
            var posY = columnRO.getCardY();
            if(posY.indexOf('+') !== -1){
                var matches = posY.split('+'),
                    parentKey = matches[0].toLowerCase(),
                    digit = matches[1],
                    parentColumnRO = this.get('collection').findWhere({
                        key: parentKey
                    });
                return this.getRecursiveY(curPosY + digit, parentColumnRO);
            }else{
                return curPosY + posY;
            }
        },

        getHeight: function () {
            return this.get('column').getCardHeight();
        },

        getWidth: function () {
            return this.get('column').getCardWidth();
        },

        render: function (event) {
            var x = 111,
                y = 11,
                html = 'sdw',
                callback = function () {
                    console.log('call');
                };
            var response = {
                x: x,
                y: y,
                html: html,
                callback: callback
            };
            $.publish(event, response);
        }
    });
})(Backbone, helpersModule, FilterProperties, bindModule);