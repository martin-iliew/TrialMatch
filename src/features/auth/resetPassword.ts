type RecoveryParams = {
  accessToken: string | null
  code: string | null
  refreshToken: string | null
  tokenHash?: string | null
  type: string | null
}

function getHashSearchParams(hash: string) {
  if (!hash) {
    return new URLSearchParams()
  }

  const normalizedHash = hash.startsWith("#") ? hash.slice(1) : hash
  return new URLSearchParams(normalizedHash)
}

export function buildResetPasswordRedirectUrl(origin: string) {
  return new URL("/reset-password", origin).toString()
}

export function isPkceRecoveryLink(url: URL) {
  const hashParams = getHashSearchParams(url.hash)
  const type = url.searchParams.get("type") ?? hashParams.get("type")
  const code = url.searchParams.get("code")
  const accessToken =
    url.searchParams.get("access_token") ?? hashParams.get("access_token")
  const refreshToken =
    url.searchParams.get("refresh_token") ?? hashParams.get("refresh_token")
  const tokenHash = url.searchParams.get("token_hash")

  return (
    type === "recovery" &&
    Boolean(code) &&
    !tokenHash &&
    !(accessToken && refreshToken)
  )
}

export function getRecoveryParamsFromUrl(url: URL): RecoveryParams | null {
  const hashParams = getHashSearchParams(url.hash)
  const type = url.searchParams.get("type") ?? hashParams.get("type")
  const code = url.searchParams.get("code")
  const accessToken =
    url.searchParams.get("access_token") ?? hashParams.get("access_token")
  const refreshToken =
    url.searchParams.get("refresh_token") ?? hashParams.get("refresh_token")
  const tokenHash = url.searchParams.get("token_hash")

  if (isPkceRecoveryLink(url)) {
    return null
  }

  const hasRecoveryCredentials =
    Boolean(code) ||
    Boolean(tokenHash) ||
    (Boolean(accessToken) && Boolean(refreshToken))

  if (!hasRecoveryCredentials && type !== "recovery") {
    return null
  }

  return {
    accessToken,
    code,
    refreshToken,
    type,
    ...(tokenHash ? { tokenHash } : {}),
  }
}
