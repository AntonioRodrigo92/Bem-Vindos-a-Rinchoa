var express = require("express");
var router  = express.Router();
var Evento = require("../models/evento");
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


//INDEX - show all EVENTOS
router.get("/", function(req, res){
    // Get all eventos from DB
    Evento.find({}, function(err, allEventos){
       if(err){
           console.log(err);
       } else {
          res.render("eventos/index",{eventos:allEventos});
       }
    });
});


//CREATE - add new EVENTO to DB
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
    cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
      if(err) {
        req.flash('error', err.message);
        return res.redirect('back');
      }
      // add cloudinary url for the image to the evento object under image property
      req.body.evento.image = result.secure_url;
      // add image's public_id to evento object
      req.body.evento.imageId = result.public_id;
      // add author to evento
      req.body.evento.author = {
        id: req.user._id,
        username: req.user.username
      }
      Evento.create(req.body.evento, function(err, evento) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect('back');
        }
        res.redirect('/eventos/' + evento.id);
      });
    });
});

//NEW - show form to create new EVENTO
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("eventos/new"); 
});

// SHOW - shows more info about one evento
router.get("/:id", function(req, res){
    //find the evento with provided ID
    Evento.findById(req.params.id).populate("comments").exec(function(err, foundEvento){
        if(err || !foundEvento){
            req.flash("error", "Evento não encontrado");
            res.redirect("back");
        } else {
//            console.log(foundEvento)
            //render show template with that evento
            res.render("eventos/show", {evento: foundEvento});
        }
    });
});

// EDIT EVENTO ROUTE
router.get("/:id/edit", middleware.checkEventoOwnership, function(req, res){
    Evento.findById(req.params.id, function(err, foundEvento){
        res.render("eventos/edit", {evento: foundEvento});
    });
});

// UPDATE EVENTO ROUTE
router.put("/:id", middleware.checkEventoOwnership, upload.single('image'), function(req, res){
    // find and update the correct evento
    Evento.findById(req.params.id, async function(err, evento){
       if(err){
		   req.flash("error", err.message)
           res.redirect("/eventos");
       } else {
           //redirect somewhere(show page)
		   	if(req.file) {
				try {
					await cloudinary.v2.uploader.destroy(evento.imageId); 
					var result = await cloudinary.v2.uploader.upload(req.file.path); 
					evento.imageId = result.public_id;
					evento.image = result.secure_url;
				} catch(err) {
					return res.redirect("/eventos");
				}
			}
			evento.name = req.body.evento.name;
			evento.date = req.body.evento.date;
		   evento.description = req.body.evento.description;
			evento.save();
			res.redirect("/eventos/" + req.params.id);
       }
    });
});


// DESTROY EVENTO ROUTE
router.delete("/:id", middleware.checkEventoOwnership, function(req, res){
      Evento.findById(req.params.id, async function(err, evento){
      if(err){
          req.flash("error", err.message)
           return res.redirect("/eventos");
      }
	   try {
		   await cloudinary.v2.uploader.destroy(evento.imageId);
		   evento.remove();
		   req.flash("success", "evento apagado com sucesso!")
		   return res.redirect("/eventos");
	   } catch (err) {
			if (err) {
				req.flash("error", err.message)
           		return res.redirect("/eventos");
			}
		}
   });
});


module.exports = router;