import { useMemo } from 'react'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS   = ['S','M','T','W','T','F','S']

const getColor = (count) => {
  if (!count || count === 0) return '#ECFDF5'
  if (count === 1) return '#A7F3D0'
  if (count === 2) return '#34D399'
  if (count === 3) return '#10B981'
  return '#065F46'
}

const HeatmapCalendar = ({ data = {} }) => {
  const { cells, monthLabels } = useMemo(() => {
    const today = new Date()
    const start = new Date(today)
    start.setDate(start.getDate() - 364)
    start.setDate(start.getDate() - start.getDay()) // rewind to Sunday

    const cells = []
    const monthLabels = []
    let lastMonth = -1
    let colIndex = 0
    const cursor = new Date(start)

    while (cursor <= today) {
      const month = cursor.getMonth()
      if (month !== lastMonth) { monthLabels.push({ col: colIndex, label: MONTHS[month] }); lastMonth = month }
      const week = []
      for (let d = 0; d < 7; d++) {
        const yr = cursor.getFullYear()
        const mo = String(cursor.getMonth()+1).padStart(2,'0')
        const dy = String(cursor.getDate()).padStart(2,'0')
        const key = `${yr}-${mo}-${dy}`
        week.push({ key, count: cursor > today ? null : (data[key] || 0), isFuture: cursor > today })
        cursor.setDate(cursor.getDate() + 1)
      }
      cells.push(week)
      colIndex++
    }
    return { cells, monthLabels }
  }, [data])

  const totalContributions = Object.values(data).reduce((a, b) => a + b, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-800 text-gray-900">Activity Heatmap</h2>
        <span className="text-xs text-gray-400 font-600">{totalContributions} total check-ins</span>
      </div>

      <div className="overflow-x-auto">
        <div style={{ width: 'max-content' }}>
          {/* Month labels row */}
          <div className="flex gap-0.5 mb-1 ml-5">
            {(() => {
              const els = []
              for (let i = 0; i < monthLabels.length; i++) {
                const span = (monthLabels[i+1]?.col ?? cells.length) - monthLabels[i].col
                els.push(
                  <div key={i} style={{ width: span * 14 - 2 }} className="text-[9px] text-gray-400 font-700 truncate">
                    {monthLabels[i].label}
                  </div>
                )
              }
              return els
            })()}
          </div>

          <div className="flex gap-0.5">
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 mr-1 pt-0.5">
              {DAYS.map((d, i) => (
                <div key={i} className="w-3 h-3 flex items-center justify-center">
                  {i % 2 === 1 && <span className="text-[8px] text-gray-300 font-600">{d}</span>}
                </div>
              ))}
            </div>

            {/* Grid columns */}
            {cells.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.map((cell) => (
                  <div key={cell.key}
                    title={cell.isFuture ? '' : `${cell.key}: ${cell.count} check-in${cell.count !== 1 ? 's' : ''}`}
                    className="w-3 h-3 rounded-[2px] cursor-default"
                    style={{ backgroundColor: cell.isFuture ? 'transparent' : getColor(cell.count) }}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1.5 mt-2 justify-end">
            <span className="text-[9px] text-gray-300">Less</span>
            {[0,1,2,3,4].map(n => (
              <div key={n} className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: getColor(n) }}/>
            ))}
            <span className="text-[9px] text-gray-300">More</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeatmapCalendar
