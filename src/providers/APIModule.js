"use strict";

var Expressway = require('expressway');

class APIModule extends Expressway.Module
{
    get alias() { return "$api" }

    constructor(app)
    {
        super(app);

        this.requires(
            'AppModule',
            'AuthModule',
            'ModelProvider'
        );

        this.package = require('../../package.json');

        this.apiName = "Expressway API v1";
        this.baseUri = "/api/v1";
    }

    /**
     * Register controllers, middlewares and other services.
     * @param app Application
     * @param controllerService ControllerService
     */
    register(app,controllerService)
    {
        this.parent('AppModule');

        controllerService.addDirectory(__dirname+'/../middlewares/');
        controllerService.addDirectory(__dirname+'/../controllers/');
    }

    /**
     * Create routes to the API.
     * @param app Application
     * @param modelService ModelService
     * @param url UrlService
     */
    boot(app,modelService,url)
    {
        // For each model's JSON output, append an API url.
        modelService.each(model => {
            model.appends.push((object,model) => {
                return ["$url", url(`${this.baseUri}/${model.slug}/${object.id}`)];
            })
        });

        // Assign global middleware.
        this.add([
            'APIRequest',
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

        this.add(function APINotFound(request,response,next) {
            return response.sendStatus(404);
        });
    }
}

module.exports = APIModule;