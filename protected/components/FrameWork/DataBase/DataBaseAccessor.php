<?php
/**
 * Class DataBaseAccessor класс для работы с API Tomato
 */
namespace FrameWork\DataBase;

use Chocolate\Exceptions\ConnException;
use Chocolate\Exceptions\DataBaseException;
use FrameWork\DataBase\DataBaseRoutines;
use Chocolate\WebService\WebService;

class DataBaseAccessor extends \CApplicationComponent
{
    public $userID;
    /**
     * @var $conn ConnectionInterface
     */
    public $conn;


    /**
     * @param DataBaseRoutine $routine
     * @return Recordset
     */
    public function execFromCache(DataBaseRoutine $routine){
        try {
        if($recordset = \Yii::app()->cache->getRoutineData($routine)){
        }else{
            $recordset = \Yii::app()->erp->execImmutable($routine);
            \Yii::app()->cache->setRoutineData($routine, $recordset);

        }
        return $recordset;
        } catch (\Exception $e) {
            self::handleException('Возникла ошибка при выполнении запроса.', 500, $e);
        }
    }

    public function sendRestoreData($email){
        $parameters = new DataBaseParameters();
        $parameters->add(new DataBaseParameter('Email', $email));
        $procedure = new DataBaseRoutine('core.FetchPasswordAndLoginByEmail', $parameters);
        $this->exec($procedure);
    }

    protected static function handleException($msg, $code = 0, \Exception $e = null)
    {
        throw new DataBaseException($msg, $code, $e);
    }

    public function getXmlData($name)
    {
        try {
            $data = $this->conn->getXmlData($name);
            return $data;
        } catch (\Exception $e) {
            self::handleException('Не удалось получить содержимое xml файла: ' . $name . '.', 500, $e);
        }
    }

    public function getProcedureParameters(DataBaseRoutine $routine)
    {
        try {
            if (!($sqlParams = \Yii::app()->cache->getRoutineParams($routine))) {
                $readRoutine = new DataBaseRoutine("dbo.uspGetProcParameters '{$routine->getName()}', '{$routine->getSchema()}'");
                $sqlParams = $this->conn->execImmutable($readRoutine);
            }
            return $sqlParams;
//                $this->prepareProcParameters($sqlParams, $params, $fullRecord);
        } catch (\Exception $e) {
            self::handleException('Не удалось получить список параметров хранимой процедуры.', 0, $e);
        }
    }



    public function execImmutable(DataBaseRoutine $routine)
    {
        try {
            return $this->conn->execImmutable($routine);
        } catch (ConnException $e) {
//            return new Recordset();
            self::handleException($e->getMessage(), $e->getCode(), $e);
        } catch (\Exception $e) {
            self::handleException('Возникла ошибка при выполнении запроса.', 0, $e);
        }
    }

    public function execMultiple(DataBaseRoutines $routines)
    {
        try {
            $result = $this->conn->execMultiply($routines);
            return $result;
        } catch (ConnException $e) {
            self::handleException($e->getMessage(), $e->getCode(), $e);
        } catch (\Exception $e) {
            self::handleException('Возникла ошибка при выполнении транзакции.', 0, $e);
        }
    }

    public function exec(DataBaseRoutine $routine, $fields = null)
    {
        try {
            $recordset = $this->conn->exec($routine, $fields);
            return $recordset;
        } catch (ConnException $e) {
            self::handleException($e->getMessage(), $e->getCode(), $e);
        } catch (\Exception $e) {
            self::handleException('Возникла ошибка при выполнении запроса.', 0, $e);
        }
    }

    public function execScalar(DataBaseRoutine $routine)
    {
        try {
            return $this->conn->execScalar($routine);
        } catch (ConnException $e) {
            self::handleException($e->getMessage(), $e->getCode(), $e);
        } catch (\Exception $e) {
            self::handleException('Возникла ошибка при выполнении запроса на получение скалярного значения.', 0, $e);
        }
    }

    public function attachmentIns(DataBaseRoutine $routine, $fileData)
    {
        try {
            $data = $this->conn->attachmentIns($routine, $fileData, $this->userID);
            return $data;
        } catch (\Exception $e) {
            self::handleException('Возникла ошибка при добавлении вложения.', 0, $e);

        }
    }

    public function init()
    {
        parent::init();
        $this->__wakeup();
        $this->userID = \Yii::app()->user->id;
    }

    function __wakeup()
    {
        $this->conn = new WebService(\Yii::app()->params['soapService']);

    }

    public function getDomainIdentity($windowDomain, $windowLogin){
    try{
        $routine = new DataBaseRoutine("core.DomainIdentityGet $windowDomain, $windowLogin");
        return $this->exec($routine);
    }catch (\Exception $e){
            self::handleException('Не удалось получить доменные данные пользователя.', 0, $e);
    }
    }

    public function getUserIdentity($username, $password)
    {
        try {
            return $this->conn->getUserIdentity($username, $password)->toArray()[0];
        } catch (ConnException $e) {
            self::handleException($e->getMessage(), $e->getCode(), $e);
        }
        catch (\Exception $e) {
            self::handleException('Не удалось получить идентификационные данные пользователя.', 0, $e);
        }
    }

    public function fileGet($id)
    {
        try {
            return $this->conn->fileGet($id);
        } catch (\Exception $e) {
            self::handleException('Не удалось получить содержимое файла.', 0, $e);
        }
    }
}
