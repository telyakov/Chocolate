function SelectExecutorsTaskStep() {
    MajesticWizardMethod.apply(this, arguments);
}
SelectExecutorsTaskStep.prototype = Object.create(MajesticWizardMethod.prototype);
SelectExecutorsTaskStep.prototype.done =  function (mjWizard, $content) {
    var selected_nodes = $content.find('.widget-tree').dynatree("getSelectedNodes");
    var val = '', select_html = '';
    mjWizard.usersidlist = '';
    mjWizard.usersTitle = '';
    for (var i in selected_nodes) {
        var data = selected_nodes[i].data;
        mjWizard.usersidlist += data.id + '|';
        if(mjWizard.usersTitle){
            mjWizard.usersTitle += '/';
        }
        mjWizard.usersTitle += data.title;
    }
    mjWizard.next();
};
SelectExecutorsTaskStep.prototype.run = function (mjWizard) {
    var _this = this;
    if(chApp.getOptions().constants.multiTaskService == mjWizard.serviceid){
        mjWizard.next();
    }else{

    jQuery.get(
        MajesticVars.EXECUTE_URL,
        {cache: true, sql: 'tasks.uspGetUsersListForTasksUsers'},
        function (response) {
            var ch_response = new ChResponse(response);
            var data = ch_response.getData();
            var $content = $('<div><div class="widget-header"><div class="widget-titles">Выберите исполнителей</div><div class="widget-titles-content">Пожалуйста, выберите исполнителей вашего поручения</div></div></div>'),
                $select = $('<div class="wizard-select2"></div>');

            var dynatreeElem = facade.getFactoryModule().makeChDynatree($select);
            var options = [];
            options.getInput = function(){return $select;};
            options.isDialogEvent = false;
            options.defaultValues = function(){return mjWizard.usersidlist;};
            options.children = data;
            options.column_title = 'name';
            options.root_id = 'parentid';
            options.column_id = 'id';
            options.infoPanel = true;
            options.separator = '|';
            options.checkbox = true;
            var $newCont = dynatreeElem.build(options);
            openWizardDialog($newCont, mjWizard, _this, true, 'Выберните исполнителей '+mjWizard.getStepCaption());
            var $checkbox = $('<span class="tree-checkbox"><input type="checkbox"><span class="tree-checkbox-caption">Выделить все</span></span>');
            $newCont.next().prepend($checkbox);
            ChDynatree.prototype.checkboxClickEvent($checkbox, $newCont.find('.widget-tree'))
        }

    );

    }
};