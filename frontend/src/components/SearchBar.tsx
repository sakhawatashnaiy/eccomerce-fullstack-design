/**
 * Stateless search input UI.
 * Uses a stable, unique input id by default (prevents duplicate ids when multiple search bars render).
 */
import { memo, useId } from 'react'

function SearchBar({ id, placeholder = 'Search', value = '', onChange, onSubmit }) {
	const reactId = useId()
	const inputId = id || `search-${reactId}`

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault()
				onSubmit?.(value)
			}}
			className="w-full"
		>
			<label className="sr-only" htmlFor={inputId}>
				Search
			</label>
			<div className="relative">
				<span className="pointer-events-none absolute inset-y-0 left-3 inline-flex items-center">
					<svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-slate-400" aria-hidden="true">
						<path
							d="M11 19a8 8 0 100-16 8 8 0 000 16z"
							stroke="currentColor"
							strokeWidth="1.8"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
						<path
							d="M21 21l-4.3-4.3"
							stroke="currentColor"
							strokeWidth="1.8"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</span>
				<input
					id={inputId}
					type="search"
					placeholder={placeholder}
					value={value}
					onChange={(e) => onChange?.(e.target.value)}
					className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-100"
				/>
			</div>
		</form>
	)
}

export default memo(SearchBar)

