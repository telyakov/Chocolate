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
            'ajaxOnly +index, save, upload'
        ];
    }

    public function accessRules()
    {
        return [
            array('allow', 'users' => array('@')),
            array('deny', 'users' => array('*'))
        ];
    }

    public function actionSearchByID()
    {
        $this->render('//site/default');
    }
}