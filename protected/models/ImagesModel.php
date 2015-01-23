<?
use Chocolate\Exceptions\FileSystemException;
use \FrameWork\DataBase\RecordsetRow;

class ImagesModel
{
    private $sql;

    public function __construct($sql)
    {
        $this->sql = $sql;
    }

    public function getImagesLinks()
    {
        $recordset = Yii::app()->erp->exec($this->sql);
        $data = [];
        /**
         * @var $row RecordsetRow
         */
        foreach ($recordset as $row) {
            $data[] = self::getFileSrc($row->id);
        }
        return $data;
    }

    /**
     * @param $id
     * @throws FileSystemException
     * @return String
     */
    private static function getFileSrc($id)
    {
        self::save($id);
        /**
         * @var $model Files|null
         */
        $model = Files::model()->findByAttributes(['file_id' => $id]);
        if ($model) {
            return substr($model->src, strlen(Yii::app()->getBasePath() . '/..'));
        } else {
            throw new FileSystemException("File not found in db(id: $id)");
        }
    }

    private static function save($id)
    {
        $row = Yii::app()->erp->fileMetaDataGet($id)->getFirst();
        $rawDate = $row['date'];
        $dateTime = DateTime::createFromFormat(Yii::app()->params['date_form_soap_format'], $rawDate);
        /**
         * @var $model Files|null
         */
        $model = Files::model()->findByAttributes(['file_id' => $id]);
        if ($model === null || $model->isFileChanged($dateTime)) {
            $data = Yii::app()->erp->fileGet($id);
            if ($model === null) {
                $name = $row['name'];
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
        }
    }
}