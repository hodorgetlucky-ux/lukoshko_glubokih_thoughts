import { useState } from 'react'
import AgeGate from './components/AgeGate'
import IdiomFinder from './components/IdiomFinder'

export default function App() {
  const [ageVerified, setAgeVerified] = useState(() => {
    return localStorage.getItem('age_verified') === 'true'
  })

  const handleAgeVerified = () => {
    localStorage.setItem('age_verified', 'true')
    setAgeVerified(true)
  }

  return (
    <>
      {!ageVerified ? (
        <AgeGate onVerified={handleAgeVerified} />
      ) : (
        <IdiomFinder />
      )}
    </>
  )
}
