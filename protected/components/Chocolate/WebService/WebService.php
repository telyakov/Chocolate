<?php

namespace Chocolate\WebService;


use Chocolate\Exceptions\ConnException;
use FrameWork\DataBase\ConnectionInterface;
use FrameWork\DataBase\DataBaseRoutine;
use FrameWork\DataBase\DataBaseRoutines;
use FrameWork\DataBase\Recordset;
use FrameWork\DataBase\RecordsetRow;

class WebService extends \SoapClient implements ConnectionInterface
{
    public $soapClient;

    function __construct($url, $options = [])
    {
        $this->soapClient = new \soapclient(
            $url,
            \Yii::app()->params['proxy']
        );
    }

    function getUserIdentity($username, $password)
    {
        $routine = new DataBaseRoutine("core.UserIdentityGet '$username', '$password'");
        $recordset = $this->exec($routine);
        return $recordset;
    }

    protected static function log(DataBaseRoutine $routine){
        \Yii::log(
            var_export([
                'sql' => $routine->__toString(),
                'userid' => \Yii::app()->user->id,
                'ip' => \Yii::app()->request->getUserHostAddress(),
                'host' => \Yii::app()->request->getHostInfo(),
                'browser' => $_SERVER['HTTP_USER_AGENT']
            ], true),
            \CLogger::LEVEL_INFO,
            'webservice'
        );
    }

    function exec(DataBaseRoutine $sql, $fields = null)
    {
        try {
            return $this->execute('Exec2', $sql, $fields);
        } catch (\SoapFault $e) {
            throw new ConnException($e->getMessage(), $e->getCode(), $e);
        }
    }

    private function execute($funcName,DataBaseRoutine $sql, $fields)
    {
        self::log($sql);
        $response = $this->soapClient->{$funcName}(array(
            'securityKey' => \Yii::app()->params['soapSecurityKey'],
            'sql' => $sql,
            'fields' => $fields
        ));

        $header = $funcName . 'Result';
        $recordset = $this->parse($response->{$header}->string);
        return $recordset;
    }

    private function parse(array $soapResponse)
    {
        $recordset = new Recordset();
        if (!empty($soapResponse)) {
            $columnsCount = array_shift($soapResponse);
            $columns = new \SplFixedArray($columnsCount);
            $types = [];
            array_shift($soapResponse);
            $metaCount = array_shift($soapResponse);
            $metaLength = $columnsCount * $metaCount;
            $row = [];
            $i = 0;
            $columnIndex = 0;
            while ($i < $metaLength) {
                if ($i % $metaCount == 0) {
                    $columns[$columnIndex] = $soapResponse[$i];
                    $types[$soapResponse[$i]] = $soapResponse[$i+1];
                    ++$columnIndex;
                }
                unset($soapResponse[$i]);
                ++$i;
            }

            foreach ($soapResponse as $key => $value) {
                $index = $key % $columnsCount;
                if ($index == 0 && !empty($row)) {
                    $recordset->add(new RecordsetRow($row));
                    $row = [];
                }
                if ($value === 'NULL') {
                    $value = NULL;
                } else if ($value === 'True') {
                    $value = true;
                } else if ($value === 'False') {
                    $value = false;

                }
                $row[$columns[$index]] = $value;
            }

            if (!empty($row)) {
                $recordset->add(new RecordsetRow($row));
            }
            $recordset->setTypes($types);
        }

        return $recordset;
    }

    function getXmlData($name)
    {
        $routine = new DataBaseRoutine("core.XmlFileGet '$name'");
        $recordset = $this->exec($routine);
        $fileData = $recordset->toArray();

        if (isset($fileData[0]['id'])) {
            return $this->FileGet($fileData[0]['id']);
        } else {
            return null;
        }
    }

    function execImmutable(DataBaseRoutine $routine, $fields = null)
    {
        try {

            if ($recordset = \Yii::app()->cache->getRoutineData($routine)) {
                return $recordset;
            } else {
                $recordset = $this->execute('Exec2_Immutable', $routine, $fields);
                \Yii::app()->cache->setRoutineData($routine, $recordset);
                return $recordset;
            }
        } catch (\SoapFault $e) {
            throw new ConnException($e->getMessage(), $e->getCode(), $e);
        }
    }

    function fileGet($id)
    {
        $funcName = 'FileGet';
        $response = $this->soapClient->{$funcName}(array(
                'securityKey' => \Yii::app()->params['soapSecurityKey'],
                'id' => $id,
            )
        );
        $fileData = $response->{$funcName . 'Result'}->FileModel->FileData;
        return $fileData;
    }

    function execMultiply(DataBaseRoutines $routines)
    {
        try {

            foreach($routines as $routine){
                self::log($routine);
            }
            $funcName = 'ExecMultiply';
            $status = $this->soapClient->{$funcName}([
                'securityKey' => \Yii::app()->params['soapSecurityKey'],
                'sqlList' => $routines->toArray()
            ]);
            return $status;
        } catch (\SoapFault $e) {
            throw new ConnException($e->getMessage(), $e->getCode(), $e);
        }
    }

    function attachmentIns(DataBaseRoutine $sql, $fileData, $userID = null)
    {
        self::log($sql);
        $funcName = 'AttachmentIns';
        $response = $this->soapClient->{$funcName}(array(
            'securityKey' => \Yii::app()->params['soapSecurityKey'],
            'sql' => $sql,
            'fileData' => $fileData
        ));
        $recordset = $this->parse($response->{$funcName . 'Result'}->string);
        return $recordset;
    }

    function getForms($userID)
    {
        $routine = new DataBaseRoutine("dbo.uspGetFormsForUser @UserID = $userID");
        $recordset = $this->exec($routine);
        return $recordset;
    }

    function execScalar(DataBaseRoutine $sql, $userID = null)
    {
        try {

            self::log($sql);

            $response = $this->soapClient->ExecScalar(array(
                'securityKey' => \Yii::app()->params['soapSecurityKey'],
                'sql' => $sql,
            ));
            $result = $response->ExecScalarResult;
            return $result;
        } catch (\SoapFault $e) {
            throw new ConnException($e->getMessage(), $e->getCode(), $e);
        }
    }

}