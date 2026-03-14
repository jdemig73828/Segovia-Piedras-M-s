import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { Compass, Map as MapIcon, ArrowDown, ArrowUp, MapPin, Search, Shuffle, BarChart2, X, Info, Castle, Landmark, Factory, Trees, Route, ChevronDown, Heart, ChevronLeft, ChevronRight, Eraser, Menu } from 'lucide-react';

// Cargamos Analytics de forma dinámica
const Analytics = React.lazy(() => 
  import("@vercel/analytics/react")
    .then(mod => ({ default: mod.Analytics }))
    .catch(() => ({ default: () => null }))
);

// Icono personalizado: Silueta andando en 2D (Blanco)
const HikerIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.5 5.5C14.6046 5.5 15.5 4.60457 15.5 3.5C15.5 2.39543 14.6046 1.5 13.5 1.5C12.3954 1.5 11.5 2.39543 11.5 3.5C11.5 4.60457 12.3954 5.5 13.5 5.5Z" fill="white"/>
    <path d="M19 12.5L15 10.5V7.5C15 6.95 14.55 6.5 14 6.5H10C9.45 6.5 9 6.95 9 7.5V12.5L6.5 16.5C6.2 17 6.35 17.65 6.85 17.95C7.35 18.25 8 18.1 8.3 17.6L10.5 14.5H12.5V20.5C12.5 21.05 12.95 21.5 13.5 21.5C14.05 21.5 14.5 21.05 14.5 20.5V13.5L17.5 15C17.7 15.1 17.85 15.15 18 15.15C18.35 15.15 18.7 14.95 18.85 14.65C19.15 14.15 19 13.5 18.5 13.2L16.5 11.8V10.8L19.5 12.3C20 12.55 20.65 12.4 20.95 11.9C21.25 11.4 21.1 10.75 20.6 10.45L15.5 7.9C15.2 7.75 14.85 7.7 14.5 7.75V7.5H10.5V11.5L8.5 14.5" fill="white"/>
  </svg>
);

const categoryColors = {
  'Historia': 'bg-blue-600',
  'Ruinas': 'bg-orange-500',
  'Industrial': 'bg-slate-500',
  'Naturaleza': 'bg-emerald-600', 
  'Todos': 'bg-indigo-600',
  'default': 'bg-indigo-500'
};

const categoryBgColors = {
  'Historia': 'bg-blue-50/50',
  'Ruinas': 'bg-orange-50/50',
  'Industrial': 'bg-slate-50/50',
  'Naturaleza': 'bg-emerald-50/50',
  'default': 'bg-indigo-50/50'
};

const categoryVisualBgs = {
  'Historia': 'bg-blue-100',
  'Ruinas': 'bg-orange-100',
  'Industrial': 'bg-slate-200',
  'Naturaleza': 'bg-emerald-100',
  'default': 'bg-indigo-100'
};

const categoryIconColors = {
  'Historia': 'text-blue-900',
  'Ruinas': 'text-orange-900',
  'Industrial': 'text-slate-900',
  'Naturaleza': 'text-emerald-900',
  'default': 'text-indigo-900'
};

