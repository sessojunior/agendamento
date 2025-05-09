import { API_URL } from '@/utils/env'

export type Business = {
	id: string
	name: string
	slug: string
	description: string
}

export type BusinessService = {
	id: string
	business_id: string
	order: string
	name: string
	description: string
	status: 'active' | 'inactive'
}

export type BusinessEmployee = {
	id: string
	business_id: string
	name: string
	avatar: string
	business_services: { business_service_id: string; duration: number }[]
	work_time: { start: string; end: string }
	blocked_times: { time: string; duration: string; description: string }[]
	unavailable_dates: { date_start: string; date_end: string; reason: string }[]
}

export type BusinessEmployeeAppointment = {
	id: string
	business_id: string
	business_employee_id: string
	business_service_id: string
	customer_user_id: string
	date: string
	time: string
	duration: number
	status: 'pending' | 'confirmed' | 'canceled'
}

export type DateStatus = {
	date: string
	formattedDate: string
	status: 'available' | 'unavailable'
	reason: string | null
}

export type TimeSlot = {
	date: string // formato "YYYY-MM-DD"
	serviceDuration: number // minutos
	professional: {
		id: string
		work_time: { start: string; end: string }
		blocked_times: { time: string; duration: number; description: string }[]
		unavailable_dates: { date_start: string; date_end: string; reason: string }[]
		appointments: { date: string; time: string; duration: number }[]
	}
}

// Obtém os dados da empresa pelo slug
export async function getBusiness(slug: string): Promise<Business | null> {
	try {
		const res = await fetch(`${API_URL}/business?slug=${slug}`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
			cache: 'no-store',
		})

		if (!res.ok) throw new Error(`Erro ao buscar dados da empresa: ${res.status}`)

		const data = await res.json()
		const business = data[0]

		return {
			id: business.id ?? '',
			name: business.name ?? 'Nome não encontrado',
			slug: business.slug ?? slug,
			description: business.description ?? '',
		}
	} catch {
		return null
	}
}

// Busca profissionais da empresa pelo slug que fazem o serviço desejado
export async function getEmployeesService(slug: string, service_id: string): Promise<BusinessEmployee[]> {
	try {
		const business = await getBusiness(slug)
		if (!business?.id) return []

		const res = await fetch(`${API_URL}/business_employee?business_id=${business.id}&order=order&_order=asc`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
			cache: 'no-store',
		})
		if (!res.ok) throw new Error(`Erro ao buscar profissionais: ${res.status}`)

		const allEmployees: BusinessEmployee[] = await res.json()

		// Filtra os profissionais que oferecem o serviço
		const filtered = allEmployees.filter((employee) => employee.business_services.some((s) => s.business_service_id === service_id))

		return filtered
	} catch (error) {
		console.error('Erro em getEmployeesByService:', error)
		return []
	}
}

// Busca serviços da empresa pelo slug e que estejam com o status ativo
export async function getBusinessServices(slug: string): Promise<BusinessService[]> {
	try {
		const business = await getBusiness(slug)
		if (!business?.id) return []

		// Busca serviços com status "active" e business_id correspondente
		const res = await fetch(`${API_URL}/business_service?business_id=${business.id}&status=active&_sort=order&_order=asc`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
			cache: 'no-store',
		})

		if (!res.ok) {
			throw new Error(`Erro ao buscar serviços: ${res.status}`)
		}

		const data = await res.json()
		return data
	} catch (error) {
		console.error('Erro em getBusinessServices:', error)
		return []
	}
}

// Busca agendamentos do profissional da empresa pelo slug, profissional, data inicial e final
export async function getBusinessEmployeeAppointments(slug: string, employee_id: string, startDate: string, endDate: string): Promise<BusinessEmployeeAppointment[]> {
	try {
		// Busca a empresa pelo slug
		const business = await getBusiness(slug)
		if (!business?.id) return []

		// Monta a URL com todos os filtros necessários
		const url = `${API_URL}/business_appointment` + `?business_id=${business.id}` + `&business_employee_id=${employee_id}` + `&date_gte=${startDate}` + `&date_lte=${endDate}`

		// Faz a requisição
		const res = await fetch(url, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
			cache: 'no-store',
		})

		if (!res.ok) {
			throw new Error(`Erro ao buscar agendamentos: ${res.status}`)
		}

		// Converte e valida o resultado
		const data = await res.json()
		if (!Array.isArray(data)) {
			console.warn('Resposta inesperada de business_appointment:', data)
			return []
		}

		// Retorna o array tipado
		return data as BusinessEmployeeAppointment[]
	} catch (error) {
		console.error('Erro em getBusinessEmployeeAppointments:', error)
		return []
	}
}

