<?php
//require_once('User.php');
class UserTest extends UnitTestCase{

    public $user;

    public function __construct($name = NULL, array $data = array(), $dataName = ''){
//        $this->user = new User();
        parent::__construct($name, $data, $dataName);
    }

    public function testClassHasAttributes(){
        $this->assertClassHasAttribute('userID', 'User');
        $this->assertClassHasAttribute('firstName', 'User');
        $this->assertClassHasAttribute('lastName', 'User');
        $this->assertClassHasAttribute('patronymic', 'User');
        $this->assertClassHasAttribute('email', 'User');
    }

    public function testConstruct(){
        $testUserName = 'Иваницкий';
        $testPassword = 'kostyaa';
        $this->user = new User($testUserName, $testPassword);
        $this->assertNull(Yii::app()->user->getFlash('error'));
        $this->assertNotEmpty($this->user->userID);
        $this->assertNotEmpty($this->user->firstName);
        $this->assertNotEmpty($this->user->lastName);
        $this->assertNotEmpty($this->user->patronymic);
        $this->assertNotEmpty($this->user->email);
    }

}