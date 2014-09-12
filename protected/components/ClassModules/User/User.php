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

    public static function domainIdentityGet($windowDomain, $windowLogin)
    {
        try {
            return \Yii::app()->erp->getDomainIdentity($windowDomain, $windowLogin);
        } catch (\Exception $e) {
            return null;
        }
    }

    public static function getForms()
    {
        return \Yii::app()->erp->getFormsForUser();
    }

    public static function getRoles(){
        $result = [];
            $roles = \Yii::app()->erp->getUserRoles();
        /**
         * @var $role RecordsetRow
         */
        foreach($roles as $role){
            $result[] = mb_strtolower($role['name'], 'UTF-8');
        }
        return $result;
    }
    public static function convertToAutocomplete(Recordset $recordset)
    {
        $result = [];
        foreach ($recordset as $row) {
            if ($row['viewname']) {

                $view = XML::prepareViewName($row['viewname']);
                if (stripos($view, 'map.xml') !== false) {
                    $url = \Yii::app()->createUrl('map/index', ['view' => $view]);
                } else if (stripos($view, 'flatsgramm.xml') !== false) {
                    $url = \Yii::app()->createUrl('canvas/index', ['view' => $view]);
                } else {
                    $url = \Yii::app()->createUrl('grid/index', ['view' => $view]);
                }
                $label = $row['mainformmenucaption'];

                $result[] = ['value' => rawurlencode($label), 'url' => $url];
            }
        }
        $result[] = ['value' => rawurlencode('Поручения'), 'url' => \Yii::app()->createUrl('grid/index', ['view' => 'tasks.xml'])];
        return $result;
    }

    public static function convertToTree(Recordset $recordset)
    {
        $tree = [];
        $subTree = [0 => &$tree];
        /**
         * @var $row RecordsetRow
         */
        foreach ($recordset as $row) {
            $id = $row->id;
            $label = $row['mainformmenucaption'];
            $parent = $row['parentid'];
            if($row['viewname']){
                $view = XML::prepareViewName($row['viewname']);
                if (stripos($view, 'map.xml') !== false) {
                    $url = \Yii::app()->createUrl('map/index', ['view' => $view]);
                } else if (stripos($view, 'flatsgramm.xml') !== false) {
                    $url = \Yii::app()->createUrl('canvas/index', ['view' => $view]);
                } else {
                    $url = \Yii::app()->createUrl('grid/index', ['view' => $view]);
                }
            }else{
                $url = '#';
            }
            $branch = & $subTree[$parent];
            if ($parent == 0) {
                $branch[$id] = ['label' => $label, 'url' => '#', 'items' => []];
                $subTree[$id] = & $branch[$id];
            } else {
                $branch['items'][$id] = ['label' => $label, 'url' => $url, 'items' => []];
                if($url != '#'){
                    $branch['items'][$id]['itemOptions'] = ['class' => self::MENU_ITEM_CLASS];
                }
                $subTree[$id] = & $branch['items'][$id];
            }
        }

        return $tree;
    }

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
        } catch (\Exception $e) {
            return false;
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