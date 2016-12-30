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
            require('./middlewares'),
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
            'APINotFound'
        ];
    }

    /**
     * When all classes are constructed.
     * @injectable
     * @param app Application
     * @param url URLService
     */
    boot(app,url)
    {
        app.alias('api', this.base);

        // Add a helper method for the URL service.
        url.extend({
            api(uri) {return this.get([app.alias('api')].concat(uri)) }
        });


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