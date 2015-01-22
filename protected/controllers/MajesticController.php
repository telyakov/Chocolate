<?php

class MajesticController extends Controller
{
    public function filters()
    {
        return [
            'accessControl',
            'ajaxOnly images, test'];
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

        $resp = MajesticModel::images($sql);
        $resp->send();
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
