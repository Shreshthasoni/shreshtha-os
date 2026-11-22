/** Matrix rain: the optional wallpaper and the full-screen `matrix` easter egg. */
import { $, reduceMotion } from "../lib/dom";
import { accentColor, onSettings } from "./settings";
import { toast } from "./toast";

function rain(canvas: HTMLCanvasElement, alpha = .08) {
  const g = canvas.getContext("2d")!;
  let drops: number[] = [], raf = 0, last = 0;
  const size = () => {
    canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight;
    drops = Array.from({ length: Math.ceil(canvas.width / 14) }, () => Math.random() * -50);
  };
  const chars = "アカサタナハマヤラワ0123456789SHRESHTHA<>/{}=+*";
  const frame = (t: number) => {
    raf = requestAnimationFrame(frame);
    if (t - last < 50) return;
    last = t;
    g.fillStyle = `rgba(0,0,0,${alpha})`; g.fillRect(0, 0, canvas.width, canvas.height);
    g.fillStyle = accentColor(); g.font = "14px JetBrains Mono, monospace";
    drops.forEach((y, i) => {
      g.fillText(chars[Math.floor(Math.random() * chars.length)], i * 14, y * 14);
      drops[i] = y * 14 > canvas.height && Math.random() > .975 ? 0 : y + 1;
    });
  };
  return {
    start() { if (!raf && !reduceMotion) { size(); addEventListener("resize", size); raf = requestAnimationFrame(frame); } },
    stop() { cancelAnimationFrame(raf); raf = 0; removeEventListener("resize", size); }
  };
}

const wallRain = rain($<HTMLCanvasElement>("#rain"), .12);
onSettings(s => (s.wall === "matrix" ? wallRain.start() : wallRain.stop()));

const mx = $<HTMLCanvasElement>("#matrix");
const mxRain = rain(mx, .06);

export function runMatrix(): void {
  if (reduceMotion) { toast("Matrix", "Animation is off because your system prefers reduced motion."); return; }
  const back = document.activeElement as HTMLElement | null;
  mx.classList.add("on"); mxRain.start();
  let timer = 0;
  const stop = () => {
    clearTimeout(timer);
    mx.classList.remove("on"); mxRain.stop();
    removeEventListener("keydown", stop); mx.removeEventListener("click", stop);
    back?.focus({ preventScroll: true });
  };
  setTimeout(() => { addEventListener("keydown", stop, { once: true }); mx.addEventListener("click", stop, { once: true }); }, 300);
  timer = window.setTimeout(stop, 9000);
}
