import { createRouter, createWebHistory } from 'vue-router'
import { getCurrentUser, isZitadelConfigured } from '@/auth/zitadel'
import { getDefaultWorkspaceRoute, loadAppSession } from '@/composables/useAppSession'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/sign-in',
      name: 'sign-in',
      component: () => import('@/views/SignInView.vue'),
    },
    {
      path: '/sign-up',
      name: 'sign-up',
      component: () => import('@/views/SignUpView.vue'),
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: () => import('@/views/OnboardingView.vue'),
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: () => import('@/views/AuthCallbackView.vue'),
    },
    {
      path: '/auth/logout',
      name: 'auth-logout',
      component: () => import('@/views/LogoutView.vue'),
    },
    {
      path: '/auth/logout/callback',
      name: 'auth-logout-callback',
      component: () => import('@/views/LogoutCallbackView.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/user',
      name: 'user-workspace',
      component: () => import('@/views/UserWorkspaceView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/user/mock-interview/new',
      name: 'mock-interview-setup',
      component: () => import('@/views/MockInterviewSetupView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/user/roadmap',
      name: 'learning-roadmap',
      component: () => import('@/views/LearningRoadmapView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/business',
      name: 'business-workspace',
      component: () => import('@/views/BusinessWorkspaceView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/business/vacancies',
      name: 'vacancies',
      component: () => import('@/views/VacanciesView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/business/vacancies/new',
      name: 'vacancy-builder',
      component: () => import('@/views/VacancyBuilderView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/business/vacancies/:vacancyId',
      name: 'vacancy-detail',
      component: () => import('@/views/VacancyDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/vacancies',
      name: 'public-vacancies',
      component: () => import('@/views/PublicVacanciesView.vue'),
    },
    {
      path: '/vacancies/:vacancyId',
      name: 'public-vacancy-detail',
      component: () => import('@/views/PublicVacancyDetailView.vue'),
    },
    {
      path: '/vacancies/:vacancyId/apply',
      name: 'public-vacancy-apply',
      component: () => import('@/views/PublicVacancyApplyView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/candidate/join',
      name: 'candidate-join',
      component: () => import('@/views/CandidateJoinView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/candidate/interview/:sessionId',
      name: 'candidate-interview',
      component: () => import('@/views/InterviewView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/interview/:sessionId',
      redirect: (to) => ({ name: 'candidate-interview', params: { sessionId: to.params.sessionId } }),
      meta: { requiresAuth: true },
    },
    {
      path: '/results/:sessionId',
      name: 'results',
      component: () => import('@/views/ResultsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/sessions/:sessionId/report',
      name: 'session-report',
      component: () => import('@/views/SessionReportView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) {
    return true
  }

  if (!isZitadelConfigured) {
    return { name: 'sign-in', query: { redirect: to.fullPath } }
  }

  const zitadelUser = await getCurrentUser()
  if (!zitadelUser || zitadelUser.expired) {
    return { name: 'sign-in', query: { redirect: to.fullPath } }
  }

  const sub = zitadelUser.profile.sub
  if (!sub) {
    return { name: 'sign-in' }
  }

  try {
    const appUser = await loadAppSession(sub)
    if (!appUser) {
      return { name: 'onboarding' }
    }
  } catch {
    return { name: 'onboarding' }
  }

  return true
})

export default router
