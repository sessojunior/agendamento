export default function StoreLoginPage() {
	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
			<div className='w-full max-w-md bg-white p-8 rounded-2xl shadow-md border border-gray-200'>
				<h2 className='text-3xl font-bold text-center text-gray-800 mb-6'>Login da Empresa</h2>
				<form className='space-y-5'>
					<div>
						<label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-1'>
							E-mail
						</label>
						<input id='email' type='email' placeholder='exemplo@empresa.com' className='w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent' />
					</div>

					<div>
						<label htmlFor='password' className='block text-sm font-medium text-gray-700 mb-1'>
							Senha
						</label>
						<input id='password' type='password' placeholder='••••••••' className='w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent' />
					</div>

					<button type='submit' className='w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition'>
						Entrar
					</button>
				</form>
			</div>
		</div>
	)
}
