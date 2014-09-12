<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 20.01.14
 * Time: 10:41
 */
use FrameWork\DataBase\DataBaseParameters;
class DataBaseParametersTest extends UnitTestCase{
    function testConstruct(){

        $key1 = 'Ключ1';
        $key2 ='key2';
        $value1 = 'value1';
        $value2 = 'Значение2';
        $data = [ $key1=> $value1, $key2 => $value2];
        $parameters = new DataBaseParameters($data);
        $this->assertEquals(2, $parameters->count(), 'Ожидалось что в коллекции параметров будет два параметра');
        $this->assertInstanceOf('\FrameWork\DataBase\DataBaseParameter', $parameters->getByKey(0));
        $this->assertInstanceOf('\FrameWork\DataBase\DataBaseParameter', $parameters->getByKey(1));

    }

} 