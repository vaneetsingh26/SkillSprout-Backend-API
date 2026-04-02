// Helper function to convert total seconds to the duration format
function convertSecondsToDuration(totalSeconds) {
    // Force the input to be an integer
    const parsedSeconds = parseInt(totalSeconds, 10);

    // If for some reason it's invalid, return a fallback
    if (isNaN(parsedSeconds)) return "0s";

    const hours = Math.floor(parsedSeconds / 3600);
    const minutes = Math.floor((parsedSeconds % 3600) / 60);
    const seconds = Math.floor((parsedSeconds % 3600) % 60);
  
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
}
  
module.exports = {
    convertSecondsToDuration,
}