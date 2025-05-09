export default function UserAppointmentsPage() {
	const myAppointments = [] // Buscar dados reais do cliente
	return (
		<div className='p-6'>
			<h2 className='text-2xl font-semibold mb-4'>Meus Agendamentos</h2>
			<ul className='space-y-2'>
				{myAppointments.map((appt: any) => (
					<li key={appt.id} className='border p-2 rounded'>
						{appt.storeName} - {appt.date}
					</li>
				))}
			</ul>
		</div>
	)
}
