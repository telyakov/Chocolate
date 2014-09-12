<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 23.04.14
 * Time: 14:06
 */
Yii::import('webroot.protected.controllers.GridController');
class CanvasController extends GridController {

    public function actionIndex()
    {
        $model = Controller::loadForm($this->view);
        $this->renderPartial('index', ['model' => $model], false, true);
    }
} 