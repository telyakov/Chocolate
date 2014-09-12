<?php
/**
 * Created by JetBrains PhpStorm.
 * User: tselishchev
 * Date: 26.09.13
 * Time: 8:20
 */
use FrameWork\XML\XML;
use FrameWork\DataForm\DataFormModel\AgileFilter;
class AgileFilterTest extends UnitTestCase {
    /**
     * @var AgileFilter
     */
    public $agileFilter;
    protected function setUp()
    {
        parent::setUp();
        $xml = new XML('tasks.xml');

        $agileFiltersCollection = $xml->getData()->agileFiltersCollection;
        $this->agileFilter = $agileFiltersCollection->getFirst();
    }

    public function testGetName(){
        $name = $this->agileFilter->getName();
        $this->assertNotEmpty($name);
    }

    public function testGetCaption(){
        $caption = $this->agileFilter->getCaption();
        $this->assertNotEmpty($caption);
    }

    public function testGetData(){
        $data = $this->agileFilter->getData();
        $this->assertInstanceOf('FrameWork\DataBase\Recordset', $data);
    }

    public function testGetFilterType(){
        $filterType = $this->agileFilter->getFilterType();
        $this->assertNotEmpty($filterType);
        $this->assertInstanceOf('FrameWork\DataForm\DataFormModel\FilterType', $filterType);

    }

    public function testGetNameInModel(){
        $nameInModel = $this->agileFilter->getNameInModel();
        $this->assertStringStartsWith('filters[',$nameInModel);
        $this->assertStringEndsWith(']',$nameInModel);
    }
    public function testGetToolTipText(){
        $toolTip =$this->agileFilter->getToolTipText();
        $this->assertNotEmpty($toolTip);
    }

    public function testWidgetSettings(){
        $editableFilter = new \Chocolate\HTML\Filter\EditableFilterWidget();
        $filterSettings = $this->agileFilter->getWidgetSetting($editableFilter);
        $this->assertInstanceOf('\Chocolate\HTML\Filter\Interfaces\IFilterSettings', $filterSettings);
    }

}