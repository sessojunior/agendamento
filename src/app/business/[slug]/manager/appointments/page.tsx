import { notFound } from 'next/navigation'

import { getBusiness } from '@/utils/business'

import Appointments from '../components/Appointments'

interface AppointmentsPageProps {
	params: Promise<{ slug: string }>
}

export default async function AppointmentsPage({ params }: AppointmentsPageProps) {
	const { slug } = await params

	// Verifica se o slug corresponde a uma empresa válida
	const business = await getBusiness(slug)

	if (!business) {
		// Se não existir, redireciona para a página 404
		notFound()
	}

	return (
		<div className='w-full'>
			<Appointments slug={slug} />
		</div>
	)
}
