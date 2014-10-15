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
	 * @return string the associated database table name
	 */
	public function tableName()
	{
		return 'files';
	}

    public function isFileChanged(DateTime $time){
//        $r1 =$time->diff(DateTime::createFromFormat(self::TIMESTAMP_FORMAT, $this->date_change));
        return $time->format(self::TIMESTAMP_FORMAT) !== $this->date_change;
    }
	/**
	 * @return array validation rules for model attributes.
	 */
	public function rules()
	{
		// NOTE: you should only define rules for those attributes that
		// will receive user inputs.
		return array(
			array('file_id, src', 'required'),
			array('file_id', 'numerical', 'integerOnly'=>true),
			array('src', 'length', 'max'=>1000),
			array('date_change', 'safe'),
		);
	}

    public  function createSrc($name){
        return Yii::app()->getBasePath(). '/../files/'.uniqid().$name;
    }
    /**
	 * @return array relational rules.
	 */
	public function relations()
	{
		// NOTE: you may need to adjust the relation name and the related
		// class name for the relations automatically generated below.
		return array(
		);
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

	/**
	 * Retrieves a list of models based on the current search/filter conditions.
	 *
	 * Typical usecase:
	 * - Initialize the model fields with values from filter form.
	 * - Execute this method to get CActiveDataProvider instance which will filter
	 * models according to data in model fields.
	 * - Pass data provider to CGridView, CListView or any similar widget.
	 *
	 * @return CActiveDataProvider the data provider that can return the models
	 * based on the search/filter conditions.
	 */
	public function search()
	{
		// @todo Please modify the following code to remove attributes that should not be searched.

		$criteria=new CDbCriteria;

		$criteria->compare('id',$this->id);
		$criteria->compare('file_id',$this->file_id);
		$criteria->compare('src',$this->src,true);
		$criteria->compare('date_change',$this->date_change,true);

		return new CActiveDataProvider($this, array(
			'criteria'=>$criteria,
		));
	}

	/**
	 * Returns the static model of the specified AR class.
	 * Please note that you should have this exact method in all your CActiveRecord descendants!
	 * @param string $className active record class name.
	 * @return Files the static model class
	 */
	public static function model($className=__CLASS__)
	{
		return parent::model($className);
	}
}
