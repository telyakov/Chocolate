<?php
use \FrameWork\DataBase\DataBaseRoutine;
use \FrameWork\DataBase\DataBaseParameters;
class ErpApiTest extends UnitTestCase{

    public function setUp(){
        parent::setUp();
    }

    public function testGetXmlData(){
        $data = $this->erp->getXmlData('tasks.xml');
        $this->assertNotEmpty($data);
    }

    public function testExecProc(){
        $parameters = array();
        $parameters['FileName'] ='tasks.xml';
        $parameters['FileFolder'] = 'res\views\tasks';
        $routine = new DataBaseRoutine('core.XmlDataGet', new DataBaseParameters($parameters));
        $data = $this->erp->exec($routine);
        $this->assertNotEmpty($data);
    }

}