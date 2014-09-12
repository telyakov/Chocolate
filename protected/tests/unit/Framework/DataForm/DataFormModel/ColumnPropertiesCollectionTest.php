<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 15.05.14
 * Time: 14:51
 */

class ColumnPropertiesCollectionTest extends UnitTestCase{

    protected function setUp()
    {
        parent::setUp();

    }
    public  function testProduction(){
        $obj = new \FrameWork\DataForm\DataFormModel\ColumnPropertiesCollection();
//        $obj->set('semen', new \FrameWork\DataForm\DataFormModel\ColumnProperties());
        $xml = new \FrameWork\XML\XML('tasks.xml');
        $columnPropertiesCollection= $xml->getData()->columnPropertiesCollection;
        $start = microtime(true);
        $i = 0;
        while($i<100){
            $columnPropertiesCollection->getColumn('id');
            $columnPropertiesCollection->getColumn('LastModifyDate');
            $i++;
        }
        $end = microtime(true) - $start;

        $start2 = microtime(true);
        $i = 0;
        while($i<100){
            $columnPropertiesCollection->getByKey('id');
            $columnPropertiesCollection->getByKey('lastmodifydate');
            $i++;

        }
        $end2 = microtime(true) - $start2;

        $tt=1;
    }
} 