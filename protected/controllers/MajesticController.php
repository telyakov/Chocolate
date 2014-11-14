<?php

class MajesticController extends Controller
{
    public function filters()
    {
        return [
            'accessControl',
            'ajaxOnly -export2Excel, images, test'];
    }

    public function accessRules()
    {
        return [
            ['allow', 'users' => ['@']],
            ['deny', 'users' => ['*']]
        ];
    }

    public function actionMakeCall($phoneTo){
        $response = Phone::makeCall($phoneTo);
        $response->send();
    }

    public function actionExecute($cache = false, $sql){
        $response = MajesticModel::execute($cache,$sql);
        $response->send();
    }

    public function actionQueueExecute(){
        $response = MajesticModel::packageExecute();
        $response->send();
    }

    public function actionFilterLayout($name, $view, $parentID){
        $model = Controller::loadForm($view);
        $collection = $model->getFilterSettingsCollection();
        $setting = $collection->getByKey($name);
        $this->renderPartial('//_filters/_fast', [
            'form' => new ChFilterForm(),
            'model' => $model,
            'settings' => $setting,
            'parentID' =>  $parentID
        ]);

    }
    public function actionImages($sql){

        $resp = MajesticModel::images($sql);
        $resp->send();
    }

    public function actionExport2Excel(){

        $data = json_decode(Yii::app()->request->getParam('data'), true);
        ExcelModel::export(
            Controller::loadForm($data['view']),
            $data['data'],
            $data['settings']
        );
        Yii::app()->end();
    }
//    public function actionTest(){
//        ini_set("soap.wsdl_cache_enabled", 0);
//        ini_set("soap.wsdl_cache_ttl", 1);
//            http://93.153.204.246:7001/6543210.asmx?op=FlatsGet
////        $client = new SoapClient('http://morozova-n/MyApp/ws/WebServiceHOPE?wsdl');
//        $client = new SoapClient('http://morozova-n/LST_Project/ws/Web_LST_Project?wsdl',   array(
//            'login'          => "user",
//            'password'       => "User2014"
//        ));
////        $client = new SoapClient('http://morozova-n/LST_Project/ws/Web_LST_Project?wsdl' );
//        $start = microtime(1);
//        $data = $client->LST_CFOList();
//        $end = microtime(1) - $start;
////        $data = $client->CompanyDel([
////            'Kod' => '',
////            'Name' => 'Поставщик3',
////            'INN' => '',
////            'KPP' => ''
////        ]);
//        echo 1;
//    }

}
