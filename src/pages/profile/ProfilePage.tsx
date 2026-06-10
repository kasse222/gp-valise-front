import { useState, useRef } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Upload, CheckCircle, Clock, XCircle, AlertCircle, FileText, User } from 'lucide-react'

import { Button, Card, Input } from '@/components/ui'
import { updateUser } from '@/api/users'
import { getKyc, submitKyc, uploadFile } from '@/api/kyc'
import type { KycRequest } from '@/api/kyc'
import { useAuthStore } from '@/store/authStore'
import { COUNTRIES } from '@/lib/countries'
import { useLocation } from 'react-router-dom'

// ─── KYC Status Banner ─────────────────────────────────────────────────────

function KycStatusBanner({ kyc }: { kyc: KycRequest }) {
  const config = {
    pending:  { icon: Clock,         color: 'amber',   title: 'En cours de vérification',    text: 'Votre dossier KYC est en cours d\'examen par notre équipe.' },
    approved: { icon: CheckCircle,   color: 'emerald', title: 'Identité vérifiée ✅',          text: 'Votre compte est pleinement vérifié. Vous pouvez accéder à toutes les fonctionnalités.' },
    rejected: { icon: XCircle,       color: 'red',     title: 'Dossier rejeté',               text: kyc.rejection_reason ?? 'Votre dossier a été rejeté. Veuillez soumettre un nouveau dossier.' },
  }[kyc.status.code] ?? { icon: AlertCircle, color: 'gray', title: kyc.status.label, text: '' }

  const Icon = config.icon
  const colors: Record<string, string> = {
    amber:   'bg-amber-50 border-amber-200 text-amber-800',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    red:     'bg-red-50 border-red-200 text-red-800',
    gray:    'bg-gray-50 border-gray-200 text-gray-700',
  }

  return (
    <div className={`p-4 rounded-[14px] border flex items-start gap-3 ${colors[config.color]}`}>
      <Icon className="w-5 h-5 shrink-0 mt-0.5" aria-hidden />
      <div>
        <p className="text-sm font-semibold">{config.title}</p>
        {config.text && <p className="text-xs mt-0.5 opacity-80">{config.text}</p>}
        {kyc.admin_notes && (
          <p className="text-xs mt-1 font-medium">Note admin : {kyc.admin_notes}</p>
        )}
      </div>
    </div>
  )
}

// ─── File Upload Field ──────────────────────────────────────────────────────

