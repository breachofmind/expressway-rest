"use strict";

var Extension = require('expressway').Extension;

/**
 * Adds a REST API to your Expressway app.
 * @author Mike Adamczyk <mike@bom.us>
 */
class APIExtension extends Extension
{
    constructor(app,config)
    {
        super(app);

        this.alias   = "api";
        this.auth    = config('api.auth', false);
        this.base    = config('api.base',"/api/v1");
        this.title   = config('api.name',"Expressway API v1");
        this.package = require('../package.json');

        app.use([
            require('expressway/src/providers/ModelProvider'),
            require('expressway-auth'),
            require('./middlewares'),
            require('./controllers/RESTController'),
        ]);

        this.routes.middleware([
            'Init',
            'APIRequest',
            'Localization',
            'BodyParser',
            'Session',
            'BasicAuth'
        ]);

        this.routes.add([
            {
                "GET    /"              : 'RESTController.index',
                "GET    /locale"        : 'RESTController.locale',
                "GET    /:model"        : 'RESTController.fetchAll',
                "POST   /auth"          : 'RESTController.auth',
                "POST   /:model"        : 'RESTController.create',
                "POST   /:model/search" : 'RESTController.search',
                "GET    /:model/:id"    : 'RESTController.fetchOne',
                "PUT    /:model/:id"    : 'RESTController.update',
                "DELETE /:model/:id"    : 'RESTController.trash',
            }
        ]);

        this.routes.error(404, 'APINotFound');
    }

    /**
     * When all classes are constructed.
     * @injectable
     * @param next Function
     * @param app Application
     * @param url URLService
     */
    boot(next,app,url)
    {
        // Add a helper method for the URL service.
        url.extend('api', this.base);

        // Attach the object API url to the json response.
        app.on('model.toJSON', (json,model,object) => {
            json.$url = url.api(`${model.slug}/${object.id}`);
        });

        super.boot(next);
    }
}


module.exports = APIExtension;