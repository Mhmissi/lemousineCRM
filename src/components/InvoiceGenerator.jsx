import { useState, useEffect } from 'react';
import { firestoreService } from '../services/firestoreService';
import { downloadInvoice, createInvoiceFromTrip, generateInvoiceNumber } from '../utils/invoiceGenerator';

function InvoiceGenerator() {
  const [trips, setTrips] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [tripsData, clientsData] = await Promise.all([
          firestoreService.getTrips(),
          firestoreService.getClients()
        ]);
        setTrips(tripsData);
        setClients(clientsData);
      } catch (error) {
        setStatus('❌ Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const generateInvoiceFromSelectedTrip = async () => {
    if (!selectedTrip) {
      setStatus('❌ Please select a trip');
      return;
    }

    try {
      setLoading(true);
      
      const trip = trips.find(t => t.id === selectedTrip);
      const client = clients.find(c => c.company === trip.client || c.id === trip.clientId);
      
      if (!trip) {
        setStatus('❌ Trip not found');
        return;
      }

      // Generate invoice number
      const invoiceNumber = generateInvoiceNumber();
      
      // Create invoice data
      const invoiceData = createInvoiceFromTrip(trip, client, invoiceNumber);
      
      // Save to Firestore
      await firestoreService.addInvoice({
        invoiceNumber: invoiceNumber,
        date: invoiceData.date,
        dueDate: invoiceData.dueDate,
        clientName: invoiceData.clientName,
        clientAddress: invoiceData.clientAddress,
        clientPostalCode: invoiceData.clientPostalCode,
        clientCity: invoiceData.clientCity,
        paymentMethod: invoiceData.paymentMethod,
        services: invoiceData.services,
        totals: invoiceData.totals,
        status: 'draft',
        tripId: trip.id
      });

      // Generate and download PDF
      downloadInvoice(invoiceData);
      
      setStatus('✅ Invoice generated and downloaded successfully!');
      
    } catch (error) {
      setStatus('❌ Failed to generate invoice');
    } finally {
      setLoading(false);
    }
  };

  const generateSampleInvoice = () => {
    const sampleTrip = {
      id: 'sample-trip',
      pickup: 'Brussels Airport',
      destination: 'Downtown Brussels',
      date: '2024-01-20',
      time: '10:00 - 12:00',
      status: 'completed',
      passengers: 25,
      revenue: 1250,
      client: 'ABC Corporation',
      notes: 'Corporate group transfer'
    };

    const sampleClient = {
      id: 'CL0001',
      company: 'ABC Corporation',
      address: '123 Business Street',
      postalCode: '1000',
      city: 'Brussels',
      country: 'Belgium'
    };

    const invoiceNumber = generateInvoiceNumber();
    const invoiceData = createInvoiceFromTrip(sampleTrip, sampleClient, invoiceNumber);
    
    downloadInvoice(invoiceData);
    setStatus('✅ Sample invoice generated and downloaded!');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">🧾 Invoice Generator</h1>
        
        {/* Status */}
        {status && (
          <div className={`p-4 rounded-lg mb-6 ${
            status.includes('✅') ? 'bg-green-50 border border-green-200' : 
            'bg-red-50 border border-red-200'
          }`}>
            <p className={`font-medium ${
              status.includes('✅') ? 'text-green-800' : 'text-red-800'
            }`}>
              {status}
            </p>
          </div>
        )}

        {/* Trip Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Trip:
          </label>
          <select
            value={selectedTrip}
            onChange={(e) => setSelectedTrip(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          >
            <option value="">-- Select a trip --</option>
            {trips.map((trip) => (
              <option key={trip.id} value={trip.id}>
                {trip.pickup} → {trip.destination} - {trip.date} - €{trip.revenue || 0}
              </option>
            ))}
          </select>
        </div>

        {/* Client Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Client:
          </label>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          >
            <option value="">-- Auto-select from trip --</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.company} - {client.city}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={generateInvoiceFromSelectedTrip}
            disabled={loading || !selectedTrip}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Generating...' : '🧾 Generate Invoice from Trip'}
          </button>

          <button
            onClick={generateSampleInvoice}
            disabled={loading}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            📄 Generate Sample Invoice
          </button>
        </div>

        {/* Data Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Available Trips</h3>
            <div className="text-2xl font-bold text-blue-600">{trips.length}</div>
            <div className="text-sm text-blue-700">Trips ready for invoicing</div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Available Clients</h3>
            <div className="text-2xl font-bold text-green-600">{clients.length}</div>
            <div className="text-sm text-green-700">Client companies</div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gray-50 rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-gray-800 mb-2">📋 Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
            <li><strong>Select a trip</strong> from the dropdown above</li>
            <li><strong>Optionally select a client</strong> (will auto-select from trip if not specified)</li>
            <li><strong>Click "Generate Invoice"</strong> to create and download the PDF</li>
            <li><strong>Or click "Sample Invoice"</strong> to generate with sample data</li>
          </ol>
        </div>

        {/* Invoice Format Preview */}
        <div className="bg-blue-50 rounded-lg p-4 mt-4">
          <h3 className="font-semibold text-blue-800 mb-2">🎨 Invoice Format:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>✅ Professional Limostar branding with crown logo</li>
            <li>✅ Company information (VAT, IBAN, BIC)</li>
            <li>✅ Client details and payment terms</li>
            <li>✅ Detailed service description</li>
            <li>✅ VAT calculations (6% for transportation)</li>
            <li>✅ Legal terms and conditions</li>
            <li>✅ Automatic invoice numbering</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default InvoiceGenerator;

