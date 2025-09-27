
    const clientId = "d3h9HSiSe9LpSOlzusWAGXAvXD7oIkkw";
    const clientSecret = "aNQlBmDFvDKlqqL1";

    // Get URL parameters
    const params = new URLSearchParams(window.location.search);
    let origin = params.get("origin");
    let destination = params.get("destination");
    let departure = params.get("departure");
    let returnDate = params.get("returnDate");
    let passengers = params.get("passengers");

    const resultsContainer = document.getElementById("results");
    let flightData = []; // store fetched results
    let filteredData = []; // store filtered results
    let currentFilters = {
      stops: 'all',
      airline: 'all',
      priceRange: 'all',
      sortBy: 'cheapest'
    };

    // Airport data for autocomplete
    const airports = [
      { id: "1", name: "Hazrat Shahjalal International Airport", city: "Dhaka", country: "Bangladesh", iata: "DAC", icao: "VGHS", latitude: "23.843300", longitude: "90.398499", altitude: "15", timezone: "6", dst: "U", tzTimezone: "Asia/Dhaka", type: "airport", source: "OurAirports" },
      { id: "11", name: "Chhatrapati Shivaji International Airport", city: "Mumbai", country: "India", iata: "BOM", icao: "VABB", latitude: "19.089699", longitude: "72.865501", altitude: "8", timezone: "5.5", dst: "U", tzTimezone: "Asia/Kolkata", type: "airport", source: "OurAirports" },
      { id: "12", name: "Indira Gandhi International Airport", city: "Delhi", country: "India", iata: "DEL", icao: "VIDP", latitude: "28.5665", longitude: "77.1031", altitude: "233", timezone: "5.5", dst: "U", tzTimezone: "Asia/Kolkata", type: "airport", source: "OurAirports" },
      { id: "21", name: "Suvarnabhumi Airport", city: "Bangkok", country: "Thailand", iata: "BKK", icao: "VTBS", latitude: "13.6900", longitude: "100.7501", altitude: "2", timezone: "7", dst: "U", tzTimezone: "Asia/Bangkok", type: "airport", source: "OurAirports" },
      { id: "31", name: "Singapore Changi Airport", city: "Singapore", country: "Singapore", iata: "SIN", icao: "WSSS", latitude: "1.3500", longitude: "103.9940", altitude: "7", timezone: "8", dst: "U", tzTimezone: "Asia/Singapore", type: "airport", source: "OurAirports" },
      { id: "32", name: "Kuala Lumpur International Airport", city: "Kuala Lumpur", country: "Malaysia", iata: "KUL", icao: "WMKK", latitude: "2.7456", longitude: "101.7072", altitude: "22", timezone: "8", dst: "U", tzTimezone: "Asia/Kuala_Lumpur", type: "airport", source: "OurAirports" },
      { id: "41", name: "Dubai International Airport", city: "Dubai", country: "United Arab Emirates", iata: "DXB", icao: "OMDB", latitude: "25.2528", longitude: "55.3644", altitude: "11", timezone: "4", dst: "U", tzTimezone: "Asia/Dubai", type: "airport", source: "OurAirports" },
      { id: "46", name: "London Heathrow Airport", city: "London", country: "United Kingdom", iata: "LHR", icao: "EGLL", latitude: "51.4700", longitude: "-0.4543", altitude: "25", timezone: "0", dst: "E", tzTimezone: "Europe/London", type: "airport", source: "OurAirports" },
      { id: "51", name: "John F. Kennedy International Airport", city: "New York", country: "United States", iata: "JFK", icao: "KJFK", latitude: "40.6413", longitude: "-73.7781", altitude: "4", timezone: "-5", dst: "U", tzTimezone: "America/New_York", type: "airport", source: "OurAirports" }
    ];

    // Date prices cache
    const datePricesCache = new Map();

    // Update search summary
    function updateSearchSummary() {
      document.getElementById('routeDisplay').textContent = `${origin} → ${destination}`;
      document.getElementById('dateDisplay').textContent = new Date(departure).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      document.getElementById('passengerDisplay').textContent = `${passengers} Passenger${passengers > 1 ? 's' : ''}`;
    }

    // Show notification
    function showNotification(message, duration = 3000) {
      const notification = document.getElementById('notification');
      notification.textContent = message;
      notification.style.display = 'block';
      
      setTimeout(() => {
        notification.style.display = 'none';
      }, duration);
    }

    // Initialize page
    updateSearchSummary();
    generateDateRangeBar();
    setupAutocomplete();

    async function getAccessToken() {
      const res = await fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`
      });
      const data = await res.json();
      return data.access_token;
    }

    async function fetchFlightsForDate(date) {
      try {
        const token = await getAccessToken();

        const url = new URL("https://test.api.amadeus.com/v2/shopping/flight-offers");
        url.searchParams.append("originLocationCode", origin);
        url.searchParams.append("destinationLocationCode", destination);
        url.searchParams.append("departureDate", date);
        if (returnDate) url.searchParams.append("returnDate", returnDate);
        url.searchParams.append("adults", passengers);
        url.searchParams.append("currencyCode", "BDT");
        url.searchParams.append("max", "30");

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();

        if (!data.data || data.data.length === 0) {
          return [];
        }

        // Process flight data
        return data.data.map(flight => {
          const price = parseFloat(flight.price.total);
          
          // Get all segments in the itinerary
          const segments = flight.itineraries[0].segments;
          
          // Get first segment for departure information
          const firstSegment = segments[0];
          const carrierCode = firstSegment.carrierCode;
          const airlineName = data.dictionaries.carriers[carrierCode] || carrierCode;
          
          // Get last segment for arrival information (this is the final destination)
          const lastSegment = segments[segments.length - 1];
          
          const dep = firstSegment.departure;
          const arr = lastSegment.arrival;

          // Calculate stops (number of segments - 1)
          const stops = segments.length - 1;
          
          // Calculate duration
          const duration = flight.itineraries[0].duration.replace("PT","").replace("H","h ").replace("M","m");
          
          // Calculate departure and arrival times
          const depTime = new Date(dep.at);
          const arrTime = new Date(arr.at);
          
          // Format times
          const depFormatted = depTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
          const arrFormatted = arrTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
          
          // Get aircraft info (using first segment)
          const aircraft = data.dictionaries.aircraft[firstSegment.aircraft.code] || firstSegment.aircraft.code;

          // Create stop data for layover information
          let stopData = [];
          if (stops > 0) {
            for (let i = 0; i < segments.length - 1; i++) {
              const currentSegment = segments[i];
              const nextSegment = segments[i + 1];
              
              const arrivalTime = new Date(currentSegment.arrival.at);
              const departureTime = new Date(nextSegment.departure.at);
              
              // Calculate layover duration
              const layoverMs = departureTime - arrivalTime;
              const layoverHours = Math.floor(layoverMs / (1000 * 60 * 60));
              const layoverMinutes = Math.floor((layoverMs % (1000 * 60 * 60)) / (1000 * 60));
              
              stopData.push({
                airportCode: currentSegment.arrival.iataCode,
                arrivalTime: currentSegment.arrival.at,
                departureTime: nextSegment.departure.at,
                layoverDuration: `${layoverHours}h ${layoverMinutes}m`,
                terminal: currentSegment.arrival.terminal || "TBD",
                nextFlight: {
                  airline: data.dictionaries.carriers[nextSegment.carrierCode] || nextSegment.carrierCode,
                  flightNumber: nextSegment.carrierCode + nextSegment.number
                }
              });
            }
          }

          return {
            id: flight.id,
            airlineName,
            carrierCode,
            dep: {
              iataCode: dep.iataCode,
              at: dep.at,
              formattedTime: depFormatted,
              terminal: dep.terminal || "TBD"
            },
            arr: {
              iataCode: arr.iataCode,
              at: arr.at,
              formattedTime: arrFormatted,
              terminal: arr.terminal || "TBD"
            },
            price,
            duration,
            stops,
            aircraft,
            segments: segments,
            stopData: stopData
          };
        });
      } catch (err) {
        console.error(err);
        return [];
      }
    }

    async function fetchFlights() {
      // Show loading
      resultsContainer.innerHTML = `
        <div class="loading">
          <div class="loading-spinner"></div>
        </div>
      `;

      try {
        flightData = await fetchFlightsForDate(departure);
        
        if (flightData.length === 0) {
          resultsContainer.innerHTML = `
            <div class="no-results">
              <i class="fas fa-plane-slash"></i>
              <h3>No flights found</h3>
              <p>We couldn't find any flights for your selected route and dates. Please try different dates or destinations.</p>
            </div>
          `;
          return;
        }

        // Populate airlines filter
        populateAirlinesFilter();
        
        // Set initial filtered data
        filteredData = [...flightData];
        
        // Apply current filters
        applyCurrentFilters();
        
        // Update results count
        updateResultsCount(filteredData.length);

      } catch (err) {
        console.error(err);
        resultsContainer.innerHTML = `
          <div class="no-results">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Error fetching flights</h3>
            <p>We encountered an error while fetching flights. Please try again later.</p>
          </div>
        `;
      }
    }

    function renderFlights(list) {
      if (list.length === 0) {
        resultsContainer.innerHTML = `
          <div class="no-results">
            <i class="fas fa-filter"></i>
            <h3>No flights match your filters</h3>
            <p>Try adjusting your filter criteria to see more results.</p>
          </div>
        `;
        return;
      }
      
      resultsContainer.innerHTML = list.map(f => {
        // Build the flight path HTML based on segments
        let pathHTML = '';
        
        // Add departure segment
        pathHTML += `
          <div class="path-segment">
            <div class="airport-code">${f.dep.iataCode}</div>
            <div class="airport-name">${getCityName(f.dep.iataCode)}</div>
            <div class="path-line"></div>
            <div class="flight-time">${f.dep.formattedTime}</div>
          </div>
        `;
        
        // Add stop segments if any
        if (f.stopData && f.stopData.length > 0) {
          f.stopData.forEach((stop, index) => {
            pathHTML += `
              <div class="path-segment">
                <div class="airport-code">${stop.airportCode}</div>
                <div class="airport-name">${getCityName(stop.airportCode)}</div>
                <div class="path-line"></div>
                <div class="flight-time">${new Date(stop.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
              </div>
            `;
          });
        }
        
        // Add final arrival segment
        pathHTML += `
          <div class="path-segment">
            <div class="airport-code">${f.arr.iataCode}</div>
            <div class="airport-name">${getCityName(f.arr.iataCode)}</div>
            <div class="flight-time">${f.arr.formattedTime}</div>
          </div>
        `;
        
        return `
          <div class="flight-card">
            <div class="flight-card-header">
              <div class="flight-price">BDT ${f.price.toLocaleString()}</div>
            </div>
            <div class="flight-card-body">
              <div class="airline-info">
                <img src="https://content.airhex.com/content/logos/airlines_${f.carrierCode}_100_100_s.png" 
                 alt="${f.airlineName}" class="airline-logo"
                 onerror="this.src='https://via.placeholder.com/50?text=${f.carrierCode}'">
                <div class="airline-name">${f.airlineName}</div>
              </div>
              <div class="flight-path">
                ${pathHTML}
                <div class="flight-details">
                  <div class="detail-item">
                    <i class="fas fa-clock"></i> Duration: ${f.duration}
                  </div>
                  <div class="detail-item">
                    <i class="fas fa-plane"></i> Aircraft: ${f.aircraft}
                  </div>
                  <div class="detail-item">
                    <i class="fas fa-suitcase"></i> Cabin: Economy
                  </div>
                </div>
              </div>
            </div>
            <div class="flight-card-footer">
              <div class="flight-duration">
                <i class="fas fa-route"></i> ${f.stops === 0 ? 'Non-stop' : `${f.stops} Stop${f.stops > 1 ? 's' : ''}`}
              </div>
              <button class="select-btn" onclick='selectFlight(${JSON.stringify(f)})'>
                Select <i class="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
        `;
      }).join("");
    }

    function getCityName(iataCode) {
      // This is a simplified function - in a real app, you'd have a mapping
      const cityMap = {
        'DAC': 'Dhaka',
        'BKK': 'Bangkok',
        'DEL': 'Delhi',
        'BOM': 'Mumbai',
        'CCU': 'Kolkata',
        'SIN': 'Singapore',
        'KUL': 'Kuala Lumpur',
        'DXB': 'Dubai',
        'LHR': 'London',
        'JFK': 'New York',
        'CAI': 'Cairo',
        'DOH': 'Doha'
      };
      return cityMap[iataCode] || iataCode;
    }

    function populateAirlinesFilter() {
      const airlinesFilter = document.getElementById('airlinesFilter');
      const airlines = [...new Set(flightData.map(flight => flight.airlineName))];
      
      // Clear existing options except "All Airlines"
      while (airlinesFilter.options.length > 1) {
        airlinesFilter.remove(1);
      }
      
      // Add airline options
      airlines.forEach(airline => {
        const option = document.createElement('option');
        option.value = airline;
        option.textContent = airline;
        airlinesFilter.appendChild(option);
      });
    }

    function applyFilter(type, buttonElement) {
      // Update active button
      document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      buttonElement.classList.add('active');
      
      // Update current filters
      currentFilters.sortBy = type;
      
      // Apply filters
      applyCurrentFilters();
    }

    function parseDuration(duration) {
      // Parse duration in format "Xh Ym" to minutes
      const hours = parseInt(duration) || 0;
      const minutes = parseInt(duration.match(/(\d+)m/)?.[1]) || 0;
      return hours * 60 + minutes;
    }

    function applyCurrentFilters() {
      // Start with all flights
      filteredData = [...flightData];
      
      // Apply stops filter
      if (currentFilters.stops !== 'all') {
        if (currentFilters.stops === '2+') {
          filteredData = filteredData.filter(flight => flight.stops >= 2);
        } else {
          const stops = parseInt(currentFilters.stops);
          filteredData = filteredData.filter(flight => flight.stops === stops);
        }
      }
      
      // Apply airlines filter
      if (currentFilters.airline !== 'all') {
        filteredData = filteredData.filter(flight => flight.airlineName === currentFilters.airline);
      }
      
      // Apply price range filter
      if (currentFilters.priceRange !== 'all') {
        if (currentFilters.priceRange === '0-10000') {
          filteredData = filteredData.filter(flight => flight.price <= 10000);
        } else if (currentFilters.priceRange === '10000-20000') {
          filteredData = filteredData.filter(flight => flight.price > 10000 && flight.price <= 20000);
        } else if (currentFilters.priceRange === '20000-30000') {
          filteredData = filteredData.filter(flight => flight.price > 20000 && flight.price <= 30000);
        } else if (currentFilters.priceRange === '30000+') {
          filteredData = filteredData.filter(flight => flight.price > 30000);
        }
      }
      
      // Sort based on current filter
      if (currentFilters.sortBy === 'cheapest') {
        filteredData.sort((a, b) => a.price - b.price);
      } else if (currentFilters.sortBy === 'fastest') {
        filteredData.sort((a, b) => {
          const aDuration = parseDuration(a.duration);
          const bDuration = parseDuration(b.duration);
          return aDuration - bDuration;
        });
      } else if (currentFilters.sortBy === 'earliest') {
        filteredData.sort((a, b) => new Date(a.dep.at) - new Date(b.dep.at));
      } else if (currentFilters.sortBy === 'latest') {
        filteredData.sort((a, b) => new Date(b.dep.at) - new Date(a.dep.at));
      }
      
      renderFlights(filteredData);
      updateResultsCount(filteredData.length);
    }

    function sortFlights(sortBy) {
      // Update current filters
      currentFilters.sortBy = sortBy;
      
      // Apply filters
      applyCurrentFilters();
    }

    function resetFilters(buttonElement) {
      // Reset all filters
      document.getElementById('stopsFilter').value = 'all';
      document.getElementById('airlinesFilter').value = 'all';
      document.getElementById('priceRange').value = 'all';
      document.getElementById('sortBy').value = 'cheapest';
      
      // Reset current filters
      currentFilters = {
        stops: 'all',
        airline: 'all',
        priceRange: 'all',
        sortBy: 'cheapest'
      };
      
      // Reset active button
      document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      buttonElement.classList.add('active');
      
      // Apply filters
      applyCurrentFilters();
    }

    function updateResultsCount(count) {
      document.getElementById('resultsCount').textContent = `${count} flight${count !== 1 ? 's' : ''} found`;
    }

    function selectFlight(flightObj) {
      const encoded = encodeURIComponent(JSON.stringify(flightObj));
      window.location.href = `booking.html?flight=${encoded}`;
    }

    // Generate date range bar
    function generateDateRangeBar() {
      const dateRange = document.getElementById('dateRange');
      const departureDate = new Date(departure);
      
      // Generate 7 days (3 before, current, 3 after)
      const dates = [];
      for (let i = -3; i <= 3; i++) {
        const date = new Date(departureDate);
        date.setDate(departureDate.getDate() + i);
        dates.push(date);
      }
      
      // Create date cards
      dateRange.innerHTML = dates.map((date, index) => {
        const dateStr = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayNum = date.getDate();
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        
        // Determine if this is the selected date
        const isSelected = date.toDateString() === departureDate.toDateString();
        
        // Determine if this is a past date
        const isPast = date < new Date() && !isSelected;
        
        return `
          <div class="date-card ${isSelected ? 'selected' : ''} ${isPast ? 'past' : ''}" 
               data-date="${dateStr}" onclick="selectDate('${dateStr}', this)">
            <div class="day">${dayName}</div>
            <div class="date">${dayNum} ${monthName}</div>
            <div class="price loading" id="price-${dateStr}">
              <div class="loading-spinner"></div>
            </div>
          </div>
        `;
      }).join('');
      
      // Load prices for all dates
      loadDatePrices(dates);
    }

    // Load prices for all dates in the date range
    async function loadDatePrices(dates) {
      for (const date of dates) {
        const dateStr = date.toISOString().split('T')[0];
        const priceElement = document.getElementById(`price-${dateStr}`);
        
        try {
          // Check if we have this date cached
          if (datePricesCache.has(dateStr)) {
            const price = datePricesCache.get(dateStr);
            priceElement.innerHTML = `BDT ${price.toLocaleString()}`;
            priceElement.classList.remove('loading');
            continue;
          }
          
          // Fetch flights for this date
          const flights = await fetchFlightsForDate(dateStr);
          
          if (flights.length > 0) {
            // Find the cheapest flight
            const cheapestFlight = flights.reduce((min, flight) => flight.price < min.price ? flight : min, flights[0]);
            datePricesCache.set(dateStr, cheapestFlight.price);
            priceElement.innerHTML = `BDT ${cheapestFlight.price.toLocaleString()}`;
          } else {
            priceElement.innerHTML = 'No flights';
            datePricesCache.set(dateStr, null);
          }
          
          priceElement.classList.remove('loading');
        } catch (error) {
          console.error(`Error loading price for date ${dateStr}:`, error);
          priceElement.innerHTML = 'Error';
          priceElement.classList.remove('loading');
        }
      }
    }

    // Select a date from the date range bar
    async function selectDate(dateStr, element) {
      // Show loading state
      element.classList.add('loading');
      
      // Update departure date
      departure = dateStr;
      
      // Update URL parameters
      params.set('departure', departure);
      window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
      
      // Update search summary
      updateSearchSummary();
      
      // Update selected state
      document.querySelectorAll('.date-card').forEach(card => {
        card.classList.remove('selected');
      });
      element.classList.add('selected');
      
      // Show notification
      showNotification(`Loading flights for ${new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}...`);
      
      // Fetch flights for the new date
      try {
        flightData = await fetchFlightsForDate(departure);
        
        if (flightData.length === 0) {
          resultsContainer.innerHTML = `
            <div class="no-results">
              <i class="fas fa-plane-slash"></i>
              <h3>No flights found</h3>
              <p>We couldn't find any flights for your selected route and dates. Please try different dates or destinations.</p>
            </div>
          `;
          element.classList.remove('loading');
          return;
        }
        
        // Populate airlines filter
        populateAirlinesFilter();
        
        // Set initial filtered data
        filteredData = [...flightData];
        
        // Apply current filters
        applyCurrentFilters();
        
        // Update results count
        updateResultsCount(filteredData.length);
        
        // Show success notification
        showNotification(`Found ${filteredData.length} flights for ${new Date(departure).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`);
        
      } catch (error) {
        console.error('Error fetching flights:', error);
        resultsContainer.innerHTML = `
          <div class="no-results">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Error fetching flights</h3>
            <p>We encountered an error while fetching flights. Please try again later.</p>
          </div>
        `;
        
        showNotification('Error loading flights. Please try again.');
      }
      
      element.classList.remove('loading');
    }

    // Modal functions
    function openModifySearchModal() {
      document.getElementById('modifySearchModal').classList.add('active');
      
      // Populate modal with current search values
      document.getElementById('modalOrigin').value = getAirportByCode(origin);
      document.getElementById('modalDestination').value = getAirportByCode(destination);
      document.getElementById('modalDeparture').value = departure;
      document.getElementById('modalReturn').value = returnDate || '';
      document.getElementById('modalPassengers').value = passengers;
    }

    function closeModifySearchModal() {
      document.getElementById('modifySearchModal').classList.remove('active');
    }

    // Update search with modal values
    function updateSearch() {
      // Get values from modal
      const modalOriginValue = document.getElementById('modalOrigin').value;
      const modalDestinationValue = document.getElementById('modalDestination').value;
      const modalDeparture = document.getElementById('modalDeparture').value;
      const modalReturn = document.getElementById('modalReturn').value;
      const modalPassengers = document.getElementById('modalPassengers').value;
      
      // Extract airport codes
      const originCodeMatch = modalOriginValue.match(/\(([^)]+)\)/);
      const destinationCodeMatch = modalDestinationValue.match(/\(([^)]+)\)/);
      
      if (!originCodeMatch || !destinationCodeMatch) {
        alert('Please select valid airports from the suggestions');
        return;
      }
      
      // Update search parameters
      origin = originCodeMatch[1];
      destination = destinationCodeMatch[1];
      departure = modalDeparture;
      returnDate = modalReturn || null;
      passengers = modalPassengers;
      
      // Update URL parameters
      params.set('origin', origin);
      params.set('destination', destination);
      params.set('departure', departure);
      if (returnDate) {
        params.set('returnDate', returnDate);
      } else {
        params.delete('returnDate');
      }
      params.set('passengers', passengers);
      
      // Update URL
      window.location.href = `${window.location.pathname}?${params.toString()}`;
    }

    // Get airport name by code
    function getAirportByCode(code) {
      const airport = airports.find(a => a.iata === code);
      return airport ? `${airport.city} (${airport.iata})` : code;
    }

    // Setup autocomplete for modal inputs
    function setupAutocomplete() {
      // Origin input
      const modalOrigin = document.getElementById('modalOrigin');
      const modalOriginSuggestions = document.getElementById('modalOrigin-suggestions');
      
      modalOrigin.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        
        if (query.length < 2) {
          modalOriginSuggestions.classList.remove('active');
          return;
        }
        
        const filteredAirports = airports.filter(airport => 
          airport.iata.toLowerCase().includes(query) || 
          airport.city.toLowerCase().includes(query) || 
          airport.name.toLowerCase().includes(query) ||
          airport.country.toLowerCase().includes(query)
        );
        
        if (filteredAirports.length === 0) {
          modalOriginSuggestions.innerHTML = '<div class="no-results">No airports found</div>';
        } else {
          modalOriginSuggestions.innerHTML = filteredAirports.map(airport => `
            <div class="suggestion-item" data-code="${airport.iata}" data-city="${airport.city}" data-name="${airport.name}">
              <span class="suggestion-code">${airport.iata}</span>
              <span class="suggestion-name">${airport.city}</span>
              <span class="suggestion-city">${airport.name}</span>
            </div>
          `).join('');
        }
        
        modalOriginSuggestions.classList.add('active');
      });
      
      modalOriginSuggestions.addEventListener('click', function(e) {
        const suggestionItem = e.target.closest('.suggestion-item');
        if (suggestionItem) {
          const code = suggestionItem.dataset.code;
          const city = suggestionItem.dataset.city;
          const name = suggestionItem.dataset.name;
          modalOrigin.value = `${city} (${code})`;
          modalOriginSuggestions.classList.remove('active');
        }
      });
      
      // Destination input
      const modalDestination = document.getElementById('modalDestination');
      const modalDestinationSuggestions = document.getElementById('modalDestination-suggestions');
      
      modalDestination.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        
        if (query.length < 2) {
          modalDestinationSuggestions.classList.remove('active');
          return;
        }
        
        const filteredAirports = airports.filter(airport => 
          airport.iata.toLowerCase().includes(query) || 
          airport.city.toLowerCase().includes(query) || 
          airport.name.toLowerCase().includes(query) ||
          airport.country.toLowerCase().includes(query)
        );
        
        if (filteredAirports.length === 0) {
          modalDestinationSuggestions.innerHTML = '<div class="no-results">No airports found</div>';
        } else {
          modalDestinationSuggestions.innerHTML = filteredAirports.map(airport => `
            <div class="suggestion-item" data-code="${airport.iata}" data-city="${airport.city}" data-name="${airport.name}">
              <span class="suggestion-code">${airport.iata}</span>
              <span class="suggestion-name">${airport.city}</span>
              <span class="suggestion-city">${airport.name}</span>
            </div>
          `).join('');
        }
        
        modalDestinationSuggestions.classList.add('active');
      });
      
      modalDestinationSuggestions.addEventListener('click', function(e) {
        const suggestionItem = e.target.closest('.suggestion-item');
        if (suggestionItem) {
          const code = suggestionItem.dataset.code;
          const city = suggestionItem.dataset.city;
          const name = suggestionItem.dataset.name;
          modalDestination.value = `${city} (${code})`;
          modalDestinationSuggestions.classList.remove('active');
        }
      });
      
      // Hide suggestions when clicking outside
      document.addEventListener('click', function(e) {
        if (!e.target.closest('.input-group')) {
          modalOriginSuggestions.classList.remove('active');
          modalDestinationSuggestions.classList.remove('active');
        }
      });
    }

    // Add event listeners for filter changes
    document.getElementById('stopsFilter').addEventListener('change', function() {
      currentFilters.stops = this.value;
      applyCurrentFilters();
    });

    document.getElementById('airlinesFilter').addEventListener('change', function() {
      currentFilters.airline = this.value;
      applyCurrentFilters();
    });

    document.getElementById('priceRange').addEventListener('change', function() {
      currentFilters.priceRange = this.value;
      applyCurrentFilters();
    });

    // Fetch flights on page load
    fetchFlights();
