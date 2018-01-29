<?php

class SiteController extends Controller {

    /**
     * Declares class-based actions.
     */
    public function actions() {
        return array(
            // captcha action renders the CAPTCHA image displayed on the contact page
            'captcha' => array(
                'class' => 'CCaptchaAction',
                'backColor' => 0xFFFFFF,
            ),
            // page action renders "static" pages stored under 'protected/views/site/pages'
            // They can be accessed via: index.php?r=site/page&view=FileName
            'page' => array(
                'class' => 'CViewAction',
            ),
        );
    }

    /**
     * This is the default 'index' action that is invoked
     * when an action is not explicitly requested by users.
     */
    public function actionIndex() {
        // renders the view file 'protected/views/site/index.php'
        // using the default layout 'protected/views/layouts/main.php'
        $this->redirect(array('eastling/editor'));
    }

    /**
     * This is the action to handle external exceptions.
     */
    public function actionError() {
        if ($error = Yii::app()->errorHandler->error) {
            if (Yii::app()->request->isAjaxRequest)
                echo $error['message'];
            else
                $this->render('error', $error);
        }
    }

    /**
     * Displays the contact page
     */
    public function actionContact() {
        $model = new ContactForm;
        if (isset($_POST['ContactForm'])) {
            $model->attributes = $_POST['ContactForm'];
            if ($model->validate()) {
                $name = '=?UTF-8?B?' . base64_encode($model->name) . '?=';
                $subject = '=?UTF-8?B?' . base64_encode($model->subject) . '?=';
                $headers = "From: $name <{$model->email}>\r\n" .
                        "Reply-To: {$model->email}\r\n" .
                        "MIME-Version: 1.0\r\n" .
                        "Content-type: text/plain; charset=UTF-8";

                mail(Yii::app()->params['adminEmail'], $subject, $model->body, $headers);
                //Yii::app()->user->setFlash('contact', 'Thank you for contacting us. We will respond to you as soon as possible.');
                Yii::app()->user->setFlash('contact', Yii::t('contact','Merci de nous avoir contacté. Nous vous répondrons dès que possible.'));
                $this->refresh();
            }
        }
        //$this->render('contact', array('model' => $model));
        echo "OK";
    }

    /**
     * Displays the login page
     */
    public function actionLogin() {
        $model = new LoginForm;

        // if it is ajax validation request
        if (isset($_POST['ajax']) && $_POST['ajax'] === 'login-form') {
            echo CActiveForm::validate($model);
            Yii::app()->end();
        }

        // collect user input data
        if (isset($_POST['LoginForm'])) {
            $model->attributes = $_POST['LoginForm'];
            // validate user input and redirect to the previous page if valid
            if ($model->validate() && $model->login())
                //$this->redirect(Yii::app()->user->returnUrl);
                $this->redirect($this->createUrl('eastling/editor'));
                
        }
        // display the login form
        $this->render('login', array('model' => $model));
    }

    /**
     * Logs out the current user and redirect to homepage.
     */
    public function actionLogout() {
        Yii::app()->user->logout();
        //$this->redirect(Yii::app()->homeUrl);
       $this->redirect($this->createUrl('site/login'));
    }

    public function actionTest() {
        //Yii::app()->user->logout();
        $this->render('test');
        //$this->redirect(Yii::app()->homeUrl);
    }

    public function actionMail() {
        // Only process POST reqeusts.
        
        if ($_SERVER["REQUEST_METHOD"] == "POST" AND isset($_POST['ContactForm'])) {
            
            $model = new ContactForm;
            $model->attributes = $_POST['ContactForm'];
            
            $name = '=?UTF-8?B?' . base64_encode($model->name) . '?=';
            
            $subject = '=?UTF-8?B?' . base64_encode("New contact from $name") . '?=';
            $headers = "From: $name <{$model->email}>\r\n" .
                    "Reply-To: {$model->email}\r\n" .
                    "MIME-Version: 1.0\r\n" .
                        "Content-type: text/plain; charset=UTF-8";

            // Check that data was sent to the mailer.
            if (empty($name) OR empty($model->body) OR ! filter_var($model->email, FILTER_VALIDATE_EMAIL)) {
                // Set a 400 (bad request) response code and exit.
                http_response_code(400);
                echo "Oops! There was a problem with your submission. Please complete the form and try again.";
                exit;
            }

            // Set the recipient email address.
            // FIXME: Update this to your desired email address.
            $recipient = Yii::app()->params['adminEmail'];

            // Send the email.
            //if (mail($recipient, $subject, $email_content, $email_headers)) {
            if (mail($recipient, $subject, $model->body, $headers)) {
                // Set a 200 (okay) response code.
                http_response_code(200);
                echo "Thank You! Your message has been sent.";
            } else {
                // Set a 500 (internal server error) response code.
                http_response_code(500);
                echo "Oops! Something went wrong and we couldn't send your message.";
            }
        } else {
            // Not a POST request, set a 403 (forbidden) response code.
            http_response_code(403);
            echo "There was a problem with your submission, please try again.";
        }

        //echo "OK";
    }

    public function actionMentions() {
        //Yii::app()->user->logout();
        $this->render('mentions');
        //$this->redirect(Yii::app()->homeUrl);
    }

}
