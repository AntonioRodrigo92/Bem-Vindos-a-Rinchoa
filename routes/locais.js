var express = require("express");
var router  = express.Router();
var Local = require("../models/local");
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


//INDEX - show all LOCAIS
router.get("/", function(req, res){
    // Get all locais from DB
    Local.find({}, function(err, allLocais){
       if(err){
           console.log(err);
       } else {
          res.render("locais/index",{locais:allLocais});
       }
    });
});


//CREATE - add new LOCAL to DB
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
    cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
      if(err) {
        req.flash('error', err.message);
        return res.redirect('back');
      }
      // add cloudinary url for the image to the local object under image property
      req.body.local.image = result.secure_url;
      // add image's public_id to local object
      req.body.local.imageId = result.public_id;
      // add author to local
      req.body.local.author = {
        id: req.user._id,
        username: req.user.username
      }
      Local.create(req.body.local, function(err, local) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect('back');
        }
        res.redirect('/locais/' + local.id);
      });
    });
});

//NEW - show form to create new LOCAL
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("locais/new"); 
});

// SHOW - shows more info about one LOCAL
router.get("/:id", function(req, res){
    //find the local with provided ID
    Local.findById(req.params.id).populate("comments").exec(function(err, foundLocal){
        if(err || !foundLocal){
            req.flash("error", "Local não encontrado");
            res.redirect("back");
        } else {
//            console.log(foundLocal)
            //render show template with that local
            res.render("locais/show", {local: foundLocal});
        }
    });
});

// EDIT LOCAL ROUTE
router.get("/:id/edit", middleware.checkLocalOwnership, function(req, res){
    Local.findById(req.params.id, function(err, foundLocal){
        res.render("locais/edit", {local: foundLocal});
    });
});

// UPDATE LOCAL ROUTE
router.put("/:id", middleware.checkLocalOwnership, upload.single('image'), function(req, res){
    // find and update the correct local
    Local.findById(req.params.id, async function(err, local){
       if(err){
		   req.flash("error", err.message)
           res.redirect("/locais");
       } else {
           //redirect somewhere(show page)
		   	if(req.file) {
				try {
					await cloudinary.v2.uploader.destroy(local.imageId); 
					var result = await cloudinary.v2.uploader.upload(req.file.path); 
					local.imageId = result.public_id;
					local.image = result.secure_url;
				} catch(err) {
					return res.redirect("/locais");
				}
			}
			local.name = req.body.local.name;
		   local.description = req.body.local.description;
			local.save();
			res.redirect("/locais/" + req.params.id);
       }
    });
});


// DESTROY LOCAL ROUTE
router.delete("/:id",middleware.checkLocalOwnership, function(req, res){
   Local.findById(req.params.id, async function(err, local){
      if(err){
          req.flash("error", err.message)
           return res.redirect("/locais");
      }
	   try {
		   await cloudinary.v2.uploader.destroy(local.imageId);
		   local.remove();
		   req.flash("success", "local apagado com sucesso!")
		   return res.redirect("/locais");
	   } catch (err) {
			if (err) {
				req.flash("error", err.message)
           		return res.redirect("/locais");
			}
		}
   });
});


module.exports = router;