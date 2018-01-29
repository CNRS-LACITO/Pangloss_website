<?php

/**
 * UserIdentity represents the data needed to identity a user.
 * It contains the authentication method that checks if the provided
 * data can identity the user.
 */
class UserIdentity extends CUserIdentity {

    /**
     * Authenticates a user.
     * The example implementation makes sure if the username and password
     * are both 'demo'.
     * In practical applications, this should be changed to authenticate
     * against some persistent user identity storage (e.g. database).
     * @return boolean whether authentication succeeds.
     */
    public function authenticate() {
        /*
        $users = array(
            // username => password
            'demo' => 'demo',
            'admin' => 'admin',
        );
*/
        $users = array(
            'test' => '@doremifa17',
            'deo' => '@doremifa17',
            'michaud' => '@doremifa17',
            'pain' => '@doremifa17',
            'guillaume' => '@doremifa17',
            'ferlus' => '@doremifa17',
            'francois' => '@doremifa17',
            'billy' => '@doremifa17',
            'simon' => '@doremifa17',
            'armand' => '@doremifa17',
            'hang' => '@doremifa17',
            'gjacques' => '@doremifa17'
        );
        
        if (!isset($users[$this->username]))
            $this->errorCode = self::ERROR_USERNAME_INVALID;
        elseif ($users[$this->username] !== $this->password)
            $this->errorCode = self::ERROR_PASSWORD_INVALID;
        else
            $this->errorCode = self::ERROR_NONE;
        return !$this->errorCode;
    }

}