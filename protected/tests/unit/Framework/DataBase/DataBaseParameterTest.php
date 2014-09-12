<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 20.01.14
 * Time: 9:58
 */

class DataBaseParameterTest extends UnitTestCase{
    function testConstruct(){
        $name = 'Parameter1';
        $value = 'Value1';
        $param = new \FrameWork\DataBase\DataBaseParameter($name, $value);
        $this->assertEquals(strtolower($name), $param->getName(), 'Неправильно присвоилось имя параметра');
        $this->assertEquals($value, $param->getValue(), 'Неправильно присвоилось значение');
    }

    function testSanitizeString(){
        $str = chr(0x0A) .' Привеrrт '.chr(0x0D). chr(0x0A).chr(0x0D) . ' тестr'.chr(0x0A);
        $expectedStr = chr(0x0D).chr(0x0A) .' Привеrrт '.chr(0x0D). chr(0x0A).chr(0x0D) . ' тестr'.chr(0x0D).chr(0x0A);
        $result = \FrameWork\DataBase\DataBaseParameter::sanitizeString($str);
        $this->assertEquals($expectedStr, $result);
    }

} 