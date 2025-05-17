'use client'

import { useState, useEffect } from 'react'

import AppointmentsTopbar from './AppointmentsTopbar'

import { getAllEmployees, getAllTimes, getAllEventsEmployee } from '@/utils/business'
import type { EmployeeType, AllEventsEmployeeType } from '@/utils/business'

export default function Appointments({ slug }: { slug: string }) {
	// Gera eventos para cada funcionário (por enquanto, dia fixo 2025-05-17)
	const date = '2025-05-12'

	const [employees, setEmployees] = useState<EmployeeType[]>([])
	const [times, setTimes] = useState<string[]>([])
	const [events, setEvents] = useState<AllEventsEmployeeType[]>([])

	useEffect(() => {
		async function fetchData() {
			try {
				const employeesData = await getAllEmployees(slug)
				const timesData = await getAllTimes(slug)

				setEmployees(employeesData)
				setTimes(timesData)

				const allEvents: AllEventsEmployeeType[] = await Promise.all(
					employeesData.map(async (employee) => {
						const employeeEvents: AllEventsEmployeeType = await getAllEventsEmployee(slug, employee.id, date)
						return {
							employee_id: employee.id,
							events: employeeEvents.events,
						}
					}),
				)

				setEvents(allEvents)
			} catch (error) {
				console.error('Erro ao buscar dados de agendamento:', error)
			}
		}

		fetchData()
	}, [slug])

	console.log('events', events)

	return (
		<div className='flex flex-col'>
			{/* Topbar */}
			<AppointmentsTopbar />

			{/* Cabeçalho */}
			<div className='flex flex-row w-full'>
				<div className='flex w-16 shrink-0'></div>

				{/* Profissionais */}
				<div className='flex h-16 border-b-2 border-zinc-200'>
					{employees.map((employee) => (
						<Employee key={employee.id} image={employee.avatar} name={employee.name} />
					))}
				</div>
			</div>

			{/* Corpo */}
			<div className='flex flex-row w-full'>
				{/* Horários */}
				<div className='flex flex-col w-16 border-r-2 border-zinc-200 -mt-0.5'>
					{/* A duração dos agendamentos deve respeitar em ser sempre de 15 em 15 minutos */}
					{times.map((time) => {
						const minutes = time.split(':')[1] // Pega a parte dos minutos
						return <Times key={time} time={time} showTime={minutes === '00' || minutes === '30'} />
					})}
				</div>

				{/* Agendamentos dos profissionais */}
				<div className='flex flex-row'>
					{events.map((employee) => (
						<div key={employee.employee_id} className='flex flex-col w-60 border-r border-zinc-100'>
							{employee.events.map((event, index) => (
								<Event key={index} time={event.time} type={event.type} duration={event.duration} description={event.description} name={event.name} service={event.service} />
							))}
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

interface EmployeeProps {
	image: string
	name: string
}

function Employee({ image, name }: EmployeeProps) {
	return (
		<div className='flex justify-center items-center w-60'>
			<img src={image} alt={name} className='rounded-full w-8 h-8' />
			<span className='ml-2 font-semibold'>{name}</span>
		</div>
	)
}

interface TimesProps {
	time: string
	showTime: boolean
}

function Times({ time, showTime }: TimesProps) {
	return (
		<div className='flex flex-row'>
			<div className='flex flex-1 justify-end items-start px-2 h-[48px] relative'>
				<span className='absolute top-0.5 -right-1.5'>{showTime && time}</span>
			</div>
			<div className='flex w-3 border-t-2 border-zinc-200'></div>
		</div>
	)
}

interface EventProps {
	time: string
	type: 'not_work_time' | 'unavailable_date' | 'blocked_time' | 'appointment_time' | 'free_time' | 'empty'
	duration?: number
	description?: string
	name?: string
	service?: string
}

function Event({ time, type, duration, description, name, service }: EventProps) {
	const slotHeight = 48
	const getEndTime = (time: string, duration: number) => {
		const [hours, minutes] = time.split(':').map(Number)
		const date = new Date(0, 0, 0, hours, minutes + duration)
		return date.toTimeString().slice(0, 5)
	}

	const height = duration ? (duration / 15) * slotHeight - 9 : slotHeight - 9
	const endTime = duration ? getEndTime(time, duration) : ''

	return (
		<div className='relative h-[48px] border-b border-zinc-100 w-full flex items-center justify-center'>
			{type === 'not_work_time' || type === 'unavailable_date' ? (
				<>
					{/* Se não é horário de funcionamento ou é uma data indisponível */}
					<div className='border-b border-zinc-100 p-1'>
						<div className='w-[231px] bg-gray-100 bg-[repeating-linear-gradient(135deg,_#FFFFFF_0,_#FFFFFF_5px,_transparent_5px,_transparent_10px)] rounded' style={{ height }}></div>
					</div>
				</>
			) : type === 'blocked_time' && duration ? (
				<>
					{/* Se é horário bloqueado */}
					<div className='absolute top-0 left-0 z-10 m-1 w-[231px] bg-gray-100 text-gray-300 rounded flex items-center justify-center text-sm cursor-default select-none' style={{ height }} title={`${time} - ${endTime}`}>
						{description}
					</div>
				</>
			) : type === 'appointment_time' && duration ? (
				<>
					{/* Botão flutuante para horário agendado  */}
					<div className='absolute top-0 left-0 z-10 m-1 w-[231px] bg-blue-100 rounded flex flex-col justify-between p-2 text-sm cursor-default select-none' style={{ height }}>
						<div>
							<div className='font-bold text-md'>{name}</div>
							{service && <div>{service}</div>}
						</div>
						{duration >= 30 && (
							<div className='flex justify-between text-xs pt-1'>
								<span>
									{time} - {endTime}
								</span>
								<span>{duration} min.</span>
							</div>
						)}
					</div>
				</>
			) : type === 'free_time' ? (
				<>
					{/* Botão flutuante para horário livre  */}
					<button className='absolute top-0 left-0 m-1 w-[231px] h-[39px] bg-transparent text-transparent hover:text-gray-600 hover:bg-green-200 rounded cursor-pointer select-none flex items-center justify-center' title={`${time} - ${getEndTime(time, 15)}`}>
						<span className='text-md font-medium'>Horário livre</span>
					</button>
				</>
			) : null}
		</div>
	)
}
