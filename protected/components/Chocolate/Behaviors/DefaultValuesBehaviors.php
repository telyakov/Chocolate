<?php
/**
 * Created by JetBrains PhpStorm.
 * User: tselishchev
 * Date: 16.09.13
 * Time: 16:47
 */

class DefaultValuesBehaviors extends \CActiveRecordBehavior
{
    public $UserID = 'UserID';
    public $InsDate = 'InsDate';
    public function beforeSave($event)
        //TODO: регистры привести в порядок и дату из глобальной константы(формат)
    {
        if($this->owner->isNewRecord){
            $this->owner->{$this->UserID} = \Yii::app()->user->getID();
            $this->owner->{$this->InsDate} = date("Y-m-d H:i:s");
        }
    }
}