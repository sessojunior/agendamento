import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'

export default function LayoutPage({ children }: { children: React.ReactNode }) {
	return (
		<div className='flex flex-col'>
			<Topbar />
			<div className='flex'>
				<Sidebar />
				{children}
			</div>
		</div>
	)
}
