import express from "express";
import bodyParser from "body-parser";
import env from "dotenv";

const app = express();
env.config();
const port = process.env.API_PORT;
const masterKey = process.env.LOCATIONS_API_MASTERKEY;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); //Important to parse incoming JSON requests

//1. GET a random location
app.get("/locations/random", (req, res) => {
  try {
    if (!Array.isArray(locations) || locations.length === 0) {
      throw new Error("No locations available") //If error occurs, interpreter jumps to catch block and assigns this specified error to error.message
    }

    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    res.json(randomLocation);
  } catch (error) {
    res.status(500).json({ Error: error.message || "Something went wrong" })
  }
});

// 2. GET a specific location
app.get("/locations/:id", (req, res) => {
  try {
    const locationIdParam = parseInt(req.params.id);

    if (isNaN(locationIdParam)) {
      return res.status(400).json({ Error: "Invalid parameter entered, must be a number!" });
    }

    const foundLocation = locations.find((location) => {
      return location.id === locationIdParam     //EXPLICIT RETURN
    });

    if (!foundLocation) {
      return res.status(404).json({ Error: "Location not found, try a valid location id." });
    }

    res.json({ location: foundLocation });
  } catch (error) {
    res.status(500).json({ Error: error.message || "Something went wrong" })
  }

});

// THE FOLLOWING TWO OPTIONS WORK AS WELL AS THE ABOVE OPTION
/*
app.get("/locations/:id", (req, res) => {
  const locationId = parseInt(req.params.id);
  const exactLocation = locations[locationId - 1];
  res.json(exactLocation);
  });
*/

/*
IMPLICIT RETURN
app.get("/locations/:id", (req, res) => {
  const locationParam = parseInt(req.params.id);
  const foundLocation = locations.find((location) =>
      location.id === locationParam);
  res.json(foundLocation);
});
*/

//3. GET locations by filtering on the location type
app.get("/locations/chunk/filter", (req, res) => {
  const locationTypeQuery = req.query.type;
  console.log(locationTypeQuery);
  const filterLocations = locations.filter((location) => location.locationType == locationTypeQuery); //IMPLICIT RETURN
  res.json(filterLocations);
});

//4. POST a new location
app.post("/locations", (req, res) => {
  const { name, type, mapURL, affordability, rating } = req.body;
  const id = locations.length + 1;
  const newLocation = {
    id: id,
    locationName: name,
    locationType: type,
    mapURL: mapURL,
    affordability: affordability,
    rating: rating,
  };
  locations.push(newLocation);
  res.json(newLocation);
  console.log(locations.slice(-1));
});

//5. PUT a location
app.put("/locations/:id", (req, res) => {
  const locationId = parseInt(req.params.id);
  const { name, type, mapURL, affordability, rating } = req.body;
  let locationIndex = locations.findIndex((location) => location.id === locationId)
  let exactLocation = locations[locationIndex];
  exactLocation = {
    id: exactLocation.id,
    locationName: name,
    locationType: type,
    mapURL: mapURL,
    affordability: affordability,
    rating: rating,
  }
  res.json(exactLocation);
  console.log(exactLocation);
});

// THE FOLLOWING OPTION WORKS AS WELL AS THE ABOVE OPTION
/*
app.put("/locations/:id", (req, res) => {
  const locationId = parseInt(req.params.id);
  const { name, type, mapURL, affordability, rating } = req.body;
  let exactLocation = locations[locationId - 1];
  exactLocation = {
    id: exactLocation.id,
    locationName: name,
    locationType: type,
    mapURL: mapURL,
    affordability: affordability,
    rating: rating,
  };
  res.json(exactLocation);
  console.log(exactLocation);
});
*/

//6. PATCH a location
app.patch("/locations/:id", (req, res) => {
  const locationId = parseInt(req.params.id);
  const { name, type, mapURL, affordability, rating } = req.body;
  let existingLocation = locations.find((location) => location.id == locationId);
  let replacementLocation = {
    id: existingLocation.id,
    locationName: name || existingLocation.locationName, //the 'OR' is for cases where the user doesn't enter a value for the inputs since it's a patch request
    locationType: type || existingLocation.locationType,
    mapURL: mapURL || existingLocation.mapURL,
    affordability: affordability || existingLocation.affordability,
    rating: rating || existingLocation.rating,
  };
  let locationIndex = locations.findIndex((location) => location.id == locationId);
  locations[locationIndex] = replacementLocation;
  res.json(replacementLocation);
  console.log(replacementLocation);
});

// THE FOLLOWING OPTION WORKS AS WELL AS THE ABOVE OPTION
/*
app.patch("/locations/:id", (req, res) => {
let exactLocation = locations[locationId - 1];
  exactLocation = {
    id: exactLocation.id,
    locationName: name || exactLocation.locationName, //the 'OR' is for cases where the user doesn't enter a value for the inputs since it's a patch request
    locationType: type || exactLocation.locationType,
    mapURL: mapURL || exactLocation.mapURL,
    affordability: affordability || exactLocation.affordability,
    rating: rating || exactLocation.rating,
  };
  res.json(exactLocation);
  console.log(exactLocation);
});
*/

//7. DELETE a specific location
app.delete("/locations/:id", (req, res) => {
  let locationId = parseInt(req.params.id);

  let locationIndex = locations.findIndex((location) => location.id === locationId);
  if (locationIndex > -1) {
    locations.splice(locationIndex, 1);
    // res.status(200).send("OK!");
    res.sendStatus(200);
  } else {
    // res.status(404).json({ error: `Location with id: ${id} not found. No locations were deleted.` })
    res.status(404).json({
      error: `location with id: ${locationId} not found. No locations were deleted.`,
    });
    console.log({
      error: `location with id: ${locationId} not found. No locations were deleted.`,
    });
  }
});

