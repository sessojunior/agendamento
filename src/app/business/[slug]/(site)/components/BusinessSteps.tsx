'use client'

import { useState, useEffect } from 'react'
import { getBusinessServices, generateDates, generateTimeSlots, getAvailableEmployees } from '@/utils/business'
import type { BusinessService } from '@/utils/business'
import type { Step } from '../page'

interface ClientBookingStepsProps {
	steps: { key: Step; label: string; title: string }[]
	slug: string
}

export function BusinessSteps({ steps, slug }: ClientBookingStepsProps) {
	const [currentStep, setCurrentStep] = useState<Step>('servico')
	const [loading, setLoading] = useState<boolean>(true)
	const [services, setServices] = useState<BusinessService[]>([])

	const [selectedService, setSelectedService] = useState<BusinessService | null>(null)
	const [selectedDate, setSelectedDate] = useState<string | null>(null)
	const [selectedTime, setSelectedTime] = useState<string | null>(null)
	const [selectedProfessional, setSelectedProfessional] = useState<{ id: string; name: string } | null>(null)

	const [availableDates, setAvailableDates] = useState<{ date: string; formattedDate: string }[]>([])
	const [availableTimeSlots, setAvailableTimeSlots] = useState<{ time: string; available: boolean; reason?: string }[]>([])
	const [availableProfessionals, setAvailableProfessionals] = useState<{ id: string; name: string }[]>([])

	useEffect(() => {
		const fetchServices = async () => {
			try {
				const data = await getBusinessServices(slug)
				setServices(data)
			} catch (error) {
				console.error('Erro ao buscar serviços:', error)
			} finally {
				setLoading(false)
			}
		}
		fetchServices()
	}, [slug])

	useEffect(() => {
		if (selectedService) {
			const dates = generateDates(new Date(), 15)
			setAvailableDates(dates)
		}
	}, [selectedService])

	const handleSelectService = (service: BusinessService) => {
		setSelectedService(service)
		setSelectedDate(null)
		setCurrentStep('data')
	}

	const handleSelectDate = async (date: string) => {
		setSelectedDate(date)
		if (!selectedService) return
		setLoading(true)

		try {
			const slots = await generateTimeSlots({ slug, serviceId: selectedService.id, date })
			setAvailableTimeSlots(slots)
			console.log(slots)
		} catch (error) {
			console.error('Erro ao gerar horários:', error)
			setAvailableTimeSlots([])
		} finally {
			setLoading(false)
		}
	}

	const handleSelectTime = async (time: string) => {
		if (!selectedService || !selectedDate) return
		setSelectedTime(time)
		setLoading(true)

		try {
			const professionals = await getAvailableEmployees({
				slug,
				serviceId: selectedService.id,
				date: selectedDate,
				time,
			})
			setAvailableProfessionals(professionals)
			setCurrentStep('profissional')
		} catch (error) {
			console.error('Erro ao buscar profissionais disponíveis:', error)
			setAvailableProfessionals([])
		} finally {
			setLoading(false)
		}
	}

	function formatDayMonth(date: Date | string) {
		const d = new Date(date)
		const day = d.getDate()
		const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
		const month = monthNames[d.getMonth()]
		return `${day} ${month}`
	}

	return (
		<section className='max-w-6xl mx-auto'>
			<h2 className='text-xl font-semibold text-gray-700 mb-4 text-center'>Agendamento</h2>

			<div className='flex gap-3 overflow-x-auto justify-center mb-6'>
				{steps.map((step) => (
					<div
						key={step.key}
						title={step.title}
						onClick={() => setCurrentStep(step.key)}
						className={`w-36 h-16 flex flex-col items-center justify-center text-center text-base font-medium rounded-lg cursor-pointer border transition
              ${currentStep === step.key ? 'bg-blue-600 text-white border-blue-600 shadow' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'}`}
					>
						<div>{step.label}</div>
						{step.key === 'servico' && selectedService && <div className='text-xs font-normal'>{selectedService.name}</div>}
						{step.key === 'data' && selectedDate && <div className='text-xs font-normal'>{formatDayMonth(selectedDate)}</div>}
					</div>
				))}
			</div>

			<div className='bg-white rounded-lg p-6 shadow-md border border-gray-200'>
				{currentStep === 'servico' && (
					<div className='flex flex-col'>
						<h3 className='text-lg font-semibold mb-4'>Escolha o serviço</h3>
						{loading ? (
							<div>Carregando serviços...</div>
						) : services.length === 0 ? (
							<div>Não há serviços disponíveis no momento.</div>
						) : (
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								{services.map((service) => (
									<div key={service.id} onClick={() => handleSelectService(service)} className={`cursor-pointer p-4 border rounded-lg transition ${selectedService?.id === service.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}>
										<h4 className='font-medium'>{service.name}</h4>
										<p className='text-sm'>{service.description}</p>
									</div>
								))}
							</div>
						)}
					</div>
				)}

				{currentStep === 'data' && (
					<div>
						<h3 className='text-lg font-semibold mb-4'>Escolha a data</h3>
						<div className='grid grid-cols-3 gap-4'>
							{availableDates.map(({ date, formattedDate }) => (
								<div key={date} onClick={() => handleSelectDate(date)} className={`cursor-pointer p-4 border rounded-lg text-center transition ${selectedDate === date ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}>
									<p>{formattedDate}</p>
								</div>
							))}
						</div>

						<h3 className='text-lg font-semibold mt-6 mb-4'>Escolha o horário</h3>
						{loading ? (
							<p>Carregando horários...</p>
						) : availableTimeSlots.length === 0 ? (
							<p>Não há horários disponíveis para esta data.</p>
						) : (
							<ul className='grid grid-cols-3 gap-4'>
								{availableTimeSlots.map((slot) => (
									<li
										key={slot.time}
										onClick={() => slot.available && handleSelectTime(slot.time)}
										className={`p-3 rounded-lg text-center border text-sm cursor-pointer transition
                      ${slot.available ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200' : 'bg-red-100 text-red-800 border-red-300 cursor-not-allowed'}`}
										title={!slot.available ? slot.reason : 'Disponível'}
									>
										{slot.time}
										{!slot.available && slot.reason && <p className='text-xs mt-1'>{slot.reason}</p>}
									</li>
								))}
							</ul>
						)}
						<button onClick={() => setCurrentStep('servico')}>← Voltar</button>
					</div>
				)}

				{currentStep === 'profissional' && (
					<div>
						<h3 className='text-lg font-semibold mb-4'>Profissional</h3>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
							{availableProfessionals.length === 0 ? (
								<p className='text-sm text-red-600'>Nenhum profissional disponível para o horário selecionado.</p>
							) : (
								availableProfessionals.map((pro) => (
									<div
										key={pro.id}
										onClick={() => {
											setSelectedProfessional(pro)
											setCurrentStep('finalizar')
										}}
										className={`cursor-pointer p-4 border rounded-lg transition ${selectedProfessional?.id === pro.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
									>
										<h4 className='font-medium'>{pro.name}</h4>
									</div>
								))
							)}
						</div>
						<button onClick={() => setCurrentStep('data')}>← Voltar</button>
					</div>
				)}

				{currentStep === 'finalizar' && selectedService && selectedProfessional && selectedDate && selectedTime && (
					<div>
						<h3 className='text-lg font-semibold text-gray-800 mb-2'>Confirmar Agendamento</h3>
						<p>
							<strong>Profissional:</strong> {selectedProfessional.name}
						</p>
						<p>
							<strong>Serviço:</strong> {selectedService.name}
						</p>
						<p>
							<strong>Data:</strong> {formatDayMonth(selectedDate)}
						</p>
						<p>
							<strong>Hora:</strong> {selectedTime}
						</p>

						<div className='flex justify-between mt-6'>
							<button onClick={() => setCurrentStep('profissional')} className='text-sm text-blue-600 underline'>
								← Voltar
							</button>
							<button className='bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition'>Confirmar</button>
						</div>
					</div>
				)}
			</div>
		</section>
	)
}
