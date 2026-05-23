import type { EmploymentType, VacancyLevel, VacancyStatus, WorkFormat } from '@/types/api'

type Translator = (key: any) => string

export function employmentTypeLabel(value: EmploymentType, t: Translator) {
  return t(`vacancyEnums.employmentType.${value}`)
}

export function workFormatLabel(value: WorkFormat, t: Translator) {
  return t(`vacancyEnums.workFormat.${value}`)
}

export function vacancyLevelLabel(value: VacancyLevel, t: Translator) {
  return t(`vacancyEnums.level.${value}`)
}

export function vacancyStatusLabel(value: VacancyStatus, t: Translator) {
  return t(`vacancyEnums.status.${value}`)
}
