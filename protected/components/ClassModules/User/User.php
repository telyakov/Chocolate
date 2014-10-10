<?php

namespace ClassModules\User;

use FrameWork\DataBase\Recordset;
use FrameWork\DataBase\RecordsetRow;
use FrameWork\XML\XML;


class User extends \CFormModel
{
    const MENU_ITEM_CLASS = 'link-form';
    public $userID;
    public $firstName;
    public $lastName;
    public $patronymic;
    public $email;

    public function rules()
    {
        return [
            ['email', 'required']
        ];
    }

    public function getFullName()
    {
        return $this->lastName . ' ' . $this->firstName . ' ' . $this->patronymic;
    }

    public function authenticate($username, $password)
    {
        try {
            $identityData = \Yii::app()->erp->getUserIdentity($username, $password);
            if (isset($identityData)) {
                $this->userID = $identityData['userid'];
                $this->firstName = $identityData['firstname'];
                $this->lastName = $identityData['lastname'];
                $this->patronymic = $identityData['patronymic'];
                $this->email = $identityData['email'];
                return true;
            }
            return false;
        }
        catch(\SoapFault $e){
            throw new \Exception('Веб-сервисы недоступны', 500, $e);
        }
        catch (\Exception $e) {
            throw new \Exception($e->getMessage(), 500, $e);
        }
    }

    public function sendRestoreData()
    {
        if ($this->email) {
            try {
                \Yii::app()->erp->sendRestoreData($this->email);
                return true;
            } catch (\Exception $e) {
                $this->addError('email', $e->getMessage());
                return false;
            }
        } else {
            $this->addError('email', 'Не указан e-mail');
            return false;
        }
    }

    public function attributeLabels()
    {
        return ['email' => 'E-mail'];
    }
}