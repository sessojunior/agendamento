export default function AppointmentsTopbar() {
	return (
		<div className='flex justify-between items-start p-4 bg-zinc-50 border-zinc-200 border-b'>
			<div className='flex space-x-2'>
				<button className='bg-gray-300 px-3 py-1 rounded'>← Voltar</button>
				<input type='date' value='' onChange={() => {}} className='border p-1 rounded' />
				<button className='bg-gray-300 px-3 py-1 rounded'>Avançar →</button>
			</div>
			<div>
				<select value='' onChange={() => {}} className='border p-1 rounded'>
					<option value='1'>Salão 1</option>
				</select>
			</div>
		</div>
	)
}
