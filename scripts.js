// Log message indicating the script has started running
console.log('scripts.js is running!');

// API URL for fetching earthquake data (using a CORS proxy)
const API_URL = 'https://cors-anywhere.herokuapp.com/https://opendata.cwa.gov.tw/api/v1/rest/datastore/E-A0015-002?Authorization=CWA-83D87A3D-4C19-4B1E-8021-AF70E4774117';

// Log message indicating the start of an API request
console.log('Starting API request...');

// Default data update interval: 5 minutes (in milliseconds)
let updateInterval = 300000;

/**
 * Fetch earthquake data from the API and update the UI based on the results.
 */
function fetchEarthquakeData() {
  console.log('Fetching earthquake data...');
  
  // Display a status message to indicate data is being updated
  const alertElement = document.getElementById('alert');
  alertElement.textContent = 'Updating earthquake data...';

  fetch(API_URL)
    .then(response => {
      console.log('Response received:', response);
      if (!response.ok) {
        // Throw an error if the response status is not OK
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Full API Response:', data);

      // Access earthquake records in the response data
      const records = data.result?.records?.earthquake;

      const earthquakeContainer = document.getElementById('earthquake-data');
      const magnitudeThreshold = document.getElementById('threshold').value;

      if (records && records.length > 0) {
        // Filter records that meet the magnitude threshold
        const filteredRecords = records.filter(
          eq => eq.EarthquakeInfo.Magnitude.MagnitudeValue >= magnitudeThreshold
        );

        if (filteredRecords.length > 0) {
          // Display the latest earthquake information if records exist
          const latestEarthquake = filteredRecords[0].EarthquakeInfo;

          earthquakeContainer.innerHTML = `
            <h2>Latest Earthquake Information</h2>
            <p><strong>Location:</strong> ${latestEarthquake.Epicenter.Location}</p>
            <p><strong>Magnitude:</strong> ${latestEarthquake.Magnitude.MagnitudeValue}</p>
            <p><strong>Depth:</strong> ${latestEarthquake.Depth.Value} km</p>
            <p><strong>Origin Time:</strong> ${latestEarthquake.OriginTime}</p>
          `;

          // Shorten the update interval to 30 seconds when an earthquake is detected
          updateInterval = 30000;
        } else {
          // Display a message if no earthquakes match the threshold
          earthquakeContainer.innerHTML = '<p>No earthquakes match your notification settings.</p>';

          // Set the update interval to 5 minutes if no matching earthquakes are detected
          updateInterval = 300000;
        }
      } else {
        // Display a message if no earthquake data is available
        earthquakeContainer.innerHTML = '<p>No recent earthquake data available.</p>';

        // Set the update interval to 5 minutes if no data is available
        updateInterval = 300000;
      }

      // Reset the automatic refresh timer with the updated interval
      resetAutoRefresh();

      // Update the alert message to indicate data was successfully updated
      alertElement.textContent = 'Earthquake data updated successfully.';
    })
    .catch(error => {
      // Log errors and display an error message in the UI
      console.error('Error fetching earthquake data:', error);
      document.getElementById('earthquake-data').innerHTML = '<p>Error fetching earthquake data.</p>';
      alertElement.textContent = 'Error updating earthquake data.';
    });
}

/**
 * Display an alert to notify the user of the selected notification threshold.
 */
function showThresholdMessage() {
  const selectedValue = document.getElementById('threshold').value;
  alert(`Notification threshold set to: ${selectedValue} or above`);
}

// Variable to store the auto-refresh interval timer
let autoRefresh;

/**
 * Reset the automatic data refresh timer with the current update interval.
 */
function resetAutoRefresh() {
  clearInterval(autoRefresh); // Clear the existing timer
  autoRefresh = setInterval(fetchEarthquakeData, updateInterval); // Set a new timer
}

// Initialize earthquake data fetch and start the auto-refresh process
fetchEarthquakeData();

// Add an event listener to detect changes in the notification threshold dropdown
const thresholdElement = document.getElementById('threshold');
thresholdElement.addEventListener('change', showThresholdMessage);
