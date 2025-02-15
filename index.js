import express from "express";
import bodyParser from "body-parser";
import env from "dotenv";

// This is my first API that I built to handle all the HTTP routes.
// Once this API is hosted, the user of this API can make HTTP requests via the defined routes and will get the expected response.
// In order to test this API, we have to start this server. We may then use Postman to send the requests

const app = express();
env.config();
const port = process.env.API_PORT;
const masterKey = process.env.JOKES_API_MASTERKEY;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); //Necessary to parse incoming JSON response

//1. GET a random location
app.get("/random", (req, res) => {
  const randomLocation = locations[Math.round(Math.random() * locations.length)];
  res.json(randomLocation);
});

// 2. GET a specific location
app.get("/locations/:id", (req, res) => {
  const locationId = parseInt(req.params.id);
  const exactLocation = locations[locationId - 1];
  res.json(exactLocation);
});

// THE FOLLOWING TWO OPTIONS WORK AS WELL AS THE ABOVE OPTION
/*
EXPLICIT RETURN
app.get("/locations/:id", (req, res) => {
  const locationParam = parseInt(req.params.id);
  const foundLocation = locations.find((joke) => {
      location.id === locationParam
      return location;
    });
  res.json(foundLocation);
});
*/

/*
IMPLICIT RETURN
app.get("/locations/:id", (req, res) => {
  const locationParam = parseInt(req.params.id);
  const foundLocation = locations.find((joke) =>
      location.id === locationParam);
  res.json(foundLocation);
});
*/

//3. GET locations by filtering on the location type
app.get("/filter", (req, res) => {
  const locationTypeQuery = req.query.type;
  const filterLocations = location.filter((location) => location.locationType == locationTypeQuery);
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
    id: exactLocation.id,
    locationName: name || exactLocation.locationName, //the 'OR' is for cases where the user doesn't enter a value for the inputs since it's a patch request
    locationType: type || exactLocation.locationType,
    mapURL: mapURL || exactLocation.mapURL,
    affordability: affordability || exactLocation.affordability,
    rating: rating || exactLocation.rating,
  };
  let locationIndex = locations.findIndex((location) => location.id == locationId);
  locations[locationIndex] = replacementLocation;
  res.json(exactJoke);
  console.log(exactJoke);
});

