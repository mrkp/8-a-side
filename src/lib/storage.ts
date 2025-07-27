import { createClient } from "@/utils/supabase/client"

export async function uploadTeamLogo(file: File, teamId: string): Promise<string | null> {
  const supabase = createClient()
  
  const fileExt = file.name.split('.').pop()
  const fileName = `${teamId}.${fileExt}`
  const filePath = `logos/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('logos')
    .upload(filePath, file, {
      upsert: true,
      cacheControl: '3600'
    })

  if (uploadError) {
    console.error('Error uploading logo:', uploadError)
    return null
  }

  const { data: { publicUrl } } = supabase.storage
    .from('logos')
    .getPublicUrl(filePath)

  return publicUrl
}

export async function uploadPlayerImage(file: File, playerId: string): Promise<string | null> {
  const supabase = createClient()
  
  const fileExt = file.name.split('.').pop()
  const fileName = `${playerId}.${fileExt}`
  const filePath = `players/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('players')
    .upload(filePath, file, {
      upsert: true,
      cacheControl: '3600'
    })

  if (uploadError) {
    console.error('Error uploading player image:', uploadError)
    return null
  }

  const { data: { publicUrl } } = supabase.storage
    .from('players')
    .getPublicUrl(filePath)

  return publicUrl
}

export function getTeamLogoUrl(teamId: string, extension: string = 'png'): string {
  const supabase = createClient()
  const { data: { publicUrl } } = supabase.storage
    .from('logos')
    .getPublicUrl(`logos/${teamId}.${extension}`)
  
  return publicUrl
}

export function getPlayerImageUrl(playerId: string, extension: string = 'jpg'): string {
  const supabase = createClient()
  const { data: { publicUrl } } = supabase.storage
    .from('players')
    .getPublicUrl(`players/${playerId}.${extension}`)
  
  return publicUrl
}