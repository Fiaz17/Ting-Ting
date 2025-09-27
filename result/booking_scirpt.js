    // Get flight data from URL
    const params = new URLSearchParams(window.location.search);
    const flightJSON = params.get("flight");
    let flight;
    let mapInitialized = false;

    try {
        flight = JSON.parse(decodeURIComponent(flightJSON));
    } catch (e) {
        document.getElementById("journeyTitle").innerHTML = "Invalid flight data";
        document.getElementById("journeySubtitle").innerHTML = "Please go back and select a flight again";
    }

    // Airport coordinates and names
    const airportData = {
      "DAC": { 
        coords: [23.8041, 90.4152], 
        name: "Hazrat Shahjalal International Airport",
        terminals: ["T1", "T2"]
      },
      "BOM": { 
        coords: [19.0896, 72.8656], 
        name: "Chhatrapati Shivaji International Airport",
        terminals: ["T1", "T2"]
      },
      "DEL": { 
        coords: [28.5561, 77.1000], 
        name: "Indira Gandhi International Airport",
        terminals: ["T1", "T2", "T3"]
      },
      "BKK": { 
        coords: [13.7563, 100.5018], 
        name: "Suvarnabhumi Airport",
        terminals: ["Main"]
      },
      "SIN": { 
        coords: [1.3521, 103.8198], 
        name: "Singapore Changi Airport",
        terminals: ["T1", "T2", "T3", "T4"]
      },
      "KUL": { 
        coords: [2.7619, 101.7189], 
        name: "Kuala Lumpur International Airport",
        terminals: ["Main", "klia2"]
      },
      "CGK": { 
        coords: [-6.1251, 106.6550], 
        name: "Soekarno-Hatta International Airport",
        terminals: ["T1", "T2", "T3"]
      },
      "HKG": { 
        coords: [22.3080, 113.9185], 
        name: "Hong Kong International Airport",
        terminals: ["T1", "T2"]
      },
      "PVG": { 
        coords: [31.1443, 121.8083], 
        name: "Shanghai Pudong International Airport",
        terminals: ["T1", "T2", "S1", "S2"]
      },
      "NRT": { 
        coords: [35.7720, 140.3929], 
        name: "Narita International Airport",
        terminals: ["T1", "T2", "T3"]
      },
      "ICN": { 
        coords: [37.4602, 126.4407], 
        name: "Incheon International Airport",
        terminals: ["Main"]
      },
      "DXB": { 
        coords: [25.2532, 55.3657], 
        name: "Dubai International Airport",
        terminals: ["T1", "T2", "T3"]
      },
      "LHR": { 
        coords: [51.4700, -0.4543], 
        name: "London Heathrow Airport",
        terminals: ["T2", "T3", "T4", "T5"]
      },
      "JFK": { 
        coords: [40.6413, -73.7781], 
        name: "John F. Kennedy International Airport",
        terminals: ["T1", "T2", "T4", "T5", "T7", "T8"]
      },
      "CDG": { 
        coords: [49.0097, 2.5479], 
        name: "Charles de Gaulle Airport",
        terminals: ["T1", "T2A", "T2B", "T2C", "T2D", "T2E", "T2F", "T2G", "T3"]
      },
      "FRA": { 
        coords: [50.0379, 8.5622], 
        name: "Frankfurt Airport",
        terminals: ["T1", "T2"]
      },
      "SYD": { 
        coords: [-33.9461, 151.1772], 
        name: "Sydney Kingsford Smith Airport",
        terminals: ["T1", "T2", "T3"]
      }
    };

    // Generate simulated stop data if not available
    function generateStopData(flight) {
      if (!flight.stops || flight.stops === 0) {
        return [];
      }

      // Common stop airports
      const stopAirports = ["BOM", "DEL", "SIN", "DXB", "HKG"];
      const stopAirport = stopAirports[Math.floor(Math.random() * stopAirports.length)];
      
      // Calculate arrival time at stop (assume 1/3 of total flight time)
      const departureDate = new Date(flight.dep.at);
      const arrivalDate = new Date(flight.arr.at);
      const totalFlightTime = arrivalDate - departureDate;
      const timeToStop = totalFlightTime / 3;
      const stopArrivalTime = new Date(departureDate.getTime() + timeToStop);
      
      // Calculate layover duration (1-5 hours)
      const layoverHours = Math.floor(Math.random() * 5) + 1;
      const layoverMinutes = Math.floor(Math.random() * 60);
      const layoverDuration = `${layoverHours}h ${layoverMinutes}m`;
      
      // Calculate next flight departure time
      const nextFlightDeparture = new Date(stopArrivalTime);
      nextFlightDeparture.setHours(nextFlightDeparture.getHours() + layoverHours);
      nextFlightDeparture.setMinutes(nextFlightDeparture.getMinutes() + layoverMinutes);
      
      // Generate next flight number
      const nextFlightNumber = flight.carrierCode + (Math.floor(Math.random() * 900) + 100);
      
      return [{
        airportCode: stopAirport,
        airportName: airportData[stopAirport].name,
        arrivalTime: stopArrivalTime.toISOString(),
        departureTime: nextFlightDeparture.toISOString(),
        layoverDuration: layoverDuration,
        terminal: airportData[stopAirport].terminals[Math.floor(Math.random() * airportData[stopAirport].terminals.length)],
        nextFlight: {
          airline: flight.airlineName,
          flightNumber: nextFlightNumber,
          departureTime: nextFlightDeparture.toISOString()
        }
      }];
    }

    // Initialize page with flight data
    if (flight) {
      // Generate stop data if not available
      if (!flight.stopData) {
        flight.stopData = generateStopData(flight);
      }
      
      // Update header
      document.getElementById("journeyTitle").textContent = 
        `${flight.dep.iataCode} to ${flight.arr.iataCode} Flight`;
      document.getElementById("journeySubtitle").textContent = flight.airlineName;
      
      // Update summary panel
      document.getElementById("journeyRoute").textContent = 
        `${flight.dep.iataCode} → ${flight.arr.iataCode}`;
      document.getElementById("journeyStops").textContent = flight.stops || 0;
      document.getElementById("journeyAirline").textContent = flight.airlineName;
      document.getElementById("journeyDuration").textContent = flight.duration;
      
      // Update map legend
      document.getElementById("departureLabel").textContent = `${flight.dep.iataCode} (Departure)`;
      document.getElementById("arrivalLabel").textContent = `${flight.arr.iataCode} (Arrival)`;
      
      if (flight.stops > 0) {
        document.getElementById("stopLabel").textContent = `${flight.stopData[0].airportCode} (Stop)`;
      } else {
        document.getElementById("stopLabel").textContent = "Direct Flight";
      }
      
      // Generate timeline
      generateTimeline();
    }

    // Generate flight timeline
    function generateTimeline() {
      const timeline = document.getElementById("flightTimeline");
      timeline.innerHTML = "";
      
      const departureDate = new Date(flight.dep.at);
      const arrivalDate = new Date(flight.arr.at);
      
      // Get terminal information
      const depTerminal = flight.dep.terminal || 
        (airportData[flight.dep.iataCode] ? 
          airportData[flight.dep.iataCode].terminals[Math.floor(Math.random() * airportData[flight.dep.iataCode].terminals.length)] : 
          "T1");
          
      const arrTerminal = flight.arr.terminal || 
        (airportData[flight.arr.iataCode] ? 
          airportData[flight.arr.iataCode].terminals[Math.floor(Math.random() * airportData[flight.arr.iataCode].terminals.length)] : 
          "T1");
      
      // Get airport names
      const depAirportName = airportData[flight.dep.iataCode] ? 
        airportData[flight.dep.iataCode].name : flight.dep.iataCode + " Airport";
        
      const arrAirportName = airportData[flight.arr.iataCode] ? 
        airportData[flight.arr.iataCode].name : flight.arr.iataCode + " Airport";
      
      // Departure
      const departureItem = document.createElement("div");
      departureItem.className = "timeline-item";
      departureItem.style.animationDelay = "0.1s";
      departureItem.innerHTML = `
        <div class="timeline-icon">
          <i class="fas fa-plane-departure"></i>
        </div>
        <div class="timeline-content">
          <h3><i class="fas fa-city"></i> ${flight.dep.iataCode} - ${depAirportName}</h3>
          <p><i class="fas fa-calendar-alt"></i> <span class="time">${departureDate.toLocaleString()}</span></p>
          <p><i class="fas fa-door-open"></i> Terminal: ${depTerminal}</p>
          <p><i class="fas fa-plane"></i> ${flight.airlineName} ${flight.carrierCode}${flight.flightNumber || ''}</p>
          <span class="duration"><i class="fas fa-clock"></i> Flight Duration: ${flight.duration}</span>
        </div>
      `;
      timeline.appendChild(departureItem);
      
      // Stops if any
      if (flight.stops > 0 && flight.stopData && flight.stopData.length > 0) {
        flight.stopData.forEach((stop, index) => {
          const stopArrivalTime = new Date(stop.arrivalTime);
          const stopDepartureTime = new Date(stop.departureTime);
          
          const stopItem = document.createElement("div");
          stopItem.className = "timeline-item";
          stopItem.style.animationDelay = `${0.2 + index * 0.1}s`;
          stopItem.innerHTML = `
            <div class="timeline-icon layover">
              <i class="fas fa-plane"></i>
            </div>
            <div class="timeline-content">
              <h3><i class="fas fa-map-marker-alt"></i> ${stop.airportCode} - ${stop.airportName}</h3>
              <p><i class="fas fa-calendar-alt"></i> <span class="time">Arrival: ${stopArrivalTime.toLocaleString()}</span></p>
              <p><i class="fas fa-door-open"></i> Terminal: ${stop.terminal}</p>
              
              <div class="layover-info">
                <h4><i class="fas fa-hourglass-half"></i> Layover Information</h4>
                <p><i class="fas fa-clock"></i> Duration: ${stop.layoverDuration}</p>
                <p><i class="fas fa-info-circle"></i> Please proceed to connecting flight gate</p>
              </div>
              
              <div class="next-flight">
                <h4><i class="fas fa-plane-departure"></i> Next Flight</h4>
                <p><i class="fas fa-plane"></i> ${stop.nextFlight.airline} ${stop.nextFlight.flightNumber}</p>
                <p><i class="fas fa-calendar-alt"></i> <span class="time">Departure: ${stopDepartureTime.toLocaleString()}</span></p>
                <p><i class="fas fa-door-open"></i> Terminal: ${stop.terminal}</p>
              </div>
            </div>
          `;
          timeline.appendChild(stopItem);
        });
      }
      
      // Arrival
      const arrivalItem = document.createElement("div");
      arrivalItem.className = "timeline-item";
      arrivalItem.style.animationDelay = `${0.3 + (flight.stops || 0) * 0.1}s`;
      arrivalItem.innerHTML = `
        <div class="timeline-icon">
          <i class="fas fa-plane-arrival"></i>
        </div>
        <div class="timeline-content">
          <h3><i class="fas fa-city"></i> ${flight.arr.iataCode} - ${arrAirportName}</h3>
          <p><i class="fas fa-calendar-alt"></i> <span class="time">${arrivalDate.toLocaleString()}</span></p>
          <p><i class="fas fa-door-open"></i> Terminal: ${arrTerminal}</p>
          <p><i class="fas fa-info-circle"></i> Local Time: ${arrivalDate.toLocaleTimeString()}</p>
        </div>
      `;
      timeline.appendChild(arrivalItem);
    }

    // Tab functionality
    function showPanel(panelName) {
      // Hide all panels
      document.querySelectorAll('.journey-panel').forEach(panel => {
        panel.classList.remove('active');
      });
      
      // Remove active class from all tabs
      document.querySelectorAll('.journey-tab').forEach(tab => {
        tab.classList.remove('active');
      });
      
      // Show selected panel
      document.getElementById(panelName + '-panel').classList.add('active');
      
      // Add active class to clicked tab
      event.target.closest('.journey-tab').classList.add('active');
      
      // Initialize map if map panel is selected
      if (panelName === 'map' && !mapInitialized && flight) {
        initializeMap();
        mapInitialized = true;
      }
    }
    
    // Initialize the map
    function initializeMap() {
      // Get coordinates for airports
      const depCoords = airportData[flight.dep.iataCode] ? 
        airportData[flight.dep.iataCode].coords : [23.8041, 90.4152];
        
      const arrCoords = airportData[flight.arr.iataCode] ? 
        airportData[flight.arr.iataCode].coords : [13.7563, 100.5018];
      
      // Create the map
      const map = L.map('map').setView([(depCoords[0] + arrCoords[0])/2, (depCoords[1] + arrCoords[1])/2], 4);
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      
      // Create custom icons
      const departureIcon = L.divIcon({
        html: '<i class="fas fa-plane-departure" style="color: #0077cc; font-size: 24px;"></i>',
        iconSize: [30, 30],
        className: 'custom-div-icon'
      });
      
      const stopIcon = L.divIcon({
        html: '<i class="fas fa-plane" style="color: #ff9501; font-size: 24px;"></i>',
        iconSize: [30, 30],
        className: 'custom-div-icon'
      });
      
      const arrivalIcon = L.divIcon({
        html: '<i class="fas fa-plane-arrival" style="color: #28a745; font-size: 24px;"></i>',
        iconSize: [30, 30],
        className: 'custom-div-icon'
      });
      
      // Add departure marker
      L.marker(depCoords, { icon: departureIcon }).addTo(map)
        .bindPopup(`<b>${flight.dep.iataCode}</b><br>${airportData[flight.dep.iataCode] ? airportData[flight.dep.iataCode].name : flight.dep.iataCode + " Airport"}<br>Departure: ${new Date(flight.dep.at).toLocaleString()}`);
      
      // Add stop markers if any
      if (flight.stops > 0 && flight.stopData && flight.stopData.length > 0) {
        flight.stopData.forEach(stop => {
          const stopCoords = airportData[stop.airportCode] ? 
            airportData[stop.airportCode].coords : [20, 80];
            
          L.marker(stopCoords, { icon: stopIcon }).addTo(map)
            .bindPopup(`<b>${stop.airportCode}</b><br>${stop.airportName}<br>Layover: ${stop.layoverDuration}`);
        });
      }
      
      // Add arrival marker
      L.marker(arrCoords, { icon: arrivalIcon }).addTo(map)
        .bindPopup(`<b>${flight.arr.iataCode}</b><br>${airportData[flight.arr.iataCode] ? airportData[flight.arr.iataCode].name : flight.arr.iataCode + " Airport"}<br>Arrival: ${new Date(flight.arr.at).toLocaleString()}`);
      
      // Add route lines
      let routeCoords = [depCoords];
      
      if (flight.stops > 0 && flight.stopData && flight.stopData.length > 0) {
        flight.stopData.forEach(stop => {
          const stopCoords = airportData[stop.airportCode] ? 
            airportData[stop.airportCode].coords : [20, 80];
          routeCoords.push(stopCoords);
        });
      }
      
      routeCoords.push(arrCoords);
      
      // Draw route lines
      for (let i = 0; i < routeCoords.length - 1; i++) {
        const segment = [routeCoords[i], routeCoords[i+1]];
        L.polyline(segment, { color: i === 0 ? '#0077cc' : '#ff9501', weight: 4, opacity: 0.7 }).addTo(map);
      }
      
      // Fit map to show all markers
      const group = new L.featureGroup();
      group.addLayer(L.marker(depCoords));
      group.addLayer(L.marker(arrCoords));
      
      if (flight.stops > 0 && flight.stopData && flight.stopData.length > 0) {
        flight.stopData.forEach(stop => {
          const stopCoords = airportData[stop.airportCode] ? 
            airportData[stop.airportCode].coords : [20, 80];
          group.addLayer(L.marker(stopCoords));
        });
      }
      
      map.fitBounds(group.getBounds().pad(0.1));
    }
    
    // Navigation functions
    function goToPurchase() {
      if (!flight) {
        alert("Flight data is not available. Please go back and select a flight again.");
        return;
      }
      
      const encodedFlight = encodeURIComponent(JSON.stringify(flight));
      window.location.href = `../user/user_info.html?flight=${encodedFlight}`;
    }
    
    function openPolicy() {
      document.getElementById('policyPanel').classList.add('active');
      document.getElementById('overlay').classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    
    function closePolicy() {
      document.getElementById('policyPanel').classList.remove('active');
      document.getElementById('overlay').classList.remove('active');
      document.body.style.overflow = '';
    }
    
    // Add animation to timeline items when they come into view
    document.addEventListener('DOMContentLoaded', function() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = 1;
            entry.target.style.transform = 'translateY(0)';
          }
        });
      }, {
        threshold: 0.1
      });
      
      document.querySelectorAll('.timeline-item').forEach(item => {
        observer.observe(item);
      });
    });
