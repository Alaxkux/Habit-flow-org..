const Spinner = ({ size = 'md', color = 'green' }) => {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-3', lg: 'w-12 h-12 border-4' }
  return (
    <div className={`${sizes[size]} border-${color}-500 border-t-transparent rounded-full animate-spin`} />
  )
}
export default Spinner