// Gera um array de datas a partir da data inicial e a quantidade máxima de dias
export function generateDates(startDate: string | Date, days: number): { date: string; formattedDate: string }[] {
	// Limita a quantidade máxima de dias a 60
	const maxDays = Math.min(days, 60)

	// Se for string, garantimos que seja interpretada como meio-dia em UTC,
	// para evitar deslocamentos de fuso.
	const base = typeof startDate === 'string' ? new Date(`${startDate}T12:00:00Z`) : new Date(startDate)

	// Tabelas de nomes em português (abreviações)
	const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
	const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

	const results: { date: string; formattedDate: string }[] = []

	for (let i = 0; i < maxDays; i++) {
		const d = new Date(base)
		d.setDate(base.getDate() + i)

		// Ajusta para fuso de São Paulo
		const utcTime = d.getTime()
		const tzOffset = new Date().getTimezoneOffset() * 60000
		const saoPauloOffset = -3 * 60 * 60000 // UTC-3
		const localTs = utcTime - tzOffset + saoPauloOffset
		const localDate = new Date(localTs)

		// Formata partes
		const yyyy = localDate.getFullYear()
		const mm = String(localDate.getMonth() + 1).padStart(2, '0')
		const dd = String(localDate.getDate()).padStart(2, '0')
		const wk = weekdays[localDate.getDay()]
		const mo = months[localDate.getMonth()]

		results.push({
			date: `${yyyy}-${mm}-${dd}`,
			formattedDate: `${wk} ${dd} ${mo} ${yyyy}`,
		})
	}

	return results
}

// Gera um array de horários disponíveis considerando:
// - O tempo de funcionamento do profissional (work_time)
// - A duração do serviço selecionado (duration)
// - Os horário bloqueados (blocked_times). Exemplo: reuniões.
// - As datas indisponíveis, onde não há nenhum horário (unavailable_dates). Exemplo: férias, folgas.
// - Os agendamentos (appointments) já existentes, já agendados com o profissional e que não estão com o status 'canceled'
// - Se ao menos um profissional puder atender no horário, o horário fica disponível
export async function generateTimeSlots({ slug, serviceId, date }: { slug: string; serviceId: string; date: string }): Promise<
	{
		time: string
		available: boolean
		reason?: string
		professionalsAvailable?: { id: string; name: string }[]
	}[]
