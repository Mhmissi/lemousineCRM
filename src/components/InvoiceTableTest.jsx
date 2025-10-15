import { useState } from 'react';
import { downloadInvoice, generateInvoiceNumber } from '../utils/invoiceGenerator';

function InvoiceTableTest() {
  const [generating, setGenerating] = useState(false);

  const generateTestInvoice = async () => {
    setGenerating(true);
    
    // Sample data with multiple services to test table structure
    const sampleInvoiceData = {
      invoiceNumber: generateInvoiceNumber(),
      date: '2024-01-19',
      dueDate: '2024-01-22',
      clientCode: 'CL1591',
      clientName: 'Travessia Virtual Lda',
      clientAddress: '123 Business Street',
      clientPostalCode: '1000',
      clientCity: 'Brussels',
      paymentMethod: 'Virement',
      services: [
        {
          description: 'Service de transport limousine - Transfert aéroport vers centre-ville',
          priceExclVat: 5400.00,
          vatRate: 6,
          vatAmount: 324.00,
          priceInclVat: 5724.00
        },
        {
          description: 'Service de transport limousine - Transfert centre-ville vers aéroport',
          priceExclVat: 3200.00,
          vatRate: 6,
          vatAmount: 192.00,
          priceInclVat: 3392.00
        }
      ],
      totals: {
        priceExclVat: 8600.00,
        vatAmount: 516.00,
        priceInclVat: 9116.00,
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">📊 Enhanced Table Structure Test</h1>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">✨ New Table Features:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✅</span>
                <span className="text-sm">Light blue header background</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✅</span>
                <span className="text-sm">Right-aligned numeric columns</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✅</span>
                <span className="text-sm">Alternating row backgrounds</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✅</span>
                <span className="text-sm">Professional column separators</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✅</span>
                <span className="text-sm">Summary row at bottom</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✅</span>
                <span className="text-sm">Better spacing and typography</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✅</span>
                <span className="text-sm">Remark section added</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✅</span>
                <span className="text-sm">Structured like your example</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">🎯 Perfect Match to Your Format:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• <strong>Header:</strong> "DEVIS N°" instead of "FACTURE N°"</li>
            <li>• <strong>Section Title:</strong> "Détails du devis:" before the table</li>
            <li>• <strong>Table Headers:</strong> Light blue background with proper alignment</li>
            <li>• <strong>Service Rows:</strong> Alternating backgrounds for better readability</li>
            <li>• <strong>Summary Row:</strong> Totals displayed at the bottom of the table</li>
            <li>• <strong>Remark Section:</strong> "www.locationautocar.be by Limostar"</li>
            <li>• <strong>Numeric Alignment:</strong> All prices right-aligned for professional look</li>
          </ul>
        </div>

        <button
          onClick={generateTestInvoice}
          disabled={generating}
          className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:from-blue-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg shadow-lg"
        >
          {generating ? '📊 Generating Enhanced Table...' : '📄 Generate Enhanced Table Test'}
        </button>

        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-2">📋 Table Structure Improvements:</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <div><strong>Column Widths:</strong> Optimized for better content display (120, 35, 35, 35)</div>
            <div><strong>Header Styling:</strong> Light blue background with dark blue text</div>
            <div><strong>Row Heights:</strong> Consistent 25px height for better alignment</div>
            <div><strong>Border Styling:</strong> Professional borders with proper colors</div>
            <div><strong>Text Alignment:</strong> Left for descriptions, right for numbers</div>
            <div><strong>Summary Section:</strong> Dedicated totals row with highlighting</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoiceTableTest;









