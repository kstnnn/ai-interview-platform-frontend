import { UserManager, WebStorageStateStore, type User, type UserManagerSettings } from 'oidc-client-ts'

const zitadelScopes = [
  'openid',
  'profile',
  'email',
  'offline_access',
  'urn:zitadel:iam:user:metadata',
  'urn:zitadel:iam:user:resourceowner',
  'urn:zitadel:iam:org:projects:roles',
].join(' ')

const domain = import.meta.env.VITE_ZITADEL_DOMAIN ?? import.meta.env.VITE_ZITADEL_AUTHORITY
const clientId = import.meta.env.VITE_ZITADEL_CLIENT_ID
const redirectUri = import.meta.env.VITE_ZITADEL_CALLBACK_URL ?? import.meta.env.VITE_ZITADEL_REDIRECT_URI ?? `${window.location.origin}/auth/callback`
const postLogoutRedirectUri =
  import.meta.env.VITE_ZITADEL_POST_LOGOUT_URL ??
  import.meta.env.VITE_ZITADEL_POST_LOGOUT_REDIRECT_URI ??
  `${window.location.origin}/auth/logout/callback`
const postLoginUrl = import.meta.env.VITE_ZITADEL_POST_LOGIN_URL ?? import.meta.env.VITE_POST_LOGIN_URL ?? '/user'
const signUpHint = import.meta.env.VITE_ZITADEL_SIGN_UP_HINT ?? 'signup'

export const isZitadelConfigured = Boolean(domain && clientId)

const settings: UserManagerSettings = {
  authority: domain || 'https://zitadel.example.com',
  client_id: clientId || 'missing-client-id',
  redirect_uri: redirectUri,
  post_logout_redirect_uri: postLogoutRedirectUri,
  response_type: 'code',
  scope: zitadelScopes,
  loadUserInfo: true,
  automaticSilentRenew: true,
  userStore: new WebStorageStateStore({ store: window.localStorage }),
  stateStore: new WebStorageStateStore({ store: window.sessionStorage }),
}

export const userManager = new UserManager(settings)

export async function signIn(returnTo = postLoginUrl) {
  ensureConfigured()
  await userManager.signinRedirect({ state: { returnTo }, extraQueryParams: { prompt: 'login' } })
}

export async function signUp() {
  ensureConfigured()
  await userManager.signinRedirect({ extraQueryParams: { prompt: 'create', login_hint: signUpHint } })
}

export async function handleAuthCallback() {
  ensureConfigured()
  return userManager.signinRedirectCallback()
}

export function isStateNotFoundError(error: unknown) {
  if (error instanceof Error) {
    return error.message.toLowerCase().includes('no matching state')
  }
  return false
}

export async function signOut() {
  if (!isZitadelConfigured) {
    return
  }

  await userManager.signoutRedirect({ post_logout_redirect_uri: postLogoutRedirectUri })
}

export async function handleLogoutCallback() {
  if (!isZitadelConfigured) {
    return
  }

  await userManager.signoutRedirectCallback()
}

export async function getCurrentUser() {
  if (!isZitadelConfigured) {
    return null
  }

  return userManager.getUser()
}

export async function getAccessToken() {
  const user = await getCurrentUser()
  return user?.access_token ?? null
}

export async function getIdToken() {
  const user = await getCurrentUser()
  return user?.id_token ?? null
}

export function getDisplayName(user: User | null) {
  if (!user) return ''

  const profile = user.profile
  return profile.name || profile.preferred_username || profile.email || profile.sub
}

export function getPostLoginUrl() {
  return postLoginUrl
}

function ensureConfigured() {
  if (!isZitadelConfigured) {
    throw new Error('Authentication is not configured. Add auth provider domain and client ID to your environment.')
  }
}
