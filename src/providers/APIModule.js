"use strict";

var Expressway = require('expressway');

class APIModule extends Expressway.Module
{
    constructor(app)
    {
        super(app);

        this.requires(
            'AppModule',
            'AuthModule',
            'ModelProvider'
        );

        this.baseUri = "/api/v1";
    }

    /**
     * Register controllers, middlewares and other services.
     * @param app Application
     * @param controllerService ControllerService
     */
    register(app,controllerService)
    {
        this.parent('AppModule', this.baseUri);

        controllerService.addDirectory(__dirname+'/../middlewares/');
        controllerService.addDirectory(__dirname+'/../controllers/');
    }

    /**
     * Create routes to the API.
     * @param app
     */
    boot(app)
    {
        // Assign global middleware.
        this.add([
            'BodyParser',
            'Session',
            'Localization',
            'BasicAuth'
        ]);

        // Assign routes.
        this.add({
            "GET    /"              : 'RESTController.index',
            "GET    /locale"        : 'RESTController.locale',
            "GET    /:model"        : 'RESTController.fetchAll',
            "POST   /:model"        : 'RESTController.create',
            "POST   /:model/search" : 'RESTController.search',
            "GET    /:model/:id"    : 'RESTController.fetchOne',
            "PUT    /:model/:id"    : 'RESTController.update',
            "DELETE /:model/:id"    : 'RESTController.trash',
        });

        this.add('NotFound');
    }
}

module.exports = APIModule;