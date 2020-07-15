var express    = require("express");
var router     = express.Router({mergeParams: true}); 
var Personalidade = require("../models/personalidade");
var Comment    = require("../models/comment");
var middleware = require("../middleware");

//Comments New
router.get("/new", middleware.isLoggedIn, function(req, res) {
    //find personalidade by Id
//    console.log(req.params.id);
    Personalidade.findById(req.params.id, function(err, personalidade){
        if(err){
            console.log(err);
        } else{
            res.render("comments/new", {personalidade: personalidade});
        }
    });
});

//Comments Create
router.post("/", middleware.isLoggedIn, function(req, res){
    //looup personalidade using ID
    Personalidade.findById(req.params.id, function(err, personalidade) {
       if(err){
           console.log(err);
           res.redirect("/personalidades");
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
                  personalidade.comments.push(comment._id);
                  personalidade.save();
                  req.flash("success","Comentário adicionado com sucesso!");
                  res.redirect("/personalidades/" + personalidade._id);
              }
          });
       }
    });
});

// Comments Edit route
router.get("/:comment_id/edit", middleware.checkCommentOwnership,function(req, res){
    Personalidade.findById(req.params.id, function(err, foundPersonalidade) {
        if(err || !foundPersonalidade){
            req.flash("error", "A personalidade não foi encontrada");
            return res.redirect("back");
        }
         Comment.findById(req.params.comment_id, function(err, foundComment) {
            if(err){
                res.redirect("back");
            } else {
                res.render("comments/edit", {personalidade_id:req.params.id, comment:foundComment});
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
            res.redirect("/personalidades/" + req.params.id);
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
            res.redirect("/personalidades/" + req.params.id);
        }
    });
});

module.exports = router;