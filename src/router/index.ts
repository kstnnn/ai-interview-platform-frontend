import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
    },
    {
      path: '/user',
      name: 'user-workspace',
      component: () => import('@/views/UserWorkspaceView.vue'),
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
    },
    {
      path: '/user/mock-interview/new',
      name: 'mock-interview-setup',
      component: () => import('@/views/MockInterviewSetupView.vue'),
    },
    {
      path: '/user/roadmap',
      name: 'learning-roadmap',
      component: () => import('@/views/LearningRoadmapView.vue'),
    },
    {
      path: '/business',
      name: 'business-workspace',
      component: () => import('@/views/BusinessWorkspaceView.vue'),
    },
    {
      path: '/business/vacancies',
      name: 'vacancies',
      component: () => import('@/views/VacanciesView.vue'),
    },
    {
      path: '/business/vacancies/new',
      name: 'vacancy-builder',
      component: () => import('@/views/VacancyBuilderView.vue'),
    },
    {
      path: '/business/vacancies/:vacancyId',
      name: 'vacancy-detail',
      component: () => import('@/views/VacancyDetailView.vue'),
    },
    {
      path: '/candidate/join',
      name: 'candidate-join',
      component: () => import('@/views/CandidateJoinView.vue'),
    },
    {
      path: '/candidate/interview/:sessionId',
      name: 'candidate-interview',
      component: () => import('@/views/InterviewView.vue'),
    },
    {
      path: '/results/:sessionId',
      name: 'results',
      component: () => import('@/views/ResultsView.vue'),
    },
    {
      path: '/sessions/:sessionId/report',
      name: 'session-report',
      component: () => import('@/views/SessionReportView.vue'),
    },
  ],
})

export default router
