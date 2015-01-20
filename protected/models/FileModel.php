<?php
use Chocolate\Http\Response;
use Chocolate\Http\UploadResponse;
use ClassModules\Attachments;
use FrameWork\DataBase\DataBaseParameters;
use FrameWork\DataBase\Recordset;
use FrameWork\DataBase\RecordsetRow;
use \Chocolate\Exceptions\FileSystemException;

class FileModel extends CFormModel
{
    public $Id;
    public $Name;
    public $FilePartID;
    public $FileData;
    public $FileExt;
    public $ChangeDate;
    /**
     * @var $files Array - в формате, необходимом для ChFileUpload
     */
    protected $files;
    /**
     * @var $recordset Recordset
     */
    protected $recordset;

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

    public function rules()
    {
        return array(
            array('Id, FilePartID', 'numerical', 'integerOnly' => true),
            array(' Name, FileData, FileExt,ChangeDate', 'safe'),
        );
    }

    /**
     * @return Array
     */
    public function getFiles()
    {
        if ($this->files == null) {
            $this->files = self::recordset2arr($this->recordset);
        }
        return $this->files;
    }

    public static function recordset2arr(Recordset $recordset)
    {
        $result = [];
        /**
         * @var $row RecordsetRow
         */
        foreach ($recordset as $row) {
            if ($row['insdate']) {
                $insDate = DateTime::createFromFormat('m.d.Y H:i:s', $row['insdate']);
                $insDate = $insDate->format('d.m.Y H:i');
            } else {
                $insDate = '';
            }
            $result[] = [
                'id' => $row->id,
                'name' => $row['name'],
                'fileid' => $row['filesid'],
                'version' => $row['version'],
                'insusername' => $row['insusername'],
                'insdate' => $insDate
            ];
        }

        return $result;
    }

    public function setRecordset(Recordset $recordset)
    {
        $this->recordset = $recordset;
    }
}