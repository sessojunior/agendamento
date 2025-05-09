export default function StoreAppointmentsPage() {
	const appointments = [] // Buscar via fetch ou server actions
	return (
		<div className='p-6'>
			<h2 className='text-2xl font-semibold mb-4'>Agendamentos</h2>
			<ul className='space-y-2'>
				{appointments.map((appt: any) => (
					<li key={appt.id} className='border p-2 rounded'>
						{appt.clientName} - {appt.date}
					</li>
				))}
			</ul>
		</div>
	)
}
