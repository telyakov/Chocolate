<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 20.01.14
 * Time: 9:57
 */
use \FrameWork\DataBase\DataBaseRoutine;
use \FrameWork\DataBase\DataBaseParameters;
class DataBaseRoutineTest extends UnitTestCase{

    function testConstruct(){
        $simple_schema = 'dbo';
        $simple_name = 'Test';
        $simple_proc = ' '.$simple_schema. DataBaseRoutine::SCHEMA_DELIMITER . $simple_name;
        $simple_routine = new DataBaseRoutine($simple_proc);
        $this->assertEquals($simple_schema, $simple_routine->getSchema());
        $this->assertEquals($simple_name, $simple_routine->getName());

        $medium_proc = $simple_name . '  ';
        $medium_routine = new DataBaseRoutine($medium_proc);
        $this->assertEquals('', $medium_routine->getSchema());
        $this->assertEquals($simple_name, $medium_routine->getName());

        $firstParam = '1';
        $secondParam = '\'dfdf,43\'';
        $thirdParam = '11.22';

        $hard_proc = ' ' . $simple_schema . DataBaseRoutine::SCHEMA_DELIMITER . $simple_name .'  ' . $firstParam .' , ' . $secondParam . ',' . $thirdParam;
        $hard_routine = new DataBaseRoutine($hard_proc);
        $this->assertEquals($simple_schema, $hard_routine->getSchema());
        $this->assertEquals($simple_name, $hard_routine->getName());
    }

    function testToString(){

        $simple_schema = 'dbo';
        $simple_name = 'Test';
        $simple_proc = ' '.$simple_schema. DataBaseRoutine::SCHEMA_DELIMITER . $simple_name;
        $simple_routine = new DataBaseRoutine($simple_proc);
        $this->assertEquals(trim($simple_proc), $simple_routine->__toString());

        $firstParam = '1';
        $secondParam = '\'dfdf,43\'';
        $thirdParam = '11.22';
        $medium_proc = ' ' . $simple_schema . DataBaseRoutine::SCHEMA_DELIMITER . $simple_name .'  ' . $firstParam .' , ' . $secondParam . ',' . $thirdParam;
        $medium_routine = new DataBaseRoutine($medium_proc);
        $this->assertEquals(trim($medium_routine), $medium_routine->__toString());


        $key1 = 'Ключ1';
        $key2 ='key2';
        $value1 = 'value1';
        $value2 = 'Значение2';
        $data = [ $key1=> $value1, $key2 => $value2];
        $parameters = new DataBaseParameters($data);
        $hard_routine = new DataBaseRoutine($medium_proc, $parameters);
        $expectedString = $simple_schema . DataBaseRoutine::SCHEMA_DELIMITER . $simple_name
            . DataBaseRoutine::PARAMS_DELIMITER . DataBaseParameters::PARAM_PREFIX . strtolower($key1) . '=\''.
            $value1 . '\''. DataBaseParameters::PARAM_DELIMITER . DataBaseParameters::PARAM_PREFIX .
            strtolower($key2) . '=\'' .$value2 .'\'';
        $this->assertEquals($expectedString, $hard_routine->__toString());



    }
} 