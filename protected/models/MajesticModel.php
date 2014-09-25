<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 25.02.14
 * Time: 16:00
 */
use Chocolate\Http\PackageResponse;
use Chocolate\Http\Response;
use FrameWork\DataBase\DataBaseRoutine;

class MajesticModel
{

    public static function packageExecute()
    {
        $result = [];
        $response = new PackageResponse();
        $package = Yii::app()->request->getPost('package');
        foreach ($package as $item) {
            $id = $item['id'];
            $type = $item['type'];
            $params = $item['params'];
            $sql = $params['sql'];
            $view = $params['view'];
            $parentView = $params['parentView'];
            $parentID = $params['parentID'];
            $model =Controller::loadForm($view,$parentView, $parentID);

            try {
                $recordset = Yii::app()->erp->exec(new DataBaseRoutine($sql));
                $data = $recordset->rawUrlEncode();
                $result[] = [
                    'id' => $id,
                    'type' => $type,
                    'data' => $data,
//                    'preview' => $model->getPreviewData($recordset),
//                    'preview' => $model->getPreview(),
                    'order' => $recordset->getOrder()
                ];
            } catch (Exception $e) {

            }

        }
        $response->setData($result);
        return $response;
    }

    public static function execute($cache, $sql)
    {
        $response = new Response();
        try {
            $routine = new DataBaseRoutine($sql);
            if(!$routine->isSuccessBinding()){

                $routine = Yii::app()->bind->bindProcedureFromData($routine, new \FrameWork\DataBase\DataBaseParameters());
            }
            if ($cache) {
                if (!$recordset = Yii::app()->cache->getRoutineData($routine)) {
                    $recordset = Yii::app()->erp->exec($routine);
                    Yii::app()->cache->setRoutineData($routine, $recordset);
                }
                $response->setData($recordset->rawUrlEncode());

            } else {
                $response->setData(Yii::app()->erp->exec($routine)->rawUrlEncode());
            }

            $response->setStatus('Успешно выполнено.', Response::SUCCESS);
            return $response;
        } catch (Exception $e) {
            $response->setStatus($e->getMessage(), Response::ERROR);
            return $response;
        }
    }

}