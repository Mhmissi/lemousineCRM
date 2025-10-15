import { useState } from 'react'
import { firestoreService } from '../services/firestoreService'
import { UserPlus, X } from 'lucide-react'

/**
 * Form to manually add existing Firebase Auth users as drivers
 * Use this to create Firestore driver records for users that already exist in Firebase Auth
 */
function AddExistingDriverForm() {
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    firebaseAuthId: '',
    role: 'driver' // 'driver' or 'owner'
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.firebaseAuthId) {
      setMessage('❌ Please fill in all required fields')
      return
    }

    setSaving(true)
    setMessage('Saving...')

    try {
      // Check if driver already exists with this email
      const existingDrivers = await firestoreService.getDrivers()
      const driverExists = existingDrivers.some(d => d.email === formData.email)

      if (driverExists) {
        setMessage(`⚠️ Driver with email ${formData.email} already exists!`)
        setSaving(false)
        return
      }

      // Create driver or profile record based on role
      if (formData.role === 'driver') {
        console.log('📝 Creating driver record for existing Firebase Auth user:', formData)
        await firestoreService.addDriver({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || '',
          active: true,
          status: 'active',
          firebaseAuthId: formData.firebaseAuthId,
          license: '',
          experience: 0,
          rating: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          syncedFromAuth: true
        })
        setMessage(`✅ Driver ${formData.name} added successfully!`)
      } else {
        console.log('📝 Creating admin/owner profile for existing Firebase Auth user:', formData)
        await firestoreService.addProfile({
          name: formData.name,
          username: formData.email.split('@')[0],
          email: formData.email,
          classe: 'admin',
          firebaseAuthId: formData.firebaseAuthId,
          dateCreation: new Date(),
          syncedFromAuth: true
        })
        setMessage(`✅ Admin/Owner ${formData.name} added successfully!`)
      }
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        firebaseAuthId: '',
        role: 'driver'
      })

      // Reload page after 1.5 seconds
      setTimeout(() => {
        window.location.reload()
      }, 1500)

    } catch (error) {
      console.error('❌ Error adding driver:', error)
      setMessage(`❌ Error: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (!showForm) {
    return (
      <div className="mb-4">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          <span>Add Existing Firebase Auth User (Driver or Owner)</span>
        </button>
      </div>
    )
  }

  return (
    <div className="mb-6 bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-purple-800 flex items-center">
            <UserPlus className="w-5 h-5 mr-2" />
            Add Existing Firebase Auth User
          </h3>
          <p className="text-sm text-purple-600 mt-1">
            Use this to link Firebase Auth users to the system as Driver or Admin/Owner
          </p>
        </div>
        <button
          onClick={() => setShowForm(false)}
          className="text-purple-600 hover:text-purple-800"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Driver Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="e.g., Salah"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="e.g., salah@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone (Optional)
          </label>
          <input
            type="text"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="e.g., +1234567890"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="driver">Driver - Access to Driver Dashboard</option>
            <option value="owner">Admin/Owner - Access to Owner Dashboard</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Choose the appropriate role for this user
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Firebase Auth UID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.firebaseAuthId}
            onChange={(e) => setFormData({ ...formData, firebaseAuthId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm"
            placeholder="Copy from Firebase Console (e.g., TDy4QnwE0agU5K4lScmQLV2...)"
          />
          <p className="text-xs text-gray-500 mt-1">
            📋 Copy the full UID from Firebase Console → Authentication → Users → ID utilisateur
          </p>
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-sm ${
            message.includes('❌') 
              ? 'bg-red-100 text-red-800' 
              : message.includes('✅')
              ? 'bg-green-100 text-green-800'
              : message.includes('⚠️')
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-blue-100 text-blue-800'
          }`}>
            {message}
          </div>
        )}

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={saving}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              saving
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {saving ? 'Saving...' : 'Add User'}
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
        <strong>How to get Firebase Auth UID:</strong>
        <ol className="list-decimal ml-4 mt-2 space-y-1">
          <li>Go to Firebase Console → Authentication → Users</li>
          <li>Find the user by email</li>
          <li>Click on the row to see details or copy the "ID utilisateur" column value</li>
          <li>Paste the UID in the field above</li>
        </ol>
      </div>
    </div>
  )
}

export default AddExistingDriverForm

