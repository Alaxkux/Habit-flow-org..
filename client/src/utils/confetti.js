// Lightweight confetti + sound — no external deps
export function launchConfetti({ duration = 2500, sound = true } = {}) {
  // --- Sound ---
  if (sound) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const notes = [523, 659, 784, 1047] // C E G C — celebration chord
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain); gain.connect(ctx.destination)
        osc.frequency.value = freq
        osc.type = 'sine'
        gain.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.08)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.35)
        osc.start(ctx.currentTime + i * 0.08)
        osc.stop(ctx.currentTime + i * 0.08 + 0.4)
      })
    } catch {}
  }

  // --- Canvas confetti ---
  let canvas = document.getElementById('confetti-canvas')
  if (!canvas) {
    canvas = document.createElement('canvas')
    canvas.id = 'confetti-canvas'
    document.body.appendChild(canvas)
  }
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  const ctx = canvas.getContext('2d')

  const COLORS = ['#4CAF50','#66BB6A','#FFD700','#FF7043','#AB47BC','#42A5F5','#ffffff']
  const particles = Array.from({ length: 90 }, () => ({
    x: Math.random() * canvas.width,
    y: -10 - Math.random() * 40,
    r: 4 + Math.random() * 6,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    vx: (Math.random() - 0.5) * 3,
    vy: 2 + Math.random() * 4,
    angle: Math.random() * 360,
    spin: (Math.random() - 0.5) * 8,
    opacity: 1,
  }))

  const start = performance.now()
  let raf

  const draw = (now) => {
    const elapsed = now - start
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    particles.forEach(p => {
      p.x += p.vx
      p.y += p.vy
      p.angle += p.spin
      p.vy += 0.07 // gravity
      if (elapsed > duration * 0.6) p.opacity = Math.max(0, p.opacity - 0.015)

      ctx.save()
      ctx.globalAlpha = p.opacity
      ctx.translate(p.x, p.y)
      ctx.rotate((p.angle * Math.PI) / 180)
      ctx.fillStyle = p.color
      ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.6)
      ctx.restore()
    })

    if (elapsed < duration) {
      raf = requestAnimationFrame(draw)
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      cancelAnimationFrame(raf)
    }
  }

  raf = requestAnimationFrame(draw)
}
