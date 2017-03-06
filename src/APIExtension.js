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

        this.routes.use(require('./config/routes'));
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
            json.$url = `/${model.slug}/${object.id}`;
        });

        super.boot(next);
    }
}


module.exports = APIExtension;