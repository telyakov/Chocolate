<?php

namespace Chocolate\WebService;

use Chocolate\Exceptions\ConnException;
use FrameWork\DataBase\ConnectionInterface;
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
        $sql = "core.UserIdentityGet '$username', '$password'";
        $recordset = $this->exec($sql);
        return $recordset;
    }

    /**
     * @param string $sql
     * @param null $fields
     * @return Recordset|void
     * @throws ConnException
     * @return Recordset
     */
    function exec($sql, $fields = null)
    {
        try {
            return $this->execute('Exec2', $sql, $fields);
        } catch (\SoapFault $e) {
            throw new ConnException($e->getMessage(), $e->getCode(), $e);
        }
    }

    private function execute($funcName, $sql, $fields)
    {
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
            array_shift($soapResponse);
            $metaCount = array_shift($soapResponse);
            $metaLength = $columnsCount * $metaCount;
            $i = 0;
            $columnIndex = 0;
            while ($i < $metaLength) {
                if ($i % $metaCount == 0) {
                    $columns[$columnIndex] = $soapResponse[$i];
                    ++$columnIndex;
                }
                unset($soapResponse[$i]);
                ++$i;
            }

            $row = [];
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
        }

        return $recordset;
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
}