import { API_URL } from '@/utils/env'

export type Saas = {
	title: string
	description: string
}

// Obtém os dados do SaaS
export async function getSaas(): Promise<Saas> {
	try {
		const res = await fetch(`${API_URL}/saas`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
			cache: 'no-store', // Evita cache em SSR
		})

		if (!res.ok) throw new Error(`Erro ao buscar dados do SaaS: ${res.status}`)

		const data = await res.json()
		return {
			title: data.title ?? 'Título não encontrado',
			description: data.description ?? 'Descrição não encontrada',
		}
	} catch (error) {
		console.error('Erro em getBusiness:', error)
		return {
			title: 'Sistema de Agendamento',
			description: 'Descrição indisponível no momento.',
		}
	}
}
