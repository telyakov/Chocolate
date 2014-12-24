<?
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
}