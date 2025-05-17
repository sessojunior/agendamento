import { API_URL } from '@/utils/env'

export type BusinessType = {
	id: string
	name: string
	slug: string
	description: string
}

export type ServiceType = {
	id: string
	business_id: string
	order: string
	name: string
	description: string
	status: 'active' | 'inactive'
}

export type EmployeeType = {
	id: string
	business_id: string
	name: string
	avatar: string
	status: 'active' | 'inactive'
	services: { service_id: string; duration: number }[]
	work_time: { start: string; end: string }
	blocked_times: { time: string; duration: string; description: string }[]
	unavailable_dates: { date_start: string; date_end: string; reason: string }[]
}

export type AppointmentType = {
	id: string
	business_id: string
	employee_id: string
	service_id: string
	customer_id: string
	date: string
	time: string
	duration: number
	status: 'pending' | 'confirmed' | 'canceled'
}

type EventEmployeeType = {
	time: string
	type: 'not_work_time' | 'unavailable_date' | 'blocked_time' | 'appointment_time' | 'free_time' | 'empty'
	duration?: number
	description?: string
	name?: string
	service?: string
}

export type AllEventsEmployeeType = {
	employee_id: string
	events: EventEmployeeType[]
}

// Obtém os dados da empresa pelo slug da empresa
export async function getBusiness(slug: string): Promise<BusinessType | null> {
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

// Busca profissionais ativos da empresa que oferecem o serviço desejado
export async function getEmployeesService(slug: string, service_id: string): Promise<EmployeeType[]> {
	try {
		const business = await getBusiness(slug)
		if (!business?.id) return []

		const res = await fetch(`${API_URL}/employee?business_id=${business.id}&order=order&_order=asc`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
			cache: 'no-store',
		})
		if (!res.ok) throw new Error(`Erro ao buscar profissionais: ${res.status}`)

		const allEmployees: EmployeeType[] = await res.json()

		// Filtra profissionais que:
		// 1. Estão ativos (status === 'active')
		// 2. Oferecem o serviço com o ID informado
		const filtered = allEmployees.filter((employee) => employee.status === 'active' && employee.services.some((s) => s.service_id === service_id))

		return filtered
	} catch (error) {
		console.error('Erro em getEmployeesService:', error)
		return []
	}
}

