function FmChildGridCollection() {
}
FmChildGridCollection.prototype.templates = [];
FmChildGridCollection.prototype.templatesForNewRow = [];
/**
 *
 * @param template
 * @param isNewRow {int}
 */
FmChildGridCollection.prototype.setCardTemplate = function(view,  ParentView, template, isNewRow){
    if(isNewRow){
        this.templatesForNewRow[view + ParentView] = template;
    }else{
        this.templates[view + ParentView] = template;
    }
};
/**
 *
 * @param isNewRow {int}
 * @returns {*}
 */
FmChildGridCollection.prototype.getCardTemplate = function(view,  ParentView, isNewRow){
    if(isNewRow){
        if(this.templatesForNewRow && typeof( this.templatesForNewRow[view + ParentView]) != 'undefined'){
            return this.templatesForNewRow[view + ParentView];
        }
        return null;
    }else{
        if(this.templates && typeof( this.templates[view + ParentView]) != 'undefined'){
            return this.templates[view + ParentView];
        }
        return null;
    }
};
