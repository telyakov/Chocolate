<?php
class GridController extends Controller
{
//    public $navigation = array();
    protected $view;

    public function __construct($id, $module = null)
    {
        parent::__construct($id, $module);
        if (isset($_GET['view'])) {
            $this->view = $_GET['view'];
        } else {
            throw new CHttpException(400,
                'Некорректный запрос. Не указано имя xml-файла для построения сетки.'
            );
        }
    }

    public function filters()
    {
        return [
            'accessControl',
            'ajaxOnly +index, search, getChildGrid, save, cardDataGet, insertRow, upload'
        ];
    }

    public function accessRules()
    {
        return [
            array('allow', 'users' => array('@')),
            array('deny', 'users' => array('*'))
        ];
    }

    public function actionIndex()
    {
        $model = Controller::loadForm($this->view);
        $this->renderPartial('index', ['model' => $model], false, true);
    }

    public function actionSearch($ParentView = null)
    {
        $model = Controller::loadForm($this->view, $ParentView,  Yii::app()->request->getPost('ParentID'));
        $model->attributes = Yii::app()->request->getPost('GridForm');
        $response = $model->getSearchResponse();
        $response->send();
    }

    public function actionSearchByID($id){
        $model = Controller::loadForm($this->view);
        $model->filters['idlist'] = $id;
        $this->render('index', ['model' => $model]);
    }

    public function actionGetChildGrid($jsonFilters, $ParentView, $parentViewID)
    {
        $ParentID = json_decode($jsonFilters, true)['filters']['ParentID'];
        $model = Controller::loadForm($this->view,$ParentView, $ParentID);
        $model->attributes = array('filters' => array('parentid' => $ParentID));
        $response = $model->getGridResponse($parentViewID);
        $response->send();
    }

    public function actionSave($parentView = null, $parentID = null)
    {
        $model = Controller::loadForm($this->view, $parentView, $parentID);
        $response = $model->save();
        $response->send();
    }

    public function actionInsertRow()
    {
        $model = Controller::loadForm($this->view);
        $response = $model->insertRow();
        $response->send();
    }

    public function actionCardDataGet($pk, $tabID, $viewID)
    {
        $model = Controller::loadForm($this->view);
        $this->renderPartial('//components/_card',
            [
                'card' => $model->getCard($tabID),
                'view' => $this->view,
                'pk' => $pk,
                'viewID' => $viewID,
                'CardElementSettingsCollection' => $model->getCardElementsSettings($tabID)
            ], false, true);
    }

}