// Busca serviços da empresa pelo slug da empresa e que estejam com o status ativo
export async function getBusinessServices(slug: string): Promise<ServiceType[]> {
	try {
		const business = await getBusiness(slug)
		if (!business?.id) return []

		// Busca serviços com status "active" e business_id correspondente
		const res = await fetch(`${API_URL}/service?business_id=${business.id}&status=active&_sort=order&_order=asc`, {
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
		console.error('Erro em getServices:', error)
		return []
	}
}

// Busca agendamentos do profissional da empresa pelo slug da empresa, profissional, data inicial e final
export async function getEmployeeAppointments(slug: string, employee_id: string, startDate: string, endDate: string): Promise<AppointmentType[]> {
	try {
		// Busca a empresa pelo slug
		const business = await getBusiness(slug)
		if (!business?.id) return []

		// Monta a URL com todos os filtros necessários
		const url = `${API_URL}/appointment` + `?business_id=${business.id}` + `&employee_id=${employee_id}` + `&date_gte=${startDate}` + `&date_lte=${endDate}`

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
			console.warn('Resposta inesperada de appointment:', data)
			return []
		}

		// Retorna o array tipado
		return data as AppointmentType[]
	} catch (error) {
		console.error('Erro em getEmployeeAppointments:', error)
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
// - O tempo de funcionamento do profissional ativo (work_time)
// - A duração do serviço selecionado (duration)
// - Os horário bloqueados (blocked_times). Exemplo: reuniões.
// - As datas indisponíveis, onde não há nenhum horário (unavailable_dates). Exemplo: férias, folgas.
// - Os agendamentos (appointments) já existentes, já agendados com o profissional e que não estão com o status 'canceled'
// - Se ao menos um profissional puder atender no horário, o horário fica disponível
export async function generateTimes({ slug, serviceId, date }: { slug: string; serviceId: string; date: string }): Promise<
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
	const [employeesRes, appointmentsRes] = await Promise.all([fetch(`${API_URL}/employee?business_id=${businessId}`), fetch(`${API_URL}/appointment?business_id=${businessId}`)])

	const employees: EmployeeType[] = await employeesRes.json()
	const appointments: AppointmentType[] = await appointmentsRes.json()

	// Filtra apenas os profissionais com status "active"
	const activeEmployees = employees.filter((emp) => emp.status === 'active')

	// Filtra apenas os profissionais ativos que prestam o serviço
	const professionals = activeEmployees
		.map((emp) => {
			const match = emp.services.find((s) => String(s.service_id) === String(serviceId))
			if (!match) return null
			return {
				...emp,
				serviceDuration: Number(match.duration),
			}
		})
		.filter(Boolean) as (EmployeeType & { serviceDuration: number })[]

	const timeSlotMap: Map<
		string,
		{
			available: boolean
			reason?: string
			professionalsAvailable: { id: string; name: string }[]
		}
	> = new Map()

	// Log de todos os profissionais
	console.log('Profissionais:', professionals)

	for (const pro of professionals) {
		// Verificar se o profissional está disponível na data
		const unavailable = pro.unavailable_dates.find((range) => isDateInRange(date, range.date_start, range.date_end))
		if (unavailable) continue // Se o profissional estiver indisponível, pula

		const workStart = toMinutes(pro.work_time.start)
		const workEnd = toMinutes(pro.work_time.end)
		const duration = pro.serviceDuration

		// Log de horário de trabalho do profissional
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

		// Log de bloqueios
		console.log(`Profissional ${pro.name} tem bloqueios de horário:`)
		blockedRanges.forEach((bt) => console.log(`- De ${toTimeString(bt.start)} até ${toTimeString(bt.end)} por: ${bt.description}`))

		// Verificar agendamentos para a data e profissional
		const appointmentsForDate = appointments.filter((appt) => appt.employee_id === pro.id && appt.date === date && appt.status !== 'canceled')

		// Log de agendamentos
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

// Gera um array de profissionais ativos disponíveis na hora selecionada
export async function getAvailableEmployees({ slug, serviceId, date, time }: { slug: string; serviceId: string; date: string; time: string }): Promise<{ id: string; name: string }[]> {
	const toMinutes = (time: string) => {
		const [h, m] = time.split(':').map(Number)
		return h * 60 + m
	}

	const isDateInRange = (dateStr: string, startStr: string, endStr: string): boolean => {
		const d = new Date(dateStr)
		const start = new Date(startStr)
		const end = new Date(endStr)
		d.setHours(0, 0, 0, 0)
		start.setHours(0, 0, 0, 0)
		end.setHours(0, 0, 0, 0)
		return start <= d && d <= end
	}

	// Buscar a empresa pelo slug
	const resBusiness = await fetch(`${API_URL}/business?slug=${slug}`)
	const business = await resBusiness.json()
	const businessId = business?.[0]?.id
	if (!businessId) return []

	// Buscar funcionários da empresa e agendamentos do dia
	const [employeesRes, appointmentsRes] = await Promise.all([fetch(`${API_URL}/employee?business_id=${businessId}`), fetch(`${API_URL}/appointment?business_id=${businessId}`)])
	const employees: EmployeeType[] = await employeesRes.json()
	const appointments: AppointmentType[] = await appointmentsRes.json()

	// Converter o horário selecionado para minutos
	const selectedTimeInMinutes = toMinutes(time)

	// Filtrar os profissionais ativos que prestam o serviço
	const professionals = employees
		.filter((emp) => emp.status === 'active') // <== FILTRAR SOMENTE ATIVOS
		.map((emp) => {
			const match = emp.services.find((s) => String(s.service_id) === String(serviceId))
			if (!match) return null
			return {
				...emp,
				serviceDuration: Number(match.duration),
			}
		})
		.filter(Boolean) as (EmployeeType & { serviceDuration: number })[]

	const availableProfessionals: { id: string; name: string }[] = []

	for (const pro of professionals) {
		// Ignorar se indisponível na data
		const unavailable = pro.unavailable_dates.find((range) => isDateInRange(date, range.date_start, range.date_end))
		if (unavailable) continue

		// Horários de trabalho
		const workStart = toMinutes(pro.work_time.start)
		const workEnd = toMinutes(pro.work_time.end)

		// Verificar se o horário está dentro do horário de trabalho
		if (selectedTimeInMinutes >= workStart && selectedTimeInMinutes < workEnd) {
			const blockedRanges: { start: number; end: number }[] = []

			// Adicionar bloqueios manuais
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

			// Agendamentos do profissional para o dia
			const appointmentsForDate = appointments.filter((appt) => appt.employee_id === pro.id && appt.date === date && appt.status !== 'canceled')

			// Adicionar horários dos agendamentos ao bloqueio
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

			// Verificar se o horário selecionado conflita com algum bloqueio
			const conflict = blockedRanges.find((b) => !(selectedTimeInMinutes < b.start || selectedTimeInMinutes >= b.end))

			// Se não houver conflito, adicionar como disponível
			if (!conflict) {
				availableProfessionals.push({ id: pro.id, name: pro.name })
			}
		}
	}

	return availableProfessionals
}

// Busca todos os profissionais ativos da empresa pelo slug da empresa
export async function getAllEmployees(slug: string): Promise<EmployeeType[]> {
	try {
		const business = await getBusiness(slug)
		if (!business?.id) return []

		const res = await fetch(`${API_URL}/employee?business_id=${business.id}&status=active`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
			cache: 'no-store',
		})
		if (!res.ok) throw new Error(`Erro ao buscar profissionais: ${res.status}`)

		const allEmployees: EmployeeType[] = await res.json()

		return allEmployees
	} catch (error) {
		console.error('Erro em getAllEmployees:', error)
		return []
	}
}

// PAINEL DO GERENTE DO SALÃO

// Obtém pelo slug da empresa o menor horário de início anterior e o próximo horário do maior horário de fim
// entre os profissionais ativos da empresa e retorna os slots de tempo com base nesse intervalo.
export async function getAllTimes(slug: string): Promise<string[]> {
	const interval = 15 // Intervalo em minutos

	// Gera horários em string formatada alinhados à hora cheia anterior e posterior
	function generateAllTimes(startTime: string, endTime: string, interval: number): string[] {
		const padZero = (n: number) => n.toString().padStart(2, '0')

		const [startHour, startMinute] = startTime.split(':').map(Number)
		const [endHour, endMinute] = endTime.split(':').map(Number)

		let startTotalMinutes = startHour * 60 + startMinute
		let endTotalMinutes = endHour * 60 + endMinute

		// Arredonda o início para a hora cheia anterior
		startTotalMinutes = Math.floor(startTotalMinutes / 60) * 60

		// Arredonda o fim para a hora cheia seguinte
		endTotalMinutes = Math.ceil(endTotalMinutes / 60) * 60

		const times: string[] = []

		for (let current = startTotalMinutes; current <= endTotalMinutes; current += interval) {
			const hours = Math.floor(current / 60)
			const minutes = current % 60
			times.push(`${padZero(hours)}:${padZero(minutes)}`)
		}

		return times
	}

	try {
		const business = await getBusiness(slug)
		if (!business?.id) return []

		const res = await fetch(`${API_URL}/employee?business_id=${business.id}`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
			cache: 'no-store',
		})
		if (!res.ok) throw new Error('Erro ao buscar profissionais')

		const employees = await res.json()

		if (!Array.isArray(employees) || employees.length === 0) {
			throw new Error('Nenhum profissional encontrado.')
		}

		// Filtro para considerar apenas profissionais com status 'active'
		const activeEmployees = employees.filter((emp: { status: string }) => emp.status === 'active')

		if (activeEmployees.length === 0) {
			console.warn('Nenhum profissional ativo encontrado.')
			return []
		}

		let minStartMinutes = Infinity
		let maxEndMinutes = -Infinity

		for (const emp of activeEmployees) {
			const start = emp.work_time?.start
			const end = emp.work_time?.end

			if (!start || !end) continue

			const [startH, startM] = start.split(':').map(Number)
			const [endH, endM] = end.split(':').map(Number)

			const totalStart = startH * 60 + startM
			const totalEnd = endH * 60 + endM

			if (totalStart < minStartMinutes) minStartMinutes = totalStart
			if (totalEnd > maxEndMinutes) maxEndMinutes = totalEnd
		}

		if (minStartMinutes === Infinity || maxEndMinutes === -Infinity) {
			console.warn('Nenhum horário de trabalho válido encontrado entre profissionais ativos.')
			return []
		}

		// Converte minutos totais para string HH:mm
		const padZero = (n: number) => n.toString().padStart(2, '0')
		const startTime = `${padZero(Math.floor(minStartMinutes / 60))}:${padZero(minStartMinutes % 60)}`
		const endTime = `${padZero(Math.floor(maxEndMinutes / 60))}:${padZero(maxEndMinutes % 60)}`

		// Gera e retorna os slots de tempo
		return generateAllTimes(startTime, endTime, interval)
	} catch (error) {
		console.error('Erro em getAllTimes:', error)
		return []
	}
}

// Gera um array de profissionais com o tempo para renderizar os componentes de evento, considerando:
// - Horário de trabalho (work_time)
// - Datas indisponíveis (unavailable_dates)
// - Horários bloqueados (blocked_times)
// - Agendamentos existentes (appointments), exceto os com status "canceled"
export async function getAllEventsEmployee(slug: string, employee_id: string, date: string): Promise<AllEventsEmployeeType> {
	// Converte string HH:mm em minutos
	function parseTime(time: string): number {
		const [h, m] = time.split(':').map(Number)
		return h * 60 + m
	}

	// Converte minutos totais para string HH:mm
	function formatMinutes(mins: number): string {
		const h = Math.floor(mins / 60)
			.toString()
			.padStart(2, '0')
		const m = (mins % 60).toString().padStart(2, '0')
		return `${h}:${m}`
	}

	// Busca os dados do cliente pelo ID
	async function getCustomerById(id: string): Promise<string> {
		if (customerCache.has(id)) return customerCache.get(id)!

		const res = await fetch(`${API_URL}/customer?id=${id}`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
			cache: 'no-store',
		})

		if (!res.ok) {
			console.warn(`Erro ao buscar cliente com id ${id}:`, res.status)
			return 'Cliente'
		}

		const data = await res.json()
		const name = data[0]?.name ?? 'Cliente'
		customerCache.set(id, name)
		return name
	}

	// Busca os dados do serviço pelo ID
	async function getServiceById(service_id: string): Promise<ServiceType | null> {
		const res = await fetch(`${API_URL}/service?id=${service_id}`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
			cache: 'no-store',
		})
		const data = await res.json()
		return data[0] ?? null
	}

	const customerCache = new Map<string, string>() // cache local para evitar requisições duplicadas

	const business = await getBusiness(slug)
	if (!business?.id)
		return {
			employee_id: employee_id,
			events: [],
		}

	const res = await fetch(`${API_URL}/employee?id=${employee_id}`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
		cache: 'no-store',
	})

	const [employee]: EmployeeType[] = await res.json()
	if (!employee)
		return {
			employee_id: employee_id,
			events: [],
		}

	const appointmentsRes = await fetch(`${API_URL}/appointment?business_id=${business.id}&employee_id=${employee_id}&date=${date}&status_ne=canceled`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
		cache: 'no-store',
	})

	const appointments: AppointmentType[] = await appointmentsRes.json()

	const events: EventEmployeeType[] = []
	const slotMinutes = 15

	// Obtém o horário (inicio e fim) dos eventos do profissional através da função getAllTimes()
	const timeSlots = await getAllTimes(slug)
	if (timeSlots.length === 0)
		return {
			employee_id: employee_id,
			events: [],
		}

	const dayStart = parseTime(timeSlots[0])
	const dayEnd = parseTime(timeSlots[timeSlots.length - 1]) + slotMinutes // adiciona último slot

	// Obtém o horário de trabalho de inicio e fim do profissional
	const workStart = parseTime(employee.work_time.start)
	const workEnd = parseTime(employee.work_time.end)

	const isUnavailable = employee.unavailable_dates.some((unavailable) => {
		return date >= unavailable.date_start && date <= unavailable.date_end
	})

	// Rastreia até que ponto os slots devem ser marcados como empty após um evento com duração.
	// Ao processar cada intervalo de tempo, verifica se o horário atual está dentro do intervalo
	// de skipUntil. Se estiver, adicionamos um evento do tipo empty.
	// Quando encontra um blocked_time ou appointment_time, define skipUntil para o horário final
	// do evento, garantindo que os slots subsequentes sejam marcados corretamente como empty.

	let skipUntil = -1

	for (let time = dayStart; time < dayEnd; time += slotMinutes) {
		const timeStr = formatMinutes(time)

		// Verifica se o horário atual deve ser marcado como empty
		if (time < skipUntil) {
			events.push({ time: timeStr, type: 'empty' })
			continue
		}

		// Verifica se é data indisponível
		if (isUnavailable) {
			events.push({ time: timeStr, type: 'unavailable_date' })
			continue
		}

		// Verifica se é horário de trabalho
		if (time < workStart || time >= workEnd) {
			events.push({ time: timeStr, type: 'not_work_time' })
			continue
		}

		// Verifica se é bloqueio
		const block = employee.blocked_times.find((b) => b.time === timeStr)
		if (block) {
			const duration = parseInt(block.duration)
			events.push({
				time: timeStr,
				type: 'blocked_time',
				duration,
				description: block.description,
			})
			skipUntil = time + duration
			continue
		}

		// Verifica se tem agendamento
		const appointment = appointments.find((a) => a.time === timeStr)
		if (appointment) {
			const [customerName, service] = await Promise.all([getCustomerById(appointment.customer_id), getServiceById(appointment.service_id)])

			events.push({
				time: timeStr,
				type: 'appointment_time',
				duration: appointment.duration,
				name: customerName,
				service: service?.name ?? 'Serviço',
			})
			skipUntil = time + appointment.duration
			continue
		}

		events.push({ time: timeStr, type: 'free_time' })
	}

	return {
		employee_id,
		events,
	}
}