// THE FOLLOWING OPTION WORKS AS WELL AS THE ABOVE OPTION
/*
app.patch("/jokes/:id", (req, res) => {
let exactLocation = locations[locationId - 1];
  exactLocation = {
    id: exactLocation.id,
    locationName: name || exactLocation.locationName, //the 'OR' is for cases where the user doesn't enter a value for the inputs since it's a patch request
    locationType: type || exactLocation.locationType,
    mapURL: mapURL || exactLocation.mapURL,
    affordability: affordability || exactLocation.affordability,
    rating: rating || exactLocation.rating,
  };
  res.json(exactJoke);
  console.log(exactJoke);
  console.log(jokes[jokeIndex]);
  res.json(replacementJoke);
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
    // res.status(404).json({ error: `Joke with id: ${id} not found. No jokes were deleted.` })
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
    jokes = [];
    res.sendStatus(200);
  } else {
    res
      .status(404)
      .json({ error: `You are not Authorized to perform this action` });
  }
});

app.listen(port, () => {
  console.log(`API running on port ${port}.`);
});

var locations = [
  {
    id: 1,
    locationName: "The Junkyard grills, Central Area, Abuja.",
    locationType: "Outdoor/indoor",
    mapURL: "https://www.google.com/maps/place/The+Junkyard+Grills/@9.0656501,7.4871531,17z/data=!3m1!4b1!4m6!3m5!1s0x104e0b876430e6b3:0xaa7826a359e8ae70!8m2!3d9.0656501!4d7.489728!16s%2Fg%2F11g232csty?entry=ttu&g_ep=EgoyMDI1MDIwNS4xIKXMDSoASAFQAw%3D%3D",
    affordability: "3.5/5",
    rating: "4/5",
  },
  {
    id: 2,
    locationName: "The Pasha Restaurant, Maitama, Abuja.",
    locationType: "Indoor",
    mapURL: "https://www.google.com/maps/place/The+Pasha/@9.0754602,7.4961043,17z/data=!4m9!3m8!1s0x104e0a4940cc7e1f:0x9d201249e6ad70ab!5m2!4m1!1i2!8m2!3d9.0754602!4d7.4986792!16s%2Fg%2F1v1m909v?entry=ttu&g_ep=EgoyMDI1MDIwNS4xIKXMDSoASAFQAw%3D%3D",
    affordability: "3/5",
    rating: "4.5/5",
  },
  {
    id: 3,
    locationName: "The Milkshop and Breakfast company, Maitama, Abuja",
    locationType: "Indoor/café",
    mapURL: "https://www.google.com/maps/place/The+Breakfast+Company/@9.0873612,7.4936229,17z/data=!4m10!1m2!2m1!1sThe+Milkshop+and+Breakfast+company,+Maitama,+Abuja!3m6!1s0x104e0af9aaaaaaab:0xeaf2216f682d03aa!8m2!3d9.0873612!4d7.4983865!15sCjJUaGUgTWlsa3Nob3AgYW5kIEJyZWFrZmFzdCBjb21wYW55LCBNYWl0YW1hLCBBYnVqYVoyIjB0aGUgbWlsa3Nob3AgYW5kIGJyZWFrZmFzdCBjb21wYW55IG1haXRhbWEgYWJ1amGSARRicmVha2Zhc3RfcmVzdGF1cmFudOABAA!16s%2Fg%2F11knncwhs6?entry=ttu&g_ep=EgoyMDI1MDIwNS4xIKXMDSoASAFQAw%3D%3D",
    affordability: "4.5/5",
    rating: "3.5/5"
  },
  {
    id: 4,
    locationName: "Truck Central, Central Business District, Abuja",
    locationType: "Outdoor",
    mapURL: "https://www.google.com/maps/place/Truck+Central/@9.0554115,7.4729394,17z/data=!3m1!4b1!4m6!3m5!1s0x104e0b26dd10aed1:0xc6882c6bc9e0d958!8m2!3d9.0554115!4d7.4755143!16s%2Fg%2F11txgxfls2?entry=ttu&g_ep=EgoyMDI1MDIwNS4xIKXMDSoASAFQAw%3D%3D",
    affordability: "3/5",
    rating: "4.5/5"
  },
  {
    id: 5,
    locationName: "Jabi Boat Club, Jabi, Abuja",
    locationType: "Indoor/Outdoor",
    mapURL: "https://www.google.com/maps/place/The+Boat+Club/@9.0704918,7.4098442,16.4z/data=!4m6!3m5!1s0x104e75a6db04f073:0xea51a3b8bd7f150f!8m2!3d9.0697441!4d7.4146742!16s%2Fg%2F11fkdh7_5_?entry=ttu&g_ep=EgoyMDI1MDIwOS4wIKXMDSoASAFQAw%3D%3D",
    affordability: "3.2/5",
    rating: "4.7/5"
  },
  {
    id: 6,
    locationName: "Otega Restaurant 24/7, Wuse 2, Abuja",
    locationType: "Indoor/Outdoor",
    mapURL: "https://www.google.com/maps?sca_esv=3a30a683573ba2c0&output=search&q=otega+restaurant+abuja&source=lnms&fbs=ABzOT_CWdhQLP1FcmU5B0fn3xuWpA-dk4wpBWOGsoR7DG5zJBv10Kbgy3ptSBM6mMfaz8zA4dsQnj5xEL8e8yrf6YrQm2qFvxjgbs3veW7IUFM9xHvD0ItLpuFy20BiHDRg8UkwegrJm9FjVXkCMs8DR7asGIoaBVTYmq2yX0eKyl6pRp3mZqNQ4WtReciBlhE1JgAnshoNQ&entry=mc&ved=1t:200715&ictx=111",
    affordability: "4/5",
    rating: "4.7/5"
  },
  {
    id: 7,
    locationName: "Kebabs & Kurries, Wuse 2, Abuja",
    locationType: "Indoor",
    mapURL: "https://www.google.com/maps/place/Kebabs+%26+Kurries+Restaurant/@9.0822106,7.4668932,17z/data=!3m1!4b1!4m6!3m5!1s0x104e0b5a0923a7b9:0x15af6c7556150075!8m2!3d9.0822106!4d7.4694681!16s%2Fg%2F11sbhn6_nc?entry=ttu&g_ep=EgoyMDI1MDIxMi4wIKXMDSoASAFQAw%3D%3D",
    affordability: "4/5",
    rating: "4.2/5"
  },

]

var jokes = [
  {
    id: 1,
    jokeText:
      "Why don't scientists trust atoms? Because they make up everything.",
    jokeType: "Science",
  },
  {
    id: 2,
    jokeText:
      "Why did the scarecrow win an award? Because he was outstanding in his field.",
    jokeType: "Puns",
  },
  {
    id: 3,
    jokeText:
      "I told my wife she was drawing her eyebrows too high. She looked surprised.",
    jokeType: "Puns",
  },
  {
    id: 4,
    jokeText:
      "What did one ocean say to the other ocean? Nothing, they just waved.",
    jokeType: "Wordplay",
  },
  {
    id: 5,
    jokeText:
      "Why do we never tell secrets on a farm? Because the potatoes have eyes and the corn has ears.",
    jokeType: "Wordplay",
  },
  {
    id: 6,
    jokeText: "How do you organize a space party? You planet!",
    jokeType: "Science",
  },
  {
    id: 7,
    jokeText:
      "Why don't some couples go to the gym? Because some relationships don't work out.",
    jokeType: "Puns",
  },
  {
    id: 8,
    jokeText:
      "Parallel lines have so much in common. It's a shame they'll never meet.",
    jokeType: "Math",
  },
  {
    id: 9,
    jokeText: "What do you call fake spaghetti? An impasta!",
    jokeType: "Food",
  },
  {
    id: 10,
    jokeText: "Why did the tomato turn red? Because it saw the salad dressing!",
    jokeType: "Food",
  },
  {
    id: 11,
    jokeText:
      "What do you get when you cross a snowman and a vampire? Frostbite!",
    jokeType: "Wordplay",
  },
  {
    id: 12,
    jokeText:
      "Why did the golfer bring two pairs of pants? In case he got a hole in one!",
    jokeType: "Sports",
  },
  {
    id: 13,
    jokeText:
      "Why are ghosts bad at lying? Because you can see right through them!",
    jokeType: "Wordplay",
  },
  {
    id: 14,
    jokeText: "Why can't you give Elsa a balloon? Because she will let it go.",
    jokeType: "Movies",
  },
  {
    id: 15,
    jokeText:
      "I'm reading a book about anti-gravity. It's impossible to put down!",
    jokeType: "Science",
  },
  {
    id: 16,
    jokeText:
      "I told my wife she was drawing her eyebrows too high. She looked surprised.",
    jokeType: "Puns",
  },
  {
    id: 17,
    jokeText:
      "What did one ocean say to the other ocean? Nothing, they just waved.",
    jokeType: "Wordplay",
  },
  {
    id: 18,
    jokeText:
      "Why do we never tell secrets on a farm? Because the potatoes have eyes and the corn has ears.",
    jokeType: "Wordplay",
  },
  {
    id: 19,
    jokeText: "How do you organize a space party? You planet!",
    jokeType: "Science",
  },
  {
    id: 20,
    jokeText:
      "Why don't some couples go to the gym? Because some relationships don't work out.",
    jokeType: "Puns",
  },
  {
    id: 21,
    jokeText:
      "Parallel lines have so much in common. It's a shame they'll never meet.",
    jokeType: "Math",
  },
  {
    id: 22,
    jokeText: "What do you call fake spaghetti? An impasta!",
    jokeType: "Food",
  },
  {
    id: 23,
    jokeText: "Why did the tomato turn red? Because it saw the salad dressing!",
    jokeType: "Food",
  },
  {
    id: 24,
    jokeText:
      "What do you get when you cross a snowman and a vampire? Frostbite!",
    jokeType: "Wordplay",
  },
  {
    id: 25,
    jokeText:
      "Why did the golfer bring two pairs of pants? In case he got a hole in one!",
    jokeType: "Sports",
  },
  {
    id: 26,
    jokeText:
      "Why are ghosts bad at lying? Because you can see right through them!",
    jokeType: "Wordplay",
  },
  {
    id: 27,
    jokeText: "Why can't you give Elsa a balloon? Because she will let it go.",
    jokeType: "Movies",
  },
  {
    id: 28,
    jokeText:
      "I'm reading a book about anti-gravity. It's impossible to put down!",
    jokeType: "Science",
  },
  {
    id: 29,
    jokeText:
      "I told my wife she was drawing her eyebrows too high. She looked surprised.",
    jokeType: "Puns",
  },
  {
    id: 30,
    jokeText:
      "What did one ocean say to the other ocean? Nothing, they just waved.",
    jokeType: "Wordplay",
  },
  {
    id: 31,
    jokeText:
      "Why do we never tell secrets on a farm? Because the potatoes have eyes and the corn has ears.",
    jokeType: "Wordplay",
  },
  {
    id: 32,
    jokeText: "How do you organize a space party? You planet!",
    jokeType: "Science",
  },
  {
    id: 33,
    jokeText:
      "Why don't some couples go to the gym? Because some relationships don't work out.",
    jokeType: "Puns",
  },
  {
    id: 34,
    jokeText:
      "Parallel lines have so much in common. It's a shame they'll never meet.",
    jokeType: "Math",
  },
  {
    id: 35,
    jokeText: "What do you call fake spaghetti? An impasta!",
    jokeType: "Food",
  },
  {
    id: 36,
    jokeText: "Why did the tomato turn red? Because it saw the salad dressing!",
    jokeType: "Food",
  },
  {
    id: 37,
    jokeText:
      "What do you get when you cross a snowman and a vampire? Frostbite!",
    jokeType: "Wordplay",
  },
  {
    id: 38,
    jokeText:
      "Why did the golfer bring two pairs of pants? In case he got a hole in one!",
    jokeType: "Sports",
  },
  {
    id: 39,
    jokeText:
      "Why are ghosts bad at lying? Because you can see right through them!",
    jokeType: "Wordplay",
  },
  {
    id: 40,
    jokeText: "Why can't you give Elsa a balloon? Because she will let it go.",
    jokeType: "Movies",
  },
  {
    id: 41,
    jokeText:
      "I'm reading a book about anti-gravity. It's impossible to put down!",
    jokeType: "Science",
  },
  {
    id: 42,
    jokeText:
      "I told my wife she was drawing her eyebrows too high. She looked surprised.",
    jokeType: "Puns",
  },
  {
    id: 43,
    jokeText:
      "What did one ocean say to the other ocean? Nothing, they just waved.",
    jokeType: "Wordplay",
  },
  {
    id: 44,
    jokeText:
      "Why do we never tell secrets on a farm? Because the potatoes have eyes and the corn has ears.",
    jokeType: "Wordplay",
  },
  {
    id: 45,
    jokeText: "How do you organize a space party? You planet!",
    jokeType: "Science",
  },
  {
    id: 46,
    jokeText:
      "Why don't some couples go to the gym? Because some relationships don't work out.",
    jokeType: "Puns",
  },
  {
    id: 47,
    jokeText:
      "Parallel lines have so much in common. It's a shame they'll never meet.",
    jokeType: "Math",
  },
  {
    id: 48,
    jokeText: "What do you call fake spaghetti? An impasta!",
    jokeType: "Food",
  },
  {
    id: 49,
    jokeText: "Why did the tomato turn red? Because it saw the salad dressing!",
    jokeType: "Food",
  },
  {
    id: 50,
    jokeText:
      "What do you get when you cross a snowman and a vampire? Frostbite!",
    jokeType: "Wordplay",
  },
  {
    id: 51,
    jokeText:
      "Why did the golfer bring two pairs of pants? In case he got a hole in one!",
    jokeType: "Sports",
  },
  {
    id: 52,
    jokeText:
      "Why are ghosts bad at lying? Because you can see right through them!",
    jokeType: "Wordplay",
  },
  {
    id: 53,
    jokeText: "Why can't you give Elsa a balloon? Because she will let it go.",
    jokeType: "Movies",
  },
  {
    id: 54,
    jokeText:
      "I'm reading a book about anti-gravity. It's impossible to put down!",
    jokeType: "Science",
  },
  {
    id: 55,
    jokeText:
      "I told my wife she was drawing her eyebrows too high. She looked surprised.",
    jokeType: "Puns",
  },
  {
    id: 56,
    jokeText:
      "What did one ocean say to the other ocean? Nothing, they just waved.",
    jokeType: "Wordplay",
  },
  {
    id: 57,
    jokeText:
      "Why do we never tell secrets on a farm? Because the potatoes have eyes and the corn has ears.",
    jokeType: "Wordplay",
  },
  {
    id: 58,
    jokeText: "How do you organize a space party? You planet!",
    jokeType: "Science",
  },
  {
    id: 59,
    jokeText:
      "Why don't some couples go to the gym? Because some relationships don't work out.",
    jokeType: "Puns",
  },
  {
    id: 60,
    jokeText:
      "Parallel lines have so much in common. It's a shame they'll never meet.",
    jokeType: "Math",
  },
  {
    id: 61,
    jokeText: "What do you call fake spaghetti? An impasta!",
    jokeType: "Food",
  },
  {
    id: 62,
    jokeText: "Why did the tomato turn red? Because it saw the salad dressing!",
    jokeType: "Food",
  },
  {
    id: 63,
    jokeText:
      "What do you get when you cross a snowman and a vampire? Frostbite!",
    jokeType: "Wordplay",
  },
  {
    id: 64,
    jokeText:
      "Why did the golfer bring two pairs of pants? In case he got a hole in one!",
    jokeType: "Sports",
  },
  {
    id: 65,
    jokeText:
      "Why are ghosts bad at lying? Because you can see right through them!",
    jokeType: "Wordplay",
  },
  {
    id: 66,
    jokeText: "Why can't you give Elsa a balloon? Because she will let it go.",
    jokeType: "Movies",
  },
  {
    id: 67,
    jokeText:
      "I'm reading a book about anti-gravity. It's impossible to put down!",
    jokeType: "Science",
  },
  {
    id: 68,
    jokeText:
      "I told my wife she was drawing her eyebrows too high. She looked surprised.",
    jokeType: "Puns",
  },
  {
    id: 69,
    jokeText:
      "What did one ocean say to the other ocean? Nothing, they just waved.",
    jokeType: "Wordplay",
  },
  {
    id: 70,
    jokeText:
      "Why do we never tell secrets on a farm? Because the potatoes have eyes and the corn has ears.",
    jokeType: "Wordplay",
  },
  {
    id: 71,
    jokeText: "How do you organize a space party? You planet!",
    jokeType: "Science",
  },
  {
    id: 72,
    jokeText:
      "Why don't some couples go to the gym? Because some relationships don't work out.",
    jokeType: "Puns",
  },
  {
    id: 73,
    jokeText:
      "Parallel lines have so much in common. It's a shame they'll never meet.",
    jokeType: "Math",
  },
  {
    id: 74,
    jokeText: "What do you call fake spaghetti? An impasta!",
    jokeType: "Food",
  },
  {
    id: 75,
    jokeText: "Why did the tomato turn red? Because it saw the salad dressing!",
    jokeType: "Food",
  },
  {
    id: 76,
    jokeText:
      "What do you get when you cross a snowman and a vampire? Frostbite!",
    jokeType: "Wordplay",
  },
  {
    id: 77,
    jokeText:
      "Why did the golfer bring two pairs of pants? In case he got a hole in one!",
    jokeType: "Sports",
  },
  {
    id: 78,
    jokeText:
      "Why are ghosts bad at lying? Because you can see right through them!",
    jokeType: "Wordplay",
  },
  {
    id: 79,
    jokeText: "Why can't you give Elsa a balloon? Because she will let it go.",
    jokeType: "Movies",
  },
  {
    id: 80,
    jokeText:
      "I'm reading a book about anti-gravity. It's impossible to put down!",
    jokeType: "Science",
  },
  {
    id: 81,
    jokeText:
      "I told my wife she was drawing her eyebrows too high. She looked surprised.",
    jokeType: "Puns",
  },
  {
    id: 82,
    jokeText:
      "What did one ocean say to the other ocean? Nothing, they just waved.",
    jokeType: "Wordplay",
  },
  {
    id: 83,
    jokeText:
      "Why do we never tell secrets on a farm? Because the potatoes have eyes and the corn has ears.",
    jokeType: "Wordplay",
  },
  {
    id: 84,
    jokeText: "How do you organize a space party? You planet!",
    jokeType: "Science",
  },
  {
    id: 85,
    jokeText:
      "Why don't some couples go to the gym? Because some relationships don't work out.",
    jokeType: "Puns",
  },
  {
    id: 86,
    jokeText:
      "Parallel lines have so much in common. It's a shame they'll never meet.",
    jokeType: "Math",
  },
  {
    id: 87,
    jokeText: "What do you call fake spaghetti? An impasta!",
    jokeType: "Food",
  },
  {
    id: 88,
    jokeText: "Why did the tomato turn red? Because it saw the salad dressing!",
    jokeType: "Food",
  },
  {
    id: 89,
    jokeText:
      "What do you get when you cross a snowman and a vampire? Frostbite!",
    jokeType: "Wordplay",
  },
  {
    id: 90,
    jokeText:
      "Why did the golfer bring two pairs of pants? In case he got a hole in one!",
    jokeType: "Sports",
  },
  {
    id: 91,
    jokeText:
      "Why are ghosts bad at lying? Because you can see right through them!",
    jokeType: "Wordplay",
  },
  {
    id: 92,
    jokeText: "Why can't you give Elsa a balloon? Because she will let it go.",
    jokeType: "Movies",
  },
  {
    id: 93,
    jokeText:
      "I'm reading a book about anti-gravity. It's impossible to put down!",
    jokeType: "Science",
  },
  {
    id: 94,
    jokeText:
      "I told my wife she was drawing her eyebrows too high. She looked surprised.",
    jokeType: "Puns",
  },
  {
    id: 95,
    jokeText:
      "What did one ocean say to the other ocean? Nothing, they just waved.",
    jokeType: "Wordplay",
  },
  {
    id: 96,
    jokeText:
      "Why do we never tell secrets on a farm? Because the potatoes have eyes and the corn has ears.",
    jokeType: "Wordplay",
  },
  {
    id: 97,
    jokeText: "How do you organize a space party? You planet!",
    jokeType: "Science",
  },
  {
    id: 98,
    jokeText:
      "Why don't some couples go to the gym? Because some relationships don't work out.",
    jokeType: "Puns",
  },
  {
    id: 99,
    jokeText:
      "Parallel lines have so much in common. It's a shame they'll never meet.",
    jokeType: "Math",
  },
  {
    id: 100,
    jokeText: "What do you call fake spaghetti? An impasta!",
    jokeType: "Food",
  },
];
