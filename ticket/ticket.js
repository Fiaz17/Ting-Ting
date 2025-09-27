
    // Get booking data from URL
    const params = new URLSearchParams(window.location.search);
    const dataJSON = params.get("data");
    let bookingData;

    try {
        bookingData = JSON.parse(decodeURIComponent(dataJSON));
        
        // Update booking summary
        document.getElementById('passengerName').textContent = `${bookingData.passenger.firstName} ${bookingData.passenger.lastName}`;
        document.getElementById('passengerEmail').textContent = bookingData.passenger.email;
        document.getElementById('passengerPhone').textContent = bookingData.passenger.phone;
        document.getElementById('flightName').textContent = bookingData.flight.airlineName;
        document.getElementById('flightRoute').textContent = `${bookingData.flight.dep.iataCode} to ${bookingData.flight.arr.iataCode}`;
        document.getElementById('flightPrice').textContent = `BDT ${bookingData.flight.price}`;
    } catch (e) {
        console.error("Error parsing booking data:", e);
    }

    // Admin verification code (in a real app, this would be validated against a database)
    const ADMIN_CODE = "ADMIN123";
    
    // Verify button click handler
    document.getElementById('verifyBtn').addEventListener('click', function() {
      const enteredCode = document.getElementById('verificationCode').value;
      const errorMessage = document.getElementById('errorMessage');
      const successMessage = document.getElementById('successMessage');
      const ticketSection = document.getElementById('ticketSection');
      
      // Reset messages
      errorMessage.style.display = 'none';
      successMessage.style.display = 'none';
      
      if (enteredCode === ADMIN_CODE) {
        // Code is correct
        successMessage.style.display = 'block';
        ticketSection.style.display = 'block';
        
        // Generate ticket details
        generateTicketDetails();
      } else {
        // Code is incorrect
        errorMessage.style.display = 'block';
      }
    });
    
    // Generate ticket details
    function generateTicketDetails() {
      // Generate a random ticket number
      const ticketNumber = 'TKT' + Math.floor(1000000000 + Math.random() * 9000000000);
      document.getElementById('ticketNumber').textContent = ticketNumber;
      
      // Format date and time
      const departureDate = new Date(bookingData.flight.dep.at);
      const formattedDate = departureDate.toLocaleDateString();
      const formattedTime = departureDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      
      // Update ticket details
      document.getElementById('ticketPassenger').textContent = `${bookingData.passenger.firstName} ${bookingData.passenger.lastName}`;
      document.getElementById('ticketFlight').textContent = bookingData.flight.airlineName;
      document.getElementById('ticketRoute').textContent = `${bookingData.flight.dep.iataCode} to ${bookingData.flight.arr.iataCode}`;
      document.getElementById('ticketDate').textContent = formattedDate;
      document.getElementById('ticketTime').textContent = formattedTime;
      document.getElementById('ticketDuration').textContent = bookingData.flight.duration;
    }
    
    // Download button click handler
    document.getElementById('downloadBtn').addEventListener('click', function() {
      generatePDF();
    });
    
    // Generate PDF function
    function generatePDF() {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(24);
      doc.setTextColor(0, 119, 204);
      doc.text('E-Ticket', 105, 20, { align: 'center' });
      
      // Add ticket number
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Ticket Number: ${document.getElementById('ticketNumber').textContent}`, 105, 30, { align: 'center' });
      
      // Add passenger information
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Passenger Information:', 20, 50);
      doc.setFontSize(12);
      doc.text(`Name: ${document.getElementById('ticketPassenger').textContent}`, 20, 60);
      doc.text(`Email: ${bookingData.passenger.email}`, 20, 70);
      doc.text(`Phone: ${bookingData.passenger.phone}`, 20, 80);
      
      // Add flight information
      doc.setFontSize(14);
      doc.text('Flight Information:', 20, 100);
      doc.setFontSize(12);
      doc.text(`Airline: ${document.getElementById('ticketFlight').textContent}`, 20, 110);
      doc.text(`Route: ${document.getElementById('ticketRoute').textContent}`, 20, 120);
      doc.text(`Date: ${document.getElementById('ticketDate').textContent}`, 20, 130);
      doc.text(`Time: ${document.getElementById('ticketTime').textContent}`, 20, 140);
      doc.text(`Duration: ${document.getElementById('ticketDuration').textContent}`, 20, 150);
      
      // Add price
      doc.setFontSize(16);
      doc.setTextColor(0, 119, 204);
      doc.text(`Price: ${document.getElementById('flightPrice').textContent}`, 105, 170, { align: 'left' });
      
      // Add footer
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('This is an electronic ticket. Please present this ticket along with a valid ID at the airport.', 105, 280, { align: 'center' });
      
      // Save the PDF
      doc.save(`e-ticket-${document.getElementById('ticketNumber').textContent}.pdf`);
    }
 