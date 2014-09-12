<?php

use FrameWork\DataBase\DataBaseAccessor;
class UnitTestCase extends CDbTestCase
{
    /**
     * @var $erp DataBaseAccessor
     */
    public $erp;

    protected function setUp()
    {
        parent::setUp();
        $this->erp =  Yii::app()->erp;
    }

}
