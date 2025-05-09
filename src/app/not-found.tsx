import Link from 'next/link'

export default function NotFound() {
	return (
		<div className='min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4'>
			<div className='max-w-md text-center'>
				<h1 className='text-6xl font-bold text-gray-800 mb-4'>404</h1>
				<h2 className='text-2xl font-semibold text-gray-700 mb-2'>Página não encontrada</h2>
				<p className='text-gray-600 mb-6'>Desculpe, não conseguimos encontrar o recurso que você está procurando.</p>
				<Link href='/' className='inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition duration-300'>
					Voltar para a página inicial
				</Link>
			</div>
		</div>
	)
}
