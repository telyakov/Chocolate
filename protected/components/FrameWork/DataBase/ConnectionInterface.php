<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 21.01.14
 * Time: 14:45
 */

namespace FrameWork\DataBase;


interface ConnectionInterface {

    /**
     * @param $username String
     * @param $password String
     * @return Recordset
     */
    function getUserIdentity($username, $password);

    /**
     * @param $name String
     * @return mixed
     */
    function getXmlData($name);

    /**
     * @param $sql String
     * @param null|Int $userID
     * @return Recordset
     */
    function execImmutable(DataBaseRoutine $routine, $fields = null);

    /**
     * @param $id Int
     * @return mixed
     */
    function fileGet($id);

    /**
     * @param $userID Int
     * @return Recordset
     */
    function getForms($userID);

    /**
     * @param $sql string
     * @param string|int $fields
     * @return Recordset
     */
    function exec(DataBaseRoutine $sql, $fields = null);

    /**
     * @param $sql String
     * @param null|Int $userID
     * @return String
     */
    function execScalar(DataBaseRoutine $sql, $userID = null);

    /**
     * @param \FileModel $file
     * @param null|int $userID
     * @return String
     */
//    function fileIns(\FileModel $file, $userID = null);

    /**
     * @param $sql
     * @param string $fileData
     * @param null|int $userID
     * @return Recordset
     */
    function attachmentIns(DataBaseRoutine $sql, $fileData, $userID = null);

    function execMultiply(\DataBaseRoutines $routines);
} 