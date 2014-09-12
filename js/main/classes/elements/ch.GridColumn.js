function ChGridColumn($elem ){
    this.$elem = $elem;
}
ChGridColumn.createChildGridTabID= function (parent_id, view, parent_view) {
    return parent_id + "_" + parent_view.replace('.', '_').replace('/', '_') + '_' + view.replace('.', '_').replace('/', '_');
};
ChGridColumn.prototype.init = function(e, view, caption, url, editable ){
    editable.disable();
    var factory = chApp.namespace('factory'),
        column = new ChGridColumnBody(this.$elem),
        parentID = column.getID(),
        isNew = !$.isNumeric(parentID),
        form = factory.getChGridForm(this.$elem.closest('form')),
        filters_data = {filters:{ParentID: parentID}},
        parent_view_id = form.getID(),
        parent_view = form.getView(),
        tab_id = this.createChildGridTabID(parentID, view, parent_view),
        jTabs = Chocolate.$tabs;
    console.log(view, caption, url, editable)
    this.$elem.parents("td").on("click", function(){
        console.log('click')
        var template = form.getFmChildGridCollection().getCardTemplate(view, parent_view, isNew);
        var jTab = jTabs.find("[aria-controls=\'"+tab_id+"\']");
        if(jTab.length == 0) {
            var caption2 = caption + ' [' + parentID + ']';
            Chocolate.tab.add(tab_id, caption2);
            var lastTabIndex = jTabs.tabs("length");
            jTabs.tabs({ active: lastTabIndex -1});
            if(template == null){


                $.ajax({
                    method: 'GET',
                    url:  url,
                    cache: false,
                    data: {
                        view: view,
                        jsonFilters:JSON.stringify(filters_data),
                        ParentView: parent_view,
                        parentViewID: parent_view_id
                    },
                    success: function (response) {

                        var ch_response = new ChGridResponse(response);
                        if(ch_response.isSuccess()){
                            var jContainer = $("<div id="+ tab_id+ "></div>")
                            jTabs.append(jContainer)
                            var data =ch_response.getData();
                            jContainer.html(data.replace(Chocolate.ID_REG_EXP, parentID))
                            jTabs.tabs("refresh");
                            form.getFmChildGridCollection().setCardTemplate(view, parent_view, data, isNew);
                        }else{
                            alert(ch_response.getStatusMsg);
                        }

                    },
                    error: function (xhr, status, error) {
                        alert(xhr.responseText);
                    }
                });
            }else{
                var data = template.replace(Chocolate.ID_REG_EXP, parentID);
                var jContainer = $("<div id="+ tab_id+ "></div>");
                jTabs.append(jContainer);
                jContainer.html(data)
            }
        }else{
            jTabs.tabs("select", tab_id)
        }
    });
}