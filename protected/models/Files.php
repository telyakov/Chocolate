<?php

/**
 * This is the model class for table "files".
 *
 * The followings are the available columns in table 'files':
 * @property integer $id
 * @property integer $file_id
 * @property string $src
 * @property string $date_change
 */
class Files extends CActiveRecord
{
    const TIMESTAMP_FORMAT = 'Y-m-d H:i:s';

    /**
     * Returns the static model of the specified AR class.
     * Please note that you should have this exact method in all your CActiveRecord descendants!
     * @param string $className active record class name.
     * @return Files the static model class
     */
    public static function model($className = __CLASS__)
    {
        return parent::model($className);
    }

    /**
     * @return string the associated database table name
     */
    public function tableName()
    {
        return 'files';
    }

    public function isFileChanged(DateTime $time)
    {
        return $time->format(self::TIMESTAMP_FORMAT) !== $this->date_change;
    }

    /**
     * @return array validation rules for model attributes.
     */
    public function rules()
    {
        return array(
            array('file_id, src', 'required'),
            array('file_id', 'numerical', 'integerOnly' => true),
            array('src', 'length', 'max' => 1000),
            array('date_change', 'safe'),
        );
    }

    public function createSrc($name)
    {
        return Yii::app()->getBasePath() . '/../files/' . uniqid() . $name;
    }

    /**
     * @return array customized attribute labels (name=>label)
     */
    public function attributeLabels()
    {
        return array(
            'id' => 'ID',
            'file_id' => 'File',
            'src' => 'Src',
            'date_change' => 'Date Change',
        );
    }
}
