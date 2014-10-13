<?php
use \ClassModules\User\UserIdentity;
use ClassModules\User\User;

/**
 * LoginForm class.
 * LoginForm is the data structure for keeping
 * user login form data. It is used by the 'login' action of 'SiteController'.
 */
class LoginForm extends CFormModel
{
    public $username;
    public $password;
    public $error;

    public $isNewRecord;
    private $_identity;

    /**
     * Declares the validation rules.
     * The rules state that username and password are required,
     * and password needs to be authenticated.
     */
    public function rules()
    {
        return array(
            array('username', 'safe'),
            array('password', 'authenticate'),
        );
    }

    /**
     * Declares attribute labels.
     */
    public function attributeLabels()
    {
        return array(
            'username' => 'Логин',
            'password' => 'Пароль',
        );
    }

    public function authenticate($attribute, $params)
    {
        if (!$this->hasErrors()) {
            try {

                $this->_identity = new UserIdentity($this->username, $this->password);
                if (!$this->_identity->authenticate()) {

                    $this->addError('error', 'Неправильный логин или пароль. Вы <a href=' .
                        Yii::app()->createUrl('site/forgotPassword') . '>забыли свой пароль?</a>'
                    );
                }
            } catch (Exception $e) {
                $this->addError('error',  $e->getMessage());
            }
        }
    }

    public function login()
    {
        if ($this->_identity === null) {
            $this->_identity = new UserIdentity($this->username, $this->password);
            $this->_identity->authenticate();
        }
        if ($this->_identity->errorCode === UserIdentity::ERROR_NONE) {
            $duration = 2592000; // 30 days
            Yii::app()->user->login($this->_identity, $duration);
            return true;
        } else
            return false;
    }
}