const App = () => {
  const [currentCategory, setCurrentCategory] = useState('Todos');
  const [currentGeoZone, setCurrentGeoZone] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [randomPlace, setRandomPlace] = useState(null);
  const [itinerary, setItinerary] = useState(null);
  const [showCatMenu, setShowCatMenu] = useState(false);
  const [showZoneMenu, setShowZoneMenu] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [showFavsModal, setShowFavsModal] = useState(false);
  const [showPredictive, setShowPredictive] = useState(false);
  const [isHeaderSearchOpen, setIsHeaderSearchOpen] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    document.title = "Rutabia - Crea tus rutas y excursiones locales";
    const handleScroll = () => setShowScrollBtn(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [currentCategory, currentGeoZone, searchTerm]);

  const normalize = (str) => {
    if (!str) return "";
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  };

  const dmsToDec = (dms) => {
    if(!dms) return 0;
    const cleanDms = dms.replace(/\\"/g, '"');
    const matches = cleanDms.match(/(\d+)°(\d+)'([\d.]+)"/);
    if (!matches) return 0;
    const [_, d, m, s] = matches;
    let dec = parseFloat(d) + parseFloat(m)/60 + parseFloat(s)/3600;
    if (cleanDms.includes('W') || cleanDms.includes('S')) dec = -dec;
    return dec;
  };

  const calculateDistance = (coords1, coords2) => {
    const getCoords = (str) => {
        const parts = str.trim().split(/\s+(?=[0-9])/);
        if (parts.length < 2) return [0, 0];
        return [dmsToDec(parts[0]), dmsToDec(parts[1])];
    };
    const [lat1, lon1] = getCoords(coords1);
    const [lat2, lon2] = getCoords(coords2);
    
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180; 
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  const getCardinal = (coords) => {
    const parts = coords.trim().split(/\s+(?=[0-9])/);
    if (parts.length < 2) return "Desconocido";
    const lat = dmsToDec(parts[0]);
    const lon = dmsToDec(parts[1]);
    const centerLat = 41.15; const centerLon = -4.05;
    const latDiff = lat - centerLat; const lonDiff = lon - centerLon;
    if (Math.abs(latDiff) > Math.abs(lonDiff)) return latDiff > 0 ? "Norte" : "Sur";
    return lonDiff > 0 ? "Este" : "Oeste";
  };

  const allPlaces = useMemo(() => [
    { id: 1, name: "ERMITA DE SAN JUAN", category: "Historia", coords: "41°21'33.4\"N 3°51'16.9\"W", address: "VALLE DE TABLADILLO", note: "Pequeño oratorio románico oculto en el profundo valle de tabladillo." },
    { id: 2, name: "CONVENTO DE SANTA ISABEL", category: "Historia", coords: "40°43'03.6\"N 4°14'51.2\"W", address: "EL ESPINAR", note: "Restos históricos del convector del s. XVI de las monjas clarisas." },
    { id: 3, name: "FORTALEZA CASTILLO", category: "Historia", coords: "41°21'13.6\"N 3°53'15.2\"W", address: "CARRASCAL DEL RÍO", note: "Fortaleza dominante sobre el paisaje de las hoces del río Duratón." },
    { id: 4, name: "MOLINO DE LOS MESA", category: "Industrial", coords: "41°12'19.5\"N 3°58'56.7\"W", address: "CABEZUELA", note: "Ingenio harinero tradicional situado en la ribera del río Cega." },
    { id: 5, name: "PUERTA DE LA FUERZA", category: "Historia", coords: "41°18'09.1\"N 3°45'31.9\"W", address: "SEPÚLVEDA", note: "Acceso amurallado histórico de la villa medieval." },
    { id: 6, name: "PESQUERÍAS REALES", category: "Historia", coords: "40°53'25.4\"N 4°01'20.6\"W", address: "VALSAÍN", note: "Senda regia empedrada construida junto al cauce del río Eresma." },
    { id: 7, name: "PALACIO REAL DE VALSAÍN", category: "Historia", coords: "40°52'36.9\"N 4°01'36.3\"W", address: "VALSAÍN", note: "Ruinas del antiguo palacio de recreo de los Austrias." },
    { id: 8, name: "CASA ERASO", category: "Historia", coords: "40°48'22.3\"N 4°03'07.3\"W", address: "VALSAÍN", note: "Edificación ligada históricamente a la gestión de montes y caza real." },
    { id: 9, name: "FÁBRICA DE HARINA LA JULITA", category: "Industrial", coords: "41°09'24.6\"N 4°00'26.2\"W", address: "TURÉGANO", note: "Patrimonio industrial harinero del siglo XX con maquinaria de época." },
    { id: 10, name: "ESTACIÓN APEADERO DE TREN", category: "Industrial", coords: "41°30'10.5\"N 3°32'34.7\"W", address: "MADERUELO", note: "Antigua parada de la línea ferroviaria que conectaba la zona mística." },
    { id: 11, name: "CASA DE LA MÁQUINA DEL PULIMENTO", category: "Industrial", coords: "40°54'46.4\"N 4°00'46.7\"W", address: "LA GRANJA DE SAN ILDEFONSO", note: "Ingenio industrial de la Real Fábrica de Cristales." },
    { id: 12, name: "FÁBRICA DE HARINA MARTÍNEZ", category: "Industrial", coords: "41°13'14.8\"N 4°10'27.6\"W", address: "FUENTEPELAYO", note: "Antiguo complejo harinero representativo de la comarca." },
    { id: 13, name: "PALACIO DE LOS MARQUESES DE AGUILAFUENTE", category: "Historia", coords: "41°13'47.7\"N 4°06'54.3\"W", address: "AGUILAFUENTE", note: "Residencia señorial histórica de gran relevancia arquitectónica." },
    { id: 14, name: "TELÉGRAFO ÓPTICO", category: "Industrial", coords: "41°08'44.9\"N 4°37'36.4\"W", address: "TOLOCIRIO", note: "Torre de comunicación del siglo XIX perteneciente a la línea de Castilla." },
    { id: 15, name: "TELÉGRAFO ÓPTICO", category: "Industrial", coords: "41°03'21.7\"N 4°36'34.2\"W", address: "CODORNIZ", note: "Restos de la infraestructura de telecomunicaciones históricas." },
    { id: 16, name: "FÁBRICA DE HARINA", category: "Industrial", coords: "41°09'36.1\"N 4°29'19.1\"W", address: "NAVA DE LA ASUNCIÓN", note: "Patrimonio industrial ligado a la explotación cerealista." },
    { id: 17, name: "ERMITA DE SANTA ROSALÍA", category: "Historia", coords: "41°13'21.1\"N 4°31'21.2\"W", address: "COCA", note: "Edificación religiosa situada en el entorno histórico de la villa de Coca." },
    { id: 18, name: "ERMITA DE SAN ANDRÉS", category: "Historia", coords: "41°15'25.8\"N 4°09'45.2\"W", address: "ZARZUELA DEL PINAR", note: "Templo románico rodeado de la inmensidad de los pinares." },
    { id: 19, name: "ERMITA DE SAN CEBRIÁN", category: "Historia", coords: "41°15'00.0\"N 4°12'36.7\"W", address: "ZARZUELA DEL PINAR", note: "Pequeño santuario medieval en el corazón de Tierra de Pinares." },
    { id: 20, name: "MOLINO DE MINGELA", category: "Industrial", coords: "41°22'40.9\"N 4°25'54.4\"W", address: "VALLELADO", note: "Antiguo molino situado en la margen del río Cega." },
    { id: 21, name: "MOLINO DE POTRICOS", category: "Industrial", coords: "41°24'02.7\"N 4°07'27.2\"W", address: "PEROSILLO", note: "Ingenio hidráulico histórico preservado en el paisaje rural." },
    { id: 22, name: "MOLINO DEL PINO", category: "Industrial", coords: "41°23'11.3\"N 4°28'40.2\"W", address: "MATA DE CUÉLLAR", note: "Molino harinero tradicional de construcción en piedra." },
    { id: 23, name: "TORREÓN DE SANTA MARÍA", category: "Historia", coords: "41°24'00.1\"N 4°13'24.6\"W", address: "LOVINGOS", note: "Restos de la torre de la antigua iglesia parroquial." },
    { id: 24, name: "MOLINO BATÁN DE GARRIDO", category: "Industrial", coords: "41°17'01.9\"N 4°08'49.1\"W", address: "LASTRAS DE CUÉLLAR", note: "Antiguo batán utilizado para el tratamiento de tujeidos." },
    { id: 25, name: "MOLINO DEL LADRÓN", category: "Industrial", coords: "41°17'24.8\"N 4°09'04.2\"W", address: "LASTRAS DE CUÉLLAR", note: "Construcción hidráulica ssingular en la ribera del cega." },
    { id: 26, name: "FÁBRICA DE HARINA", category: "Industrial", coords: "41°20'52.1\"N 4°07'09.3\"W", address: "HONTALBILLA", note: "Instalación industrial cerealista de principios del siglo XX." },
    { id: 27, name: "IGLESIA DE SAN JUAN BAUTISTA", category: "Historia", coords: "41°24'52.2\"N 4°12'55.3\"W", address: "FUENTES DE CUÉLLAR", note: "Templo que destaca por su volumetría y elementos arquitectónicos." },
    { id: 28, name: "MOLINO DE ALVARADO", category: "Industrial", coords: "41°18'36.8\"N 4°27'30.9\"W", address: "FRESNEDA DE CUÉLLAR", note: "Maquinaria e ingenio harinero típico de la comarca cuellarana." },
    { id: 29, name: "IGLESIA DE SAN BARTOLOMÉ DE POCIAGUE", category: "Ruinas", coords: "41°26'57.6\"N 4°16'22.6\"W", address: "ESCARABAJOSA DE CUÉLLAR", note: "Restos de la iglesia del antiguo despoblado de Pociague." },
    { id: 30, name: "MONASTERIO DE SAN FRANCISCO", category: "Historia", coords: "41°24'07.6\"N 4°18'37.0\"W", address: "CUÉLLAR", note: "Cuna del gótico isabelino y panteón de los Duques de Alburquerque." },
    { id: 31, name: "CONVENTO DE LA SANTÍSIMA TRINIDAD", category: "Historia", coords: "41°23'57.8\"N 4°18'54.4\"W", address: "CUÉLLAR", note: "Antiguo establecimiento religioso de los padres trinitarios." },
    { id: 32, name: "ERMITA DE SAN BENITO", category: "Historia", coords: "41°22'18.3\"N 4°07'20.5\"W", address: "ADRADOS", note: "Lugar de culto histórico en las proximidades del municipio." },
    { id: 33, name: "CERRO DE LAS SERVITONAS", category: "Ruinas", coords: "41°24'19.4\"N 3°57'16.6\"W", address: "SAN MIGUEL DE BERNUY", note: "Asentamiento antiguo con vistas panorámicas al valle del Duratón." },
    { id: 34, name: "MOLINO DE ABAJO Y MOLINO DE ENMEDIO", category: "Industrial", coords: "41°27'02.8\"N 4°04'53.0\"W", address: "MEMBRIBRE DE LA HOZ", note: "Conjunto hidráulico harinero en un entorno natural encajonado." },
    { id: 35, name: "MURALLA Y CASTILLO", category: "Historia", coords: "41°26'21.0\"N 3°58'40.6\"W", address: "FUENTIDUEÑA", note: "Importante conjunto defensivo medieval sobre el cerro." },
    { id: 36, name: "LINARES DEL ARROYO", category: "Ruinas", coords: "41°31'24.9\"N 3°33'23.9\"W", address: "MADERUELO", note: "Pueblo sumergido bajo las aguas del embalse de Linares." },
    { id: 37, name: "IGLESIA DE SAN MARTÍN", category: "Historia", coords: "41°26'21.3\"N 3°58'39.7\"W", address: "FUENTIDUEÑA", note: "Templo románico con elementos defensivos singulares." },
    { id: 38, name: "HOSPITAL DE SANTA MARÍA MAGDALENA", category: "Historia", coords: "41°26'30.5\"N 3°58'52.2\"W", address: "FUENTIDUEÑA", note: "Fundación benéfica medieval de gran interés histórico." },
    { id: 39, name: "ERMITA DE SAN MIGUEL", category: "Historia", coords: "41°29'48.6\"N 3°57'55.2\"W", address: "SACRAMENIA", note: "Joya del románico rural segoviano en un paraje solitario." },
    { id: 40, name: "PALACIO DE LOS CONTRERAS", category: "Historia", coords: "41°29'38.0\"N 4°01'42.0\"W", address: "LAGUNA DE CONTRERAS", note: "Palacio fortificado que conserva su aire de dominio medieval." },
    { id: 41, name: "IGLESIA CONVENTO DE SAN MARTÍN DEL CASUAR", category: "Ruinas", coords: "41°32'44.7\"N 3°35'59.6\"W", address: "MONTEJO DE LA VEGA", note: "Restos del monasterio románico en las Hoces del Riaza." },
    { id: 42, name: "CASTILLO Y MURALLAS", category: "Historia", coords: "41°33'03.9\"N 3°39'16.6\"W", address: "MONTEJO DE LA VEGA", note: "Antigua fortificación defensiva del nordeste segoviano." },
    { id: 43, name: "CASERÍO DE MALUQUE", category: "Ruinas", coords: "41°33'08.3\"N 3°33'17.3\"W", address: "MADERUELO", note: "Asentamiento abandonado que conserva la estructura tradicional." },
    { id: 44, name: "IGLESIA DE NUESTRA SEÑORA DE LA NATIVIDAD", category: "Historia", coords: "41°17'54.8\"N 3°20'22.0\"W", address: "SERRACÍN", note: "Templo emblemático de los pueblos rojos y negros de Segovia." },
    { id: 45, name: "LOS PAREDONES", category: "Ruinas", coords: "41°25'16.0\"N 3°22'23.9\"W", address: "AYLLÓN", note: "Vestigios de antiguas construcciones defensivas de tierra batida." },
    { id: 46, name: "IGLESIA DE SAN MIGUEL ARCÁNGEL", category: "Historia", coords: "41°20'53.2\"N 3°24'31.7\"W", address: "ALDEA LÁZARO RIBOTA", note: "Parroquia medieval destacada en su entorno rural." },
    { id: 47, name: "IGLESIA DE SAN CRISTÓBAL", category: "Historia", coords: "41°19'56.4\"N 3°27'12.5\"W", address: "CINCO VILLAS", note: "Templo románico de gran sobriedad en la campiña." },
    { id: 48, name: "IGLESIA DE SAN JUAN", category: "Historia", coords: "41°23'06.5\"N 3°31'53.6\"W", address: "CASTILTIERRA", note: "Iglesia ligada a la famosa necrópolis visigoda de Castiltierra." },
    { id: 49, name: "IGLESIA DE SAN ANTONIO", category: "Historia", coords: "41°20'12.7\"N 3°32'39.4\"W", address: "ALDEANUEVA DEL MONTE", note: "Muestra arquitectónica religiosa del área de influencia de Riaza." },
    { id: 50, name: "LA MOLINILLA Y ERMITA DE LA VIRGEN DE LA CALLEJA", category: "Historia", coords: "41°17'52.6\"N 3°51'59.6\"W", address: "VILLASECA", note: "Paraje místico cercano a las hoces del río Duratón." },
    { id: 51, name: "MONASTERIO DE SANTO TOMÉ DEL PUERTO", category: "Ruinas", coords: "41°11'56.8\"N 3°35'24.7\"W", address: "VILLAREJO", note: "Restos monásticos situados estratégicamente en el puerto." },
    { id: 52, name: "IGLESIA DE NUESTRA SEÑORA DE LA SERNA", category: "Historia", coords: "41°16'02.5\"N 3°43'05.9\"W", address: "VELOSILLO", note: "Edificación románica de gran encanto en el altiplano segoviano." },
    { id: 53, name: "MOLINO DE SAN JUAN", category: "Historia", coords: "41°15'52.9\"N 3°50'53.2\"W", address: "VALDESIMONTE", note: "Molino harinero restaurado que aprovecha el cauce del San Juan." },
    { id: 54, name: "LAVADERO DE LANAS DE LA ALDEA LA PEÑA", category: "Industrial", coords: "41°12'17.8\"N 3°37'20.7\"W", address: "SIGUERO", note: "Muestra de la antigua importancia de la trashumancia y el esquileo." },
    { id: 55, name: "MOLINO DE LA OCECILLA", category: "Industrial", coords: "41°18'37.0\"N 3°43'45.2\"W", address: "SEPÚLVEDA", note: "Maquinaria hidráulica tradicional en el entorno de la villa sepulvedana." },
    { id: 56, name: "IGLESIA DE SAN MILLÁN", category: "Historia", coords: "41°18'03.3\"N 3°44'57.0\"W", address: "SEPÚLVEDA", note: "Antiguo templo que forma parte del conjunto monumental de Sepúlveda." },
    { id: 57, name: "PALACIO Y DESPOBLADO DE SAN MIGUEL DE NEGUERA", category: "Ruinas", coords: "41°16'49.5\"N 3°50'32.9\"W", address: "SEBÚLCOR", note: "Villa señorial abandonada a orillas del Duratón." },
    { id: 58, name: "CONVENTO DE LA HOZ", category: "Ruinas", coords: "41°18'49.5\"N 3°52'19.5\"W", address: "SEBÚLCOR", note: "Impresionantes ruinas monásticas sobre el cauce del Duratón." },
    { id: 59, name: "ERMITA DE SANTIAGO DE REBOLLO", category: "Historia", coords: "41°12'30.7\"N 3°48'46.6\"W", address: "SAN PEDRO DE GAÍLLOS", note: "Santuario rural de devoción popular local." },
    { id: 60, name: "PALACIO DEL MARQUÉS REVILLA", category: "Historia", coords: "41°24'49.5\"N 3°45'03.6\"W", address: "NAVARES DE LAS CUEVAS", note: "Grandeza señorial en una de las comarcas más auténticas de Segovia." },
    { id: 61, name: "DESPOBLADO DE MATANDRINO", category: "Ruinas", coords: "41°09'00.5\"N 3°42'37.0\"W", address: "PRÁDENA", note: "Aldea deshabitada que conserva el alma de la Segovia de antaño." },
    { id: 62, name: "IGLESIA DE SAN MIGUEL", category: "Historia", coords: "41°20'37.6\"N 3°51'58.6\"W", address: "FRESNEDA DE SEPÚLVEDA", note: "Parroquia rural de origen medieval en la tierra de Sepúlveda." },
    { id: 63, name: "DESPOBLADO DE VILLAREJO", category: "Ruinas", coords: "41°17'54.7\"N 3°40'32.6\"W", address: "EL OLMO", note: "Vestigios de un antiguo núcleo de población hoy desaparecido." },
    { id: 64, name: "DESPOBLADO DE CORRALEJO", category: "Ruinas", coords: "41°17'46.5\"N 3°38'34.4\"W", address: "EL OLMO", note: "Huellas de la historia rural en el campo segoviano." },
    { id: 65, name: "ERMITA DE SAN LORENZO", category: "Historia", coords: "41°19'25.0\"N 3°42'12.3\"W", address: "EL OLMILLO", note: "Pequeño templo románico de gran sencillez y belleza." },
    { id: 66, name: "CASA PALACIO DE LOS MARQUESES DE CASTROSERNA", category: "Historia", coords: "41°11'23.5\"N 3°42'54.2\"W", address: "CASTROSERNA DE ARRIBA", note: "Edificio señorial representativo de la nobleza segoviana." },
    { id: 67, name: "ERMITA DE SAN JULIÁN", category: "Historia", coords: "41°17'51.6\"N 3°47'00.3\"W", address: "CASTRILLO DE SEPÚLVEDA", note: "Lugar de culto tradicional en un entorno paisajístico privilegiado." },
    { id: 68, name: "MOLINO HARINERO", category: "Industrial", coords: "41°21'52.2\"N 3°53'57.7\"W", address: "CARRASCAL DEL RÍO", note: "Ejemplo de la industria molinera fluvial del Duratón." },
    { id: 69, name: "FÁBRICA DE RESINA", category: "Industrial", coords: "41°14'12.5\"N 3°55'35.4\"W", address: "CABEZUELA", note: "Patrimonio industrial ligado a la explotación de los pinos." },
    { id: 70, name: "MOLINO DE LA CERQUILLA", category: "Industrial", coords: "41°21'48.4\"N 3°49'38.3\"W", address: "BARRIO DE ARRIBA", note: "Ingenio harinero situado en un paraje de gran valor geológico." },
    { id: 71, name: "DESPOBLADO DE ALDEARRASO", category: "Ruinas", coords: "41°14'06.7\"N 3°48'12.7\"W", address: "SAN PEDRO DE GAÍLLOS", note: "Restos de población en una zona de pastos tradicionales." },
    { id: 72, name: "ERMITA DE SAN PEDRO", category: "Historia", coords: "41°07'54.4\"N 3°54'39.0\"W", address: "VALDEVACAS Y GUIJAR", note: "Antiguo oratorio rural en un entorno de naturaleza virgen." },
    { id: 73, name: "IGLESIA DE SAN JUSTO Y PASTOR", category: "Historia", coords: "41°05'10.9\"N 3°52'45.0\"W", address: "SANTIUSTE DE PEDRAZA", note: "Parroquia románica destacada por su torre-atalaya." },
    { id: 74, name: "ERMITA DE NUESTRA SEÑORA EL ESPINO", category: "Historia", coords: "41°11'32.9\"N 3°50'58.0\"W", address: "REBOLLO", note: "Santuario rodeado de robles y leyendas locales." },
    { id: 75, name: "IGLESIA DE SANTA MARÍA", category: "Historia", coords: "41°07'55.0\"N 3°48'45.6\"W", address: "PEDRAZA", note: "Iglesia que preside la famosa plaza mayor de la villa de Pedraza." },
    { id: 76, name: "IGLESIA DEL ESPÍRITU SANTO", category: "Historia", coords: "41°09'14.6\"N 3°46'56.9\"W", address: "OREJANILLA", note: "Templo característico del románico de porticada segoviano." },
    { id: 77, name: "DESPOBLADO DE la ALAMEDA", category: "Ruinas", coords: "41°09'37.4\"N 3°48'08.5\"W", address: "LA ALAMEDA", note: "Lugar abandonado que evoca el pasado místico de la zona." },
    { id: 78, name: "TORREGIL", category: "Historia", coords: "41°04'57.5\"N 3°47'23.0\"W", address: "GALLEGOS", note: "Atalaya defensiva estratégica con amplias vistas de la sierra." },
    { id: 79, name: "MONASTERIO DE SANTA MARÍA DE LA SIERRA", category: "Ruinas", coords: "41°01'37.1\"N 3°54'46.2\"W", address: "COLLADO HERMOSO", note: "Restos cistercienses integrados en el paisaje montañoso." },
    { id: 80, name: "ESTACIÓN DE TREN", category: "Industrial", coords: "41°04'28.1\"N 4°16'15.8\"W", address: "YANGUAS DE ERESMA", note: "Arquitectura ferroviaria de principios del siglo XX." },
    { id: 81, name: "ERMITA DE SAN ANDRÉS", category: "Historia", coords: "40°48'54.8\"N 4°26'47.0\"W", address: "VILLACASTÍN", note: "Templo histórico situado en el cruce de caminos reales." },
    { id: 82, name: "ERMITA DE SANMEDEL", category: "Historia", coords: "41°00'03.8\"N 4°08'27.4\"W", address: "VALSECA", note: "Santuario rural representativo de la devoción agraria." },
    { id: 83, name: "CASERÍO DE COVATILLAS", category: "Historia", coords: "41°05'28.2\"N 4°04'17.5\"W", address: "TORREIGLESIAS", note: "Conjunto arquitectónico tradicional de la campiña segoviana." },
    { id: 84, name: "MOLINO DE CAVILA", category: "Industrial", coords: "40°57'16.0\"N 4°06'48.1\"W", address: "SEGOVIA", note: "Ingenio harinero a las afueras de la capital." },
    { id: 85, name: "FÁBRICA DE TEJAS Y LADRILLOS", category: "Industrial", coords: "40°55'17.6\"N 4°07'31.9\"W", address: "SEGOVIA", note: "Muestra de la industria cerámica tradicional segoviana." },
    { id: 86, name: "CONVENTO DE SAN AGUSTÍN", category: "Ruinas", coords: "40°57'03.2\"N 4°07'08.2\"W", address: "SEGOVIA", note: "Restos del antiguo convector extramuros de la ciudad." },
    { id: 87, name: "PALACIO DE LOS MARQUESES DE CASABLANCA", category: "Historia", coords: "41°11'43.3\"N 4°04'01.4\"W", address: "SAUQUILLO DE CABEZAS", note: "Gran residencia nobiliaria en medio de las tierras de cereal." },
    { id: 88, name: "RANCHO DE ALFARO", category: "Industrial", coords: "41°00'16.5\"N 3°57'25.1\"W", address: "SANTO DOMINGO DE PIRÓN", note: "Esquileo tradicional y finca ganadera histórica." },
    { id: 89, name: "ESQUILEO DE SANTILLANA", category: "Industrial", coords: "40°53'17.2\"N 4°04'04.3\"W", address: "REVENGA", note: "Centro neurálgico de la industria de la industria de la lana en el siglo XVIII." },
    { id: 90, name: "PALACIO DE LOS OSORIO PARADINAS", category: "Historia", coords: "41°00'42.0\"N 4°23'22.7\"W", address: "SANTA MARÍA LA REAL DE NIEVA", note: "Edificación señorial con gran escudo heráldico." },
    { id: 91, name: "FÁBRICA DE PASTA DE PAPEL", category: "Industrial", coords: "40°55'58.0\"N 4°04'19.0\"W", address: "PALAZUELOS DE ERESMA", note: "Complejo industrial movido por las aguas del río Eresma." },
    { id: 92, name: "ERMITA DE SAN PEDRO DE ACEDOS Y CASERÍO", category: "Ruinas", coords: "40°55'43.9\"N 4°29'30.0\"W", address: "MUÑOPEDRO", note: "Poblado abandonado que conserva la estructura eclesial." },
    { id: 93, name: "ESTACIÓN DE TREN", category: "Industrial", coords: "41°05'04.1\"N 4°23'44.2\"W", address: "ORTIGOSA DE PESTAÑO", note: "Antigua parada ferroviaria de la línea Segovia-Medina." },
    { id: 94, name: "FÁBRICA DE ACHICORIA LA MAESTRA", category: "Industrial", coords: "41°11'13.6\"N 4°26'09.6\"W", address: "NAVAS DE ORO", note: "Emblemática fábrica de la industria resinera." },
    { id: 95, name: "RANCHO DE ESQUILEO Y LAVADERO", category: "Industrial", coords: "40°50'37.7\"N 4°10'25.9\"W", address: "ORTIGOSA DEL MONTE", note: "Importante complejo lanero del patrimonio industrial serrano." },
    { id: 96, name: "ERMITA Y CASERÍO DE BERNUY DE PÁRRACES", category: "Historia", coords: "40°54'56.5\"N 4°23'27.3\"W", address: "MARUGÁN", note: "Santuario y asentamiento tradicional segoviano." },
    { id: 97, name: "MOLINO DE LA IRVIENZA Y PUENTE DEL NARANJO", category: "Industrial", coords: "40°59'52.4\"N 4°32'17.2\"W", address: "MARTÍN MUÑOZ DE LAS POSADAS", note: "Conjunto hidráulico sobre el río Voltoya." },
    { id: 98, name: "VENTA DE LUMBRERAS", category: "Historia", coords: "40°53'30.1\"N 4°19'22.1\"W", address: "LASTRAS DEL POZO", note: "Antiguo parador de viajeros en la vía real." },
    { id: 99, name: "ERMITA DE SANTA INÉS", category: "Historia", coords: "41°06'46.5\"N 4°19'26.3\"W", address: "BERNARDOS", note: "Capilla románica rodeada de las famosas canteras de pizarra." },
    { id: 100, name: "IGLESIA DE NUESTRA SEÑORA DE LA ASUNCIÓN Y DESPOBLADO", category: "Ruinas", coords: "41°07'34.7\"N 4°17'35.6\"W", address: "FUENTES", note: "Restos del núcleo primitivo de población de Fuentes." },
    { id: 101, name: "ERMITA DE NUESTRA SEÑORA EL LOSA", category: "Historia", coords: "40°46'20.0\"N 4°15'02.1\"W", address: "EL ESPINAR", note: "Lugar de peregrinación tradicional en la sierra." },
    { id: 102, name: "CASA PALACIO DEL MARQUÉS DE PERALES", category: "Historia", coords: "40°43'12.1\"N 4°14'50.1\"W", address: "EL ESPINAR", note: "Ejemplo destacado de arquitectura civil nobiliaria." },
    { id: 103, name: "FÁBRICA DE MADERA", category: "Industrial", coords: "40°44'26.8\"N 4°11'24.1\"W", address: "LA ESTACIÓN DEL ESPINAR", note: "Arquitectura industrial maderera del entorno de la sierra." },
    { id: 104, name: "LA VENTA GRANDE", category: "Historia", coords: "40°44'35.0\"N 4°16'19.7\"W", address: "EL ESPINAR", note: "Histórico establecimiento de hospedaje en el puerto del Guadarrama." },
    { id: 105, name: "CASA ARMADA DEL MARQUÉS DEL ARCO", category: "Historia", coords: "41°04'41.0\"N 4°19'05.1\"W", address: "ARMUÑA", note: "Finca señorial con torre de vigilancia histórica." },
    { id: 106, name: "IGLESIA DE LA VIRGEN DE AGEJAS", category: "Ruinas", coords: "41°03'19.7\"N 4°05'47.8\"W", address: "CABAÑA DE POLENDOS", note: "Restos de la iglesia del antiguo despoblado de Agejas." },
    { id: 107, name: "MOLINO DEL PUENTE", category: "Industrial", coords: "41°08'56.7\"N 4°20'02.1\"W", address: "BERNARDOS", note: "Antiguo ingenio hidráulico para molienda de cereal." },
    { id: 108, name: "ERMITA DE SAN TA ÁGUEDA", category: "Historia", coords: "41°10'10.4\"N 4°18'14.4\"W", address: "CARBONERO EL MAYOR", note: "Santuario de gran devoción popular en la comarca." },
    { id: 109, name: "ERMITA DE SAN ISIDRO", category: "Historia", coords: "41°06'26.3\"N 4°22'07.0\"W", address: "DOMINGO GARCÍA", note: "Templo situado cerca de la zona de los grabados rupestres." },
    { id: 110, name: "ERMITA DE SAN MIGUEL DE QUINTANAS", category: "Historia", coords: "41°10'43.1\"N 4°15'22.8\"W", address: "CARBONERO EL MAYOR", note: "Vestigio religioso de antiguos asentamientos." },
    { id: 111, name: "ESTACIÓN DE TREN", category: "Industrial", coords: "40°59'21.1\"N 4°12'31.0\"W", address: "HONTANARES DE ERESMA", note: "Edificación típica de la red ferroviaria histórica." },
    { id: 112, name: "DESPOBLADO DE GUIJASALBAS", category: "Ruinas", coords: "40°49'09.4\"N 4°16'47.8\"W", address: "VALDEPRADOS", note: "Aldea abandonada que conserva el trazado de sus calles y cimientos." },
    { id: 113, name: "ERMITA DE SANTA JUSTA Y SANTA RUFINA", category: "Historia", coords: "41°09'54.8\"N 3°50'38.7\"W", address: "PAJARES DE PEDRAZA", note: "Pequeña iglesia de piedra en un entorno natural." },
    { id: 114, name: "MOLINO ALDEASÁS", category: "Industrial", coords: "41°03'44.1\"N 3°57'15.1\"W", address: "TURÉGANO", note: "Maquinaria hidráulica tradicional de la zona de Turégano." },
    { id: 115, name: "MOLINO DE CALDILLAS", category: "Industrial", coords: "41°05'23.1\"N 4°17'21.9\"W", address: "ARMUÑA", note: "Molino harinero situado en la ribera del río Eresma." },
    { id: 116, name: "FÁBRICA DE MANTAS LA CONSTANZA", category: "Industrial", coords: "41°08'01.7\"N 4°20'57.9\"W", address: "BERNARDOS", note: "Referente del patrimonio industrial textil de Segovia." },
    { id: 117, name: "MOLINO BERROCAL", category: "Industrial", coords: "41°04'17.5\"N 3°58'20.1\"W", address: "TURÉGANO", note: "Construcción fabril rodeada de leyendas de molineros." },
    { id: 118, name: "FÁBRICAS DE HARINAS Y DE LUZ", category: "Industrial", coords: "41°07'19.9\"N 4°18'24.1\"W", address: "CARBONERO EL MAYOR", note: "Instalaciones que proveyeron de luz y harina a la villa." },
    { id: 119, name: "EL MOLINO DE LA VILLA", category: "Industrial", coords: "40°44'54.4\"N 4°13'44.9\"W", address: "EL ESPINAR", note: "Molino histórico de titularidad municipal." },
    { id: 120, name: "MOLINO DE LOS FRAILES", category: "Industrial", coords: "41°06'21.4\"N 4°08'46.0\"W", address: "ESCOBAR DE POLENDOS", note: "Antiguo molino propiedad de estamentos religiosos." },
    { id: 121, name: "ERMITA DE SAN MIGUEL", category: "Historia", coords: "40°53'47.3\"N 4°12'45.2\"W", address: "FUENTEMILANOS", note: "Lugar místico de oración en el llano segoviano." },
    { id: 122, name: "MOLINO", category: "Industrial", coords: "41°00'36.7\"N 4°28'33.0\"W", address: "HOYUELOS", note: "Importante muestra de ingeniería hidráulica rural." },
    { id: 123, name: "ERMITA DE SAN TA ELENA", category: "Historia", coords: "40°48'43.6\"N 4°21'50.4\"W", address: "ITUERO Y LAMA", note: "Santuario románico con excelentes vistas a la sierra." },
    { id: 124, name: "CASERÍO EL SALVADOR", category: "Ruinas", coords: "40°57'16.9\"N 4°31'45.1\"W", address: "JEMENUÑO", note: "Antigua finca ganadera de gran extensión." },
    { id: 125, name: "ERMITA DE LA VIRGEN DE CEPONES", category: "Historia", coords: "40°50'25.1\"N 4°08'47.9\"W", address: "LA LOSA", note: "Lugar de culto situado en las faldas de la sierra." },
    { id: 126, name: "CASERÍO DE REDONDA EL NUEVO", category: "Historia", coords: "40°55'41.6\"N 4°21'54.1\"W", address: "MARAZOLEJA", note: "Finca de labranza tradicional con arquitectura típica de ladrillo." },
    { id: 127, name: "ERMITA DE NUESTRA SEÑORA EL ESPINO", category: "Historia", coords: "40°58'07.9\"N 4°33'23.5\"W", address: "MARTÍN MUÑOZ DE LAS POSADAS", note: "Santuario de gran tradición mística y literaria." },
    { id: 128, name: "TEJARES", category: "Industrial", coords: "41°03'08.5\"N 4°27'59.0\"W", address: "MELQUE DE CERCOS", note: "Instalaciones artesanales para la fabricación de tejas." },
    { id: 129, name: "TELÉGRAFO ÓPTICO", category: "Industrial", coords: "40°44'34.0\"N 4°18'01.0\"W", address: "NAVAS DE SAN ANTONIO", note: "Torre vigía de la antigua red de comunicaciones." },
    { id: 130, name: "DESPOBLADO DE HERREROS", category: "Ruinas", coords: "40°48'25.4\"N 4°13'51.4\"W", address: "OTERO DE HERREROS", note: "Restos de población de tradición metalúrgica." },
    { id: 131, name: "MOLINO DE GAMONES", category: "Industrial", coords: "40°55'39.2\"N 4°01'40.4\"W", address: "PALAZUELOS DE ERESMA", note: "Molino que aprovechaba la fuerza del río Eresma." },
    { id: 132, name: "VENTA DE GUEDÁN", category: "Historia", coords: "40°55'58.2\"N 4°09'03.2\"W", address: "PEROGORDO", note: "Posada histórica fundamental en la antigua red de transportes." },
    { id: 133, name: "CASA DEL TÍO GITANO", category: "Naturaleza", coords: "41°11'24.0\"N 4°12'28.6\"W", address: "PINAR NEGRILLO", note: "Lugar ssingular envuelto en mitos y leyendas locales." },
    { id: 134, name: "ESQUILEO DE BURGOS Y PUENTE", category: "Industrial", coords: "40°52'12.8\"N 4°06'20.1\"W", address: "REVENGA", note: "Importante infraestructura de la Mesta." },
    { id: 135, name: "CASA DE LOS BUITRAGO", category: "Historia", coords: "40°56'39.0\"N 4°06'55.6\"W", address: "SEGOVIA", note: "Palacio urbano de gran relevancia histórica." },
    { id: 136, name: "CASERÍO DEL TERMINILLO", category: "Historia", coords: "40°57'39.5\"N 4°06'29.6\"W", address: "SEGOVIA", note: "Compleplejo rural típico de las cercanías de la ciudad." },
    { id: 137, name: "PUENTE DEL TESORO", category: "Naturaleza", coords: "40°55'45.0\"N 4°10'54.9\"W", address: "TORREDONDO", note: "Puente envuelto en leyendas de ocultamientos históricos." },
    { id: 138, name: "ESQUILEO DEL PAULAR", category: "Industrial", coords: "40°57'54.3\"N 4°02'15.6\"W", address: "TRESCASAS", note: "Uno de los complejos de esquileo más grandes de la sierra." },
    { id: 139, name: "MOLINO DE LOBONES", category: "Industrial", coords: "40°58'12.5\"N 4°12'00.5\"W", address: "VALVERDE DEL MAJANO", note: "Molino situado cerca de la emblemática Quinta de Lobones." },
    { id: 140, name: "VENTA DE LOBONES", category: "Historia", coords: "40°57'59.7\"N 4°12'17.1\"W", address: "VALVERDE DEL MAJANO", note: "Histórico alto en el camino del río Eresma." },
    { id: 141, name: "HORNOS DE CAL DEL ZANCAO", category: "Industrial", coords: "40°47'22.4\"N 4°16'40.0\"W", address: "VEGAS DE MATUTE", note: "Instalaciones para la producción artesanal de cal." },
    { id: 142, name: "DESPOBLADO DE NAVALAVIGA", category: "Ruinas", coords: "40°41'20.7\"N 4°24'29.5\"W", address: "VILLACASTÍN", note: "Punto de paso clave en las cañadas reales de la Mesta." },
    { id: 143, name: "LAS FALSAS", category: "Industrial", coords: "40°46'32.1\"N 4°24'32.3\"W", address: "VILLACASTÍN", note: "Infraestructura lanera fundamental para la comarca." },
    { id: 144, name: "CASA DEL ZORRO KLIM", category: "Historia", coords: "40°57'14.4\"N 4°10'45.2\"W", address: "ZAMARRAMALA", note: "Lugar ligado a personajes históricos del siglo XX." },
    { id: 145, name: "CHOZO DE LA PORTERA DE LA DEHESA", category: "Historia", coords: "41°02'35.4\"N 3°47'43.4\"W", address: "ALDEALENGUA DE PEDRAZA", note: "Arquitectura tradicional de pastores perfectamente conservada." },
    { id: 146, name: "MOLINO DE LOS GORICHES", category: "Industrial", coords: "41°10'43.1\"N 3°53'10.3\"W", address: "ARVALILLO DE CEGA", note: "Molino que dominaba el cauce del río Cega en su zona media." },
    { id: 147, name: "FÁBRICA DE LUZ", category: "Industrial", coords: "41°02'18.1\"N 3°49'29.7\"W", address: "NAVAFRÍA", note: "Antigua central hidroeléctrica que modernizó la zona." },
    { id: 148, name: "PRESA Y MOLINO CASTELLANOS", category: "Industrial", coords: "41°04'36.6\"N 3°50'11.0\"W", address: "NAVAFRÍA", note: "Complejo hidráulico de gran importancia local." },
    { id: 149, name: "ERMITA DE SAN NICOLÁS", category: "Historia", coords: "41°09'03.2\"N 3°47'10.5\"W", address: "OREJANA", note: "Templo románico rodeado de misterios de la zona mística." },
    { id: 150, name: "LA TEJERA DE RAMÓN MARTÍN", category: "Industrial", coords: "41°05'24.5\"N 3°51'18.1\"W", address: "VALLE DE SAN PEDRO", note: "Instalaciones artesanales de elaboración de tejas." },
    { id: 151, name: "DESPOBLADO DE ALDEALAFUENTE", category: "Ruinas", coords: "41°14'19.8\"N 3°48'45.5\"W", address: "ALDEALAFUENTE", note: "Huellas de la vida rural medieval desaparecida." },
    { id: 152, name: "ERMITA DE SAN VALENTÍN", category: "Historia", coords: "41°19'31.7\"N 3°52'49.4\"W", address: "BURGOMILLODO", note: "Capilla aislada en el espectacular paisaje del Duratón." },
    { id: 153, name: "ERMITA DE SANTA ENGRACIA", category: "Historia", coords: "41°19'15.9\"N 3°52'17.7\"W", address: "BURGOMILLODO", note: "Santuario románico con el que soñaban los reyes." },
    { id: 154, name: "MOLINO DE MESA", category: "Industrial", coords: "41°12'21.1\"N 3°58'55.3\"W", address: "CABEZUELA", note: "Ingenio harinero del Cega rodeado de frondosa vegetación." },
    { id: 155, name: "CASILLA DE PEÓN CAMINERO 3", category: "Historia", coords: "41°16'56.8\"N 3°36'09.5\"W", address: "CASTILLEJO DE MESLEÓN", note: "Legado arquitectónico de la red de carreteras del siglo XIX." },
    { id: 156, name: "TENADAS DE SAN GREGORIO", category: "Historia", coords: "41°24'09.3\"N 3°46'59.0\"W", address: "CASTRO SERRACÍN", note: "Arquitectura pastoril característica del nordeste de la provincia." },
    { id: 157, name: "ERMITA", category: "Historia", coords: "41°13'12.4\"N 3°35'45.7\"W", address: "CEREZO DE ABAJO", note: "Edificación religiosa sencilla pero de gran valor etnográfico." },
    { id: 158, name: "DESPOBLADO DE CORRAL DE DURATÓN", category: "Ruinas", coords: "41°17'17.5\"N 3°41'45.0\"W", address: "CORRAL DE DURATÓN", note: "Restos de población cercanos al cauce del río místico." },
    { id: 159, name: "ERMITA DE SAN ROQUE", category: "Historia", coords: "41°22'24.6\"N 3°39'56.1\"W", address: "ENCINAS", note: "Oratorio místico rodeado de encinas centenarias." },
    { id: 160, name: "FÁBRICA DE HARINAS Y VIVIENDA", category: "Industrial", coords: "41°17'49.5\"N 3°55'56.5\"W", address: "FUENTE REBOLLO", note: "Compleplejo fabril harinero muy bien conservado." },
    { id: 161, name: "LA CASETA DEL VAQUERO", category: "Naturaleza", coords: "41°20'26.6\"N 3°58'05.7\"W", address: "NAVALILLA", note: "Pequeño refugio de pastores en el entorno natural de Navalilla." },
    { id: 162, name: "MOLINOS", category: "Industrial", coords: "41°24'05.6\"N 3°44'25.0\"W", address: "NAVARES DE ENMEDIO", note: "Ingenios hidráulicos muy relevante." },
    { id: 163, name: "COLMENARES", category: "Industrial", coords: "41°24'26.7\"N 3°44'47.4\"W", address: "NAVARES DE LAS CUEVAS", note: "Arquitectura tradicional para la explotación de la miel." },
    { id: 164, name: "DESPOBLADO DE CABRERIZOS", category: "Ruinas", coords: "41°12'55.6\"N 3°39'58.3\"W", address: "SANTA MARTA DEL CERRO", note: "Aldea mística que hoy permanece en el recuerdo." },
    { id: 165, name: "ESTACIÓN DE TREN", category: "Industrial", coords: "41°10'50.4\"N 3°33'48.3\"W", address: "SANTO TOMÉ DEL PUERTO", note: "Estructura ferroviaria en la falda de Somosierra." },
    { id: 166, name: "DESPOBLADO DE CASABLANCA", category: "Ruinas", coords: "41°17'36.1\"N 3°50'43.9\"W", address: "SEBÚLCOR", note: "Lugar inhóhóspito que guarda secretos de antiguos pobladores." },
    { id: 167, name: "FÁBRICA DE LUZ", category: "Industrial", coords: "41°17'42.8\"N 3°45'47.9\"W", address: "SEPÚLVEDA", note: "Importante obra de ingeniería industrial para la villa." },
    { id: 168, name: "MOLINO DE LAS CANALEJAS", category: "Industrial", coords: "41°18'14.0\"N 3°45'44.7\"W", address: "SEPÚLVEDA", note: "Molino que aprovechaba las aguas del río Caslilla." },
    { id: 169, name: "PUENTE DE TALCANO", category: "Historia", coords: "41°17'42.9\"N 3°45'53.8\"W", address: "SEPÚLVEDA", note: "Puente medieval icónico en la entrada de las Hoces del Duratón." },
    { id: 170, name: "APEADERO DE TREN", category: "Industrial", coords: "41°19'54.3\"N 3°36'00.3\"W", address: "TURRUBUELO", note: "Antigua parada de la línea ferroviaria hoy en desuso." },
    { id: 171, name: "DESPOBLADO DE BÁLSAMOS", category: "Ruinas", coords: "41°21'28.1\"N 3°43'44.0\"W", address: "URUEÑAS", note: "Asentamiento rural del pasado místico segoviano." },
    { id: 172, name: "LA CASITA ALTA", category: "Naturaleza", coords: "41°21'20.3\"N 3°49'23.2\"W", address: "VALLE DEL TABLADILLO", note: "Lugar de retiro y vistas privilegiadas al valle segoviano." },
    { id: 173, name: "TEJERAS", category: "Industrial", coords: "41°21'28.3\"N 3°29'22.0\"W", address: "FRESNO DE CANTESPINO", note: "Legado de la producción cerámica artesanal." },
    { id: 174, name: "CONVENTO DE SAN FRANCISCO", category: "Ruinas", coords: "41°25'37.8\"N 3°22'52.3\"W", address: "AYLLÓN", note: "Ruinas majestuosas del convector que visitó San Francisco." },
    { id: 175, name: "MOLINO SERNA Y DEL VADO", category: "Industrial", coords: "41°27'19.4\"N 3°27'59.0\"W", address: "ALDEALENGUA DE SANTA MARÍA", note: "Complejo de molienda en el noreste de la provincia." },
    { id: 176, name: "ESTACIÓN DE TREN", category: "Industrial", coords: "41°25'49.6\"N 3°32'34.9\"W", address: "CAMPO DE SAN PEDRO", note: "Punto de conexión fundamental de la línea de Castilla." },
    { id: 177, name: "MOLINO DE ARRIBA Y ABAJO", category: "Industrial", coords: "41°26'01.3\"N 3°40'28.5\"W", address: "CARABIAS", note: "Dos molinos históricos situados en el mismo arroyo." },
    { id: 178, name: "ERMITA DE SAN JUAN", category: "Historia", coords: "41°25'03.5\"N 3°35'56.4\"W", address: "CEDILLO DE LA TORRE", note: "Templo románico con elementos defensivos singulares." },
    { id: 179, name: "CANTERAS", category: "Industrial", coords: "41°32'22.8\"N 3°33'29.7\"W", address: "MADERUELO", note: "Explotación histórica de piedra para la villa." },
    { id: 180, name: "ERMITA DE SANTA COLOMA", category: "Historia", coords: "41°29'18.2\"N 3°31'22.4\"W", address: "MADERUELO", note: "Joya mística situada junto al embalse de Linares." },
    { id: 181, name: "ERMITA DE VALDEPERAL", category: "Historia", coords: "41°30'46.2\"N 3°25'39.4\"W", address: "MADERUELO", note: "Lugar de culto y peregrinación mística en el nordeste." },
    { id: 182, name: "CASILLA DE PEÓN CAMINERO 8", category: "Historia", coords: "41°30'31.8\"N 3°42'50.6\"W", address: "HONRUBIA DE LA CUESTA", note: "Casa de servicio de carreteras del siglo XIX." },
    { id: 183, name: "MOLINO DE ARRIBA DE LOS REGUEROS", category: "Industrial", coords: "41°28'22.9\"N 3°47'11.0\"W", address: "ALDEANUEVA DE LA SERREZUELA", note: "Ingenio harinero en un entorno agreste." },
    { id: 184, name: "EL PAREDÓN DE SAN FÉLIX", category: "Ruinas", coords: "41°29'56.8\"N 3°46'43.0\"W", address: "ALDEHORNO", note: "Restos legendarios de un antiguo santuario medieval." },
    { id: 185, name: "LAGARES", category: "Industrial", coords: "41°30'57.1\"N 3°46'46.2\"W", address: "ALDEHORNO", note: "Prensas tradicionales para la elaboración del vino." },
    { id: 186, name: "ERMITA DEL SANTO CRISTO", category: "Historia", coords: "41°23'03.5\"N 3°55'39.8\"W", address: "COBOS DE FUENTIDUEÑA", note: "Lugar de devoción mística segoviana auténtica." },
    { id: 187, name: "CASTILLO", category: "Historia", coords: "41°32'36.1\"N 3°57'41.0\"W", address: "CUEVAS DE PROVANCO", note: "Fortaleza defensiva con vistas estratégicas al valle." },
    { id: 188, name: "LAGARES", category: "Industrial", coords: "41°32'40.5\"N 3°57'39.7\"W", address: "CUEVAS DE PROVANCO", note: "Complejo de bodegas y prensas históricas." },
    { id: 189, name: "ERMITA DE SAN MIGUEL", category: "Historia", coords: "41°22'48.0\"N 3°59'37.4\"W", address: "FUENTE EL OLMO", note: "Capilla románica muy querida por la población." },
    { id: 190, name: "MONASTERIO DE FRAILES", category: "Ruinas", coords: "41°25'30.1\"N 4°03'46.0\"W", address: "FUENTESAÚCO", note: "Restos monásticos rodeados de tierras de labor." },
    { id: 191, name: "ERMITA DE SAN GREGORIO", category: "Historia", coords: "41°27'21.4\"N 3°55'10.0\"W", address: "FUENTESOTO", note: "Lugar místico de culto popular de origen románico." },
    { id: 192, name: "CONVENTO DE SAN JUAN", category: "Ruinas", coords: "41°26'58.1\"N 3°58'32.4\"W", address: "FUENTIDUEÑA", note: "Huellas de la espléndida vida religiosa del pasado." },
    { id: 193, name: "ERMITA DE LA SANTA CRUZ", category: "Historia", coords: "41°26'20.9\"N 3°56'52.8\"W", address: "FUENTIDUEÑA", note: "Santuario de gran encanto e historia milenaria." },
    { id: 194, name: "ERMITA DE VALCALBADO", category: "Historia", coords: "41°27'59.7\"N 3°58'25.8\"W", address: "VALTIENDAS", note: "Famosa ermita que da nombre al paraje místico." },
    { id: 195, name: "MOLINO DE LOS REYES", category: "Industrial", coords: "41°29'42.6\"N 3°58'08.3\"W", address: "SACRAMENIA", note: "Importante molinos del entorno cisterciense." },
    { id: 196, name: "LAGARES", category: "Industrial", coords: "41°28'46.8\"N 3°54'47.0\"W", address: "VALTIENDAS", note: "Corazón de la cultura vitivinícola del norte." },
    { id: 197, name: "IGLESIA DE SANTIAGO", category: "Historia", coords: "41°24'02.1\"N 4°18'54.8\"W", address: "CUÉLLAR", note: "Ejemplo del impresionante arte mudéjar de Cuéllar." },
    { id: 198, name: "MOLINO DE VIENTO EL CUBO", category: "Industrial", coords: "41°23'51.4\"N 4°19'05.9\"W", address: "CUÉLLAR", note: "Molino de viento restaurado que preside la loma." },
    { id: 199, name: "PUENTE DE BARRANCALES", category: "Historia", coords: "41°22'30.3\"N 4°22'00.0\"W", address: "CUÉLLAR", note: "Antiguo puente de piedra que cruza el río Cega." },
    { id: 200, name: "TORRE DE SANTA MARINA", category: "Historia", coords: "41°24'00.1\"N 4°18'50.6\"W", address: "CUÉLLAR", note: "Único resto visible de la antigua iglesia." },
    { id: 201, name: "PEGUERAS", category: "Industrial", coords: "41°20'04.5\"N 4°25'36.4\"W", address: "CHAÑE", note: "Antiguos hornos para la obtención de pez." },
    { id: 202, name: "MOLINO DEL BOTILLER", category: "Industrial", coords: "41°23'07.5\"N 4°16'55.2\"W", address: "ESCARABAJOSA", note: "Ingenio hidráulico muy relevante." },
    { id: 203, name: "TEJERAS DE LOS SERAFINES", category: "Industrial", coords: "41°18'05.7\"N 4°06'06.4\"W", address: "LASTRAS DE CUÉLLAR", note: "Centenarias instalaciones cerámicas ya en desuso." },
    { id: 204, name: "POCIEGUILLO", category: "Naturaleza", coords: "41°25'49.8\"N 4°15'48.7\"W", address: "LOVINGOS", note: "Lugar de agua y vida en el secano cuellarano." },
    { id: 205, name: "FÁBRICA DE RESINAS", category: "Industrial", coords: "41°12'50.5\"N 4°14'59.9\"W", address: "NAVALMANZANO", note: "Patrimonio industrial vivo de la Tierra de Pinares." },
    { id: 206, name: "FÁBRICA BAUDILIO MESA", category: "Industrial", coords: "41°11'53.0\"N 4°26'09.6\"W", address: "NAVAS DE ORO", note: "Emblemática fábrica de la industria resinera." },
    { id: 207, name: "PALACIO DE BUEN GRADO", category: "Historia", coords: "41°22'51.1\"N 4°09'29.9\"W", address: "PEROSILLO", note: "Antigua residencia señorial de gran importancia." },
    { id: 208, name: "FÁBRICA DE HARINA", category: "Industrial", coords: "41°15'32.3\"N 4°25'09.2\"W", address: "SAMBOAL", note: "Complejo harinero representativo de la zona mística." },
    { id: 209, name: "FÁBRICAS ATILANO GILSANZ", category: "Industrial", coords: "41°19'28.3\"N 4°18'12.5\"W", address: "SANCHONUÑO", note: "Doble industria que modernizó el sector agrario." },
    { id: 210, name: "APARTADERO DE TREN", category: "Industrial", coords: "41°13'32.3\"N 4°34'53.6\"W", address: "CIRUELOS DE COCA", note: "Estación mística de la Segovia NO Garleada." },
    { id: 211, name: "ESTACIÓN DE TREN", category: "Industrial", coords: "41°12'11.4\"N 4°32'33.7\"W", address: "COCA", note: "Punto de transporte vital para la villa ducal." },
    { id: 212, name: "FÁBRICAS JUAN GARCÍA", category: "Industrial", coords: "41°09'38.1\"N 4°29'35.4\"W", address: "NAVA DE LA ASUNCIÓN", note: "Grandes instalaciones fabriles de relevancia provincial." },
    { id: 213, name: "MOLINO DE LA PEÑA", category: "Industrial", coords: "41°16'28.7\"N 4°06'23.7\"W", address: "AGUILAFUENTE", note: "Molino de piedra que aprovechaba la energía del agua." },
    { id: 214, name: "MOLINO", category: "Industrial", coords: "41°07'36.7\"N 3°58'33.0\"W", address: "CABALLAR", note: "Ingenio harinero rural situado en un entorno pintoresco." },
    { id: 215, name: "FORTINES DE CABEZA GRANDE", category: "Historia", coords: "40°52'11.2\"N 4°04'47.8\"W", address: "LA GRANJA", note: "Defensas militares místicas del siglo XX." },
    { id: 216, name: "FÁBRICA DE LUZ SANTA ISABEL", category: "Industrial", coords: "40°53'13.9\"N 4°00'49.1\"W", address: "VALSAÍN", note: "Importante patrimonio industrial hidroeléctrico." },
    { id: 217, name: "FORTINES DEL CERRO DEL PUERCO", category: "Historia", coords: "40°52'24.1\"N 4°00'23.0\"W", address: "VALSAÍN", note: "Fortines militares místicas preservados entre los pinos." }
  ], []);

  const suggestions = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const matches = new Set();
    const term = normalize(searchTerm);
    allPlaces.forEach(p => {
        if (normalize(p.address).includes(term)) matches.add(p.address.toUpperCase());
        if (normalize(p.name).includes(term)) matches.add(p.name.toUpperCase());
    });
    return Array.from(matches).slice(0, 12);
  }, [searchTerm, allPlaces]);

  const filteredPlaces = useMemo(() => {
    return allPlaces.filter(p => {
      const normalizedTerm = normalize(searchTerm);
      if (normalizedTerm !== "") {
          return normalize(p.name).includes(normalizedTerm) || normalize(p.address).includes(normalizedTerm);
      }
      const matchCategory = currentCategory === 'Todos' || p.category === currentCategory;
      const matchZone = currentGeoZone === 'Todos' || getCardinal(p.coords) === currentGeoZone;
      return matchCategory && matchZone;
    });
  }, [currentCategory, currentGeoZone, searchTerm, allPlaces]);

  const totalPages = Math.ceil(filteredPlaces.length / itemsPerPage);
  const displayedPlaces = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPlaces.slice(start, start + itemsPerPage);
  }, [filteredPlaces, currentPage]);

  const toggleFavorite = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]);
  };

  const clearSelection = () => {
    setSearchTerm('');
    setCurrentCategory('Todos');
    setCurrentGeoZone('Todos');
    setIsHeaderSearchOpen(false);
  };

  const generateItinerary = () => {
    const zoneToUse = currentGeoZone === 'Todos' ? ['Norte', 'Sur', 'Este', 'Oeste'][Math.floor(Math.random()*4)] : currentGeoZone;
    const zonePlaces = allPlaces.filter(p => getCardinal(p.coords) === zoneToUse);
    if (zonePlaces.length < 2) return;
    const shuffled = [...zonePlaces].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    const withDist = selected.map((p, idx) => ({
        ...p,
        kmFromPrev: idx === 0 ? null : calculateDistance(p.coords, selected[idx-1].coords)
    }));
    setItinerary({ zone: zoneToUse, places: withDist });
  };

  const PaginationControls = () => (
    <div className="flex items-center gap-2">
        <button 
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-3 rounded-lg bg-white border border-slate-200 text-slate-400 disabled:opacity-30 hover:bg-slate-50 transition-all w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center"
        >
            <ChevronLeft size={24} />
        </button>
        <div className="flex items-center gap-1.5">
            {[...Array(totalPages)].map((_, i) => {
                if (totalPages > 5 && Math.abs(currentPage - (i + 1)) > 2) {
                    if (i === 0 || i === totalPages - 1) return <span key={i} className="px-1 text-slate-300">.</span>;
                    return null;
                }
                return (
                    <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg text-sm sm:text-base font-black transition-all ${currentPage === i + 1 ? 'bg-[#5b21b6] text-white shadow-md' : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-300'}`}
                    >
                        {i + 1}
                    </button>
                );
            })}
        </div>
        <button 
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="p-3 rounded-lg bg-white border border-slate-200 text-slate-400 disabled:opacity-30 hover:bg-slate-50 transition-all w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center"
        >
            <ChevronRight size={24} />
        </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fcfcfd] font-sans selection:bg-indigo-100 text-[18px] sm:text-[20px]">
      <header className="sticky top-0 z-[1000] h-14 bg-white px-4 md:px-6 flex items-center justify-between border-b border-slate-100 shadow-sm overflow-visible">
        <div className="flex items-center gap-2">
          <div className="bg-[#4338ca] p-1.5 rounded-md shadow-sm">
            <HikerIcon />
          </div>
          <h1 className="text-sm font-black tracking-tight text-slate-900 uppercase italic leading-none">Rutabia</h1>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3 flex-1 justify-end h-full">
            <button 
              onClick={() => setIsHeaderSearchOpen(!isHeaderSearchOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all shadow-sm active:scale-90 ${isHeaderSearchOpen ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white'}`}
            >
                <Search size={18} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Buscar</span>
            </button>

            <button 
                onClick={() => setIsSideMenuOpen(true)}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-all border border-slate-100 ml-1"
            >
                <Menu size={22} />
            </button>
        </div>

        {isHeaderSearchOpen && (
            <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-2xl p-4 z-[1001] animate-fade-in">
                <div className="max-w-3xl mx-auto relative">
                    <div className="flex items-center gap-3 bg-slate-100 rounded-2xl px-5 py-3 border border-slate-200 focus-within:ring-2 focus-within:ring-[#4338ca] transition-all">
                        <Search className="text-slate-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Buscar parajes o municipios..."
                            value={searchTerm}
                            autoFocus
                            onChange={(e) => {
                                setSearchTerm(e.target.value); 
                                setShowPredictive(true);
                                setCurrentCategory('Todos');
                                setCurrentGeoZone('Todos');
                            }}
                            className="bg-transparent border-none outline-none text-sm font-bold text-slate-800 flex-1 placeholder:text-slate-400"
                        />
                        {searchTerm && <button onClick={() => setSearchTerm('')}><X size={18} className="text-slate-400" /></button>}
                    </div>
                    
                    {searchTerm && filteredPlaces.length === 0 && !showPredictive && (
                         <p className="mt-4 text-rose-600 text-[12px] font-black uppercase tracking-widest text-center animate-pulse">
                            No hay disponible paraje en esta localidad
                         </p>
                    )}

                    {showPredictive && suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800 overflow-hidden z-[1100] max-h-[300px] overflow-y-auto">
                            {suggestions.map((s, i) => (
                            <button 
                                key={i}
                                onClick={() => {
                                    setSearchTerm(s); 
                                    setShowPredictive(false); 
                                    setIsHeaderSearchOpen(false);
                                    setCurrentCategory('Todos');
                                    setCurrentGeoZone('Todos');
                                }}
                                className="w-full px-5 py-4 hover:bg-white/10 flex items-center justify-between group transition-colors border-b border-white/5 last:border-0 text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <MapPin size={14} className="text-slate-500" />
                                    <span className="text-white text-[11px] font-black uppercase tracking-tight">{s}</span>
                                </div>
                                <ChevronRight size={14} className="text-white/20 group-hover:text-white transition-all" />
                            </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )}
      </header>

      {isSideMenuOpen && (
          <div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-md flex justify-end animate-fade-in" onClick={() => setIsSideMenuOpen(false)}>
              <div className="w-[85%] max-w-[320px] bg-white h-full shadow-2xl flex flex-col p-8 pt-4 slide-in-right" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                      <div className="bg-[#4338ca] p-2 rounded-lg shadow-lg">
                          <HikerIcon size={24} />
                      </div>
                      <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase italic leading-none">Rutabia</h2>
                  </div>

                  <div className="flex flex-col gap-3 flex-1 text-slate-800">
                      <button 
                        onClick={() => { setIsSideMenuOpen(false); generateItinerary(); }}
                        className="flex items-center gap-4 p-5 bg-indigo-50 text-[#4338ca] rounded-[1.5rem] hover:bg-indigo-600 hover:text-white transition-all group"
                      >
                          <Route className="w-6 h-6" />
                          <div className="text-left">
                              <span className="block text-sm font-black uppercase tracking-wider leading-none mb-1">Generator</span>
                              <span className="text-[10px] opacity-70 font-bold uppercase tracking-tight">Crea tu ruta</span>
                          </div>
                      </button>

                      <button 
                        onClick={() => { setIsSideMenuOpen(false); setRandomPlace(allPlaces[Math.floor(Math.random() * allPlaces.length)]); }}
                        className="flex items-center gap-4 p-5 bg-indigo-50 text-[#4338ca] rounded-[1.5rem] hover:bg-indigo-600 hover:text-white transition-all group"
                      >
                          <Shuffle className="w-6 h-6" />
                          <div className="text-left">
                              <span className="block text-sm font-black uppercase tracking-wider leading-none mb-1">Randomizer</span>
                              <span className="text-[10px] opacity-70 font-bold uppercase tracking-tight">Selección al azar</span>
                          </div>
                      </button>

                      <button 
                        onClick={() => { setIsSideMenuOpen(false); setShowFavsModal(true); }}
                        className="flex items-center gap-4 p-5 bg-fuchsia-50 text-fuchsia-600 rounded-[1.5rem] hover:bg-fuchsia-600 hover:text-white transition-all group mt-1"
                      >
                          <Heart className="w-6 h-6 fill-current" />
                          <div className="text-left">
                              <span className="block text-sm font-black uppercase tracking-wider leading-none mb-1">Ver favoritos</span>
                              <span className="text-[10px] opacity-70 font-bold uppercase tracking-tight">Mis sitios guardados</span>
                          </div>
                      </button>
                  </div>

                  <button 
                    onClick={() => setIsSideMenuOpen(false)}
                    className="mt-4 flex items-center justify-center gap-2 p-5 border-2 border-rose-500 rounded-[1.5rem] text-slate-800 hover:bg-rose-50 hover:text-rose-600 transition-all font-black uppercase text-xs tracking-[0.2em]"
                  >
                      <X size={18} /> Cerrar
                  </button>
              </div>
          </div>
      )}

      <section className="relative min-h-[340px] py-16 flex flex-col items-center justify-center text-center overflow-visible bg-[#5b21b6] px-6">
        <div className="absolute inset-0 bg-esgrafiado-pattern opacity-[0.30] mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/35 to-transparent pointer-events-none"></div>
        
        <div className="relative z-10 w-full max-w-4xl">
          <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter drop-shadow-2xl leading-none mb-2 uppercase">Crea tu ruta</h2>
          <p className="text-white text-[14px] md:text-[16px] lg:text-[18px] mb-10 opacity-90 tracking-wide font-light max-w-2xl mx-auto text-balance text-white/90">
            <span className="font-black text-white">Descubre</span> parajes sorprendentes en <span className="font-black text-white">Segovia</span>
          </p>

          <div className="bg-white/10 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/20 shadow-2xl">
            <h3 className="text-[16px] lg:text-[18px] font-black tracking-normal text-white mb-6 uppercase text-center">Selecciona ubicaciones</h3>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-slate-800">
                <div className="relative w-full sm:w-auto text-left">
                    <button 
                    onClick={() => { setShowCatMenu(!showCatMenu); setShowZoneMenu(false); }}
                    className="w-full sm:w-[220px] flex items-center justify-between gap-6 px-6 py-4 bg-white rounded-2xl shadow-xl hover:scale-105 transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <BarChart2 className="w-4 h-4 text-[#4338ca]" />
                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-700">{currentCategory === 'Todos' ? 'Categorías' : currentCategory}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showCatMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {showCatMenu && (
                    <div className="absolute top-full left-0 mt-3 w-full sm:w-[240px] p-4 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[1005] animate-fade-in flex flex-col gap-2">
                        {[
                          { name: 'Todos', icon: <Compass className="w-4 h-4" /> },
                          { name: 'Historia', icon: <Landmark className="w-4 h-4" /> },
                          { name: 'Ruinas', icon: <Castle className="w-4 h-4" /> },
                          { name: 'Industrial', icon: <Factory className="w-4 h-4" /> },
                          { name: 'Naturaleza', icon: <Trees className="w-4 h-4" /> }
                        ].map(cat => (
                        <button 
                            key={cat.name} 
                            onClick={() => { 
                                setCurrentCategory(cat.name); 
                                setShowCatMenu(false); 
                                setSearchTerm('');
                            }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest ${currentCategory === cat.name ? 'bg-indigo-600 text-white border-transparent' : 'bg-white border-slate-50 text-slate-500 hover:bg-slate-100 text-left'}`}
                        >
                            {cat.icon} {cat.name}
                        </button>
                        ))}
                    </div>
                    )}
                </div>

                <div className="relative w-full sm:w-auto text-left text-slate-800">
                    <button 
                    onClick={() => { setShowZoneMenu(!showZoneMenu); setShowCatMenu(false); }}
                    className="w-full sm:w-[220px] flex items-center justify-between gap-6 px-6 py-4 bg-white rounded-2xl shadow-xl hover:scale-105 transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <Compass className="w-4 h-4 text-[#4338ca]" />
                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-700">{currentGeoZone === 'Todos' ? 'ZONA' : currentGeoZone}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showZoneMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {showZoneMenu && (
                    <div className="absolute top-full left-0 mt-3 w-full sm:w-[240px] p-4 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[1005] animate-fade-in flex flex-col gap-2">
                        {['Todos', 'Norte', 'Sur', 'Este', 'Oeste'].map(zone => (
                        <button 
                            key={zone} 
                            onClick={() => { 
                                setCurrentGeoZone(zone); 
                                setShowZoneMenu(false); 
                                setSearchTerm('');
                            }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest ${currentGeoZone === zone ? 'bg-indigo-600 text-white border-transparent' : 'bg-white border-slate-50 text-slate-500 hover:bg-slate-100'}`}
                        >
                            <MapPin className="w-4 h-4 text-indigo-500" /> {zone === 'Todos' ? 'Toda la provincia' : `Zona ${zone}`}
                        </button>
                        ))}
                    </div>
                    )}
                </div>
            </div>

            <div className="mt-8 flex flex-col items-center gap-4">
                <div className="flex flex-col items-center gap-2">
                    {filteredPlaces.length === 0 ? (
                        <p className="text-[14px] md:text-[16px] tracking-[0.2em] text-fuchsia-400 font-black uppercase bg-black/40 px-6 py-2 rounded-full border border-fuchsia-400/50 shadow-lg">
                            NO HAY RESULTADOS
                        </p>
                    ) : (
                        <p className="text-[14px] md:text-[16px] tracking-normal text-fuchsia-400 font-black bg-black/40 px-6 py-2 rounded-full border border-white/10 shadow-inner">
                            Mostrando {filteredPlaces.length} sitios de {allPlaces.length}
                        </p>
                    )}
                    
                    {(currentCategory !== 'Todos' || currentGeoZone !== 'Todos' || searchTerm !== '') && (
                        <button 
                            onClick={clearSelection}
                            className="flex items-center gap-2 text-white/60 hover:text-white transition-all text-[11px] font-bold uppercase tracking-widest mt-6 group"
                        >
                            <Eraser size={14} className="group-hover:rotate-12 transition-transform" />
                            Borrar selección
                        </button>
                    )}
                </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 md:px-12 pt-12 text-center min-h-[600px]">
        <div className="mb-12 flex flex-col items-center">
            {totalPages > 1 && <PaginationControls />}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 text-left">
          {displayedPlaces.map((p) => (
            <div key={p.id} className={`relative ${categoryBgColors[p.category]} rounded-[2.2rem] p-4 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group animate-fade-in flex flex-col h-full overflow-hidden`}>
                <div className="relative z-10 flex flex-col h-full">
                  <div className={`relative h-52 w-full rounded-[1.8rem] overflow-hidden mb-6 flex items-center justify-center ${categoryVisualBgs[p.category]} shadow-inner`}>
                    <div className={`absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.15] z-0 ${categoryIconColors[p.category]}`}>
                      {p.category === 'Historia' && <Landmark size={140} strokeWidth={1.5} />}
                      {p.category === 'Ruinas' && <Castle size={140} strokeWidth={1.5} />}
                      {p.category === 'Industrial' && <Factory size={140} strokeWidth={1.5} />}
                      {p.category === 'Naturaleza' && <Trees size={140} strokeWidth={1.5} />}
                    </div>
                    
                    <button 
                      onClick={() => toggleFavorite(p.id)}
                      className={`absolute top-4 right-4 z-30 p-2.5 rounded-xl backdrop-blur-md border transition-all ${favorites.includes(p.id) ? 'bg-fuchsia-600 text-white border-fuchsia-400 shadow-lg' : 'bg-white/40 text-slate-400 border-white/40 hover:bg-white hover:text-fuchsia-600'}`}
                    >
                      <Heart className={`w-5 h-5 ${favorites.includes(p.id) ? 'fill-current' : ''}`} />
                    </button>

                    <div className="absolute bottom-5 left-6 z-20 flex flex-col items-start gap-2 text-white">
                      <span className={`px-2.5 py-0.5 ${categoryColors[p.category]} rounded text-[8px] font-black uppercase tracking-widest border border-white/10 shadow-sm`}>{p.category}</span>
                      <div className="px-2.5 py-1 bg-white/60 backdrop-blur-sm rounded-lg border border-white/40 shadow-sm text-slate-600"><p className="text-[10px] font-mono font-bold tracking-wider leading-none">{p.coords}</p></div>
                    </div>
                  </div>
                  <div className="px-3 flex-grow flex flex-col justify-between">
                    <div>
                      <h4 className="text-[15px] font-black uppercase mb-1.5 text-slate-800 tracking-tight leading-tight group-hover:text-[#4338ca] transition-colors line-clamp-2">{p.name}</h4>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mb-4 flex items-center gap-1.5 leading-none"><MapPin className="w-3 h-3 text-[#4338ca]" /> {p.address}</p>
                      <p className="text-[11px] text-slate-500 italic mb-8 leading-relaxed opacity-80 line-clamp-3">"{p.note}"</p>
                    </div>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.coords)}`} target="_blank" rel="noopener noreferrer" className="bg-black text-white py-3.5 rounded-2xl font-black text-[10px] text-center uppercase tracking-[0.2em] shadow-lg hover:bg-[#4338ca] transition-all block active:scale-95 leading-none">VER SITIO</a>
                  </div>
                </div>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center pb-2 mb-[72px] border-b border-slate-100">
            {totalPages > 1 && <PaginationControls />}
        </div>

        <div className="col-span-full w-screen relative -ml-[50vw] left-1/2 h-[180px] flex items-center justify-center overflow-hidden shadow-inner bg-cover bg-center group"
              style={{backgroundImage: `url('https://lh3.googleusercontent.com/d/13R4eL4JuPn4XJnfGo58z3SUcH140ILub')`}}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/30 to-transparent"></div>
            <div className="max-w-7xl mx-auto px-6 md:px-12 w-full text-center relative z-20">
                <h2 className="text-2xl md:text-4xl font-light text-white uppercase italic tracking-tighter drop-shadow-xl leading-none">
                  Segovia, piedras y más...
                </h2>
            </div>
        </div>
      </main>

      <footer className="relative bg-[#111827] py-20 px-6 overflow-hidden text-center border-t border-white/5 text-slate-300">
        <div className="absolute inset-0 bg-esgrafiado-pattern opacity-[0.05] pointer-events-none"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="bg-[#1f2937]/95 backdrop-blur-2xl rounded-[3rem] p-10 md:p-14 border border-white/10 shadow-2xl mb-12 text-balance">
            <div className="flex justify-center mb-8">
              <div className="bg-[#4338ca] p-2 rounded-xl shadow-lg"><HikerIcon /></div>
              <span className="text-white text-[11px] font-black uppercase tracking-[0.25em] ml-5 self-center italic leading-none">Rutabia</span>
            </div>
            <h3 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-none mb-5 uppercase">Crea tu ruta</h3>
            <div className="space-y-6">
              <p className="text-white/40 text-[14px] md:text-[16px] lg:text-[18px] leading-relaxed max-w-lg mx-auto tracking-wide font-light italic">
                <span className="font-black text-white">Descubre</span> parajes sorprendentes en <span className="font-black text-white">Segovia</span>
              </p>

              <div className="border-t border-white/5 pt-8 max-w-xl mx-auto"></div>

              <div className="text-white/50 text-[12px] md:text-[14px] leading-relaxed max-w-2xl mx-auto space-y-2">
                <p>¿Eres una administración interesada en © RUTABIA?</p>
                <p>¿Tienes un hotel rural, camping o negocio y quieres contactar con nosotros?</p>
                <p className="font-bold text-white/70 pt-2 text-balance">Lleva tu oferta al siguiente nivel, ¿hablamos?</p>
                
                <div className="pt-4">
                  <a href="mailto:rutabiasegovia@gmail.com" className="text-fuchsia-500 font-black tracking-widest underline decoration-2 underline-offset-4 hover:text-fuchsia-400 transition-colors">
                    Contactar con Rutabia
                  </a>
                </div>
              </div>

              <div className="border-t border-white/5 pt-8 max-w-xl mx-auto"></div>
              
              <div className="text-white/30 text-[12px] md:text-[14px] flex flex-wrap justify-center gap-x-8 gap-y-2 mb-8 font-medium">
                <span className="hover:text-white transition-colors cursor-pointer">Política de Privacidad</span>
                <span className="hover:text-white transition-colors cursor-pointer">Términos y Condiciones</span>
              </div>

              <div className="flex flex-col items-center gap-3 transition-opacity opacity-60 hover:opacity-100">
                <img src="https://www.gstatic.com/images/branding/product/2x/maps_96dp.png" alt="Google Maps" className="w-8 h-8" />
                <p className="text-white/40 text-[9px] font-bold uppercase tracking-[0.2em]">Powered By Google Maps</p>
              </div>
            </div>
          </div>
          <div className="text-white/30 text-[14px] uppercase tracking-[0.5em] mt-32 font-bold leading-none italic uppercase">© 2026 RUTABIA</div>
        </div>
      </footer>

      {/* MODALES GENERATOR, FAVORITOS, ALEATOR... */}
      {itinerary && (
          <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in text-slate-900" onClick={() => setItinerary(null)}>
              <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-white/20 relative" onClick={e => e.stopPropagation()}>
                <button 
                    onClick={() => setItinerary(null)} 
                    className="absolute top-6 right-6 p-2 hover:bg-indigo-50 hover:text-indigo-600 rounded-full transition-all text-slate-400 z-10"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-indigo-50 text-indigo-700">
                    <h4 className="font-black uppercase italic text-indigo-700 flex items-center gap-2 leading-none text-indigo-700"><Route className="w-5 h-5" /> Ruta Zona {itinerary.zone}</h4>
                </div>
                <div className="p-8 space-y-6 overflow-y-auto max-h-[65vh] pb-12 text-left">
                    {itinerary.places.map((p, idx) => (
                        <div key={p.id} className="relative">
                            {p.kmFromPrev && (
                                <div className="flex flex-col items-center -mt-6 mb-4">
                                    <ArrowDown className="w-5 h-5 text-black mb-1" />
                                    <span className="text-[9px] font-black text-black uppercase bg-slate-100 px-3 py-1 rounded-full border border-slate-200">A {p.kmFromPrev} km</span>
                                </div>
                            )}
                            <div className="flex gap-4 items-start p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm text-slate-800">
                                <div className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-black flex-shrink-0 text-xs">{idx + 1}</div>
                                <div className="flex-grow">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h5 className="font-black uppercase text-sm leading-tight">{p.name}</h5>
                                        <span className={`px-1.5 py-0.5 ${categoryColors[p.category]} text-white text-[7px] font-black uppercase rounded leading-none`}>{p.category}</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-tight">{p.address}</p>
                                    <p className="text-[11px] text-slate-500 italic mb-3 leading-relaxed">"{p.note}"</p>
                                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.coords)}`} target="_blank" rel="noopener noreferrer" className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline leading-none">Ver punto →</a>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="pt-6 border-t border-slate-100 mt-8 pb-10 px-4 text-center">
                        <a href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(itinerary.places[0].coords)}&destination=${encodeURIComponent(itinerary.places[itinerary.places.length-1].coords)}${itinerary.places.length > 2 ? `&waypoints=${encodeURIComponent(itinerary.places[1].coords)}` : ''}&travelmode=driving`} target="_blank" rel="noopener noreferrer" className="w-full bg-black text-white py-5 rounded-2xl font-black text-xs text-center uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-900 transition-all flex items-center justify-center gap-3 active:scale-95 mb-10"><img src="https://www.gstatic.com/images/branding/product/2x/maps_96dp.png" alt="G" className="h-4 w-auto" />Ver ruta</a>
                        
                        <button 
                            onClick={() => setItinerary(null)} 
                            className="mt-6 text-slate-400 hover:text-indigo-600 text-[11px] font-black uppercase tracking-widest transition-colors"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
              </div>
          </div>
      )}

      {showFavsModal && (
          <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in text-slate-900" onClick={() => setShowFavsModal(false)}>
              <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-white/20 text-slate-900" onClick={e => e.stopPropagation()}>
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-fuchsia-50">
                    <h4 className="font-black uppercase italic text-fuchsia-700 flex items-center gap-2 leading-none text-fuchsia-700"><Heart className="w-5 h-5 fill-current" /> Listado de Favoritos</h4>
                    <button onClick={() => setShowFavsModal(false)} className="p-2 hover:bg-fuchsia-100 hover:text-fuchsia-600 rounded-full transition-all text-fuchsia-300"><X className="w-6 h-6" /></button>
                </div>
                <div className="p-8 space-y-4 overflow-y-auto max-h-[60vh] text-left">
                    {favorites.length === 0 ? (
                        <div className="text-center py-20">
                            <Info className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No has guardado parajes aún</p>
                        </div>
                    ) : (
                        favorites.map(fid => {
                            const p = allPlaces.find(x => x.id === fid);
                            if (!p) return null;
                            return (
                                <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white transition-all shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-3 h-10 rounded-full ${categoryColors[p.category]}`}></div>
                                        <div>
                                            <h5 className="font-black uppercase text-slate-800 text-sm leading-tight">{p.name}</h5>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">{p.address}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => toggleFavorite(p.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
                <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
                    <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">{favorites.length} parajes seleccionados</p>
                </div>
              </div>
          </div>
      )}

      {randomPlace && (
          <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in text-slate-900" onClick={() => setRandomPlace(null)}>
              <div className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl border border-white/20 p-10 text-center relative text-slate-800" onClick={e => e.stopPropagation()}>
                <button 
                    onClick={() => setRandomPlace(null)} 
                    className="absolute top-6 right-6 p-2 hover:bg-indigo-50 hover:text-indigo-600 rounded-full transition-all text-slate-400 z-10"
                >
                    <X className="w-6 h-6" />
                </button>

                <span className={`inline-block px-3 py-1 mb-4 ${categoryColors[randomPlace.category]} text-white text-[9px] font-black uppercase rounded-lg shadow-sm`}>{randomPlace.category}</span>
                <h3 className="text-2xl font-black uppercase text-slate-800 mb-2 leading-tight">{randomPlace.name}</h3>
                <p className="text-slate-400 text-xs font-bold uppercase mb-6">{randomPlace.address}</p>
                <p className="text-slate-500 italic text-sm mb-10 leading-relaxed">"{randomPlace.note}"</p>
                <div className="flex flex-col gap-3">
                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(randomPlace.coords)}`} target="_blank" rel="noopener noreferrer" className="bg-black text-white py-4 px-10 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-transform">Abrir en Mapa</a>
                    
                    <button 
                        onClick={() => setRandomPlace(null)} 
                        className="text-slate-800 text-[10px] font-black uppercase tracking-widest hover:text-indigo-600 mt-8 transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
              </div>
          </div>
      )}

      {showScrollBtn && <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="fixed bottom-8 right-8 z-[100] w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all border border-white/10"><ArrowUp className="w-6 h-6" /></button>}
      
      <Suspense fallback={null}>
        <Analytics />
      </Suspense>
    </div>
  );
};

export default App;