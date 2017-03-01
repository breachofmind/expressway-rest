module.exports = {
    middleware: [
        'Init',
        'APIRequest',
        'Localization',
        'BodyParser',
        'Session',
        'BasicAuth'
    ],
    paths: [
        {
            "GET    /"              : 'RESTController.index',
            "GET    /locale"        : 'RESTController.locale',
            "GET    /:model"        : 'RESTController.fetchAll',
            "POST   /auth"          : 'RESTController.auth',
            "POST   /:model"        : 'RESTController.create',
            "POST   /:model/search" : 'RESTController.search',
            "GET    /:model/:id"    : 'RESTController.fetchOne',
            "PUT    /:model/:id"    : 'RESTController.update',
            "DELETE /:model"        : 'RESTController.trashMany',
            "DELETE /:model/:id"    : 'RESTController.trash',
        }
    ],
    error: "APINotFound"
};