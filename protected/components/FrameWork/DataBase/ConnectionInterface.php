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
     * @param $id Int
     * @return mixed
     */
    function fileGet($id);

    /**
     * @param $sql string
     * @param string|int $fields
     * @return Recordset
     */
    function exec($sql, $fields = null);

}