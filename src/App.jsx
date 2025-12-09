import { useState, useMemo, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";

export default function App() {
  const maxHarmonics = 15;
  const [targetHarmonics, setTargetHarmonics] = useState(1);
  const [numHarmonics, setNumHarmonics] = useState(1);
  const N = 800;
  const t = [...Array(N)].map((_, i) => (i / N) * 2 * Math.PI);

  useEffect(() => {
    if (numHarmonics < targetHarmonics) {
      const id = setTimeout(() => setNumHarmonics(numHarmonics + 2), 200);
      return () => clearTimeout(id);
    } else if (numHarmonics > targetHarmonics) {
      setNumHarmonics(targetHarmonics);
    }
  }, [targetHarmonics, numHarmonics]);

  const harmonicsData = useMemo(() => {
    let data = [];
    for (let k = 1; k <= numHarmonics; k += 2) {
      const amp = 4 / (k * Math.PI);
      const wave = t.map((x) => ({ x, y: amp * Math.sin(k * x) }));
      data.push({ k, amp, wave, color: `hsl(${(k * 50) % 360},80%,50%)` });
    }
    return data;
  }, [numHarmonics, t]);

  const sumWave = useMemo(() => {
    let yMax = 0;
    const wave = t.map((x, i) => {
      let y = 0;
      harmonicsData.forEach((h) => (y += h.wave[i].y));
      if (Math.abs(y) > yMax) yMax = Math.abs(y);
      return { x, y };
    });
    return { wave, yMax };
  }, [harmonicsData, t]);

  const maxAmpHarmonics = sumWave.yMax;

  const spectrum = useMemo(() => {
    const freqs = [];
    harmonicsData.forEach((h) => {
      freqs.push({ freq: h.k, amp: h.amp, color: h.color });
      freqs.push({ freq: -h.k, amp: h.amp, color: h.color });
    });
    return freqs.sort((a, b) => a.freq - b.freq);
  }, [harmonicsData]);

  return (
    <div style={{ padding: 20, fontFamily: "Arial", maxWidth: 1200, margin: "0 auto" }}>
      <h1>Interaktive Fourier-Demo</h1>
      <p style={{ fontSize: "1.0em", color: "#c3bbbbff", marginTop: "-10px" }}>
        gemacht vom Studenten HSMW Andrei Zamshev
      </p>

      <label style={{ fontWeight: "bold", display: "block", marginTop: 20 }}>
        Anzahl der Harmonischen: {targetHarmonics}
      </label>
      <input
        type="range"
        min="1"
        max={maxHarmonics * 2 - 1}
        step="2"
        value={targetHarmonics}
        onChange={(e) => setTargetHarmonics(Number(e.target.value))}
        style={{ width: "100%", marginBottom: 30 }}
      />

      {/* Верхний ряд: отдельные гармоники и спектр справа */}
      <div style={{ display: "flex", gap: 20 }}>
        <div style={{ flex: 2 }}>
          <h2>Einzelne Harmonische (transparent)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="x"
                type="number"
                domain={[0, 2 * Math.PI]}
                tickCount={9}
                label={{ value: "Zeit (0 bis 2π)", position: "insideBottomRight", offset: -5 }}
              />
              <YAxis domain={[-maxAmpHarmonics, maxAmpHarmonics]} />
              <Tooltip labelFormatter={(x) => `Zeit: ${x.toFixed(2)}`} />
              {harmonicsData.map((h, idx) => (
                <Line
                  key={idx}
                  data={h.wave}
                  type="monotone"
                  dataKey="y"
                  dot={false}
                  stroke={h.color}
                  strokeWidth={2}
                  strokeOpacity={0.5}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ flex: 1 }}>
          <h2>Frequenzspektrum</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={spectrum}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="freq" label={{ value: "Frequenz", position: "insideBottomRight", offset: 0 }} />
              <YAxis label={{ value: "Amplitude", angle: -90, position: "insideLeft" }} />
              <Tooltip labelFormatter={(f) => `Frequenz: ${f}`} />
              {spectrum.map((s, idx) => (
                <Bar
                  key={idx}
                  dataKey="amp"
                  data={[s]}
                  fill={s.color}
                  barSize={8}
                  isAnimationActive={true}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* График суммы под верхним рядом */}
      <div style={{ marginTop: 30 }}>
        <h2>Summe der Harmonischen</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={sumWave.wave}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" label={{ value: "Zeit", position: "insideBottomRight", offset: 0 }} />
            <YAxis
              domain={[-sumWave.yMax, sumWave.yMax]}
              label={{ value: "Amplitude", angle: -90, position: "insideLeft" }}
            />
            <Tooltip labelFormatter={(x) => `Zeit: ${x.toFixed(2)}`} />
            <Line type="monotone" dataKey="y" dot={false} stroke="red" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}