<?php

// uncomment the following to define a path alias
// Yii::setPathOfAlias('local','path/to/local-folder');

// This is the main Web application configuration. Any writable
// CWebApplication properties can be configured here.
return array(
        // Define a path alias for the Bootstrap extension as it's used internally.
        // In this example we assume that you unzipped the extension under protected/extensions.
        'sourceLanguage'=>'fr',
        'language'=>'fr',
        
        //config yii-less; added to be used along with yiistrap

    
        //config yiistrap
        // path aliases //config yiistrap
        'aliases' => array(
            'bootstrap' => realpath(__DIR__ . '/../extensions/bootstrap'), // change this if necessary
    
        ),
        //fin config yiistrap
    
        //'theme'=>'bootstrap', // requires you to copy the theme under your themes directory

        // application-level parameters that can be accessed
	// using Yii::app()->params['paramName']
	'params'=>array(
		// this is used in contact page
                //'languages'=>array('fr'=>'Français', 'en'=>'English', 'vn'=>'Tiếng Việt', 'th'=>'ภาษาไทย', 'zh-cn'=>'中文'),
		'languages'=>array('fr'=>'Français', 'en'=>'English'),
		'adminEmail'=>'info@moon-light.fr',
	),
    
    //
    
	'basePath'=>dirname(__FILE__).DIRECTORY_SEPARATOR.'..',
	'name'=>Yii::t('general','EASTLing : Easy Annotation & Synchronization Tools for Linguists'),

	// preloading 'log' component
	'preload'=>array('log','translate'),
        
    
        'behaviors'=>array(
            'ext.yii-less.components.LessCompilationBehavior',
          ),
	// autoloading model and component classes
	'import'=>array(
                'system.base.*',
		'application.models.*',
		'application.components.*',
                // import paths //config yiistrap
//                'application.modules.translate.TranslateModule',
                //Giix components
                'ext.giix-components.*', // giix components
                'ext.yii-mail.YiiMailMessage'
	),

	'modules'=>array(
            
            // application modules //config yiistrap
            /*'gii' => array(
                'generatorPaths' => array('bootstrap.gii'),
            ),
             * 
             */
            'translate',
		// uncomment the following to enable the Gii tool
		
		'gii'=>array(
			'class'=>'system.gii.GiiModule',
			'password'=>'ab4qgvh',
			// If removed, Gii defaults to localhost only. Edit carefully to taste.
			//'ipFilters'=>array('127.0.0.1','::1'),
            'ipFilters'=>false,
                        //Giix config
            'generatorPaths' => array(
			'ext.giix-core', // giix generators
                        ),
		),
		
	),

	// application components
	'components'=>array(
//            'mail' => array(
//                'class' => 'ext.yii-mail.YiiMail',
//                'transportType' => 'smtp',
//                'transportOptions' => array(
//                    'host' => 'smtp.moon-light.fr',
//                    'username' => 'postmaster@moon-light.fr',
//                    'password' => 'TYkUZnBh',
//                    'port' => '465',
//                    'encryption'=>'tls',
//                ),
//                'viewPath' => 'application.views.mail',
//                'logging' => true,
//                'dryRun' => false
//            ),

//            'messages'=>array(
//                //'class'=>'CDbMessageSource',
//                'onMissingTranslation' => array('TranslateModule', 'missingTranslation'),
//            ),
            'messages'=>array(
                'class'=>'MPhpMessageSource'
            ),
            /*
            'translate'=>array(//if you name your component something else change TranslateModule
                'class'=>'translate.components.MPTranslate',
                //any avaliable options here
                'acceptedLanguages'=>array(
                    'en'=>'English',
                ),
            ),
            */
            'request'=>array(
                'enableCookieValidation'=>true,
                'enableCsrfValidation'=>true,
            ),
            'urlManager'=>array(
                'class'=>'application.components.UrlManager',
                'urlFormat'=>'path',
                'showScriptName'=>true,
                'rules'=>array(
                    '<language:(fr|en|vn|th|zh-cn)>/' => 'site/index',
                    //'<language:(fr|en|vn|th|zh-cn)>/<action:(index|contact|login|logout)>' => 'site/<action>',
                    '<language:(fr|en|vn|th|zh-cn)>/<controller:\w+>/<action:\w+>/<id:\d+>'=>'<controller>/<action>',
                    '<language:(fr|en|vn|th|zh-cn)>/<controller:\w+>/<action:\w+>/*'=>'<controller>/<action>',
                    '<language:(fr|en|vn|th|zh-cn)>/<controller:\w+>/<action:\w+>'=>'<controller>/<action>',
                    '<language:(fr|en|vn|th|zh-cn)>/<controller:\w+>/<id:\d+>'=>'<controller>/view',
                    
                ),
            ),
            // yii-less
            'lessCompiler'=>array(
                'class'=>'ext.yii-less.components.LessCompiler',
                'paths'=>array(
                  // you can access to the compiled file on this path
                  '../extensions/bootstrap/assets/css/bootstrap.css' => array(
                    'precompile' => true, // whether you want to cache the generation
                    'paths' => array('../extensions/bootstrap/assets/less/bootstrap.less') //paths of less files. you can specify multiple files.
                  ),
                ),
              ),
            // 

		'user'=>array(
			// enable cookie-based authentication
			'allowAutoLogin'=>true,
		),
		// uncomment the following to enable URLs in path-format
		/*
		'urlManager'=>array(
			'urlFormat'=>'path',
			'rules'=>array(
				'<controller:\w+>/<id:\d+>'=>'<controller>/view',
				'<controller:\w+>/<action:\w+>/<id:\d+>'=>'<controller>/<action>',
				'<controller:\w+>/<action:\w+>'=>'<controller>/<action>',
			),
		),
		*/

            
//		'db'=>array(
//			'connectionString' => 'mysql:host=mysql51-104.perso;dbname=moonlight',
//			'emulatePrepare' => true,
//			'username' => 'moonlight',
//			'password' => 'FF8Tr5SGGYmY',
//			'charset' => 'utf8',
//		),
            /*
                'db'=>array(
			'connectionString' => 'mysql:host=localhost;dbname=moonlight',
			'emulatePrepare' => true,
			'username' => 'root',
			'password' => 'root',
			'charset' => 'utf8',
		),
		*/
		'errorHandler'=>array(
			// use 'site/error' action to display errors
			'errorAction'=>'site/error',
		),
		'log'=>array(
			'class'=>'CLogRouter',
			'routes'=>array(
				array(
					'class'=>'CFileLogRoute',
					'levels'=>'error, warning',
				),
				// uncomment the following to show log messages on web pages
				/*
				array(
					'class'=>'CWebLogRoute',
				),
				*/
			),
		),
                
	),
    
    
    
);