//8. DELETE All locations
app.delete("/locations/all", (req, res) => {
  let userKey = req.body.key;
  if (userKey === masterKey) {
    locations = [];
    res.sendStatus(200);
  } else {
    res
      .status(404)
      .json({ error: `You are not Authorized to perform this action` });
  }
});

app.listen(port, () => {
  console.log(`API running on port http://localhost:${port}`);
});

var locations = [
  {
    id: 1,
    locationName: "The Junkyard grills, Central Area, Abuja.",
    locationType: "indoor/outdoor",
    mapURL: "https://www.google.com/maps/place/The+Junkyard+Grills/@9.0656501,7.4871531,17z/data=!3m1!4b1!4m6!3m5!1s0x104e0b876430e6b3:0xaa7826a359e8ae70!8m2!3d9.0656501!4d7.489728!16s%2Fg%2F11g232csty?entry=ttu&g_ep=EgoyMDI1MDIwNS4xIKXMDSoASAFQAw%3D%3D",
    affordability: "3.5/5",
    rating: "4/5",
  },
  {
    id: 2,
    locationName: "The Pasha Restaurant, Maitama, Abuja.",
    locationType: "indoor",
    mapURL: "https://www.google.com/maps/place/The+Pasha/@9.0754602,7.4961043,17z/data=!4m9!3m8!1s0x104e0a4940cc7e1f:0x9d201249e6ad70ab!5m2!4m1!1i2!8m2!3d9.0754602!4d7.4986792!16s%2Fg%2F1v1m909v?entry=ttu&g_ep=EgoyMDI1MDIwNS4xIKXMDSoASAFQAw%3D%3D",
    affordability: "3/5",
    rating: "4.5/5",
  },
  {
    id: 3,
    locationName: "The Milkshop and Breakfast company, Maitama, Abuja",
    locationType: "indoor",
    mapURL: "https://www.google.com/maps/place/The+Breakfast+Company/@9.0873612,7.4936229,17z/data=!4m10!1m2!2m1!1sThe+Milkshop+and+Breakfast+company,+Maitama,+Abuja!3m6!1s0x104e0af9aaaaaaab:0xeaf2216f682d03aa!8m2!3d9.0873612!4d7.4983865!15sCjJUaGUgTWlsa3Nob3AgYW5kIEJyZWFrZmFzdCBjb21wYW55LCBNYWl0YW1hLCBBYnVqYVoyIjB0aGUgbWlsa3Nob3AgYW5kIGJyZWFrZmFzdCBjb21wYW55IG1haXRhbWEgYWJ1amGSARRicmVha2Zhc3RfcmVzdGF1cmFudOABAA!16s%2Fg%2F11knncwhs6?entry=ttu&g_ep=EgoyMDI1MDIwNS4xIKXMDSoASAFQAw%3D%3D",
    affordability: "4.5/5",
    rating: "3.5/5"
  },
  {
    id: 4,
    locationName: "Truck Central, Central Business District, Abuja",
    locationType: "outdoor",
    mapURL: "https://www.google.com/maps/place/Truck+Central/@9.0554115,7.4729394,17z/data=!3m1!4b1!4m6!3m5!1s0x104e0b26dd10aed1:0xc6882c6bc9e0d958!8m2!3d9.0554115!4d7.4755143!16s%2Fg%2F11txgxfls2?entry=ttu&g_ep=EgoyMDI1MDIwNS4xIKXMDSoASAFQAw%3D%3D",
    affordability: "3/5",
    rating: "4.5/5"
  },
  {
    id: 5,
    locationName: "Jabi Boat Club, Jabi, Abuja",
    locationType: "indoor/outdoor",
    mapURL: "https://www.google.com/maps/place/The+Boat+Club/@9.0704918,7.4098442,16.4z/data=!4m6!3m5!1s0x104e75a6db04f073:0xea51a3b8bd7f150f!8m2!3d9.0697441!4d7.4146742!16s%2Fg%2F11fkdh7_5_?entry=ttu&g_ep=EgoyMDI1MDIwOS4wIKXMDSoASAFQAw%3D%3D",
    affordability: "3.2/5",
    rating: "4.7/5"
  },
  {
    id: 6,
    locationName: "Otega Restaurant 24/7, Wuse 2, Abuja",
    locationType: "indoor",
    mapURL: "https://www.google.com/maps?sca_esv=3a30a683573ba2c0&output=search&q=otega+restaurant+abuja&source=lnms&fbs=ABzOT_CWdhQLP1FcmU5B0fn3xuWpA-dk4wpBWOGsoR7DG5zJBv10Kbgy3ptSBM6mMfaz8zA4dsQnj5xEL8e8yrf6YrQm2qFvxjgbs3veW7IUFM9xHvD0ItLpuFy20BiHDRg8UkwegrJm9FjVXkCMs8DR7asGIoaBVTYmq2yX0eKyl6pRp3mZqNQ4WtReciBlhE1JgAnshoNQ&entry=mc&ved=1t:200715&ictx=111",
    affordability: "4/5",
    rating: "4.7/5"
  },
  {
    id: 7,
    locationName: "Kebabs & Kurries, Wuse 2, Abuja",
    locationType: "indoor",
    mapURL: "https://www.google.com/maps/place/Kebabs+%26+Kurries+Restaurant/@9.0822106,7.4668932,17z/data=!3m1!4b1!4m6!3m5!1s0x104e0b5a0923a7b9:0x15af6c7556150075!8m2!3d9.0822106!4d7.4694681!16s%2Fg%2F11sbhn6_nc?entry=ttu&g_ep=EgoyMDI1MDIxMi4wIKXMDSoASAFQAw%3D%3D",
    affordability: "4/5",
    rating: "4.2/5"
  },

]

