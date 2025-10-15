import { useState } from 'react'
import { firestoreService } from '../services/firestoreService'
import { FileEdit, Plus, CheckCircle, XCircle, AlertCircle, RefreshCw, Database } from 'lucide-react'

function CreditNotesTester() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [creditNotes, setCreditNotes] = useState([])

  const testCreditNoteCreation = async () => {
    setLoading(true)
    setStatus('Testing credit note creation...')
    setError('')

    try {
      // Create a test credit note
      const testCreditNoteData = {
        number: `TEST-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        client: 'Test Client',
        remark: 'This is a test credit note',
        totalPrice: 150.00,
        status: 'active',
        designations: [
          {
            id: 1,
            description: 'Test service',
            vatRate: '21',
            price: 150.00
          }
        ]
      }

      console.log('Creating test credit note:', testCreditNoteData)
      const docRef = await firestoreService.addCreditNote(testCreditNoteData)
      console.log('Credit note created with ID:', docRef)
      
      setStatus(`✅ Credit note created successfully with ID: ${docRef}`)
      
      // Load all credit notes to verify
      await loadAllCreditNotes()
      
    } catch (error) {
      console.error('Credit note creation error:', error)
      setError(`❌ Credit note creation failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const loadAllCreditNotes = async () => {
    setLoading(true)
    setStatus('Loading all credit notes...')
    setError('')

    try {
      const creditNotesData = await firestoreService.getCreditNotes()
      console.log('Loaded credit notes:', creditNotesData)
      
      setCreditNotes(creditNotesData)
      setStatus(`✅ Loaded ${creditNotesData.length} credit notes from Firebase`)
      
    } catch (error) {
      console.error('Load credit notes error:', error)
      setError(`❌ Failed to load credit notes: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testCreditNoteUpdate = async () => {
    if (creditNotes.length === 0) {
      setError('❌ No credit notes available to update. Create one first.')
      return
    }

    setLoading(true)
    setStatus('Testing credit note update...')
    setError('')

    try {
      const firstCreditNote = creditNotes[0]
      const updateData = {
        remark: `Updated at ${new Date().toLocaleTimeString()}`,
        totalPrice: firstCreditNote.totalPrice + 10
      }

      console.log('Updating credit note:', firstCreditNote.id, updateData)
      await firestoreService.updateCreditNote(firstCreditNote.id, updateData)
      
      setStatus(`✅ Credit note ${firstCreditNote.id} updated successfully`)
      
      // Reload to see changes
      await loadAllCreditNotes()
      
    } catch (error) {
      console.error('Credit note update error:', error)
      setError(`❌ Credit note update failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testCreditNoteDeletion = async () => {
    if (creditNotes.length === 0) {
      setError('❌ No credit notes available to delete. Create one first.')
      return
    }

    setLoading(true)
    setStatus('Testing credit note deletion...')
    setError('')

    try {
      const firstCreditNote = creditNotes[0]
      console.log('Deleting credit note:', firstCreditNote.id)
      await firestoreService.deleteCreditNote(firstCreditNote.id)
      
      setStatus(`✅ Credit note ${firstCreditNote.id} deleted successfully`)
      
      // Reload to see changes
      await loadAllCreditNotes()
      
    } catch (error) {
      console.error('Credit note deletion error:', error)
      setError(`❌ Credit note deletion failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <FileEdit className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Credit Notes Firebase Tester</h1>
            <p className="text-gray-600">Test credit notes CRUD operations with Firebase</p>
          </div>
        </div>

        {/* Status Messages */}
        {(status || error) && (
          <div className={`p-4 rounded-lg mb-6 ${
            status.includes('✅') ? 'bg-green-50 border border-green-200' : 
            error.includes('❌') ? 'bg-red-50 border border-red-200' :
            'bg-yellow-50 border border-yellow-200'
          }`}>
            <p className={`font-medium ${
              status.includes('✅') ? 'text-green-800' :
              error.includes('❌') ? 'text-red-800' :
              'text-yellow-800'
            }`}>
              {status || error}
            </p>
          </div>
        )}

        {/* Test Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={testCreditNoteCreation}
            disabled={loading}
            className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5 mx-auto mb-2" />
            Create Test Credit Note
          </button>

          <button
            onClick={loadAllCreditNotes}
            disabled={loading}
            className="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-5 h-5 mx-auto mb-2 ${loading ? 'animate-spin' : ''}`} />
            Load All Credit Notes
          </button>

          <button
            onClick={testCreditNoteUpdate}
            disabled={loading || creditNotes.length === 0}
            className="p-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-5 h-5 mx-auto mb-2" />
            Update First Credit Note
          </button>

          <button
            onClick={testCreditNoteDeletion}
            disabled={loading || creditNotes.length === 0}
            className="p-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <XCircle className="w-5 h-5 mx-auto mb-2" />
            Delete First Credit Note
          </button>
        </div>

        {/* Credit Notes Display */}
        {creditNotes.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Current Credit Notes ({creditNotes.length})
            </h3>
            <div className="space-y-4">
              {creditNotes.map((creditNote, index) => (
                <div key={creditNote.id} className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {creditNote.number || `Credit Note ${index + 1}`}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Client: {creditNote.client || 'Unknown'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        €{creditNote.totalPrice || 0}
                      </p>
                      <p className="text-sm text-gray-600">
                        {creditNote.date || 'No date'}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {creditNote.remark || 'No remark'}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      creditNote.status === 'active' ? 'bg-green-100 text-green-800' :
                      creditNote.status === 'inactive' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {creditNote.status || 'unknown'}
                    </span>
                    <span className="text-xs text-gray-500">
                      ID: {creditNote.id}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-800">Testing Instructions</h3>
              <p className="text-blue-700 mt-1">
                Use these buttons to test credit notes Firebase integration:
              </p>
              <ul className="list-disc list-inside text-blue-700 mt-2 space-y-1">
                <li><strong>Create:</strong> Adds a new test credit note to Firebase</li>
                <li><strong>Load:</strong> Retrieves all credit notes from Firebase</li>
                <li><strong>Update:</strong> Modifies the first credit note</li>
                <li><strong>Delete:</strong> Removes the first credit note</li>
              </ul>
              <p className="text-blue-700 mt-2">
                Check the browser console for detailed logs of each operation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreditNotesTester

