var Personalidade = require("../models/personalidade");
var Comment    = require("../models/comment");
var Local = require("../models/local");
var Evento = require("../models/evento");

var middlewareObj = {};

middlewareObj.checkPersonalidadeOwnership = function(req, res, next){
    if(req.isAuthenticated()){
          Personalidade.findById(req.params.id, function(err, foundPersonalidade){
            if(err || !foundPersonalidade){
                req.flash("error","Personalidade não encontrada");
              res.redirect("back");
             } else {
                  //does user own the personalidade?
                 if(foundPersonalidade.author.id.equals(req.user._id)){
                     next();
                 } else {
                     req.flash("error","Não tens permissões para fazer isso");
                     res.redirect("back");
                 }
            }
        });
    } else {
        req.flash("error", "É necessário fazeres o LogIn");
       res.redirect("back");
    }
};

middlewareObj.checkLocalOwnership = function(req, res, next){
    if(req.isAuthenticated()){
          Local.findById(req.params.id, function(err, foundLocal){
            if(err || !foundLocal){
                req.flash("error","Local não encontrado");
              	res.redirect("back");
             } else {
                  //does user own the local?
                 if(foundLocal.author.id.equals(req.user._id)){
                     next();
                 } else {
                     req.flash("error","Não tens permissões para fazer isso");
                     res.redirect("back");
                 }
            }
        });
    } else {
        req.flash("error", "É necessário fazeres o LogIn");
       res.redirect("back");
    }
};

middlewareObj.checkEventoOwnership = function(req, res, next){
    if(req.isAuthenticated()){
          Evento.findById(req.params.id, function(err, foundEvento){
            if(err || !foundEvento){
                req.flash("error","Evento não encontrado");
              	res.redirect("back");
             } else {
                  //does user own the local?
                 if(foundEvento.author.id.equals(req.user._id)){
                     next();
                 } else {
                     req.flash("error","Não tens permissões para fazer isso");
                     res.redirect("back");
                 }
            }
        });
    } else {
        req.flash("error", "É necessário fazeres o LogIn");
       res.redirect("back");
    }
};

middlewareObj.checkCommentOwnership = function(req, res, next){
    if(req.isAuthenticated()){
          Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err || !foundComment){
              req.flash("error", "Comentário não encontrado");
              res.redirect("back");
             } else {
                  //does user own the comment?
                 if(foundComment.author.id.equals(req.user._id)){
                     next();
                 } else {
                     req.flash("error","Não tens permissões para fazer isso");
                     res.redirect("back");
                 }
            }
        });
    } else {
        req.flash("error","É necessário fazeres o LogIn");
       res.redirect("back");
    }
};


//middleware
middlewareObj.isLoggedIn = function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "É necessário fazeres o LogIn");
    res.redirect("/login");
};


module.exports = middlewareObj;