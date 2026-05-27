import gregorian_en from 'react-date-object/locales/gregorian_en'

const gregorian_ko = {
  name: 'gregorian_ko',
  months: [
    ['1월', '1월'],
    ['2월', '2월'],
    ['3월', '3월'],
    ['4월', '4월'],
    ['5월', '5월'],
    ['6월', '6월'],
    ['7월', '7월'],
    ['8월', '8월'],
    ['9월', '9월'],
    ['10월', '10월'],
    ['11월', '11월'],
    ['12월', '12월'],
  ],
  weekDays: [
    ['토요일', '토'],
    ['일요일', '일'],
    ['월요일', '월'],
    ['화요일', '화'],
    ['수요일', '수'],
    ['목요일', '목'],
    ['금요일', '금'],
  ],
  digits: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  meridiems: [
    ['오전', '오전'],
    ['오후', '오후'],
  ],
}

export function getDatePickerLocale(language?: string | null) {
  const lang = (language ?? 'en').toLowerCase()
  if (lang.startsWith('ko')) {
    return gregorian_ko
  }
  return gregorian_en
}
