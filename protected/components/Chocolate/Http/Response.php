<?php
namespace Chocolate\Http;
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 29.01.14
 * Time: 10:56
 */

class Response {
    CONST SUCCESS = 0;
    CONST ERROR = 1;
    CONST WARNING = 2;
    protected  $_statusMsg;
    protected $_data = [];
    protected $_statusCode = self::SUCCESS;

    public function setStatus($statusMsg, $statusCode = Response::ERROR)
    {
        $this->_statusMsg = $statusMsg;
        $this->_statusCode = $statusCode;
    }

    public function getStatusMsg()
    {
        return $this->_statusMsg;
    }

    public function getStatusCode()
    {
        return $this->_statusCode;
    }

    public function getData()
    {
        return $this->_data;
    }

    function __toString() {

        $response = array_merge( ['status_msg' => $this->getStatusMsg(), 'status_code' => $this->_statusCode] , $this->getData());
        return json_encode($response);
    }

    function send(){
        echo $this->__toString();
    }

    public function setData($data){
        $this->_data['data'] = $data;
    }

} 