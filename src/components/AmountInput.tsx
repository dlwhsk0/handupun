/**
 * 금액 입력 칸.
 * 화면엔 콤마 포맷("300,000")으로 보여주고, 상태로는 숫자만("300000") 넘긴다.
 * type="number"는 콤마를 못 넣으므로 text + inputMode="numeric"로 처리.
 */
export function AmountInput({
  value,
  onChange,
  placeholder = '0',
  autoFocus,
  className,
}: {
  /** 숫자만 담긴 문자열 (예: "300000") */
  value: string
  /** 입력값에서 숫자만 추출해 전달 */
  onChange: (digits: string) => void
  placeholder?: string
  autoFocus?: boolean
  className?: string
}) {
  const display = value ? Number(value).toLocaleString('ko-KR') : ''
  return (
    <input
      type="text"
      inputMode="numeric"
      value={display}
      onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ''))}
      placeholder={placeholder}
      autoFocus={autoFocus}
      className={className}
    />
  )
}
