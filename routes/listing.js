const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const{isLoggedIn, isOwner,validateListing} = require("../middleware.js"); 
const listingController = require("../controllers/listings.js");
const multer = require("multer"); // for parse text data to file data
const{storage} = require("../cloudConfig.js"); // for storing file data in cloud
const upload = multer({storage});  
 

router.route("/")
.get(wrapAsync(listingController.index)) // this index fun present in controller(listing.js)
.post(
  isLoggedIn,
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(listingController.createListing)
);

 //New Route
 router.get("/new",isLoggedIn,listingController.renderNewForm);


router.route("/:id")
.get(wrapAsync(listingController.showListing )) //show route

.put(isLoggedIn,  // update route
  isOwner,
  upload.single("listing[image]"), // multer parse the images
  validateListing,
   wrapAsync(listingController.updatelisting)
  )
.delete(isLoggedIn,   // delete route
  isOwner,
  wrapAsync(listingController.destroyListing)
);
 
  //Edit Route
  router.get("/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.renderEditForm));
   
  
module.exports = router;
     
 

 
  