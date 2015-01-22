<?
use Chocolate\Exceptions\FileSystemException;
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
                $data[] = self::getFileSrc($row->id);
            }
            $response->setData($data);
            $response->setStatus('Успешно выполнено.', Response::SUCCESS);
            return $response;
        } catch (Exception $e) {
            $response->setStatus($e->getMessage(), Response::ERROR);
            return $response;
        }
    }
    static function getFileSrc($id){
        //todo: отрефакторить + индекс в таблицу
        self::getFile($id);
        /**
         * @var $model Files|null
         */
        $model  = Files::model()->findByAttributes(['file_id' => $id]);
        if($model){
            return substr($model->src, strlen(Yii::app()->getBasePath() . '/..'));
        }else{
            Yii::log('Ошибка в получении src файла');
            return null;
        }
    }
    static function getFile($id)
    {
        try {

            $row= Yii::app()->erp->fileMetaDataGet($id)->getFirst();
            $rawDate = $row['date'];
            $name = $row['name'];
            $dateTime = DateTime::createFromFormat(Yii::app()->params['date_form_soap_format'], $rawDate);
            /**
             * @var $model Files|null
             */
            $model = Files::model()->findByAttributes(['file_id' => $id]);
            if ($model === null || $model->isFileChanged($dateTime)) {
                $data = Yii::app()->erp->fileGet($id);
                if ($model === null) {
                    $model = new Files();
                    $model->file_id = $id;
                    $model->src = $model->createSrc($name);
                }
                $model->date_change = $dateTime->format(Files::TIMESTAMP_FORMAT);
                if ($fp = fopen($model->src, "w")) {
                    fwrite($fp, $data);
                    fclose($fp);
                } else {
                    throw new FileSystemException(sprintf('Недостаточно прав на открытие файла %s', $model->src));
                }
                $model->save();
                return $data;

            } else {
                $file = $model->src;
                if (file_exists($file)) {
                    if ($fp = fopen($file, "r")) {
                        $contents = fread($fp, filesize($file));
                        fclose($fp);
                        return $contents;
                    } else {
                        throw new FileSystemException(sprintf('Не удалось открыть файл %s', $file));
                    }
                }else{
                    if ($fp = fopen($model->src, "w")) {
                        $data = Yii::app()->erp->fileGet($id);
                        fwrite($fp, $data);
                        fclose($fp);
                        return $data;
                    } else {
                        throw new FileSystemException(sprintf('Недостаточно прав на открытие файла %s', $model->src));
                    }
                }
            }

        } catch (Exception $e) {
            Yii::log($e->getMessage(), CLogger::LEVEL_ERROR);
            return Yii::app()->erp->fileGet($id);
        }
    }
}