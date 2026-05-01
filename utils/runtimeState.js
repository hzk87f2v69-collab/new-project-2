let databaseConnected = false;

const setDatabaseConnected = (value) => {
  databaseConnected = Boolean(value);
};

const isDatabaseConnected = () => databaseConnected;

const isDemoMode = () => process.env.ACE_DEMO_MODE === "true" || !databaseConnected;

module.exports = {
  setDatabaseConnected,
  isDatabaseConnected,
  isDemoMode
};
