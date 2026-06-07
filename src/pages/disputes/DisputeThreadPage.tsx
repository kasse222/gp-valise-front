/**
 * DisputeThreadPage — thread de messages d'un litige
 * Accessible depuis sender/bookings/:id et traveler/bookings/:id
 */

import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Send, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { AxiosError } from 'axios'

import { Button, Card, Spinner } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import { getDispute, getDisputeMessages, sendDisputeMessage } from '@/api/disputes'
import type { Dispute, DisputeMessage } from '@/api/disputes'
import { formatDate } from '@/lib/utils'

// ─── Status Badge ──────────────────────────────────────────────────────────

function DisputeStatusBadge({ status }: { status: Dispute['status'] }) {
  const colors: Record<string, string> = {
    open:         'bg-amber-100 text-amber-800',
    under_review: 'bg-blue-100 text-blue-800',
    resolved:     'bg-emerald-100 text-emerald-800',
    closed:       'bg-gray-100 text-gray-600',
  }
  const icons: Record<string, React.ReactNode> = {
    open:         <AlertTriangle className="w-3 h-3" aria-hidden />,
    under_review: <Clock className="w-3 h-3" aria-hidden />,
    resolved:     <CheckCircle className="w-3 h-3" aria-hidden />,
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${colors[status.code] ?? 'bg-gray-100 text-gray-600'}`}>
      {icons[status.code]}
      {status.label}
    </span>
  )
}

// ─── Message Bubble ────────────────────────────────────────────────────────

function MessageBubble({ message, currentUserId }: { message: DisputeMessage; currentUserId: number }) {
  const isMe    = message.author?.id === currentUserId
  const isAdmin = message.author?.role === '1' || message.author?.role === 'admin'
  const name    = message.author?.name ?? 'Inconnu'

  return (
    <div className={`flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">{name}</span>
        {isAdmin && (
          <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-medium">
            Admin
          </span>
        )}
      </div>
      <div className={`max-w-[80%] px-4 py-3 rounded-[14px] text-sm leading-relaxed ${
        isMe
          ? 'bg-[#1B3A6B] text-white rounded-tr-sm'
          : 'bg-gray-100 text-gray-900 rounded-tl-sm'
      }`}>
        {message.body}
      </div>
      <span className="text-xs text-gray-400">{formatDate(message.created_at)}</span>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function DisputeThreadPage() {
  const { disputeId } = useParams<{ disputeId: string }>()
  const id            = Number(disputeId)
  const queryClient   = useQueryClient()
  const user          = useAuthStore((s) => s.user)
  const currentUserId = user?.id ?? 0
  const role          = user?.role === 2 ? 'traveler' : 'sender'

  const [body, setBody] = useState('')
  const bottomRef       = useRef<HTMLDivElement>(null)

  const { data: dispute, isLoading: loadingDispute } = useQuery({
    queryKey:  ['dispute', id],
    queryFn:   () => getDispute(id),
    staleTime: 0,
  })

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey:  ['dispute-messages', id],
    queryFn:   () => getDisputeMessages(id),
    staleTime: 0,
    refetchInterval: 10_000, // polling 10s
  })

  // Scroll en bas à chaque nouveau message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMutation = useMutation({
    mutationFn: () => sendDisputeMessage(id, body.trim()),
    onSuccess: () => {
      setBody('')
      queryClient.invalidateQueries({ queryKey: ['dispute-messages', id] })
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      toast.error(err.response?.data?.message ?? 'Erreur lors de l\'envoi.')
    },
  })

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim()) return
    sendMutation.mutate()
  }

  const isResolved = dispute?.status.code === 'resolved' || dispute?.status.code === 'closed'

  if (loadingDispute) return <div className="p-8 flex justify-center"><Spinner /></div>
  if (!dispute) return (
    <div className="p-8 text-center">
      <p className="text-red-500">Litige introuvable.</p>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto flex flex-col h-full">

      {/* Back */}
      <Link
        to={`/${role}/bookings/${dispute.booking_id}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1B3A6B] mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden />
        Retour à la réservation
      </Link>

      {/* Header */}
      <Card className="mb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-base font-bold text-gray-900">Litige #{dispute.id}</h1>
            <p className="text-xs text-gray-500 mt-0.5">{formatDate(dispute.created_at)}</p>
          </div>
          <DisputeStatusBadge status={dispute.status} />
        </div>

        <div className="mt-3 p-3 bg-amber-50 rounded-[10px] text-sm text-amber-800 border border-amber-200">
          <p className="font-medium mb-0.5">Motif</p>
          <p className="text-xs">{dispute.reason}</p>
        </div>

        {dispute.resolution && (
          <div className="mt-3 p-3 bg-emerald-50 rounded-[10px] text-sm text-emerald-800 border border-emerald-200">
            <p className="font-medium mb-0.5">Résolution</p>
            <p className="text-xs">{dispute.resolution}</p>
            {dispute.decision && (
              <p className="text-xs mt-1 font-semibold uppercase">
                Décision : {dispute.decision === 'refund' ? '💸 Remboursement' : '✅ Paiement voyageur'}
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Thread messages */}
      <Card className="flex-1 flex flex-col min-h-0 mb-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Messages ({messages.length})
        </h2>

        <div className="flex-1 overflow-y-auto flex flex-col gap-4 min-h-[200px] max-h-[400px] pr-1">
          {loadingMessages ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertTriangle className="w-8 h-8 text-gray-300 mb-2" aria-hidden />
              <p className="text-sm text-gray-400">Aucun message pour l'instant.</p>
              <p className="text-xs text-gray-400 mt-1">Décrivez votre problème ci-dessous.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} currentUserId={currentUserId} />
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </Card>

      {/* Input message */}
      {!isResolved ? (
        <form onSubmit={handleSend} className="flex gap-3 items-end">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e) }
            }}
            placeholder="Écrivez votre message… (Entrée pour envoyer, Maj+Entrée pour saut de ligne)"
            rows={2}
            className="flex-1 rounded-[10px] border border-gray-300 px-4 py-3 text-sm resize-none focus:outline-none focus:border-[#1B3A6B] focus:shadow-[0_0_0_3px_rgba(27,58,107,0.2)] transition-all"
          />
          <Button
            type="submit"
            variant="primary"
            loading={sendMutation.isPending}
            disabled={!body.trim()}
            leftIcon={<Send className="w-4 h-4" />}
            className="shrink-0 min-h-[48px]"
          >
            Envoyer
          </Button>
        </form>
      ) : (
        <div className="p-4 bg-gray-50 rounded-[10px] text-center text-sm text-gray-500 border border-gray-200">
          <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto mb-1" aria-hidden />
          Ce litige est résolu — les messages ne peuvent plus être ajoutés.
        </div>
      )}
    </div>
  )
}