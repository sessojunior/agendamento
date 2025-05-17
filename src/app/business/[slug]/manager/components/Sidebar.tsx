export default function Sidebar() {
	return (
		<div className='w-1/6 bg-gray-200 p-4 h-[calc(100vh-57px)]'>
			<h2 className='text-lg font-semibold mb-4'>Sidebar</h2>
			<ul>
				<li>Agendamentos</li>
				<li>Item 2</li>
				<li>Item 3</li>
			</ul>
			<p className='mt-4'>
				<span className='font-bold'>Melhoria futura:</span> colocar um 'extraWorkTime' que seria um tempo extra de trabalho em determinados dias. Deveria ser adaptado isso no JSON. Serve para suprir a necessidade de quando o profissional puder trabalhar em horário diferente do que ele costuma trabalhar e está funcionando.
			</p>
		</div>
	)
}
