<?php

class GridController extends Controller
{
    public function filters()
    {
        return ['accessControl'];
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