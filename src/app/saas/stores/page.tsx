export default function SaaSStoresPage() {
	const stores = [] // Buscar empresas do sistema
	return (
		<div className='p-6'>
			<h2 className='text-2xl font-semibold mb-4'>Empresas Cadastradas</h2>
			<ul className='space-y-2'>
				{stores.map((store: any) => (
					<li key={store.id} className='border p-2 rounded'>
						{store.name} - {store.email}
					</li>
				))}
			</ul>
		</div>
	)
}
