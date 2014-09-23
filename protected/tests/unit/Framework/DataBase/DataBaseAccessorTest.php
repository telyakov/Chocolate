<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 24.02.14
 * Time: 14:10
 */
use \FrameWork\DataBase\DataBaseRoutine;
use FrameWork\DataBase\DataBaseRoutines;
class DataBaseAccessor extends UnitTestCase{


    public function testExecMultiplySuccessExecute(){
        $routine1 = new DataBaseRoutine('insert into directory.WorkType(name, description) values(\'Test\', \'TextDesc\')');
        $routine2 = new DataBaseRoutine('insert into directory.WorkType(name, description) values(\'Test2\', \'TextDesc2\')');
        $routines = new DataBaseRoutines();
        $routines->enqueue($routine1);
        $routines->enqueue($routine2);
        Yii::app()->erp->execMultiple($routines);

    }

    public function testExecMultiplyUndefinedStoredProcedure(){
        $procName = 'mndfew11l';
        $routine = new DataBaseRoutine($procName);
        $routines = new DataBaseRoutines();
        $routines->enqueue($routine);
        try{
            Yii::app()->erp->execMultiple($routines);
            $this->fail('Ожидалось генерирование ошибки');
        }catch (Exception $e){
            $this->assertContains($procName, $e->getMessage());
        }
    }

    public function testExecMultiplyRollback(){
        $procName = 'fdsfdsfsd';
        $routine1 = new DataBaseRoutine('insert into directory.WorkType(name, description) values(\'Test3\', \'TextDesc3\')');
        $routine2 = new DataBaseRoutine('insert into directory.WorkType(name, description) values(\'Test4\', \'TextDesc3\')');
        $routine3 = new DataBaseRoutine($procName);
        $routines = new DataBaseRoutines();
        $routines->enqueue($routine1);
        $routines->enqueue($routine2);
        $routines->enqueue($routine3);
        try{
            Yii::app()->erp->execMultiple($routines);
            $this->fail('Ожидалась ошибки и откат транзакции');
        }catch (Exception $e){
            $this->assertContains($procName, $e->getMessage());
        }

    }


}