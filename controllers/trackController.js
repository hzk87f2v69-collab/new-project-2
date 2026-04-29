const Track = require("../models/Track");
const { bundleSeed, trackSeed } = require("../data/tracks");

const getTracks = async (req, res) => {
  try {
    const tracks = await Track.find().select("-weeks").sort({ price: 1 }).maxTimeMS(8000);
    res.json({ tracks, bundles: bundleSeed });
  } catch (error) {
    const fallbackTracks = trackSeed
      .map(({ weeks, ...track }) => track)
      .sort((a, b) => a.price - b.price);

    res.json({
      tracks: fallbackTracks,
      bundles: bundleSeed,
      fallback: true
    });
  }
};

const getTrackClasses = async (req, res) => {
  try {
    const track = await Track.findOne({ trackId: req.params.trackId }).maxTimeMS(8000);

    if (!track) {
      const fallbackTrack = trackSeed.find((item) => item.trackId === req.params.trackId);

      if (!fallbackTrack) {
        return res.status(404).json({ message: "Track not found." });
      }

      return res.json({ track: fallbackTrack, fallback: true });
    }

    res.json({
      track: {
        trackId: track.trackId,
        name: track.name,
        target: track.target,
        description: track.description,
        price: track.price,
        durationWeeks: track.durationWeeks,
        classesCount: track.classesCount,
        benefits: track.benefits,
        weeks: track.weeks
      }
    });
  } catch (error) {
    const fallbackTrack = trackSeed.find((item) => item.trackId === req.params.trackId);

    if (!fallbackTrack) {
      return res.status(404).json({ message: "Track not found." });
    }

    res.json({ track: fallbackTrack, fallback: true });
  }
};

module.exports = {
  getTracks,
  getTrackClasses
};
