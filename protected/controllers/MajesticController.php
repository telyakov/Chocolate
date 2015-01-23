<?php

class MajesticController extends Controller
{
    public function filters()
    {
        return ['accessControl'];
    }

    public function accessRules()
    {
        return [
            ['allow', 'users' => ['@']],
            ['deny', 'users' => ['*']]
        ];
    }

    public function actionImages($sql)
    {
        $model = new ImagesModel($sql);
       echo json_encode($model->getImagesLinks());
    }

}
