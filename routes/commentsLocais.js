var express    = require("express");
var router     = express.Router({mergeParams: true}); 
var Local = require("../models/local");
var Comment    = require("../models/comment");
var middleware = require("../middleware");

//Comments New
router.get("/newLocal", middleware.isLoggedIn, function(req, res) {
    //find local by Id
//    console.log(req.params.id);
    Local.findById(req.params.id, function(err, local){
        if(err){
            console.log(err);
        } else{
            res.render("comments/newLocal", {local: local});
        }
    });
});

//Comments Create
router.post("/", middleware.isLoggedIn, function(req, res){
    //looup local using ID
    Local.findById(req.params.id, function(err, local) {
       if(err){
           console.log(err);
           res.redirect("/locais");
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
                  local.comments.push(comment._id);
                  local.save();
                  req.flash("success","Comentário adicionado com sucesso!");
                  res.redirect("/locais/" + local._id);
              }
          });
       }
    });
});

// Comments Edit route
router.get("/:comment_id/editLocal", middleware.checkCommentOwnership,function(req, res){
    Local.findById(req.params.id, function(err, foundLocal) {
        if(err || !foundLocal){
            req.flash("error", "O Local não foi encontrado");
            return res.redirect("back");
        }
         Comment.findById(req.params.comment_id, function(err, foundComment) {
            if(err){
                res.redirect("back");
            } else {
                res.render("comments/editLocal", {local_id:req.params.id, comment:foundComment});
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
            res.redirect("/locais/" + req.params.id);
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
            res.redirect("/locais/" + req.params.id);
        }
    });
});

module.exports = router;