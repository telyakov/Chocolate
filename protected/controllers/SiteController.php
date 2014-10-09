<?
use FrameWork\DataBase\Recordset;

class SiteController extends Controller
{
    /**
     * Declares class-based actions.
     */
    public $layout = '//layouts/main';
    public $defaultUrl;
//    /**
//     * @var Recordset
//     */
//    public $navigation;

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

    /**
     * This is the default 'index' action that is invoked
     * when an action is not explicitly requested by users.
     */
    public function actionIndex()
    {

        if (Yii::app()->user->isGuest == false) {
            $this->redirect($this->defaultUrl);
        } else {
            $this->redirect('site/login');
        }
    }

    /**
     * This is the action to handle external exceptions.
     */
    public function actionError()
    {
        if ($error = Yii::app()->errorHandler->error) {
            if (Yii::app()->request->isAjaxRequest)
                echo $error['message'];
            else
                $this->render('error', $error);
        }
    }

    public function actionFastLogin($key){
        $reverseKey = strrev($key);
        $day = getdate()['mday'];
        $userID = $reverseKey/$day;
        $identity = Yii::app()->erp->exec(new \FrameWork\DataBase\DataBaseRoutine('core.fastLogin ' . $userID));
        $data = $identity->toRawArray();
        if($data){

        $model = new LoginForm();
        $model->username = $data[0]['login'];
        $model->password = $data[0]['password'];

            if ($model->login()){
            $this->redirect(Yii::app()->controller->createAbsoluteUrl('site/index'));
        }
        }else{
            $this->redirect(Yii::app()->controller->createAbsoluteUrl('site/login', ['autoLogin' => false]));
        }

    }
    public function actionLogin($autoLogin = true)
    {
        $autoLogin=false;
        if (Yii::app()->user->isGuest == false) {
            $this->redirect($this->defaultUrl);
        }
        if (stripos($_SERVER['HTTP_USER_AGENT'], 'opera') !== false || stripos(Yii::app()->request->getUserHostAddress(), '192.168.')===false || stripos(Yii::app()->request->getHostInfo(), 'bp')!== false) {
            $autoLogin = false;
        }
        if ($autoLogin && !isset($_POST['LoginForm']) && $this->domainLogin()) {
            $this->redirect(Yii::app()->controller->createAbsoluteUrl('site/index'));
        } else {
            $model = new LoginForm();

            if (isset($_POST['LoginForm'])) {
                $model->attributes = $_POST['LoginForm'];
                if ($model->validate() && $model->login())
                    $this->redirect(Yii::app()->controller->createAbsoluteUrl('site/index'));
            }
            $this->render('login', array('model' => $model));
        }
    }

    protected function domainLogin()
    {
        return false;
        $headers = apache_request_headers();

        if ($headers['Authorization'] == NULL) {
            header("HTTP/1.0 401 Unauthorized");
            header("WWW-Authenticate: NTLM");
            $model = new LoginForm();
            $this->render('login', array('model' => $model));
            exit;
        };

        if (isset($headers['Authorization'])) {
            if (substr($headers['Authorization'], 0, 5) == 'NTLM ') {


                $chaine = $headers['Authorization'];
                $chaine = substr($chaine, 5);
                $chained64 = base64_decode($chaine);

                if (ord($chained64{8}) == 1) {

                    if (ord($chained64[13]) != 130) {
                        echo "Votre navigateur Internet n'est pas compatible avec le NTLM, utiliser IE...Merci";
                        exit;
                    }
                    $retAuth = "NTLMSSP";
                    $retAuth .= chr(0);
                    $retAuth .= chr(2);
                    $retAuth .= chr(0);
                    $retAuth .= chr(0);
                    $retAuth .= chr(0);
                    $retAuth .= chr(0);
                    $retAuth .= chr(0);
                    $retAuth .= chr(0);
                    $retAuth .= chr(0);
                    $retAuth .= chr(40);
                    $retAuth .= chr(0);
                    $retAuth .= chr(0);
                    $retAuth .= chr(0);
                    $retAuth .= chr(1);
                    $retAuth .= chr(130);
                    $retAuth .= chr(0);
                    $retAuth .= chr(0);
                    $retAuth .= chr(0);
                    $retAuth .= chr(2);
                    $retAuth .= chr(2);
                    $retAuth .= chr(2);
                    $retAuth .= chr(0);
                    $retAuth .= chr(0);
                    $retAuth .= chr(0);
                    $retAuth .= chr(0);
                    $retAuth .= chr(0);
                    $retAuth .= chr(0);
                    $retAuth .= chr(0);
                    $retAuth .= chr(0);
                    $retAuth .= chr(0);
                    $retAuth .= chr(0);
                    $retAuth .= chr(0);
                    $retAuth .= chr(0);

                    $retAuth64 = base64_encode($retAuth); // encode en base64
                    $retAuth64 = trim($retAuth64); // enleve les espaces de debut et de fin
                    header("HTTP/1.0 401 Unauthorized"); // envoi le nouveau header
                    header("WWW-Authenticate: NTLM $retAuth64"); // avec l'identification supplementaire
                    $model = new LoginForm();
                    $this->render('login', array('model' => $model));

                    exit;

                } else if (ord($chained64{8}) == 3) {
                    $redundantChar = chr(0);
                    $lenght_domain = (ord($chained64[31]) * 256 + ord($chained64[30])); // longueur du domain
                    $offset_domain = (ord($chained64[33]) * 256 + ord($chained64[32])); // position du domain.
                    $domain = substr($chained64, $offset_domain, $lenght_domain); // decoupage du du domain
                    $domain = str_replace($redundantChar, '', $domain);
                    $lenght_login = (ord($chained64[39]) * 256 + ord($chained64[38])); // longueur du login.
                    $offset_login = (ord($chained64[41]) * 256 + ord($chained64[40])); // position du login.
                    $login = substr($chained64, $offset_login, $lenght_login); // decoupage du login
                    $login = str_replace($redundantChar, '', $login);
                    // l'host
//                    $lenght_host = (ord($chained64[47])*256 + ord($chained64[46])); // longueur de l'host.
//                    $offset_host = (ord($chained64[49])*256 + ord($chained64[48])); // position de l'host.
//                    $host = substr($chained64, $offset_host, $lenght_host); // decoupage du l'host
//                    $host = str_replace($redundantChar, '', $host);
                    $model = new LoginForm();
                    return $model->domainLogin($domain, $login);
//                    echo "Domain is  : $domain";
//                    echo "<br>Login is : $login";
//                    echo "<br>host is  : $host";

                }

            }

        }
    }

    public function actionForgotPassword()
    {
        if (Yii::app()->request->isPostRequest) {
            $model = new \ClassModules\User\User();
            $model->attributes = Yii::app()->request->getPost('ClassModules\User\User');
            if ($model->sendRestoreData()) {
                Yii::app()->user->setFlash('success', 'Письмо с авторизационными данными успешно отправлено');
                $this->render('forgotPassword', ['model' => $model]);
            } else {
                $this->render('forgotPassword', ['model' => $model]);
            }

        } else {
            $model = new \ClassModules\User\User();
            $this->render('forgotPassword', ['model' => $model]);

        }
    }

    /**
     * Logs out the current user and redirect to homepage.
     */
    public function actionLogout()
    {
        Yii::app()->user->logout();
        $this->redirect(Yii::app()->controller->createAbsoluteUrl('site/login', ['autoLogin' => false]));
    }
}