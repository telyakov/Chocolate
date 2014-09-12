<?php
/**
 * Created by JetBrains PhpStorm.
 * User: tselishchev
 * Date: 17.09.13
 * Time: 10:39
 */
Yii::import('webroot.protected.controllers.GridController');
class AttachmentController extends GridController{

    public function actionGet($filesID, $name = null){
        $data = FileModel::getFile($filesID);
        header('Content-type: application/octet-stream; charset=windows-1251');
        if($name){
            //Поддержка браузеров, не понимающих атрибут download
            header('Content-Disposition: attachment; filename='. rawurlencode($name) );
        }
       echo $data;
    }

    public function actionUpload($ParentView, $ParentID )
    {
        $model = new FileModel();
        $response = $model->uploadFile($ParentView, $ParentID );
        $response->send();
    }



}