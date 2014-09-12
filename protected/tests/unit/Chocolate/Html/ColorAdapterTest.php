<?php
use  \Chocolate\HTML\ColorAdapter;
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 19.02.14
 * Time: 15:43
 */

class ColorAdapterTest extends UnitTestCase{

    public function testDecToHex(){
        $decColor = '14745565';
        $hexColor = ColorAdapter::decToHex($decColor);
        $this->assertEquals('e0ffdd', $hexColor);
    }

    public function testDecToCssClass(){
        $decColor = '16777215';
        $class = ColorAdapter::decToCssClass($decColor);
        $this->assertEquals('d', $class);
    }
} 