function ChFilter($filter) {
    this.$elem = $filter;
    this.chForm = null;
    this.autoRefresh = null;
    this.chFilterForm = null;
}
ChFilter.prototype._key = null;
ChFilter.prototype.getKey = function () {
    if (this._key === null) {
        this._key = this.$elem.attr('name');
    }
    return this._key;
};

/**
 * @returns {ChGridForm}
 */
ChFilter.prototype.getChForm = function(){
    if(this.chForm === null){
       this.chForm = facade.getFactoryModule().makeChGridForm(this.$elem.closest('.section-filters').siblings('.section-grid').children('form'));
    }
    return this.chForm;
};

/**
 * @returns {boolean}
 */
ChFilter.prototype.isAutoRefresh = function(){
    if(this.autoRefresh === null){
        var atr = this.$elem.attr(ChOptions.attributes.filterAutoRefresh);
        this.autoRefresh = typeof atr !== 'undefined';
    }
    return this.autoRefresh;
};

ChFilter.prototype.getNamesSelectedValues= function(){
    var names = [];
    var $inputs =  this.$elem.find('input:checked');
    $inputs.each(function(){
        names.push($(this).attr('value'));
    });
    return names;
};
/**
 * @returns {ChFilterForm}
 */
ChFilter.prototype.getChFilterForm = function(){
    if(this.chFilterForm === null){
        this.chFilterForm = facade.getFactoryModule().makeChFilterForm(this.$elem.closest('form'));
    }
    return this.chFilterForm;
};