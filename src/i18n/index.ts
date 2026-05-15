import { computed, ref } from 'vue'

export type Locale = 'en' | 'ru'

const STORAGE_KEY = 'techscreen-locale'

const messages = {
  en: {
    'nav.features': 'Features',
    'nav.users': 'For Users',
    'nav.business': 'For Business',
    'nav.vacancies': 'Vacancies',
    'nav.sessions': 'Sessions',
    'nav.join': 'Join Interview',
    'nav.practice': 'Practice',
    'nav.language': 'Language',
    'common.apply': 'Apply',
    'common.back': 'Back',
    'common.open': 'Open',
    'common.minutes': 'min',
    'common.stack': 'Stack',
    'common.level': 'Level',
    'common.duration': 'Duration',
    'common.status': 'Status',
    'common.candidates': 'Candidates',
    'home.title': 'AI interviews for candidates, learners, and hiring teams',
    'home.subtitle': 'Users can practice mock interviews and receive AI feedback, articles, and a roadmap. Businesses can create organizations, publish vacancies, configure stacks and questions, then screen candidates through interview sessions.',
    'home.userCta': 'Practice as User',
    'home.businessCta': 'Open Business Workspace',
    'footer.description': 'AI interview platform for personal mock interviews, learning feedback, business vacancies, and candidate screening flows.',
    'footer.product': 'Product',
    'footer.status': 'Status',
    'footer.statusText': 'These screens use frontend mock data only. They are shaped to make backend endpoints easier to attach later.',
    'publicVacancies.title': 'Open vacancies',
    'publicVacancies.subtitle': 'Choose a role, apply as a candidate, and pass the AI interview prepared for that vacancy stack and level.',
    'publicVacancies.search': 'Search by title, company, stack, or skill',
    'publicVacancies.allLevels': 'All levels',
    'publicVacancies.active': 'Actively hiring',
    'publicVacancies.noResults': 'No vacancies match the current filters.',
    'vacancyDetail.process': 'Interview process',
    'vacancyDetail.requirements': 'Requirements',
    'vacancyDetail.questions': 'Question strategy',
    'vacancyDetail.applyTitle': 'Apply for this vacancy',
    'vacancyDetail.applyText': 'Submit candidate details now. Backend integration can later create an application and interview session.',
    'vacancyDetail.startApply': 'Start application',
    'vacancyApply.title': 'Candidate application',
    'vacancyApply.subtitle': 'This form is frontend-only for now. Later it should create an application, generate an interview invite, and email the candidate.',
    'vacancyApply.name': 'Full name',
    'vacancyApply.email': 'Email address',
    'vacancyApply.profile': 'CV or profile link',
    'vacancyApply.note': 'Short note',
    'vacancyApply.submit': 'Submit application demo',
    'vacancyApply.afterSubmit': 'Continue to interview demo',
  },
  ru: {
    'nav.features': 'Возможности',
    'nav.users': 'Для пользователей',
    'nav.business': 'Для бизнеса',
    'nav.vacancies': 'Вакансии',
    'nav.sessions': 'Сессии',
    'nav.join': 'Войти на интервью',
    'nav.practice': 'Практика',
    'nav.language': 'Язык',
    'common.apply': 'Откликнуться',
    'common.back': 'Назад',
    'common.open': 'Открыть',
    'common.minutes': 'мин',
    'common.stack': 'Стек',
    'common.level': 'Уровень',
    'common.duration': 'Длительность',
    'common.status': 'Статус',
    'common.candidates': 'Кандидаты',
    'home.title': 'AI-интервью для кандидатов, пользователей и команд найма',
    'home.subtitle': 'Пользователи проходят mock-интервью и получают AI-фидбек, статьи и roadmap. Бизнес создает организации, публикует вакансии, настраивает стек и вопросы, а затем проверяет кандидатов через интервью-сессии.',
    'home.userCta': 'Практиковаться как пользователь',
    'home.businessCta': 'Открыть кабинет бизнеса',
    'footer.description': 'Платформа AI-интервью для личной практики, обучающего фидбека, бизнес-вакансий и отбора кандидатов.',
    'footer.product': 'Продукт',
    'footer.status': 'Статус',
    'footer.statusText': 'Эти экраны используют только mock-данные на фронтенде. Их структура подготовлена для будущего подключения backend endpoints.',
    'publicVacancies.title': 'Открытые вакансии',
    'publicVacancies.subtitle': 'Выберите роль, откликнитесь как кандидат и пройдите AI-интервью, подготовленное под стек и уровень вакансии.',
    'publicVacancies.search': 'Поиск по роли, компании, стеку или навыку',
    'publicVacancies.allLevels': 'Все уровни',
    'publicVacancies.active': 'Активный найм',
    'publicVacancies.noResults': 'Нет вакансий для текущих фильтров.',
    'vacancyDetail.process': 'Процесс интервью',
    'vacancyDetail.requirements': 'Требования',
    'vacancyDetail.questions': 'Стратегия вопросов',
    'vacancyDetail.applyTitle': 'Откликнуться на вакансию',
    'vacancyDetail.applyText': 'Сейчас это форма для кандидата без backend. Позже она сможет создать отклик и интервью-сессию.',
    'vacancyDetail.startApply': 'Начать отклик',
    'vacancyApply.title': 'Отклик кандидата',
    'vacancyApply.subtitle': 'Пока это frontend-only форма. Позже она должна создавать application, генерировать invite на интервью и отправлять письмо кандидату.',
    'vacancyApply.name': 'Полное имя',
    'vacancyApply.email': 'Email',
    'vacancyApply.profile': 'CV или ссылка на профиль',
    'vacancyApply.note': 'Короткий комментарий',
    'vacancyApply.submit': 'Отправить демо-отклик',
    'vacancyApply.afterSubmit': 'Перейти к демо интервью',
  },
} as const

type MessageKey = keyof typeof messages.en

function detectInitialLocale(): Locale {
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'en' || stored === 'ru') return stored

  return window.navigator.language.toLowerCase().startsWith('ru') ? 'ru' : 'en'
}

const locale = ref<Locale>(detectInitialLocale())

export function useI18n() {
  const currentLocale = computed(() => locale.value)

  function setLocale(nextLocale: Locale) {
    locale.value = nextLocale
    window.localStorage.setItem(STORAGE_KEY, nextLocale)
  }

  function t(key: MessageKey) {
    return messages[locale.value][key]
  }

  return {
    locale: currentLocale,
    setLocale,
    t,
  }
}
