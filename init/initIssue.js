const samplingdb=[
  {
    "userId": "675afc901234abcd11111111",
    "title": "Large pothole near main square",
    "description": "A deep pothole has formed near the central square causing heavy traffic disruption.",
    "category": "pothole",
    "status": "pending",
    "severity": "high",
    "imageUrl": "https://res.cloudinary.com/demo/image/upload/v123/pothole1.png",
    "location": { "latitude": 18.5204, "longitude": 73.8567 },
    "detectedLabels": ["pothole", "road_damage"],
    "assignedTo": "road_dept"
  },
  {
    "userId": "675afc901234abcd22222222",
    "title": "Garbage dumped on roadside",
    "description": "Garbage is overflowing on the roadside causing foul smell and inconvenience.",
    "category": "garbage",
    "status": "in_progress",
    "severity": "medium",
    "imageUrl": "https://res.cloudinary.com/demo/image/upload/v123/garbage2.png",
    "location": { "latitude": 19.076, "longitude": 72.8777 },
    "detectedLabels": ["garbage"],
    "assignedTo": "cleanliness_dept"
  },
  {
    "userId": "675afc901234abcd33333333",
    "title": "Water leakage from pipeline",
    "description": "There is continuous water leakage from an underground pipe near the bus stop.",
    "category": "water_leakage",
    "status": "pending",
    "severity": "medium",
    "imageUrl": "https://res.cloudinary.com/demo/image/upload/v123/water.png",
    "location": { "latitude": 18.651, "longitude": 73.789 },
    "detectedLabels": [],
    "assignedTo": "water_dept"
  },
  {
    "userId": "675afc901234abcd44444444",
    "title": "Streetlight not working",
    "description": "The streetlight on lane 4 has stopped working for more than a week.",
    "category": "streetlight",
    "status": "pending",
    "severity": "low",
    "imageUrl": "https://res.cloudinary.com/demo/image/upload/v123/streetlight.png",
    "location": { "latitude": 18.507, "longitude": 73.807 },
    "detectedLabels": [],
    "assignedTo": "electrical_dept"
  },
  {
    "userId": "675afc901234abcd55555555",
    "title": "Broken footpath tiles",
    "description": "Several tiles on the footpath are broken, posing danger to pedestrians.",
    "category": "infrastructure_damage",
    "status": "in_progress",
    "severity": "medium",
    "imageUrl": "https://res.cloudinary.com/demo/image/upload/v123/footpath.png",
    "location": { "latitude": 18.48, "longitude": 73.82 },
    "detectedLabels": ["broken_tile"],
    "assignedTo": "road_dept"
  },
  {
    "userId": "675afc901234abcd66666666",
    "title": "Unsafe crossing area",
    "description": "The zebra crossing paint has faded and vehicles do not slow down.",
    "category": "public_safety",
    "status": "pending",
    "severity": "high",
    "imageUrl": "https://res.cloudinary.com/demo/image/upload/v123/crossing.png",
    "location": { "latitude": 18.591, "longitude": 73.736 },
    "detectedLabels": [],
    "assignedTo": "none"
  },
  {
    "userId": "675afc901234abcd77777777",
    "title": "Fallen tree blocking road",
    "description": "A large tree has fallen during heavy rain and is blocking the entire road.",
    "category": "infrastructure_damage",
    "status": "resolved",
    "severity": "high",
    "imageUrl": "https://res.cloudinary.com/demo/image/upload/v123/fallen_tree.png",
    "location": { "latitude": 18.55, "longitude": 73.88 },
    "detectedLabels": ["tree", "obstruction"],
    "assignedTo": "road_dept"
  },
  {
    "userId": "675afc901234abcd88888888",
    "title": "Overflowing drainage",
    "description": "Drainage water is overflowing onto the street causing bad odor.",
    "category": "water_leakage",
    "status": "in_progress",
    "severity": "medium",
    "imageUrl": "https://res.cloudinary.com/demo/image/upload/v123/drain.png",
    "location": { "latitude": 18.60, "longitude": 73.78 },
    "detectedLabels": ["water", "sewage"],
    "assignedTo": "water_dept"
  },
  {
    "userId": "675afc901234abcd99999999",
    "title": "Suspicious activity in park",
    "description": "Residents reported suspicious behavior in the community park at night.",
    "category": "public_safety",
    "status": "pending",
    "severity": "high",
    "imageUrl": "https://res.cloudinary.com/demo/image/upload/v123/park.png",
    "location": { "latitude": 18.59, "longitude": 73.81 },
    "detectedLabels": ["person"],
    "assignedTo": "none"
  },
  {
    "userId": "675afc901234abcd12121212",
    "title": "Uncollected garbage bags",
    "description": "Garbage collection has not happened for three days and waste is piling up.",
    "category": "garbage",
    "status": "resolved",
    "severity": "low",
    "imageUrl": "https://res.cloudinary.com/demo/image/upload/v123/garbage3.png",
    "location": { "latitude": 18.576, "longitude": 73.845 },
    "detectedLabels": ["garbage"],
    "assignedTo": "cleanliness_dept"
  }
];

module.exports = { data: samplingdb };
