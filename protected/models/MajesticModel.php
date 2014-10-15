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
use \FrameWork\DataBase\RecordsetRow;

class MajesticModel
{

    public static function images($sql)
    {
        $response = new Response();
        try {
            $routine = new DataBaseRoutine($sql);
            if (!$routine->isSuccessBinding()) {

                $routine = Yii::app()->bind->bindProcedureFromData($routine, new \FrameWork\DataBase\DataBaseParameters());
            }
            $recordset = Yii::app()->erp->exec($routine);
            $data = [];
            /**
             * @var $row RecordsetRow
             */
            foreach ($recordset as $row) {
                $data[] = FileModel::getFileSrc($row->id);
            }
            $response->setData($data);
            $response->setStatus('Успешно выполнено.', Response::SUCCESS);
            return $response;
        } catch (Exception $e) {
            $response->setStatus($e->getMessage(), Response::ERROR);
            return $response;
        }
    }

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
            try {
                $recordset = Yii::app()->erp->exec(new DataBaseRoutine($sql));
                $data = $recordset->rawUrlEncode();
                $result[] = [
                    'id' => $id,
                    'type' => $type,
                    'data' => $data,
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
            if (!$routine->isSuccessBinding()) {

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