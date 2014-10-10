var ChOptions = {
    tablesorter: {
        output: "с {startRow} по {endRow} ({totalRows})",
        size: 40
    },
    attributes:{
      filterAutoRefresh: 'data-auto-ref'
    },
    constants: {
      multiTaskService: 81
    },
    settings: {
        key:'6543210',
        taskWizardSelector: '[href$=TasksWizard]',
        defaultColumnsWidth: '150',
        defaultAutoUpdateMS: 100000,
        formatDate: 'YYYY.MM.DD HH:mm:ss',
        signatureFormat: 'DD.MM.YYYY HH:mm',
        emailCol: 'emails',
        systemCols: ['lastmodifier', 'lastmodifydate', 'insdate', 'username' , 'userid']
    },
    keys: {
      controlColumn: 'chocolate-control-column'
    },
    sql:{
      getForms: 'core.UserFormsGet :userid',
      getRoles: 'core.UserRolesGet :userid',
      types:{
          forms: 'forms',
          roles: 'roles'
      },
      params:{
          userID: ':userid'
      }
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
        notChanged: 'not-changed',
        menuButtonSelected: 'menu-button-selected',
        searchedColumn: 'grid-column-searched'
    },
    urls:{
        webSocketServer: 'http://192.168.0.34:3000',
        addRow: '/grid/insertRow',
        export2excel: '/majestic/export2excel',
        cardGet: '/grid/cardDataGet',
        makeCall: '/majestic/makeCall',
        childGrid: '/grid/getChildGrid',
        execute: '/majestic/execute',
        queueExecute: '/majestic/queueExecute',
        filterLayouts: '/majestic/filterLayout',
        formSearch: '/grid/search',
        formSave: '/grid/save',
        bpOneTask: 'http://bp.78stroy.ru/grid/searchByID?view=tasks%5Ctasksfortops.xml&id='
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