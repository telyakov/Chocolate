<?php
namespace Chocolate\Cache;
use FrameWork\DataBase\DataBaseRoutine;
use FrameWork\DataBase\Recordset;
use FrameWork\XML\XmlData;

class Cache extends \CMemCache
{
    //TODO: использовать юзер id для кеширования(если надо)
    public function setXmlData($view, XmlData $data, $expire = 0)
    {
        $id = XmlData::getCacheID($view);
        $expiringRoutine = new DataBaseRoutine("core.XmlChangeTimeGet '$view'");
        $dependency = new ConnectionDependency(array(\Yii::app()->erp, 'execScalar'), $expiringRoutine);
        return parent::set($id, $data, $expire, $dependency);
    }

    /**
     * @param String $view
     * @return XmlData|null
     */
    public function getXmlData($view)
    {
        $id = XmlData::getCacheID($view);
        return parent::get($id);
    }

    public function setRoutineParams(DataBaseRoutine $routine, array $params, $expire = 240, $dependency = null)
    {
        $id = $routine->getRoutineName();
        return parent::set($id, $params, $expire, $dependency);
    }

    /**
     * @param DataBaseRoutine $routine
     * @return Array
     */
    public function getRoutineParams(DataBaseRoutine $routine)
    {
        $id = $routine->getRoutineName();
        return parent::get($id);
    }

    public function setRoutineData(DataBaseRoutine $routine,  Recordset $data, $expire = 500, $dependency = null)
    {
        $id = $routine->__toString();
        return parent::set($id, $data, $expire, $dependency);
    }

    /**
     * @param DataBaseRoutine $routine
     * @return Recordset
     */
    public function getRoutineData(DataBaseRoutine $routine)
    {
        $id = $routine->__toString();
        return parent::get($id);
    }
}