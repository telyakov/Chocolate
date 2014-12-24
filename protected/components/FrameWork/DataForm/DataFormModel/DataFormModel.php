<?php
/**
 * Created by JetBrains PhpStorm.
 * User: tselishchev
 * Date: 11.06.13
 * Time: 14:27
 */

namespace FrameWork\DataForm\DataFormModel;

use Chocolate\Exceptions\DataBaseException;
use Chocolate\Exceptions\DataFormException;
use FrameWork\DataBase\DataBaseParameters;
use FrameWork\DataBase\DataBaseRoutine;
use FrameWork\DataBase\RecordsetRow;
use GridForm;
use FrameWork\DataBase\DataBaseRoutines;

class DataFormModel
{
    /**
     * @var $parentModel GridForm
     */
    protected $parentModel;
    /**
     * @var DataFormProperties
     */
    protected $parentDataFormProperties;
    private $_dataFormProperties;
    private $_parentID;

    public function __construct(DataFormProperties $dataFormProperties, GridForm $parentModel = null, $parentID = null)
    {
        $this->_parentID = $parentID;
        $this->parentModel = $parentModel;
        if (isset($parentModel)) {
            $this->parentDataFormProperties = $parentModel->getDataFormProperties();
        }
        $this->_dataFormProperties = $dataFormProperties;
    }

    public function getParentDataFormProperties()
    {
        return $this->parentDataFormProperties;
    }

    public function getParentAttachmentsEntityTypeID(){
        if($this->parentDataFormProperties){
            return $this->parentDataFormProperties->getAttachmentsEntityTypeID();
        }
        return null;
    }


    public function getParentID()
    {
        return $this->_parentID;
    }
    public function setParentID($parentID)
    {
        $this->_parentID = $parentID;
    }

    public function getDataFormProperties()
    {
        return $this->_dataFormProperties;
    }

    public function loadData(array $params = [], $fields)
    {
        try {
            $routine = $this->_dataFormProperties->getReadProc();

            if (!empty($routine->getRawParams())) {
                $routine = \Yii::app()->bind->bindProcedureFromModel($routine, $this);
            } else {
                $routine = \Yii::app()->bind->bindProcedureFromData($routine, new DataBaseParameters($params), false, $this);
            }

            return \Yii::app()->erp->exec($routine, $fields);
        } catch (\Exception $e) {
            self::handleException('Возникла ошибка при загрузке данных из бд.', 0, $e);
        }
    }

    protected static function handleException($msg, $code = 0, \Exception $e = null)
    {
        throw new DataFormException($msg, $code, $e);
    }

    public function saveData(array $changedData = null, \CStack $removedRows)
    {
        try {
            $loginRoutine = new DataBaseRoutine('dbo.uspHostUserLogin',
                new DataBaseParameters(['userid' =>\Yii::app()->getUser()->id])
            );
            $routines = new DataBaseRoutines();

            $routines->enqueue($loginRoutine);
            $routines = $this->setRemovedRoutines($removedRows, $routines);
            $routines = $this->setChangedRoutines($changedData, $routines);
            return \Yii::app()->erp->execMultiple($routines);
        }catch (DataBaseException $e){
            self::handleException($e->getMessage(), $e->getCode(), $e);
        }
        catch (\Exception $e) {
            self::handleException('При сохранении изменных данных возникла ошибка', 0, $e);
        }
    }

    private function setRemovedRoutines(\CStack $removedRows, DataBaseRoutines $routines)
    {
        if ($removedRows->getCount()) {
            if ($this->_dataFormProperties->getDeleteProc()) {
                while ($removedRows->getCount()) {
                    $id =  $removedRows->pop();
                    $routine = $this->_dataFormProperties->getDeleteProc();
                    $routine = \Yii::app()->bind->bindProcedureFromData(
                        $routine,
                        new DataBaseParameters(array('id' => $id))
                    );
                    $routines->push($routine);
                }
            } else {
                throw new DataFormException('Не задана процедура удаления.');
            }
        }
        return $routines;
    }

    private function setChangedRoutines(array $changedData = null, DataBaseRoutines $routines)
    {
        if (!empty($changedData)) {
            foreach ($changedData as $row) {
                if (self::isNewRow($row['id'])) {
                    if ($createRoutine = $this->_dataFormProperties->getCreateProc()) {
                        $createRoutine = \Yii::app()->bind->bindProcedureFromData($createRoutine, new DataBaseParameters($row), true, $this);
                        $routines->push($createRoutine);
                    } else {
                        throw new DataFormException('Не задана процедура добавление.');
                    }
                } else {
                    if ($updateRoutine = $this->_dataFormProperties->getUpdateProc()) {
                        $updateRoutine = \Yii::app()->bind->bindProcedureFromData($updateRoutine, new DataBaseParameters($row));
                        $routines->push($updateRoutine);
                    } else {
                        throw new DataFormException('Не задана процедура обновления.');
                    }
                }
            }
        }
        return $routines;
    }

    public  static function isNewRow($id)
    {
        if (is_numeric($id)) {
            return false;
        } else {
            return true;
        }
    }

}
