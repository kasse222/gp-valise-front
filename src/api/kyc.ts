import client from './client'

export interface KycRequest {
  id:                number
  status: {
    code:  string
    label: string
    color: string
  }
  id_photo_path:     string | null
  parcel_photo_path: string | null
  admin_notes:       string | null
  rejection_reason:  string | null
  submitted_at:      string | null
  reviewed_at:       string | null
}

export async function getKyc(): Promise<KycRequest | null> {
  const { data } = await client.get<{ data: KycRequest | null }>('/kyc')
  return data.data
}

export async function submitKyc(payload: {
  id_photo_path:     string
  parcel_photo_path: string
}): Promise<KycRequest> {
  const { data } = await client.post<{ data: KycRequest }>('/kyc', payload)
  return data.data
}

export async function uploadFile(file: File, context: 'kyc'): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('context', context)

  const { data } = await client.post<{ path: string }>('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.path
}