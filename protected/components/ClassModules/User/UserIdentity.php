<?php
namespace ClassModules\User;

class UserIdentity extends \CUserIdentity
{
    private $_id;

    public function authenticate()
    {
        $user = new User();
        if ($user->authenticate($this->username, $this->password)) {
            $this->_id = $user->userID;
            $this->setState('employeeID', $user->getEmployeeID());
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