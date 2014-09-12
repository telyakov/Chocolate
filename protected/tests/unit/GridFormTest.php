<?php

class GridFormTest extends UnitTestCase {

    /**
     * @var $grid GridForm
     */
    public $grid;
    public function setUp(){
        parent::setUp();
        $this->grid = new GridForm('tasks.xml');
    }

    public function testLoadData(){
        $sqlData = $this->grid->loadData();
        $this->assertNotEmpty($sqlData);
    }

    public function  testGetColumns(){
        $columns = $this->grid->getColumns();
        $this->assertNotEmpty($columns);
    }

    public function testGetFilterSettingsCollection(){
        $settingsCollection = $this->grid->getFilterSettingsCollection();
        $this->assertNotEmpty($settingsCollection);
        $this->assertInstanceOf('Chocolate\HTML\Filter\Settings\FilterSettingsCollection', $settingsCollection);
    }
    public function testGetDataFormProperties(){
        $dataFormProperties = $this->grid->getDataFormProperties();
        $this->assertInstanceOf('FrameWork\DataForm\DataFormModel\DataFormProperties',$dataFormProperties);

    }
}