> {
	const toMinutes = (time: string) => {
		const [h, m] = time.split(':').map(Number)
		return h * 60 + m
	}

	const toTimeString = (minutes: number) => {
		const h = String(Math.floor(minutes / 60)).padStart(2, '0')
		const m = String(minutes % 60).padStart(2, '0')
		return `${h}:${m}`
	}

	const isDateInRange = (dateStr: string, startStr: string, endStr: string) => {
		const d = new Date(dateStr)
		const start = new Date(startStr)
		const end = new Date(endStr)
		d.setHours(0, 0, 0, 0)
		start.setHours(0, 0, 0, 0)
		end.setHours(0, 0, 0, 0)
		return start <= d && d <= end
	}

	// Buscar a empresa
	const resBusiness = await fetch(`${API_URL}/business?slug=${slug}`)
	const business = await resBusiness.json()
	const businessId = business?.[0]?.id
	if (!businessId) return []

	// Buscar funcionários e agendamentos
	const [employeesRes, appointmentsRes] = await Promise.all([fetch(`${API_URL}/business_employee?business_id=${businessId}`), fetch(`${API_URL}/business_appointment?business_id=${businessId}`)])
	const employees: BusinessEmployee[] = await employeesRes.json()
	const appointments: BusinessEmployeeAppointment[] = await appointmentsRes.json()

	// Filtrar profissionais que prestam o serviço
	const professionals = employees
		.map((emp) => {
			const match = emp.business_services.find((s) => String(s.business_service_id) === String(serviceId))
			if (!match) return null
			return {
				...emp,
				serviceDuration: Number(match.duration),
			}
		})
		.filter(Boolean) as (BusinessEmployee & { serviceDuration: number })[]

	// Map para controlar os horários e os profissionais disponíveis
	const timeSlotMap: Map<
		string,
		{
			available: boolean
			reason?: string
			professionalsAvailable: { id: string; name: string }[]
		}
	> = new Map()

	// LOG de todos os profissionais
	console.log('Profissionais:', professionals)

	for (const pro of professionals) {
		// Verificar se o profissional está disponível na data
		const unavailable = pro.unavailable_dates.find((range) => isDateInRange(date, range.date_start, range.date_end))
		if (unavailable) continue // Se o profissional estiver indisponível, pula

		const workStart = toMinutes(pro.work_time.start)
		const workEnd = toMinutes(pro.work_time.end)
		const duration = pro.serviceDuration

		// LOG de horário de trabalho do profissional
		console.log(`Profissional ${pro.name} trabalha das ${toTimeString(workStart)} até ${toTimeString(workEnd)} com duração do serviço de ${duration} minutos`)

		// Verificar bloqueios de horário (blocked_times)
		const blockedRanges: { start: number; end: number; description: string }[] = []

		for (const bt of pro.blocked_times) {
			const btStart = toMinutes(bt.time)
			const btDuration = Number(bt.duration)
			if (!isNaN(btStart) && !isNaN(btDuration)) {
				blockedRanges.push({
					start: btStart,
					end: btStart + btDuration,
					description: bt.description,
				})
			}
		}

		// LOG de bloqueios
		console.log(`Profissional ${pro.name} tem bloqueios de horário:`)
		blockedRanges.forEach((bt) => console.log(`- De ${toTimeString(bt.start)} até ${toTimeString(bt.end)} por: ${bt.description}`))

		// Verificar agendamentos para a data e profissional
		const appointmentsForDate = appointments.filter((appt) => appt.business_employee_id === pro.id && appt.date === date && appt.status !== 'canceled')

		// LOG de agendamentos
		if (appointmentsForDate.length > 0) {
			console.log(`Profissional ${pro.name} tem os seguintes agendamentos:`)
			appointmentsForDate.forEach((appt) => console.log(`- Agendamento em ${appt.time} com duração de ${appt.duration} minutos`))
		} else {
			console.log(`Profissional ${pro.name} não tem agendamentos para este dia.`)
		}

		// Adiciona os agendamentos ao bloqueio
		for (const appt of appointmentsForDate) {
			const apptStart = toMinutes(appt.time)
			const apptDuration = Number(appt.duration)
			if (!isNaN(apptStart) && !isNaN(apptDuration)) {
				blockedRanges.push({
					start: apptStart,
					end: apptStart + apptDuration,
					description: 'Horário ocupado',
				})
			}
		}

		blockedRanges.sort((a, b) => a.start - b.start)

		// Gerar slots de tempo com base no horário de trabalho e duração do serviço
		for (let t = workStart; t + duration <= workEnd; t += duration) {
			const slotEnd = t + duration
			const timeStr = toTimeString(t)

			// LOG do slot gerado
			console.log(`Verificando slot: ${timeStr} (de ${toTimeString(t)} até ${toTimeString(slotEnd)})`)

			// Verificar se o slot entra em conflito com algum bloqueio
			const conflict = blockedRanges.find((b) => !(slotEnd <= b.start || t >= b.end))

			// Se não houver conflito, o slot está disponível
			if (!conflict) {
				if (!timeSlotMap.has(timeStr)) {
					timeSlotMap.set(timeStr, {
						available: true,
						professionalsAvailable: [{ id: pro.id, name: pro.name }],
					})
					console.log(`Slot ${timeStr} está disponível para ${pro.name}`)
				} else {
					const existing = timeSlotMap.get(timeStr)!
					existing.available = true
					existing.reason = undefined
					existing.professionalsAvailable.push({ id: pro.id, name: pro.name })
					console.log(`Slot ${timeStr} está disponível para ${pro.name}`)
				}
			} else {
				console.log(`Slot ${timeStr} está ocupado devido a: ${conflict.description}`)
			}
		}
	}

	// Agora, garantir que todos os slots possíveis sejam verificados
	const allSlots = Array.from(
		new Set(
			professionals.flatMap((pro) => {
				const workStart = toMinutes(pro.work_time.start)
				const workEnd = toMinutes(pro.work_time.end)
				const duration = pro.serviceDuration
				const slots: string[] = []
				for (let t = workStart; t + duration <= workEnd; t += duration) {
					slots.push(toTimeString(t))
				}
				return slots
			}),
		),
	)

	// LOG de todos os slots possíveis
	console.log('Todos os slots possíveis:', allSlots)

	// Preencher slots com "available: false" para horários que não têm profissionais disponíveis
	for (const slot of allSlots) {
		if (!timeSlotMap.has(slot)) {
			timeSlotMap.set(slot, {
				available: false,
				reason: 'Nenhum profissional disponível',
				professionalsAvailable: [],
			})
			console.log(`Slot ${slot} está marcado como "Nenhum profissional disponível"`)
		}
	}

	// Ordenar os slots por horário
	return Array.from(timeSlotMap.entries())
		.sort(([a], [b]) => toMinutes(a) - toMinutes(b))
		.map(([time, data]) => ({ time, ...data }))
}

