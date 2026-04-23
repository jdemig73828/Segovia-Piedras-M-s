import React, { useState, useEffect, useMemo, Suspense, useRef } from 'react';
import { Compass, Map as MapIcon, ArrowDown, ArrowUp, MapPin, Search, Shuffle, BarChart2, X, Info, Castle, Landmark, Factory, Trees, Route, ChevronDown, Heart, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Eraser, Menu, CheckCircle2, Percent, HelpCircle, Share2, Copy, Check, MessageCircle, Mail, Twitter, ArrowLeft, Bed, Utensils, Leaf, BookOpen, FlaskConical, Stethoscope, Droplets, Flame, Bath, Pill } from 'lucide-react';

const Analytics = React.lazy(() => 
  import("@vercel/analytics/react")
    .then(mod => ({ default: mod.Analytics }))
    .catch(() => ({ default: () => null }))
);

const RutabiaLogo = ({ size = 24 }) => (
  <img 
    src="https://lh3.googleusercontent.com/d/171x3yTsvbITp5aTQxOhOhgPapHgX2ovN" 
    alt="Rutabia" 
    className="object-contain"
    style={{ width: size, height: size }}
    onError={(e) => { e.target.style.display = 'none'; }}
  />
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

// RANKING IMAGINARIO: TOP 20 y BOTTOM 20
const topVisitedIds = [7, 58, 3, 5, 218, 75, 30, 35, 79, 6, 41, 13, 11, 89, 9, 37, 1, 2, 4, 8];
const leastVisitedIds = [145, 61, 112, 100, 106, 130, 142, 166, 171, 29, 43, 45, 57, 63, 64, 71, 92, 15, 21, 25];

// COORDENADAS APROXIMADAS DE ECOSISTEMAS SEGOVIANOS PARA EL MAPA
const ecosystemPolygons = {
  'Sierra de Guadarrama': [
    [40.72,-4.35], [40.79,-4.15], [40.85,-4.00], [40.95,-3.87], [41.05,-3.72], [41.13,-3.63], [41.10,-3.57], [41.00,-3.66], [40.90,-3.83], [40.80,-3.97], [40.74,-4.13], [40.68,-4.30]
  ],
  'Dehesas y praderas a pie de sierra': [
    [40.78,-4.42], [40.85,-4.25], [40.91,-4.07], [41.02,-3.94], [41.11,-3.78], [41.18,-3.67], [41.25,-3.55], [41.33,-3.45], [41.40,-3.30], [41.36,-3.25], [41.28,-3.42], [41.21,-3.48], [41.12,-3.62], [41.06,-3.72], [40.97,-3.86], [40.86,-4.00], [40.78,-4.17], [40.72,-4.36]
  ],
  'Lastras': [
    [41.15,-4.50], [41.38,-4.33], [41.30,-3.90], [41.40,-3.50], [41.35,-3.40], [41.15,-3.75], [41.05,-3.90], [41.00,-4.50]
  ],
  'Riberas': [
    [[40.85,-4.25], [41.00,-4.35], [41.02,-4.30], [40.87,-4.20]],
    [[40.75,-4.40], [41.05,-4.50], [41.06,-4.46], [40.76,-4.36]],
    [[40.85,-4.05], [41.15,-4.20], [41.25,-4.35], [41.27,-4.30], [41.15,-4.15], [40.86,-4.00]],
    [[41.00,-4.00], [41.20,-4.10], [41.30,-4.20], [41.32,-4.17], [41.21,-4.07], [41.02,-3.97]],
    [[41.05,-3.85], [41.25,-4.00], [41.35,-4.15], [41.38,-4.12], [41.28,-3.97], [41.06,-3.81]],
    [[41.15,-3.65], [41.30,-3.80], [41.45,-4.00], [41.47,-3.97], [41.32,-3.77], [41.17,-3.61]],
    [[41.25,-3.45], [41.45,-3.55], [41.55,-3.65], [41.56,-3.62], [41.46,-3.52], [41.26,-3.42]]
  ],
  'Tierra de Pinares': [
    [41.15,-4.55], [41.38,-4.40], [41.30,-3.95], [41.20,-3.90], [41.05,-4.10], [41.00,-4.30], [41.00,-4.50]
  ],
  'Campo de cultivo': [
    [40.85, -4.45], [41.10, -4.65], [41.35, -4.50], [41.55, -4.10], [41.55, -3.60], [41.40, -3.30], [41.20, -3.60], [41.05, -3.90], [40.95, -4.15], [40.85, -4.45]
  ],
  'Sierra de Ayllón': [
    [41.15,-3.60], [41.30,-3.40], [41.40,-3.20], [41.45,-3.10], [41.35,-3.00], [41.20,-3.30]
  ],
  'Jardines, escombreras y cunetas': [
    [40.70, -4.40], [41.10, -4.75], [41.35, -4.60], [41.55, -4.10], [41.55, -3.60], [41.40, -3.20], [41.15, -3.40], [40.80, -3.90], [40.70, -4.10]
  ]
};

// DATOS DE ECOSISTEMAS SEGOVIANOS (INTRODUCCIÓN ETNOBOTÁNICA) METER EL RESTO DE LOS 7 JAVIER
const ecosystemsIntro = "Puede ocurrir que algunos de nuestros lectores desconozcan el significado de la palabra ecosistema, un cultismo que sólo ahora se está introduciendo en el castellano coloquial. Lo definiremos, de una forma muy sencilla, como el conjunto de factores físicos -clima, suelo y relieve- que se dan en un espacio concreto, haciendo posible la existencia de unos determinados seres vivos -plantas y animales-, que mantienen entre sí relaciones de dependencia. Para mejor entender los principales ecosistemas de la provincia de Segovia hemos de saber que en ésta hay tres formas de relieve, sierras, planicies y valles... Juntos clima, suelo y relieve influyen de forma decisiva en el desarrollo de la vegetación espontánea o natural, ya que determinan la existencia de las diferentes comunidades y especies, obligándolas a veces a recurrir a distintos tipos de adaptación para poder superar las condiciones adversas. No podemos olvidar la acción del hombre, causante de fuertes alteraciones en el medio, talando bosques, o el trazado de vías de comunicación. Si nos atenemos a la localización de las diferentes especies medicinales que, desde el punto de vista etnobotánico, se van a describir, los ecosistemas más representativos de la provincia de Segovia son los siguientes:";

const ecosystemsData = [
  {
    title: "Sierra de Guadarrama",
    desc: "Se extiende por la mayor parte del borde sudoriental de la provincia, entre el pico de Colgadizos y la sierra de Malagón, formando alineaciones y macizos como los Montes Carpetanos, Peñalara, Siete Picos y Mujer Muerta, y con zonas bien diferenciadas: la alpina, por alturas superiores a los 1.800 metros, y la subalpina, entre los 1.300 y los 1.800 metros. En la primera, al fundirse las nieves, aparecen los cervunales, praderas de fino césped sobre el que brillan los vivos colores de narcisos, digitales y gencianas y por el que se desparrama un apretado matorral de piornos y jabinos rastreros. En la zona subalpina, bien regada por numerosos regatos, crece el pino silvestre en masas tan apretadas y densas que sólo en los claros del bosque permite el desarrollo de especies arbustivas como el bellísimo acebo, el cerezo silvestre, el serbal, el avellano, el arraclán, la genista y el cambroño."
  },
  
];

// GUÍA DE FUNDAMENTOS ETNOBOTÁNICOS (NUEVA INFORMACIÓN)
const ethnobotanyGuide = {
  intro: "Como creo que es interesante observar la planta en todos sus aspectos, desde saber la relación que el hombre ha mantenido con las diferentes especies medicinales -cómo las ha utilizado o para qué han servido-, hasta desvelar sus características físicas de color, olor, sabor, forma y textura, sin olvidar su composición química y sus aplicaciones, comenzaré explicando el significado de los términos etnobotánica, fitología y fitoterapia.",
  definitions: [
    { title: "Etnobotánica", desc: "La Etnobotánica, palabra que engloba los términos griegos, etnos, que hace referencia a lo cultural de un pueblo, y botane, hierba o pasto, es una ciencia, rama de la Botánica, que estudia y describe la interacción del ser humano con la naturaleza, intentando rescatar el conocimiento empírico ancestral de la utilización de las plantas con el objetivo de recuperarlas, evitar que sus primitivos aprovechamientos caigan en el olvido e intentar que puedan utilizarse en un futuro para nuevos usos y aplicaciones. Me parece de suma importancia que estos conocimientos no se pierdan, y desde aquí os animo a que investiguéis preguntando a vuestros abuelos cómo preparaban los remedios medicinales con las plantas que encontraban a su alrededor." },
    { title: "Fitología", desc: "La Fitología es el estudio sensorial de la planta, necesario pues para conocer realmente una especie no es suficiente con describir su morfología sino que debemos observarla con los cinco sentidos. Hay que verla prestando atención a la altura que tiene, la forma de sus tallos y hojas, el color de sus flores o el aspecto de sus frutos. Hay que olerla, apreciando los diferentes matices aromáticos que presentan hojas, flores y frutos, observando en qué momento del día su aroma es más intenso o cómo cambia su olor con el paso de las estaciones. Hay que tocarla, siempre delicadamente tratando de no dañarla, pero con la firmeza necesaria para reconocer su textura, si es áspera, suave, rugosa, con pinchos, con espinas... Hay que probarla, siempre que sepamos con seguridad que no es tóxica, y saborear cada parte intentando encontrar el sabor predominante, dulce, salado, amargo, ácido o astringente. Y también hay que escucharla ya que, si no tienen una manera especial de comunicarse, en muchos casos sí responden a la acción de agentes externos con sonidos que nos pueden indicar incluso si la planta está a punto para su recolección." },
    { title: "Fitoterapia", desc: "La Fitoterapia, palabra formada por los términos griegos phyton, que significa planta, y therapeia, que significa curación, es la ciencia que estudia las propiedades curativas de las plantas, para utilizarlas como remedio contra las enfermedades. Todos sabemos que en muchos casos se emplea una parte concreta de la planta, nos referiremos a ésta como parte útil, es decir, la parte de la planta que vamos a emplear como medicina, por ser en ella donde se localizan los principios activos o sustancias medicinales." }
  ],
  principles: {
    intro: "Los principios activos son los componentes causantes de la acción terapéutica de la planta, las sustancias que ejercen una acción farmacológica sobre nuestro organismo, provocando en él ciertos cambios que se traducen en mejoría o alivio de la enfermedad o dolencia. Normalmente, las plantas contienen en su composición una mezcla de principios activos de distinta naturaleza que actúan sinérgicamente, actuando de forma conjunta y no de modo aislado. Existe gran variedad de principios activos, que por su estructura química y características funcionales presentan una actividad farmacológica concreta y definida y a lo largo de la publicación se irán mencionando, entre otros, los alcaloides, flavonoides, aceites esenciales, taninos, heterósidos, principios amargos, vitaminas y minerales.",
    items: [
      { name: "Alcaloides", desc: "Son sustancias que se caracterizan por presentar efectos muy fuertes en el organismo humano a bajas dosis. La mayor parte de los alcaloides presentes en las plantas presentan toxicidad y hay que emplearlos en dosis muy bien calculadas para lograr un efecto terapéutico. Entre los alcaloides más conocidos se encuentran la cafeína, teína, teofilina, codeína, atropina, quinina, morfina y nicotina." },
      { name: "Heterósidos", desc: "Presentan un amplio espectro en cuanto a su actividad farmacológica. Los heterósidos antraquinónicos presentes, por ejemplo, en la frángula, tienen actividad laxante o purgante, dependiendo de la dosificación empleada; los heterósidos cardiotónicos característicos de la digital, actúan a nivel del corazón y hay que emplearlos a bajas dosis; los heterósidos saponínicos que aparecen en la saponaria son diuréticos, buenos emulgentes y en disolución acuosa forman jabón. Los heterósidos cumarínicos extraídos del castaño de indias o del meliloto son útiles en los tratamientos de problemas circulatorios, como varices, hemorroides o fragilidad capilar." },
      { name: "Flavonoides", desc: "Presentan gran variedad de propiedades medicinales. Son vasodilatadores, antiinflamatorios, protectores capilares, antibacterianos captadores de radicales libres, etc., encontrándose en plantas como el abedul, el arándano, el aciano o el espino blanco." },
      { name: "Taninos", desc: "Se caracterizan por su acción astringente, por lo que se emplean para cortar hemorragias, como hemostáticos o antidiarreicos, y se encuentran formando parte de la composición química de la bolsa de pastor, la rosa silvestre o el hipérico." },
      { name: "Aceites esenciales", desc: "Son líquidos volátiles de olor penetrante, característicos de plantas aromáticas como la manzanilla, el espliego, el hinojo, el enebro o el poleo. Los problemas respiratorios, digestivos, desinfección y curación de heridas, o dolor de articulaciones, reumatismos y torceduras, son algunas de las afecciones que podemos tratar con estas sustancias activas." },
      { name: "Principios amargos", desc: "Caracterizados por el sabor amargo que presentan, estimulan el apetito y los jugos gástricos, así como la secreción biliar. Plantas ricas en estos componentes, como la genciana, el ajenjo o el cardo mariano, se emplean como aperitivos, para facilitar la digestión o para mejorar la secreción biliar." },
      { name: "Minerales y Vitaminas", desc: "Son compuestos necesarios para nuestro organismo, que podemos encontrar en muchas plantas no siempre consumidas como alimento. La cola de caballo, la ortiga o la avena se emplean como remineralizantes y reconstituyentes por presentar gran cantidad de minerales y vitaminas en su composición." }
    ],
    outro: "Es importante cuando nos dispongamos a emplear plantas medicinales, que tengamos en cuenta una serie de cosas, siendo la primera que debemos \"conocer\" la planta a emplear, es decir, tenemos que saber cómo actúa, en qué dosis debemos tomarla, cuantas veces al día, si es mejor emplearla sola o con otras plantas o si puede interaccionar con otro tratamiento que estemos llevando a cabo. En resumen, el empleo de las plantas como medio de curación siempre debe estar asesorado por una persona experta en el tema, que nos indique la posología y dosificación, así como las interacciones que puede presentar la planta con otros medicamentos o los efectos secundarios que de su uso puedan derivarse."
  },
  applications: {
    intro: "Las plantas medicinales se pueden aplicar de diferentes formas, tanto vía oral como vía externa o tópica. Para utilizarlas con seguridad primero debemos conocer las propiedades e indicaciones de la planta o plantas que vamos a emplear y comprobar que no presentan ninguna contraindicación o efecto secundario que pueda afectarnos. En casos de tratamientos prolongados siempre debemos consultar con un especialista en la materia, evitar la automedicación y ser siempre prudentes en el uso de las plantas.",
    viaInterna: "Los tratamientos vía interna más empleados tradicionalmente son las infusiones o decocciones partiendo generalmente de la planta seca. Hoy en día han aparecido en el mercado una gran cantidad de extractos de plantas en forma líquida o en cápsulas o comprimidos, en las que los principios activos suelen estar más concentrados. En cada envase se indica la posología adecuada de cada preparado. Para los que queráis seguir preparando las plantas de forma tradicional, pero no por eso menos efectiva, se explica a continuación cómo debe procederse en cada caso.",
    viaExterna: "Las aplicaciones vía externa son muy variadas, desde los métodos más tradicionales como los emplastos de planta fresca machacada o las cataplasmas, hasta formas más actuales como los masajes o los baños. A continuación explicamos cómo se deben realizar estas preparaciones."
  }
};

// 24 TESTIMONIOS INVENTADOS METER DEL 7 AL 24 JAVIER
const allReviews = [
  { id: 1, title: "Ruta al Convento de la Hoz", author: "Alejandro M.", color: "bg-rose-100 text-rose-700", rating: 5, date: "7/4/2026", text: "Excelente el paraje en el fondo del cañón. La bajada es un poco vertiginosa, pero ver los restos arqueológicos colgados en la roca no tiene precio. ¡Muy recomendable!" },
  { id: 2, title: "Paseo por las Pesquerías Reales", author: "Carlos D.", color: "bg-blue-100 text-blue-700", rating: 5, date: "15/3/2026", text: "Carmen y yo hemos disfrutado muchísimo este recorrido. Su relato histórico es clave para entender las pesquerías de Carlos III. Muy agradable y cordial el entorno." },
  { id: 3, title: "Descubriendo Matandrino", author: "Gisela F.", color: "bg-emerald-100 text-emerald-700", rating: 4, date: "6/4/2026", text: "Bien puntual. Muy clara la explicación sobre la despoblación de esta zona en la app. La soledad del lugar enriquece la información. Muchas gracias." },
  { id: 4, title: "Visita al Palacio de Valsaín", author: "Elvira R.", color: "bg-amber-100 text-amber-700", rating: 5, date: "22/5/2026", text: "¡El sitio es un tipazo! La historia imperial de los Austrias que tiene lo hace único. Me encantaría tomar un tour guiado algún día. ¡Súper recomendado!" },
  { id: 5, title: "Molino de los Mesa", author: "Jorge Daniel", color: "bg-purple-100 text-purple-700", rating: 4, date: "7/4/2026", text: "Muy buena excursión. Lo pasamos muy bien siguiendo el río Cega. Entender cómo funcionaba el molino fue muy explicativo y responsable con el patrimonio. Gracias." },
  { id: 6, title: "Ermita de San Juan", author: "Sofía T.", color: "bg-cyan-100 text-cyan-700", rating: 5, date: "12/6/2026", text: "Aunque es un día bastante agotador para llegar al Valle de Tabladillo, cumple con todo lo planeado justamente. Se conoce absolutamente todo el románico rural de buena manera." },
];

// BASE DE DATOS ETNOBOTÁNICA SEGOVIANA METER EL RESTO JAVIER
const ethnobotanyPlants = [
  {
    name: "Acedera",
    scientificName: "Rumex acetosa L (Poligonaceae)",
    commonNames: "Acedilla, vinagrera, agrilla",
    botanicalDescription: "Planta vivaz de raíz tuberosa de la que arrancan numerosas raicillas. El tallo puede alcanzar un metro de altura, presenta estrías y toma un color vinoso en la base. Las hojas inferiores tienen un largo pedúnculo que es más corto en las hojas superiores, las hojas son alargadas con dos orejuelas en la base, carnosas y de borde entero. Es una planta dioica, pero tanto las flores masculinas como las femeninas forman un gran ramillete al final del tallo. Los frutos son pequeños, redondos aplanados y presentan tres cantos. Florece en primavera y verano, el fruto madura a final del verano.",
    usefulPart: "Hojas y frutos.",
    habitat: "Esta planta crece en praderas, pastizales y orillas de cauces de agua.",
    collection: "Las hojas se recolectan al principio de la primavera, los frutos a finales del verano.",
    activeMonths: ['MAR','ABR','MAY','AGO','SEP'],
    phytology: "Las hojas tienen un marcado sabor ácido. Contiene principalmente oxalato potásico ácido, gran cantidad de vitamina C, taninos y flavonoides.",
    properties: "La acedera es una planta aperitiva y diurética ya que estimula la actividad del aparato urinario, del hígado y de las funciones intestinales. Por su contenido en vitamina C es una planta antiescorbútica. También se emplea popularmente para tratar anemias ferropénicas y en inflamaciones de las fosas nasales y el tracto respiratorio.",
    contraindications: "No es adecuada en personas propensas a la formación de cálculos biliares o urinarios.",
    curiosities: "El caldo de la cocción de las hojas debe desecharse ya que debido a su contenido en oxalatos es tóxico, aunque se puede emplear para quitar manchas de tinta o de herrumbre."
  },
  
];

// GLOSARIO ETNOBOTÁNICO METER EL RESTO JAVIER
const ethnobotanyGlossary = [
  { term: "ABORTIVO", definition: "Propiedad que hace referencia a la interrupción del embarazo." },
  
];

const App = () => {
  const [currentCategory, setCurrentCategory] = useState('Todos');
  const [currentGeoZone, setCurrentGeoZone] = useState('Todos');
  const [currentEcosystem, setCurrentEcosystem] = useState('Todos'); 
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
  const [isStickyFavVisible, setIsStickyFavVisible] = useState(false);
  const [showTopVisited, setShowTopVisited] = useState(true);
  const [showEthnobotany, setShowEthnobotany] = useState(false); 
  const [showEthnoScrollBtn, setShowEthnoScrollBtn] = useState(false);

  const [infoModal, setInfoModal] = useState({ show: false, place: null });
  
  const [shareExpanded, setShareExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const shareIconsRef = useRef(null);
  
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [nearbySearch, setNearbySearch] = useState(null);
  const mapInstance = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  const searchRef = useRef(null);
  const resultsRef = useRef(null);

  // Estados para la sección de Testimonios
  const [shuffledReviews, setShuffledReviews] = useState([]);
  const [reviewsPage, setReviewsPage] = useState(0);
  const REVIEWS_PER_PAGE = 6;

  useEffect(() => {
    // Mezclar testimonios al cargar
    setShuffledReviews([...allReviews].sort(() => 0.5 - Math.random()));

    document.title = "Rutabia - Descubre parajes sorprendentes en Segovia y crea tu ruta";
    
    const setMetaTag = (name, content) => {
      let element = document.querySelector(`meta[name="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    setMetaTag('description', 'Descubre parajes sorprendentes en Segovia y crea tu ruta. Los mejores parajes en Segovia.');
    setMetaTag('keywords', 'Rutabia, Descubre parajes sorprendente en Segovia y crea tu ruta, Los mejores parajes en Segovia');

    const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
    link.rel = 'icon';
    link.href = 'https://lh3.googleusercontent.com/d/1Hd6LJDM8QNx4RGv1muTcsJ59EFJQAnhR';
    document.getElementsByTagName('head')[0].appendChild(link);

    if (!document.getElementById('leaflet-css')) {
      const leafletCss = document.createElement('link');
      leafletCss.id = 'leaflet-css';
      leafletCss.rel = 'stylesheet';
      leafletCss.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(leafletCss);
    }
    if (!document.getElementById('leaflet-js')) {
      const leafletJs = document.createElement('script');
      leafletJs.id = 'leaflet-js';
      leafletJs.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      document.head.appendChild(leafletJs);
    }

    const handleScroll = () => {
      setShowScrollBtn(window.scrollY > 300);
      setIsStickyFavVisible(window.scrollY > 500);
    };

    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsHeaderSearchOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    setNearbySearch(null);
  }, [currentCategory, currentGeoZone, currentEcosystem, searchTerm]);

  const normalize = (str) => {
    if (!str) return "";
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  };

  const dmsToDec = (dms) => {
    if(!dms) return 0;
    const cleanDms = dms.replace(/\\"/g, '"');
    const matches = cleanDms.match(/(\d+)°(\d+)'([\d.]+)"/);
    if (!matches) return 0;
    let dec = parseFloat(dms.match(/\d+/g)[0]) + parseFloat(dms.match(/\d+/g)[1])/60 + parseFloat(dms.match(/[\d.]+/g)[2])/3600;
    if (dms.includes('W') || dms.includes('S')) dec = -dec;
    return dec;
  };
  
  const parseCoords = (str) => {
    const parts = str.trim().split(/\s+(?=[0-9])/);
    if (parts.length < 2) return null;
    return [dmsToDec(parts[0]), dmsToDec(parts[1])];
  };

  const calculateDistance = (coords1, coords2) => {
    const [lat1, lon1] = parseCoords(coords1) || [0,0];
    const [lat2, lon2] = parseCoords(coords2) || [0,0];
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

  const getCategoryIcon = (cat, colorClass = "text-[#4338ca]") => {
    switch(cat) {
      case 'Historia': return <Landmark className={`w-4 h-4 ${colorClass}`} />;
      case 'Ruinas': return <Castle className={`w-4 h-4 ${colorClass}`} />;
      case 'Industrial': return <Factory className={`w-4 h-4 ${colorClass}`} />;
      case 'Naturaleza': return <Trees className={`w-4 h-4 ${colorClass}`} />;
      default: return <BarChart2 className={`w-4 h-4 ${colorClass}`} />;
    }
  };

  // Componente de calificación de Rutabia (estrellas)
  const RutabiaRating = ({ rating }) => (
    <div className="flex gap-1.5 items-center">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className={i <= rating ? "grayscale opacity-80" : "grayscale opacity-10"}>
          <RutabiaLogo size={14} />
        </div>
      ))}
    </div>
  );

  // ⚠️ IMPORTANTE: PEGA AQUÍ EL RESTO DE TUS LUGARES A CONTINUACIÓN DE ESTOS 5
  const allPlaces = useMemo(() => [
     { id: 1, name: "ERMITA DE SAN JUAN", category: "Historia", coords: "41°21'33.4\"N 3°51'16.9\"W", address: "VALLE DE TABLADILLO", note: "Pequeño oratorio románico oculto en el profundo valle de tabladillo.", image: "https://lh3.googleusercontent.com/d/1WCfuaYRzGZqH5G7C-ll8qwjD3jJ_3TGU", history: "Enclavada en el solitario Valle de Tabladillo, esta ermita de origen románico (siglos XII-XIII) ha sido históricamente un punto de recogimiento espiritual vital para las pequeñas aldeas de la zona. Se especula con que sus orígenes estuvieron ligados a pequeñas comunidades de eremitas o repobladores cristianos tras el avance de la frontera del Duero. Sus gruesos muros de piedra caliza, la ausencia de grandes ventanales y su sencilla espadaña son testigos silenciosos del paso de pastores trashumantes de la Mesta durante siglos. Aunque su interior es modesto, arquitectónicamente es un bello fósil del románico rural segoviano, conservando la esencia inalterada de la devoción popular." },
    { id: 2, name: "CONVENTO DE SANTA ISABEL", category: "Historia", coords: "40°43'03.6\"N 4°14'51.2\"W", address: "EL ESPINAR", note: "Restos históricos del convector del s. XVI de las monjas clarisas.", image: "https://lh3.googleusercontent.com/d/1lvGNMFGnOYRnWIeWAGF1vIpP0rZa6X6I", history: "Fundado en el año 1582 bajo el fervor religioso del reinado de Felipe II, este convento de monjas clarisas fue un importante centro de clausura y poder espiritual en la comarca de El Espinar. Fue auspiciado por nobles locales que buscaban asegurar su descanso eterno. A pesar de los terribles estragos sufridos durante la Guerra de la Independencia por las tropas napoleónicas y las posteriores desamortizaciones del siglo XIX (Mendizábal), que obligaron al abandono del edificio, sus recios restos arquitectónicos aún evocan la sobriedad franciscana. Destacan sus muros de sillería granítica, típicos de las construcciones de la sierra de Guadarrama." },
    { id: 3, name: "FORTALEZA CASTILLO", category: "Historia", coords: "41°21'13.6\"N 3°53'15.2\"W", address: "CARRASCAL DEL RÍO", note: "Fortaleza dominante sobre el paisaje de las hoces del río Duratón.", image: "https://lh3.googleusercontent.com/d/1jjPYi12uwmW6lkJ5IRBSs1_4WEexX9Ki", history: "Erigida vertiginosamente en lo alto de los imponentes cortados que dominan las hoces del río Duratón, esta fortaleza fue una pieza clave en la reconquista y repoblación cristiana impulsada por Alfonso VI en el siglo XI. Su posición estratégica, casi inexpugnable, permitía a las milicias concejiles de la Comunidad de Villa y Tierra de Sepúlveda vigilar el angosto paso del cañón y controlar posibles incursiones musulmanas desde el sur. Personajes legendarios como el conde Fernán González están ligados a las batallas de esta frontera. Hoy, sus lienzos de muralla mimetizados con la roca caliza son el hogar del buitre leonado." },
    { id: 4, name: "MOLINO DE LOS MESA", category: "Industrial", coords: "41°12'19.5\"N 3°58'56.7\"W", address: "CABEZUELA", note: "Ingenio harinero tradicional situado en la ribera del río Cega.", image: "https://lh3.googleusercontent.com/d/11jnhbuh5odHT8GhxYXGHBRltUGR2krwY", history: "Este majestuoso ingenio hidráulico es uno de los representantes más valiosos del rico patrimonio preindustrial que jalonaba la ribera del río Cega. Activo desde la Baja Edad Media y modernizado en los siglos XVIII y XIX, el Molino de los Mesa perteneció a linajes hidalgos locales antes de pasar a manos de molineros privados. Durante generaciones, transformó el abundante trigo y centeno de la campiña en harina, utilizando la fuerza motriz del agua que se canalizaba magistralmente a través de sus profundos cárcavos para mover las pesadas muelas de piedra. Hoy es un monumento a la ingeniería rural de la Segovia de antaño." },
    { id: 5, name: "PUERTA DE LA FUERZA", category: "Historia", coords: "41°18'09.1\"N 3°45'31.9\"W", address: "SEPÚLVEDA", note: "Acceso amurallado histórico de la villa medieval.", image: "https://lh3.googleusercontent.com/d/1OZa8PL2j7CcIsOH4NEBCIz9OmkpAjs3t", history: "Una de las famosas Siete Puertas de la inexpugnable villa medieval de Sepúlveda. Construida entre los siglos XI y XII, tras la confirmación de los valiosos Fueros de Sepúlveda por Alfonso VI, esta imponente entrada fortificada daba acceso al recinto amurallado desde la vertiginosa vertiente del río Duratón. Su arco de medio punto y recia cantería fueron un baluarte fundamental para la defensa militar de la villa, sirviendo de embudo y trampa mortal contra los asedios, recordando los tiempos en que la frontera del Duero era acosada por las razzias del caudillo Almanzor." },
    
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

  const favPlacesWithDist = useMemo(() => {
    const list = favorites.map(id => allPlaces.find(p => p.id === id)).filter(Boolean);
    return list.map((p, idx) => ({
      ...p,
      kmFromPrev: idx === 0 ? null : calculateDistance(p.coords, list[idx-1].coords)
    }));
  }, [favorites, allPlaces]);

  const totalPages = Math.ceil(filteredPlaces.length / itemsPerPage);
  const displayedPlaces = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPlaces.slice(start, start + itemsPerPage);
  }, [filteredPlaces, currentPage]);

  const rankingPlaces = useMemo(() => {
    const ids = showTopVisited ? topVisitedIds : leastVisitedIds;
    return ids.map(id => allPlaces.find(p => p.id === id)).filter(Boolean);
  }, [showTopVisited, allPlaces]);

  const currentReviewPage = useMemo(() => {
      const start = reviewsPage * REVIEWS_PER_PAGE;
      return shuffledReviews.slice(start, start + REVIEWS_PER_PAGE);
  }, [shuffledReviews, reviewsPage]);
  const totalReviewPages = Math.ceil(shuffledReviews.length / REVIEWS_PER_PAGE);

  useEffect(() => {
    let mapInitInterval;
    
    if (!showVisualizer) {
        if (mapInstance.current) {
            mapInstance.current.remove();
            mapInstance.current = null;
        }
        setNearbySearch(null);
        return;
    }

    const initMap = () => {
      if (window.L && document.getElementById('visualizer-map')) {
        if (!mapInstance.current) {
          mapInstance.current = window.L.map('visualizer-map', { zoomControl: false }).setView([41.15, -4.05], 9);
          window.L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);
          window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(mapInstance.current);
        }

        // LIMPIAR CAPAS ANTERIORES
        if (mapInstance.current.markers) {
          mapInstance.current.markers.forEach(m => m.remove());
        }
        mapInstance.current.markers = [];
        
        if (mapInstance.current.ecosystemLayer) {
           mapInstance.current.ecosystemLayer.remove();
           mapInstance.current.ecosystemLayer = null;
        }
        
        // 1. PINTAR ECOSISTEMA SI ESTÁ SELECCIONADO
        if (currentEcosystem !== 'Todos' && ecosystemPolygons[currentEcosystem]) {
            mapInstance.current.ecosystemLayer = window.L.polygon(ecosystemPolygons[currentEcosystem], {
                color: '#64748b',
                fillColor: '#94a3b8',
                fillOpacity: 0.35,
                weight: 2,
                dashArray: '5, 5'
            }).addTo(mapInstance.current);
        }

        const getIcon = (cat) => {
          const colors = { 'Historia': '#2563eb', 'Ruinas': '#f97316', 'Industrial': '#64748b', 'Naturaleza': '#059669' };
          const color = colors[cat] || '#6366f1';
          return window.L.divIcon({
            className: 'custom-leaflet-icon',
            html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.4);"></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7]
          });
        };

        // 2. PINTAR PINES (OVERPASS O LUGARES)
        if (nearbySearch && nearbySearch.active) {
           const [lat, lng] = nearbySearch.center;
           mapInstance.current.setView([lat, lng], 12);

           const mainMarker = window.L.marker([lat, lng], { icon: getIcon('Historia') }).addTo(mapInstance.current);
           mainMarker.bindPopup(`<div style="text-align:center;"><b>${nearbySearch.placeName}</b></div>`).openPopup();
           mapInstance.current.markers.push(mainMarker);

           if (!nearbySearch.loading && nearbySearch.elements) {
               const nearbyIcon = window.L.divIcon({
                  className: 'custom-leaflet-icon',
                  html: `<div style="background-color: ${nearbySearch.type === 'sleep' ? '#0ea5e9' : '#e11d48'}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.4);"></div>`,
                  iconSize: [12, 12],
                  iconAnchor: [6, 6]
               });

               nearbySearch.elements.forEach(el => {
                   if (el.lat && el.lon) {
                       const name = el.tags?.name || (nearbySearch.type === 'sleep' ? 'Alojamiento' : 'Restaurante/Bar');
                       const m = window.L.marker([el.lat, el.lon], { icon: nearbyIcon }).addTo(mapInstance.current);
                       const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${el.lat},${el.lon}`;
                       m.bindPopup(`<div style="text-align:center;font-size:11px;padding-top:4px;padding-bottom:4px;"><b>${name}</b><br/><span style="color:gray;">${nearbySearch.type === 'sleep' ? '🏨 Alojamiento' : '🍽️ Dónde comer'}</span><br/><a href="${mapsUrl}" target="_blank" style="display:inline-block; margin-top:8px; padding:4px 8px; background-color:#4338ca; color:white; border-radius:6px; text-decoration:none; font-weight:bold;">📍 Cómo llegar</a></div>`);
                       mapInstance.current.markers.push(m);
                   }
               });
           }
        } else {
           const bounds = window.L.latLngBounds();
           let hasValidCoords = false;

           filteredPlaces.forEach(p => {
              const coords = parseCoords(p.coords);
              if (coords && !isNaN(coords[0]) && !isNaN(coords[1])) {
                const marker = window.L.marker(coords, { icon: getIcon(p.category) }).addTo(mapInstance.current);
                
                const popupContent = document.createElement('div');
                popupContent.style.textAlign = 'center';
                popupContent.innerHTML = `
                    <b>${p.name}</b><br>
                    <span style="font-size:10px;color:gray;">${p.address}</span><br/>
                    <button id="btn-info-${p.id}" style="margin-top:8px; padding:6px 12px; background-color:#4338ca; color:white; border-radius:6px; border:none; cursor:pointer; font-weight:bold; font-size:10px; width:100%; text-transform:uppercase; letter-spacing:1px;">
                        Ver más info
                    </button>
                `;
                
                marker.bindPopup(popupContent);
                
                marker.on('popupopen', () => {
                    const btn = document.getElementById(`btn-info-${p.id}`);
                    if (btn) {
                        btn.onclick = () => {
                            setShowVisualizer(false);
                            setTimeout(() => {
                                setInfoModal({ show: true, place: p });
                            }, 50);
                        };
                    }
                });

                mapInstance.current.markers.push(marker);
                bounds.extend(coords);
                hasValidCoords = true;
              }
           });

           if (currentEcosystem !== 'Todos' && mapInstance.current.ecosystemLayer) {
               // Si hay ecosistema seleccionado, encuadrar la cámara sobre él
               mapInstance.current.fitBounds(mapInstance.current.ecosystemLayer.getBounds(), { padding: [30, 30] });
           } else if (hasValidCoords && filteredPlaces.length > 0) {
               mapInstance.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
           }
        }

        setTimeout(() => {
            if (mapInstance.current) mapInstance.current.invalidateSize();
        }, 300);

        clearInterval(mapInitInterval);
      }
    };

    mapInitInterval = setInterval(initMap, 200);

    return () => {
      clearInterval(mapInitInterval);
    };
  }, [showVisualizer, filteredPlaces, nearbySearch, currentEcosystem]);

  const handleNearbySearch = async (place, type) => {
    const coords = parseCoords(place.coords);
    if(coords) {
      setNearbySearch({ active: true, type, center: coords, placeName: place.name, loading: true, elements: null });
      setInfoModal({ show: false, place: null });
      setShowVisualizer(true);

      const [lat, lng] = coords;
      const radius = 10000;
      let query = '';
      if (type === 'sleep') {
          query = `[out:json];node["tourism"~"hotel|guest_house|hostel|chalet|apartment"](around:${radius},${lat},${lng});out;`;
      } else {
          query = `[out:json];node["amenity"~"restaurant|bar|cafe"](around:${radius},${lat},${lng});out;`;
      }

      try {
          const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
          const data = await res.json();
          setNearbySearch({ active: true, type, center: coords, placeName: place.name, loading: false, elements: data.elements });
      } catch(e) {
          console.error("Error al obtener datos de Overpass", e);
          setNearbySearch({ active: true, type, center: coords, placeName: place.name, loading: false, elements: [], error: true });
      }
    }
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]);
  };

  const clearSelection = () => {
    setSearchTerm('');
    setCurrentCategory('Todos');
    setCurrentGeoZone('Todos');
    setIsHeaderSearchOpen(false);
  };

  const handleCopyLink = (url) => {
    const textArea = document.createElement("textarea");
    textArea.value = url;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar', err);
    }
    document.body.removeChild(textArea);
  };

  const toggleShare = (defaultText) => {
    if (!shareExpanded) {
      setShareMessage(defaultText);
      setShareExpanded(true);
      setTimeout(() => {
        shareIconsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 150);
    } else {
      setShareExpanded(false);
    }
  };

  const getRouteQuery = (p) => {
    if (p.mapUrl || p.id === 218) {
      return `${p.name}, ${p.address}`;
    }
    return p.coords;
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

  const scrollToResults = () => {
    resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const PaginationControls = () => (
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 justify-center max-w-full px-1">
        <button 
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="p-2 sm:p-3 rounded-lg bg-white border border-slate-200 text-slate-400 disabled:opacity-30 hover:bg-slate-50 transition-all w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0 text-slate-800"
        >
            <ChevronsLeft size={22} className="sm:w-6 sm:h-6" />
        </button>
        <button 
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-2 sm:p-3 rounded-lg bg-white border border-slate-200 text-slate-400 disabled:opacity-30 hover:bg-slate-50 transition-all w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0 text-slate-800"
        >
            <ChevronLeft size={22} className="sm:w-6 sm:h-6" />
        </button>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-1.5 text-slate-800 justify-center">
            {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                const isMobileHidden = Math.abs(currentPage - pageNum) > 1;

                if (totalPages > 5 && Math.abs(currentPage - pageNum) > 2) {
                    if (i === 0 || i === totalPages - 1) return <span key={i} className={`px-0.5 sm:px-1 text-slate-300 ${isMobileHidden ? 'hidden sm:inline' : ''}`}>.</span>;
                    return null;
                }
                return (
                    <button
                        key={i}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-lg text-base sm:text-base font-black transition-all flex items-center justify-center flex-shrink-0 ${isMobileHidden ? 'hidden sm:flex' : ''} ${currentPage === pageNum ? 'bg-[#5b21b6] text-white shadow-md' : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-300'}`}
                    >
                        {pageNum}
                    </button>
                );
            })}
        </div>
        <button 
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="p-2 sm:p-3 rounded-lg bg-white border border-slate-200 text-slate-400 disabled:opacity-30 hover:bg-slate-50 transition-all w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0 text-slate-800"
        >
            <ChevronRight size={22} className="sm:w-6 sm:h-6" />
        </button>
        <button 
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 sm:p-3 rounded-lg bg-white border border-slate-200 text-slate-400 disabled:opacity-30 hover:bg-slate-50 transition-all w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0 text-slate-800"
        >
            <ChevronsRight size={22} className="sm:w-6 sm:h-6" />
        </button>
    </div>
  );

  const FavoriteButton = () => (
    <button 
      onClick={() => setShowFavsModal(true)} 
      className="flex items-center justify-center gap-3 px-8 py-3.5 rounded-2xl transition-all shadow-lg bg-fuchsia-50 text-fuchsia-700 hover:bg-fuchsia-600 hover:text-white text-base lg:text-[20px] font-black no-underline"
    >
      <Heart size={22} className={favorites.length > 0 ? "fill-current" : ""} /> 
      Ver favoritos {favorites.length > 0 ? `(${favorites.length})` : ''}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#fcfcfd] font-sans selection:bg-indigo-100 text-[24px] sm:text-[26px] lg:text-[24px]">
      <header className="sticky top-0 z-[1000] h-16 bg-white px-4 md:px-6 flex items-center justify-between border-b border-slate-100 shadow-sm overflow-visible text-slate-800">
        <div className="flex items-center gap-2">
          <RutabiaLogo size={42} />
          <h1 className="text-lg md:text-xl font-black tracking-tight uppercase italic leading-none">Rutabia</h1>
        </div>

        <div className="flex items-center gap-2 md:gap-3 flex-1 justify-end h-full text-slate-800">
            <button 
              onClick={() => setIsHeaderSearchOpen(!isHeaderSearchOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all shadow-sm active:scale-90 ${isHeaderSearchOpen ? 'bg-indigo-600 text-white shadow-lg' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white'}`}
            >
                <Search size={18} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Buscar</span>
            </button>

            <button onClick={() => setIsSideMenuOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-all border border-slate-100 ml-1">
                <Menu size={22} />
            </button>
        </div>
      </header>

      {/* ÁREA DEL BUSCADOR */}
      {isHeaderSearchOpen && (
          <div ref={searchRef} className="relative bg-white z-40 border-b border-slate-100 p-4 animate-fade-in shadow-xl text-slate-800">
            <div className="max-w-3xl mx-auto relative text-slate-800">
              <div className="flex items-center gap-3 bg-slate-100 rounded-2xl px-5 py-3 border border-slate-200 focus-within:ring-2 focus-within:ring-[#4338ca] transition-all">
                <Search className="text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Buscar parajes o municipios en Segovia ..."
                  value={searchTerm}
                  autoFocus
                  onChange={(e) => {setSearchTerm(e.target.value); setShowPredictive(true);}}
                  className="bg-transparent border-none outline-none text-sm font-bold flex-1 placeholder:text-slate-400 text-slate-800"
                />
                {searchTerm && <button onClick={() => setSearchTerm('')}><X size={18} className="text-slate-400" /></button>}
              </div>
              
              {showPredictive && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800 overflow-hidden z-[1100] max-h-[300px] overflow-y-auto">
                  {suggestions.map((s, i) => (
                    <button 
                      key={i}
                      onClick={() => {
                        setSearchTerm(s); 
                        setShowPredictive(false); 
                        setIsHeaderSearchOpen(false);
                      }}
                      className="w-full px-5 py-4 hover:bg-white/10 flex items-center justify-between group transition-colors border-b border-white/5 last:border-0 text-left text-white"
                    >
                      <div className="flex items-center gap-3">
                        <MapPin size={14} className="text-slate-500" />
                        <span className="text-[11px] font-black uppercase tracking-tight text-white">{s}</span>
                      </div>
                      <ChevronRight size={14} className="text-white/20 group-hover:text-white transition-all" />
                    </button>
                  ))}
                </div>
              )}
              {searchTerm && filteredPlaces.length === 0 && (
                 <p className="mt-8 text-[#be185d] text-[12px] font-black uppercase tracking-widest text-center animate-fade-in text-[#be185d]">
                    No hay disponible paraje en esta localidad
                 </p>
              )}
            </div>
          </div>
      )}

      {/* BOTÓN STICKY FAVORITOS */}
      {isStickyFavVisible && !isHeaderSearchOpen && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-fuchsia-600 shadow-2xl h-14 flex items-center justify-center animate-fade-in lg:hidden bg-fuchsia-600">
          <button 
            onClick={() => setShowFavsModal(true)}
            className="w-full h-full flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.2em] text-white"
          >
            <Heart size={20} className="fill-current" /> Ver favoritos {favorites.length > 0 ? `(${favorites.length})` : ''}
          </button>
        </div>
      )}

      {isSideMenuOpen && (
          <div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-md flex justify-end animate-fade-in" onClick={() => setIsSideMenuOpen(false)}>
              <div className="w-[85%] max-w-[320px] bg-white h-full shadow-2xl flex flex-col p-8 pt-4 slide-in-right text-slate-800" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-1.5 mb-6 pb-6 border-b border-slate-100 text-slate-800">
                      <RutabiaLogo size={36} />
                      <h2 className="text-xl font-black tracking-tight uppercase italic leading-none">Rutabia</h2>
                  </div>

                  <div className="flex flex-col gap-3 flex-1 text-slate-800">
                      <button 
                        onClick={() => { setIsSideMenuOpen(false); setIsHeaderSearchOpen(false); generateItinerary(); }}
                        className="flex items-center gap-4 p-5 bg-indigo-50 text-[#4338ca] rounded-[1.5rem] hover:bg-indigo-600 hover:text-white transition-all group w-full"
                      >
                          <div className="w-8 flex justify-center flex-shrink-0 group-hover:text-white transition-colors">
                            <Route className="w-7 h-7 text-[#4338ca] group-hover:text-white transition-colors" />
                          </div>
                          <div className="text-left flex-grow">
                              <span className="block text-sm font-black uppercase tracking-wider leading-none mb-0 group-hover:text-white transition-colors text-[#4338ca]">Generator</span>
                              <span className="text-[10px] opacity-70 font-bold uppercase tracking-tight leading-none group-hover:text-white/90 transition-colors">Crea tu ruta al azar</span>
                          </div>
                      </button>

                      <button 
                        onClick={() => { setIsSideMenuOpen(false); setIsHeaderSearchOpen(false); setRandomPlace(allPlaces[Math.floor(Math.random() * allPlaces.length)]); }}
                        className="flex items-center gap-4 p-5 bg-indigo-50 text-[#4338ca] rounded-[1.5rem] hover:bg-indigo-600 hover:text-white transition-all group w-full"
                      >
                          <div className="w-8 flex justify-center flex-shrink-0 group-hover:text-white transition-colors">
                            <Shuffle className="w-7 h-7 text-[#4338ca] group-hover:text-white transition-colors" />
                          </div>
                          <div className="text-left flex-grow text-slate-800">
                              <span className="block text-sm font-black uppercase tracking-wider leading-none mb-0 group-hover:text-white transition-colors text-[#4338ca]">Randomizer</span>
                              <span className="text-[10px] opacity-70 font-bold uppercase tracking-tight leading-none group-hover:text-white/90 transition-colors text-[#4338ca]">Selección al azar</span>
                          </div>
                      </button>

                      <button 
                        onClick={() => { setIsSideMenuOpen(false); setIsHeaderSearchOpen(false); setShowVisualizer(true); }}
                        className="flex items-center gap-4 p-5 bg-indigo-50 text-[#4338ca] rounded-[1.5rem] hover:bg-indigo-600 hover:text-white transition-all group w-full"
                      >
                          <div className="w-8 flex justify-center flex-shrink-0 group-hover:text-white transition-colors">
                            <MapIcon className="w-7 h-7 text-[#4338ca] group-hover:text-white transition-colors" />
                          </div>
                          <div className="text-left flex-grow text-slate-800">
                              <span className="block text-sm font-black uppercase tracking-wider leading-none mb-0 group-hover:text-white transition-colors text-[#4338ca]">Visualizador</span>
                              <span className="text-[10px] opacity-70 font-bold uppercase tracking-tight leading-none group-hover:text-white/90 transition-colors text-[#4338ca]">Mapa Interactivo</span>
                          </div>
                      </button>

                      <button 
                        onClick={() => { setIsSideMenuOpen(false); setShowEthnobotany(true); }}
                        className="flex items-center gap-4 p-5 bg-indigo-50 text-[#4338ca] rounded-[1.5rem] hover:bg-indigo-600 hover:text-white transition-all group w-full"
                      >
                          <div className="w-8 flex justify-center flex-shrink-0 group-hover:text-white transition-colors">
                            <Leaf className="w-7 h-7 text-[#4338ca] group-hover:text-white transition-colors" />
                          </div>
                          <div className="text-left flex-grow text-slate-800">
                              <span className="block text-sm font-black uppercase tracking-wider leading-none mb-0 group-hover:text-white transition-colors text-[#4338ca]">Etnobotánica Segoviana</span>
                              <span className="text-[10px] opacity-70 font-bold uppercase tracking-tight leading-none group-hover:text-white/90 transition-colors text-[#4338ca]">Fichas de plantas</span>
                          </div>
                      </button>

                      <button 
                        onClick={() => { setIsSideMenuOpen(false); document.getElementById('ranking-section')?.scrollIntoView({ behavior: 'smooth' }); }}
                        className="flex items-center gap-4 p-5 bg-indigo-50 text-[#4338ca] rounded-[1.5rem] hover:bg-indigo-600 hover:text-white transition-all group w-full"
                      >
                          <div className="w-8 flex justify-center flex-shrink-0 group-hover:text-white transition-colors">
                            <Landmark className="w-7 h-7 text-[#4338ca] group-hover:text-white transition-colors" />
                          </div>
                          <div className="text-left flex-grow text-slate-800">
                              <span className="block text-sm font-black uppercase tracking-wider leading-none mb-0 group-hover:text-white transition-colors text-[#4338ca]">Top Ubicaciones</span>
                              <span className="text-[10px] opacity-70 font-bold uppercase tracking-tight leading-none group-hover:text-white/90 transition-colors text-[#4338ca]">Las más visitadas</span>
                          </div>
                      </button>

                      <a 
                        href="https://drive.google.com/file/d/10hjQERxUoj1O75czHo-abaEj-Fk7ul_L/view?usp=sharing"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsSideMenuOpen(false)}
                        className="flex items-center gap-4 p-5 bg-indigo-50 text-[#4338ca] rounded-[1.5rem] hover:bg-indigo-600 hover:text-white transition-all group w-full no-underline"
                      >
                          <div className="w-8 flex justify-center flex-shrink-0 group-hover:text-white transition-colors">
                            <HelpCircle className="w-7 h-7 text-[#4338ca] group-hover:text-white transition-colors" />
                          </div>
                          <div className="text-left flex-grow text-slate-800">
                              <span className="block text-sm font-black uppercase tracking-wider leading-none mb-0 group-hover:text-white transition-colors text-[#4338ca]">Ayuda</span>
                              <span className="text-[10px] opacity-70 font-bold uppercase tracking-tight leading-none group-hover:text-white/90 transition-colors text-[#4338ca]">Manual de uso</span>
                          </div>
                      </a>
                  </div>

                  <button 
                    onClick={() => setIsSideMenuOpen(false)}
                    className="mt-4 flex items-center justify-center gap-2 p-5 border-2 border-rose-100 rounded-[1.5rem] hover:bg-rose-50 hover:text-rose-600 transition-all font-black uppercase text-xs tracking-[0.2em] text-slate-800"
                  >
                      <X size={18} /> Cerrar
                  </button>
              </div>
          </div>
      )}

      {/* HERO SECTION MODIFICADA CON DEGRADADO EN ALFA Y COLOR CORPORATIVO */}
      <section className="relative min-h-[340px] flex flex-col items-center justify-center text-center overflow-visible px-6 pt-12 pb-8 bg-gradient-to-b from-indigo-600 via-purple-700 to-slate-900">
        <div 
          className="absolute inset-0 z-0 opacity-40 mix-blend-luminosity grayscale-[30%] pointer-events-none"
          style={{ 
            backgroundImage: `url('https://lh3.googleusercontent.com/d/1XUZX7F_EwHGoIZFaboHjf70K38NTup3K')`,
            backgroundSize: 'cover',
            backgroundPosition: 'bottom center',
            backgroundRepeat: 'no-repeat'
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/40 to-slate-900/80 pointer-events-none z-0"></div>
        
        <div className="relative z-10 w-full max-w-4xl flex flex-col items-center text-white">
          <h2 className="text-4xl md:text-6xl uppercase italic tracking-tighter drop-shadow-2xl leading-none mb-2 text-white">
            <span className="font-black text-white">CREA</span> <span className="font-semibold text-white">TU RUTA</span>
          </h2>
          <p className="text-white text-[14px] md:text-[16px] lg:text-[18px] mb-10 opacity-90 tracking-wide font-light max-w-2xl mx-auto text-balance drop-shadow-lg">
            <span className="font-black text-white">Descubre</span> parajes sorprendentes en <span className="font-black text-white">Segovia</span>
          </p>

          <div className="bg-white/10 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/20 shadow-2xl relative text-slate-800 mt-2">
            <h3 className="text-[20px] lg:text-[22px] font-normal tracking-normal mb-6 text-center text-white drop-shadow-md">Selecciona ubicaciones</h3>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="relative w-full sm:w-auto text-left">
                    <button 
                    onClick={() => { setShowCatMenu(!showCatMenu); setShowZoneMenu(false); setIsHeaderSearchOpen(false); }}
                    className="w-full sm:w-[220px] flex items-center justify-between gap-6 px-6 py-4 bg-white rounded-2xl shadow-xl hover:scale-105 transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            {getCategoryIcon(currentCategory)}
                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-700">{currentCategory === 'Todos' ? 'Categorías' : currentCategory}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showCatMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {showCatMenu && (
                    <div className="absolute top-full left-0 mt-3 w-full sm:w-[240px] p-4 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[1005] animate-fade-in flex flex-col gap-2">
                        {[
                          { name: 'Todos', icon: <BarChart2 className="w-4 h-4" /> },
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
                                setIsHeaderSearchOpen(false);
                            }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest ${currentCategory === cat.name ? 'bg-indigo-600 text-white border-transparent shadow-lg' : 'bg-white border-slate-50 text-slate-500 hover:bg-slate-100 text-left'}`}
                        >
                            {cat.icon} {cat.name}
                        </button>
                        ))}
                    </div>
                    )}
                </div>

                <div className="relative w-full sm:w-auto text-left">
                    <button 
                    onClick={() => { setShowZoneMenu(!showZoneMenu); setShowCatMenu(false); setIsHeaderSearchOpen(false); }}
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
                                setIsHeaderSearchOpen(false);
                            }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest ${currentGeoZone === zone ? 'bg-indigo-600 text-white border-transparent shadow-lg' : 'bg-white border-slate-50 text-slate-500 hover:bg-slate-100'}`}
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
                        <p className="text-[14px] md:text-[16px] tracking-[0.2em] font-black uppercase bg-fuchsia-500 px-6 py-2 rounded-full border-2 border-fuchsia-600 shadow-lg text-white">
                            NO HAY RESULTADOS
                        </p>
                    ) : (
                        <button 
                          onClick={scrollToResults}
                          className="text-[14px] md:text-[16px] tracking-tight font-black bg-black/40 px-6 py-2 rounded-full border border-white/10 shadow-inner hover:scale-105 active:scale-95 transition-all text-fuchsia-400"
                        >
                            Ver {filteredPlaces.length} sitios de {allPlaces.length} ...
                        </button>
                    )}
                    
                    {(currentCategory !== 'Todos' || currentGeoZone !== 'Todos' || searchTerm !== '') && (
                        <button 
                            onClick={clearSelection}
                            className="flex items-center gap-2 hover:text-white transition-all text-[11px] font-bold uppercase tracking-widest mt-6 group text-white/60"
                        >
                            <Eraser size={14} className="group-hover:rotate-12 transition-transform text-white" />
                            Borrar selección
                        </button>
                    )}
                </div>
            </div>
        </div>
        
        {/* ÍTEMS DE INFORMACIÓN AL FINAL DEL BANNER MORADO */}
        <div className="w-full max-w-4xl mt-12 flex justify-center gap-x-2 sm:gap-x-8 px-4 text-white">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-2.5 flex-1 sm:flex-none text-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
                <span className="text-[9px] md:text-[14px] font-medium tracking-wide">Los mejores parajes</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-2.5 flex-1 sm:flex-none border-x border-white/10 sm:border-none px-2 sm:px-0 text-center">
                <Percent className="w-5 h-5 text-white" />
                <span className="text-[9px] md:text-[14px] font-medium tracking-wide">Servicio 100% gratuito</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-2.5 flex-1 sm:flex-none text-center">
                <img src="https://www.gstatic.com/images/branding/product/2x/maps_96dp.png" alt="Google Maps" className="w-5 h-5 brightness-0 invert opacity-80" />
                <span className="text-[9px] md:text-[14px] font-medium tracking-wide text-white">Generado con Google Maps</span>
            </div>
        </div>
      </div>
    </section>

    <main className="max-w-7xl mx-auto px-6 md:px-12 pt-12 text-center min-h-[600px]">
      {/* FAVORITOS Y PAGINADOR SUPERIOR */}
      <div className="flex flex-col items-center gap-12 my-12 text-slate-800">
          {totalPages > 1 && <PaginationControls />}
          <div className={isStickyFavVisible ? 'lg:block hidden' : 'block'}>
            <FavoriteButton />
          </div>
      </div>

      <div className="flex justify-end w-full mb-4 px-0">
          <button 
              onClick={() => setShowVisualizer(true)} 
              className="flex items-center gap-1.5 text-[#4338ca] hover:text-indigo-800 font-bold text-[10px] uppercase tracking-widest transition-colors active:scale-95 bg-transparent border-none p-0 cursor-pointer"
          >
              <MapIcon className="w-3.5 h-3.5" /> Mapa Interactivo
          </button>
      </div>

      <div id="results-grid" ref={resultsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 text-left text-slate-800">
        {displayedPlaces.map((p) => (
          <div key={p.id} className={`relative ${categoryBgColors[p.category] || 'bg-indigo-50/50'} rounded-[2.2rem] p-4 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group animate-fade-in flex flex-col h-full overflow-hidden text-slate-800`}>
              <div className="relative z-10 flex flex-col h-full text-slate-800">
                <div className={`relative h-52 w-full rounded-[1.8rem] overflow-hidden mb-6 flex items-center justify-center ${categoryVisualBgs[p.category] || 'bg-indigo-100'} shadow-inner`}
                     style={p.image ? {backgroundImage: `url(${p.image})`, backgroundSize: 'cover', backgroundPosition: 'center'} : {}}>
                  
                  {/* ICONOS EXTRA PARA CATEGORÍAS ALINEADOS AL CORAZON Y BADGE */}
                  <div className="absolute top-4 left-6 z-30 w-10 h-10">
                    {p.category === 'Historia' && <img src="https://lh3.googleusercontent.com/d/1AOjjE1keDy3dv5O9qhbpO--Ah3k6X1qU" alt="Historia" className="w-full h-full object-contain drop-shadow-md" />}
                    {p.category === 'Ruinas' && <img src="https://lh3.googleusercontent.com/d/13fKY5MeYYVYKPwisLYovRIDO-aXD44oi" alt="Ruinas" className="w-full h-full object-contain drop-shadow-md" />}
                    {p.category === 'Industrial' && <img src="https://lh3.googleusercontent.com/d/1xStUXWwWc2d7u_knhs4bG-o2JMWQlX-4" alt="Industrial" className="w-full h-full object-contain drop-shadow-md" />}
                    {p.category === 'Naturaleza' && <img src="https://lh3.googleusercontent.com/d/1q0lXfp54LN15w4Cbk6BX8UUAi1XRyUPW" alt="Naturaleza" className="w-full h-full object-contain drop-shadow-md" />}
                  </div>

                  {p.image && <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 z-0 pointer-events-none"></div>}

                  {!p.image && (
                    <div className={`absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.15] z-0 ${categoryIconColors[p.category] || 'text-indigo-900'}`}>
                      {p.category === 'Historia' && <Landmark size={140} strokeWidth={1.5} />}
                      {p.category === 'Ruinas' && <Castle size={140} strokeWidth={1.5} />}
                      {p.category === 'Industrial' && <Factory size={140} strokeWidth={1.5} />}
                      {p.category === 'Naturaleza' && <Trees size={140} strokeWidth={1.5} />}
                    </div>
                  )}
                  
                  <button 
                    onClick={() => toggleFavorite(p.id)}
                    className={`absolute top-4 right-4 z-30 p-2.5 rounded-xl border transition-all shadow-sm ${favorites.includes(p.id) ? 'bg-fuchsia-600 text-white border-fuchsia-400 shadow-lg' : 'bg-white/95 text-slate-500 border-white hover:bg-white hover:text-fuchsia-600 hover:shadow-md'}`}
                  >
                    <Heart className={`w-5 h-5 ${favorites.includes(p.id) ? 'fill-current' : ''}`} />
                  </button>

                  <div className="absolute bottom-5 left-6 z-20 flex flex-col items-start gap-2">
                    <span className={`px-2.5 py-0.5 ${categoryColors[p.category] || 'bg-indigo-500'} text-white rounded text-[8px] font-black uppercase tracking-widest border border-white/10 shadow-sm`}>{p.category}</span>
                  </div>
                </div>
                <div className="px-3 flex-grow flex flex-col justify-between">
                  <div>
                    <h4 className="text-[15px] font-black uppercase mb-1.5 tracking-tight leading-tight group-hover:text-[#4338ca] transition-colors line-clamp-2">{p.name}</h4>
                    <p className="text-[9px] font-bold uppercase mb-4 flex items-center gap-1.5 leading-none text-slate-400"><MapPin className="w-3 h-3 text-[#4338ca]" /> {p.address}</p>
                    <p className="text-[11px] italic mb-3 leading-relaxed opacity-80 line-clamp-3 text-slate-500">"{p.note}"</p>
                    
                    <button 
                      onClick={() => setInfoModal({ show: true, place: p })} 
                      className="flex items-center gap-1.5 text-[#4338ca] hover:text-indigo-800 font-black text-[10px] uppercase tracking-widest transition-colors mb-6 text-left active:scale-95"
                    >
                      <Info className="w-3.5 h-3.5" /> Más info
                    </button>
                  </div>
                  <a 
                    href={p.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.coords)}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-full bg-black text-white py-3.5 rounded-2xl font-black text-[12px] text-center shadow-lg hover:bg-[#4338ca] transition-all block active:scale-95 leading-none"
                  >
                    Ver sitio
                  </a>
                </div>
              </div>
          </div>
        ))}
      </div>

      <div className="mt-16 flex flex-col items-center gap-12 pb-2 mb-12 text-slate-800">
          <div className={isStickyFavVisible ? 'lg:block hidden' : 'block'}>
            <FavoriteButton />
          </div>
          {totalPages > 1 && <PaginationControls />}
      </div>

      {/* NUEVA SECCIÓN RANKING */}
      <section id="ranking-section" className="w-screen relative -ml-[50vw] left-1/2 bg-slate-100 py-16">
          <div className="max-w-7xl mx-auto px-6 md:px-12 text-left">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                  <h3 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight">
                      {showTopVisited ? 'Ubicaciones más visitadas' : 'Ubicaciones menos visitadas'}
                  </h3>
                  <button 
                      onClick={() => setShowTopVisited(!showTopVisited)}
                      className="flex items-center gap-1.5 text-indigo-600 font-bold text-xs uppercase tracking-widest hover:text-indigo-800 transition-colors"
                  >
                      {showTopVisited ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />}
                      {showTopVisited ? 'Ver menos visitadas' : 'Ver más visitadas'}
                  </button>
              </div>
              
              <div className="flex flex-wrap gap-3">
                  {rankingPlaces.map((p, index) => (
                      <button 
                          key={p.id}
                          onClick={() => setInfoModal({ show: true, place: p })}
                          className="flex items-stretch border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all rounded-md overflow-hidden text-left"
                      >
                          <div className={`px-4 flex items-center justify-center font-black text-white text-xs ${categoryColors[p.category] || 'bg-indigo-500'}`}>
                              {index + 1}
                          </div>
                          <div className="px-4 py-2.5 flex items-center text-xs font-bold text-slate-700">
                              {p.name}
                          </div>
                      </button>
                  ))}
                  {rankingPlaces.length === 0 && (
                      <p className="text-xs text-slate-500 italic">No hay datos suficientes (Añade el array completo de 218 sitios para ver el ranking).</p>
                  )}
              </div>
          </div>
      </section>

      {/* SECCIÓN TESTIMONIOS */}
      <section className="bg-white py-16 w-screen relative -ml-[50vw] left-1/2">
          <div className="max-w-7xl mx-auto px-6 md:px-12 text-left">
              <h3 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight mb-2">Testimonios de otros ruteros</h3>
              <div className="flex flex-col gap-1 mb-8">
                 <span className="text-sm text-slate-500 font-bold">Valoración general</span>
                 <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                    <div className="flex items-end gap-3">
                        <span className="text-4xl font-black text-slate-900 leading-none">4.8<span className="text-xl text-slate-400 font-bold">/5</span></span>
                        <div className="flex flex-col pb-1">
                           <RutabiaRating rating={5} />
                           <span className="text-[10px] text-slate-400 font-medium tracking-wide mt-1">basada en 342 reseñas</span>
                        </div>
                    </div>
                 </div>
                 <p className="text-[11px] text-slate-500 font-medium mt-1">(Envía tu reseña a ©Rutabia para su publicación)</p>
              </div>
              
              <div className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6 -mx-6 px-6 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {currentReviewPage.map(r => (
                      <div key={r.id} className="w-[85vw] sm:w-[320px] md:w-auto flex-none snap-center border border-slate-200 rounded-2xl p-6 bg-white shadow-sm hover:shadow-md transition-all flex flex-col gap-4">
                         <div className="flex flex-col gap-3 border-b border-slate-100 pb-4">
                             <h4 className="font-bold text-sm text-slate-800 line-clamp-2">{r.title}</h4>
                             <RutabiaRating rating={r.rating} />
                             <div className="flex items-center gap-3 mt-1">
                                 <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-black text-xs ${r.color}`}>
                                     {r.author.charAt(0)}
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-700">{r.author}</span>
                                    <span className="text-[9px] text-slate-400">{r.date}</span>
                                 </div>
                             </div>
                         </div>
                         <p className="text-xs text-slate-600 leading-relaxed italic">"{r.text}"</p>
                      </div>
                  ))}
              </div>

              <div className="flex justify-center gap-2 mt-8">
                  {[...Array(totalReviewPages)].map((_, page) => (
                      <button 
                          key={page} 
                          onClick={() => setReviewsPage(page)}
                          className={`w-2.5 h-2.5 rounded-full transition-all ${reviewsPage === page ? 'bg-slate-800 w-6' : 'bg-slate-300 hover:bg-slate-400'}`}
                      />
                  ))}
              </div>
          </div>
      </section>

      {/* BANNER PRE-FOOTER ACTUALIZADO Y LOGO CENTRADO */}
      <div className="col-span-full w-screen relative -ml-[50vw] left-1/2 h-[320px] flex items-center justify-center overflow-hidden bg-gradient-to-b from-indigo-600 via-purple-700 to-[#111827] group">
          <div 
            className="absolute inset-0 z-0 opacity-40 mix-blend-luminosity grayscale-[30%] pointer-events-none"
            style={{ 
              backgroundImage: `url('https://lh3.googleusercontent.com/d/1GnPS_ujSkGYIUbhO1p2qWdgY-fqR-ok6')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#111827]/40 to-[#111827] pointer-events-none z-0"></div>
          
          <div className="relative z-20 bg-white/10 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/20 shadow-2xl text-center max-w-lg mx-4 flex flex-col items-center w-full">
              <div className="mb-6 flex justify-center w-full">
                <RutabiaLogo size={56} />
              </div>
              <div className="w-24 h-[2px] bg-white mx-auto mb-6 rounded-full opacity-80"></div>
              <h2 className="text-xl sm:text-3xl leading-tight mb-0 tracking-tight text-white drop-shadow-md">
                  <span className="font-black">Descubre</span> <span className="font-light italic text-white">parajes</span><br/>
                  <span className="font-light italic">sorprendentes en</span> <span className="font-black text-white">Segovia</span>
              </h2>
          </div>
      </div>
    </main>

    <footer className="relative bg-[#111827] py-20 px-6 overflow-hidden text-center border-t border-white/5 text-slate-300">
      <div className="absolute inset-0 bg-esgrafiado-pattern opacity-[0.05] pointer-events-none"></div>
      <div className="relative z-10 max-w-4xl mx-auto text-balance">
        <div className="bg-[#1f2937]/95 backdrop-blur-2xl rounded-[3rem] p-10 md:p-14 border border-white/10 shadow-2xl mb-12">
          <div className="flex justify-center mb-8 text-white">
            <RutabiaLogo size={40} />
            <span className="text-[11px] font-black uppercase tracking-[0.25em] ml-5 self-center italic leading-none text-white">Rutabia</span>
          </div>
          
          <h3 className="text-3xl md:text-5xl uppercase italic tracking-tighter leading-none mb-5 text-white">
             <span className="font-black">CREA</span> <span className="font-semibold">TU RUTA</span>
          </h3>

          <div className="space-y-6">
            <p className="text-[14px] md:text-[16px] lg:text-[18px] leading-relaxed max-w-lg mx-auto tracking-wide font-light italic text-balance text-white/60">
              <span className="font-black">Descubre</span> parajes sorprendentes en <span className="font-black text-white">Segovia</span>
            </p>

            {/* SECCIÓN DE CONTACTO ACTUALIZADA: ESPACIO EQUILIBRADO Y TAMAÑO IGUAL AL TEXTO SUPERIOR */}
            <div className="py-4 flex justify-center border-t border-white/5 pt-8">
              <a href="mailto:rutabiasegovia@gmail.com" className="text-fuchsia-500 font-bold transition-colors no-underline flex items-center gap-2 hover:text-fuchsia-400 text-[14px] md:text-[16px] lg:text-[18px]">
                <Mail size={20} />
                Contactar con Rutabia
              </a>
            </div>

            <div className="border-t border-white/5 pt-8 max-w-xl mx-auto"></div>
            
            <div className="text-[12px] md:text-[14px] flex flex-wrap justify-center gap-x-8 gap-y-2 mb-8 font-medium text-slate-400">
              <span className="hover:text-white transition-colors cursor-pointer">Política de Privacidad</span>
              <span className="hover:text-white transition-colors cursor-pointer">Términos y Condiciones</span>
            </div>

            <div className="flex flex-col items-center gap-3 transition-opacity opacity-60 hover:opacity-100 text-slate-400">
              <img src="https://www.gstatic.com/images/branding/product/2x/maps_96dp.png" alt="Google Maps" className="w-8 h-8" />
              <p className="text-[9px] font-bold uppercase tracking-[0.2em]">Powered By Google Maps</p>
            </div>
          </div>
        </div>
        <div className="text-[14px] uppercase tracking-[0.5em] mt-32 font-bold leading-none italic text-slate-400">© 2026 RUTABIA</div>
      </div>
    </footer>

    {/* MODAL ETNOBOTÁNICA */}
    {showEthnobotany && (
      <div id="ethno-modal" className="fixed inset-0 z-[4000] bg-[#fcfcfd] overflow-y-auto animate-fade-in" onScroll={(e) => setShowEthnoScrollBtn(e.target.scrollTop > 300)}>
        {/* Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-200 z-20 flex flex-col">
          <div className="px-6 py-4 flex items-center justify-between">
            <button onClick={() => setShowEthnobotany(false)} className="flex items-center gap-1.5 text-[#4338ca] hover:text-indigo-800 font-black text-[10px] uppercase tracking-widest transition-colors active:scale-95">
               <ArrowLeft className="w-4 h-4" /> Volver a inicio
            </button>
            <h2 className="text-sm font-black uppercase tracking-tight text-slate-800 italic">Etnobotánica Segoviana</h2>
          </div>
          
          {/* Menú Principal */}
          <div className="px-6 py-3 border-t border-slate-100 bg-white/80 flex flex-wrap items-center justify-center gap-4 md:gap-8 text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-600">
             <button onClick={() => document.getElementById('eco-section').scrollIntoView({behavior:'smooth'})} className="hover:text-indigo-600 transition-colors">Ecosistemas Segovianos</button>
             <button onClick={() => document.getElementById('guia-section').scrollIntoView({behavior:'smooth'})} className="hover:text-indigo-600 transition-colors">Etnobotánica, Fitología y Fitoterapia</button>
             <button onClick={() => document.getElementById('glosario-section').scrollIntoView({behavior:'smooth'})} className="hover:text-indigo-600 transition-colors">Glosario Botánico</button>
          </div>

          {/* Submenú Monografías */}
          <div className="px-6 py-2 border-t border-slate-100 bg-slate-50/90 flex flex-wrap items-center justify-center gap-2 text-[10px] font-black text-slate-500">
             <span className="uppercase tracking-widest mr-2 text-indigo-500">Monografías:</span>
             {Array.from(new Set(ethnobotanyPlants.map(p => p.name[0].toUpperCase()))).sort().map(letter => (
                <button 
                    key={letter} 
                    onClick={() => document.getElementById(`plant-${letter}`).scrollIntoView({behavior:'smooth'})}
                    className="w-6 h-6 rounded-full bg-white border border-slate-200 hover:bg-indigo-100 hover:text-indigo-700 hover:border-indigo-300 transition-all flex items-center justify-center shadow-sm"
                >
                    {letter}
                </button>
             ))}
          </div>
        </div>
        
        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 flex flex-col gap-12">

          {/* DESCRIPCIÓN DE ECOSISTEMAS SEGOVIANOS (NUEVO BLOQUE SUPERIOR) */}
          <div id="eco-section" className="scroll-mt-40 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden text-left mb-4">
             <div className="p-8 md:p-12">
                 <div className="flex items-center gap-3 mb-4">
                     <Trees className="w-8 h-8 text-emerald-500" />
                     <h2 className="text-3xl md:text-5xl font-black text-emerald-600 tracking-tighter">Ecosistemas Segovianos</h2>
                 </div>
                 <p className="text-sm font-bold text-slate-500 italic mb-8 pb-6 border-b border-slate-100">Ubicándonos en el contexto ecológico en la provincia de Segovia</p>
                 <p className="text-sm text-slate-600 leading-relaxed text-pretty mb-10">{ecosystemsIntro}</p>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {ecosystemsData.map((eco, idx) => (
                         <div key={idx} className="bg-slate-50 rounded-[1.5rem] p-6 border border-slate-200/60 hover:shadow-md transition-shadow">
                             <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-widest mb-3 flex items-center gap-2.5">
                                 <span className="bg-emerald-100 text-emerald-700 w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0">{idx + 1}</span> 
                                 {eco.title}
                             </h3>
                             <p className="text-[13px] text-slate-600 leading-relaxed text-pretty">{eco.desc}</p>
                         </div>
                     ))}
                 </div>
             </div>
          </div>

          {/* GUÍA DE FUNDAMENTOS (NUEVA INFORMACIÓN MÉDICO-BOTÁNICA) */}
          <div id="guia-section" className="scroll-mt-40 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden text-left mb-4">
            <div className="p-8 md:p-12">
              <div className="flex items-center gap-3 mb-4">
                 <BookOpen className="w-8 h-8 text-indigo-500" />
                 <h2 className="text-3xl md:text-5xl font-black text-indigo-600 tracking-tighter">Etnobotánica, Fitología y Fitoterapia</h2>
              </div>
              <p className="text-sm font-bold text-slate-500 italic mb-8 pb-6 border-b border-slate-100">Comprendiendo la relación entre las plantas, sus compuestos y la salud humana</p>
              <p className="text-sm text-slate-600 leading-relaxed text-pretty mb-10">{ethnobotanyGuide.intro}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  {ethnobotanyGuide.definitions.map((def, idx) => (
                      <div key={idx} className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100/50">
                          <h3 className="text-[14px] font-black text-indigo-900 uppercase tracking-widest mb-3">{def.title}</h3>
                          <p className="text-[12px] text-slate-600 leading-relaxed">{def.desc}</p>
                      </div>
                  ))}
              </div>

              {/* PRINCIPIOS ACTIVOS */}
              <div className="mb-12">
                  <h3 className="text-2xl font-black text-slate-800 tracking-tighter mb-4 flex items-center gap-2"><FlaskConical className="w-5 h-5 text-fuchsia-500"/> Principios Activos</h3>
                  <p className="text-sm text-slate-600 leading-relaxed text-pretty mb-8">{ethnobotanyGuide.principles.intro}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                      {ethnobotanyGuide.principles.items.map((principle, idx) => (
                          <div key={idx} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                              <h4 className="text-[11px] font-black text-fuchsia-600 uppercase tracking-widest mb-2">{principle.name}</h4>
                              <p className="text-[12px] text-slate-600 leading-relaxed">{principle.desc}</p>
                          </div>
                      ))}
                  </div>
                  
                  <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100/50 flex gap-4 items-start">
                      <Stethoscope className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                      <p className="text-xs text-amber-800 leading-relaxed font-medium">{ethnobotanyGuide.principles.outro}</p>
                  </div>
              </div>

              {/* FORMAS DE APLICACIÓN */}
              <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tighter mb-4 flex items-center gap-2"><Droplets className="w-5 h-5 text-cyan-500"/> Formas de Aplicación</h3>
                  <p className="text-sm text-slate-600 leading-relaxed text-pretty mb-8">{ethnobotanyGuide.applications.intro}</p>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Vía Interna */}
                      <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200/60">
                          <h4 className="text-lg font-black text-slate-800 mb-3 flex items-center gap-2"><Flame className="w-4 h-4 text-rose-500"/> Aplicaciones Vía Interna</h4>
                          <p className="text-[12px] text-slate-600 leading-relaxed mb-6">{ethnobotanyGuide.applications.viaInterna}</p>
                          
                          <div className="space-y-6">
                              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                                  <h5 className="text-[11px] font-black text-rose-600 uppercase tracking-widest mb-2">Infusión</h5>
                                  <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">Es la maceración suave de la planta en agua hirviendo y se empleará cuando utilicemos partes blandas de las plantas como flores y hojas. La cantidad de planta en general será una cucharada sopera por taza, en caso de que empleemos planta seca. Si utilizamos planta fresca deberemos añadir una cantidad un poco mayor ya que la planta contiene más agua y los principios activos están más diluidos.</p>
                                  <ul className="text-[11px] text-slate-700 font-medium space-y-1.5 mb-4">
                                      <li>1. Ponemos el agua a hervir.</li>
                                      <li>2. Cuando empiece a hervir el agua lo retiramos del fuego y lo añadimos sobre la planta.</li>
                                      <li>3. Tapamos la tetera y dejamos reposar 10 minutos.</li>
                                      <li>4. Filtramos y tomamos la infusión.</li>
                                  </ul>
                                  <p className="text-[10px] text-slate-400 italic">Las infusiones se pueden endulzar empleando azúcar moreno o miel siempre más recomendable que el azúcar refinado, pero os animo a que probéis las infusiones sin endulzar y así apreciaréis el verdadero sabor de la planta.</p>
                              </div>
                              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                                  <h5 className="text-[11px] font-black text-rose-600 uppercase tracking-widest mb-2">Decocción</h5>
                                  <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">Es la maceración de la planta en agua hirviendo durante unos minutos y se empleará cuando utilicemos partes duras de las plantas como cortezas, raíces o frutos. La cantidad de planta a utilizar en este caso será una cucharada de postre por taza de agua.</p>
                                  <ul className="text-[11px] text-slate-700 font-medium space-y-1.5">
                                      <li>1. Ponemos el agua a hervir.</li>
                                      <li>2. Cuando esté hirviendo añadimos la planta y tapamos el cazo para evitar que se evaporen los principios activos y dejamos hervir durante 5-15 mins.</li>
                                      <li>3. Apagamos el fuego y dejamos reposar 10 minutos.</li>
                                      <li>4. Filtramos y podemos tomar.</li>
                                  </ul>
                              </div>
                          </div>
                      </div>

                      {/* Vía Externa */}
                      <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200/60">
                          <h4 className="text-lg font-black text-slate-800 mb-3 flex items-center gap-2"><Bath className="w-4 h-4 text-cyan-500"/> Aplicaciones Vía Externa</h4>
                          <p className="text-[12px] text-slate-600 leading-relaxed mb-6">{ethnobotanyGuide.applications.viaExterna}</p>
                          
                          <div className="space-y-4">
                              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                                  <h5 className="text-[11px] font-black text-cyan-600 uppercase tracking-widest mb-1.5">Vahos</h5>
                                  <p className="text-[11px] text-slate-500 leading-relaxed">Es una variante de la infusión que consiste en utilizar una cantidad aproximada de 5 litros de agua por cada 30 g de planta. En este caso se deja hervir el agua durante 2 minutos y se añade la planta bien troceada. Para tomar los vahos nos colocamos con la cara a un palmo del cazo, tapamos la cabeza con una toalla y respiramos los vapores desprendidos.</p>
                              </div>
                              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                                  <h5 className="text-[11px] font-black text-cyan-600 uppercase tracking-widest mb-1.5">Cataplasmas</h5>
                                  <p className="text-[11px] text-slate-500 leading-relaxed mb-2">Son preparaciones de planta fresca machacada, planta seca o infusión de planta mezclada con otras sustancias, que se ponen directamente en contacto con la piel en la zona afectada. Tipos:</p>
                                  <ul className="text-[10px] text-slate-600 space-y-1.5 list-disc pl-4 marker:text-cyan-400">
                                      <li><span className="font-bold text-slate-700">De planta fresca:</span> se pone directamente en contacto con la zona afectada (ej. hojas frescas de col).</li>
                                      <li><span className="font-bold text-slate-700">De arcilla:</span> mezcla de infusión con arcilla para contusiones e inflamación (ej. cola de caballo y árnica).</li>
                                      <li><span className="font-bold text-slate-700">De harina de linaza:</span> mezcla con harina recién molida que da calor y calma el dolor (rinitis, bronquitis).</li>
                                  </ul>
                              </div>
                              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                                  <h5 className="text-[11px] font-black text-cyan-600 uppercase tracking-widest mb-1.5">Baños</h5>
                                  <p className="text-[11px] text-slate-500 leading-relaxed mb-2">Inmersión del cuerpo o parte de él en agua con infusión o planta fresca. Tipos:</p>
                                  <ul className="text-[10px] text-slate-600 space-y-1.5 list-disc pl-4 marker:text-cyan-400">
                                      <li><span className="font-bold text-slate-700">Baños completos:</span> todo el cuerpo sumergido en agua caliente con infusión (10-20 mins).</li>
                                      <li><span className="font-bold text-slate-700">Pediluvios y maniluvios:</span> inmersión de manos o pies; en temperatura ascendente mejoran la circulación.</li>
                                      <li><span className="font-bold text-slate-700">Baños de asiento:</span> sumergir la zona del vientre hasta los muslos, como técnica depurativa o para infecciones.</li>
                                  </ul>
                              </div>
                              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                                  <h5 className="text-[11px] font-black text-cyan-600 uppercase tracking-widest mb-1.5">Masajes y Preparados <Pill className="inline w-3 h-3 text-cyan-500 mb-0.5 ml-1"/></h5>
                                  <p className="text-[11px] text-slate-500 leading-relaxed">
                                    <span className="font-bold text-slate-700 block mt-1">Masajes:</span> Empleo de <span className="font-medium text-slate-600">Aceites macerados</span> (maceración de la planta en aceite de almendras o de oliva) o <span className="font-medium text-slate-600">Bálsamos y cremas</span> (formas galénicas sólidas elaboradas a partir de aceites, ceras y resinas).<br/><br/>
                                    <span className="font-bold text-slate-700 block">Preparados comerciales:</span> Formas galénicas de utilización más cómoda y dosificación exacta (Extractos secos, fluidos, glicólicos, hidroglicólicos, hidroalcohólicos o jarabes).
                                  </p>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
            </div>
          </div>

          {/* FICHAS DE PLANTAS ETNOBOTÁNICAS */}
          {(() => {
              const seenLetters = new Set();
              return ethnobotanyPlants.map((plant, idx) => {
                 const letter = plant.name[0].toUpperCase();
                 const isFirst = !seenLetters.has(letter);
                 if (isFirst) seenLetters.add(letter);
                 
                 return (
                   <div key={idx} id={isFirst ? `plant-${letter}` : undefined} className={`bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden text-left ${isFirst ? 'scroll-mt-40' : ''}`}>
                      <div className="p-8 md:p-12">
                          <h1 className="text-4xl md:text-6xl font-black text-indigo-600 tracking-tighter mb-2">{plant.name}</h1>
                          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 pb-6 mb-8 gap-4">
                              <p className="text-sm md:text-lg font-bold text-slate-500 italic">{plant.scientificName}</p>
                              <p className="text-xs md:text-sm font-black text-slate-400 uppercase tracking-widest">{plant.commonNames}</p>
                          </div>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                             <div className="space-y-8">
                                 <section>
                                     <h3 className="text-[11px] font-black uppercase tracking-widest text-indigo-500 mb-3 flex items-center gap-2"><Leaf className="w-4 h-4"/> Descripción botánica</h3>
                                     <p className="text-sm text-slate-600 leading-relaxed text-pretty">{plant.botanicalDescription}</p>
                                 </section>
                                 <section>
                                     <h3 className="text-[11px] font-black uppercase tracking-widest text-indigo-500 mb-3">Parte útil</h3>
                                     <p className="text-sm text-slate-600 leading-relaxed">{plant.usefulPart}</p>
                                 </section>
                                 <section>
                                     <h3 className="text-[11px] font-black uppercase tracking-widest text-indigo-500 mb-3">Hábitat</h3>
                                     <p className="text-sm text-slate-600 leading-relaxed">{plant.habitat}</p>
                                 </section>
                                 <section>
                                     <h3 className="text-[11px] font-black uppercase tracking-widest text-indigo-500 mb-3">Recolección</h3>
                                     <p className="text-sm text-slate-600 leading-relaxed mb-3">{plant.collection}</p>
                                     <div className="flex flex-wrap gap-1">
                                         {['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'].map(mes => (
                                             <span key={mes} className={`px-2 py-1 text-[8px] font-black uppercase rounded ${plant.activeMonths.includes(mes) ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-400'}`}>{mes}</span>
                                         ))}
                                     </div>
                                 </section>
                             </div>
                             
                             <div className="space-y-8 bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                                 <section>
                                     <h3 className="text-[11px] font-black uppercase tracking-widest text-indigo-500 mb-3">Fitología y principios activos</h3>
                                     <p className="text-sm text-slate-600 leading-relaxed text-pretty">{plant.phytology}</p>
                                 </section>
                                 <section>
                                     <h3 className="text-[11px] font-black uppercase tracking-widest text-indigo-500 mb-3">Propiedades, usos y aplicaciones</h3>
                                     <p className="text-sm text-slate-600 leading-relaxed text-pretty">{plant.properties}</p>
                                 </section>
                                 <section>
                                     <h3 className="text-[11px] font-black uppercase tracking-widest text-rose-500 mb-3">Interacciones, contraindicaciones y efectos secundarios</h3>
                                     <p className="text-sm text-slate-600 leading-relaxed text-pretty">{plant.contraindications}</p>
                                 </section>
                                 <section>
                                     <h3 className="text-[11px] font-black uppercase tracking-widest text-amber-600 mb-3">Curiosidades culturales</h3>
                                     <p className="text-sm text-slate-600 leading-relaxed text-pretty">{plant.curiosities}</p>
                                 </section>
                             </div>
                          </div>
                      </div>
                   </div>
                 );
              });
          })()}

          {/* GLOSARIO TÉCNICO */}
          <div id="glosario-section" className="scroll-mt-40 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden text-left mt-4 mb-8">
             <div className="p-8 md:p-12">
                 <h2 className="text-3xl md:text-5xl font-black text-indigo-600 tracking-tighter mb-10">Glosario Botánico</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                     {ethnobotanyGlossary.map((item, idx) => (
                         <div key={idx} className="break-inside-avoid">
                             <span className="text-[11px] font-black uppercase text-indigo-500 tracking-widest">{item.term}: </span>
                             <span className="text-sm text-slate-600 leading-relaxed">{item.definition}</span>
                         </div>
                     ))}
                 </div>
             </div>
          </div>
          
        </div>

        {/* BOTÓN VOLVER ARRIBA DEL MODAL ACTUALIZADO: FIXED ABAJO CON ALTO Z-INDEX */}
        {showEthnoScrollBtn && (
            <button 
              onClick={() => document.getElementById('ethno-modal').scrollTo({top: 0, behavior: 'smooth'})} 
              className="fixed bottom-8 right-8 z-[5000] w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all border border-white/10"
            >
              <ArrowUp className="w-6 h-6" />
            </button>
        )}
      </div>
    )}

    {/* MODAL MÁS INFORMACIÓN */}
    {infoModal.show && infoModal.place && (
      <div className="fixed inset-0 z-[2000] items-center justify-center p-4 bg-black/70 backdrop-blur-sm flex animate-fade-in" onClick={() => setInfoModal({ show: false, place: null })}>
        <div className="bg-white rounded-[3rem] w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl relative text-slate-800" onClick={e => e.stopPropagation()}>
          
          {/* Cabecera del Modal */}
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-indigo-50">
            <div>
              <span className={`inline-block px-2.5 py-0.5 mb-2 ${categoryColors[infoModal.place.category] || 'bg-indigo-500'} text-white rounded text-[8px] font-black uppercase tracking-widest shadow-sm`}>
                {infoModal.place.category}
              </span>
              <h4 className="font-black uppercase tracking-tighter text-xl text-indigo-900 leading-none">
                {infoModal.place.name}
              </h4>
            </div>
            <button onClick={() => setInfoModal({ show: false, place: null })} className="w-10 h-10 rounded-full hover:bg-indigo-100 flex items-center justify-center transition-all text-indigo-400 hover:text-indigo-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Contenido del Modal */}
          <div className="p-6 sm:p-8 overflow-y-auto text-left leading-relaxed flex-grow">
            <div className="flex items-center gap-2 mb-6 pb-6 border-b border-slate-100 text-slate-500">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span className="text-[11px] font-bold uppercase tracking-widest">{infoModal.place.address}</span>
            </div>
            
            <p className="text-slate-700 text-sm md:text-base italic mb-6">
              "{infoModal.place.note}"
            </p>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-6">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                <Landmark className="w-3 h-3" /> Reseña Histórica
              </h5>
              <p className="text-sm text-slate-600 whitespace-pre-line">
                {infoModal.place.history || "La información histórica detallada y documentación de este paraje está siendo recopilada actualmente por nuestro equipo de cronistas. Próximamente estará disponible en esta sección."}
              </p>
            </div>
            
            <p className="text-[8px] uppercase tracking-[0.2em] font-bold text-slate-400 text-center sm:text-left mt-8 pt-4 border-t border-slate-100">
              Fuente: Archivo Histórico Documental<br/>Segovia Piedras & más
            </p>
          </div>

          {/* Pie del Modal - Botones de acción siempre visibles */}
          <div className="p-4 sm:p-6 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex w-full sm:w-auto gap-2">
              <button 
                onClick={() => handleNearbySearch(infoModal.place, 'sleep')} 
                className="flex items-center justify-center gap-1.5 px-2 sm:px-3 py-3 bg-slate-50 text-slate-600 hover:bg-slate-200 hover:text-slate-800 rounded-xl transition-all font-bold text-[8.5px] sm:text-[10px] uppercase tracking-widest border border-slate-200 shadow-sm flex-1 whitespace-nowrap"
              >
                <Bed className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" /> Alojamientos a 10km
              </button>
              <button 
                onClick={() => handleNearbySearch(infoModal.place, 'eat')} 
                className="flex items-center justify-center gap-1.5 px-2 sm:px-3 py-3 bg-slate-50 text-slate-600 hover:bg-slate-200 hover:text-slate-800 rounded-xl transition-all font-bold text-[8.5px] sm:text-[10px] uppercase tracking-widest border border-slate-200 shadow-sm flex-1 whitespace-nowrap"
              >
                <Utensils className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" /> Comer a 10km
              </button>
            </div>
            <a 
              href={infoModal.place.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(infoModal.place.coords)}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-full sm:w-auto bg-black text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
            >
              <MapIcon className="w-3.5 h-3.5" /> Ver en Mapa
            </a>
          </div>
        </div>
      </div>
    )}

    {/* MODAL FAVORITOS (CREAR RUTA) */}
    {showFavsModal && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in text-slate-900" onClick={() => { setShowFavsModal(false); setShareExpanded(false); }}>
            <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-white/20 relative" onClick={e => e.stopPropagation()}>
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-fuchsia-50 text-fuchsia-700">
                  <h4 className="font-black uppercase italic flex items-center gap-2 leading-none lg:text-[22px] lg:text-[26px]"><Heart className="w-5 h-5 fill-current lg:w-7 lg:h-7 lg:w-9 lg:h-9" /> Crear ruta</h4>
                  <button onClick={() => { setShowFavsModal(false); setShareExpanded(false); }} className="p-2 hover:bg-fuchsia-100 hover:text-fuchsia-600 rounded-full transition-all text-fuchsia-300 lg:w-12 lg:h-12"><X className="w-6 h-6 lg:w-7 lg:h-7" /></button>
              </div>
              <div className="p-8 space-y-4 overflow-y-auto max-h-[60vh] text-left text-slate-800">
                  {favPlacesWithDist.length === 0 ? (
                      <div className="text-center py-20 text-slate-400">
                          <Info className="w-12 h-12 text-slate-200 mx-auto mb-4 lg:w-16 lg:h-16" />
                          <p className="font-bold uppercase tracking-widest text-[10px] lg:text-[14px] lg:text-[18px]">No has guardado parajes aún</p>
                      </div>
                  ) : (
                    <>
                      {favPlacesWithDist.map((p, idx) => (
                          <div key={p.id} className="relative">
                              {p.kmFromPrev && (
                                  <div className="flex flex-col items-center -mt-4 mb-4">
                                      <ArrowDown className="w-4 h-4 text-slate-300 mb-1 lg:w-7 lg:h-7" />
                                      <span className="text-[9px] font-black uppercase bg-slate-50 px-3 py-1 rounded-full border border-slate-100 lg:text-[14px] text-slate-400">A {p.kmFromPrev} km</span>
                                  </div>
                              )}
                              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white transition-all shadow-sm">
                                  <div className="flex items-center gap-4 flex-1">
                                      <div className={`w-3 h-10 rounded-full flex-shrink-0 ${categoryColors[p.category] || 'bg-indigo-500'}`}></div>
                                      <div>
                                          <div className="flex items-center gap-2 mb-1">
                                              <h5 className="font-black uppercase text-sm leading-tight lg:text-[18px] lg:text-[22px]">{p.name}</h5>
                                              <span className={`px-1.5 py-0.5 ${categoryColors[p.category] || 'bg-indigo-500'} text-white rounded text-[7px] font-black uppercase leading-none lg:text-[11px]`}>{p.category}</span>
                                          </div>
                                          <p className="text-[9px] font-bold uppercase lg:text-[13px] lg:text-[17px] mb-2 text-slate-400">{p.address}</p>
                                          <p className="text-[11px] italic leading-relaxed lg:text-[15px] lg:text-[19px] text-slate-500">"{p.note}"</p>
                                      </div>
                                  </div>
                                  <button onClick={() => toggleFavorite(p.id)} className="p-2 hover:bg-rose-50 rounded-lg transition-all font-black ml-4 text-rose-500">
                                      <X className="w-5 h-5 lg:w-7 lg:h-7 lg:w-9 lg:h-9" />
                                  </button>
                              </div>
                          </div>
                      ))}
                      <div className="pt-6 border-t border-slate-100 mt-8 text-center px-4 flex flex-col gap-3 text-white">
                          {(() => {
                            const favsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(getRouteQuery(favPlacesWithDist[0]))}&destination=${encodeURIComponent(getRouteQuery(favPlacesWithDist[favPlacesWithDist.length-1]))}${favPlacesWithDist.length > 2 ? `&waypoints=${favPlacesWithDist.slice(1,-1).map(p => encodeURIComponent(getRouteQuery(p))).join('|')}` : ''}&travelmode=driving`;
                            
                            return (
                              <>
                                <a href={favsUrl} 
                                   target="_blank" 
                                   rel="noopener noreferrer" 
                                   className="w-full bg-black text-white py-4 px-10 rounded-2xl font-black text-[14px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all lg:text-[16px] flex items-center justify-center gap-3 text-white">
                                  <img src="https://www.gstatic.com/images/branding/product/2x/maps_96dp.png" alt="G" className="h-4 w-auto lg:h-6 text-white" />
                                  Ver ruta
                                </a>
                                
                                <button 
                                  onClick={() => toggleShare("He generado esta ruta desde rutabia.com ¿La hacemos?")}
                                  className="w-full bg-indigo-50 text-indigo-700 py-3.5 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-sm hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2 mt-2"
                                >
                                  <Share2 className="w-4 h-4" /> Compartir Ruta
                                </button>
                                
                                {shareExpanded && (
                                  <div ref={shareIconsRef} className="flex flex-col gap-3 mt-3 mb-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-fade-in">
                                    <textarea 
                                      value={shareMessage}
                                      onChange={(e) => setShareMessage(e.target.value)}
                                      className="w-full p-3 text-[12px] lg:text-[14px] font-medium text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none h-20 shadow-inner"
                                    />
                                    <div className="flex items-center justify-center gap-3">
                                      <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage + ' ' + itUrl)}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-[#25D366] text-white rounded-full hover:scale-110 transition-transform shadow-md">
                                        <MessageCircle className="w-5 h-5" />
                                      </a>
                                      <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(itUrl)}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-black text-white rounded-full hover:scale-110 transition-transform shadow-md">
                                        <Twitter className="w-5 h-5" />
                                      </a>
                                      <a href={`mailto:?subject=${encodeURIComponent('Ruta por Segovia en Rutabia')}&body=${encodeURIComponent(shareMessage + '\n\n' + itUrl)}`} className="p-3 bg-rose-500 text-white rounded-full hover:scale-110 transition-transform shadow-md">
                                        <Mail className="w-5 h-5" />
                                      </a>
                                      <button onClick={() => handleCopyLink(itUrl)} className={`p-3 text-white rounded-full hover:scale-110 transition-transform shadow-md ${copied ? 'bg-emerald-500' : 'bg-slate-500'}`}>
                                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                      </div>
                    </>
                  )}
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 text-center text-slate-400">
                  <p className="text-[9px] uppercase tracking-widest font-bold lg:text-[13px] lg:text-[17px]">{favorites.length} parajes seleccionados</p>
              </div>
              <div className="flex justify-center mt-8 pb-12">
                <button 
                  onClick={() => { setShowFavsModal(false); setShareExpanded(false); }}
                  className="text-[10px] font-bold uppercase tracking-widest hover:text-indigo-600 transition-colors lg:text-[18px] font-black text-slate-800"
                >
                    Cerrar
                </button>
              </div>
            </div>
        </div>
    )}

    {/* MODAL RANDOM PLACE */}
    {randomPlace && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in text-slate-900" onClick={() => { setRandomPlace(null); setShareExpanded(false); }}>
            <div className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl border border-white/20 p-10 text-center relative text-slate-800" onClick={e => e.stopPropagation()}>
              <button 
                  onClick={() => { setRandomPlace(null); setShareExpanded(false); }} 
                  className="absolute top-6 right-6 p-2 hover:bg-indigo-50 hover:text-indigo-600 rounded-full transition-all z-10 font-black text-slate-400"
              >
                  <X className="w-6 h-6 lg:w-8 lg:h-8 lg:w-10 lg:h-10" />
              </button>

              <span className={`inline-block px-3 py-1 mb-4 ${categoryColors[randomPlace.category] || 'bg-indigo-500'} text-white text-[9px] font-black uppercase rounded-lg shadow-sm lg:text-[13px] lg:text-[17px]`}>{randomPlace.category}</span>
              <h3 className="text-2xl font-black uppercase mb-2 leading-tight lg:text-[28px] lg:text-[32px]">{randomPlace.name}</h3>
              <p className="text-xs font-bold uppercase mb-6 lg:text-[16px] lg:text-[20px] text-slate-400">{randomPlace.address}</p>
              <p className="italic text-sm mb-10 leading-relaxed lg:text-[18px] lg:text-[22px] text-slate-500">"{randomPlace.note}"</p>
              <div className="flex flex-col gap-3">
                  {(() => {
                    const randomUrl = randomPlace.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(randomPlace.coords)}`;
                    
                    return (
                      <>
                        <a href={randomUrl} 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           className="bg-black text-white py-4 px-10 rounded-2xl font-black text-[14px] shadow-xl hover:scale-105 transition-all lg:text-[16px] lg:text-[20px] flex items-center justify-center gap-3">
                          <img src="https://www.gstatic.com/images/branding/product/2x/maps_96dp.png" alt="G" className="h-4 w-auto lg:h-6" />
                          Ver sitio
                        </a>
                        
                        <button 
                          onClick={() => toggleShare("He visitado esta ubicación en rutabia.com ¿vamos?")}
                          className="w-full bg-indigo-50 text-indigo-700 py-3.5 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-sm hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2 mt-2"
                        >
                          <Share2 className="w-4 h-4" /> Compartir
                        </button>
                        
                        {shareExpanded && (
                          <div ref={shareIconsRef} className="flex flex-col gap-3 mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-fade-in">
                            <textarea 
                              value={shareMessage}
                              onChange={(e) => setShareMessage(e.target.value)}
                              className="w-full p-3 text-[12px] lg:text-[14px] font-medium text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none h-20 shadow-inner"
                            />
                            <div className="flex items-center justify-center gap-3">
                              <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage + ' ' + randomUrl)}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-[#25D366] text-white rounded-full hover:scale-110 transition-transform shadow-md">
                                <MessageCircle className="w-5 h-5" />
                              </a>
                              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(randomUrl)}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-black text-white rounded-full hover:scale-110 transition-transform shadow-md">
                                <Twitter className="w-5 h-5" />
                              </a>
                              <a href={`mailto:?subject=${encodeURIComponent('Un paraje de Segovia en Rutabia')}&body=${encodeURIComponent(shareMessage + '\n\n' + randomUrl)}`} className="p-3 bg-rose-500 text-white rounded-full hover:scale-110 transition-transform shadow-md">
                                <Mail className="w-5 h-5" />
                              </a>
                              <button onClick={() => handleCopyLink(randomUrl)} className={`p-3 text-white rounded-full hover:scale-110 transition-transform shadow-md ${copied ? 'bg-emerald-500' : 'bg-slate-500'}`}>
                                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                  
                  <button 
                      onClick={() => { setRandomPlace(null); setShareExpanded(false); }} 
                      className="text-[10px] font-bold uppercase tracking-widest hover:text-indigo-600 mt-8 transition-colors lg:text-[14px] lg:text-[18px] font-black text-slate-800"
                  >
                      Cerrar
                  </button>
              </div>
            </div>
        </div>
    )}

    {/* MODAL ITINERARY */}
    {itinerary && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in text-slate-900" onClick={() => { setItinerary(null); setShareExpanded(false); }}>
            <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-white/20 relative" onClick={e => e.stopPropagation()}>
              <button 
                  onClick={() => { setItinerary(null); setShareExpanded(false); }} 
                  className="absolute top-6 right-6 p-2 hover:bg-indigo-50 hover:text-indigo-600 rounded-full transition-all z-10 text-slate-400"
              >
                  <X className="w-6 h-6 lg:w-8 lg:h-8" />
              </button>

              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-indigo-50 text-indigo-700">
                  <h4 className="font-black uppercase italic flex items-center gap-2 leading-none lg:text-[22px]"><Route className="w-5 h-5 lg:w-7 lg:h-7" /> Ruta Zona {itinerary.zone}</h4>
              </div>
              <div className="p-8 space-y-6 overflow-y-auto max-h-[65vh] pb-12 text-left text-slate-800">
                  {itinerary.places.map((p, idx) => (
                      <div key={p.id} className="relative">
                          {p.kmFromPrev && (
                              <div className="flex flex-col items-center -mt-6 mb-4">
                                  <ArrowDown className="w-5 h-5 mb-1 lg:w-7 lg:h-7 text-black" />
                                  <span className="text-[9px] font-black uppercase bg-slate-100 px-3 py-1 rounded-full border border-slate-200 lg:text-[13px] text-black">A {p.kmFromPrev} km</span>
                              </div>
                          )}
                          <div className="flex gap-4 items-start p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                              <div className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-black flex-shrink-0 text-xs lg:w-10 lg:h-10 lg:text-[14px]">
                                {idx + 1}
                              </div>
                              <div className="flex-grow">
                                  <div className="flex items-center gap-2 mb-1">
                                      <h5 className="font-black uppercase text-sm leading-tight lg:text-[18px] text-slate-800">{p.name}</h5>
                                      <span className={`px-1.5 py-0.5 ${categoryColors[p.category] || 'bg-indigo-500'} text-white rounded text-[7px] font-black uppercase leading-none lg:text-[11px]`}>{p.category}</span>
                                  </div>
                                  <p className="text-[10px] font-bold mb-1 uppercase tracking-tight lg:text-[14px] text-slate-400">{p.address}</p>
                                  <p className="text-[11px] italic mb-3 leading-relaxed lg:text-[15px] text-slate-500">"{p.note}"</p>
                                  <a href={p.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.coords)}`} target="_blank" rel="noopener noreferrer" className="text-[9px] font-black uppercase tracking-widest hover:underline leading-none lg:text-[13px] text-indigo-600">Ver punto →</a>
                              </div>
                          </div>
                      </div>
                  ))}
                  <div className="pt-6 border-t border-slate-100 mt-8 pb-10 px-4 text-center text-white">
                      {(() => {
                          const itUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(getRouteQuery(itinerary.places[0]))}&destination=${encodeURIComponent(getRouteQuery(itinerary.places[itinerary.places.length-1]))}${itinerary.places.length > 2 ? `&waypoints=${encodeURIComponent(getRouteQuery(itinerary.places[1]))}` : ''}&travelmode=driving`;
                          
                          return (
                            <>
                              <a href={itUrl} target="_blank" rel="noopener noreferrer" className="w-full bg-black text-white py-5 rounded-2xl font-black text-xs text-center uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-900 transition-all flex items-center justify-center gap-3 active:scale-95 mb-4 lg:text-[16px] font-black text-white text-white text-white text-white text-white text-white"><img src="https://www.gstatic.com/images/branding/product/2x/maps_96dp.png" alt="G" className="h-4 w-auto lg:h-6" />Ver ruta</a>
                              
                              <button 
                                onClick={() => toggleShare("He generado esta ruta desde rutabia.com ¿La hacemos?")}
                                className="w-full bg-indigo-50 text-indigo-700 py-3.5 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-sm hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2 mt-2"
                              >
                                <Share2 className="w-4 h-4" /> Compartir Ruta
                              </button>
                              
                              {shareExpanded && (
                                <div ref={shareIconsRef} className="flex flex-col gap-3 mt-3 mb-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-fade-in">
                                  <textarea 
                                    value={shareMessage}
                                    onChange={(e) => setShareMessage(e.target.value)}
                                    className="w-full p-3 text-[12px] lg:text-[14px] font-medium text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none h-20 shadow-inner"
                                  />
                                  <div className="flex items-center justify-center gap-3">
                                    <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage + ' ' + itUrl)}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-[#25D366] text-white rounded-full hover:scale-110 transition-transform shadow-md">
                                      <MessageCircle className="w-5 h-5" />
                                    </a>
                                    <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(itUrl)}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-black text-white rounded-full hover:scale-110 transition-transform shadow-md">
                                      <Twitter className="w-5 h-5" />
                                    </a>
                                    <a href={`mailto:?subject=${encodeURIComponent('Ruta por Segovia en Rutabia')}&body=${encodeURIComponent(shareMessage + '\n\n' + itUrl)}`} className="p-3 bg-rose-500 text-white rounded-full hover:scale-110 transition-transform shadow-md">
                                      <Mail className="w-5 h-5" />
                                    </a>
                                    <button onClick={() => handleCopyLink(itUrl)} className={`p-3 text-white rounded-full hover:scale-110 transition-transform shadow-md ${copied ? 'bg-emerald-500' : 'bg-slate-500'}`}>
                                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </>
                          );
                      })()}
                      
                      <button 
                          onClick={() => { setItinerary(null); setShareExpanded(false); }} 
                          className="mt-6 hover:text-indigo-600 text-[11px] font-black uppercase tracking-widest transition-colors lg:text-[15px] text-slate-400"
                      >
                          Cerrar
                      </button>
                  </div>
              </div>
            </div>
        </div>
    )}

    {showScrollBtn && <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="fixed bottom-8 right-8 z-[100] w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all border border-white/10"><ArrowUp className="w-6 h-6" /></button>}

    {/* VISUALIZADOR DE MAPA */}
    {showVisualizer && (
      <div className="fixed inset-0 z-[3000] bg-white flex flex-col md:flex-row animate-fade-in">
        {/* Sidebar */}
        <div className="w-full md:w-[350px] lg:w-[400px] bg-white border-r border-slate-100 flex flex-col h-[50vh] md:h-full shadow-2xl z-10 relative">
           <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                 <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900 leading-none mb-1">Visualizador</h2>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Mapa Interactivo</p>
                 <button onClick={() => setShowVisualizer(false)} className="flex items-center gap-1.5 text-[#4338ca] hover:text-indigo-800 font-black text-[10px] uppercase tracking-widest transition-colors mb-2 text-left active:scale-95">
                    <ArrowLeft className="w-3.5 h-3.5" /> Volver a inicio
                 </button>
              </div>
              <button onClick={() => setShowVisualizer(false)} className="md:hidden p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"><X size={20}/></button>
           </div>
           
           <div className="p-6 md:p-8 flex-grow overflow-y-auto space-y-8">
              {/* Categorías */}
              <div>
                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 block">Categoría</label>
                 <div className="flex flex-col gap-2">
                    {['Todos', 'Historia', 'Ruinas', 'Industrial', 'Naturaleza'].map(cat => (
                       <label key={cat} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                          <input 
                            type="radio" 
                            name="vis_cat" 
                            checked={currentCategory === cat} 
                            onChange={() => setCurrentCategory(cat)} 
                            className="w-4 h-4 accent-indigo-600" 
                          />
                          <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">{cat}</span>
                       </label>
                    ))}
                 </div>
              </div>

              {/* Zona */}
              <div>
                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 block">Zona Cardinal</label>
                 <div className="relative">
                    <Compass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                    <select 
                      value={currentGeoZone} 
                      onChange={e => setCurrentGeoZone(e.target.value)} 
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none uppercase tracking-tight appearance-none"
                    >
                       <option value="Todos">Toda la provincia</option>
                       <option value="Norte">Norte</option>
                       <option value="Sur">Sur</option>
                       <option value="Este">Este</option>
                       <option value="Oeste">Oeste</option>
                    </select>
                 </div>
              </div>

              {/* Ecosistemas */}
              <div>
                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 block">Ecosistemas Segovianos</label>
                 <div className="relative">
                    <Trees className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                    <select 
                      value={currentEcosystem} 
                      onChange={e => setCurrentEcosystem(e.target.value)} 
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none uppercase tracking-tight appearance-none"
                    >
                       <option value="Todos">Todos los ecosistemas</option>
                       <option value="Sierra de Guadarrama">Sierra de Guadarrama</option>
                       <option value="Dehesas y praderas a pie de sierra">Dehesas y praderas a pie de sierra</option>
                       <option value="Lastras">Lastras</option>
                       <option value="Riberas">Riberas</option>
                       <option value="Tierra de Pinares">Tierra de Pinares</option>
                       <option value="Campo de cultivo">Campo de cultivo</option>
                       <option value="Sierra de Ayllón">Sierra de Ayllón</option>
                       <option value="Jardines, escombreras y cunetas">Jardines, escombreras y cunetas</option>
                    </select>
                 </div>
              </div>

              {/* Buscador */}
              <div>
                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 block">Buscar por texto libre</label>
                 <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                    <Search className="text-slate-400 w-4 h-4" />
                    <input 
                      type="text" 
                      value={searchTerm} 
                      onChange={e => setSearchTerm(e.target.value)} 
                      placeholder="Buscar..." 
                      className="bg-transparent border-none outline-none text-sm w-full font-bold text-slate-800" 
                    />
                 </div>
                 {searchTerm && filteredPlaces.length === 0 && (
                    <p className="mt-3 text-rose-500 text-[10px] font-bold uppercase tracking-widest animate-fade-in flex items-center gap-1.5">
                       <X className="w-3.5 h-3.5" /> No hay ubicación disponible
                    </p>
                 )}
              </div>
           </div>

           <div className="p-6 md:p-8 border-t border-slate-100 bg-slate-50 flex flex-col gap-4">
              <button onClick={() => setShowVisualizer(false)} className="flex items-center justify-center gap-1.5 text-[#4338ca] hover:text-indigo-800 font-black text-[10px] uppercase tracking-widest transition-colors active:scale-95 w-full">
                 <ArrowLeft className="w-3.5 h-3.5" /> Volver a inicio
              </button>
              <button 
                onClick={() => setShowVisualizer(false)} 
                className="w-full bg-black text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl flex justify-center items-center gap-2 active:scale-95 transition-transform"
              >
                 <ArrowLeft className="w-4 h-4" /> VER UBICACIONES
              </button>
           </div>
        </div>

        {/* Map Area */}
        <div className="flex-grow flex flex-col h-[50vh] md:h-full relative bg-slate-100">
           {/* Top Stats Bar */}
           <div className="absolute top-4 left-4 right-4 z-[400] flex justify-between items-center gap-4 pointer-events-none">
              <div className="bg-slate-900/90 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-4 pointer-events-auto border border-slate-800">
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold hidden sm:inline-block">Mostrando:</span>
                    <span className="text-sm font-black">{filteredPlaces.length} sitios</span>
                 </div>
                 <div className="w-px h-4 bg-slate-700 hidden sm:block"></div>
                 <div className="hidden sm:flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
                    <span className="bg-slate-800 px-2 py-1 rounded-md text-indigo-300">Cat: {currentCategory}</span>
                    <span className="bg-slate-800 px-2 py-1 rounded-md text-emerald-300">Zona: {currentGeoZone}</span>
                 </div>
              </div>
           </div>

           {/* OVERPASS API STATUS INFO */}
           {nearbySearch && nearbySearch.active && (
              <div className="absolute top-20 left-4 right-4 z-[400] flex justify-center pointer-events-none">
                  {nearbySearch.loading ? (
                      <div className="bg-indigo-600 text-white px-5 py-2.5 rounded-full text-[10px] uppercase tracking-widest font-bold shadow-lg animate-fade-in flex items-center gap-2 border border-indigo-400">
                          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Buscando {nearbySearch.type === 'sleep' ? 'alojamientos' : 'restaurantes'} a 10km...
                      </div>
                  ) : nearbySearch.elements && nearbySearch.elements.length === 0 ? (
                      <div className="bg-rose-600 text-white px-5 py-2.5 rounded-full text-[10px] uppercase tracking-widest font-bold shadow-lg animate-fade-in flex items-center gap-2 border border-rose-400">
                          <X className="w-3.5 h-3.5" />
                          No hay {nearbySearch.type === 'sleep' ? 'alojamientos' : 'restaurantes'} a 10km
                      </div>
                  ) : (
                      <div className="bg-emerald-600 text-white px-5 py-2.5 rounded-full text-[10px] uppercase tracking-widest font-bold shadow-lg animate-fade-in flex items-center gap-2 border border-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {nearbySearch.elements?.length} {nearbySearch.type === 'sleep' ? 'alojamientos' : 'restaurantes'} cerca de {nearbySearch.placeName}
                      </div>
                  )}
              </div>
           )}

           <div id="visualizer-map" className="absolute inset-0 z-0 outline-none"></div>
        </div>
      </div>
    )}
    
    <Suspense fallback={null}>
      <Analytics />
    </Suspense>
  </div>
);
};

export default App;