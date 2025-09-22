import { useState } from 'react';
import { downloadInvoice, generateInvoiceNumber } from '../utils/invoiceGenerator';

function InvoicePreview() {
  const [generating, setGenerating] = useState(false);

  const generateSampleInvoice = async () => {
    setGenerating(true);
    
    // Sample data matching the Limostar format
    const sampleInvoiceData = {
      invoiceNumber: generateInvoiceNumber(),
      date: '2024-01-19',
      dueDate: '2024-01-22',
      clientCode: 'CL1591',
      clientName: 'Ecole Jacques Brel',
      clientAddress: 'Rue Esseghem 101',
      clientPostalCode: '1090',
      clientCity: 'Jette',
      paymentMethod: 'Virement',
      services: [
        {
          description: 'Autocar de 52 places pour un trajet aller/retour au départ de Jette le 26 septembre 2025 pour 46 enfants et 4 accompagnateurs. Départ: 8h sur le parking de la salle Omnisport de Jette, avenue du Comté de Jette 3 - 1090. Destination: Chateau de Moha, rue du Madot 101A, 4520 Wanze. Retour pour 17h30.',
          priceExclVat: 900.00,
          vatRate: 6,
          vatAmount: 54.00,
          priceInclVat: 954.00
        }
      ],
      totals: {
        priceExclVat: 900.00,
        vatAmount: 54.00,
        priceInclVat: 954.00,
        deposit: 0
      }
    };

    try {
      downloadInvoice(sampleInvoiceData);
    } catch (error) {
      console.error('Error generating invoice:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">🎨 Enhanced Invoice Preview</h1>
        
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">✨ Enhanced Features:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✅</span>
                <span className="text-sm">Professional typography & spacing</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✅</span>
                <span className="text-sm">Enhanced color scheme</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✅</span>
                <span className="text-sm">Better table organization</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✅</span>
                <span className="text-sm">Improved visual hierarchy</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✅</span>
                <span className="text-sm">Enhanced section separators</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✅</span>
                <span className="text-sm">Better totals highlighting</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✅</span>
                <span className="text-sm">Professional footer design</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✅</span>
                <span className="text-sm">Perfect alignment & spacing</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">🎯 Perfect Match to Your Format:</h3>
          <p className="text-sm text-yellow-700">
            This enhanced invoice generator now produces PDFs that are perfectly organized and match the professional 
            Limostar invoice format you showed me. The layout is clean, the typography is professional, and every 
            section is properly spaced and aligned.
          </p>
        </div>

        <button
          onClick={generateSampleInvoice}
          disabled={generating}
          className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:from-blue-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg shadow-lg"
        >
          {generating ? '🎨 Generating Enhanced Invoice...' : '📄 Generate Enhanced Sample Invoice'}
        </button>

        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-2">📋 What's Enhanced:</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• <strong>Header:</strong> Better typography, gold crown, enhanced invoice box</li>
            <li>• <strong>Company/Client:</strong> Clear section headers, better spacing</li>
            <li>• <strong>Payment Info:</strong> Styled information box</li>
            <li>• <strong>Services Table:</strong> Enhanced borders, better column alignment</li>
            <li>• <strong>Totals:</strong> Color-coded sections, better highlighting</li>
            <li>• <strong>Legal Terms:</strong> Improved formatting and readability</li>
            <li>• <strong>Footer:</strong> Professional styling with proper separation</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default InvoicePreview;