function FileUploadField({
  label,
  hint,
  onUploaded,
  disabled,
}: {
  label:      string
  hint:       string
  onUploaded: (path: string) => void
  disabled?:  boolean
}) {
  const inputRef               = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [done,      setDone]      = useState(false)
  const [fileName,  setFileName]  = useState<string | null>(null)

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const path = await uploadFile(file, 'kyc')
      setDone(true)
      setFileName(file.name)
      onUploaded(path)
      toast.success(`${label} uploadé.`)
    } catch (err: any) {
      const msg = err?.response?.data?.message
        ?? err?.response?.data?.errors?.file?.[0]
        ?? `Erreur lors de l'upload de ${label}.`
      toast.error(msg)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <p className="text-xs text-gray-400">{hint}</p>
      <div
        className={`relative flex items-center justify-center gap-2 min-h-[80px] rounded-[10px] border-2 border-dashed transition-colors cursor-pointer
          ${done ? 'border-emerald-400 bg-emerald-50' : 'border-gray-300 bg-gray-50 hover:border-[#1B3A6B] hover:bg-[#EBF4FF]'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && !disabled && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          className="hidden"
          onChange={handleChange}
          disabled={disabled || uploading}
        />
        {uploading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-4 h-4 border-2 border-[#1B3A6B] border-t-transparent rounded-full animate-spin" />
            Upload en cours…
          </div>
        ) : done ? (
          <div className="flex items-center gap-2 text-sm text-emerald-700">
            <CheckCircle className="w-4 h-4" aria-hidden />
            <span className="font-medium truncate max-w-[200px]">{fileName}</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 text-sm text-gray-500">
            <Upload className="w-5 h-5 text-gray-400" aria-hidden />
            <span>Cliquer pour uploader</span>
            <span className="text-xs text-gray-400">JPG, PNG ou PDF — max 5 Mo</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── KYC Form ──────────────────────────────────────────────────────────────

function KycForm({ onSubmitted }: { onSubmitted: () => void }) {
  const [idFrontPath, setIdFrontPath] = useState<string | null>(null)
  const [idBackPath,  setIdBackPath]  = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () => submitKyc({
      id_front_path: idFrontPath!,
      id_back_path:  idBackPath ?? undefined,
    }),
    onSuccess: () => {
      toast.success('Dossier KYC soumis avec succès !')
      onSubmitted()
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Une erreur est survenue.')
    },
  })

  const canSubmit = !!idFrontPath && !mutation.isPending

  return (
    <div className="flex flex-col gap-4">
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-[10px] text-xs text-blue-800 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
        <div>
          <p className="font-semibold">Pourquoi cette vérification ?</p>
          <p className="mt-0.5">La vérification d'identité est obligatoire pour accéder aux fonctionnalités financières. Vos documents sont stockés de façon sécurisée et ne sont accessibles qu'à notre équipe.</p>
        </div>
      </div>

      <FileUploadField
        label="Pièce d'identité — Recto *"
        hint="Carte nationale, passeport ou titre de séjour (face avant). JPG, PNG ou PDF — max 5 Mo."
        onUploaded={setIdFrontPath}
      />

      <FileUploadField
        label="Pièce d'identité — Verso (optionnel)"
        hint="Face arrière de votre pièce d'identité si applicable."
        onUploaded={setIdBackPath}
      />

      <Button
        variant="primary"
        loading={mutation.isPending}
        disabled={!canSubmit}
        onClick={() => mutation.mutate()}
        className="w-full"
      >
        Soumettre mon dossier KYC
      </Button>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const user        = useAuthStore((s) => s.user)

  const location = useLocation()
  const kycRequired = location.state?.kycRequired === true
  const [firstName, setFirstName] = useState(user?.first_name ?? '')
  const [lastName,  setLastName]  = useState(user?.last_name  ?? '')
  const [phone,     setPhone]     = useState(user?.phone      ?? '')
  const [country,   setCountry]   = useState(user?.country    ?? '')

  const { data: kyc, refetch: refetchKyc } = useQuery({
    queryKey: ['kyc'],
    queryFn:  getKyc,
    staleTime: 0,
  })

  const profileMutation = useMutation({
    mutationFn: () => updateUser(user!.id, {
      first_name: firstName,
      last_name:  lastName,
      phone:      phone    || undefined,
      country:    country  || undefined,
    }),
    onSuccess: (data) => {
      useAuthStore.getState().setUser({ ...user!, ...data })
      toast.success('Profil mis à jour !')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Une erreur est survenue.')
    },
  })

  if (!user) return null

  const kycApproved = kyc?.status.code === 'approved'
  const kycPending  = kyc?.status.code === 'pending'
  const showKycForm = !kyc || kyc.status.code === 'rejected'

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto flex flex-col gap-6">

      {/* ── Profil ─────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-[#1B3A6B]" aria-hidden />
          <h1 className="text-xl font-bold text-gray-900">Mon profil</h1>
        </div>

        <Card>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Prénom"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <Input
                label="Nom"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <Input
              label="Téléphone"
              type="tel"
              value={phone}
              placeholder="+221 77 000 00 00"
              helper="Format international requis : +indicatif numéro"
              onChange={(e) => setPhone(e.target.value)}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Pays</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full min-h-[48px] px-4 py-3 rounded-[10px] border border-gray-300 text-sm text-gray-900 bg-white focus:outline-none focus:border-[#1B3A6B] focus:shadow-[0_0_0_3px_rgba(27,58,107,0.2)] transition-all"
              >
                <option value="">Sélectionner un pays</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Button
                variant="primary"
                loading={profileMutation.isPending}
                onClick={() => profileMutation.mutate()}
              >
                Enregistrer
              </Button>
              <div className="flex flex-col text-xs text-gray-400">
                <span>Email : <span className="font-medium text-gray-600">{user.email}</span></span>
                <span>Rôle : <span className="font-medium text-gray-600">{user.role === 2 ? 'Voyageur' : user.role === 3 ? 'Expéditeur' : 'Admin'}</span></span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ── KYC ────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-[#1B3A6B]" aria-hidden />
          <h2 className="text-xl font-bold text-gray-900">Vérification d'identité (KYC)</h2>
        </div>

        <Card>
          {kyc && <div className="mb-4"><KycStatusBanner kyc={kyc} /></div>}

          {kycApproved && (
            <div className="flex items-center gap-3 text-sm text-emerald-700">
              <CheckCircle className="w-5 h-5" aria-hidden />
              <span>Votre identité est vérifiée. Aucune action requise.</span>
            </div>
          )}

          {kycPending && (
            <p className="text-sm text-gray-500">
              Votre dossier est en cours d'examen. Vous serez notifié par email dès qu'il sera traité.
            </p>
          )}
          {kycRequired && !kycApproved && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-[14px] flex items-start gap-3 text-sm text-amber-800">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
              <span>Vérification d'identité requise avant de publier un trajet. Soumettez votre dossier ci-dessous.</span>
            </div>
          )}
          {showKycForm && (
            <KycForm onSubmitted={() => refetchKyc()} />
          )}
        </Card>
      </div>
    </div>
  )
}