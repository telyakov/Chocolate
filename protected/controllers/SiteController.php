<?
use \ClassModules\User\User;

class SiteController extends Controller
{
    public $layout = '//layouts/main';
    public $defaultUrl;

    public function filters()
    {
        return array(
            'accessControl +default',
        );
    }

    public function init()
    {
        parent::init();
        $this->defaultUrl = Yii::app()->createUrl('site/default');
    }

    public function accessRules()
    {
        return array(
            array('allow', 'users' => array('@')),
            array('deny', 'users' => array('*'))
        );
    }

    public function actions()
    {
        return [];
    }

    public function actionDefault()
    {
        $this->layout = '//layouts/simpleGrid';
        $this->render('default');
    }

    public function actionIndex()
    {

        if (Yii::app()->user->isGuest == false) {
            $this->redirect($this->defaultUrl);
        } else {
            $this->redirect('site/login');
        }
    }


    public function actionError()
    {
        if ($error = Yii::app()->errorHandler->error) {
            if (Yii::app()->request->isAjaxRequest)
                echo $error['message'];
            else
                $this->render('error', $error);
        }
    }

    public function actionFastLogin($key)
    {
        $reverseKey = strrev($key);
        $day = getdate()['mday'];
        $userID = $reverseKey / $day;
        $identity = Yii::app()->erp->exec(new \FrameWork\DataBase\DataBaseRoutine('core.fastLogin ' . $userID));
        $data = $identity->toRawArray();
        if ($data) {

            $model = new LoginForm();
            $model->username = $data[0]['login'];
            $model->password = $data[0]['password'];

            if ($model->login()) {
                $this->redirect(Yii::app()->controller->createAbsoluteUrl('site/index'));
            }
        } else {
            $this->redirect(Yii::app()->controller->createAbsoluteUrl('site/login', ['autoLogin' => false]));
        }

    }

    public function actionLogin()
    {
        if (Yii::app()->user->isGuest === false) {
            $this->redirect($this->defaultUrl);
        }

        $model = new LoginForm();

        if (isset($_POST['LoginForm'])) {
            $model->attributes = $_POST['LoginForm'];
            if ($model->validate() && $model->login()) {
                $this->redirect(Yii::app()->controller->createAbsoluteUrl('site/index'));
            }
        }
        $this->render('login', ['model' => $model]);
    }

    public function actionForgotPassword()
    {
        $model = new User();
        if (Yii::app()->request->isPostRequest) {
            $model->attributes = Yii::app()->request->getPost('ClassModules_User_User');
            if ($model->sendRestoreData()) {
                Yii::app()->user->setFlash('success', 'Письмо с авторизационными данными успешно отправлено');
            }
        }
        $this->render('forgotPassword', ['model' => $model]);
    }

    public function actionLogout()
    {
        Yii::app()->user->logout();
        $this->redirect(Yii::app()->controller->createAbsoluteUrl('site/login'));
    }
}