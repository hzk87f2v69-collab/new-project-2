const Track = require("../models/Track");
const { trackSeed } = require("../data/tracks");

const seedTracks = async () => {
  const existingCount = await Track.countDocuments();

  if (existingCount > 0) {
    return;
  }

  await Track.insertMany(trackSeed);
  console.log("Track catalog seeded");
};

module.exports = seedTracks;
