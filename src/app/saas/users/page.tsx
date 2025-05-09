export default function SaaSUsersPage() {
	const users = [] // Buscar todos os usuários globais
	return (
		<div className='p-6'>
			<h2 className='text-2xl font-semibold mb-4'>Usuários do Sistema</h2>
			<ul className='space-y-2'>
				{users.map((user: any) => (
					<li key={user.id} className='border p-2 rounded'>
						{user.name} - {user.email}
					</li>
				))}
			</ul>
		</div>
	)
}
