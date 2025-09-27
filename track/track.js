document.getElementById("trackBtn").addEventListener("click", function () {
  const flight = document.getElementById("flightInput").value.trim();
  
  if (flight) {
    // Redirect to FlightRadar24 search results
    const url = `https://www.flightradar24.com/data/flights/${flight}`;
    window.open(url, "_blank"); // Opens in new tab
  } else {
    alert("Please enter a flight number!");
  }
});
