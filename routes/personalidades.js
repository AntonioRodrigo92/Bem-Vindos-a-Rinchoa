var express = require("express");
var router  = express.Router();
var Personalidade = require("../models/personalidade");
var middleware = require("../middleware");
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'dysijvrzq', 
  api_key: '924945763499264', 
  api_secret: '6U8P95P_-4KanhKiRK7AWbHekNU'
});


//INDEX - show all personalidades
router.get("/", function(req, res){
    // Get all personalidades from DB
    Personalidade.find({}, function(err, allPersonalidades){
       if(err){
           console.log(err);
       } else {
          res.render("personalidades/index",{personalidades:allPersonalidades});
       }
    });
});

//CREATE - add new personalidade to DB
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
    cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
      if(err) {
        req.flash('error', err.message);
        return res.redirect('back');
      }
      // add cloudinary url for the image to the personalidade object under image property
      req.body.personalidade.image = result.secure_url;
      // add image's public_id to personalidade object
      req.body.personalidade.imageId = result.public_id;
      // add author to personalidade
      req.body.personalidade.author = {
        id: req.user._id,
        username: req.user.username
      }
      Personalidade.create(req.body.personalidade, function(err, personalidade) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect('back');
        }
        res.redirect('/personalidades/' + personalidade.id);
      });
    });
});

//NEW - show form to create new personalidade
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("personalidades/new"); 
});

// SHOW - shows more info about one personalidade
router.get("/:id", function(req, res){
    //find the personalidade with provided ID
    Personalidade.findById(req.params.id).populate("comments").exec(function(err, foundPersonalidade){
        if(err || !foundPersonalidade){
            req.flash("error", "Personalidade não encontrada");
            res.redirect("back");
        } else {
//            console.log(foundPersonalidade)
            //render show template with that personalidade
            res.render("personalidades/show", {personalidade: foundPersonalidade});
        }
    });
});

// EDIT personalidade ROUTE
router.get("/:id/edit", middleware.checkPersonalidadeOwnership, function(req, res){
    Personalidade.findById(req.params.id, function(err, foundPersonalidade){
        res.render("personalidades/edit", {personalidade: foundPersonalidade});
    });
});

// UPDATE personalidade ROUTE
router.put("/:id", middleware.checkPersonalidadeOwnership, upload.single('image'), function(req, res){
    // find and update the correct personalidade
    Personalidade.findById(req.params.id, async function(err, personalidade){
       if(err){
		   req.flash("error", err.message)
           res.redirect("/personalidades");
       } else {
           //redirect somewhere(show page)
		   	if(req.file) {
				try {
					await cloudinary.v2.uploader.destroy(personalidade.imageId); 
					var result = await cloudinary.v2.uploader.upload(req.file.path); 
					personalidade.imageId = result.public_id;
					personalidade.image = result.secure_url;
				} catch(err) {
					return res.redirect("/personalidades");
				}
			}
			personalidade.name = req.body.personalidade.name;
			personalidade.description = req.body.personalidade.description;
			personalidade.save();
			res.redirect("/personalidades/" + req.params.id);
       }
    });
});

// DESTROY personalidade ROUTE
router.delete("/:id", middleware.checkPersonalidadeOwnership, function(req, res){
   Personalidade.findById(req.params.id, async function(err, personalidade){
      if(err){
          req.flash("error", err.message)
           return res.redirect("/personalidades");
      }
	   try {
		   await cloudinary.v2.uploader.destroy(personalidade.imageId);
		   personalidade.remove();
		   req.flash("success", "personalidade apagada com sucesso!")
		   return res.redirect("/personalidades");
	   } catch (err) {
			if (err) {
				req.flash("error", err.message)
           		return res.redirect("/personalidades");
			}
		}
   });
});


module.exports = router;

