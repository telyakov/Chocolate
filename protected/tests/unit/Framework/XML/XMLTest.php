<?php
use \FrameWork\XML\XML;
class XMLTest extends UnitTestCase {

    public function setUp(){
        parent::setUp();
    }

    public function testHexToDec(){
        $expected = 'xml version=\'1.0\' encoding=\'windows-1251\'';
        $startString = '786D6C2076657273696F6E3D27312E302720656E636F64696E673D2777696E646F77732D31323531272';
        $actual = XML::hexToDec($startString);
        $this->assertEquals($expected, $actual, 'Не корректно работает функция HexToDec');
    }

    public function testGetData(){
        $XmlParser = new XML('tasks.xml');
        $xmlData= $XmlParser->getData();
        $this->assertInstanceOf('\FrameWork\XML\XmlData', $xmlData);
    }

}