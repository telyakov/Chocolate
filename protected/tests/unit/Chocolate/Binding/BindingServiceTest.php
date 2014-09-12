<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 20.01.14
 * Time: 15:13
 */
use \FrameWork\DataBase\DataBaseParameters;
use Chocolate\Binding\BindingService;
use \FrameWork\DataBase\DataBaseRoutine;
class BindingServiceTest extends UnitTestCase {
    function testBindProcedureFromData(){
        $procName = 'tasks.uspGetTasksALL';
        $key1 = 'IDList';
        $key2 = 'TasksStatesIdList';
        $value1= '101';
        $value2= 'dfsafasd';
        $value6 = NULL;
        $key3 = 'subject';
        $key4 = 'какой-то-неверный-параметр';
        $key5 = 'еще-один';
        $key6 = 'tasksusersidlisT';
        $data = [$key1 => $value1, $key2 => $value2, $key3 => 'тема', $key4 => 'h^319', $key5 => NULL, $key6 => $value6];
        $params = new DataBaseParameters($data);
        $routine = new DataBaseRoutine($procName, $params);
        $prepareRoutine = Yii::app()->bind->bindProcedureFromData($routine, $params);
        $this->assertInstanceOf('\FrameWork\DataBase\DataBaseRoutine', $prepareRoutine);
        $procedure = $prepareRoutine->__toString();
        $this->assertStringStartsWith($procName, $procedure, 'Ожидалось что преобразование рутины в строку, вернет строку формата схема.имя.*');
        $this->assertNotContains($key3, $procedure, '', true);
        $this->assertNotContains($key4, $procedure, '', true);
        $this->assertNotContains(strtolower($key5), $procedure, '', true);
        $this->assertContains('@'.strtolower($key1).'=\''.$value1 .'\'', $procedure, '', true);
        $this->assertContains('@'.strtolower($key2).'=\''.$value2 .'\'', $procedure, '', true);
        $this->assertContains('@'.strtolower($key6).'=NULL', $procedure, '', true);
    }

    function testBindProcedureFromModel(){
        $UserID = 1180;
        Yii::app()->user->id = $UserID;
        $procName = 'tasks.uspGetTasksALL';
        $rawName = ' '.$procName .' [UserID],[ParentID], \'fdsf\', 12, [CurrentEmployeeID]';
        $routine = new DataBaseRoutine($rawName);
        $bindingRoutine = Yii::app()->bind->bindProcedureFromModel($routine);
        $this->assertInstanceOf('\FrameWork\DataBase\DataBaseRoutine', $bindingRoutine);
        $procedure = $bindingRoutine->__toString();
        $this->assertStringStartsWith($procName, $procedure);
        $this->assertNotContains('[',$procedure);
        $this->assertNotContains(']',$procedure);
        $this->assertNotContains('userid',$procedure, '', true);
    }

    function testBindString(){
        $UserID = 1110;
        Yii::app()->user->id = $UserID;
        $value = Yii::app()->bind->bindString('userId');
        $this->assertEquals($UserID, $value);
    }
} 