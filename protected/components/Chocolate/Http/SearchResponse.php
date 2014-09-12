<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 04.02.14
 * Time: 14:39
 */

namespace Chocolate\Http;


class SearchResponse extends Response {

    public function setPreviewData($data){
        $this->_data['preview'] = $data;
    }

    public function setOrder($data){
        $this->_data['order'] = $data;
    }


}