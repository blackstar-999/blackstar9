import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Send, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/stores/auth.store'

export default function TelegramVerifyPage() {
  const [otp, setOtp]           = useState(['', '', '', '', '', ''])
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState(false)
  const [countdown, setCountdown] = useState(0)
  const { user, setUser }       = useAuthStore()
  const navigate                = useNavigate()
  const inputRefs               = useRef<(HTMLInputElement | null)[]>([])

  const initMutation = useMutation({
    mutationFn: authApi.initTelegram,
    onSuccess: () => setCountdown(60),
    onError: (err: any) => setError(err.response?.data?.message ?? 'Failed to send code'),
  })

  const verifyMutation = useMutation({
    mutationFn: (code: string) => authApi.verifyTelegram(code),
    onSuccess: (res) => {
      setUser(res.data.user)
      setSuccess(true)
      setTimeout(() => navigate('/portal'), 1500)
    },
    onError: (err: any) => {
      setError(err.response?.data?.message ?? 'Invalid code')
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    },
  })

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    initMutation.mutate()
  }, [])

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(v => v - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const handleInput = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return
    const next = [...otp]
    next[index] = value
    setOtp(next)
    setError('')
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
    if (next.every(d => d !== '')) verifyMutation.mutate(next.join(''))
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text.length === 6) {
      const digits = text.split('')
      setOtp(digits)
      verifyMutation.mutate(text)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-surface-900 to-surface-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center shadow-2xl">
          {success ? (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <CheckCircle2 size={56} className="mx-auto text-green-400 mb-4" />
              <h2 className="text-xl font-bold text-white">Verified!</h2>
              <p className="text-surface-400 mt-1">Redirecting to portal...</p>
            </motion.div>
          ) : (
            <>
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-6">
                <Send size={24} className="text-blue-400" />
              </div>

              <h1 className="text-2xl font-bold text-white mb-2">Telegram Verification</h1>
              <p className="text-surface-400 text-sm mb-8">
                Enter the 6-digit code sent to your Telegram account
                {user?.telegram_username && <><br /><strong className="text-white">@{user.telegram_username}</strong></>}
              </p>

              {/* OTP inputs */}
              <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleInput(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    className="h-14 w-11 text-center text-xl font-bold rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  />
                ))}
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-center justify-center gap-2 text-red-400 text-sm mb-4"
                >
                  <AlertCircle size={14} /> {error}
                </motion.div>
              )}

              {verifyMutation.isPending && (
                <p className="text-surface-400 text-sm mb-4 flex items-center justify-center gap-2">
                  <span className="h-4 w-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </p>
              )}

              <button
                onClick={() => initMutation.mutate()}
                disabled={countdown > 0 || initMutation.isPending}
                className="flex items-center gap-2 mx-auto text-sm text-surface-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw size={14} />
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
