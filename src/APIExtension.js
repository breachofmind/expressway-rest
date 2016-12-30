"use strict";

var Extension = require('expressway').Extension;

/**
 * Adds a REST API to your Expressway app.
 * @author Mike Adamczyk <mike@bom.us>
 */
class APIExtension extends Extension
{
    constructor(app)
    {
        super(app);

        this.alias = "api";
        this.auth = false;

        this.package = require('../package.json');
        this.base = "/api/v1";
        this.apiName = "Expressway API v1";

        app.use([
            require('expressway/src/providers/ModelProvider'),
            require('./middlewares/APIAuth'),
            require('./middlewares/APIModelById'),
            require('./middlewares/APIModelRequest'),
            require('./middlewares/APIModelSearch'),
            require('./middlewares/APIPaging'),
            require('./middlewares/APIRequest'),
            require('./controllers/RESTController'),
            require('expressway-auth'),
        ]);

        this.middleware = [
            'Init',
            'APIRequest',
            'Localization',
            'BodyParser',
            'Session',
            'BasicAuth'
        ];

        /**
         * API Routes.
         * @type {[*]}
         */
        this.routes = [
            {
                "GET    /"              : 'RESTController.index',
                "GET    /locale"        : 'RESTController.locale',
                "GET    /:model"        : 'RESTController.fetchAll',
                "POST   /:model"        : 'RESTController.create',
                "POST   /:model/search" : 'RESTController.search',
                "GET    /:model/:id"    : 'RESTController.fetchOne',
                "PUT    /:model/:id"    : 'RESTController.update',
                "DELETE /:model/:id"    : 'RESTController.trash',
            },
            function APINotFound(request,response,next) {
                return response.sendStatus(404);
            }
        ];
    }

    /**
     * When all classes are constructed.
     * @param app
     * @param url
     */
    boot(app,url)
    {
        app.alias('api', this.base);

        // Add a helper method for the URL service.
        url.api = function(uri="") {
            return this.get([app.alias('api'),uri]);
        }

        // For each model's JSON output, append an API url.
        app.models.each(blueprint => {
            blueprint.appends.push((object,model) => {
                return ["$url", url.api(`${model.slug}/${object.id}`)];
            });
        });

        super.boot(app);
    }
}


module.exports = APIExtension;