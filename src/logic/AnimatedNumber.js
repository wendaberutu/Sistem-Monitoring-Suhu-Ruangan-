import { useEffect, useRef, useState } from "react";

export default function AnimatedNumber({ value, duration = 350 }) {
  const [display, setDisplay] = useState(value);
  const raf = useRef();

  useEffect(() => {
    const start = display;
    const end = value;
    const diff = end - start;
    const startTime = performance.now();

    function animate(now) {
      const elapsed = now - startTime;
      if (elapsed < duration) {
        const progress = elapsed / duration;
        setDisplay(start + diff * progress);
        raf.current = requestAnimationFrame(animate);
      } else {
        setDisplay(end);
      }
    }

    raf.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line
  }, [value]);

  return <span>{Math.round(display)}</span>;
}
