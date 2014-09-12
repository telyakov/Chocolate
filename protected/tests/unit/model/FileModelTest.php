<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 23.01.14
 * Time: 11:40
 */

class FileModelTest extends UnitTestCase {

    public function testToArray(){
        $model = new FileModel();
        $result = $model->toArray();
        $attributes = ['Id' => 111, 'Name' => 'Имя'];
        $model->setAttributes($attributes);
        $reflectionClass = new ReflectionClass('FileModel');
        $properties = $reflectionClass->getProperties();
        /**
         * @var $property ReflectionProperty
         */
        foreach($properties as $property){
            $name = $property->getName();
            $value = $model->{$name};
            if(array_key_exists($name, $attributes)){
                $this->assertEquals($attributes[$name], $value);
            }else{
                $this->assertNotContains($name, $result);
            }

        }
    }

} 