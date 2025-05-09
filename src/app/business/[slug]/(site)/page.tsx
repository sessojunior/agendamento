import Link from 'next/link'
import { getBusiness } from '@/utils/business'
import { notFound } from 'next/navigation'
import { BusinessSteps } from './components/BusinessSteps'

export type Step = 'servico' | 'data' | 'profissional' | 'finalizar'

interface BusinessPageProps {
	params: Promise<{ slug: string }>
}

export default async function BusinessHomePage({ params }: BusinessPageProps) {
	const { slug } = await params

	const business = await getBusiness(slug)
	if (!business) return notFound()

	const steps: { key: Step; label: string; title: string }[] = [
		{ key: 'servico', label: 'Serviço', title: 'Escolha o tipo de atendimento' },
		{ key: 'data', label: 'Data e horário', title: 'Escolha a data e o horário' },
		{ key: 'profissional', label: 'Profissional', title: 'Escolha quem vai atender' },
		{ key: 'finalizar', label: 'Finalizar', title: 'Revisar e confirmar' },
	]

	return (
		<div className='min-h-screen flex flex-col bg-gray-50'>
			<header className='w-full px-6 py-4 bg-white shadow-sm border-b border-gray-200 flex justify-between items-center'>
				<h1 className='text-2xl font-bold text-gray-800'>{business.name}</h1>
				<Link href='/customer/auth/login' className='px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition'>
					Login do cliente
				</Link>
			</header>

			<main className='flex-1 px-4 py-6'>
				<div className='max-w-6xl mx-auto mb-6'>
					<h3 className='text-xl font-semibold text-center text-gray-800 mb-2'>{business.name}</h3>
					<p className='text-gray-600 text-center'>{business.description}</p>
				</div>

				<BusinessSteps steps={steps} slug={business.slug} />
			</main>

			<footer className='w-full py-4 text-center text-sm text-gray-500 border-t border-gray-200 mt-6'>{business.name}. Todos os direitos reservados.</footer>
		</div>
	)
}
