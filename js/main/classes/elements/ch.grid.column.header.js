
/**
 * Класс, представляющий столбец таблицы
 */
function ChGridColumnHeader($cell) {
    this._key = null;
    this.$cell = $cell;
    this._is_changed = null;
    this._is_grid_type = null;
    this._class = null;
}
ChGridColumnHeader.prototype = {
    getKey: function () {
        if (this._key == null) {
            this._key = this.$cell.attr('data-id');
        }
        return this._key;
    },
    isChanged: function () {
        if (this._is_changed == null) {
            if (this.$cell.attr('data-changed') == 0) {
                this._is_changed = false;
            } else {
                this._is_changed = true;
            }
        }
        return this._is_changed;
    },
    isNotChanged: function () {
        return !this.isChanged();
    },
    isGridType: function () {
        if (this._is_grid_type == null) {
            if (this.$cell.attr('data-grid-button') == 1) {
                this._is_grid_type = true;
            } else {
                this._is_grid_type = false;
            }
        }
        return  this._is_grid_type;
    },
    getClass: function () {
        if (this._class == null) {
            var class_name = '';
            if (this.isNotChanged()) {
                class_name += 'not-changed';
            }
            if (this.isGridType()) {
                class_name += ' grid-button';
            }
            this._class = class_name;

        }
        return this._class;

    },
    getTemplate: function () {
        var template = ChGridForm.TEMPLATE_TD;
        if(this.$cell.css('display')!="none"){
            template =template.replace('style', '');
        }else{
            template =template.replace('style', 'style="display:none;"');
        }
        return template.replace(/\{class\}/g, this.getClass());
    }
};