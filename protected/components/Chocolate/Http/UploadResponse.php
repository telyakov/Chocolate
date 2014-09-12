<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 04.02.14
 * Time: 16:41
 */

namespace Chocolate\Http;


class UploadResponse extends Response{
    function __toString()
    {
        $response = [$this->data['data']];
        return json_encode($response);
    }

} 