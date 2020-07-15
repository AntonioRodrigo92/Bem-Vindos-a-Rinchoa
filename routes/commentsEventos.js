var express    = require("express");
var router     = express.Router({mergeParams: true}); 
var Evento = require("../models/evento");
var Comment    = require("../models/comment");
var middleware = require("../middleware");

//Comments New
router.get("/newEvento", middleware.isLoggedIn, function(req, res) {
    //find evento by Id
//    console.log(req.params.id);
    Evento.findById(req.params.id, function(err, evento){
        if(err){
            console.log(err);
        } else{
            res.render("comments/newEvento", {evento: evento});
        }
    });
});

//Comments Create
router.post("/", middleware.isLoggedIn, function(req, res){
    //looup evento using ID
    Evento.findById(req.params.id, function(err, evento) {
       if(err){
           console.log(err);
           res.redirect("/eventos");
       } else {
           
          Comment.create(req.body.comment, function(err, comment){
              if(err){
                  req.flash("error","Algo correu mal...");
                  console.log(err);
              } else {
                  //add username and id to comment
                  comment.author.id = req.user._id;
                  comment.author.username = req.user.username;
                  //save comment
                  comment.save();
                  evento.comments.push(comment._id);
                  evento.save();
                  req.flash("success","Comentário adicionado com sucesso!");
                  res.redirect("/eventos/" + evento._id);
              }
          });
       }
    });
});

// Comments Edit route
router.get("/:comment_id/editEvento", middleware.checkCommentOwnership,function(req, res){
    Evento.findById(req.params.id, function(err, foundEvento) {
        if(err || !foundEvento){
            req.flash("error", "O Evento não foi encontrado");
            return res.redirect("back");
        }
         Comment.findById(req.params.comment_id, function(err, foundComment) {
            if(err){
                res.redirect("back");
            } else {
                res.render("comments/editEvento", {evento_id:req.params.id, comment:foundComment});
        }
    });
        
    });
});

// Comments Update
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedcomment){
        if(err){
            res.redirect("back");
        } else {
            res.redirect("/eventos/" + req.params.id);
        }
    });
});

//Commente Destroy route
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        } else {
            req.flash("success","Comentário Apagado!");
            res.redirect("/eventos/" + req.params.id);
        }
    });
});

module.exports = router;