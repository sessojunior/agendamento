import Link from 'next/link'
import { getSaas } from '@/utils/saas'

export default async function HomePage() {
	const { title, description } = await getSaas()

	return (
		<div className='min-h-screen flex flex-col bg-gray-100'>
			<header className='flex justify-between items-center px-6 py-4 bg-white shadow-sm border-b border-gray-200'>
				<h1 className='text-xl font-bold text-gray-800'>{title}</h1>
				<Link href='/business/minha-barbearia/auth/login' className='px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition'>
					Login da empresa
				</Link>
			</header>

			<main className='flex flex-1 flex-col items-center justify-center p-6 text-center'>
				<h2 className='text-4xl font-bold mb-6 text-gray-800'>Bem-vindo a {title}</h2>
				<p className='text-lg text-gray-600 mb-8 max-w-xl'>{description}</p>

				<Link href='/business/minha-barbearia' className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition'>
					Acessar a Barbearia de exemplo
				</Link>
			</main>

			<footer className='bg-white border-t border-gray-200 text-center text-sm text-gray-500 py-4'>
				© {new Date().getFullYear()} {title}. Todos os direitos reservados.
			</footer>
		</div>
	)
}