// Gera um array de profissionais disponíveis na hora selecionada
export async function getAvailableEmployees({ slug, serviceId, date, time }: { slug: string; serviceId: string; date: string; time: string }): Promise<{ id: string; name: string }[]> {
	const toMinutes = (time: string) => {
		const [h, m] = time.split(':').map(Number)
		return h * 60 + m
	}

	const isDateInRange: (dateStr: string, startStr: string, endStr: string) => boolean = (dateStr, startStr, endStr) => {
		const d = new Date(dateStr)
		const start = new Date(startStr)
		const end = new Date(endStr)
		d.setHours(0, 0, 0, 0)
		start.setHours(0, 0, 0, 0)
		end.setHours(0, 0, 0, 0)
		return start <= d && d <= end
	}

	// Buscar a empresa
	const resBusiness = await fetch(`${API_URL}/business?slug=${slug}`)
	const business = await resBusiness.json()
	const businessId = business?.[0]?.id
	if (!businessId) return []

	// Buscar funcionários e agendamentos
	const [employeesRes, appointmentsRes] = await Promise.all([fetch(`${API_URL}/business_employee?business_id=${businessId}`), fetch(`${API_URL}/business_appointment?business_id=${businessId}`)])
	const employees: BusinessEmployee[] = await employeesRes.json()
	const appointments: BusinessEmployeeAppointment[] = await appointmentsRes.json()

	// Converter o horário selecionado para minutos
	const selectedTimeInMinutes = toMinutes(time)

	// Filtrar os profissionais que prestam o serviço
	const professionals = employees
		.map((emp) => {
			const match = emp.business_services.find((s) => String(s.business_service_id) === String(serviceId))
			if (!match) return null
			return {
				...emp,
				serviceDuration: Number(match.duration),
			}
		})
		.filter(Boolean) as (BusinessEmployee & { serviceDuration: number })[]

	// Lista de profissionais disponíveis
	const availableProfessionals: { id: string; name: string }[] = []

	// Verificar a disponibilidade de cada profissional
	for (const pro of professionals) {
		// Verificar se o profissional está disponível na data
		const unavailable = pro.unavailable_dates.find((range) => isDateInRange(date, range.date_start, range.date_end))
		if (unavailable) continue // Pular este profissional se estiver indisponível na data

		// Converter horários de trabalho para minutos
		const workStart = toMinutes(pro.work_time.start)
		const workEnd = toMinutes(pro.work_time.end)

		// Verificar se o horário selecionado está dentro do horário de trabalho
		if (selectedTimeInMinutes >= workStart && selectedTimeInMinutes < workEnd) {
			// Verificar se o horário selecionado está disponível
			const blockedRanges: { start: number; end: number }[] = []

			// Adicionar bloqueios de horário
			for (const bt of pro.blocked_times) {
				const btStart = toMinutes(bt.time)
				const btDuration = Number(bt.duration)
				if (!isNaN(btStart) && !isNaN(btDuration)) {
					blockedRanges.push({
						start: btStart,
						end: btStart + btDuration,
					})
				}
			}

			// Adicionar agendamentos
			const appointmentsForDate = appointments.filter((appt) => appt.business_employee_id === pro.id && appt.date === date && appt.status !== 'canceled')

			// Adicionar agendamentos ao bloqueio
			for (const appt of appointmentsForDate) {
				const apptStart = toMinutes(appt.time)
				const apptDuration = Number(appt.duration)
				if (!isNaN(apptStart) && !isNaN(apptDuration)) {
					blockedRanges.push({
						start: apptStart,
						end: apptStart + apptDuration,
					})
				}
			}

			// Verificar se o horário selecionado está bloqueado
			const conflict = blockedRanges.find((b) => !(selectedTimeInMinutes < b.start || selectedTimeInMinutes >= b.end))

			// Se não houver conflito, o profissional está disponível
			if (!conflict) {
				availableProfessionals.push({ id: pro.id, name: pro.name })
			}
		}
	}

	return availableProfessionals
}
