import { useMemo, useState } from "react";
import "./App.css";

const pollutants = [
  { name: "PM2.5", unit: "µg/m³", hint: "Fine particles" },
  { name: "PM10", unit: "µg/m³", hint: "Coarse particles" },
  { name: "NO", unit: "µg/m³", hint: "Nitric oxide" },
  { name: "NO2", unit: "µg/m³", hint: "Nitrogen dioxide" },
  { name: "NOx", unit: "ppb", hint: "Nitrogen oxides" },
  { name: "NH3", unit: "µg/m³", hint: "Ammonia" },
  { name: "CO", unit: "mg/m³", hint: "Carbon monoxide" },
  { name: "SO2", unit: "µg/m³", hint: "Sulfur dioxide" },
  { name: "O3", unit: "µg/m³", hint: "Ozone" },
  { name: "Benzene", unit: "µg/m³", hint: "Benzene" },
  { name: "Toluene", unit: "µg/m³", hint: "Toluene" },
  { name: "Xylene", unit: "µg/m³", hint: "Xylene" },
];

const categories = {
  Good: { color: "#27855c", tint: "#e9f5ed", advice: "Air quality is good. It is a great day to enjoy outdoor activities." },
  Satisfactory: { color: "#698d36", tint: "#f1f5e7", advice: "Air quality is acceptable. Sensitive individuals may want to take it easy outdoors." },
  Moderate: { color: "#b17b17", tint: "#faf2df", advice: "People with respiratory conditions should limit prolonged outdoor activity." },
  Poor: { color: "#c36530", tint: "#fbede5", advice: "Consider reducing prolonged outdoor exposure and strenuous activity." },
  "Very Poor": { color: "#bc4c43", tint: "#f9e9e8", advice: "Avoid prolonged outdoor activity. Sensitive groups should stay indoors." },
  Severe: { color: "#813b4a", tint: "#f4e8eb", advice: "Avoid outdoor exposure as much as possible and follow local health advisories." },
};

const cities = [
  "Ahmedabad", "Aizawl", "Amaravati", "Amritsar", "Bengaluru", "Bhopal", "Brajrajnagar",
  "Chandigarh", "Chennai", "Coimbatore", "Delhi", "Ernakulam", "Gurugram", "Guwahati",
  "Hyderabad", "Jaipur", "Jorapokhar", "Kochi", "Kolkata", "Lucknow", "Mumbai", "Patna",
  "Shillong", "Talcher", "Thiruvananthapuram", "Visakhapatnam",
];

const emptyReadings = Object.fromEntries(pollutants.map(({ name }) => [name, ""]));
const sampleReadings = {
  "PM2.5": "24.6", PM10: "48.2", NO: "8.1", NO2: "19.4", NOx: "22.7", NH3: "12.3",
  CO: "0.7", SO2: "7.8", O3: "31.5", Benzene: "1.2", Toluene: "4.8", Xylene: "0.6",
};
const currentDate = new Date();
const localDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;

function BrandMark() {
  return <span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="M16 3.5 27 9.8v12.4L16 28.5 5 22.2V9.8L16 3.5Z" stroke="currentColor" strokeWidth="1.7"/><path d="M10.2 19.8c2.4-5.4 4.2-7.7 6.2-7.7 2.1 0 3.7 2.1 5.4 5.7M10.8 22c2.1-1.3 3.7-1.9 5.5-1.9 1.7 0 3.2.4 4.8 1.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg></span>;
}

