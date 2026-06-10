import { useState, useRef, useEffect } from 'react'
import styles from './IdiomFinder.module.css'

interface IdiomResult {
  best: {
    idiom: string
    explanation: string
    usage_tip: string
  }
  alternatives: Array<{
    idiom: string
    explanation: string
  }>
}

export default function IdiomFinder() {
  const [situation, setSituation] = useState('')
  const [result, setResult] = useState<IdiomResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [listening, setListening] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  const hasVoice = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [result])

  const toggleVoice = () => {
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }

    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognitionCtor) return

    const rec = new SpeechRecognitionCtor()
    rec.lang = 'ru-RU'
    rec.continuous = false
    rec.interimResults = false

    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      setSituation(prev => prev ? prev + ' ' + transcript : transcript)
      setListening(false)
    }

    rec.onerror = () => setListening(false)
    rec.onend = () => setListening(false)

    recognitionRef.current = rec
    rec.start()
    setListening(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!situation.trim()) {
      setError('Расскажи что случилось — иначе как я помогу?')
      return
    }
    setError('')
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situation: situation.trim() }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Ошибка ${res.status}`)
      }

      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Что-то пошло не так. Попробуй ещё раз.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  const reset = () => {
    setResult(null)
    setSituation('')
    setError('')
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.headerIcon}>🪣</span>
        <div>
          <h1 className={styles.headerTitle}>
            <span className="wordart">Лукошко</span>{' '}
            <span className="wordart wordart-blue">Глубоких</span>{' '}
            <span className="wordart wordart-rainbow">Мыслей</span>
          </h1>
          <p className={styles.headerSub}>🌟 Народная мудрость для любой ситуации 🌟</p>
        </div>
      </header>

      <main className={styles.main}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputWrapper}>
            <textarea
              className={styles.textarea}
              value={situation}
              onChange={e => setSituation(e.target.value)}
              placeholder="Опиши свою ситуацию — что происходит, в чём проблема, что тебя бесит или радует..."
              rows={5}
              disabled={loading}
            />
          </div>
          {hasVoice && (
            <button
              type="button"
              onClick={toggleVoice}
              className={`${styles.voiceBtn} ${listening ? styles.voiceBtnActive : ''}`}
              title={listening ? 'Остановить запись' : 'Говорить голосом'}
            >
              {listening ? '⏹ ОСТАНОВИТЬ ЗАПИСЬ ⏹' : '🎙️ ГОВОРИТЬ ГОЛОСОМ 🎙️'}
            </button>
          )}
          {listening && (
            <p className={styles.listeningHint}>🔴 СЛУШАЮ... ГОВОРИ ПО-РУССКИ 🔴</p>
          )}
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading || !situation.trim()}
            >
              {loading ? (
                <span className={styles.loadingInner}>
                  <span className={styles.spinner} /> Думаю...
                </span>
              ) : (
                'Подобрать выражение'
              )}
            </button>
            {result && (
              <button type="button" onClick={reset} className={styles.resetBtn}>
                Новый вопрос
              </button>
            )}
          </div>
        </form>

        {result && (
          <div ref={resultRef} className={styles.results}>
            <div className={styles.bestCard}>
              <div className={styles.bestLabel}>✨ Лучшее попадание</div>
              <p className={styles.idiomText}>{result.best.idiom}</p>
              <p className={styles.explanation}>{result.best.explanation}</p>
              <p className={styles.usageTip}>💡 {result.best.usage_tip}</p>
              <button
                className={styles.copyBtn}
                onClick={() => copyToClipboard(result.best.idiom, 'best')}
              >
                {copied === 'best' ? '✓ Скопировано' : 'Скопировать'}
              </button>
            </div>

            <div className={styles.altSection}>
              <h3 className={styles.altTitle}>Альтернативы</h3>
              <div className={styles.altGrid}>
                {result.alternatives.map((alt, i) => (
                  <div key={i} className={styles.altCard}>
                    <p className={styles.altIdiom}>{alt.idiom}</p>
                    <p className={styles.altExplanation}>{alt.explanation}</p>
                    <button
                      className={styles.copyBtnSmall}
                      onClick={() => copyToClipboard(alt.idiom, `alt-${i}`)}
                    >
                      {copied === `alt-${i}` ? '✓' : '📋'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <p>
          Некоммерческое приложение только для развлекательных целей. Все выражения являются
          элементами народного фольклора и используются исключительно в юмористическом контексте.
          Только для лиц старше 18 лет.
        </p>
      </footer>
    </div>
  )
}
