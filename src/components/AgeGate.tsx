import { useState } from 'react'
import styles from './AgeGate.module.css'

interface Props {
  onVerified: () => void
}

export default function AgeGate({ onVerified }: Props) {
  const [dob, setDob] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!dob) {
      setError('Введи дату рождения, не стесняйся.')
      return
    }
    const birth = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    if (age < 18) {
      setError('Тебе нет 18. Иди учи уроки.')
    } else if (age > 120) {
      setError('Это невозможно. Введи нормальную дату.')
    } else {
      onVerified()
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.brandLogo}>🎧</span> B2B SaaS Hard Bass™
        </div>
        <div className={styles.icon}>🪣✨🎉</div>
        <h1 className={styles.title}>
          <span className="wordart">Лукошко</span><br />
          <span className="wordart wordart-blue">Глубоких</span><br />
          <span className="wordart wordart-rainbow">Мыслей</span>
        </h1>
        <p className={styles.subtitle}>
          🌟 Народная мудрость для современных ситуаций 🌟
        </p>
        <div className={styles.warning}>
          <span className="blink">⚠️</span> ТОЛЬКО ДЛЯ ВЗРОСЛЫХ!!! 18+ 🔞 <span className="blink">⚠️</span>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            🎂 Введи дату рождения 🎂
            <input
              type="date"
              value={dob}
              onChange={e => { setDob(e.target.value); setError('') }}
              className={styles.input}
              max={new Date().toISOString().split('T')[0]}
            />
          </label>
          {error && <p className={styles.error}>❌ {error}</p>}
          <button type="submit" className={styles.button}>
            👉 ВОЙТИ 👈
          </button>
        </form>
      </div>
    </div>
  )
}
