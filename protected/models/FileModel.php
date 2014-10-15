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

    public function uploadFile($parentView, $parentID)
    {
        $response = new UploadResponse();
        try {
            if ($file = CUploadedFile::getInstance(new FileModel(), 'files')) {
                $attachmentsModel = Controller::loadForm(Attachments::VIEW, $parentView, $parentID);
                $data = $this->getFileInfo($file, $parentID, $attachmentsModel->getParentDataFormProperties()->getAttachmentsEntityTypeID());
                $routine = $attachmentsModel->getDataFormProperties()->getCreateProc();
                $routine = Yii::app()->bind->bindProcedureFromData($routine, new DataBaseParameters($data));
                Yii::app()->erp->attachmentIns($routine, $this->read($file));
                $response->setStatus('Файл успешно загружен на сервер.', Response::SUCCESS);

            } else {
                new HttpException('Не найден файл, загружаемый на сервер.');
            }
            return $response;

        } catch (Exception $e) {
            $response->setStatus('Возникла ошибка при загрузке вложения.', Response::ERROR);
            return $response;
        }
    }

    private function getFileInfo(CUploadedFile $file, $parentID, $entityTypeID)
    {
        return [
            'name' => $file->getName(),
            'Source' => $file->getTempName(),
            'description' => 'загружено через web-service',
            'FilesTypesID' => Yii::app()->request->getPost('FilesTypesID'),
            'FileDateTime' => date(Yii::app()->params['dateTimeFormat']),
            'OwnerLock' => Yii::app()->request->getPost('OwnerLock'),
            'userid' => Yii::app()->user->id,
            'ParentId' => $parentID,
            'EntityTypeID' => $entityTypeID
        ];
    }

    private function read(CUploadedFile $file)
    {
        $source = $file->getTempName();
        $handle = fopen($source, "r");
        $contents = fread($handle, filesize($source));
        fclose($handle);
        return $contents;
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
                'version' => $row['version'],
                'url' => Yii::app()->createAbsoluteUrl('Attachment/get',
                        [
                            'filesID' => $row['filesid'],
                            'view' => Attachments::VIEW,
                            'name' => $row['name']
                        ]
                    ),
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