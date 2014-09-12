<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 19.06.14
 * Time: 9:50
 */

namespace ClassModules\User;


class UserIdentity extends \CUserIdentity
{
    private $_id;

    public function authenticate()
    {
        $user = new User();
        if ($user->authenticate($this->username, $this->password)) {
            $this->_id = $user->userID;
            $this->setState('fullName', $user->getFullName());
            $this->errorCode = self::ERROR_NONE;
        } else {
            $this->errorCode = self::ERROR_UNKNOWN_IDENTITY;
        }
        return $this->errorCode == self::ERROR_NONE;
    }

    public function getId()
    {
        return $this->_id;
    }

}