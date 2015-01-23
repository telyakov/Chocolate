<?php
/**
 * Class DataBaseAccessor класс для работы с API Tomato
 */
namespace FrameWork\DataBase;

use Chocolate\Exceptions\ConnException;
use Chocolate\Exceptions\DataBaseException;
use Chocolate\WebService\WebService;

class DataBaseAccessor extends \CApplicationComponent
{
    public $userID;
    /**
     * @var $conn ConnectionInterface
     */
    public $conn;

    public function sendRestoreData($email){
        $sql = 'core.FetchPasswordAndLoginByEmail @EMail=\'' . $email . ' \'';
        $this->exec($sql);
    }

    protected static function handleException($msg, $code = 0, \Exception $e = null)
    {
        throw new DataBaseException($msg, $code, $e);
    }

    /**
     * @param $sql
     * @param null $fields
     * @return Recordset
     * @throws DataBaseException
     */
    public function exec($sql, $fields = null)
    {
        try {
            $recordset = $this->conn->exec($sql, $fields);
            return $recordset;
        } catch (ConnException $e) {
            self::handleException($e->getMessage(), $e->getCode(), $e);
        } catch (\Exception $e) {
            self::handleException('Возникла ошибка при выполнении запроса.', 0, $e);
        }
    }

    public function init()
    {
        parent::init();
        $this->__wakeup();
        $this->userID = \Yii::app()->user->id;
    }

    function __wakeup()
    {
        $this->conn = new WebService(\Yii::app()->params['soapService']);

    }


    public function getUserIdentity($username, $password)
    {
        try {
            return $this->conn->getUserIdentity($username, $password)->toArray()[0];
        } catch (ConnException $e) {
            self::handleException($e->getMessage(), $e->getCode(), $e);
        }
        catch (\Exception $e) {
            throw new DataBaseException('Не удалось получить идентификационные данные пользователя.', 500, $e);
        }
    }

    /**
     * @param $fileID
     * @throws DataBaseException
     * @return Recordset
     */
    public function fileMetaDataGet($fileID){
        try{
            $sql = 'Attachments.MetaDataGet @FileID=\'' . $fileID . '\'';
            return $this->exec($sql);
        }catch (\Exception $e){
            throw new DataBaseException($e->getMessage(), 500, $e);
        }
    }

    /**
     * @param $id
     * @throws DataBaseException
     * @return mixed
     */
    public function fileGet($id)
    {
        try {
            return $this->conn->fileGet($id);
        } catch (\Exception $e) {
            self::handleException('Не удалось получить содержимое файла.', 0, $e);
        }
    }
}
