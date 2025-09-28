interface Props {
  value: string
  setValue: (newValue: string) => void
}

const GameNickname = ({ value, setValue }: Props) => {
  return (
    <div className="rounded-lg bg-white p-4 shadow-lg flex-shrink-0">
      <label className="block font-semibold mb-2" htmlFor="nickname-input">
        Ваш никнейм:
      </label>
      <input
        id="nickname-input"
        type="text"
        className={`border rounded px-3 py-2 w-full ${
          value.trim() === '' ? 'border-red-500' : 'border-gray-300'
        }`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Введите никнейм"
      />
    </div>
  )
}

export default GameNickname
