"use strict";

var Expressway = require('expressway');
var express = require('express');

/**
 * Provides a basic JSON API.
 * @constructor
 */
class APIProvider extends Expressway.Provider
{
    /**
     * Constructor
     * @param app Application
     */
    constructor(app)
    {
        super(app);

        this.requires = [
            'CoreProvider',
            'ModelProvider',
            'LoggerProvider',
            'ControllerProvider',
            'RouterProvider',
            'ExpressProvider'
        ];
    }

    /**
     * Register with express.
     * @param app Application
     * @param router RouterFactory
     * @param $app Express
     * @param config function
     * @param controllerService ControllerService
     */
    register(app,router,$app,config,controllerService)
    {
        var $api = express();

        router.mount('api',$api);
        $app.use(config('api_baseuri','/api/v1'),$api);

        app.register('$api', $api, "The REST API express sub-app instance");

        controllerService.addDirectory(__dirname+'/../middlewares/');
        controllerService.addDirectory(__dirname+'/../controllers/');
    }

    /**
     * Create the API routes.
     * @param router
     */
    boot(router)
    {
        // Assign global middleware.
        router.api.add([
            'BodyParser',
            'Session',
            'BasicAuth'
        ]);
        // Assign routes.
        router.api.add({
            "GET    /"              : 'RESTController.index',
            "GET    /:model"        : 'RESTController.fetchAll',
            "POST   /:model"        : 'RESTController.create',
            "POST   /:model/search" : 'RESTController.search',
            "GET    /:model/:id"    : 'RESTController.fetchOne',
            "PUT    /:model/:id"    : 'RESTController.update',
            "DELETE /:model/:id"    : 'RESTController.trash',
        });
    }
}

module.exports = APIProvider;