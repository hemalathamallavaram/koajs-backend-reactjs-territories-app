const mongoose = require('mongoose');
const Territory = mongoose.model('Territory');
const Article = mongoose.model('Article');


module.exports.asParameter = async function(territoryId, ctx, next) {
  try {
    let territory = await Territory.findOne({
      _id: territoryId,
    });
    if(!territory) return;
    if(!ctx.parameters) {
      ctx.parameters = {};
    }
    ctx.parameters.territory = territory;
    return next();
  } catch(e) {
    if(e instanceof mongoose.Error.CastError) {
      return;
    }
    throw e;
  }
};

module.exports.one = async function(ctx) {
  ctx.body = {
    territory: ctx.parameters.territory,
  };
};

module.exports.all = async function(ctx) {
  ctx.body = {
    territories: await Territory.find(),
  };
};

module.exports.create = async function(ctx) {
  try {
    ctx.body = {
      success: true,
      territory: await new Territory(ctx.request.body).save(),
    };
  } catch(e) {
    if(e instanceof mongoose.Error.ValidationError) {
      ctx.body = {
        success: false,
        errors: e.errors,
      };
    } else {
      throw e;
    }
  }
};

module.exports.update = async function(ctx) {
  try {
    ctx.parameters.territory.set(ctx.request.body);
    ctx.body = {
      success: true,
      territory: await ctx.parameters.territory.save(),
    };
  } catch(e) {
    if(e instanceof mongoose.Error.ValidationError) {
      ctx.body = {
        success: false,
        errors: e.errors,
      };
    } else {
      throw e;
    }
  }
};

module.exports.articles = async function(ctx) {
  try{
    ctx.body = {
      success: true,
      articles: await Article.find({territories:ctx.parameters.territory})
    };
  }catch(e){
    if(e instanceof mongoose.Error.ValidationError) {
      ctx.body = {
        success: false,
        errors: e.errors,
      };
    } else {
      throw e;
    }
  }
};