function App() {
  const [form, setForm] = useState({ City: "Delhi", Date: localDate, ...emptyReadings });
  const [darkMode, setDarkMode] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const hasMeasurements = useMemo(() => pollutants.some(({ name }) => form[name] !== ""), [form]);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setResult(null);
    if (error) setError("");
  };

  const useSample = () => {
    setForm((current) => ({ ...current, ...sampleReadings }));
    setResult(null);
    setError("");
  };

  const resetReadings = () => {
    setForm((current) => ({ ...current, ...emptyReadings }));
    setResult(null);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setResult(null);
    setError("");
    setLoading(true);
    const apiUrl = (import.meta.env.VITE_API_URL || "http://127.0.0.1:5000").replace(/\/$/, "");

    try {
      const response = await fetch(`${apiUrl}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "The prediction could not be completed.");
      setResult(data);
      window.setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
    } catch (requestError) {
      setError(requestError.message || "Unable to reach the prediction service. Check that the API is running and try again.");
    } finally {
      setLoading(false);
    }
  };

  const category = categories[result?.aqi_category] || { color: "#58736a", tint: "#edf2ef", advice: "Refer to local air quality guidance for the latest health recommendations." };

  return (
    <div className="app-shell" data-theme={darkMode ? "dark" : "light"}>
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Airwise home"><BrandMark /><span>airwise<span className="brand-period">.</span></span></a>
        <nav className="main-nav" aria-label="Main navigation">
          <a className="nav-active" href="#home">Overview</a>
          <a href="#predict">AQI predictor</a>
          <a href="#about">About</a>
        </nav>
        <div className="service-status"><span className="status-light" /> Prediction workspace</div>
        <button
          type="button"
          className="theme-toggle"
          onClick={() => setDarkMode((current) => !current)}
          aria-label={`Switch to ${darkMode ? "light" : "dark"} mode`}
          aria-pressed={darkMode}
        >
          <span className="theme-toggle-icon" aria-hidden="true">{darkMode ? "☀" : "☾"}</span>
          <span className="theme-toggle-label">{darkMode ? "Light mode" : "Dark mode"}</span>
        </button>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-copy">
            <div className="overline"><span className="overline-line" /> AIR QUALITY, MADE CLEAR</div>
            <h1>A clearer view of<br />the air <em>around you.</em></h1>
            <p>Turn pollutant readings into a simple, useful picture of air quality. Make informed decisions for the day ahead.</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#predict">Check air quality <span aria-hidden="true">↗</span></a>
              <a className="text-link" href="#about">How it works <span aria-hidden="true">↓</span></a>
            </div>
            <div className="hero-note"><span className="note-icon">✳</span> Powered by machine learning <span className="note-dot">·</span> Built for everyday clarity</div>
          </div>
          <div className="hero-art" aria-label="Illustration of clean air and a rising air quality trend" role="img">
            <div className="art-sun" />
            <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
            <div className="air-card">
              <div className="air-card-top"><span>THE AIR, IN CONTEXT</span><span className="tiny-spark">✳</span></div>
              <div className="air-card-label">Good air starts with<br />knowing what’s in it.</div>
              <svg className="trend-line" viewBox="0 0 300 100" preserveAspectRatio="none" aria-hidden="true">
                <defs><linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5db58a" stopOpacity=".24"/><stop offset="1" stopColor="#5db58a" stopOpacity="0"/></linearGradient></defs>
                <path d="M0 74 C27 65 35 72 59 49 S96 63 117 41 S156 55 177 33 S213 49 232 24 S271 35 300 11 L300 100 L0 100Z" fill="url(#chart-fill)"/>
                <path d="M0 74 C27 65 35 72 59 49 S96 63 117 41 S156 55 177 33 S213 49 232 24 S271 35 300 11" fill="none" stroke="#398969" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="232" cy="24" r="4" fill="#fff" stroke="#398969" strokeWidth="2"/>
              </svg>
              <div className="chart-labels"><span>MEASURE</span><span>UNDERSTAND</span><span>TAKE ACTION</span></div>
            </div>
            <div className="art-caption"><span className="caption-icon">↗</span><span><strong>Better insight,</strong><br />one reading at a time</span></div>
            <div className="art-leaf leaf-a" /><div className="art-leaf leaf-b" /><div className="art-leaf leaf-c" />
          </div>
        </section>

        <section className="process-strip" aria-label="How the prediction works">
          <div className="process-intro"><span className="process-kicker">A SIMPLE PROCESS</span><strong>From readings to<br />a clearer picture.</strong></div>
          <div className="process-item"><span className="process-number">01</span><span><strong>Add your readings</strong><small>Location, date and pollutants</small></span></div>
          <div className="process-connector" aria-hidden="true">→</div>
          <div className="process-item"><span className="process-number">02</span><span><strong>Model the data</strong><small>Random Forest analysis</small></span></div>
          <div className="process-connector" aria-hidden="true">→</div>
          <div className="process-item"><span className="process-number">03</span><span><strong>Get your AQI</strong><small>Index, category and guidance</small></span></div>
        </section>

        <section className="predict-section" id="predict">
          <div className="section-heading">
            <div><div className="overline"><span className="overline-line" /> YOUR AIR QUALITY SNAPSHOT</div><h2>Let’s check the air.</h2><p>Enter an observation and we’ll translate the numbers into a meaningful AQI estimate.</p></div>
            <div className="model-tag"><span className="model-tag-icon">✳</span><span><strong>ML-powered estimate</strong><small>Random Forest models</small></span></div>
          </div>

          <form onSubmit={handleSubmit}>
            <section className="form-panel location-panel" aria-labelledby="location-title">
              <div className="panel-heading"><div className="panel-icon location-icon" aria-hidden="true">⌖</div><div><span className="panel-step">STEP 01</span><h3 id="location-title">Set the scene</h3><p>Where and when were these readings taken?</p></div></div>
              <div className="location-fields">
                <div className="field"><label htmlFor="city">City <span className="required-mark">*</span></label><div className="field-control city-control"><span className="input-icon" aria-hidden="true">⌖</span><select id="city" name="City" value={form.City} onChange={handleChange} required>{cities.map((city) => <option key={city} value={city}>{city}</option>)}</select></div></div>
                <div className="field"><label htmlFor="date">Observation date <span className="required-mark">*</span></label><div className="field-control date-control"><span className="input-icon" aria-hidden="true">▦</span><input id="date" type="date" name="Date" value={form.Date} onChange={handleChange} required /></div></div>
              </div>
            </section>

            <section className="form-panel readings-panel" aria-labelledby="readings-title">
              <div className="readings-heading">
                <div className="panel-heading"><div className="panel-icon readings-icon" aria-hidden="true">⌁</div><div><span className="panel-step">STEP 02</span><h3 id="readings-title">Add pollutant readings</h3><p>Enter what you have. Any blank readings are estimated by the model.</p></div></div>
                <button type="button" className="sample-button" onClick={useSample}><span aria-hidden="true">✳</span> Fill sample data</button>
              </div>
              <div className="pollutant-grid">
                {pollutants.map(({ name, unit, hint }, index) => (
                  <div className="pollutant-field" key={name}>
                    <label htmlFor={`pollutant-${index}`}><span className="pollutant-label-main">{name}<span className="pollutant-tooltip">{hint}</span></span><span className="pollutant-unit">{unit}</span></label>
                    <div className="pollutant-input-wrap"><input id={`pollutant-${index}`} type="number" min="0" step="any" inputMode="decimal" name={name} value={form[name]} onChange={handleChange} placeholder="—" aria-label={`${name}, ${hint}, in ${unit}`} /><span>{unit}</span></div>
                  </div>
                ))}
              </div>
              <div className="form-footer"><p><span className="info-icon">i</span> At least one pollutant reading is needed for a useful estimate.</p><button type="button" onClick={resetReadings} className="reset-button">Clear readings</button></div>
              {error && <div className="error-message" role="alert"><span className="error-symbol">!</span><span><strong>Prediction unavailable</strong>{error}</span></div>}
              <button className="submit-button" type="submit" disabled={loading || !hasMeasurements}>
                {loading ? <><span className="button-spinner" /> Analyzing your readings…</> : <>Generate AQI estimate <span aria-hidden="true">↗</span></>}
              </button>
              <div className="privacy-note"><span aria-hidden="true">⌑</span> Your readings are used only to generate this estimate.</div>
            </section>
          </form>

          {result && <section className="result-panel" id="results" aria-live="polite" aria-labelledby="result-title">
            <div className="result-topline"><span className="result-check">✓</span><span>ANALYSIS COMPLETE</span><span className="result-place">{form.City} <span>·</span> {form.Date}</span></div>
            <div className="result-layout">
              <div className="result-score"><span className="result-overline">PREDICTED AIR QUALITY INDEX</span><div className="score-row"><strong>{Number(result.predicted_aqi).toFixed(2)}</strong><span className="aqi-unit">AQI</span></div><h3 id="result-title">Your air quality snapshot</h3><p>A machine learning estimate based on the readings you provided.</p></div>
              <div className="result-category" style={{ "--category-color": category.color, "--category-tint": category.tint }}><span className="result-overline">AIR QUALITY CATEGORY</span><span className="category-pill"><i />{result.aqi_category}</span><p>{category.advice}</p><span className="category-footnote">Follow local health guidance for your area.</span></div>
            </div>
          </section>}
        </section>

        <section className="about-section" id="about">
          <div className="about-copy"><div className="overline"><span className="overline-line" /> ABOUT AIRWISE</div><h2>Good decisions start<br />with better information.</h2><p>Air quality can be difficult to interpret. Airwise turns environmental measurements into an accessible estimate, helping make the numbers easier to understand.</p><p className="about-caveat">This tool provides an estimate from user-supplied data and is not a substitute for official monitoring or medical advice.</p></div>
          <div className="model-list"><div className="model-list-heading"><span>THE MODEL BEHIND THE ESTIMATE</span><span className="model-list-spark">✳</span></div><div className="model-row"><span className="model-index">01</span><span className="model-description"><strong>AQI regression</strong><small>Estimates a numerical AQI value</small></span><span className="model-type">REGRESSOR</span></div><div className="model-row"><span className="model-index">02</span><span className="model-description"><strong>Category classification</strong><small>Predicts an air quality category</small></span><span className="model-type">CLASSIFIER</span></div><div className="model-list-footer"><span className="model-status-dot" /> Two Random Forest models working together</div></div>
        </section>
      </main>

      <footer className="site-footer"><a className="brand footer-brand" href="#home"><BrandMark /><span>airwise<span className="brand-period">.</span></span></a><span className="footer-description">AQI prediction, made easier to understand.</span><span className="footer-meta">An educational machine learning project <span>·</span> Estimates are not official readings</span></footer>
    </div>
  );
}

export default App;
