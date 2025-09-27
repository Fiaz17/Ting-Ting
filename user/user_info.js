    // Get flight data from URL
    const params = new URLSearchParams(window.location.search);
    const flightJSON = params.get("flight");
    let flight;

    try {
        flight = JSON.parse(decodeURIComponent(flightJSON));
        
        // Update flight summary
        document.getElementById('airlineLogo').src = `https://content.airhex.com/content/logos/airlines_${flight.carrierCode}_200_200_s.png`;
        document.getElementById('airlineLogo').onerror = function() {
            this.src = `https://via.placeholder.com/80?text=${flight.carrierCode}`;
        };
        
        document.getElementById('flightName').textContent = flight.airlineName;
        document.getElementById('flightRoute').textContent = `${flight.dep.iataCode} to ${flight.arr.iataCode}`;
        document.getElementById('flightTime').textContent = `${new Date(flight.dep.at).toLocaleDateString()} - ${flight.duration}`;
        document.getElementById('flightPrice').textContent = `BDT ${flight.price}`;
    } catch (e) {
        console.error("Error parsing flight data:", e);
    }

    // Handle form submission
    document.getElementById('passengerForm').addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Collect form data
      const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        nationality: document.getElementById('nationality').value,
        passport: document.getElementById('passport').value
      };
      
      // Combine flight and passenger data
      const bookingData = {
        flight: flight,
        passenger: formData
      };
      
      // Redirect to ticket page with combined data
      const encodedData = encodeURIComponent(JSON.stringify(bookingData));
      window.location.href = `../ticket/ticket.html?data=${encodedData}`;
    });
  