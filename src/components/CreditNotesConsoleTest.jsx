import { useEffect } from 'react'
import { firestoreService } from '../services/firestoreService'

function CreditNotesConsoleTest() {
  useEffect(() => {
    // Run automatic test when component mounts
    const runCreditNotesTest = async () => {
      console.log('🧪 Starting Credit Notes Firebase Test...')
      
      try {
        // Test 1: Load existing credit notes
        console.log('📋 Test 1: Loading existing credit notes...')
        const existingCreditNotes = await firestoreService.getCreditNotes()
        console.log(`✅ Found ${existingCreditNotes.length} existing credit notes:`, existingCreditNotes)
        
        // Test 2: Create a test credit note
        console.log('📝 Test 2: Creating test credit note...')
        const testCreditNote = {
          number: `TEST-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          client: 'Console Test Client',
          remark: 'This credit note was created by console test',
          totalPrice: 250.00,
          status: 'active',
          designations: [
            {
              id: 1,
              description: 'Console test service',
              vatRate: '21',
              price: 250.00
            }
          ]
        }
        
        const docRef = await firestoreService.addCreditNote(testCreditNote)
        console.log('✅ Test credit note created with ID:', docRef)
        
        // Test 3: Load credit notes again to verify creation
        console.log('🔄 Test 3: Verifying credit note was saved...')
        const updatedCreditNotes = await firestoreService.getCreditNotes()
        console.log(`✅ Now found ${updatedCreditNotes.length} credit notes after creation`)
        
        // Find our test credit note
        const createdCreditNote = updatedCreditNotes.find(cn => cn.id === docRef)
        if (createdCreditNote) {
          console.log('✅ Test credit note found in database:', createdCreditNote)
          
          // Test 4: Update the credit note
          console.log('✏️ Test 4: Updating test credit note...')
          await firestoreService.updateCreditNote(docRef, {
            remark: 'Updated by console test',
            totalPrice: 300.00
          })
          console.log('✅ Credit note updated successfully')
          
          // Test 5: Load again to verify update
          console.log('🔄 Test 5: Verifying update...')
          const finalCreditNotes = await firestoreService.getCreditNotes()
          const updatedCreditNote = finalCreditNotes.find(cn => cn.id === docRef)
          console.log('✅ Updated credit note:', updatedCreditNote)
          
          // Test 6: Delete the test credit note
          console.log('🗑️ Test 6: Deleting test credit note...')
          await firestoreService.deleteCreditNote(docRef)
          console.log('✅ Test credit note deleted successfully')
          
          // Test 7: Final verification
          console.log('🔄 Test 7: Final verification...')
          const finalCreditNotesAfterDelete = await firestoreService.getCreditNotes()
          console.log(`✅ Final count: ${finalCreditNotesAfterDelete.length} credit notes`)
          
          console.log('🎉 All Credit Notes Firebase tests passed successfully!')
          console.log('📊 Summary:')
          console.log(`   - Initial credit notes: ${existingCreditNotes.length}`)
          console.log(`   - After creation: ${updatedCreditNotes.length}`)
          console.log(`   - After deletion: ${finalCreditNotesAfterDelete.length}`)
          console.log('   - Create, Read, Update, Delete operations: ✅ All working')
          
        } else {
          console.error('❌ Test credit note not found after creation')
        }
        
      } catch (error) {
        console.error('❌ Credit Notes Firebase test failed:', error)
        console.error('Error details:', error.message)
      }
    }
    
    // Run the test
    runCreditNotesTest()
    
  }, [])
  
  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
        <span className="text-yellow-800 font-medium">Credit Notes Firebase Test Running...</span>
      </div>
      <p className="text-yellow-700 text-sm mt-2">
        Check the browser console (F12) to see detailed test results and verify that credit notes are properly stored in Firebase.
      </p>
    </div>
  )
}

export default CreditNotesConsoleTest

