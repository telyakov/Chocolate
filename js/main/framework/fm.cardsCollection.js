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
FmCardsCollection.prototype._generateHeader = function (view) {
    var html = [
        '<header class="card-header">',
        '<div class="card-bottom-header card-error"></div>'
    ];
    if (this.hasHeader()) {
        html.push('<div class="card-top-header"><div class="card-header-left">');
        html.push(this.headerImage);
        html.push('</div><div class="card-header-right">');
        html.push(this.header);
        html.push('</div></div>');
    }
    if(chApp.getOptions().settings.topsViews.indexOf(view) !== -1){
        html.push('<menu class="menu"><button class="active menu-button card-menu-save"><span class="fa-save"></span><span>Сохранить</span></button></menu>');
    }
    html.push('</header>');
    return html.join('');

};
FmCardsCollection.prototype.generateTabs = function (view, pk, viewID, $panel) {
    $panel.html(this._generateHeader(view));
    this._generateList(view, pk, viewID, $panel);
};
/**
 * @param card {ChCard}
 */
FmCardsCollection.prototype.createSqlTasks = function (card, idList) {
    if (this.isVisibleCaptions()) {
        for (var key in this.cards) {
            if (this.cards.hasOwnProperty(key)) {
                var sql = jQuery.trim(this.cards[key].captionReadProc);
                if (sql) {
                    sql = facade.getBindModule().bindCardSql(sql, card);
                    chApp.getMain().createRequest({type: 'jquery', query: sql, id: idList[key]});
                }
            }
        }
    }
};
FmCardsCollection.prototype.isVisibleCaptions = function () {
    return Object.keys(this.cards).length > 1;
};
FmCardsCollection.prototype._generateList = function (view, pk, viewID, $panel) {

    var html = '<div data-id="grid-tabs"' +
        'data-view="' + view + '"' +
        'data-pk="' + pk + '"' + 'data-form-id="' + viewID + '"' +
        'data-save-url="/grid/save?view=' + view + '">';
    var isVisibleCaption = this.isVisibleCaptions();
    if (isVisibleCaption) {
        html += '<ul>';
    } else {
        html += '<ul class="hidden">';
    }
    var tabs = [];
    var tabIdList = {};
    for (var key in this.cards) {
        if (this.cards.hasOwnProperty(key)) {
            html += ' <li class="card-tab" data-id="' + key + '"';
            var id = Chocolate.uniqueID();
            html += ' aria-controls="' + id + '">';
            var tabID = Chocolate.uniqueID();
            tabIdList[key] = tabID;
            html += '<a id="' + tabID + '" href="1" title="' + key + '">' + this.cards[key].caption + '</a>';
        }
    }
    html += '</ul>';
    if (isVisibleCaption) {
        html += '<span class="tab-menu"><a class="tab-menu-link"></a></span>';
    }
    html += '</div>';
    $panel.append(html);

    var card = chApp.getFactory().getChCard($panel.children('[data-id=grid-tabs]'));
    if($.isNumeric(pk)){
        this.createSqlTasks(card, tabIdList);
    }

};
