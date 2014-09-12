var ChOptions = {
    tablesorter: {
        output: "с {startRow} по {endRow} ({totalRows})",
        size: 40
    },
    attributes:{
      filterAutoRefresh: 'data-auto-ref'
    },
    settings: {
        taskWizardSelector: '[href$=TasksWizard]',
        defaultColumnsWidth: '150',
        defaultAutoUpdateMS: 100000,
        formatDate: 'yyyy.mm.dd HH:MM:ss',
        signatureFormat: 'dd.mm.yyyy HH:MM',
        systemCols: ['lastmodifier', 'lastmodifydate', 'insdate', 'username' , 'userid']
    },
    keys: {
      controlColumn: 'chocolate-control-column'
    },
    classes: {
        allowHideColumn :'data-col-hide',
        hiddenAllColsTable: 'ch-hide',
        hiddenSystemColsTable: 'ch-hide-system',
        activeRow: 'row-active',
        selectedRow: 'row-selected',
        filterSection: 'section-filters',
        gridSection: 'section-grid',
        headerSection: 'section-header',
        selectedMouseArea: 'sel-mouse',
        selectedKeyboardArea: 'sel-keyboard',
        selectedArea: 'sel-area',
        filterClass: 'filter-item',
        activeTab: 'ui-tabs-active',
        card: 'chocolate-card',
        tabMenuClass: 'ui-tabs-nav',
        staticCardElement: 'card-static',
        ipLink: 'fm-iplink',
        notChanged: 'not-changed'
    },
    urls:{
        addRow: '/grid/insertRow',
        export2excel: '/majestic/export2excel',
        cardGet: '/grid/cardDataGet',
        makeCall: '/majestic/makeCall',
        childGrid: '/grid/getChildGrid',
        execute: '/majestic/execute',
        queueExecute: '/majestic/queueExecute',
        filterLayouts: '/majestic/filterLayout',
        formSearch: '/grid/search',
        formSave: '/grid/save'
    },
    labels:{
        attention: 'attention',
        not_view: 'not-view'
    },
    messages:{
        ru: {
            projectName: 'Шоколад',
            chocolateHasChange: 'ВНИМАНИЕ! У Вас есть несохраненные изменения. В результате перехода они могут быть потеряны.',
            refreshForm: 'Сохранить изменения?',
            Yes: 'Да',
            No: 'Нет',
            Cancel: 'Отмена',
            Delete: 'Удалить',
            NotFilledRequiredFields: 'Заполнены не все обязательные поля',
            records: 'записей'
        }
    }
};