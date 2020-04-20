const Router = require('koa-router');

const articleController = require('../controllers/articles');
const territoryController = require('../controllers/territories');


const api = new Router();
api.prefix('/api');

api.param('articleId', articleController.asParameter);
// api.param('territoryId', articleController.asParameter);


api.get('/articles/', articleController.all);
api.post('/articles/', articleController.create);
api.get('/articles/:articleId/', articleController.one);
api.put('/articles/:articleId/', articleController.update);
api.delete('/articles/:articleId',articleController.delete);

api.param('territoryId', territoryController.asParameter);

api.get('/territories/', territoryController.all);
api.post('/territories/', territoryController.create);
api.get('/territories/:territoryId/', territoryController.one);

api.put('/territories/:territoryId/', territoryController.update);

api.get('/articlesInATerritory/:territoryId',territoryController.articles);


module.exports = api;
