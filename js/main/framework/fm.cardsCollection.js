function FmCardsCollection(header, headerImage, cards) {
    this.header = header;
    this.headerImage = headerImage;
    this.cards = cards;
    this.templates = [];
    this.templatesNewRow = [];
}
/**
 *
 * @param cardKey
 * @param template
 * @param isNewRow {int}
 */
FmCardsCollection.prototype.setCardTemplate = function (cardKey, template, isNewRow) {
    if (isNewRow) {
        this.templatesNewRow[cardKey] = template;
    } else {
        this.templates[cardKey] = template;
    }
};
/**
 *
 * @param cardKey
 * @param isNewRow {int}
 * @returns {*}
 */
FmCardsCollection.prototype.getCardTemplate = function (cardKey, isNewRow) {
    if (isNewRow) {
        if (this.templatesNewRow && typeof this.templatesNewRow[cardKey] !== 'undefined') {
            return this.templatesNewRow[cardKey];
        }
        return null;
    } else {
        if (this.templates && typeof( this.templates[cardKey]) !== 'undefined') {
            return this.templates[cardKey];
        }
        return null;
    }
};
FmCardsCollection.prototype.hasHeader = function () {
    return this.header || this.headerImage;
};
FmCardsCollection.prototype._generateHeader = function () {
    var html = '<header class="card-header">';
    html += '<div class="card-bottom-header card-error"></div>';
    if (this.hasHeader()) {
        html += '<div class="card-top-header"><div class="card-header-left">';
        html += this.headerImage;
        html += '</div><div class="card-header-right">';
        html += this.header;
        html += '</div></div>';
    }
    html += '<menu class="menu"><button class="active menu-button card-menu-save"><span class="fa-save"></span><span>Сохранить</span></button></menu>';
    html += '</header>';
    return html;

};
FmCardsCollection.prototype.generateTabs = function (view, pk, viewID) {
    return this._generateHeader() + this._generateList(view, pk, viewID);

};
FmCardsCollection.prototype._generateList = function (view, pk, viewID) {

    var html = '<div data-id="grid-tabs"' +
        'data-view="' + view + '"' +
        'data-pk="' + pk + '"' + 'data-form-id="' + viewID + '"' +
        'data-save-url="/grid/save?view=' + view + '">';
    if (Object.keys(this.cards).length > 1) {
        html += '<ul>';
    } else {
        html += '<ul class="hidden">';
    }
    var tabs = [];
    for (var key in this.cards) {
        if (this.cards.hasOwnProperty(key)) {
            html += ' <li class="card-tab" data-id="' + key + '"';
            var id = Chocolate.uniqueID();
            html += ' aria-controls="' + id + '">';
            html += '<a href="1" title="' + key + '">' + this.cards[key].caption + '</a>';
        }
    }
    html += '</ul>';
    if (Object.keys(this.cards).length > 1) {
        html += '<span class="tab-menu"><a class="tab-menu-link"></a></span>';
    }
    html += '</div>';
    return html;
};
