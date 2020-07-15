var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    flash       = require("connect-flash"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    Personalidade  = require("./models/personalidade"),
	Local = require("./models/local"),
	Evento = require("./models/evento"),
    Comment     = require("./models/comment"),
    User        = require("./models/user"),
    seedDB      = require("./seeds")
    
//requiring routes
var commentRoutes    = require("./routes/comments"),
	commentLocaisRoutes = require("./routes/commentsLocais"),
	commentEventosRoutes = require("./routes/commentsEventos"),
    personalidadeRoutes = require("./routes/personalidades"),
	localRoutes = require("./routes/locais"),
	eventoRoutes = require("./routes/eventos"),
    indexRoutes      = require("./routes/index")
    
//mongoose.connect("mongodb://localhost/rinchoa", { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect("mongodb+srv://--USER--:--PASSWORD--@cluster0-gh4j5.mongodb.net/test?retryWrites=true&w=majority", {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true
}).then(() => {
	console.log("connected do DB");
}).catch(err => {
	console.log("Error:", err.message);
});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
//seedDB(); //seed the database

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "RINCHOA STRESS: Globo Junior!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

app.use("/", indexRoutes);
app.use("/personalidades", personalidadeRoutes);
app.use("/personalidades/:id/comments", commentRoutes);
app.use("/locais", localRoutes);
app.use("/locais/:id/commentsLocais", commentLocaisRoutes);
app.use("/eventos", eventoRoutes);
app.use("/eventos/:id/commentsEventos", commentEventosRoutes);

/*app.listen(process.env.PORT, process.env.IP);*/


//PARA GOORM IDE!!!
app.listen(3000, function(){
   console.log("The Server Has Started!");
});