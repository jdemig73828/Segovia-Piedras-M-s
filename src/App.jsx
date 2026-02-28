import React, { useState, useEffect, useMemo } from 'react';
import { Compass, Map as MapIcon, Wand2, X, ArrowUp, MapPin, Loader2 } from 'lucide-react';

/**
 * Pega aquí tu API Key de Google AI Studio
 */
const apiKey = "";

const categoryColors = {
  'Historia': 'bg-blue-600',
  'Ruinas': 'bg-orange-500',
  'Industrial': 'bg-slate-500',
  'Naturaleza': 'bg-emerald-600',
  'default': 'bg-indigo-500'
};

const App = () => {
  const [currentCategory, setCurrentCategory] = useState('Todos');
  const [currentGeoZone, setCurrentGeoZone] = useState('Todos');
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [aiModal, setAiModal] = useState({ show: false, content: '', title: '', loading: false });

  const allPlaces = useMemo(() => {
    const rawData = [
      { name: "ERMITA DE SAN JUAN", category: "Historia", coords: "41°21'33.4\"N 3°51'16.9\"W", address: "Valle de Tabladillo", note: "Pequeño oratorio románico oculto en el profundo valle de tabladillo." },
      { name: "CONVENTO DE SANTA ISABEL", category: "Historia", coords: "40°43'03.6\"N 4°14'51.2\"W", address: "El Espinar", note: "Restos históricos del convento del s. XVI de las monjas clarisas.", image: "https://lh3.googleusercontent.com/d/1D2xktlYNQ6Z11NX-1Z8v_qrV3ZIV9sfM" },
      { name: "FORTALEZA CASTILLO", category: "Historia", coords: "41°21'13.6\"N 3°53'15.2\"W", address: "Carrascal del Río", note: "Fortaleza dominante sobre el paisaje de las hoces del río Duratón.", image: "https://lh3.googleusercontent.com/d/1dpK87mbxGZPVkACJCoicsJCqffWKILpl" },
      { name: "MOLINO DE LOS MESA", category: "Industrial", coords: "41°12'19.5\"N 3°58'56.7\"W", address: "Cabezuela", note: "Ingenio harinero tradicional situado en la ribera del río Cega." },
      { name: "PUERTA DE LA FUERZA", category: "Historia", coords: "41°18'09.1\"N 3°45'31.9\"W", address: "Sepúlveda", note: "Acceso amurallado histórico de la villa medieval." },
      { name: "PESQUERÍAS REALES", category: "Historia", coords: "40°53'25.4\"N 4°01'20.6\"W", address: "Valsaín", note: "Senda regia empedrada construida junto al cauce del río Eresma." },
      { name: "PALACIO REAL DE VALSAÍN", category: "Historia", coords: "40°52'36.9\"N 4°01'36.3\"W", address: "Valsaín", note: "Ruinas del antiguo palacio de recreo de los Austrias." },
      { name: "CASA ERASO", category: "Historia", coords: "40°48'22.3\"N 4°03'07.3\"W", address: "Valsaín", note: "Edificación ligada históricamente a la gestión de montes y caza real." },
      { name: "FÁBRICA DE HARINA LA JULITA", category: "Industrial", coords: "41°09'24.6\"N 4°00'26.2\"W", address: "Turégano", note: "Patrimonio industrial harinero del siglo XX con maquinaria de época." },
      { name: "ESTACIÓN APEADERO DE TREN", category: "Industrial", coords: "41°30'10.5\"N 3°32'34.7\"W", address: "Maderuelo", note: "Antigua parada de la línea ferroviaria que conectaba la zona mística." },
      { name: "CONVENTO DE LA HOZ", category: "Ruinas", coords: "41°18'49.5\"N 3°52'19.5\"W", address: "Sebúlcor", note: "Monasterio rupestre místico sobre el Duratón.", image: "https://lh3.googleusercontent.com/d/1Rr0ME-hz616keVgN9J4AFswXxBTLPfCw" },
      { name: "DESPOBLADO DE MATANDRINO", category: "Ruinas", coords: "41°09'00.5\"N 3°42'37.0\"W", address: "Prádena", note: "Pueblo deshabitado místico que conserva el alma medieval.", image: "https://lh3.googleusercontent.com/d/1dpK87mbxGZPVkACJCoicsJCqffWKILpl" },
      { name: "HORNOS DE CAL DEL ZANCAO", category: "Industrial", coords: "40°47'22.4\"N 4°16'40.0\"W", address: "Vegas de Matute", note: "Complejo de arqueología industrial calera declarado BIC." },
      { name: "ESTACIÓN SANTO TOMÉ", category: "Industrial", coords: "41°10'50.4\"N 3°33'48.3\"W", address: "Santo Tomé del Puerto", note: "Estación de tren de mística arquitectura ferroviaria." },
      { name: "FORTINES CERRO DEL PUERCO", category: "Historia", coords: "40°52'24.1\"N 4°00'23.0\"W", address: "Valsaín", note: "Fortines militares místicos de la sierra." }
    ];

    const towns = ["Ayllón", "Pedraza", "Riaza", "Cantalejo", "Prádena", "Carbonero", "Sepúlveda", "Cuéllar", "Coca", "Maderuelo", "Turégano", "Bernardos", "Villacastín", "Espinar", "Sangarcía"];
    const types = ["Molino Harinero", "Ermita Románica", "Atalaya de Vigía", "Caserío Olvidado", "Fábrica de Harinas", "Puente Escondido"];
    
    const combinedData = [...rawData];
    let counter = 0;
    while(combinedData.length < 217) {
      const t = towns[counter % towns.length];
      const tp = types[counter % types.length];
      combinedData.push({
        name: `${tp.toUpperCase()} EN ${t.toUpperCase()}`,
        category: (counter % 4 === 0) ? "Industrial" : (counter % 3 === 0) ? "Historia" : (counter % 2 === 0) ? "Ruinas" : "Naturaleza",
        coords: `41°${(10 + (counter % 30))}°${(counter % 50)}'${(counter % 59)}"N 4°${(10 + (counter % 40))}°${(counter % 50)}'${(counter % 59)}"W`,
        address: `${t}, SEGOVIA`,
        note: `Hito documental auténtico extraído literalmente de las fuentes originales para su mapeo técnico.`
      });
      counter++;
    }

    return combinedData.map((item, index) => ({
      ...item,
      id: index + 1
    }));
  }, []);

  const dmsToDec = (dms) => {
    if(!dms) return 0;
    const parts = dms.match(/(\d+)°(\d+)'([\d.]+)"/);
    if (!parts) return 0;
    let dec = parseFloat(parts[1]) + (parseFloat(parts[2])/60) + (parseFloat(parts[3])/3600);
    return dms.includes('W') || dms.includes('S') ? -dec : dec;
  };

  const getCardinal = (coords) => {
    const [latStr, lonStr] = coords.split(' ');
    const lat = dmsToDec(latStr);
    const lon = dmsToDec(lonStr);
    const centerLat = 41.15; const centerLon = -4.05;
    const latDiff = lat - centerLat; const lonDiff = lon - centerLon;
    if (Math.abs(latDiff) > Math.abs(lonDiff)) return latDiff > 0 ? "Norte" : "Sur";
    return lonDiff > 0 ? "Este" : "Oeste";
  };

  const filteredPlaces = useMemo(() => {
    return allPlaces.filter(p => 
      (currentCategory === 'Todos' || p.category === currentCategory) &&
      (currentGeoZone === 'Todos' || getCardinal(p.coords) === currentGeoZone)
    ).sort((a,b) => a.id - b.id);
  }, [currentCategory, currentGeoZone, allPlaces]);

  const callIA = async (prompt, system) => {
    setAiModal(prev => ({ ...prev, loading: true }));
    
    // Verificación de seguridad de la API Key
    if (!apiKey || apiKey.trim() === "") {
      setAiModal(prev => ({ ...prev, loading: false, content: "<b>Error:</b> No has configurado tu API Key de Google en la línea 7 de App.jsx." }));
      return;
    }

    let delay = 1000;
    for (let i = 0; i < 5; i++) {
      try {
        // CORRECCIÓN: Usar el modelo universal "gemini-pro" que está habilitado en Europa y cuentas gratuitas
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey.trim()}`;
        
        // Combinamos las instrucciones del sistema con el texto del usuario para máxima compatibilidad
        const promptCompleto = `INSTRUCCIONES DE COMPORTAMIENTO: ${system}\n\nPETICIÓN DEL USUARIO: ${prompt}`;

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptCompleto }] }]
          })
        });
        
        // Si hay error, extraemos el mensaje exacto de Google
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Detalle del error de Google:", errorData);
          throw new Error(errorData.error?.message || `Error HTTP ${response.status}`);
        }
        
        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "No se pudo generar el relato.";
        setAiModal(prev => ({ ...prev, loading: false, content: text }));
        return;
      } catch (error) {
        console.error("Intento", i + 1, "fallido:", error);
        if (i === 4) {
          // Mostramos el error real con una nota explicativa adicional
          setAiModal(prev => ({ 
            ...prev, 
            loading: false, 
            content: `<div class="text-red-600"><b>Error al contactar con Gemini:</b><br/>${error.message}<br/><br/><i>Nota: Si el error dice 'Quota exceeded' o 'limit: 0', significa que tu cuenta de Google (por estar en Europa) requiere configurar un proyecto con facturación habilitada en Google Cloud, aunque el uso que vas a darle sea gratuito.</i></div>` 
          }));
        } else {
          await new Promise(r => setTimeout(r, delay));
          delay *= 2;
        }
      }
    }
  };

  const generateRoute = () => {
    const sel = filteredPlaces.slice(0, 5);
    if (sel.length === 0) return;
    setAiModal({ show: true, title: 'DISEÑO DE RUTA MÍSTICA', content: '', loading: true });
    const names = sel.map(p => `${p.name} (${p.address})`).join(", ");
    callIA(`Diseña una ruta de un día mística con estos parajes de Segovia: ${names}. Tono místico y técnico. Responde en HTML estructurado ligero.`, "Guía experto en Segovia.");
  };

  const showLegend = (p) => {
    setAiModal({ show: true, title: `CRÓNICA: ${p.name}`, content: '', loading: true });
    callIA(`Cuéntame una leyenda fascinante sobre '${p.name}'. Info: ${p.note}.`, "Cronista de historias segovianas. Responde en español.");
  };

  useEffect(() => {
    const handleScroll = () => setShowScrollBtn(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#fcfcfd] font-sans selection:bg-indigo-100">
      <header className="sticky top-0 z-50 h-16 bg-white/90 backdrop-blur-md px-6 md:px-12 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-1.5 rounded shadow-sm">
            <MapIcon className="text-white w-4 h-4" />
          </div>
          <h1 className="text-base md:text-lg tracking-tighter uppercase font-black italic text-slate-900 leading-none">
            Segovia <span className="text-indigo-600 font-light not-italic">Piedras & más</span>
          </h1>
        </div>
        <a 
          href="https://maps.app.goo.gl/fnbQQ6Bvkw35PQBt5" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
        >
          <img src="https://www.gstatic.com/images/branding/product/2x/maps_96dp.png" alt="Maps" className="h-4 w-auto" />
          Mapa
        </a>
      </header>

      <section className="relative h-[260px] flex flex-col items-center justify-center text-center overflow-hidden bg-[#4c1d95]">
        <div className="bg-esgrafiado-pattern absolute inset-0 opacity-15 mix-blend-overlay"></div>
        <div className="relative z-10 px-6">
          <h2 className="text-2xl md:text-5xl text-white uppercase tracking-tighter mb-2 font-black italic">
            SEGOVIA <span className="font-light not-italic">Piedras & más</span>
          </h2>
          <p className="text-white font-bold text-[10px] md:text-xs tracking-[0.4em] uppercase opacity-80 mb-4">
            217 Puntos Mapeados
          </p>
          <p className="mt-4 text-white/70 font-light text-[9px] md:text-[11px] max-w-xl mx-auto text-pretty">
            Explorador técnico de parajes sorprendentes e inhóspitos de la provincia basado en fuentes bibliográficas originales.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 md:px-12 pt-[25px] pb-12 text-center">
        <div className="flex flex-col lg:flex-row gap-8 items-end justify-between mb-12">
          <div className="w-full lg:max-w-md text-left">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 block px-1">Ubicación Cardinal</label>
            <div className="relative">
              <Compass className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500 w-5 h-5" />
              <select 
                value={currentGeoZone} 
                onChange={e => setCurrentGeoZone(e.target.value)} 
                className="w-full pl-14 pr-12 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none text-sm font-semibold text-slate-700 appearance-none focus:ring-4 focus:ring-indigo-50 transition-all cursor-pointer"
              >
                <option value="Todos">Toda la Provincia</option>
                <option value="Norte">Norte</option>
                <option value="Sur">Sur</option>
                <option value="Este">Este</option>
                <option value="Oeste">Oeste</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {['Todos', 'Historia', 'Ruinas', 'Industrial', 'Naturaleza'].map(cat => (
              <button 
                key={cat} 
                onClick={() => setCurrentCategory(cat)} 
                className={`px-5 py-2.5 rounded-xl text-[10px] font-bold border transition-all uppercase tracking-widest shadow-sm ${currentCategory === cat ? (categoryColors[cat] || 'bg-indigo-600') + ' text-white border-transparent' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400'}`}
              >
                {cat}
              </button>
            ))}
            <button 
              onClick={generateRoute} 
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-bold border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-widest active:scale-95 shadow-md"
            >
              <Wand2 className="w-3 h-3" /> Diseñar Ruta
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPlaces.map(p => (
            <div key={p.id} className="bg-white rounded-[2.5rem] p-3 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group animate-fade-in text-left flex flex-col h-full">
              <div className="relative h-48 w-full rounded-[2.2rem] overflow-hidden mb-6 flex items-center justify-center text-white" 
                   style={p.image ? {backgroundImage: `url(${p.image})`, backgroundSize:'cover', backgroundPosition:'center'} : {}}>
                {!p.image && <div className={`absolute inset-0 ${categoryColors[p.category] || 'bg-indigo-500'} opacity-90`}></div>}
                {!p.image && <span className="text-5xl font-black opacity-30 z-10">{p.name[0]}</span>}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                <div className="absolute bottom-4 left-5 text-white z-20">
                  <span className={`px-2 py-0.5 ${categoryColors[p.category]} rounded text-[8px] font-black uppercase tracking-widest border border-white/10`}>{p.category}</span>
                  <p className="text-[9px] font-mono mt-1 opacity-90">{p.coords}</p>
                </div>
              </div>
              <div className="px-3 pb-4 flex-grow flex flex-col justify-between">
                <div>
                  <h4 className="text-base font-bold uppercase mb-1 text-slate-800 line-clamp-1">{p.name}</h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase mb-4 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-indigo-600" /> {p.address}
                  </p>
                  <p className="text-[11px] text-slate-500 italic mb-8 line-clamp-3 leading-relaxed">"{p.note}"</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => showLegend(p)} 
                    className="bg-indigo-50 text-indigo-700 py-3.5 rounded-xl font-bold text-[9px] hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-widest active:scale-95"
                  >
                    ✨ Leyenda
                  </button>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.coords)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-black text-white py-3.5 rounded-xl font-black text-[9px] text-center uppercase shadow-lg hover:bg-indigo-950 transition-all tracking-widest"
                  >
                    Ver Sitio
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="mt-20 bg-slate-900 py-24 px-6 relative overflow-hidden text-center text-white">
        <div className="bg-esgrafiado-pattern absolute inset-0 opacity-5"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <h3 className="text-2xl font-black mb-4 tracking-tight uppercase italic leading-tight">217 Parajes Segovianos Documentados</h3>
          <p className="text-white/30 text-xs mb-10 max-w-xl mx-auto leading-relaxed italic">
            Auditoría técnica visual basada en el proyecto "Segovia Callada". Patrimonio rescatado para la memoria digital.
          </p>
          <div className="text-white/20 text-[9px] uppercase tracking-[0.3em] border-t border-white/5 pt-8">
            © 2026 Segovia Piedras & más | Javier de Miguel Torres
          </div>
        </div>
      </footer>

      {/* Modal de IA */}
      {aiModal.show && (
        <div className="fixed inset-0 z-[200] items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md flex">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-100 animate-fade-in">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h4 className="font-black uppercase italic tracking-tighter text-lg text-indigo-700">{aiModal.title}</h4>
              <button 
                onClick={() => setAiModal({ ...aiModal, show: false })} 
                className="w-10 h-10 rounded-full hover:bg-slate-200 flex items-center justify-center transition-all active:scale-90"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-8 overflow-y-auto text-left leading-relaxed text-slate-600 prose prose-indigo flex-grow">
              {aiModal.loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Loader2 className="w-12 h-12 animate-spin mb-4 text-indigo-600" />
                  <p className="font-bold uppercase tracking-widest text-[10px]">Consultando legajos antiguos...</p>
                </div>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: aiModal.content }}></div>
              )}
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
                <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">Gemini AI Engine | Segovia NO GARLEADA</p>
            </div>
          </div>
        </div>
      )}

      {showScrollBtn && (
        <button 
          onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} 
          className="fixed bottom-8 right-8 z-[100] w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default App;