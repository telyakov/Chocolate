<?php
/**
 * Created by JetBrains PhpStorm.
 * User: tselishchev
 * Date: 17.09.13
 * Time: 10:39
 */
Yii::import('webroot.protected.controllers.GridController');
class AttachmentController extends GridController{

    public function actionUpload($ParentView, $ParentID )
    {
        $model = new FileModel();
        $response = $model->uploadFile($ParentView, $ParentID );
        $response->send();
    }



}