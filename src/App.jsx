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
  {
    title: "Dehesas y praderas a pie de sierra",
    desc: "Tierras de relieve plano y, por tanto, de fácil acceso para el hombre, las del piedemonte serrano, dedicadas principalmente a la ganadería, aparecen cubiertas por unas formaciones vegetales que evidencian la intervención humana, siendo la más representativa el monte hueco o adehesado, con pequeño número de árboles por unidad de superficie y abundante pasto. Donde los suelos son más frescos y profundos aparecen los sotos, también llamados fresnedas. A medida que la distancia a la sierra aumenta y la humedad disminuye, el fresno cede el espacio a la encina, gradación que se da asimismo con espinos, majuelos, escaramujos, zarzas, estepas y madreselvas. La segunda formación es la pradera, espesa cobertura herbácea."
  },
  {
    title: "Lastras",
    desc: "Las lastras, formadas por diferentes tipos de margas, cretas y calizas del secundario, se extienden por una estrecha franja que corre casi paralela y próxima a la sierra, desde Madrona hasta Siguero, y por una zona más dilatada que abarca el macizo de Sepúlveda, las Serrezuelas y los páramos de la Pedriza. Son espacios de gran interés geológico, con lapiaces y hoces tan pintorescas como las que han formado los ríos Duratón y Riaza. El árbol dominante es el enebro de bella y perfumada madera; en el matorral hay jabinos, chaparros y estepas; en los tomillares aparecen plantas aromáticas como la salvia, el tomillo y el espliego, y en las paredes rocosas de las hoces crecen plantas medicinales como el té de roca."
  },
  {
    title: "Riberas",
    desc: "El escalón más bajo de la geografía segoviana está ocupado por los valles, estrechos mientras los ríos discurren por rocas compactas y más anchos allí donde lo hacen por otros más sueltos y fáciles de erosionar. Los ríos Voltoya, Moros, Eresma, Pirón, Cega, Duratón y Riaza forman hermosas vegas. El agua es el elemento determinante de este ecosistema. Próximo al agua, el bosque de ribera está formado por un tupido matorral, a veces impenetrable, de zarzas, espinos, hiedras, aligustres, lúpulo y madreselvas, que rodean y ascienden por los troncos de sauces, olmos, fresnos y, sobre todo, álamos blancos y negros (chopos y pobos en lenguaje popular)."
  },
  {
    title: "Tierra de pinares",
    desc: "Hasta tiempos geológicos recientes, entre los ríos Voltoya y Duratón pervivió una vasta cuenca deprimida que se fue rellenando con arenas arrastradas por el viento. De suelos pobres y secos en superficie, aunque sí hay humedales y lagunas, en ella sólo pueden sobrevivir especies sobrias como los pinos a los que las gentes de la zona llaman negral si es resinero y albar si es piñonero, que dan nombre a la comarca y que, en ocasiones, ocupan hasta el 85% de muchos términos municipales situados en torno a Cantalejo, Cuéllar y Coca. Estos pinares son bosque abiertos, con árboles distanciados, permitiendo especies como la retama y el cantueso; es fácil ver muérdago en las copas."
  },
  {
    title: "Campos de cultivo",
    desc: "Unas 330.000 hectáreas, casi la mitad del territorio provincial, están dedicadas a los cultivos, principalmente de secano, aunque también los hay de regadío. Son tierras poco profundas y muy agotadas en nutrientes. La vegetación natural, bosques de encinas principalmente, ha desaparecido sustituida por especies cultivadas como los cereales, las legumbres y el girasol, con las que se mezclan especies antes omnipresentes y ahora amenazadas de desaparición por el uso generalizado de herbicidas, como la amapola, que tiñe de rojo los verdes trigales, la clavellina de bellas estrellas azules, la corregüela de flores blanco rosadas o las uñas gata."
  },
  {
    title: "Sierra de Ayllón",
    desc: "Tiene su comienzo en la falla de Grado del Pico, umbral de una cadena de alturas que van ascendiendo escalonadamente hasta los 2.262 metros del Pico del Lobo, y concluye en Somosierra. Hacia su parte central, por Riofrío de Riaza, sobre un suelo formado a partir de esquistos y pizarras hay bosquetes de hayas con sotobosque de brezos y arándanos, reliquia de otras épocas con mayor humedad; junto a los arroyos crecen tejos, abedules y serbales; y en el piedemonte, sobre suelos silíceos, la especie dominante es el roble (rebollo). Se extiende sobre 15.000 hectáreas, acompañado de brecina, gayuba y estepa."
  },
  {
    title: "Jardines, cunetas y escombreras",
    desc: "Forman los que podemos llamar ecosistemas urbanos, muy influidos por la acción del hombre que ha transformado enteramente el paisaje mediante movimientos de tierras. El diseño de jardines siempre va acompañado de la construcción de sistemas de riego artificial; épocas hubo en que estaban dirigidos a la obtención de plantas medicinales (\"jardín de la botica\"). En las cunetas hallan refugio especies autóctonas desplazadas de los campos de cultivo colindantes. Las escombreras, por último, cada día más controladas, son el hábitat más apropiado para otras especies interesantes desde el punto de vista medicinal, como los cardos y la ortiga."
  }
  
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
  { id: 7, title: "Fortaleza de Carrascal", author: "Martín P.", color: "bg-rose-100 text-rose-700", rating: 5, date: "2/5/2026", text: "Las vistas sobre el Duratón te quitan el aliento. Encontrar esto gracias a la plataforma ha sido un regalo. Una auténtica joya fronteriza." },
  { id: 8, title: "Fábrica La Julita", author: "Laura S.", color: "bg-emerald-100 text-emerald-700", rating: 4, date: "18/4/2026", text: "Interesante arquitectura industrial en Turégano. No me esperaba encontrar maquinaria tan bien conservada en un pueblo tan histórico. Muy ilustrativo." },
  { id: 9, title: "Convento de Santa Isabel", author: "Andrés V.", color: "bg-blue-100 text-blue-700", rating: 5, date: "10/3/2026", text: "El silencio alrededor del monasterio es sobrecogedor. Una parte de la historia de El Espinar que desconocíamos por completo hasta que usamos Rutabia." },
  { id: 10, title: "Despoblado de Guijasalbas", author: "Marta O.", color: "bg-purple-100 text-purple-700", rating: 4, date: "1/6/2026", text: "Llegar es toda una aventura. Estremecedor ver las calles marcadas en el suelo. La app es súper precisa con las coordenadas DMS." },
  { id: 11, title: "Esquileo de Santillana", author: "Pablo E.", color: "bg-amber-100 text-amber-700", rating: 5, date: "14/2/2026", text: "Increíble entender la magnitud del negocio de la Mesta. Las dimensiones del patio de esquileo de Revenga no dejan indiferente a nadie." },
  { id: 12, title: "Casa del Zorro Klim", author: "Carmen J.", color: "bg-cyan-100 text-cyan-700", rating: 5, date: "28/5/2026", text: "Un rincón de lo más peculiar frente al Alcázar. Estupenda la anécdota y las vistas. Ideal para hacer fotos impresionantes al atardecer." },
  { id: 13, title: "Lagunas de Cantalejo", author: "David G.", color: "bg-slate-100 text-slate-700", rating: 5, date: "5/6/2026", text: "Un verdadero oasis en la Tierra de Pinares. Perfecto para la observación de aves, las cigüeñas negras estaban ahí. Pura naturaleza segoviana." },
  { id: 14, title: "Tejar de Ramón Martín", author: "Lucía M.", color: "bg-orange-100 text-orange-700", rating: 4, date: "11/4/2026", text: "Una muestra fantástica del trabajo manual del barro. Los hornos morunos impresionan de cerca. Buen sitio para entender la arquitectura local." },
  { id: 15, title: "Ermita de San Medel", author: "Héctor B.", color: "bg-blue-100 text-blue-700", rating: 5, date: "19/5/2026", text: "Aislada en medio del mar de cereales. Nos encantó pasear por allí en primavera, todo verde y lleno de vida." },
  { id: 16, title: "Puerta de la Fuerza", author: "Elena C.", color: "bg-rose-100 text-rose-700", rating: 5, date: "3/3/2026", text: "Sepúlveda es preciosa, pero entrar por este arco defensivo te traslada al siglo XI. La cuesta es dura, pero vale el esfuerzo sin dudarlo." },
  { id: 17, title: "Molino de Potricos", author: "Raúl R.", color: "bg-emerald-100 text-emerald-700", rating: 4, date: "8/6/2026", text: "Un remanso de paz junto al río. Es una pena que no se pueda ver por dentro, pero el paraje es simplemente mágico." },
  { id: 18, title: "Iglesia de la Alameda", author: "Beatriz A.", color: "bg-amber-100 text-amber-700", rating: 5, date: "25/4/2026", text: "Ver esta iglesia con su pórtico sola en el despoblado impresiona. Ideal para amantes del románico que busquen tranquilidad absoluta." },
  { id: 19, title: "Estación de Maderuelo", author: "Víctor F.", color: "bg-cyan-100 text-cyan-700", rating: 4, date: "17/5/2026", text: "Un escenario melancólico brutal. Las vías oxidadas y el andén vacío son un poema al ferrocarril olvidado. Ruta muy diferente." },
  { id: 20, title: "Torre de Santa Marina", author: "Nuria S.", color: "bg-purple-100 text-purple-700", rating: 5, date: "10/6/2026", text: "El mudéjar de Cuéllar es top, pero esta torre aislada te da una perspectiva diferente de cómo era el barrio antiguo." },
  { id: 21, title: "Caserío El Salvador", author: "Iván P.", color: "bg-blue-100 text-blue-700", rating: 4, date: "21/4/2026", text: "Enorme granja que explica a la perfección el latifundismo. Muy didáctica la explicación de la aplicación. Merece la parada." },
  { id: 22, title: "Ermita de San Roque", author: "Silvia L.", color: "bg-rose-100 text-rose-700", rating: 5, date: "9/5/2026", text: "Rodeada de encinas centenarias espectaculares. El sitio transmite una tranquilidad increíble y su historia ligada a la peste es muy curiosa." },
  { id: 23, title: "Molino del Ladrón", author: "Tomás N.", color: "bg-emerald-100 text-emerald-700", rating: 5, date: "30/3/2026", text: "Nos costó un poco encontrarlo en Lastras, ¡pero el entorno del río Cega es brutal! Leyendas de bandoleros e ingeniería popular juntas." },
  { id: 24, title: "Casa Eraso", author: "Alba H.", color: "bg-amber-100 text-amber-700", rating: 4, date: "4/6/2026", text: "Una parada genial para los que hacen la ruta del Puerto de la Fuenfría. Entender que ahí paraba Felipe II impresiona. Buenas vistas." }
];
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
  {
    name: "Achicoria",
    scientificName: "Cichorium intybus L. (Compositae)",
    commonNames: "Almirón, amargón",
    botanicalDescription: "Es una planta vivaz, que puede alcanzar 1,50 m de altura. Su raíz es cilíndrica o cónica, larga y ramificada. Cuando se rompe, derrama un látex blanco de sabor amargo. Se observa una roseta basal de hojas provistas de un pecíolo alado, con tallos ramificados. Las hojas son alternas y sésiles y en las axilas de las hojas se desarrollan numerosas flores compuestas de color azul, raramente rosas o blancas. Los frutos son unos aquenios con 5 costillas. Florece de julio a septiembre.",
    usefulPart: "Hojas y raíces.",
    habitat: "Se extiende por pastos, praderas, cunetas, terraplenes, barbechos y terrenos baldíos, situados a baja altitud.",
    collection: "El tallo con las hojas se recoge de julio a septiembre, la raíz se desentierra en septiembre y octubre.",
    activeMonths: ['JUL', 'AGO', 'SEP', 'OCT'],
    phytology: "Tanto la raíz como las hojas presentan sabor amargo. La raíz contiene inulina, ácido clorogénico, principios amargos, alcoholes triterpénicos, azúcares, lípidos, prótidos y principios activos semejantes a la quinidina. Las hojas contienen ácido chicorésico.",
    properties: "La raíz actúa como estimulante del apetito, bacteriostática sobre todo frente a Brucellas y Salmonellas, hipotensora, bradicardizante y antiarrítmica. Las hojas son diuréticas, coleréticas, depurativas y laxantes, por lo que se emplean en problemas digestivos, alteraciones hepáticas, falta de apetito e hipertensión.",
    contraindications: "Ninguno conocido.",
    curiosities: "Las hojas jóvenes frescas se consumen en ensalada, aunque es más habitual la utilización de la endivia (Cichorium endivia), pariente cercana. Durante el siglo pasado Segovia fue una de las principales provincias productoras de achicoria de huerta, destinada principalmente al tostado de su raíz que se empleaba como sustitutivo del café."
  },
  {
    name: "Aciano",
    scientificName: "Centaurea cyanus L. (Compositae)",
    commonNames: "Azulejo, clavelina, peranzul",
    botanicalDescription: "Es una planta anual. La raíz, de forma ahusada, origina un tallo erecto. Las hojas son alternas, cuando son jóvenes tienen un aspecto ligeramente lanoso pero luego se vuelven lampiñas. Las hojas radicales son lanceoladas, las hojas caulinares son sésiles y lanceoladas. En el extremo de las ramas se encuentran las flores de color azul, raramente blancas, rosas o malvas. Los frutos son unos aquenios de aspecto sedoso, de color azul con acanaladuras blancas, provistos de un vilano amarillento. Florece de mayo a agosto.",
    usefulPart: "Capítulos florales.",
    habitat: "Es originaria de la región mediterránea septentrional. Se trata de una mala hierba que crece en cultivos de cereales, a orillas de carreteras y vertientes rocosas.",
    collection: "Se recolectan las flores durante el periodo de floración.",
    activeMonths: ['MAY', 'JUN', 'JUL', 'AGO'],
    phytology: "Olor prácticamente inapreciable, sabor mucilaginoso y suave. Es rica en flavonoides, taninos, mucílagos, saponinas y sales de potasio y magnesio.",
    properties: "Desde antiguamente se ha considerado una planta oftálmica, el agua de aciano se empleaba para curar las inflamaciones de los ojos y fortalecer y conservar la vista, sobre todo en personas ancianas. Además, esta planta es béquica, diurética, suavizante, astringente, antiséptica y antiarrugas.",
    contraindications: "Ninguno conocido.",
    curiosities: "Es una planta cosmética que se emplea frecuentemente en formulaciones de productos oculares como contorno de ojos. Antiguamente se utilizó en la fabricación de colorantes azules y aguas de colonia. También ha recibido el nombre de casselunette, que significa literalmente \"quiebra anteojos\" ya que dicen que los que la utilizan no necesitarán nunca usar gafas."
  },
  {
    name: "Agrimonia",
    scientificName: "Agrimonia eupatoria L. (Rosaceae)",
    commonNames: "Hierba de San Guillermo",
    botanicalDescription: "Es una planta vivaz de 50 a 80 cm de altura, provista de un vigoroso rizoma, simple o ramificado. El primer año, origina una roseta basal de hojas, después aparece un tallo erecto, ramificado y muy velloso. Las hojas son alternas y compuestas, sólo crecen en la parte inferior del tallo. Los folíolos son ovales y dentados. El haz del limbo es verde y tomentoso, mientras que el envés es velloso y de color gris. Las flores, situadas en el extremo de cortos pedúnculos, se agrupan en finas espigas. En la base, poseen una cúpula verde, con 5 pétalos amarillos, 10 estambres y un pistilo con dos estilos. Los frutos son unos pequeños aquenios. Florece de marzo a septiembre.",
    usefulPart: "Las hojas y la sumidad florida.",
    habitat: "Se extiende por praderas secas y pastos, orillas de caminos, matorrales y claros de los bosques caducifolios, prefiere sustratos ligeros y arcillosos.",
    collection: "Se recoge el tallo entero de las plantas en flor.",
    activeMonths: ['MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP'],
    phytology: "Olor débilmente aromático y sabor algo amargo. La planta es rica en taninos (4-10%), triterpenos, derivados flavónicos, principios amargos, esencia, sílice y vitamina C y K.",
    properties: "Por su abundante contenido en taninos presenta un importante efecto astringente, cicatrizante, antidiarreico y hemostático local. Se emplea vía oral para tratar diarreas, trastornos de la vesícula, afecciones de la garganta y boca como laringitis o faringitis (en forma de gargarismos). Es útil en el tratamiento de las rinitis alérgicas y del asma bronquial. Vía tópica se emplea como cicatrizante en el tratamiento de heridas en general y en compresas para tratar úlceras varicosas. Es un gran remedio en el tratamiento de encías inflamadas y se emplea también como baño de ojos contra la conjuntivitis.",
    contraindications: "Ninguna conocida.",
    curiosities: "Debe su nombre a Mitrídates Eupator, rey del Ponto y herbalista célebre. En la medicina China la agrimonia ocupa lugar destacado como antihemorrágico y se emplea en el tratamiento de la menstruación profusa."
  },
  {
    name: "Ajenjo",
    scientificName: "Artemisia absinthium L. (Compositae)",
    commonNames: "Asenjo, absintio",
    botanicalDescription: "Es una planta vivaz aromática y amarga. Mide de 60 a 100 cm de altura. Se observan rosetas de hojas que nacen de varias yemas del rizoma y uno o varios tallos de base leñosa. Las hojas radicales tienen largos pecíolos, son ovales, de color gris plata y están cubiertas de pelos y glándulas. Los tallos son tomentosos, de color gris claro y muy ramificados, en su extremo nacen unas panículas compuestas por gran número de pequeñas flores colgantes, de forma esférica, que están situadas en el extremo de cortos pedúnculos; son de color amarillo. Los frutos son unos aquenios ovales, de color pardo y finamente acanalados. Florece de junio a agosto.",
    usefulPart: "Hojas y sumidades floridas.",
    habitat: "Crece sobre peñascos en regiones secas, colinas cubiertas de maleza y terraplenes de carreteras y vías férreas. Prefiere los suelos ricos en calcio y nitrógeno.",
    collection: "Se recolecta cuando la planta está en plena floración, sobre mediados o finales de julio.",
    activeMonths: ['JUN', 'JUL', 'AGO'],
    phytology: "Presenta un olor aromático característico y fuerte sabor amargo. Es rico en aceite esencial que contiene entre otros tuyona, y en principios amargos como la absintina, caroteno, vitamina C y taninos.",
    properties: "Por su gran contenido en principios amargos es aperitiva, tónico-digestiva, estimulante del hígado y la vesícula biliar y carminativa, y se emplea para tratar afecciones del tubo digestivo, como la gastritis con hipoproducción de jugos gástricos. También se usa para eliminar gusanos intestinales, en particular Ascaris y Enterobius. Es desde la antigüedad planta predilecta de las mujeres ya que hace bajar el periodo, además se emplea durante el parto en forma de compresas para acelerar el nacimiento, y después de éste de forma interna y externa para expulsar las secundinas.",
    contraindications: "Debido a su elevado contenido en tuyona en casos de sobredosis o de uso demasiado prolongado, puede provocar vómitos, espasmos gastrointestinales o retención urinaria. La infusión de esta planta no contiene gran cantidad de tuyona.",
    curiosities: "En licorería se emplea la planta y su aceite esencial en la composición de bebidas amargas y aperitivas como el vermout o la absenta. Su nombre genérico Artemisia procede de la diosa a quién se dedicó la planta. El nombre de la especie proviene de la palabra absinthium, \"dulzor\", y del prefijo a, \"sin\", es decir, sin dulzor, indicándose el sabor amargo de la planta."
  },
  {
    name: "Amapola",
    scientificName: "Papaver rhoeas L. (Papaveraceae)",
    commonNames: "Ababol, maripola",
    botanicalDescription: "La amapola es una planta anual que puede alcanzar los 90 cm de altura. Presenta raíz fina y fusiforme, el tallo es simple o poco ramificado, erecto y velloso. Las hojas, a veces cortadas en gajos profundos, son alternas y punzantes, las inferiores están provistas de pecíolo, y las superiores son sésiles. Las flores se desarrollan en las axilas de las hojas, sobre largos pedúnculos erizados de cerdas rígidas. Las flores, de 10 cm de diámetro aproximadamente, son solitarias, colgantes cuando son jóvenes y erectas después. El cáliz es verde, compuesto por dos sépalos; los pétalos son delgados, enteros, de color rojo vivo y suelen presentar una mancha negra en la base. Se observa un gran número de estambres, casi negros, provistos de filamentos finos y planos. El ovario se transforma, una vez maduro, en una cápsula redonda y lampiña, que contiene unas semillas reniformes. Florece de mayo a julio.",
    usefulPart: "Los pétalos de las flores.",
    habitat: "La amapola es una de las consideradas malas hierbas que crece en sembrados y tierras incultas, prefiere regiones templadas de poca altitud.",
    collection: "Se recolectan los pétalos de las flores en las primeras horas de la mañana después de salir el sol, principalmente en el mes de mayo.",
    activeMonths: ['MAY', 'JUN', 'JUL'],
    phytology: "Sabor débilmente amargo y ligeramente mucilaginoso. Los pétalos son ricos en antocianósidos como la cianidina que le dan la coloración a los pétalos, también contiene alcaloides principalmente rhoeadina y papaverina y mucílagos.",
    properties: "Por sus propiedades como sedante ligero e hipnótico se emplea vía oral en el tratamiento de los trastornos del sueño y la ansiedad, encontrándose en numerosas mezclas sedantes para tomar en infusión. Se puede tomar también en forma de jarabe para calmar los accesos de tos en niños y ancianos, la bronquitis y los catarros pulmonares. En estos casos se puede mezclar con otras plantas como la malva o el malvavisco. En uso externo es recomendable aplicar compresas templadas de la infusión para tratar los párpados inflamados o irritados.",
    contraindications: "Ninguno conocido.",
    curiosities: "No es conveniente confundir la amapola con otras especies cercanas pero menos frecuentes, que sí son tóxicas, y que crecen también junto a los cultivos de cereales."
  },
  {
    name: "Arándano",
    scientificName: "Vaccinium myrtillus L. (Ericaceae)",
    commonNames: "Mirtilo, navia",
    botanicalDescription: "El arándano es un arbusto de hoja caduca, de 30 a 50 cm de altura, provisto de tallos rectos, cuadrangulares, muy ramificados y cubiertos por una fina corteza gris. Las hojas son alternas con pecíolos cortos y el borde ligeramente dentado, de forma oval o de corazón. Son suaves y de color verde claro volviéndose violáceas con el tiempo. Las flores son colgantes, solitarias y pedunculadas, presentan forma de cascabel y un color verde-rosa. Los frutos son unas bayas esféricas, negruzcas o azuladas, de carne jugosa. Florece de abril a junio, los frutos maduran a partir de julio.",
    usefulPart: "Los frutos y las hojas.",
    habitat: "Vive en bosques húmedos como hayedos o brezales húmedos, junto a los arroyos.",
    collection: "Las hojas se recogen de las ramas estériles. Los frutos se recolectan a finales del verano, cuando están maduros.",
    activeMonths: ['ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP'],
    phytology: "Las hojas presentan sabor amargo y astringente, los frutos son ligeramente agridulces y un poco astringentes. Las hojas son ricas en taninos catéquicos, leucoantocianósidos, flavonoides y ácidos orgánicos. Los frutos contienen hasta un 10% de taninos, antocianósidos, flavonoides, ácidos orgánicos, pectina y azúcares.",
    properties: "Las hojas se emplean externamente como astringente para enjuagues y lavados. Internamente en medicina popular destaca su uso como hipoglucemiante en tisanas antidiabéticas. Los frutos, por su elevado contenido en taninos se emplean en uso tradicional como antidiarreico. Actualmente se emplean más por la destacada acción de los antocianósidos sobre los vasos sanguíneos, en especial los capilares. Por este motivo extractos de esta planta son útiles en el tratamiento de miopía, retinopatías, hemorroides, insuficiencias venosas y cuperosis. Se puede emplear el fruto machacado en forma de tisana, tomar directamente el jugo del fruto, el fruto entero o la mermelada preparada con él.",
    contraindications: "Ninguno conocido.",
    curiosities: "Los frutos maduros se emplean en la elaboración de mermeladas y repostería en general."
  },
  {
    name: "Avena",
    scientificName: "Avena sativa L. (Graminaceae)",
    commonNames: "Avea",
    botanicalDescription: "Es una planta anual que en buenas condiciones de crecimiento puede alcanzar más de 1 m de altura. Tiene las hojas planas, ligeramente ásperas de hasta 45 cm de largo por 2 cm de ancho y la lígula corta. Las flores se agrupan de dos en dos en espiguillas colgantes de 17 a 30 cm de longitud, con dos o tres flores fértiles no articuladas. Florece a finales de la primavera o principios del verano.",
    usefulPart: "Partes aéreas de la planta verde y las semillas.",
    habitat: "Se cultiva para su consumo como cereal en tierras de labranza, se puede encontrar asilvestrada en baldíos, siendo entonces conocida como avena loca.",
    collection: "Se recolecta la parte aérea verde poco antes de la completa floración y las semillas cuando la planta tiene fruto a finales de verano.",
    activeMonths: ['MAY', 'JUN', 'JUL', 'AGO'],
    phytology: "Las semillas tienen un sabor ligeramente dulce y mucilaginoso. La planta verde contiene una cantidad importante de silicio, hierro, manganeso y cinc, las flores son ricas en flavonas y las hojas contienen saponinas. Las semillas contienen almidón, lípidos, sales minerales, fitosteroles y vitaminas A, B1, B2, PP, y trazas de vitamina E y D.",
    properties: "En medicina popular se emplea la planta verde como sedante en casos de agotamiento nervioso, insomnio y neurastenias. La infusión de la planta reduce la uricemia utilizándose como coadyuvante en el tratamiento de reumatismos y gota, también se emplea como diurético. Los baños de paja de avena se utilizan en casos de gota, reumatismos, parálisis musculares o afecciones cutáneas. Los frutos son remineralizantes y vitamínicos por lo que se emplean en casos de convalecencia y anemia. Toda la sumidad presenta propiedades diuréticas y tranquilizantes y es un tónico general del sistema nervioso. En uso tópico por sus propiedades demulcentes se emplea en eczemas, dermatitis, urticaria, pieles secas y sensibles, y especialmente en formulaciones para bebés.",
    contraindications: "Ninguno conocido.",
    curiosities: "La avena estaba considerada como planta invasora de otros cultivos de cereales y no fue hasta el año 100 a. C. cuando se empezó a cultivar. En uso culinario se emplea en la elaboración de papillas y alimentos infantiles. También es un componente importante de productos cosméticos como jabones, cremas o geles, indicados sobre todo para pieles secas y deshidratadas."
  },
  {
    name: "Bardana",
    scientificName: "Arctium lappa L. (Compuestas)",
    commonNames: "Lampazo, bardo, planta de los pegotes",
    botanicalDescription: "La bardana es una planta bienal, el primer año forma la roseta basal de hojas muy anchas, y el segundo año aparece el tallo robusto, que puede alcanzar hasta 1 o 2 m. de altura y de 2 a 3 cm. de grosor. El tallo es ramificado con hojas de gran tamaño, de forma acorazonada u oval, pecioladas, con el borde casi entero. Presentan el haz de color verde intenso mientras que el envés es blanquecino debido a los pequeños pelillos que presenta (tomento). Las flores se reúnen en capítulos globosos, rodeados de púas, en algunos casos punzantes. Son de pequeño tamaño y de color rojo púrpura. El fruto es un aquenio con vilano. Florece en primavera.",
    usefulPart: "Raíz.",
    habitat: "Esta planta vive en las orillas de los caminos, en las proximidades de los cercados, en terrenos baldíos, terraplenes, matorrales y lugares abandonados.",
    collection: "Se recogen las raíces de plantas de un año que no han florecido, se desentierran en otoño del primer año o al principio de la primavera del segundo año.",
    activeMonths: ['MAR', 'ABR', 'MAY', 'SEP', 'OCT', 'NOV'],
    phytology: "La raíz es dura y mucilaginosa con un sabor ligeramente dulce al principio y amargo después. Es rica en inulina (30-50%), mucílagos, trazas de aceite esencial, poliacetilenos, lactonas sesquiterpénicas, ácidos fenólicos, fitosteroles (betasitosterol y estigmasterol), compuestos insaturados: polienos y poliínos, taninos y sales potásicas.",
    properties: "La bardana presenta acción antibacteriana y antifúngica. Los ácidos fenólicos son responsables del efecto colerético y diurético. Los taninos, de su acción astringente y cicatrizante. La inulina y las sales de potasio le confieren acción diurética y las lactonas (principios amargos) un efecto aperitivo y digestivo. Se considera además una planta hipoglucemiante. Se emplea poco en infusión y popularmente se usa como depurativo en el tratamiento de problemas dermatológicos, como psoriasis, dermatitis seborreica, acné y eczemas.",
    contraindications: "Ninguno conocido.",
    curiosities: "Aparece en numerosas formulaciones cosméticas indicadas para pieles acneicas o seborreicas, ya que regula la cantidad de grasa de la piel. Algunos extractos de esta planta se emplean en preparados para estimular el crecimiento del cabello y aunque esta actividad no está científicamente demostrada este uso podría derivar de la teoría de los signos según la cual las fuerzas que causan el abundante pelillo que recubre la planta ejercerían la misma actividad en el hombre. Con sus frutos, llamados pegotes, los niños jugaban a tirárselos o a hacer muñecos o figuras."
  },
  {
    name: "Bolsa de pastor",
    scientificName: "Capsella bursa-pastoris (L.) MEDIK. (Cruciferae)",
    commonNames: "Zurrón de pastor, pan y quesillo",
    botanicalDescription: "Se trata de una planta anual o bienal de 60 cm de altura. Presenta raíz simple o poco ramificada, de color marrón amarillento y a veces ligeramente leñosa, puede originar una roseta de hojas y algunos tallos el primer año. Las hojas radicales son largas y lanceoladas, las hojas del tallo son sésiles, envainantes, lampiñas, pero cubiertas de pelos a lo largo de los nervios. El tallo principal es erecto y en su extremo crecen racimos de flores pequeñas, regulares y hermafroditas de color blanco. El fruto es una silicua aplanada de forma triangular y color verde a amarillo claro, pedunculada. Florece de marzo a noviembre.",
    usefulPart: "Se emplea todo el tallo con flores, frutos y hojas.",
    habitat: "Crece en jardines, tierras de cultivo y viñedos, bordes de caminos, terrenos baldíos y a lo largo de las carreteras.",
    collection: "Se recolecta el tallo con las flores y frutos desde la primavera a principios del otoño.",
    activeMonths: ['MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT'],
    phytology: "Tiene un sabor ligeramente picante y amargo. Es rica en aminas como colina, acetilcolina, tiramina; flavonoides, taninos, saponósidos y cantidades importantes de sales potásicas.",
    properties: "Presenta actividad hemostática por eso se ha empleado desde antiguamente para cortar hemorragias nasales y cicatrizar heridas. Por su acción oxitócica se utiliza para regular el flujo menstrual sobre todo en la pubertad o cuando es muy abundante y como tónico uterino. En medicina popular la planta también se emplea para tratar dismenorreas y en afecciones venosas.",
    contraindications: "Ninguno conocido.",
    curiosities: "Las hojas de la bolsa de pastor se pueden comer a modo de verdura."
  },
  {
    name: "Brecina",
    scientificName: "Calluna vulgaris L. (Ericaceae)",
    commonNames: "Brezo común, bruga, bercol, biercol, sardino",
    botanicalDescription: "La brecina es un arbusto que puede medir desde 15 cm hasta más de 1 m de altura. Se mantiene verde todo el año y presenta una cepa leñosa y tortuosa que se ramifica profusamente. Las ramas inferiores son rastreras, las hojas son alternas, densas y coriáceas, similares a agujas y presentan el borde enrollado. Están dispuestas en 4 filas, formando una cubierta densa sobre las ramas laterales. Las ramas están rematadas por flores dispuestas en racimos, son de color rosa púrpura, raramente blancas y nacen en el extremo de cortos pedicelos. El fruto es una cápsula que contiene numerosas semillas de color marrón. Florece en verano y otoño, desde junio hasta octubre según la localidad y a veces casi todo el año.",
    usefulPart: "Sumidades floridas.",
    habitat: "Crece en suelos ricos en sílice, peñascos, bosques claros, terrenos de pastos pobres, bosques en decadencia y forma a menudo extensos manchones en los suelos muy lavados y empobrecidos.",
    collection: "La planta se recoge en el momento de la floración, cortándose el tallo por la mitad de su longitud.",
    activeMonths: ['JUN', 'JUL', 'AGO', 'SEP', 'OCT'],
    phytology: "Sabor predominantemente astringente. La planta es rica en taninos (7%), arbutósido (que por hidrólisis, mediada por la flora intestinal, libera hidroquinona) y flavonoides como quercetósido y miricitrósido.",
    properties: "Debido a su contenido en flavonoides la planta es diurética. Los taninos ejercen una acción astringente, antidiarreica, hemostática local y cicatrizante, empleándose en casos de diarreas, úlceras de la piel, gingivitis o heridas. La hidroquinona actúa como antiséptica específica de las vías urinarias en casos de cistitis o uretritis.",
    contraindications: "Ninguno conocido.",
    curiosities: "Es una planta melífera importante de finales de verano. El nombre científico de este género parece derivar del griego callunein, que significa barrer, por haber sido empleada como otros brezos para hacer escobas."
  },
  {
    name: "Caléndula",
    scientificName: "Calendula officinalis L. (Compositae)",
    commonNames: "Maravilla",
    botanicalDescription: "La caléndula es una planta anual, aunque puede ser vivaz en las regiones cálidas. La raíz es de forma ahusada. El tallo puede ser erecto o trepador, tiene de 30 a 50 cm de altura, siendo generalmente ramificado en la parte inferior, anguloso y velloso. Las hojas son alternas y sésiles; por su forma son oblongas y espatuladas, enteras o ligeramente dentadas y vellosas. Las flores son de color amarillento o naranja. Los frutos son unos aquenios cóncavos y acanalados. Florece de julio a septiembre.",
    usefulPart: "Flores enteras.",
    habitat: "Crece espontáneamente en zonas incultas, se cultiva como ornamental en jardines.",
    collection: "Se recolectan las flores en el momento de la floración, siendo la mejor época el mes de agosto.",
    activeMonths: ['JUL', 'AGO', 'SEP'],
    phytology: "El olor es débil y el sabor algo amargo y salado. Contiene aceite esencial (0,1-0,4%), sesquiterpenos, flavonoides (rutósido), saponósidos (2-5%), alcoholes triterpénicos, esteroles, carotenoides, pigmentos xantofílicos, ácidos fenolcarboxílicos, taninos y polisacáridos.",
    properties: "Las flores presentan una clara acción antiinflamatoria y estimulan la cicatrización de heridas y la regeneración de la piel. Por este motivo la caléndula es útil en el tratamiento de afecciones de la piel que impliquen inflamación de los tejidos, descamación, picor, escozor o herida abierta, como en casos de eczemas, ulceraciones dérmicas, dermatitis, contusiones, picaduras de insectos, quemaduras o acné. Actualmente su uso está reducido casi exclusivamente a la vía tópica. Por vía interna sigue utilizándose popularmente para tratar problemas menstruales y digestivos. Se trata además de una planta cosmética que se utiliza en numerosas formulaciones indicadas sobre todo para pieles secas y sensibles.",
    contraindications: "Ninguno conocido.",
    curiosities: "Se emplea como colorante de la mantequilla y el queso, e incluso como sustitutiva del azafrán, aunque aporta un sabor diferente."
  },
  {
    name: "Cantueso",
    scientificName: "Lavandula stoechas L. (Labiatae)",
    commonNames: "Tomillo borriquero, tomani",
    botanicalDescription: "El cantueso es un arbusto ramoso que puede llegar a medir 1 m de altura. Sus ramas jóvenes son de color verde o rojizo con pelos blanquecinos. Las hojas nacen enfrentadas, formando a menudo fascículos; son largas y estrechas, de borde entero y forma lineal; tienen un color blanquecino o ceniciento. Las flores están apiñadas en densas espigas terminales de sección cuadrangular. La espiga está formada por entre 6 y 10 flores de color morado oscuro que se superponen de forma que resultan alineadas. El fruto está compuesto por 4 nuececillas alargadas. Florece en primavera a partir del mes de marzo.",
    usefulPart: "Flor.",
    habitat: "Es típica de la región mediterránea, crece en los matorrales abiertos, asociada a la jara común, jara con hoja de laurel y tomillo blanco.",
    collection: "Se recolecta la flor a finales de mayo y junio.",
    activeMonths: ['MAY', 'JUN'],
    phytology: "Olor característico de las lavandas, algo más alcanforado. La flor presenta sabor astringente y las hojas amargo. La flor de cantueso presenta una elevada cantidad de esencia rica en cineol, borneol, fenchona, alcanfor, acetato de bornilo y acetato de linalilo.",
    properties: "El cantueso pertenece a la familia de las lavandas, por lo que sus propiedades son muy semejantes. Se emplea vía oral en digestiones lentas y espasmos gastrointestinales. Unas gotas de su esencia mezclada con agua son útiles para lavar y desinfectar heridas y llagas debido a sus propiedades antiséptica y desinfectante.",
    contraindications: "Ninguno conocido.",
    curiosities: "Se emplea poco en fitoterapia. Se cultiva para la destilación de la flor y para utilizar la esencia obtenida en cosmética y perfumería."
  },
  {
    name: "Castaño de indias",
    scientificName: "Aesculus hippocastanum L. (Hipoocastanaceae)",
    commonNames: "Castaño",
    botanicalDescription: "El castaño de indias es un árbol de hoja caduca, de 30 m de altura, muy frondoso. La corteza se desprende en forma de pequeñas placas. Las hojas son opuestas y palmeadas y están constituidas por folíolos oblongos en número de 5 a 7, redondeados en la parte superior y finos en la base. Los folíolos miden 20 cm y son dentados irregularmente. Las flores son unisexuales, forman unas magníficas panículas cónicas. Son de color blanco con manchas rojas o amarillentas, dispuestas en forma simétrica, tienen 4 ó 5 pétalos y 7 estambres y una vez maduras se transforman en una cápsula de gran tamaño, esférica y espinosa, que encierra de una a tres semillas pardas. Florece en abril y mayo, los frutos maduran al final del verano y se mantienen largo tiempo en la planta.",
    usefulPart: "La corteza de las ramas, las hojas y las semillas.",
    habitat: "Es un árbol originario de Grecia que crece en suelos frescos y profundos de las laderas de valles de montaña, sin constituir nunca formaciones densas. En Segovia suele encontrarse como planta ornamental.",
    collection: "En el mes de marzo se arranca la corteza de las ramas que han sido podadas. Las hojas se recolectan en verano y las semillas en otoño.",
    activeMonths: ['MAR', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV'],
    phytology: "La corteza presenta un olor muy débil, ligeramente a moho y un sabor astringente y algo amargo. Tanto la corteza de las ramas como las hojas son ricas en heterósidos cumarínicos como esculósido o esculina, fraxósido y escopolamina, alantoína, taninos y quercetina. De las semillas se extraen algunos principios activos como la saponina o la escina, que se emplean para tratar afecciones venosas.",
    properties: "Tanto la hoja como la corteza presentan propiedades venotónicas, aumentando la resistencia de los capilares sanguíneos, por lo que se utilizan en diversas formulaciones para tratar hemorroides, varices y diferentes patologías venosas. También actúa como antiinflamatoria y presenta acción antiedematosa. En medicina popular se emplea como astringente para tratar diarreas, para casos de tos irritativa, y en uso externo para úlceras y afecciones cutáneas. Recientemente se ha demostrado que uno de sus principios activos, el esculósido, actúa como filtro solar absorbiendo las radiaciones ultravioletas nocivas.",
    contraindications: "Ninguno conocido.",
    curiosities: "Hippocastanum, el nombre latino de esta especie, significa castaño de caballo, ya que los turcos lo suministraban a sus caballos viejos con el fin de calmarles la tos y aliviarles el asma."
  },
  {
    name: "Celidonia",
    scientificName: "Chelidonium majus L. (Papaveraceae)",
    commonNames: "Hierba de las golondrinas, planta del yodo",
    botanicalDescription: "La celidonia es una planta vivaz, ruderal que puede alcanzar un metro de altura. Presenta una raíz cilíndrica y ramificada, impregnada de un látex naranja, alrededor de la cual crece una roseta de hojas lobuladas. Los tallos son muy ramificados, angulosos, huecos y lanosos, de los que nacen hojas alternas, bi o trilobuladas, de borde dentado. En las axilas de las hojas nacen las flores en umbelas poco densas, formadas por flores de largos pedúnculos, amarillas y regulares. El fruto es una cápsula larga y de color verde que se abre por dos valvas a partir de la base. Florece de mayo a septiembre.",
    usefulPart: "Sumidades floridas, látex fresco.",
    habitat: "Crece en terrenos baldíos, sombríos y frescos, bordes de caminos y escombreras. Le gusta arrimarse a muros, piedras y peñascos.",
    collection: "Se recolecta el tallo entero florido en primavera y el rizoma en el otoño.",
    activeMonths: ['MAR', 'ABR', 'MAY', 'SEP', 'OCT', 'NOV'],
    phytology: "Presenta un olor desagradable y tanto el látex fresco que rezuma al cortar el tallo, como las hojas, tienen sabor ácido y amargo. Esta planta es rica en alcaloides isoquinolínicos, como quelidonina, sanguinarina y queleritrina en mayor cantidad en la raíz y el rizoma. También contiene flavonoides, saponósidos y carotenoides.",
    properties: "Se emplea en alteraciones funcionales de la vesícula y las vías biliares, como colagogo, espasmolítico y analgésico ligero. En medicina popular el látex naranja se emplea para tratar la hiperqueratosis y las verrugas.",
    contraindications: "Ninguno conocido si se emplea en las dosis establecidas.",
    curiosities: "Pertenece a la familia de la amapola y con ella comparte la ligera acción sedante que presenta. Parece ser que los griegos le dieron este nombre, celidonia, que quiere decir golondrina, porque nace cuando vienen las golondrinas, y cuando se van, se seca."
  },
  {
    name: "Cola de caballo",
    scientificName: "Equisetum arvense L. (Equisetaceae)",
    commonNames: "Equiseto menor",
    botanicalDescription: "Se trata de una planta criptógama (no tiene hojas ni flores) y perenne. Es una planta vivaz de 10 a 60 cm de altura que constituye una mala hierba abundante. Presenta dos tipos de tallos, los que salen al principio de la primavera son tallos fértiles, que se diferencian de los tallos estériles en que son de color amarillo pardo, erectos, ovales y anillados, y alcanzan una altura aproximada de 20 a 50 cm. Al final de estos tallos fértiles se desarrolla una espiga cilíndrica con numerosos esporangios dispuestos en anillo. Cuando maduran las esporas, nacen los tallos estériles, que son estriados y huecos, con ramificaciones a modo de la cola de un caballo. La planta es fértil entre marzo y abril.",
    usefulPart: "Tallos estériles.",
    habitat: "Se cría en terrenos arenosos y arcillosos en los que exista humedad.",
    collection: "Se recolectan los tallos estériles cuando el tiempo es seco.",
    activeMonths: ['MAY', 'JUN', 'JUL', 'AGO'],
    phytology: "Los tallos no presentan un sabor u olor característico pero son crujientes al masticarlos. Es una planta muy rica en sustancias minerales (más de un 10%), especialmente en ácido silícico y sales de potasio y en menor cantidad presenta sales magnésicas. Además contiene otros principios activos como flavonoides, trazas de alcaloides y saponinas.",
    properties: "Se emplea vía oral como planta diurética en casos de inflamaciones de los riñones, infecciones bacterianas y para incrementar el flujo de las vías urinarias. En medicina popular se emplea también como hemostático en el tratamiento de hemorragias, heridas e incluso hemorroides o menstruaciones abundantes. Debido a su elevado contenido en sales minerales actúa remineralizando, regenerando y dando elasticidad al tejido conjuntivo.",
    contraindications: "Ninguno conocido.",
    curiosities: "El equiseto menor, que en tiempos prehistóricos tenía la talla de un árbol, se emplea con frecuencia en formulaciones cosméticas, como champúes para cabellos quebradizos y cremas antiarrugas o antiestrías."
  },
  {
    name: "Diente de león",
    scientificName: "Taraxacum officinale WEBER. (Compuestas)",
    commonNames: "Taraxacón, achicoria amarga, amargón",
    botanicalDescription: "El diente de león es una planta vivaz muy extendida. Presenta una raíz de tipo ahusada, marrón y poco ramificada, que deja escapar un látex blanco y amargo. La planta tiene una roseta radical de hojas simples, lobuladas y con dientes irregulares. La roseta basal produce varios tallos huecos y cilíndricos, coronados por grandes flores amarillas solitarias que se cierran al anochecer y cuando se avecina lluvia. Los frutos son unos aquenios ahusados, de color pardo-grisáceo y provistos de un pico y un vilano blanco en forma de paraguas. Florece abundantemente a principios de mayo, luego vuelve a florecer con menor intensidad en verano y otoño.",
    usefulPart: "Hojas y raíces.",
    habitat: "Crece en todas partes, en prados, pastos, jardines, tierras incultas y márgenes de caminos.",
    collection: "Las hojas se recolectan antes de la floración, la raíz en mayo o junio, periodo en el que son más ricas en látex, o en otoño hasta principios de invierno cuando la cantidad de inulina es máxima.",
    activeMonths: ['MAR', 'ABR', 'MAY', 'JUN', 'OCT', 'NOV', 'DIC'],
    phytology: "El olor es débil y característico, el sabor ligeramente amargo. En las raíces encontramos inulina, resina, principios amargos (taraxacina), triterpenos, fitosterol, carotenoides y potasio. Las hojas son ricas en flavonoides, cumarinas y vitamina B y C.",
    properties: "Se considera un excelente depurativo y drenador hepato-renal, por lo que se emplea en el tratamiento de hepatopatías, colecistopatías y trastornos digestivos especialmente relacionados con la digestión de las grasas. El principio amargo le convierte en estimulante del apetito y en medicina popular se ha utilizado como laxante suave y en el tratamiento de la gota y trastornos reumáticos. Externamente se emplea en afecciones cutáneas como acné, herpes o psoriasis. Generalmente se utiliza preparada en infusión para realizar tratamientos depurativos en primavera, especialmente en personas afectadas por problemas renales, hepáticos o de piel.",
    contraindications: "Está contraindicado en inflamaciones u oclusiones de las vías biliares.",
    curiosities: "El diente de león se cultiva para consumir las hojas frescas en ensalada por su gran contenido en vitaminas y minerales. La raíz recolectada en otoño se empleaba después de seca como sustitutivo del café."
  },
  {
    name: "Digital",
    scientificName: "Digitalis purpurea L., Digitalis thapsi (Escrofulariaceae)",
    commonNames: "Dedalera",
    botanicalDescription: "La digital es una planta bienal tóxica, provista de largos tallos. La raíz es fusiforme y el primer año desarrolla una roseta de hojas radicales, ovales u oblongas. Las hojas son pubescentes por el envés, de bordes irregularmente dentados y tienen una densa y prominente nervadura. El segundo año se desarrolla un tallo erecto y no ramificado, cubierto de hojas y rematado por una densa inflorescencia. Las flores son colgantes y están situadas únicamente en un lado; están dotadas de un corto peciolo y son de color rosa, roja o blanca y con unas manchas de color ocre. El fruto es una cápsula vellosa que encierra numerosas semillas en sus dos celdas. Florece de junio a agosto.",
    usefulPart: "Hojas de la roseta basal del primer año.",
    habitat: "La Digitalis purpurea puebla los bosques y laderas cubiertas de maleza. Prefiere los suelos no calizos de las regiones alpinas y subalpinas. La Digitalis thapsi crece en terreno calizo, soleado y árido.",
    collection: "Se recolectan las hojas radicales en agosto, cuando el tiempo es seco, hacia el mediodía.",
    activeMonths: ['AGO'],
    phytology: "Esta planta es rica en heterósidos cardiotónicos como digoxina, digitoxina, gitoxina, gitaloxina; flavonoides, digitricina y antraquinona.",
    properties: "Su principal actividad es como estimulante de la fuerza de contracción cardíaca de la fibra miocárdica. Esta planta no se emplea actualmente en fitoterapia directamente ya que se trata de una planta muy tóxica. Se cultiva para la extracción de sus principios activos cardiotónicos, que se emplean en formulaciones farmacéuticas, con dosificaciones muy precisas.",
    contraindications: "Planta extremadamente tóxica que no debe utilizarse sin prescripción médica.",
    curiosities: "Es una planta que no se ha utilizado hasta hace relativamente poco tiempo. Es en 1775 cuando se empiezan a usar las hojas de digital en un enfermo hidrópico y poco después y tras un estudio exhaustivo se incluye en las farmacopeas de la época."
  },
  {
    name: "Drosera",
    scientificName: "Drosera rotundifolia L. (Droseraceae)",
    commonNames: "Rocío de sol, hierba de la gota",
    botanicalDescription: "Pequeña planta vivaz y carnívora de corto rizoma provisto de raíces fibrosas de las que nace una roseta de hojas con largos pecíolos. Las hojas presentan forma de cuchara, lampiñas por el envés y cubiertas en los bordes de largos pelos glandulares rojos, que segregan un líquido pegajoso al que se quedan adheridos pequeños insectos. La planta descompone los insectos utilizando esta sustancia y más tarde reabsorbe los productos de la descomposición. A partir de la roseta se origina un tallo fino, brillante y sin hojas que se encuentra rematado por pequeñas flores blancas que se abren progresivamente a partir de la base. Los frutos contienen semillas pequeñas de color marrón. Florece en junio y julio.",
    usefulPart: "Toda la planta.",
    habitat: "Se trata de una planta protegida que crece en turberas y en las inmediaciones de praderas de suelos ácidos y húmedos.",
    collection: "Se recolecta toda la planta cultivada durante la floración.",
    activeMonths: ['JUN', 'JUL'],
    phytology: "El sabor es amargo y astringente. Como principal componente activo contiene derivados 1,4-nafto-quinónicos, flavonoides, quercetina, mucílago y enzimas proteolíticos.",
    properties: "La drosera presenta actividad mucolítica y espasmolítica por lo que se utiliza en el tratamiento de afecciones del aparato respiratorio, como bronquitis, asma y tos irritativa, sobre todo en pediatría. También actúa como bacteriostática inhibiendo el crecimiento de estreptococos, estafilococos y neumococos. Aplicada de forma externa es rubefaciente por lo que en medicina popular se empleaba para combatir callos y verrugas.",
    contraindications: "Ninguno conocido.",
    curiosities: "En medicina popular se preparaba un jarabe con la tintura de drosera para combatir la tos irritativa de los niños y la tos ferina."
  },
  {
    name: "Endrino",
    scientificName: "Prunus spinosa L. (Rosaceae)",
    commonNames: "Endrina, andrina, espino",
    botanicalDescription: "Arbusto o pequeño árbol espinoso de 1 a 5 m de altura, que forma grandes macizos. Las ramas son tomentosas y de color pardo grisáceo. Las ramas más viejas son de color gris oscuro y las laterales se transforman en espinas. Las hojas son alternas, oblongas, dentadas y vellosas. Las flores, regulares y hermafroditas, son aisladas o se agrupan en pequeños ramilletes. Se abren antes de que nazcan las hojas. El cáliz es entero y lanceolado; los pétalos son blancos y ligeramente ovales. Los pedúnculos de las flores son lampiños y relativamente cortos, tienen muchos estambres con filamentos largos y anteras amarillas. El fruto es una drupa esférica o ligeramente ovalada, recubierta por una piel negra o azulada, con reflejos grisáceos. Florece en marzo y abril. El fruto madura en septiembre u octubre.",
    usefulPart: "Flores y frutos.",
    habitat: "Vive en monte bajo, bosques, sotos y setos, se encuentra principalmente en llanuras y en las regiones subalpinas templadas.",
    collection: "Las flores se recogen al poco de abrirse, los frutos, en septiembre u octubre cuando están maduros.",
    activeMonths: ['MAR', 'ABR', 'SEP', 'OCT'],
    phytology: "Las flores tienen un ligero sabor amargo y un olor dulce característico. Los frutos maduros son dulces y astringentes. Las flores son ricas en quercitrina, rutina y heterósidos cianogenéticos. Los frutos contienen taninos, flobafeno, ácido málico, azúcar de caña, pectina, pigmento rojo y un diglucósido que por hidrólisis da glucosa y ramnosa.",
    properties: "La flor del endrino se utiliza en medicina popular como laxante, diurético, diaforético y expectorante, los frutos son astringentes y estimulantes del sistema nervioso central. Antiguamente se preparaba un jarabe con el jugo de los frutos del endrino, agua y azúcar que se utilizaba para combatir la diarrea. Las flores se pueden preparar en infusión para tratar el estreñimiento.",
    contraindications: "Ninguno conocido.",
    curiosities: "Los frutos se emplean macerados en aguardiente en la elaboración de pacharán casero."
  },
  {
    name: "Enebro",
    scientificName: "Juniperus communis (Cupressaceae)",
    commonNames: "Jabino, sabina, junipero, chaparro",
    botanicalDescription: "El enebro común es un arbusto que mantiene la hoja todo el año, dioico, y que no suele pasar de los 2-4 m de altura. Su porte es muy variable ya que las ramas pueden ser erguidas o casi colgantes. El tronco tiene la corteza de color pardo-rojizo. Las ramillas son angulosas y llevan las hojas agrupadas de tres en tres, son aciculares, rígidas y punzantes, casi planas y con una ancha banda blanquecina por el haz. Los enebros hembra producen conos globosos u ovoides con escamas carnosas soldadas entre sí, solitarios en la axila de las hojas, este cono pasa de un color verde claro a negro-azulado cuando está maduro. Florece en primavera, madurando los frutos en el otoño del segundo o tercer año.",
    usefulPart: "Fruto.",
    habitat: "Crece en todo tipo de terrenos, convive con los pinos negral, salgareño y silvestre, con la sabina albar, encinas, quejigos y hayas.",
    collection: "Se recolectan los frutos en otoño.",
    activeMonths: ['SEP', 'OCT', 'NOV'],
    phytology: "Los frutos tienen un olor aromático característico y un sabor dulce y especiado. Es una planta rica en aceite esencial (0.5-4%) que contiene pinenos, sabineno, limoneno, terpineol, borneol, geraniol, sesquiterpenos, resina, principio amargo, taninos y flavonoides.",
    properties: "Se emplea como diurético y antiséptico urinario caracterizado por provocar una gran eliminación de agua acompañado de una pequeña cantidad de sodio. También se ha empleado como digestivo, carminativo y expectorante o balsámico. La esencia de enebro, en uso externo, es rubefaciente, antimicótica y analgésica empleándose en casos de inflamaciones articulares o contracturas musculares. Antiguamente se utilizaba en forma de baños para aliviar la gota, macerado en vino como diurético, o quemado en las casas para desinfectar el ambiente.",
    contraindications: "Está contraindicado durante el embarazo y en afecciones renales de naturaleza inflamatoria. El uso prolongado o la sobredosificación provoca irritación renal, trastornos gastrointestinales y excitación del sistema nervioso.",
    curiosities: "La madera era apreciada en la provincia para hacer castañuelas, los frutos se emplean en la elaboración de la ginebra y la goma que exuda mezclada con aceite de semilla de lino se utilizaba como barniz líquido para dar lustre al hierro."
  },
  {
    name: "Espino blanco",
    scientificName: "Crataegus monogyna, o C. oxycantha (Rosaceae)",
    commonNames: "Majuelo, espinalbo, majoleto",
    botanicalDescription: "El espino albar es un arbusto o arbolillo de hasta 8 ó 10 m de altura, de hoja caduca, que se ramifica profusamente. Tiene el tronco pardo-grisáceo o ceniciento y las ramillas grisáceas, armadas de espinas cortas y fuertes. Presenta hojas simples, alternas, con pecíolo desarrollado y lámina obovada, hendida más o menos profundamente de tres a siete lóbulos desiguales y estrechada en forma de cuña en la base. Echa las flores con largos rabillos en inflorescencia tipo corimbo, de color blanco o blanco-rosadas, formando ramilletes olorosos. Los frutos o majoletas, son globosos u ovoides, de color rojo, del tamaño de un guisante, tienen un solo huesecillo y una carne harinosa de sabor dulce. Florece en abril o mayo y los frutos maduran en septiembre u octubre.",
    usefulPart: "Sumidad florida y fruto. Pocas veces se comercializan las flores solas, suelen ir acompañadas de las hojas, o incluso de los frutos.",
    habitat: "Crece sobre todo tipo de terrenos, en climas fríos y cálidos, en zarzales o bosques caducifolios claros, en torrentes y laderas de montañas.",
    collection: "La recolección de las flores enteras con las hojas se lleva a cabo entre abril y junio, los frutos se cogen a finales de verano.",
    activeMonths: ['ABR', 'MAY', 'JUN', 'AGO', 'SEP'],
    phytology: "El olor de las flores es dulce, perfumado y característico, el sabor algo dulce, amargo y astringente. Los frutos maduros son dulces y mucilaginosos, de sabor harinado. Tanto las sumidades floridas como los frutos son ricos en flavonoides, leucoantocianósido, feniletilamina, ácidos fenolcarboxílicos, aceite esencial, ácidos triterpénicos, ursólico y oleanólico.",
    properties: "La sumidad florida del espino blanco presenta acción cardiotónica, mejorando la circulación coronaria y la nutrición del miocardio, por lo que se emplea en las fases iniciales de la insuficiencia cardiaca, corazón senil y sensación de ahogo y opresión en la región cardíaca. Es ligeramente diurético, sedante, relajante muscular y antiespasmódico. En medicina popular se asocia a otras plantas sedantes como la valeriana o la pasiflora para tratar estados de nerviosismo o ansiedad. También se ha utilizado para regular la tensión arterial. Generalmente se utiliza la sumidad florida en infusión dos veces al día.",
    contraindications: "Ninguno conocido.",
    curiosities: "Los griegos y romanos relacionaban el espino con la esperanza, el matrimonio y la fertilidad, sin embargo con la entrada del cristianismo cambió esta imagen positiva, ya que según se dice, la corona de espinas de Jesús estaba hecha de espino blanco."
  },
  {
    name: "Espliego",
    scientificName: "Lavandula angustifolia MILL.",
    commonNames: "Lavanda, jalveo",
    botanicalDescription: "Se trata de un arbusto de 60 cm de altura que forma matas muy ramificadas, de ramas erectas y tallos cuadrangulares. Las hojas son opuestas, lineales, enteras, puntiagudas y enrolladas en los bordes, grises cuando son jóvenes y verde-grisáceas después. Las flores nacen en el extremo de los tallos, en forma de inflorescencias en espiga, más densa en el extremo que en la base. Presentan la forma típica de las labiadas y son de color gris azulado. Los frutos son unos aquenios brillantes. Florece a partir de julio.",
    usefulPart: "Sumidades floridas.",
    habitat: "Procede de la región mediterránea y crece en suelos calizos, pedregosos, situados en lugares protegidos y soleados.",
    collection: "Se recolecta la sumidad florida en verano, cuando la planta se encuentra en plena floración.",
    activeMonths: ['JUL', 'AGO'],
    phytology: "Tiene un olor aromático agradable característico y sabor amargo. La flor es rica en aceite esencial que contiene linalol, cineol, alcanfor, ácido ursólico, taninos, ácido rosmarínico, cumarinas y fitosteroles.",
    properties: "La planta actúa como sedante ligero, antiespasmódica, hipotensora y relajante del sistema nervioso central, por lo que se emplea en casos de nerviosismo, ansiedad, insomnio o migrañas. Además es carminativo y digestivo, útil en el tratamiento de espasmos gastrointestinales, flatulencia o malas digestiones. Externamente se emplea como antiséptico y cicatrizante para tratar heridas, quemaduras, úlceras, eczemas, acné o picaduras de insectos.",
    contraindications: "Ninguno conocido.",
    curiosities: "Esta planta se cultiva para la destilación de su aceite esencial, que se emplea con fines medicinales, o en la industria cosmética."
  },
  {
    name: "Frángula",
    scientificName: "Rhamnus frangula L. o Frangula alnus Mil. (Rhamnaceae)",
    commonNames: "Arraclán, sanguiño",
    botanicalDescription: "El arraclán es un arbusto o pequeño arbolillo que puede alcanzar hasta 4-5 m de altura. Sus ramas y a veces las hojas, suelen tomar un color rojizo. Las hojas caducas, son de color verde lustroso, de contorno ovalado, se presentan de forma alterna a lo largo de la rama y tienen un pecíolo bien desarrollado. Las flores son muy pequeñas, hermafroditas y nacen en grupitos poco numerosos de la axila de las hojas. El fruto es globoso, del tamaño de un guisante, al principio verdoso, después rojizo y finalmente negro, tiene poca carne y dos o tres huesecillos. Florece de abril a julio, los frutos maduran a partir de agosto.",
    usefulPart: "Corteza.",
    habitat: "Crece en suelos frescos y húmedos, principalmente silíceos, en bosques húmedos, orillas de arroyos y barrancos umbrosos.",
    collection: "Se recolecta la corteza de las ramas jóvenes entre marzo y mayo y se deja envejecer durante dos años, en este tiempo se oxidan los compuestos antraquinónicos a los que debe su acción.",
    activeMonths: ['MAR', 'ABR', 'MAY'],
    phytology: "Presenta un olor suave y característico y un sabor mucilaginoso, amargo y astringente. Esta planta contiene hasta un 7% de antraquinonas, en concreto frangulinas.",
    properties: "La corteza de frángula es laxante y actúa sobre todo a nivel del intestino grueso, siendo útil en casos de estreñimiento y en enfermedades en las que sea necesaria la eliminación de heces blandas. Bien dosificada no provoca ni irritación ni intolerancia, pero no se recomienda en tratamientos prolongados. En medicina popular también se emplea en casos de insuficiencia hepática, ya que facilita la secreción de la bilis.",
    contraindications: "Está contraindicada durante el embarazo, la lactancia y en oclusión intestinal. En caso de sobredosificación puede producirse un aumento de pérdida de agua y sales, sobre todo de potasio, por lo que puede potenciar la acción de los heterósidos cardiotónicos.",
    curiosities: "El carbón fabricado con su madera es muy adecuado para la fabricación de pólvora. Sus frutos se han empleado como tintoriales para teñir de verde."
  },
  {
    name: "Fresno",
    scientificName: "Fraxinus excelsior L. (Oleaceae)",
    commonNames: "Freix, fleja",
    botanicalDescription: "Árbol perteneciente a la familia del olivo y el jazmín, que puede alcanzar unos 40 m de altura y cuyo tronco puede sobrepasar 1 m de diámetro. La copa es ancha y de forma oval. Las ramas son gruesas, erectas, cilíndricas, de color gris y aplastadas a la altura de las yemas. Las hojas son opuestas y compuestas, tienen entre 9 y 13 folíolos puntiagudos, lanceolados y dentados. Las flores se desarrollan antes de la aparición de las hojas, en unas panículas, erectas en principio, pero colgantes más tarde, son hermafroditas o unisexuales. Los frutos son unos aquenios de color marrón, ovales y alados. Florece en abril y mayo, los frutos maduran en octubre.",
    usefulPart: "Hojas.",
    habitat: "Crece en los bordes de los cursos de agua y los fondos de los valles con suelos frescos. Puede encontrarse hasta altitudes superiores a 1000 m.",
    collection: "Las hojas se recogen en primavera o a principios de verano, en mayo o junio si el árbol es joven.",
    activeMonths: ['MAY', 'JUN'],
    phytology: "Las hojas contienen numerosos compuestos polifenólicos como pigmentos flavónicos y especialmente rutósidos, heterósidos cumarínicos y taninos catéquicos. Además contiene un 1% de ácido ursólico.",
    properties: "Las hojas preparadas en infusión actúan como antiartríticas y diuréticas por lo que se emplean en el tratamiento de reumatismos, crisis de gota, artrosis y en tratamientos de pérdida de peso. También es reconocida su acción como laxante y en medicina popular se emplea la corteza para disminuir la fiebre.",
    contraindications: "Ninguno conocido.",
    curiosities: "Ya Dioscórides reconocía los efectos de esta planta cuando decía de ella \"sus hojas aplicadas en forma de emplasto y bebidas con vino y también el zumo sacado de ellas, socorren a los mórbidos de víboras\"."
  },
  {
    name: "Fumaria",
    scientificName: "Fumaria officinalis L. (Papaveraceae)",
    commonNames: "Palomilla, gitanilla",
    botanicalDescription: "Es una planta anual de tallo ramificado. Mide entre 10 y 30 cm de altura. El tallo es erecto o ascendente, cubierto de hojas, anguloso, acanalado y hueco. Las hojas son pecioladas, alternas y profundamente divididas de color blanquecino. Las flores son simétricas y hermafroditas; están agrupadas en racimos dispuestos junto a las hojas del tallo. Los 2 pétalos externos son de color rojo púrpura y están encorvados hacia la parte anterior; los dos pétalos internos son oblongos y aparecen soldados en el extremo superior. El fruto es un aquenio en forma de riñón. Florece de mayo a agosto.",
    usefulPart: "Sumidad florida.",
    habitat: "La fumaria es una mala hierba que crece en jardines y campos de cultivo, también vive en solares, tierras de barbecho, márgenes de carreteras y cercados, e incluso en viñedos.",
    collection: "Durante la floración se recoge el tallo entero sin raíces.",
    activeMonths: ['MAY', 'JUN', 'JUL', 'AGO'],
    phytology: "El sabor de la sumidad florida es algo amargo y ligeramente salado. Esta planta es rica en alcaloides como protopina o fumarina, fumarilina y sinactina, contiene también flavonoides, ácidos orgánicos y mucílagos.",
    properties: "Se emplea como estimulante del flujo biliar y también en casos de hipersecreción biliar. La medicina popular le atribuye además actividad diurética y laxante y en aplicación externa se utiliza en casos de afecciones cutáneas.",
    contraindications: "Ninguno conocido.",
    curiosities: "Su nombre latín deriva de humo, por su apariencia de estar cubierta de humo. Antiguamente se extraía el jugo machacado de esta planta junto con berros, achicoria y lechuga, mezclado con agua y azúcar como tratamiento depurativo."
  },
  {
    name: "Galio",
    scientificName: "Galium verum L. (Rubiaceae)",
    commonNames: "Galio amarillo",
    botanicalDescription: "Planta vivaz de 20 a 100 cm de altura con rizoma rastrero. Los tallos son erectos y ascendentes, prácticamente lampiños, anillados y con cuatro finos abultamientos suberosos. Las hojas están agrupadas en verticilos alrededor del tallo, son estrechas, lineales y puntiagudas, de color verde oscuro y dotadas de una nervadura prominente. Los tallos terminan en densas panículas rematadas por flores pequeñas de cortos pedúnculos y de color amarillo. El fruto es un aquenio lampiño, liso y pardusco. Florece a partir de mayo.",
    usefulPart: "Sumidad florida.",
    habitat: "Esta planta crece en praderas, pastizales, bosques claros y peñascos.",
    collection: "Los tallos floridos se recolectan en junio, cortándolos a ras del suelo.",
    activeMonths: ['JUN'],
    phytology: "Es rica en flavonoides (hasta un 2%), sobre todo heterósidos de la quercetina y también contiene iridoides.",
    properties: "La planta se emplea como diurética y depurativa en el tratamiento de afecciones del riñón. En medicina popular se reconoce su actividad galactógena así como sus virtudes como planta diaforética, empleada en el tratamiento de gripes y resfriados. Externamente se ha utilizado en forma de emplastos para tratar dermatosis, heridas de lenta cicatrización y úlceras de la piel.",
    contraindications: "Ninguno conocido.",
    curiosities: "Su nombre científico galium, viene del griego \"gala\" que significa leche, ya que se utilizaba para cuajar la leche en la fabricación de quesos y requesones."
  },
  {
    name: "Gayuba",
    scientificName: "Arctostaphylos uva-ursi (L.) SPRENG. (Ericaceae)",
    commonNames: "Gayuvera, gayuvilla, uva de oso",
    botanicalDescription: "La gayuba es un arbusto de 15 a 20 cm de altura, de ramas postradas de 20 a 30 cm que salen de una raíz ramificada. Las ramas suelen ser radicantes y ascendentes en el extremo, son de consistencia dura, forma cilíndrica y color marrón rojizo. En el extremo de las ramas hay unos brotes verdes y ligeramente vellosos. El follaje es persistente. Las hojas son alternas y pecioladas, de color verde, oblongas y duras. El limbo es entero, verde oscuro y brillante por el haz, más claro y con una nervadura reticular prominente por el envés. En el extremo superior de las ramas se desarrollan las flores reunidas en grupos de 3 a 10, que forman pequeños racimos colgantes. Las flores son regulares y hermafroditas. El cáliz está profundamente dividido en 5 puntas obtusas. La corola está abombada y se encuentra dividida en 5 puntas vueltas hacia el interior. El fruto es una baya roja. Florece de abril a junio.",
    usefulPart: "Las hojas.",
    habitat: "Se extiende por los bosques de pinos, en los pastos mezclados con enebros y sobre las colinas rocosas. Es una especie protegida.",
    collection: "Las hojas se recogen de abril a junio de ramas estériles o de la parte inferior de ramas fértiles.",
    activeMonths: ['ABR', 'MAY', 'JUN'],
    phytology: "El sabor de las hojas es áspero y un tanto amargo. Esta planta es rica en derivados hidroquinónicos como la arbutina, taninos, flavonoides y triterpenos.",
    properties: "Las hojas actúan como desinfectantes de las vías urinarias por lo que se utilizan principalmente en casos de inflamaciones de vejiga y problemas de cistitis o uretritis.",
    contraindications: "Debido a su sabor amargo y áspero puede provocar náuseas y vómitos en personas con mucosa gástrica hipersensible. Esta planta no debe ser administrada con fármacos que produzcan acidez en la orina ya que mermará notablemente su efecto.",
    curiosities: "Hace años era recolectada por profesionales en la Sierra de Riaza para su uso medicinal, sin ningún tipo de control. El fruto se emplea para la elaboración de mermelada."
  },
  {
    name: "Genciana",
    scientificName: "Gentiana lutea L. (Gencianáceas)",
    commonNames: "Gengiba",
    botanicalDescription: "Planta herbácea, vivaz, que presenta una raíz larga, ramificada y gruesa, de color parduzco externamente y amarillento en su interior. El tallo de 1 metro de altura es erecto, no ramificado, redondo y hueco. Las hojas son abrazadoras, opuestas, elípticas y con nervios muy marcados. Las flores nacen en las axilas de las hojas, en grupos de 14 a 16 flores. Son pedunculadas y de color amarillo oro. El fruto es una cápsula ovoide y contiene numerosas semillas. Florece en julio.",
    usefulPart: "Raíz.",
    habitat: "Es una planta de montaña, crece en pastizales y laderas desde 1.500 a 2.500 m de altitud.",
    collection: "Se recolecta la raíz de plantas de cinco o más años, en otoño cuando la planta ha recogido en la raíz todo lo elaborado en verano, o en primavera antes de que florezca.",
    activeMonths: ['MAR', 'ABR', 'MAY', 'SEP', 'OCT', 'NOV'],
    phytology: "El olor de la raíz es ligeramente dulce y semejante al del higo seco, su sabor algo dulce se vuelve intensamente amargo después. Es rica en principios amargos de tipo secoiridoide, pigmentos derivados de las xantonas, azúcares, lípidos, fitosteroles, pectina y trazas de aceite esencial.",
    properties: "Debido al contenido en principios amargos es un excelente aperitivo que se emplea para estimular el apetito en casos de inapetencia. Además estimula las secreciones y motilidad gástrica y biliar y presenta un efecto antipirético suave y una acción reconstituyente y tónica. Los lípidos actúan como antiinflamatorios y cicatrizantes y la pectina tiene acción hemostática. Es una planta ampliamente comercializada en España en preparados fitoterápicos digestivos, antianoréxicos y para trastornos hepatobiliares.",
    contraindications: "La raíz de genciana está contraindicada en casos de úlceras gástricas y duodenales.",
    curiosities: "El nombre de genciana se debe a Gentio, rey de Illyria, de quien se dice que en el siglo II a. C. descubrió sus propiedades medicinales. También el famoso médico Sebastian Kneipp hacía alusión a esta planta cuando decía: \"y si el jardincito es tan pequeño, poned en él una salvia, un ajenjo y una genciana y tendréis toda una botica\"."
  },
  {
    name: "Gordolobo",
    scientificName: "Verbascum thapsus L. (Escrofulariaceae)",
    commonNames: "Verbasco",
    botanicalDescription: "Se trata de una planta bienal de hasta 2 m de altura. Su raíz ahusada y cilíndrica produce durante el primer año una roseta de hojas ovales. La roseta de hojas persiste durante el invierno y produce al segundo año un tallo erecto, simple y poco ramificado, tomentoso y de color blanco amarillento. Las hojas del tallo son alternas, sésiles, de forma oblonga o lanceolada y terminadas en punta. Los tallos y las ramas erguidas rematan en una larga espiga divida en ramilletes de 2 a 7 flores, sustentadas por cortos pedúnculos. Las flores son regulares y hermafroditas de color amarillo. El fruto es una cápsula marrón con dos celdas en las que se encuentran las semillas. Florece en junio.",
    usefulPart: "Flores y hojas del tallo.",
    habitat: "Crece es setos secos, tierras baldías, terrenos soleados y desérticos, aparece en bordes de carreteras y escombreras.",
    collection: "Las flores se recolectan en verano.",
    activeMonths: ['JUN', 'JUL', 'AGO'],
    phytology: "Presenta un suave olor a miel y un sabor algo dulce y mucilaginoso. Esta planta es rica en mucílagos, saponinas, esencia, pigmentos, carotenoides y flavonoides.",
    properties: "Debido a su contenido en mucílagos predomina la acción suavizante, emoliente, expectorante, béquica y fluidificante de las secreciones bronquiales, por lo que es útil vía oral en el tratamiento de irritaciones del aparato digestivo y del aparato respiratorio como bronquitis, tos, asma o resfriados. También actúa como antiinflamatoria, sudorífica y diurética. La infusión de las hojas y las flores debe filtrarse a través de un paño para eliminar la fina vellosidad que recubre toda la planta, ya que resulta irritante para la garganta. Vía tópica se puede emplear en irritaciones cutáneas, úlceras varicosas, llagas y maduración de granos.",
    contraindications: "Ninguno conocido.",
    curiosities: "La especie más abundante en la provincia es V. pulverulentum, que presenta las mismas propiedades que ésta, y que además se empleaba antiguamente para \"enverbascar las aguas\" frotándola sobre la superficie del agua, ya que resulta tóxica para los peces y así era más fácil su captura."
  },
  {
    name: "Hiedra",
    scientificName: "Hedera helix L. (Araliaceae)",
    commonNames: "Hédera",
    botanicalDescription: "Es una liana trepadora y rastrera que puede alcanzar 20 m de longitud. El tallo se sujeta gracias a unos zarcillos que permiten que la planta trepe por los troncos de los árboles, las tapias o se arrastre por el suelo. Las hojas son simples, perennes y opuestas, coriáceas y de color verde oscuro y brillante, más claro por el envés y con una nervadura prominente. La hiedra posee dos tipos de hojas: las situadas sobre ramas floridas son de forma oval-lanceolada y puntiagudas, el resto de las hojas tiene de 3 a 5 lóbulos. Las flores nacen sobre ramas viejas expuestas al sol. Están agrupadas en umbelas esféricas. Las flores son regulares y hermafroditas. Cuando la flor madura se transforma en una baya negra de aspecto escarchado, que contiene de 3 a 5 semillas en forma de riñón. Florece de agosto a octubre.",
    usefulPart: "Hojas.",
    habitat: "Vive en bosques, peñascos y zonas de matorrales, le gustan los lugares rocosos y pedregosos, preferentemente sombríos y puede crecer sobre las tapias. También se cultiva como planta ornamental para formar setos.",
    collection: "Las hojas se recogen en primavera y en verano.",
    activeMonths: ['MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP'],
    phytology: "El olor es casi imperceptible y recuerda al moho. El sabor de las hojas es astringente, amargo y algo picante y mucilaginoso. Las hojas son ricas en saponinas, flavonoides (rutósido), ácido caféico y clorogénico.",
    properties: "Las hojas de la hiedra se utilizan por su elevado contenido en saponinas como expectorante, mucolítico y espasmolítico en casos de tos irritativa o espasmódica, bronquitis y catarros crónicos. Es antiespasmódica sobre todo a nivel bronquial, vasoconstrictora, anticoagulante, antibiótica, emenagoga y en uso externo es analgésica. En medicina popular se empleaba además para tratar gota y reumatismos, así como en afecciones parasitarias, ulceraciones y quemaduras. Vía tópica se emplea en numerosas formulaciones para combatir la celulitis.",
    contraindications: "Las hojas frescas de hiedra y el jugo que se obtiene de ellas puede causar dermatitis de contacto. Los frutos actúan como vomitivos y purgantes resultando bastante tóxicos. Vía oral se utiliza poco siendo más común su utilización tópica.",
    curiosities: "La hiedra puede vivir muchos años, por este motivo los antiguos la consideraban símbolo de la inmortalidad. Según Dioscórides las hojas de la hiedra en uso externo cocidas en vino \"extirpan las manchas que imprimió el sol en el rostro\"."
  },
  {
    name: "Hinojo",
    scientificName: "Foeniculum vulgare L. (Umbeliferae)",
    commonNames: "Linojo, fiollo",
    botanicalDescription: "Es una planta herbácea bianual que presenta una raíz muy grande y bífida. Los tallos son ramosos, compactos y estriados y pueden alcanzar hasta 2 m de altura. Del tallo salen hojas envainantes en forma de finos hilos o en lacinias (finamente cortadas en tiras), de color verde claro. La flor se reúne en inflorescencias tipo umbela compuesta, es de pequeño tamaño y presenta 5 pétalos amarillos. El fruto es un diaquenio de forma ovoidal, con unas costillas aparentes por todo él. Florece a finales de julio, el fruto madura a finales del verano.",
    usefulPart: "Frutos y hojas.",
    habitat: "Crece en climas templados y en todo tipo de suelos, excepto los muy alcalinos o los demasiado secos.",
    collection: "Los frutos se recolectan a finales del verano y las hojas en primavera.",
    activeMonths: ['MAR', 'ABR', 'MAY', 'AGO', 'SEP'],
    phytology: "Presenta un olor anisado muy intenso y un sabor también anisado y ligeramente picante. Contiene gran cantidad de aceite esencial (2-6%), compuesto principalmente por anetol y fenchona. Además encontramos aceite graso, ácidos orgánicos y flavonoides.",
    properties: "Es una planta carminativa y estomacal por lo que se emplea en forma de infusión en casos de digestiones pesadas y flatulencia. Además actúa como expectorante y fluidificante de las secreciones y como estimulante de la secreción de leche en madres lactantes. Vía externa el cocimiento de los frutos se emplea en lavados oculares para ojos cansados y conjuntivitis.",
    contraindications: "Ninguno conocido.",
    curiosities: "La raíz del hinojo se utiliza como verdura desde la antigüedad y las hojas como condimento para aderezar pescados, salsas y sopas. Es una de las plantas que se utilizaban para cubrir el suelo por el que pasaba la procesión del Corpus debido a su agradable aroma anisado."
  },
  {
    name: "Hipérico",
    scientificName: "Hypericum perforatum L. (Hipericaceas o Guttiferas)",
    commonNames: "Hipericón, corazoncillo, hierba de San Juan, perforata",
    botanicalDescription: "El hipérico es una planta perenne, herbácea, de 25 a 90 cm de altura, que se caracteriza por presentar un tallo ramificado, rojizo, rígido, recorrido por dos líneas prominentes. Las hojas se dirigen siempre hacia la luz y son opuestas, pequeñas, enteras, con pequeñas glándulas o bolas secretoras resino-oleaginosas muy numerosas, translúcidas y visibles a contra luz. Las flores son vistosas, amarillas, reunidas en densas panículas terminales con pétalos de color amarillo dorado con puntos negros en los bordes. Se caracteriza porque las flores amarillas se tiñen de color rojo cuando se aplastan entre los dedos. El fruto es una cápsula ovoide con tres valvas. Florece en junio.",
    usefulPart: "Sumidad florida.",
    habitat: "Se cría en cualquier suelo, crece en linderos de caminos, setos, bosques, declives herbosos, campos secos, pastizales, terraplenes y collados.",
    collection: "Se recolectan las sumidades floridas cuando la planta se encuentra en plena floración, a mediados o finales de junio.",
    activeMonths: ['JUN', 'JUL'],
    phytology: "Olor semejante al heno recién cortado y sabor astringente. Es una planta rica en hipericina (0,1-0,3%), además contiene flavonoides, glucósidos de flavonol, ácidos fenil-carboxílicos, aceite esencial, cumarinas, carotenoides, fitosteroles, pectina, flobafeno.",
    properties: "Sobre todo por su contenido en hipericina presenta propiedades antidepresivas, sedante ligera y tranquilizante suave por lo que se emplea en casos de neurosis depresivas leves, durante el climaterio o en casos de agotamiento nervioso. Por otra parte presenta una clara actividad antiviral frente a retrovirus. En medicina popular se emplea también como antidiarreico, diurético y contra la enuresis, el reumatismo y la gota. En forma de aceite y aplicado vía externa se emplea como vulnerario, cicatrizante y como excelente regenerador cutáneo en casos de quemaduras y heridas.",
    contraindications: "La hipericina puede actuar como fotosensibilizante y puede interactuar con otros medicamentos como antidepresivos o anticonceptivos orales.",
    curiosities: "Su nombre científico Hypericum se originó a partir de hyper, \"sobre\" y eikon, \"imagen\"; y vendría a significar planta que está por encima de lo imaginable haciendo referencia a sus múltiples aplicaciones. El término perforatum hace referencia a la gran cantidad de agujeritos que presentan las hojas vistas al trasluz, dando la sensación de que estuviesen realmente perforadas."
  },
  {
    name: "Llantén",
    scientificName: "Plantago lanceolata L. (Plantaginaceae)",
    commonNames: "Plantago, arta de monte",
    botanicalDescription: "Es una planta vivaz de pequeño tamaño. Tiene un corto rizoma vertical que origina una roseta basal de hojas largas y lanceoladas provistas de nervios paralelos y más estrechas en la base. En las axilas de las hojas radicales nacen unos tallos de 50 cm de altura, con 5 acanaladuras longitudinales y cubiertos de pelos cortos rematados por una espiga cónica, que se alarga posteriormente, adquiriendo una forma cilíndrica. Las flores se desarrollan en las axilas de unas brácteas membranosas y pardas, son de color pardo. El fruto es una cápsula oval. Florece de mayo a septiembre.",
    usefulPart: "Se emplea la planta entera, especialmente las hojas.",
    habitat: "Puebla las praderas, caminos, jardines y bosques claros. Constituye una mala hierba en los sembrados y crece en terrenos baldíos y terraplenes de carreteras.",
    collection: "Las hojas se recolectan durante la floración.",
    activeMonths: ['MAY', 'JUN', 'JUL', 'AGO', 'SEP'],
    phytology: "El sabor de la planta es mucilaginoso, algo amargo y salado. La planta es rica en iridoides (aucubina), mucílagos, pectinas, taninos y sales minerales con porcentajes elevados de zinc y potasio.",
    properties: "Debido a la acción emoliente y suavizante de los mucílagos, esta planta se emplea en el tratamiento de la irritación de garganta en afecciones de las vías respiratorias. También es antiinflamatoria, bacteriostática y bactericida. En medicina popular el zumo de las partes aéreas frescas se utiliza externamente como vulnerario, antiinflamatorio y hemostático. En algunos países las hojas frescas trituradas y maceradas en agua se utilizan en cataplasmas contra úlceras varicosas, llagas y picaduras de insectos.",
    contraindications: "Ninguno conocido.",
    curiosities: "Existen varias especies de este género Plantago que presentan propiedades medicinales, en concreto el P. major L. o llantén mayor es además espasmolítico e hipocolesterolemiante. Otras especies como P. coronopus y P. subulata, son las denominadas hierbas de las almorranas y se emplean tradicionalmente en pueblos como Navalmanzano en el tratamiento de esta dolencia, guardándolas en una bolsita o un cajón y dicen que, según se va secando la planta se seca la almorrana."
  },
  {
    name: "Lúpulo",
    scientificName: "Humulus lupulus L. (Cannabaceae)",
    commonNames: "Betiguera, cervecera",
    botanicalDescription: "Es una planta vivaz, trepadora, que puede alcanzar 6 m de longitud. El rizoma es rastrero, muy ramificado y origina numerosas raíces. En primavera nacen unos tallos de tacto áspero, angulosos, erizados de pelos duros y de extremo ganchudo. Las hojas son opuestas y de largos pecíolos. La forma del limbo es muy variada: puede ser entero, cordiforme o lobulado, trímero o pentámero, es aserrado, glandular y rugoso por el envés. Las flores son unisexuales, la planta es dioica, las flores masculinas están dispuestas en unas panículas axilares o apicales y las flores femeninas se agrupan en cortas espigas en las axilas de las hojas. Las infrutescencias son unos conos colgantes, glandulares, de color entre verde claro y rojizo. Florece de mayo a julio y es fértil a finales de agosto y septiembre.",
    usefulPart: "Conos o piñas de la planta femenina y el lupulino, que se obtiene sacudiendo estos conos.",
    habitat: "Crece en zonas de matorrales de las riberas y en los bosques húmedos. Se cultiva extensamente con fines medicinales e industriales.",
    collection: "Los conos de las plantas femeninas se recogen en la madurez, a finales de agosto o principios de septiembre.",
    activeMonths: ['AGO', 'SEP'],
    phytology: "Tiene un olor fuerte y especiado y un sabor amargo. Los conos femeninos son ricos en resina, aceite esencial con carburos terpénicos, taninos, principios amargos y flavonoides.",
    properties: "Esta planta presenta acción sedante ligera por lo que se emplea junto a otras plantas sedantes en estados de nerviosismo, ansiedad o insomnio. También se emplea como antiespasmódico, tónico amargo y digestivo para estimular el apetito y la secreción de jugos gástricos. En medicina popular se emplea vía tópica en el tratamiento de úlceras y lesiones cutáneas.",
    contraindications: "El polen puede provocar dermatitis de contacto.",
    curiosities: "El lúpulo se emplea en la fabricación de la cerveza desde la época romana y alrededor del 1900 León era una de las principales zonas de cultivo de lúpulo para utilizarlo en la fabricación de dicha bebida, llegándose a denominar \"oro verde\". Observando la tendencia del lúpulo a enredarse en las ramas de sauces y otros árboles, Plinio lo llamó \"lobo de árbol\", y de ahí procede el nombre latino lupulus."
  },
  {
    name: "Malva",
    scientificName: "Malva sylvestris L. (Malvaceae)",
    commonNames: "Malva",
    botanicalDescription: "Es una planta bienal o vivaz, dotada de tallos que alcanzan entre 1,20 y 1,50 m de altura. La raíz es gruesa, fusiforme y está cubierta de numerosas raicillas laterales. El primer año, se origina una roseta basal con hojas pecioladas, palmadolobuladas (de 3 a 7 lóbulos) y redondeadas. El limbo es poco velloso, sin embargo los pelos son abundantes a lo largo de los nervios y en el pecíolo, donde se agrupan en manojos. El tallo es erecto o ascendente. En las axilas de las hojas del tallo nacen las flores, reunidas en grupos de 2 a 6 y provistas de pedúnculos relativamente largos, presentan un color entre rosa claro y púrpura y están recorridas por nervios de color violeta. Los frutos son planos en forma de panecillo y contienen de 15 a 18 semillas. Florece de junio a septiembre.",
    usefulPart: "Flores y hojas.",
    habitat: "Crece de forma espontánea en terrenos nitrogenados, próximos a los asentamientos humanos o cerca de los animales.",
    collection: "La recolección de las flores y las hojas se realiza en primavera, cuando empieza a salir la flor.",
    activeMonths: ['MAY', 'JUN', 'JUL', 'AGO'],
    phytology: "Tanto las flores como las hojas presentan sabor mucilaginoso. Toda la planta es rica en mucílagos (más de un 10%) de naturaleza urónica, que por hidrólisis dan ácido galacturónico, galactosa, arabinosa y ramnosa, además contiene antocianósidos.",
    properties: "Tanto las flores como las hojas se emplean como emolientes y suavizantes para la preparación de infusiones contra los resfriados, catarros o inflamaciones de la cavidad bucofaríngea. En medicina popular estaba muy extendido el uso de las cataplasmas de esta planta para tratar granos, o madurar diviesos. Vía tópica se emplea también en formulaciones cosméticas para el tratamiento de pieles irritadas, sensibles o secas.",
    contraindications: "Ninguno conocido.",
    curiosities: "La malva es una de las plantas medicinales más populares en la provincia de Segovia, donde se empleaba para los catarros e irritaciones de garganta. También se aplicaban cataplasmas en las mamas de las madres lactantes para evitar la retirada de la leche. Sus frutos, denominados panetes o panecillos, se comían."
  },
  {
    name: "Malvavisco",
    scientificName: "Althaea officinalis L. (Malvaceae)",
    commonNames: "Malvarisco, malvarizco",
    botanicalDescription: "El malvavisco es una planta vivaz, robusta, de 60 a 150 cm de altura, que posee una raíz carnosa, simple o ramificada, de color entre amarillento y marrón. El primer año sólo origina un tallo sin flores pero con hojas sustentadas sobre cortos pecíolos. Al segundo año surge un tallo erecto, simple o poco ramificado, cubierto de pelos estrellados y rematados por un racimo poco denso de flores. Las hojas inferiores son lobuladas (de 3 a 5 lóbulos), pero las superiores son ovales y puntiagudas, cordiformes e irregularmente dentadas. El limbo es tomentoso por las dos caras. Las flores aparecen en el extremo de cortos pedúnculos, son de color blanco o rosa claro, brillantes como la seda. El fruto, de forma discoidal, comprende entre 10 y 18 segmentos de color gris, reniformes, con una sola semilla. Florece de julio a septiembre.",
    usefulPart: "Se emplea sobre todo la raíz pero también las hojas.",
    habitat: "Se trata de una planta originaria de la región mediterránea, que crece frecuentemente entre las malezas de las orillas de los ríos o en las praderas húmedas y los pastos.",
    collection: "Las hojas se recolectan antes de la floración. Para recolectar las raíces primero se corta el tallo con hojas para reforzarlas, luego se desentierran en octubre o noviembre, o bien en primavera (marzo y abril).",
    activeMonths: ['MAR', 'ABR', 'OCT', 'NOV'],
    phytology: "Tanto las hojas como la raíz tienen sabor mucilaginoso y ésta última presenta un sabor algo dulzón. Es rica en mucílagos de naturaleza urónica, que por hidrólisis forman ácido galacturónico, ramnosa, arabinosa y hexosa, también contienen almidón, azúcares, pectinas y minerales.",
    properties: "Por su riqueza en mucílagos presentan propiedades emolientes, suavizantes, antitusivas y laxantes. Vía oral se emplea como antitusivo en caso de tos seca o para tratar la irritación de la faringe. También es útil en afecciones del aparato digestivo como gastritis, ardor de estómago, úlcera o estreñimiento. Vía tópica se emplea por su propiedad emoliente y suavizante para madurar granos, furúnculos o calmar las pieles irritadas y sensibles. Para este uso se recomienda la aplicación de las hojas machacadas de esta planta contra las picaduras de los insectos.",
    contraindications: "Ninguno conocido.",
    curiosities: "Esta planta presenta propiedades semejantes a la malva, también se emplea en cosmética, aunque a nivel facial resulta mejor la malva."
  },
  {
    name: "Manzanilla amarga",
    scientificName: "Chamaemelum nobile (L.) ALL. (Compositae)",
    commonNames: "Manzanilla romana, manzanilla fina",
    botanicalDescription: "Planta herbácea, vivaz, que puede alcanzar los 50 cm de altura, muy aromática y cubierta de pequeños pelos, de color verde claro. El rizoma profundo presenta numerosas ramificaciones y origina raíces rastreras y tallos aéreos. Los tallos que llevan las flores son extendidos y erectos. Las hojas son alternas, de color verde claro, bipinnadas, las inferiores con pedicelo y las superiores sésiles. Los tallos están rematados por unas cabezuelas solitarias, que presentan flores liguladas, periféricas, de lígulas blancas y flores centrales tubulosas amarillas. El fruto es un aquenio casi triangular, lampiño y brillante. Florece en el mes de julio.",
    usefulPart: "Capítulos florales.",
    habitat: "Crece en terrenos de pastos y terraplenes pedregosos o arenosos.",
    collection: "Se recolecta la cabezuela cuando la flor está en plena floración.",
    activeMonths: ['JUN', 'JUL'],
    phytology: "Presenta un olor dulce característico que no se corresponde con su sabor que es extremadamente amargo en toda la planta, en especial en las flores. Presenta una cantidad significativa de aceite esencial rico en camazuleno, bisabolol y angelato de isobutilo, también contiene lactonas sesquiterpénicas, flavonoides y cumarinas.",
    properties: "El aceite esencial, muy aromático, es responsable de su acción espasmolítica, carminativa y aperitiva por lo que se emplea generalmente en infusión en casos de flatulencia, malas digestiones, espasmos gastrointestinales, disquinesias hepatobiliares o jaquecas de origen hepatobiliar. Además es antiséptica, antiparasitaria y antiinflamatoria, útil en el tratamiento de dismenorreas o neuralgias. En aplicación tópica se utiliza en casos de párpados inflamados, conjuntivitis y limpieza de heridas.",
    contraindications: "Ninguno conocido",
    curiosities: "Es una de las plantas medicinales con mayor tradición de empleo en la provincia. Hoy en día se sigue utilizando tradicionalmente en las \"malas digestiones\" o en lavados oculares."
  },
  {
    name: "Marrubio",
    scientificName: "Marrubium vulgare L. (Labiatae)",
    commonNames: "Manrubio, meaperros",
    botanicalDescription: "Es una planta vivaz. El rizoma origina unos tallos ascendentes o erectos, de 30-50 cm de longitud, angulosos, huecos y tomentosos. Las hojas son opuestas, pecioladas y ovales, el limbo es tomentoso por las dos caras, blanco o gris por el envés, arrugado y de borde irregularmente dentado. Las hojas inferiores tienen un pecíolo largo, siendo el de las superiores de menor longitud. Las flores forman racimos densos y semiesféricos en las axilas de las hojas y son de color blanco. Los frutos son 4 aquenios oblongos y lisos, que permanecen encerrados en el cáliz hasta la madurez. Florece de junio a septiembre.",
    usefulPart: "Sumidad florida.",
    habitat: "Crece en zonas de maleza, pastizales y baldíos.",
    collection: "Las partes aéreas se recogen de julio a septiembre.",
    activeMonths: ['JUL', 'AGO', 'SEP'],
    phytology: "Presenta un sabor amargo y ligeramente picante. Esta planta es rica en principios amargos, sobre todo de marrubiina, alcoholes diterpénicos, pequeñas cantidades de alcaloides, trazas de esencias volátiles, taninos, saponinas y resina.",
    properties: "Por sus principios activos amargos se emplea principalmente como estimulante de la secreción biliar en trastornos digestivos y de la vesícula biliar. También se emplea como expectorante en casos de problemas de las vías respiratorias ya que fluidifica las secreciones bronquiales. En medicina popular se usa externamente en lesiones cutáneas, úlceras y heridas, y en algunos países se emplea como regulador de la frecuencia cardíaca.",
    contraindications: "Ninguno conocido.",
    curiosities: "Esta planta se suele confundir con el mentastro. Dioscórides la recomendaba también para provocar el menstruo después del parto e incluso para las mujeres que tenían un parto difícil."
  },
  {
    name: "Meliloto",
    scientificName: "Melilotus officinalis L. (Fabaceae)",
    commonNames: "Trébol de olor, trébol de San Juan",
    botanicalDescription: "Es una planta bienal, dotada de tallos ascendentes de 50 a 150 cm, que nacen de una raíz fusiforme. Los tallos son angulosos, lampiños o ligeramente vellosos en el ápice, ramificados y huecos. Las hojas son alternas, pecioladas y trifoliadas. Los folíolos son oblongos, ovales, puntiagudos, dentados, lampiños y con 6-13 pares de nervios laterales. En las axilas de las hojas superiores nacen unos racimos compuestos por 30-70 flores dispuestas en uno de los lados. Las flores son simétricas, colgantes, pedunculadas y de color amarillo. El fruto es una vaina oval, lampiña, arrugada, de color gris oscuro o negro en la madurez, que contienen una o dos semillas. Florece de mayo a septiembre.",
    usefulPart: "Sumidad florida.",
    habitat: "Vive en pastizales, laderas rocosas, barbechos, terraplenes de carreteras o de vías férreas y baldíos.",
    collection: "La sumidad florida se recoge de junio a septiembre.",
    activeMonths: ['JUN', 'JUL', 'AGO', 'SEP'],
    phytology: "Presenta un olor dulzón y un sabor amargo, ligeramente picante y salado. Esta planta es rica sobre todo en cumarinas y derivados cumarínicos, también contiene flavonoides y sapogeninas.",
    properties: "Por su actividad como anticoagulante, fluidificante sanguíneo, vasoprotector y venotónico, se emplea en el tratamiento de flebopatías o trastornos relacionados con insuficiencia venosa crónica, como dolores y sensación de pesadez en las piernas, calambres, picores o hinchazón. Se puede utilizar en estos casos tanto vía oral en forma de infusión, como vía tópica en forma de cataplasma. En medicina popular se emplea también como diurética, contra el insomnio, en las irritaciones de las mucosas nasales o en las inflamaciones de los ojos.",
    contraindications: "Ninguno conocido.",
    curiosities: "Se emplea también en formulaciones cosméticas indicadas para pieles sensibles que tienden a enrojecerse y sufren problemas de couperosis."
  },
  {
    name: "Melisa",
    scientificName: "Melissa officinalis L. (Labiatae)",
    commonNames: "Toronjil",
    botanicalDescription: "Es una planta herbácea y vivaz, que alcanza una altura de 30 a 90 cm. Los tallos son cuadrangulares, ramificados, erectos, con hojas opuestas, ovales, pecioladas y ligeramente dentadas, de color verde claro en el haz y más claro en el envés, son hojas tomentosas. Las flores nacen en las axilas de las hojas superiores, en verticilos de 6 a 12. Son de tonalidades claras, con la corola típica de las labiadas, cáliz bilabiado, asimétrico y tomentoso, de color blanco. El fruto es un tetraquenio de pequeño tamaño. Florece en junio-julio.",
    usefulPart: "Hojas.",
    habitat: "Es originaria de la región mediterránea. Crece en lugares frescos entre 0 y 1.000 metros de altitud. Prefiere un clima templado o templado-cálido y suelos de consistencia media.",
    collection: "Se recolectan las hojas frescas justo antes de la floración.",
    activeMonths: ['MAY', 'JUN', 'JUL'],
    phytology: "Desprende un agradable olor aromático a limón. El sabor es algo especiado pero no sabe como huele. Las hojas son ricas en aceite esencial (hasta un 0,2%) compuesto por citral, citronelal, acetato de eugenol y geraniol, además presenta otros componentes como polifenoles, taninos, flavonoides, ácido rosmarínico y triterpenoides.",
    properties: "Tiene acción sedante, espasmolítica, colerética y antibacteriana. La infusión de las hojas frescas se emplea en casos de nerviosismo, agitación, irritabilidad o insomnio. También es útil en trastornos gastrointestinales de origen nervioso, migrañas, cólicos, o para aliviar los dolores menstruales. También se ha demostrado su actividad como antivírico sobre todo frente a herpes virus. En medicina popular se emplea para tratar resfriados, como reconstituyente del organismo y en trastornos circulatorios como palpitaciones nerviosas.",
    contraindications: "Ninguno conocido.",
    curiosities: "La infusión de melisa debe prepararse con hojas recién recogidas, ya que las esencias volátiles que contiene tienden a desaparecer durante el secado. El médico musulmán Avicena recomendaba esta planta porque \"alegra el corazón\" y no es extraño que la planta se contase entre los principales ingredientes de los cordiales utilizados en la edad media, destinados a fortalecer el corazón y levantar el ánimo."
  },
  {
    name: "Milenrama",
    scientificName: "Achillea millefolium L. (Compositae)",
    commonNames: "Cientoenrama, hierba del golpe, triaca",
    botanicalDescription: "Es una planta vivaz, de 20 a 80 cm de altura. Su rizoma rastrero da lugar a unos tallos frondosos, simples, algunas veces lanosos y otras casi lampiños. Estos tallos están coronados por ricas panículas, compuestas por finas cabezuelas. Las hojas son alternas, lanosas en un principio, pero después vellosas, bi o tripinnadas y divididas en pequeñas puntas lanceoladas curvadas en el extremo. El limbo presenta forma lanceolada, las cabezuelas están provistas de involucros ovalados de color verde amarillento, bordeados de claro o de marrón oscuro. Las florecillas presentan pétalos blancos o rosas. Los frutos son unos aquenios de color gris plata, oblongos y aplanados, son lisos y alados en los bordes. Florece de junio a septiembre.",
    usefulPart: "Partes aéreas, en concreto las inflorescencias.",
    habitat: "Es una planta común en las praderas secas, pastos, orillas de caminos y bosques caducifolios. En sustratos calizos, presenta únicamente flores blancas, en suelos ácidos presenta también flores rosas.",
    collection: "Las inflorescencias se recogen de junio a septiembre.",
    activeMonths: ['JUN', 'JUL', 'AGO', 'SEP'],
    phytology: "El olor es ligeramente aromático y el sabor algo amargo. Contiene alrededor de un 1% de aceite esencial rico en camazuleno, borneol, terpenol, alcanfor, cineol, isoartemisia, cetona y trazas de tuyona; lactonas, flavonoides, taninos, cumarinas, saponinas, esteroles, aminoácidos, ácido salicílico y azúcares.",
    properties: "Presenta acción antiinflamatoria, espasmolítica, colerética, carminativa, cicatrizante, tónica, ligeramente antipirética y antimicrobiana. Vía oral en forma de infusión se emplea en casos de gripes y resfriados, y en general en enfermedades febriles ya que induce sudoración que baja la fiebre y elimina las toxinas. Se emplea además en digestiones difíciles, como estimulante de la secreción biliar, diarrea, flatulencia y en espasmos gastrointestinales. Externamente se emplea en compresas, enjuagues o baños en inflamaciones de la piel y mucosas y como cicatrizante de heridas. En medicina popular se emplea como hemostático en casos de hemorragias, en trastornos menstruales y en casos de sudoración excesiva.",
    contraindications: "En personas alérgicas a plantas de la familia de las compuestas puede provocar alteraciones cutáneas como picores o inflamación.",
    curiosities: "Es una planta muy utilizada en cosmética para tratar pieles sensibles. Su nombre latino deriva de la leyenda según la cual Aquiles curaba con esta planta las heridas de sus hombres."
  },
  {
    name: "Muérdago",
    scientificName: "Viscum album L. (Loranthaceae)",
    commonNames: "Almuérzago",
    botanicalDescription: "Arbusto semiparásito dioico, siempre verde, de 60 cm de altura, que vive sobre los troncos y ramas de los árboles. Los tallos se dividen desde la base en varios ramos desparramados, ahorquillados, cilíndricos, divididos por nudos y armados de púas pequeñas. Las hojas son opuestas, coriáceas, gruesas, carnosas, lanceoladas y de color verde amarillento, presentando nervios paralelos. Las flores son unisexuales y están reunidas en grupos de 3 a 5 en las axilas de las hojas en el extremo de los ramos, son muy pequeñas y poco visibles. Las flores se transforman en unas bayas pequeñas, translúcidas, de color blanco rosado, en cuyo interior se encuentra una sustancia viscosa. Florece en marzo y abril. Los frutos maduran en noviembre y diciembre.",
    usefulPart: "Se emplean las ramillas y las hojas.",
    habitat: "Es una planta parásita de distintos árboles, sobre todo del pino.",
    collection: "Se recolectan las ramas con hojas y con menor frecuencia los frutos.",
    activeMonths: ['ABR', 'MAY', 'JUN'],
    phytology: "Olor muy débil y característico, sabor muy amargo. La composición puede variar en función de la planta hospedante, pero sobre todo es rica en pectinas, polipéptidos, en especial viscotoxina, lignanos, derivados del ácido caféico, flavonoides, derivados de la quercetina y aminas biógenas.",
    properties: "Las hojas y ramas preparadas en infusión se utilizan en casos de tensión arterial elevada, aunque aún no se ha demostrado científicamente esta actividad. Por otro lado la administración en inyectable de las viscotoxinas sí que presenta un clara actividad antihipertensiva. Por otro lado los polipéptidos aislados manifiestan acción citotóxica administrados de forma parenteral. En medicina popular se utiliza en casos de vértigo, amenorreas y afecciones de las articulaciones.",
    contraindications: "Esta planta puede provocar escalofríos, fiebre alta, cefaleas, angina de pecho, trastornos circulatorios y reacciones alérgicas, por lo que no es muy recomendable su utilización sin prescripción médica. Los frutos son tóxicos.",
    curiosities: "A pesar de la toxicidad que presentan los frutos, en algunas localidades segovianas se comían y en otras se machacaban y se hervían en agua para fabricar la liga para cazar pájaros."
  },
  {
    name: "Nogal",
    scientificName: "Juglans regia L. (Juglandaceae)",
    commonNames: "Nogueira",
    botanicalDescription: "Árbol de hoja caduca que puede alcanzar hasta más de 20 m de altura con corteza lisa y gris. La copa es amplia y redondeada, con ramas gruesas y abiertas, las hojas son compuestas, imparipinnadas con 5 a 9 foliolos de contorno oval o lanceolado. Las flores masculinas nacen en las ramas del año anterior en inflorescencias cilíndricas colgantes. Las flores femeninas nacen en la terminación de las ramillas formadas ese mismo año en corto número. El fruto es una drupa subglobosa de unos 4 a 5 cm, con la piel verde, la cubierta externa termina secándose y tomando color negro, en su interior se encuentra el hueso leñoso que contiene en su interior una sola semilla en forma de cerebro, popularmente conocida como nuez. Florece en abril o mayo y los frutos maduran en otoño.",
    usefulPart: "Se emplean las hojas y el aceite extraído de la semilla.",
    habitat: "Crece en las huertas, márgenes de las tierras de labor y bosques húmedos.",
    collection: "Se recolectan las hojas y los frutos.",
    activeMonths: ['ABR', 'MAY', 'JUN', 'JUL', 'OCT'],
    phytology: "El olor es ligeramente aromático y el sabor astringente y algo amargo. Las hojas son ricas en taninos (10%), juglona, flavonoides, ácido gálico, ácido caféico, aceite esencial y ácido ascórbico. La semilla contiene ácidos grasos insaturados, ácido linoléico y linolénico.",
    properties: "Las hojas son sobre todo astringentes por lo que se emplean vía interna en casos de diarrea y en aplicación externa en el tratamiento de afecciones cutáneas como eczemas o ulceraciones de la piel ya que es además hemostático y cicatrizante. En medicina popular se utiliza para tratar inflamaciones gastrointestinales, como antihelmíntico, para depurar la sangre y como hipoglucemiantes, ya que tomadas en infusión hacen descender el nivel de glucosa en la sangre. El aceite de la semilla es emoliente y actúa disminuyendo el colesterol.",
    contraindications: "Ninguno conocido.",
    curiosities: "El aceite de nuez presenta aplicaciones industriales, ya que se emplea en la preparación de pinturas, jabones y barnices."
  },
  {
    name: "Orégano",
    scientificName: "Origanum vulgare L. (Labiatae)",
    commonNames: "Oregaño",
    botanicalDescription: "Es una planta vivaz, parecida a la mejorana. La raíz es fina, ramificada y leñosa. Los tallos son erectos o ascendentes, de 20 a 50 cm de altura, angulosos, vellosos, rojizos y ramificados en el ápice. Las hojas son opuestas, de cortos peciolos, anchas y ovales, de extremo puntiagudo o redondeado, enteras, vellosas y de borde ciliado, más claras y salpicadas de glándulas transparentes en el envés. Las flores están sustentadas por cortos pedúnculos y se hallan reunidas en grupos de 3, como máximo. La inflorescencia, una panícula, es de forma oval y presenta flores bilabiadas de color rosa o blanco. Los frutos son aquenios. Florece de julio a septiembre.",
    usefulPart: "Sumidades floridas.",
    habitat: "Puebla los bosques claros, zonas de maleza y laderas herbáceas soleadas y rocosas, se extiende sobre todo en las regiones templadas.",
    collection: "El tallo florido se recoge durante los meses de agosto o septiembre, el tallo debe cortarse a ras del suelo.",
    activeMonths: ['AGO', 'SEP'],
    phytology: "Toda la planta presenta un olor fuertemente aromático característico, el sabor es especiado, mentolado y picante. La planta entera es rica en aceite esencial compuesto principalmente por timol y carvacrol, ácidos-fenoles y flavonoides derivados del apigenol, luteolol, kaempherol y diosmetol.",
    properties: "Se trata de una planta estomáquica ya que favorece la secreción de los jugos gástricos y se emplea vía oral en trastornos digestivos como dispepsias, flatulencia o malas digestiones en general. También es antiespasmódica, antibiótica natural y vulneraria por lo que es útil en accesos de tos, faringitis, bronquitis e infecciones de las vías respiratorias. Vía tópica se emplea como cicatrizante y desinfectante.",
    contraindications: "Ninguno conocido.",
    curiosities: "Existe mucha tradición de recolectar esta planta con fines culinarios, ya que se emplea en la elaboración del adobo para el curado de la matanza. Antiguamente se empleó para aromatizar la cerveza."
  },
  {
    name: "Perpetua amarilla",
    scientificName: "Helichrysum stoechas L. (Compositae)",
    commonNames: "Siempreviva, helicriso, manzanilla de pastor",
    botanicalDescription: "Planta perenne de 5 a 50 cm de altura, con tallos erectos de base leñosa muy ramificada y con tomento blanco. Presenta hojas lineares, con los bordes enrollados hacia abajo, tomentosos en el envés y verdes con pilosidad más o menos densa y caediza en el haz que desprende un olor característico al frotarlas. Las flores son amarillas y crecen en capítulos de 4 a 6 mm, globulares, normalmente más anchas que largas y reunidas en corimbos al final de tallo. Los frutos son de color pardo y están cubiertos de pequeñas glándulas blancas. Florece de julio a septiembre.",
    usefulPart: "Se emplean las sumidades floridas de la siempreviva mediterránea (Helichrysum stoechas) o de la variedad europea (Helichrysum arenaria).",
    habitat: "Crece en lugares secos de terrenos arenosos, generalmente en pinares de pino resinero.",
    collection: "Se recolectan las sumidades floridas.",
    activeMonths: ['JUL', 'AGO', 'SEP'],
    phytology: "Las flores tienen un intenso olor dulce y sabor amargo. Son ricas en aceite esencial, flavonoides, fitosteroles y derivados de la acetofenona.",
    properties: "La planta actúa como antiinflamatoria, antitusiva, antifúngica, antibacteriana, expectorante y diurética. Se emplea en el tratamiento de gripes, resfriados, bronquitis, amigdalitis, rinitis, gastritis, hepatitis y cistitis. Popularmente se usa para disminuir la fiebre y contra los gusanos intestinales. En uso externo es útil para tratar eczemas, conjuntivitis e infecciones de la piel por hongos.",
    contraindications: "Ninguno conocido.",
    curiosities: "Dioscórides decía de esta planta que \"bebida con vino, es útil contra las dificultades de la orina, contra las mordeduras de las serpientes, contra la ciática y contra las rupturas de nervios\"."
  },
  {
    name: "Pino de Valsaín",
    scientificName: "Pinus sylvestris L. (Pinaceae)",
    commonNames: "Pino silvestre, pino albar",
    botanicalDescription: "Es un árbol monoico de 30 a 45 m de altura, de copa desplegada y tronco de hasta 1 m de diámetro. Su corteza es lisa y parda en un principio, escamosa después. Las ramas son lampiñas, de color verde amarillento con las yemas rojizas y un poco resinosas. Las ramas son verticiladas. Las hojas en forma de agujas se agrupan en haces de dos unidades; son de color gris verdoso, duras, rugosas y ligeramente punzantes con sección semiesférica o falciforme. Las flores (amentos) son unisexuales, los amentos masculinos contienen racimos de estambres llenos de un polen de color amarillo vivo y los amentos femeninos son de color rojo; aparecen aislados o reunidos en grupo de dos o tres en el extremo de las ramas formando unas piñas pardo grisáceas que maduran al cabo de dos años. Florece en mayo.",
    usefulPart: "Agujas, yemas y esencia de las hojas y ramas jóvenes y a veces su alquitrán.",
    habitat: "El pino albar vive en sustratos arenosos, laderas rocosas y turberas, forma bosques extensos en el sistema central. Además con esta especie se realizan cultivos extensivos para la obtención de su preciada madera.",
    collection: "Las hojas se recogen en primavera y las yemas justo antes de abrirse.",
    activeMonths: ['MAR', 'ABR', 'MAY'],
    phytology: "Olor fuertemente aromático y sabor fuerte, picante y mentolado. En las agujas contiene vitamina C, flavonoides, pinosilvina y esencia rica en pineno, limoneno y borneol. En las yemas glúcidos, pinitol, aceite esencial rico en pineno y limoneno, coniferósido y un principio amargo, la pinicrina. El alquitrán o esencia de trementina está compuesto por carburos, trazas de ácidos orgánicos, ácidos resínicos y fenoles y sus ésteres.",
    properties: "Por su contenido en vitamina C se emplea en el tratamiento del escorbuto. Es además antifúngico y antiinfeccioso por lo que vía oral se recomienda en afecciones de las vías respiratorias, sobre todo en casos de bronquitis, infecciones de las vías urinarias, reumatismos, cálculos biliares y parásitos intestinales (sobre todo tenia). Vía tópica se emplea contra la bronquitis, gripes, sinusitis, dermatosis y reumatismos, aplicada en forma de vahos, cremas o pomadas.",
    contraindications: "Puede producir irritación de las mucosas a grandes dosis, no administrar en caso de irritación renal.",
    curiosities: "La madera de esta especie de pino es de alta calidad y se emplea mucho en toda la zona en la construcción de viviendas, puertas y muebles. También se aprovecha la leña y la tea, y está presente en gran parte de las celebraciones y fiestas de la zona, como el mayo de pino o los concursos de corta de troncos en Valsaín."
  },
  {
    name: "Poleo",
    scientificName: "Mentha pulegium L. (Labiatae)",
    commonNames: "Menta-poleo, poliol",
    botanicalDescription: "Es una planta herbácea, vivaz, de 10 a 50 cm de altura, de tallos erguidos. Las hojas son pequeñas, opuestas, oval-lanceoladas, con algunos dientes en la base. Las flores se agrupan en las axilas de las hojas superiores del tallo y de las ramas; son pequeñas y de color lila o rosa pálido, a veces blancas. Florece de julio hasta septiembre.",
    usefulPart: "Hojas y sumidades floridas.",
    habitat: "Crece en zonas cercanas a cauces de ríos y terrenos húmedos, hasta los 1.500 m de altitud, en clima templado y templado-cálido, aunque resiste las heladas y fríos.",
    collection: "Se recolectan las hojas y sumidades floridas al inicio de la floración, en julio o agosto. Si la planta se va a destilar se recolecta en plena floración, unos 15 ó 20 días más tarde.",
    activeMonths: ['JUL', 'AGO'],
    phytology: "Olor característico de las mentas y sabor fresco y mentolado. La planta es rica en aceite esencial compuesto por cetonas terpénicas como la pulegona (70-90%), la mentona, isomentona, piperitona, acetato de metilo, limoneno y dipenteno.",
    properties: "Es antiespasmódica, estomáquica y carminativa por lo que se emplea vía oral en infusión para tratar problemas digestivos, como dispepsias, flatulencia o malas digestiones, también se emplea desde la antigüedad para curar los resfriados ya que estimula la sudoración y para aliviar los dolores menstruales. También es conocida su capacidad para ahuyentar las pulgas -de donde le viene el nombre pulegium-, y los mosquitos.",
    contraindications: "No es conveniente en embarazadas ya que puede provocar contracciones.",
    curiosities: "El nombre genérico proviene de Mintha, ninfa de la mitología griega, a quien la celosa Perséfone transformó en planta. Dioscórides reconocía sus virtudes medicinales y decía de él \"... tiene fuerza de calentar, de adelgazar y de digerir. Bebido provoca el menstruo, las pares y el parto\"."
  },
  {
    name: "Romero",
    scientificName: "Rosmarinus officinalis L. (Labiatae)",
    commonNames: "Romaní, alecrim, erromero",
    botanicalDescription: "Arbusto que permanece verde todo el año y presenta ramas leñosas de color parduzco. Suele alcanzar un metro y medio de altura, se ramifica profusamente y sus ramas son cuadrangulares y están cubiertas de pelillos blanquecinos. Las hojas son estrechas, casi cilíndricas, coriáceas y de color verde, lustroso por el haz y blanquecinas por el envés, nacen enfrentadas, son lineares y presentan el borde entero. Las flores nacen en cortos ramilletes axilares, y son de color azul claro, rosa o blanquecinas. El fruto está formado por cuatro nuececillas de color parduzco. Florece a principios de primavera y a finales de verano.",
    usefulPart: "Hojas.",
    habitat: "Crece en todo tipo de suelos aunque prefiere los calcáreos, forma parte de matorrales que se desarrollan en sitios secos y soleados, principalmente en encinares. En la provincia sólo la encontramos cultivada.",
    collection: "Se recolectan las hojas.",
    activeMonths: ['ABR', 'MAY', 'SEP', 'OCT'],
    phytology: "La planta tiene un olor intenso y algo alcanforado y el sabor es áspero, amargo y picante. Las hojas de romero son ricas en aceite esencial compuesto entre otros por pineno, canfeno, borneol, alcanfor y limoneno, ácidos fenólicos, flavonoides, principios amargos y ácidos triterpénicos.",
    properties: "Por su contenido en aceite esencial es una planta utilizada como carminativa y estomacal en casos de trastornos digestivos o flatulencia, como estimulante de las secreciones biliares y del apetito y como estimulante general del organismo. En uso externo, en forma de aceites para masaje, tintura o pomada es adecuado como analgésico en contusiones musculares, reumatismos o para preparar el músculo para el ejercicio. En medicina popular se emplea como estimulante del crecimiento del cabello o para fortalecerle en forma de fricciones o jabones y en compresas en casos de heridas o eczemas. La planta se emplea además como conservante y antioxidante natural y en la preparación de numerosos licores aromáticos.",
    contraindications: "No debe tomarse durante el embarazo.",
    curiosities: "Un refrán hace referencia a las propiedades de esta planta cuando dice \"de las virtudes del romero un libro entero\". El nombre latino del romero rosmarinus, significa rocío marino. Recibió este nombre por criarse junto a la costa. El néctar de sus flores es empleado por las abejas en la fabricación de la miel, siendo muy típica en la península la miel de romero."
  },
  {
    name: "Rosal silvestre",
    scientificName: "Rosa canina L. (Rosaceae)",
    commonNames: "Escaramujo, tapaculos",
    botanicalDescription: "Arbusto enmarañado, de hoja caduca que mide de 1 a 3 m de altura, con los tallos provistos de aguijones curvados en forma de garfio. Las hojas son compuestas, imparipinnadas, de 5 a 7 folíolos de forma aovada o elíptica, sin pelos y de margen aserrado y color verde intenso. Las flores nacen solitarias, con sépalos desiguales y 5 pétalos de color blanco o rosado. El fruto llamado escaramujo o tapaculo es carnoso y presenta en su interior numerosos huesecillos o semillas. Florece de mayo a julio y los frutos maduran al final del verano.",
    usefulPart: "Se emplean los escaramujos y eventualmente las hojas y las flores.",
    habitat: "Crece en espinares, setos, linderos de bosques y orillas de ríos.",
    collection: "Se recolecta el fruto a finales de verano.",
    activeMonths: ['SEP', 'OCT', 'NOV', 'DIC'],
    phytology: "El olor del escaramujo es afrutado y el sabor bastante ácido y astringente. El fruto es rico en ácido ascórbico o vitamina C, vitamina A, aneurina, riboflavina, pectina, taninos, ácidos orgánicos, carotenoides y trazas de aceite esencial, flavonoides y antocianósidos.",
    properties: "El escaramujo es vitamínico, aportando vitaminas A y C sobre todo, además es astringente y antidiarreico, protector capilar y venotónico. El fruto se emplea en la prevención de gripes y resfriados, convalecencia y astenia primaveral, en diarreas, fragilidad capilar, edemas, varices y hemorroides.",
    contraindications: "Ninguno conocido.",
    curiosities: "Su nombre científico Rosa canina, se debe según unos a que su fruto se empleaba para curar la rabia y según otros debido a que las espinas de este rosal recuerdan a los colmillos del perro."
  },
  {
    name: "Ruda",
    scientificName: "Ruta montana L. (Rutaceae)",
    commonNames: "Ruda montesina",
    botanicalDescription: "Planta vivaz de 20 a 80 cm de altura, con rizoma ramificado y raíces leñosas. El tallo liso y lampiño es de color verde y presenta muchas ramificaciones que se vuelven leñosas en la base. Las hojas son alternas divididas en segmentos angostos y finos donde aparecen pequeñas glándulas secretoras cargadas de esencia. Las flores se agrupan en corimbos en las axilas de unas brácteas, son de color amarillo, hermafroditas y uniformes. El fruto es globoso dividido en cuatro lóbulos redondeados. Florece de junio a agosto.",
    usefulPart: "Sumidades floridas.",
    habitat: "Crece sobre peñascos de regiones secas, en laderas soleadas entre matorrales y junto a otras aromáticas como el espliego o el té de roca.",
    collection: "Se recolecta cuando la planta está en plena floración.",
    activeMonths: ['JUN', 'JUL', 'AGO'],
    phytology: "Presenta un olor aromático fuerte y característico, el sabor es amargo e intensamente rutáceo. Esta planta es rica en aceite esencial compuesto principalmente por metil-n-nonilcetona, principios amargos, resina, taninos y rutina.",
    properties: "Por su contenido en rutina actúa aumentando la resistencia de los capilares sanguíneos y evitando hemorragias en casos de hemoptisis, nefritis hematúrica y en cirugía ocular. El uso más frecuente y popular de la ruda es como emenagoga ya que favorece la menstruación y en dosis elevadas ejerce una acción sobre las fibras musculares del útero que puede provocar el aborto. También se ha empleado en medicina popular como antiespasmódica, sudorífica y antihelmíntica. En uso externo aplicada en forma de emplastos provoca irritación local, por lo tanto actúa como rubefaciente útil en el tratamiento de dolores reumáticos.",
    contraindications: "Por sus efectos adversos si no se dosifica correctamente debe utilizarse solamente bajo prescripción médica.",
    curiosities: "Esta es una planta muy utilizada desde la antigüedad y de la que se decía que protegía al hombre de las fuerzas demoníacas, como se plasma en el refrán español \"en la casa donde hay ruda, no se muere criatura\". También se decía que las hojas de ruda metidas dentro de un higo con media nuez, con sal y comidas, eran remedio contra la pestilencia y cualquier veneno."
  },
  {
    name: "Salvia",
    scientificName: "Salvia lavandulifolia L. (Labiatae)",
    commonNames: "Salima, selima fina",
    botanicalDescription: "La salvia es un subarbusto de unos 70 cm de altura. Los tallos son erectos y ascendentes, leñosos en la base y muy ramificados. Los extremos de los tallos son herbáceos, tomentosos, ondulados, bastante redondeados y de color violeta. Las hojas son opuestas, muy pecioladas, de forma oval o lanceolada, finamente dentadas. Su color varía entre el verde mate y el gris plateado. Las flores, dispuestas en racimo, sólo aparecen en los brotes de dos años, son de color azul violáceo, aunque en ocasiones pueden ser blancas. El ovario da lugar a un tetraquenio negro. Florece en junio y julio.",
    usefulPart: "Hojas.",
    habitat: "Crece en suelos calizos y emplazamientos bien resguardados, se desarrolla igual de bien a pleno sol que en la sombra.",
    collection: "En mayo o junio se recogen las hojas o las ramas enteras, las hojas se pueden recolectar por segunda vez en septiembre.",
    activeMonths: ['MAY', 'JUN', 'SEP'],
    phytology: "Desprende un aroma fuerte y agradable y tiene un sabor algo picante y astringente. Es rica en aceite esencial (1-2%) que contiene tuyona, cineol, borneol, linalol, alcanfor, salveno y pineno; polifenoles y flavonoides, taninos, principios amargos (picrosalvina) y estrógenos.",
    properties: "Las hojas de salvia presentan acción digestiva, eupéptica y estimulante de la digestión por lo que se emplea en trastornos digestivos y flatulencia. También se le considera planta estrogénica y emenagoga utilizándose con frecuencia en problemas menstruales como dismenorreas, amenorreas y menopausia. Es especialmente efectiva frente a infecciones producidas por Staphylococcus aureus y frente a resfriados, laringitis y amigdalitis. Se emplea como desinfectante bucal en casos de encías inflamadas, llagas o úlceras y vía externa presenta una marcada actividad antirreumática y antitranspirante, útil en la hiperhidrosis de manos y pies. Se emplea tanto la infusión de hojas de salvia como su esencia pura para baños o masajes.",
    contraindications: "Ninguno conocido.",
    curiosities: "El nombre latino de la salvia da idea del valor que se le atribuye, ya que el término viene de salvare, salvar. La salvia más empleada y que aparece con frecuencia en las farmacopeas es la S. officinalis, pariente muy cercano de ésta, que presenta las mismas propiedades."
  },
  {
    name: "Sanguinaria",
    scientificName: "Paronychia argentea (Hacq.) Kerner. (Cariofilaceae)",
    commonNames: "Nevadilla",
    botanicalDescription: "Planta perenne, con tallos tumbados que crecen a ras del suelo, de 5 a 30 cm de longitud y muy ramificados. Presenta hojas oval-lanceoladas, de 4 a 8 mm. Las flores se agrupan en forma de inflorescencias densas de 8 mm de diámetro, que se hacen visibles cuando les da el sol. Florece de abril a julio.",
    usefulPart: "Se emplean las sumidades aéreas.",
    habitat: "Vive en suelos de gran pobreza, se encuentra sobre rocas y en terrenos áridos.",
    collection: "Se recolecta la inflorescencia en periodo de floración.",
    activeMonths: ['ABR', 'MAY', 'JUN', 'JUL'],
    phytology: "No se ha encontrado bibliografía acerca de la composición química de esta planta.",
    properties: "Es diurética, hipotensora, venotónica, antirreumática, anticatarral, depurativa y vulneraria. Se emplea en casos de cistitis, litiasis renal, como coadyuvante en tratamientos de sobrepeso, hipertensión, reumatismos, gripe, resfriados y bronquitis. En uso tópico se emplea en contusiones, heridas y quemaduras.",
    contraindications: "Ninguno conocido.",
    curiosities: "También crece en la provincia Paronychia capitata, planta muy parecida, que se diferencia en el cáliz de las flores. Popularmente se utilizan ambas indistintamente."
  },
  {
    name: "Santolina",
    scientificName: "Santolina chamaecyparissus (DC) Nyman",
    commonNames: "Hierba botonera, abrótano hembra",
    botanicalDescription: "Planta subarbustiva, vivaz, de vistoso follaje, que alcanza los 60 cm de altura y crece en grandes matas agrupadas. El tallo, leñoso en su base está recubierto por pequeñas hojas rugosas que presentan pubescencia plateada. Las inflorescencias en capítulos crecen al final de los tallos, son pequeñas florecillas de color amarillento que florecen en el verano.",
    usefulPart: "Capítulos florales.",
    habitat: "Originaria de la zona central y occidental de la cuenca mediterránea, crece en terrenos pedregosos y soleados, junto al cantueso.",
    collection: "Se recolectan los capítulos florales en los meses de junio y julio.",
    activeMonths: ['JUN', 'JUL'],
    phytology: "Las flores contienen aceite esencial rico en monoterpenos, sesquiterpenos, ácidos fenólicos, taninos y flavonoides.",
    properties: "A esta planta se le atribuyen las mismas propiedades que a la manzanilla actuando como antiinflamatoria, espasmolítica, aperitiva, digestiva y carminativa en el tratamiento de dispepsias hiposecretoras, flatulencia, espasmos gastrointestinales o gastritis. También actúa como vermífuga contra los gusanos intestinales y como expectorante. En uso externo es antiflogístico, vulnerario y cicatrizante.",
    contraindications: "Ninguno conocido.",
    curiosities: "Para preparar la infusión de esta planta se utilizaba un número impar de cabezuelas, 5 ó 7, ya que según los menorquines de lo contrario provocaría retortijones de tripas."
  },
  {
    name: "Saponaria",
    scientificName: "Saponaria officinalis L. (Cariophyllaceae)",
    commonNames: "Hierba jabonera",
    botanicalDescription: "Planta vivaz de 50 a 80 cm de altura, con rizoma rastrero, cilíndrico, ramificado y muy desplegado, que sustenta numerosos tallos lampiños. Presenta tallos estériles, con hojas opuestas y curvas y tallos florales, frondosos por abajo y poco ramificados que rematan en una inflorescencia tipo panoja. Las flores son regulares y hermafroditas, de color blanco o rosado. El fruto es una cápsula oval. Florece a partir de mayo.",
    usefulPart: "El rizoma y las raíces.",
    habitat: "Crece en terrenos húmedos, orillas de ríos, cunetas, terraplenes y baldíos.",
    collection: "El rizoma se recoge en otoño o a principios de la primavera.",
    activeMonths: ['MAR', 'ABR', 'SEP', 'OCT', 'NOV'],
    phytology: "La raíz presenta sabor dulce y amargo al principio y algo irritante después. Es una planta rica en saponinas, heterósidos, aceite esencial y resina.",
    properties: "Debido a su contenido en saponinas es una planta mucolítica y expectorante que se puede utilizar para tratar la bronquitis. Actualmente esta planta ha sido sustituida por otras para tratar este tipo de dolencias. Además actúa como antiinflamatorio y en medicina popular se emplea en el tratamiento de afecciones cutáneas, trastornos reumáticos e infecciones osteoarticulares.",
    contraindications: "Raramente puede provocar irritaciones gástricas.",
    curiosities: "Antiguamente se conocía a esta planta con el nombre de hierba lanaria ya que se empleaba su raíz para lavar y desengrasar la lana, porque agitada en el agua produce espuma."
  },
  {
    name: "Sauce",
    scientificName: "Salix alba L. (Salicaceae)",
    commonNames: "Sauce blanco, salze, salgueiro blanco",
    botanicalDescription: "El sauce blanco es un árbol dioico, de tamaño medio, que puede medir de 15 a 20 m de altura. Tiene un tronco robusto, derecho, con la corteza de color pardo-grisácea. Presenta la copa alargada, algo irregular, con ramas largas y flexibles. Las hojas son simples, alternas, caducas y presentan forma oblongo-lanceolada, con el margen finamente aserrado. Las flores que son unisexuales, están dispuestas en finos amentos colgantes. Los amentos masculinos tienen 2 ó 3 estambres, los amentos femeninos poseen un estilo corto y 2 estigmas divididos. El fruto es una cápsula. Florece en primavera, a partir de marzo.",
    usefulPart: "Corteza de las ramas.",
    habitat: "Crece en las riberas de los ríos, ascendiendo hasta una altura de 1.300 m. Habita en la mayor parte de Europa, Asia y norte de África y en la península por casi todas las regiones y provincias.",
    collection: "Se recolecta la corteza de las ramas de 2 a 4 años en marzo y principios de abril. También se recolectan las hojas y los brotes jóvenes.",
    activeMonths: ['MAR', 'ABR'],
    phytology: "Presenta un sabor predominantemente amargo. La corteza es rica en heterósidos fenólicos como salicósido, alcohol salicílico, salicornina, ácido salicílico, vainíllico y caféico.",
    properties: "Esta planta actúa como analgésico, antipirético, antiinflamatorio, antirreumático, antiagregante plaquetario y ligeramente sedante, por lo que vía oral se emplea en el tratamiento de los síntomas producidos por estados gripales, así como para aliviar todo tipo de dolores, sobre todo los articulares, dolor de espalda y reumatismo. Vía tópica se emplea como coricida, para eliminar verrugas, callos y durezas.",
    contraindications: "Puede provocar reacción alérgica en aquellas personas sensibles a los salicilatos.",
    curiosities: "Según la teoría de los signos, por vivir los sauces con los \"pies en el agua\", debían curar los \"pies mojados\", es decir los resfriados, la fiebre, la gripe y los dolores articulares. Además de esta especie, se emplean para la recolección de la corteza otras especies como S. fragilis, S. purpurea y S. daphnoides."
  },
  {
    name: "Saúco",
    scientificName: "Sambucus nigra L. (Caprifoliaceae)",
    commonNames: "Sabugo, canillero, sayugo, sabuco",
    botanicalDescription: "El saúco es un arbusto de hoja caduca, muy ramoso o un pequeño arbolillo que alcanza 5 m de altura, con la copa redondeada y muy densa. El tronco presenta la corteza corchosa, agrietada y de color pardo grisáceo. Las hojas son compuestas, de gran tamaño, formadas por 5 ó 7 hojuelas dispuestas por parejas, con una impar en la terminación, presentan forma aovada o aovada-lanceolada, con el borde regularmente aserrado. Las flores son de color blanco, muy menudas, dispuestas en gran número de inflorescencias terminales aplanadas, con todas las flores a la misma altura. El fruto es una baya negruzca y globosa que encierra de 3 a 5 huesecillos. Florece de abril a junio, los frutos maduran en agosto y septiembre.",
    usefulPart: "Flores y frutos.",
    habitat: "Crece en suelos frescos con cierta humedad, principalmente en sotos y riberas de arroyos o riachuelos.",
    collection: "La flor se recolecta en la época de floración. Se cortan las inflorescencias cuando hace tiempo seco y se dejan marchitar. Luego se separan las flores de los pedúnculos y se secan en capas finas a la sombra. Los frutos se recolectan maduros a finales de verano.",
    activeMonths: ['ABR', 'MAY', 'JUN', 'AGO', 'SEP'],
    phytology: "Las flores despiden un suave aroma característico no del todo agradable, su sabor es mucilaginoso ligeramente salado y astringente. Los frutos maduros presentan olor y sabor característico dulce-acidulado. Las flores son ricas en aceite esencial de consistencia semisólida debido a su elevado contenido en ácidos grasos, flavonoides, glucósidos de quercetina (rutósido), ácido clorogénico y triterpenos. Los frutos son ricos en rutina, taninos y antocianósidos.",
    properties: "La flor destaca por su actividad diaforética y sudorífica, ayudando a disminuir la fiebre y calmar las congestiones de las vías respiratorias altas cuando hay resfriados y gripes. En medicina popular se le atribuían otras muchas virtudes y externamente se usaba para calmar las irritaciones de los ojos y las inflamaciones provocadas por infecciones superficiales de la piel. También se empleaba en gargarismos contra las anginas, en enjuagues para encías inflamadas y en lociones y compresas contra las manchas del rostro de las embarazadas. Esta planta se prepara principalmente en infusión. Los frutos son laxantes y se preparan en zumos y mermeladas para tratar la ciática y las neuralgias.",
    contraindications: "Ninguno conocido.",
    curiosities: "El saúco se ha considerado desde antiguamente una de las plantas mágicas que era conveniente recolectar la noche de San Juan y dejarla al sereno toda la noche. Es una de las plantas que los españoles se llevaron al Nuevo Mundo, donde, actualmente, se halla aclimatada en numerosos países. Los catalanes lo llaman bonarbe, o árbol bueno y hay un refrán alemán que dice \"ante el saúco hay que descubrirse\"."
  },
  {
    name: "Té de roca",
    scientificName: "Jasonia glutinosa L. (Compositae)",
    commonNames: "Té de Aragón",
    botanicalDescription: "Planta perenne de 10 a 45 cm de altura, toda ella glandulosa, viscosa y con pelos. Presenta rizoma subterráneo leñoso y tallos erectos numerosos. Las hojas son oblongo lanceoladas, enteras, agudas, sentadas y de 1,5 a 3 cm de longitud. Las flores son amarillas, tubulares, reunidas en pocos capítulos. Los frutos son vilanos amarillentos o blanquecinos con pelos pardo rojizos y glandulares en el extremo. Florece en julio y agosto.",
    usefulPart: "Sumidades floridas.",
    habitat: "Crece en roquedos, laderas pedregosas y soleadas y lugares áridos.",
    collection: "Se recolecta la parte aérea poco antes de la floración.",
    activeMonths: ['JUL', 'AGO'],
    phytology: "El sabor es predominantemente amargo. Es rica en aceite esencial, principios amargos, lactonas sesquiterpénicas, taninos y heterósidos.",
    properties: "Por su contenido en principios amargos es una planta aperitiva, espasmolítica y digestiva que se emplea en casos de inapetencia, dispepsias hiposecretoras, gases y espasmos gastrointestinales. Además actúa como anticatarral, antidiarreico e hipotensor, utilizándose en el tratamiento de gripes y resfriados. En uso externo es hemostático, antiséptico, antifúngico y antiinflamatorio y se emplea en caso de heridas, contusiones, eczemas y conjuntivitis.",
    contraindications: "Ninguno conocido.",
    curiosities: "Es una planta poco estudiada científicamente, no se conoce bien su composición, sin embargo su uso está muy extendido y en algunas zonas se considera una panacea."
  },
  {
    name: "Tilo",
    scientificName: "Tilia platyphyllos SCOP. (Tiliaceae)",
    commonNames: "Tilo común, flor de tila, tila de árbol",
    botanicalDescription: "Este árbol alcanza una altura de 25 a 30 m. Su corteza es lisa y marrón grisácea, agrietada ligeramente a lo largo del tronco. Los ramos, curvados y lampiños son de color marrón verdoso, a menudo con un lado rojizo. Las yemas son alternas, ovales y romas y están cubiertas de escamas de color rojo o verde aceituna. Las hojas son alternas y tienen los bordes dentados. El limbo es de color azul verdoso por el envés, con matas de pequeños pelos rojos en las bifurcaciones de los nervios. Las flores son hermafroditas y están agrupadas en cimas pentámeras o heptámeras, erguidas o ligeramente inclinadas y provistas de una bráctea ligulada, membranosa y lampiña. Las flores son esféricas, de color amarillo verdoso. Los frutos son unos aquenios ovales o esféricos, lisos, desmenuzables y de color marrón oscuro. Florece en junio.",
    usefulPart: "Flores y brácteas.",
    habitat: "Se extiende desde las tierras bajas hasta los 500 ó 600 m de altitud, abunda en bosques húmedos, terrenos ondulados y encinares, es típico como planta ornamental en alamedas y parques.",
    collection: "Las inflorescencias con su bráctea se recogen cuando se acaban de abrir, dejando en el árbol las que están todavía encapulladas y las que ya se marchitaron.",
    activeMonths: ['JUN', 'JUL'],
    phytology: "Presenta un olor característico ligeramente aromático y un sabor dulce y mucilaginoso. Es una planta rica en flavonoides sobre todo derivados de la quercetina como hesperidina y vitexina, aceite esencial rico en farnesol, mucílagos, taninos y ácidos orgánicos.",
    properties: "El tilo actúa como calmante de la tos en casos de catarros de las vías respiratorias y diaforético en estados febriles como resfriados o infecciones. Además es calmante, y vía oral se emplea en estados de nerviosismo, insomnio y cefalea, como planta estomáquica y en casos de hipertensión. Vía tópica se emplea debido a su contenido en mucílagos para aplicar sobre la piel sensible o seca, en cremas o en productos para pelo seco.",
    contraindications: "Ninguno conocido.",
    curiosities: "En cuanto a su uso tradicional Andrés Laguna ya decía del tilo: \"La corteza de la tilia, mascada y puesta en forma de emplastro, suelda las frescas heridas. Sus hojas, majadas, resuelven las hinchazones, hacen renacer los cabellos e impiden que se caigan\"."
  },
  {
    name: "Tomillo salsero",
    scientificName: "Thymus vulgaris L., Thymus zygis L. (Lamiaceae)",
    commonNames: "Tomillo salsero",
    botanicalDescription: "Semiarbusto de 20 a 30 cm de altura, que forma una mata muy tupida. Los tallos son leñosos en la base y sostienen ramas herbáceas de sección cuadrangular. Las hojas son opuestas, de pecíolo corto y ovaladas o lineares, lampiñas y cubiertas de glándulas por el haz y vellosas y grisáceas por el envés. En la extremidad de los tallos se forman las inflorescencias de 3 a 6 flores en espiga. Las flores son pequeñas y de color rosa o violeta. El fruto es un aquenio. Florece en mayo y junio.",
    usefulPart: "Sumidades floridas.",
    habitat: "Es originario de la región mediterránea, crece en regiones cálidas, en terrenos calizos y en zonas expuestas al sol.",
    collection: "Se recolecta el tallo con las hojas y flores al principio de la floración.",
    activeMonths: ['MAY', 'JUN', 'JUL'],
    phytology: "Presenta un olor aromático intenso y característico, su sabor es picante. Es rico en aceite esencial compuesto por timol, carvacrol, geraniol, terpineno y linalol, además contienen flavonoides derivados del apigenol y luteolol, taninos y ácidos fenólicos.",
    properties: "El aceite esencial es responsable de su acción tonificante general del organismo y de su actividad expectorante, utilizándose en casos de bronquitis o catarros para aumentar la secreción de la mucosidad bronquial. Actúa también como antiséptico respiratorio y como espasmolítico. En uso externo es antibacteriano y desodorante y se puede incluir en pomadas para tratar dolores reumáticos, infecciones cutáneas o artrosis. En medicina popular se emplea además en infusión como planta estomacal, carminativa, desinfectante urinario y contra los gusanos intestinales.",
    contraindications: "No debe tomarse durante el embarazo.",
    curiosities: "El tomillo salsero que crece en nuestra provincia es la especie Thymus zygis, que aunque presenta prácticamente las mismas propiedades que el Thymus vulgaris, la cantidad de principios activos es menor. El tomillo es una planta muy utilizada en cocina para aderezar guisos, ya que favorece la conservación de los alimentos."
  },
  {
    name: "Tomillo serpol",
    scientificName: "Thymus pulegioides L. (Lamiaceae)",
    commonNames: "Serpol, hierba luna, salsa de pastor",
    botanicalDescription: "Planta aromática vivaz que tiene aspecto de semiarbusto de 3 a 30 cm de altura. Presenta la raíz ahusada con numerosos tallos radicantes, tumbados y leñosos en la base. Los tallos ascendentes o erguidos pueden ser cortos con muchas hojas y sin flores, o largos muy ramificados y rematados con una inflorescencia. Los tallos y ramas son cuadrangulares y con pelos largos. Las hojas son uniformes ovado-elípticas, ligeramente plegadas hacia arriba y lampiñas. Las flores se disponen en espigas poco densas en la base, son de cáliz tubuloso y acampanado y de color púrpura o rosa. Los frutos son unos aquenios duros. Florece de junio a agosto.",
    usefulPart: "Tallos floridos y hojas.",
    habitat: "Crece en praderas y bosques claros. Como planta ornamental se cultivan distintas variedades de serpol de flores blancas, rosas o rojas.",
    collection: "Se recogen los tallos con las hojas evitando la parte leñosa.",
    activeMonths: ['JUN', 'JUL', 'AGO'],
    phytology: "Tiene un olor muy especiado y un sabor aromático algo amargo. El serpol es rico en aceite esencial que contiene timol, carvacrol, mirceno, cimeno y linalol. También contiene taninos, principios amargos y flavonoides, entre otros.",
    properties: "Las propiedades del serpol son semejantes a las del tomillo salsero pero se presentan de forma más suave. En medicina popular se emplea como estomacal, carminativo, expectorante y en afecciones del riñón y de la vejiga. En uso externo se emplea en forma de enjuagues y gargarismos en casos de encías inflamadas o infecciones bucales y en compresas para las enfermedades de la piel.",
    contraindications: "Ninguno conocido.",
    curiosities: "Muchos taxónomos no hacen diferenciación alguna entre Thymus serpyllum y Thymus pulegioides, ya que la única diferencia es que mientras en el primero el tallo aparece completamente cubierto de pelos, en el segundo estos pelos solo aparecen en los ángulos del tallo."
  },
  {
    name: "Trébol",
    scientificName: "Trifolium pratense L. (Fabaceae)",
    commonNames: "Trébol de prado, trébol de la luna",
    botanicalDescription: "Planta vivaz, cuyo rizoma da lugar a una roseta de hojas trímeras con largos peciolos. Los tallos son simples, rectos y ascendentes de 20 a 50 cm de altura y ligeramente vellosos. Los folíolos son sésiles, ovales y enteros, con el borde ciliado, prácticamente lampiñas por el haz y vellosas y verdes por el envés. En las axilas de las hojas laterales y superiores nacen las cabezuelas esféricas de flores rosadas. El fruto es una vaina. Florece en primavera.",
    usefulPart: "Las cabezuelas.",
    habitat: "Esta planta es típica de praderas, bosques claros y taludes, también se cultiva abundantemente como planta forrajera o en jardines.",
    collection: "Las cabezuelas se recogen al comienzo de la floración, cuando hace sol.",
    activeMonths: ['ABR', 'MAY', 'JUN'],
    phytology: "La parte blanquecina de las florecillas tiene un sabor dulce muy agradable. Las flores son ricas en el glucósido trifolina, ácido salicílico y diversos compuestos fenólicos.",
    properties: "No es una planta muy utilizada en nuestro país, pero en países del centro de Europa es muy apreciada para tratar las afecciones del aparato digestivo, contra el estreñimiento crónico, la falta de apetito, para las inflamaciones de los bronquios y la ronquera. En uso externo se utiliza en compresas y baños para las inflamaciones de la piel.",
    contraindications: "Ninguno conocido.",
    curiosities: "Dioscórides primero y más tarde Santa Hildegarda recomendaban esta planta para tratar las cataratas, así aparece en el libro IV de Dioscórides, donde dice: \"el zumo de esta planta mezclado con miel resuelve los fluecos, las nubes, las motas blancas y otros impedimentos que oscurecen la vista\"."
  },
  {
    name: "Ulmaria",
    scientificName: "Filipendula ulmaria (L.) MAXIM.",
    commonNames: "Reina de los prados, spirea",
    botanicalDescription: "Es una planta vivaz de 1,5 m de altura, con rizoma rastrero y un tallo anguloso, erecto, ramificado y rígido. Presenta pocas hojas, estas son alternas, compuestas de 1 a 5 folíolos ovales o lanceolados, aserrados y puntiagudos. El folíolo terminal está dividido en 3 ó 5 lóbulos. En el extremo superior del tallo se desarrolla una densa inflorescencia formada por pequeñas flores de color amarillo pálido. Florece de julio a agosto.",
    usefulPart: "Flores.",
    habitat: "Crece en praderas húmedas, barrancos, zonas pantanosas, al lado de cursos de agua y en bosques claros y húmedos.",
    collection: "Se recolectan las flores cuando están abiertas.",
    activeMonths: ['JUL', 'AGO'],
    phytology: "El olor es débil y el sabor astringente y amargo. Contiene derivados flavónicos, salicilato de metilo, taninos, mucílagos y una pequeña cantidad de aceite esencial.",
    properties: "Es una planta antiinflamatoria, analgésica, antipirética, diurética y astringente. Se emplea principalmente vía oral en el tratamiento de fiebres, afecciones gripales y resfriados. Por su contenido en salicilatos es útil en el tratamiento de los reumatismos, inflamaciones articulares, arteriosclerosis y gota.",
    contraindications: "Ninguno conocido.",
    curiosities: "De la ulmaria se aisló por primera vez el ácido salicílico, a partir del cual se sintetizó en 1899 el ácido acetilsalicílico, componente de la aspirina; así podríamos decir que esta planta es la aspirina botánica. La ulmaria además, es un buen ejemplo del principio herbalista, según el cual es mejor emplear la planta entera que uno de sus componentes aislados, ya que los salicilatos que contiene pueden provocar hemorragia gástrica, pero su contenido en mucílagos amortigua este efecto adverso."
  },
  {
    name: "Verbena",
    scientificName: "Verbena officinalis L. (Verbenaceae)",
    commonNames: "Verbena mayor, berbera, verbena macho",
    botanicalDescription: "Planta vivaz de 20 a 70 cm de altura. Su raíz, ramificada y poco profunda, da lugar a un tallo erecto, duro y cuadrado. Las hojas son opuestas, oblongas y dentadas o lobuladas, que se estrechan en un corto peciolo. Las hojas del medio son más grandes y están divididas en 3 segmentos. Las hojas superiores son sésiles, oblongas o lanceoladas y dentadas o prácticamente enteras. Todas las hojas son coriáceas, vellosas, rugosas y de color verde grisáceo. Las flores están agrupadas en largas espigas, formando una panoja y son de color violeta o blanco. Los frutos son unos tetraquenios cilíndricos. Florece de julio a septiembre.",
    usefulPart: "Sumidad florida.",
    habitat: "Crece en cualquier tipo de suelo. Vive en praderas, orillas de ríos, cunetas, setos y baldíos.",
    collection: "Se recolecta la sumidad florida a mediados de julio, aproximadamente un mes después de su floración.",
    activeMonths: ['JUL', 'AGO'],
    phytology: "Tiene sabor amargo y áspero. Es rica en iridoides, verbenalósido, verbenalol, ácido caféico, mucílagos, taninos, principios amargos y aceite esencial.",
    properties: "Por su contenido en iridoides se trata de una planta antiinflamatoria que se puede emplear en procesos inflamatorios como laringitis, faringitis o bronquitis. También actúa como analgésico local, útil en casos de migrañas o cefaleas de origen nervioso y bilioso, antiespasmódico, sedante y estimulante del peristaltismo intestinal y la diuresis. También se emplea como estimulante de la producción de leche y activación del inicio de la menstruación. Vía externa se emplea en forma de enjuagues para tratar las encías infectadas, así como en heridas, quemaduras o furúnculos.",
    contraindications: "No debe tomarse durante el embarazo ya que estimula las contracciones del útero.",
    curiosities: "Esta planta se ha considerado mágica y sagrada desde tiempos de Dioscórides que ya la citaba como planta de increíbles propiedades. También llamada hierba de los hechizos, se empleaba antiguamente para realizar conjuros de amor y era conveniente recolectarla la noche de San Juan antes de la salida del sol."
  }
  
];

// GLOSARIO ETNOBOTÁNICO METER EL RESTO JAVIER
const ethnobotanyGlossary = [
   { term: "ABORTIVO", definition: "Propiedad que hace referencia a la interrupción del embarazo." },
  { term: "ACEITE ESENCIAL", definition: "Sustancias volátiles de carácter aromático que se extraen de las plantas, principalmente por destilación." },
  { term: "AEROFAGIA", definition: "Exceso de gases en el tracto digestivo." },
  { term: "AFONÍA", definition: "Imposibilidad transitoria o permanente de habla." },
  { term: "AFRODISIACO", definition: "Sustancia que estimula el apetito sexual." },
  { term: "AFTA", definition: "Pequeña lesión ulcerosa de fondo amarillento, muy dolorosa, generalmente fugaz y que se localiza en la mucosa." },
  { term: "ALOPECIA", definition: "Caída parcial o total del cabello." },
  { term: "AMARGO", definition: "Se dice que una planta tiene esta propiedad cuando provoca la secreción de los jugos gástricos, facilitando la digestión y estimulando el apetito." },
  { term: "AMENORREA", definition: "Enfermedad que consiste en la supresión del menstruo en la etapa fértil de la mujer." },
  { term: "AMENTO", definition: "Especie de espiga compuesta de flores unisexuales." },
  { term: "ANAFRODISIACO", definition: "Modera o anula el apetito sexual." },
  { term: "ANALGÉSICO", definition: "Que alivia o elimina el dolor." },
  { term: "ANESTÉSICO", definition: "Que anula la sensibilidad, que produce o causa anestesia." },
  { term: "ANOREXIA", definition: "Falta anormal de apetito." },
  { term: "ANTIASMÁTICO", definition: "Que calma o atenúa los fenómenos del asma." },
  { term: "ANTIBACTERIANO", definition: "Dicho de un medicamento, de una sustancia, o de un procedimiento, etc. que se utiliza para combatir las bacterias." },
  { term: "ANTIBIÓTICO", definition: "Sustancia química producida por microorganismos que tiene la facultad de inhibir el desarrollo o destruir otros microorganismos." },
  { term: "ANTIDIARREICO", definition: "Combate la diarrea (evacuación más frecuente y/o fluida de lo normal)." },
  { term: "ANTIESPASMÓDICO", definition: "Inhibe los espasmos o desórdenes nerviosos." },
  { term: "ANTIFLOGÍSTICO", definition: "Que sirve para calmar la inflamación." },
  { term: "ANTIFÚNGICO", definition: "Destruye o inhibe el crecimiento de hongos." },
  { term: "ANTIHELMÍNTICO", definition: "(o vermífugo): Ayuda a eliminar los gusanos intestinales." },
  { term: "ANTIHISTAMÍNICO", definition: "Que inhibe o disminuye la acción de la histamina." },
  { term: "ANTIPIRÉTICO", definition: "(o febrífugo): Disminuye la fiebre." },
  { term: "ANTISÉPTICO", definition: "Combate o previene infecciones, destruyendo a los microbios que las causan." },
  { term: "ANTISUDORÍFICO", definition: "Inhibe la secreción de sudor." },
  { term: "ANTITUMORAL", definition: "Que inhibe o disminuye la formación de tumores." },
  { term: "APERITIVO", definition: "Estimula el apetito." },
  { term: "AQUENIO", definition: "Fruto indehiscente, seco y con una sola semilla." },
  { term: "ARILO", definition: "Cubierta que envuelve algunas semillas." },
  { term: "AROMATERAPIA", definition: "Método de curación mediante aceites esenciales." },
  { term: "ARTERIOSCLEROSIS", definition: "Enfermedad arterial que se caracteriza por el engrosamiento, pérdida de elasticidad y calcificación de las paredes arteriales." },
  { term: "ASÉPTICO", definition: "Libre de material infeccioso." },
  { term: "ASTENIA", definition: "Debilitamiento del estado general." },
  { term: "ASTRINGENTE", definition: "Aquella sustancia que contrae o estrecha los tejidos." },
  { term: "BACTERICIDA", definition: "Matan a las bacterias." },
  { term: "BACTERIOSTÁTICO", definition: "Inhibe el crecimiento y proliferación de las bacterias." },
  { term: "BALSÁMICO", definition: "Cura dolencias pectorales y digestivas, suaviza las mucosas." },
  { term: "BÉQUICO", definition: "(o antitusígeno): Alivia o elimina la tos." },
  { term: "BIENAL", definition: "Que sucede o se repite cada dos años." },
  { term: "BLEFARITIS", definition: "Inflamación del párpado." },
  { term: "BRÁCTEA", definition: "Hojas transformadas que se sitúan junto a las flores o junto a las inflorescencias, para sostenerlas o protegerlas." },
  { term: "CAPÍTULO", definition: "Inflorescencia o conjunto denso de flores, que suelen estar sentadas sobre la parte ensanchada final del pedúnculo o receptáculo." },
  { term: "CARDIOTÓNICO", definition: "Preparado tónico para el corazón." },
  { term: "CARMINATIVO", definition: "Inhibe la producción de gases o favorece su expulsión." },
  { term: "CICATRIZANTE", definition: "Ayuda a cicatrizar las heridas y regenerar el epitelio." },
  { term: "CISTITIS", definition: "Transtorno inflamatorio de la vejiga urinaria y de los uréteres que se manifiesta por dolor, micción frecuente y hematuria." },
  { term: "COLAGOGO", definition: "Estimula la salida de bilis de los conductos biliares." },
  { term: "COLERÉTICO", definition: "Estimula la formación de bilis." },
  { term: "COLIRIO", definition: "Medicamento que se aplica sobre la conjuntiva del ojo." },
  { term: "CORICIDA", definition: "Producto capaz de eliminar las callosidades." },
  { term: "CORIMBO", definition: "Inflorescencia o conjunto de flores dispuesto a la misma altura, pero cuyos pedúnculos son de longitud diferente, y se insertan en lugares distintos del eje." },
  { term: "DEMULCENTE", definition: "Sustancia no grasa que suaviza, relaja y protege la piel y las mucosas." },
  { term: "DEPURATIVO", definition: "Favorece la eliminación de sustancias tóxicas del organismo." },
  { term: "DERMATITIS", definition: "Estado inflamatorio de la piel." },
  { term: "DERMATOSIS", definition: "Cualquier enfermedad de la piel, especialmente la que no es por inflamación." },
  { term: "DIAFORÉTICO", definition: "Sudorífico, que promueve el sudor." },
  { term: "DIGESTIVO", definition: "(o estomacal): Favorece la digestión." },
  { term: "DIOICA", definition: "Especie botánica cuyas flores masculinas y femeninas están en plantas separadas." },
  { term: "DISMENORREA", definition: "Dolor en la menstruación, evacuación dolorosa y difícil." },
  { term: "DISPEPSIA", definition: "Digestión difícil de carácter crónico." },
  { term: "DISQUINESIA", definition: "Transtorno caracterizado por la realización de movimientos involuntarios y repetitivos." },
  { term: "DIURÉTICO", definition: "provoca la diuresis, facilita la eliminación de la orina." },
  { term: "DRUPA", definition: "Pericarpio carnoso que contiene un solo hueso." },
  { term: "ECZEMA", definition: "Afección inflamatoria de la piel con enrojecimiento, prurito, vesículas, descamación y encostramiento." },
  { term: "EMENAGOGO", definition: "Favorece la menstruación." },
  { term: "EMÉTICO", definition: "(o vomitivo): provoca el vómito." },
  { term: "EMOLIENTE", definition: "Sustancia grasa que ejerce una acción antiinflamatoria sobre la piel y mucosas, hidratándolas y protegiéndolas frente a la irritación." },
  { term: "ENURESIS", definition: "Incontinencia urinaria." },
  { term: "ESPASMOLÍTICO", definition: "Que relaja o anula el espasmo." },
  { term: "ESTIMULANTE", definition: "Que estimula, es decir, que activa o despierta una actividad del organismo." },
  { term: "ESTOMÁQUICO", definition: "Que favorece las funciones digestivas gástricas." },
  { term: "EUPÉPTICO", definition: "Digestivo." },
  { term: "EXPECTORANTE", definition: "Ayuda a eliminar las secreciones bronquiales por la boca." },
  { term: "FARINGITIS", definition: "Inflamación de la faringe." },
  { term: "FEBRÍFUGO", definition: "Disminuye la fiebre." },
  { term: "FLATULENCIA", definition: "Exceso de gases en el estómago o intestino." },
  { term: "FLEBITIS", definition: "Inflamación venosa." },
  { term: "FOLIOLO", definition: "Cada una de las hojuelas que forman una hoja compuesta." },
  { term: "FUNGICIDA", definition: "Sustancia que destruye los hongos." },
  { term: "FURÚNCULO", definition: "Inflamación del folículo pilosebáceo." },
  { term: "GALACTÓGENO", definition: "(o galactógeno): Que favorece la producción de leche." },
  { term: "GINGIVITIS", definition: "Inflamación de las encías." },
  { term: "HALITOSIS", definition: "Olor anormal en el aire espirado." },
  { term: "HEMATOPOYESIS", definition: "Formación y desarrollo normal de las células sanguíneas en la médula ósea." },
  { term: "HEMATOPOYÉTICA", definition: "Que activa la hematopoyesis." },
  { term: "HEMOLÍTICO", definition: "Que produce la lisis de los glóbulos rojos, liberando hemoglobina." },
  { term: "HEMOPTISIS", definition: "Expectoración de sangre proveniente de la tráquea, los bronquios o los pulmones." },
  { term: "HEMOSTÁTICO", definition: "Corta las hemorragias." },
  { term: "HIPERCLORHIDRIA", definition: "Exceso de ácido clorhídrico a nivel gástrico." },
  { term: "HIPERHIDROSIS", definition: "Relativo al exceso de sudoración." },
  { term: "HIPERTENSOR", definition: "Eleva la tensión arterial." },
  { term: "HIPERURICEMIA", definition: "Exceso de ácido úrico en la sangre." },
  { term: "HIPNÓTICO", definition: "Que facilita el sueño." },
  { term: "HIPOGLUCEMIANTE", definition: "Disminuye el azúcar en sangre." },
  { term: "HIPOLIPEMIANTE", definition: "Disminuye el nivel de lípidos en sangre." },
  { term: "HIPOTENSOR", definition: "Disminuye la tensión arterial." },
  { term: "HISTERISMO", definition: "Afección nerviosa caracterizada por confusión transitoria, mal humor, crisis convulsivas, temblores, parálisis, pérdida de conocimiento. Es una enfermedad asociada a la mujer." },
  { term: "INFLORESCENCIA", definition: "Orden o agrupación con que brotan las flores en las plantas." },
  { term: "LAMPIÑO", definition: "Estructura vegetal con poco pelo." },
  { term: "LARINGITIS", definition: "Inflamación de la laringe." },
  { term: "LÁTEX", definition: "Líquido lechoso que gotea de algunas plantas cuando se las rompe." },
  { term: "LAXANTE", definition: "Facilita la evacuación de las materias fecales." },
  { term: "LENITIVO", definition: "Acción analgésica débil." },
  { term: "LÍGULA", definition: "Pétalo desarrollado en el borde del capítulo de ciertas compuestas, que puede ser de color azul, amarillo o, más comúnmente, blanco, como en las margaritas, matricarias y otras." },
  { term: "LIMBO", definition: "Lámina o parte ensanchada de las hojas típicas y, por extensión, de los sépalos, pétalos y tépalos." },
  { term: "LITIASIS", definition: "Formación de cálculos en órganos huecos o conductos del organismo." },
  { term: "LITÓNTRICO", definition: "Elimina pequeños cálculos." },
  { term: "MACERACIÓN", definition: "Operación que consiste en sumergir un cuerpo en un líquido para extraer de él las partes solubles." },
  { term: "METRORRAGIAS", definition: "Hemorragia uterina no relacionada con la menstruación." },
  { term: "MUCOLÍTICO", definition: "Capaz de disolver las secreciones mucosas." },
  { term: "NARCÓTICO", definition: "Medicamento que produce sopor, relajación muscular y embotamiento de la sensibilidad, como el opio, los barbitúricos, etc." },
  { term: "NEFRITIS", definition: "Inflamación de los riñones." },
  { term: "NEURASTENIA", definition: "Trastorno funcional afectivo atribuido a debilidad del sistema nervioso." },
  { term: "ODONTALGIA", definition: "Dolor de muelas o dientes." },
  { term: "OFTÁLMICO", definition: "Adecuado para las enfermedades oculares." },
  { term: "OTALGIA", definition: "Dolor de oídos." },
  { term: "OXITÓCICO", definition: "Que acelera la evacuación del útero al estimular las contracciones miometriales." },
  { term: "PANÍCULA", definition: "Panoja o espiga de flores." },
  { term: "PECIOLO", definition: "Rabillo de la hoja con la que se sujeta al tallo." },
  { term: "PECTORAL", definition: "Útil para afecciones de vías respiratorias." },
  { term: "PEDÚNCULO", definition: "Rabillo de una flor que la sujeta al tallo." },
  { term: "PIELONEFRITIS", definition: "Infección piógena difusa de la pelvis y el parénquima renal." },
  { term: "PSORIASIS", definition: "Enfermedad de la piel papuloescamosa crónica que suele afectar principalmente al cuero cabelludo y a las superficies extensoras de las extremidades." },
  { term: "PURGANTE", definition: "Preparado que administrado vía oral tiene acción evacuadora intestinal." },
  { term: "QUERATOLÍTICO", definition: "Que actúa sobre la queratosis." },
  { term: "QUERATOSIS", definition: "Proceso cutáneo en el que hay un crecimiento excesivo y engrosamiento del epitelio cornificado." },
  { term: "REMINERALIZANTE", definition: "Proporciona algún mineral." },
  { term: "RENIFORME", definition: "De forma parecida a un riñón." },
  { term: "RESOLUTIVO", definition: "Disipa inflamaciones." },
  { term: "REVULSIVO", definition: "Produce inflamación o congestión en la piel o en las mucosas." },
  { term: "RIZOMA", definition: "Tallo subterráneo o rastrero que suele crecer horizontalmente y tener escamas, que representan las hojas." },
  { term: "RUBEFACIENTE", definition: "Produce enrojecimiento de la piel o mucosas." },
  { term: "SEDANTE", definition: "Calma o mitiga el dolor o la excitación nerviosa." },
  { term: "SESIL", definition: "Se dice de una hoja o una flor que carece de peciolo o pedúnculo." },
  { term: "SILICUA", definition: "Fruto en cápsula, principalmente de las crucíferas." },
  { term: "SUDORÍFICA", definition: "Que estimula la sudoración." },
  { term: "TOMENTOSO", definition: "Que presenta tomento o pequeños pelos finos." },
  { term: "TÓNICO", definition: "Preparado que estimula y normaliza el tono normal o estado saludable." },
  { term: "TÓPICO", definition: "Medicamento de uso externo." },
  { term: "UMBELA", definition: "Tipo de inflorescencia que se caracteriza porque los tallos florales parten del mismo punto del tallo y terminan a la misma altura." },
  { term: "URETRITIS", definition: "Inflamación de la uretra." },
  { term: "VASOCONSTRICTOR", definition: "Que produce la constricción de los vasos sanguíneos." },
  { term: "VASODILATADOR", definition: "Que dilata los vasos sanguíneos." },
  { term: "VASOPROTECTOR", definition: "Refuerza las paredes de los vasos sanguíneos y capilares." },
  { term: "VENOTÓNICO", definition: "Que estimula el tono muscular de las paredes de los vasos sanguíneos." },
  { term: "VERMÍFUGO", definition: "Antihelmíntico, mata los gusanos intestinales." },
  { term: "VERTICILO", definition: "Dícese de la estructura vegetal que surge a un mismo nivel del tallo." },
  { term: "VESICANTE", definition: "Que produce ampollas o vesículas en la piel." },
  { term: "VILANO", definition: "Tipo de fruto característico de las compuestas." },
  { term: "VITAMÍNICO", definition: "Proporciona alguna vitamina." },
  { term: "VITÍLIGO", definition: "Alteración de origen desconocido que se caracteriza por la destrucción de los melanocitos en áreas dérmicas circunscritas." },
  { term: "VIVAZ", definition: "Se dice de la planta perenne cuyos órganos aéreos desaparecen en la época desfavorable." },
  { term: "VULNERARIO", definition: "Que cura llagas y heridas." }
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
    { id: 6, name: "PESQUERÍAS REALES", category: "Historia", coords: "40°53'25.4\"N 4°01'20.6\"W", address: "VALSAÍN", note: "Senda regia empedrada construida junto al cauce del río Eresma.", image: "https://lh3.googleusercontent.com/d/1MtKo8q6S2ILL5XmEaC9yKwVRT5fve2u4", history: "Mandadas construir expresamente por el rey Carlos III (el mejor alcalde de Madrid) en la segunda mitad del siglo XVIII (hacia 1769). Estas pesquerías son un singular y extensísimo paseo empedrado que bordea milimétricamente el cauce del río Eresma en los pinares de Valsaín. Fueron diseñadas, con todo lujo de peldaños y plataformas de granito, para facilitar al monarca ilustrado la cómoda práctica de la pesca de la trucha. Representan la máxima expresión del amor de la dinastía Borbón por el control de la naturaleza y la caza." },
    { id: 7, name: "PALACIO REAL DE VALSAÍN", category: "Historia", coords: "40°52'36.9\"N 4°01'36.3\"W", address: "VALSAÍN", note: "Ruinas del antiguo palacio de recreo de los Austrias.", image: "https://lh3.googleusercontent.com/d/1IKe1F44JNzFjmxz2rs0sjQufLnuA5Jxp", history: "Originalmente un modesto pabellón de caza de la dinastía Trastámara, fue transformado por orden de Felipe II en el primer gran palacio de la Casa de los Austrias en España (1552). Dirigido por arquitectos de la talla de Gaspar de Vega y Juan Bautista de Toledo, su diseño de tejados de pizarra inclinados importó el gusto flamenco a Castilla. Aquí nació la infanta Isabel Clara Eugenia. Trágicamente, un devastador incendio en 1682, durante el reinado de Carlos II, lo redujo a cenizas. Hoy, sus solitarios muros de ladrillo rojizo y granito evocan su antigua grandeza imperial." },
    { id: 8, name: "CASA ERASO", category: "Historia", coords: "40°48'22.3\"N 4°03'07.3\"W", address: "VALSAÍN", note: "Edificación ligada históricamente a la gestión de montes y caza real.", image: "https://lh3.googleusercontent.com/d/1RxBEUNb82S4_zNPbsMEvgAuXow_vw9Wu", history: "Conocida popularmente por los lugareños como el 'Casarás', fue mandada construir por Felipe II en el año 1565. Su propósito era servir como refugio y parada de descanso para la corte castellana en su fatigoso tránsito desde Madrid hacia Segovia a través del duro puerto de la Fuenfría. Su nombre hace honor al influyente secretario del rey, Francisco de Eraso. Aunque hoy yace en ruinas devorada por la maleza, su imponente esqueleto evidencia que fue una notable obra de fina sillería granítica que alojó a reyes y embajadores." },
    { id: 9, name: "FÁBRICA DE HARINA LA JULITA", category: "Industrial", coords: "41°09'24.6\"N 4°00'26.2\"W", address: "TURÉGANO", note: "Patrimonio industrial harinero del siglo XX con maquinaria de época.", image: "https://lh3.googleusercontent.com/d/1LZTfY1asgtmhQe6208Av8BFbaTMhdMC_", history: "Símbolo innegable de la industrialización agrícola de principios del siglo XX. La Julita revolucionó por completo la molienda tradicional en la comarca de Turégano, un feudo históricamente dominado por los obispos de Segovia. Esta fábrica incorporó el modernísimo sistema austrohúngaro de maquinaria de cilindros, permitiendo una producción de harina blanca, fina y a gran escala, y marcando el fin definitivo de la era romántica de los pequeños molinos fluviales de piedra movidos por el agua." },
    { id: 10, name: "ESTACIÓN APEADERO DE TREN", category: "Industrial", coords: "41°30'10.5\"N 3°32'34.7\"W", address: "MADERUELO", note: "Antigua parada de la línea ferroviaria que conectaba la zona mística.", image: "https://lh3.googleusercontent.com/d/1i5sluqM4dAaPI40ujn5WZ3fGnYWjFePD", history: "Construida a lo largo de la faraónica e histórica línea ferroviaria Madrid-Burgos (conocida como el Ferrocarril Directo e inaugurada oficialmente en 1968 por Francisco Franco), esta pequeña estación acercó por fin la modernidad al aislado nordeste segoviano. Durante varias décadas rompió el aislamiento de Maderuelo y facilitó el transporte agrícola y humano. Lamentablemente, el inexorable declive del tren convencional frente al transporte por carretera provocó su romántico, silencioso y progresivo abandono." },
    { id: 11, name: "CASA DE LA MÁQUINA DEL PULIMENTO", category: "Industrial", coords: "40°54'46.4\"N 4°00'46.7\"W", address: "LA GRANJA DE SAN ILDEFONSO", note: "Ingenio industrial de la Real Fábrica de Cristales.", image: "https://lh3.googleusercontent.com/d/1rbd9rWyyBYOLaE69e8tOX2GGhwfl60AX", history: "Parte vital del impresionante complejo preindustrial de la Real Fábrica de Cristales promovida por el primer Borbón, Felipe V, y consolidada por Carlos III en el siglo XVIII. En este imponente edificio se alojaba la compleja maquinaria hidráulica diseñada por ingenieros europeos como Ventura Sit. Sus engranajes movían los enormes tornos utilizados para pulir y biselar los lujosos y colosales espejos que terminaron decorando los Palacios Reales de España y cortes europeas, compitiendo directamente con la hegemonía de los cristales de Murano." },
    { id: 12, name: "FÁBRICA DE HARINA MARTÍNEZ", category: "Industrial", coords: "41°13'14.8\"N 4°10'27.6\"W", address: "FUENTEPELAYO", note: "Antiguo complejo harinero representativo de la comarca.", image: "https://lh3.googleusercontent.com/d/1PG5kep4K3V9JkNpVzZI7d4SK_3is_7JR", history: "Estructura fabril de marcado carácter industrial y modernista que cambió la fisionomía de Fuentepelayo. A principios del siglo XX, la emprendedora familia Martínez impulsó esta instalación que modernizó radicalmente el procesado del inmenso 'mar de cereales' de la Tierra de Pinares. Supuso la transición decisiva del obsoleto y lento molino de agua tradicional a un eficiente sistema de motores a vapor (y posteriormente eléctricos) de cilindros, logrando abastecer de harina a innumerables pueblos limítrofes y generando gran riqueza." },
    { id: 13, name: "PALACIO DE LOS MARQUESES DE AGUILAFUENTE", category: "Historia", coords: "41°13'47.7\"N 4°06'54.3\"W", address: "AGUILAFUENTE", note: "Residencia señorial histórica de gran relevancia arquitectónica.", image: "https://lh3.googleusercontent.com/d/1a8uY_vROaohrgVuBGKo2AcoKd05jHUUX", history: "Levantado majestuosamente en el siglo XVI, este palacio de intrincada cantería atestigua la inmensa importancia histórica de la villa. Aguilafuente es célebre por albergar el Sínodo de 1472, convocado por el poderoso obispo Arias Dávila, cuyas actas fueron impresas por Juan Párix, convirtiéndose en el primer libro impreso de España (El Sinodal de Aguilafuente). El edificio palaciego, vinculado a linajes de la alta nobleza como los Zúñiga, presenta recios muros, blasones de armas y la estructura típica de casona hidalga." },
    { id: 14, name: "TELÉGRAFO ÓPTICO", category: "Industrial", coords: "41°08'44.9\"N 4°37'36.4\"W", address: "TOLOCIRIO", note: "Torre de comunicación del siglo XIX perteneciente a la línea de Castilla.", image: "https://lh3.googleusercontent.com/d/1xe8DywAL6XKb6vgSqnaNxxPdBqBGOsP5", history: "Este enigmático torreón formó parte de la 'Línea de Castilla' (Madrid-Irún), un prodigio tecnológico impulsado hacia 1846 por el brigadier José María Mathé durante el convulso reinado de Isabel II. Esta torre fortificada, erigida para resistir ataques durante las Guerras Carlistas, permitía enviar mensajes cifrados del Estado mediante un complejo sistema visual de aspas en su azotea. La señal saltaba de torre en torre a la velocidad de la luz, conectando la capital con la frontera francesa en apenas unas horas." },
    { id: 15, name: "TELÉGRAFO ÓPTICO", category: "Industrial", coords: "41°03'21.7\"N 4°36'34.2\"W", address: "CODORNIZ", note: "Restos de la infraestructura de telecomunicaciones históricas.", image: "https://lh3.googleusercontent.com/d/1_H8TTw_G-qbRC3Fmg5QaZRqQ6xBUJBQl", history: "Eslabón fundamental de la red de telecomunicaciones nacional del siglo XIX. Situada estratégicamente en un altozano para garantizar el contacto visual absoluto con las torres vecinas (como la de Tolocirio), esta recia construcción militar albergaba a los rudos 'torreros'. Estos operadores vivían en condiciones de extremo aislamiento y operaban los telégrafos ópticos con pesados catalejos. Su labor fue esencial para la seguridad del Estado español antes de que la invención del telégrafo eléctrico dejara estas fortalezas sumidas en el silencio." },
    { id: 16, name: "FÁBRICA DE HARINA", category: "Industrial", coords: "41°09'36.1\"N 4°29'19.1\"W", address: "NAVA DE LA ASUNCIÓN", note: "Patrimonio industrial ligado a la explotación cerealista.", image: "https://lh3.googleusercontent.com/d/1DlZZuZN6WXIxVJJLp65_ecvtyCx44n9V", history: "Magnífica muestra de la arquitectura industrial de ladrillo cocido, que bebe directamente de la influencia del mudéjar segoviano. A principios del siglo XX, esta imponente fábrica supuso el principal motor económico para el procesamiento triguero en Nava de la Asunción. Integró las técnicas más avanzadas de la revolución industrial agraria, sustituyendo las viejas piedras volanderas. En esta misma localidad y bajo la sombra de estos avances industriales, pasaría largas temporadas el célebre poeta de la Generación del 50, Jaime Gil de Biedma." },
    { id: 17, name: "ERMITA DE SANTA ROSALÍA", category: "Historia", coords: "41°13'21.1\"N 4°31'21.2\"W", address: "COCA", note: "Edificación religiosa situada en el entorno histórico de la villa de Coca.", image: "https://lh3.googleusercontent.com/d/1XLedTWcwuFa-1PxRVboN1NATLCZWX_l3", history: "Ubicada en lo profundo de los inmensos pinares resineros que abrazan la monumental villa caucense, antiguo señorío de la implacable familia de los Fonseca, esta ermita ha sido un secular centro de fervores. Su origen se entrelaza íntimamente con la dura y sacrificada vida de los trabajadores de la resina y los leñadores locales. Durante los siglos XVIII y XIX, las cuadrillas acudían a este apartado rincón a rogar a Santa Rosalía protección frente a los temidos incendios forestales y los graves accidentes laborales." },
    { id: 18, name: "ERMITA DE SAN ANDRÉS", category: "Historia", coords: "41°15'25.8\"N 4°09'45.2\"W", address: "ZARZUELA DEL PINAR", note: "Templo románico rodeado de la inmensidad de los pinares.", image: "https://lh3.googleusercontent.com/d/1e--4FL9WEGKXPtCn3H4SK-LIpIMXQy66", history: "Un templo que maravilla por su genuina mezcla de románico rural y el exquisito mudéjar de ladrillo, el estilo artístico dominante impulsado por alarifes musulmanes en la Comunidad de Cuéllar. Documentada desde los procesos de repoblación cristiana del siglo XIII, su majestuoso ábside está elegantemente decorado con arquerías ciegas superpuestas. Es el testimonio vivo de cómo las culturas cristiana y mudéjar convivieron pacíficamente en la Edad Media, adaptando la arquitectura de la fe a la arcilla y recursos de Tierra de Pinares." },
    { id: 19, name: "ERMITA DE SAN CEBRIÁN", category: "Historia", coords: "41°15'00.0\"N 4°12'36.7\"W", address: "ZARZUELA DEL PINAR", note: "Pequeño santuario medieval en el corazón de Tierra de Pinares.", image: "https://lh3.googleusercontent.com/d/1W_Op0OqZQvIdSr0uWO9SxzounioDMma0", history: "Un verdadero fósil religioso que emerge sorpresivamente entre los densos bosques de pinos negrales. Dedicada a San Cebrián (Cipriano), su austera y tosca estructura de mampostería ha servido durante centurias de orientación, faro espiritual y refugio físico para los pastores trashumantes de Castilla. Sus caminos estaban íntimamente ligados a las antiguas cañadas del Honrado Concejo de la Mesta. Muchas leyendas locales aseguran que en sus inmediaciones se celebraban ritos ancestrales para pedir buenas lluvias." },
    { id: 20, name: "MOLINO DE MINGELA", category: "Industrial", coords: "41°22'40.9\"N 4°25'54.4\"W", address: "VALLELADO", note: "Antiguo molino situado en la margen del río Cega.", image: "https://lh3.googleusercontent.com/d/1EbRaQZt_Jr-pPUftGnimylMmatAEBM7s", history: "Este ingenio fluvial histórico sacaba un formidable provecho a la fuerza del impetuoso río Cega. Las románticas ruinas del Molino de Mingela, a pesar del incesante azote del tiempo, aún permiten vislumbrar los profundos cárcavos de piedra donde el torrente golpeaba ferozmente los rodeznos. Históricamente, estos molinos solían estar bajo el estricto control de monasterios, cabildos o grandes señores feudales, marcando la frontera económica y geográfica entre la histórica diócesis de Segovia y la vecina provincia de Valladolid." },
    { id: 21, name: "MOLINO DE POTRICOS", category: "Industrial", coords: "41°24'02.7\"N 4°07'27.2\"W", address: "PEROSILLO", note: "Ingenio hidráulico histórico preservado en el paisaje rural.", image: "https://lh3.googleusercontent.com/d/1dD6MkgWzbVtDkUd57LC2z1ZJ5cx_sgv7", history: "De aspecto recio, solitario y melancólico, el Molino de Potricos es un testimonio en estado puro de la antigua dependencia de la sociedad agraria castellana hacia los indómitos cauces fluviales. Antes de la electrificación, en los días de intensa molienda tras la cosecha estival, este lugar se convertía en un auténtico hervidero social. Los labriegos de Perosillo y aldeas vecinas, a lomos de sus mulas cargadas de grano, esperaban pacientemente su turno pagando la temida 'maquila' (el porcentaje de harina que cobraba el molinero)." },
    { id: 22, name: "MOLINO DEL PINO", category: "Industrial", coords: "41°23'11.3\"N 4°28'40.2\"W", address: "MATA DE CUÉLLAR", note: "Molino harinero tradicional de construcción en piedra.", image: "https://lh3.googleusercontent.com/d/1QHfZI8SSmgCvXLqL8xfqfGIW4j1QidyZ", history: "Sólidamente asentado en los frondosos y húmedos márgenes del río Cega, este molino destaca por la rotunda maestría de su cantería de sillería, diseñada inteligentemente para resistir las formidables y violentas crecidas estacionales del cauce. La figura del molinero del Pino siempre estuvo envuelta en la rica literatura oral castellana; a menudo visto con suspicacia por su monopolio sobre el pan. Hoy, su estructura es un retiro natural de incomparable belleza escondido en el linde territorial de Mata de Cuéllar." },
    { id: 23, name: "TORREÓN DE SANTA MARÍA", category: "Historia", coords: "41°24'00.1\"N 4°13'24.6\"W", address: "LOVINGOS", note: "Restos de la torre de la antigua iglesia parroquial.", image: "https://lh3.googleusercontent.com/d/12-tiwbmOPXc99pjF9KBSKngNudN5q3j2", history: "Esta colosal torre de mampostería y potente ladrillo, que parece vigilar estoicamente el caserío de Lovingos, fue antaño el orgulloso campanario de una bella iglesia románico-mudéjar hoy sumida trágicamente en la desaparición. Su evidente diseño fortificado, de paredes gruesas y extremadamente escaso en vanos, insinúa de forma rotunda que sirvió como un recio refugio defensivo. En los inciertos tiempos de la repoblación (s. XII) y durante las luchas intestinas de la nobleza, estas iglesias-fortaleza eran el bastión del pueblo." },
    { id: 24, name: "MOLINO BATÁN DE GARRIDO", category: "Industrial", coords: "41°17'01.9\"N 4°08'49.1\"W", address: "LASTRAS DE CUÉLLAR", note: "Antiguo batán utilizado para el tratamiento de tujeidos.", image: "https://lh3.googleusercontent.com/d/1mQd-aSaoONOTkJ1Z4o3PHmx8-YOVFJ-5", history: "A diferencia de los tradicionales molinos harineros, este fascinante artilugio del río Cega empleaba la fuerza hidráulica para una tarea industrial mucho más pesada y ruidosa: accionar inmensos mazos de madera. Estos mazos golpeaban rítmicamente y apelmazaban ('abatanaban') los rudos tejidos y paños de lana para darles suavidad y resistencia. Los batanes (famosos por aterrorizar a Don Quijote en la literatura de Cervantes) fueron la pieza fundamental del fenomenal auge de la industria textil segoviana en el siglo XVI." },
    { id: 25, name: "MOLINO DEL LADRÓN", category: "Industrial", coords: "41°17'24.8\"N 4°09'04.2\"W", address: "LASTRAS DE CUÉLLAR", note: "Construcción hidráulica ssingular en la ribera del cega.", image: "https://lh3.googleusercontent.com/d/1rLaLeQSbbgjDax94O9AtK95YUK-aXqch", history: "Su atrayente y novelesco nombre evoca oscuras historias de bandolerismo decimonónico en los recónditos senderos fluviales del Cega; o tal vez, como dictan las malas lenguas de antaño, hace referencia a las amargas querellas aldeanas por presuntos robos sistemáticos en el peso de la molienda por parte de avaros propietarios. Emplazado en un serpenteante, frondoso y casi inaccesible recodo del río, el Molino del Ladrón es una perla escondida de la ingeniería rústica y la etnografía de Lastras de Cuéllar." },
    { id: 26, name: "FÁBRICA DE HARINA", category: "Industrial", coords: "41°20'52.1\"N 4°07'09.3\"W", address: "HONTALBILLA", note: "Instalación industrial cerealista de principios del siglo XX.", image: "https://lh3.googleusercontent.com/d/15YNrBNAkxC31UZTGjTZzN-cejyDL_jPl", history: "Inaugurada a bombo y platillo en los albores del siglo XX, su monumental y soberbia estructura fabril de ladrillo rojo cambió para siempre la fisonomía de Hontalbilla. Este imponente salto a la producción mecanizada en cadena (movida inicialmente a vapor y después por la red eléctrica) concentró la pujante producción harinera de la comarca. Con su colosal eficiencia, provocó inexorablemente la quiebra y abandono generalizado de los pintorescos molinos artesanales de piedra que poblaban los arroyos locales." },
    { id: 27, name: "IGLESIA DE SAN JUAN BAUTISTA", category: "Historia", coords: "41°24'52.2\"N 4°12'55.3\"W", address: "FUENTES DE CUÉLLAR", note: "Templo que destaca por su volumetría y elementos arquitectónicos.", image: "https://lh3.googleusercontent.com/d/1jQ7IcxvU5BOpUnE50rk5H-7nu-dluzfX", history: "Orgullosa de su hercúlea torre-campanario y de sus delicados detalles escultóricos, esta iglesia parroquial fusiona armoniosamente las postrimerías del gótico decadente con la serena luz del naciente Renacimiento español (s. XVI). La obra contó con la indudable influencia de la poderosa Casa de Alburquerque, Grandes de España que dominaban la zona. Levantada piedra a piedra, sus gruesos y venerables muros han resguardado la fe, los ritos vitales y la memoria genealógica de todo el valle durante casi quinientos años." },
    { id: 28, name: "MOLINO DE ALVARADO", category: "Industrial", coords: "41°18'36.8\"N 4°27'30.9\"W", address: "FRESNEDA DE CUÉLLAR", note: "Maquinaria e ingenio harinero típico de la comarca cuellarana.", image: "https://lh3.googleusercontent.com/d/196qwJ5Sp-_mAmg42vR1RvSLqk7lKKGqb", history: "Un poderoso ingenio hidráulico cuyas raíces documentales se hunden profundamente en la Baja Edad Media. A lo largo de los siglos, el molino estuvo inmerso en pleitos territoriales por el valioso control del cauce, involucrando a linajes de rancio abolengo como los Alvarado. Estratégicamente ubicado en la fértil y verde vega pinariega, resistió guerras y terribles riadas destructivas. Hoy, el musgo de sus gastadas piedras y el incesante rumor del torrente componen un inolvidable y sobrecogedor cuadro romántico." },
    { id: 29, name: "IGLESIA DE SAN BARTOLOMÉ DE POCIAGUE", category: "Ruinas", coords: "41°26'57.6\"N 4°16'22.6\"W", address: "ESCARABAJOSA DE CUÉLLAR", note: "Restos de la iglesia del antiguo despoblado de Pociague.", image: "https://lh3.googleusercontent.com/d/1Z-NWGVzsP-RYlb5JTWpLwVH7_V8w6af7", history: "Las melancólicas e impresionantes ruinas de San Bartolomé son el último estertor físico de Pociague, una antigua y próspera aldea campesina que fue trágicamente asolada por la despoblación. Como muchos 'despoblados' castellanos, sucumbió entre los siglos XIV y XVII debido al azote brutal de sequías continuadas, la Peste Negra y la asfixiante presión fiscal de la nobleza. Hoy, la agresiva maleza trepa por los nobles sillares de este espectro, regalándonos la imagen más cruda de la Castilla perdida." },
    { id: 30, name: "MONASTERIO DE SAN FRANCISCO", category: "Historia", coords: "41°24'07.6\"N 4°18'37.0\"W", address: "CUÉLLAR", note: "Cuna del gótico isabelino y panteón de los Duques de Alburquerque.", image: "https://lh3.googleusercontent.com/d/1eHL9GxGO6sKntKQPfcBcMtwPXl2B5b0T", history: "Fundado en el siglo XIII, fue el cenobio franciscano más extenso y acaudalado de toda la comarca. Alcanzó la gloria cuando el poderoso don Beltrán de la Cueva, primer duque de Alburquerque y valido real, lo erigió como su fastuoso panteón familiar (s. XV), encargando suntuosos sepulcros de alabastro en puro estilo gótico isabelino. Por sus claustros pernoctó la mismísima reina Isabel la Católica. Tristemente, fue saqueado sin piedad por las tropas francesas de Napoleón en 1808 y clausurado en 1835. Hoy, sus arcos caídos son arte puro." },
    { id: 31, name: "CONVENTO DE LA SANTÍSIMA TRINIDAD", category: "Historia", coords: "41°23'57.8\"N 4°18'54.4\"W", address: "CUÉLLAR", note: "Antiguo establecimiento religioso de los padres trinitarios.", image: "https://lh3.googleusercontent.com/d/1gczcmUZ8iR2HtOvawczkhSiQK91V8UWE", history: "Levantado en el siglo XIII, este imponente edificio fue el epicentro de la Orden de la Santísima Trinidad en la villa. Su misión principal y heroica fue la recaudación de limosnas para la redención y rescate de cautivos cristianos apresados por piratas berberiscos o en las guerras contra Al-Ándalus. Aunque sufrió severos expolios durante la invasión francesa y la desamortización de Mendizábal, su ábside mudéjar de ladrillo cocido sigue siendo una de las joyas de la arquitectura religiosa cuellarana." },
    { id: 32, name: "ERMITA DE SAN BENITO", category: "Historia", coords: "41°22'18.3\"N 4°07'20.5\"W", address: "ADRADOS", note: "Lugar de culto histórico en las proximidades del municipio.", image: "https://lh3.googleusercontent.com/d/1EPuJsSoudLaK7wCuGd_Vqe8J6QzEeTFo", history: "Anclada en la inmensidad de la Tierra de Pinares, la ermita de San Benito es de origen bajomedieval. Históricamente, estuvo profundamente vinculada a las durísimas rutinas agrícolas de Adrados. En este santuario, las cofradías locales llevaban a cabo fervorosas rogativas para pedir la protección de sus cosechas de cereal frente a las temidas tormentas de pedrisco veraniegas. Su construcción sencilla de mampostería y ladrillo refleja a la perfección la austeridad de la vida rural segoviana." },
    { id: 33, name: "CERRO DE LAS SERVITONAS", category: "Ruinas", coords: "41°24'19.4\"N 3°57'16.6\"W", address: "SAN MIGUEL DE BERNUY", note: "Asentamiento antiguo con vistas panorámicas al valle del Duratón.", image: "https://lh3.googleusercontent.com/d/1eMRMnqamFzkjKumgrb5Zvfb4lQAN5w7W", history: "Este promontorio calizo, elevado estratégicamente sobre un cerrado meandro del río Duratón, esconde uno de los yacimientos arqueológicos más fascinantes de la comarca. Fue originalmente un poblado o castro celtíbero de la tribu de los arévacos, y posteriormente romanizado y ocupado en época visigoda. Era un punto clave de vigilancia militar y de cobro de peajes para controlar el vado del río. Hoy, sus ruinas semienterradas ofrecen una vista panorámica soberbia del cañón místico." },
    { id: 34, name: "MOLINO DE ABAJO Y MOLINO DE ENMEDIO", category: "Industrial", coords: "41°27'02.8\"N 4°04'53.0\"W", address: "MEMBRIBRE DE LA HOZ", note: "Conjunto hidráulico harinero en un entorno natural encajonado.", image: "https://lh3.googleusercontent.com/d/1mKujIXqs52VdyAY2Gg-Jzqf2JZzwkVLf", history: "Un formidable conjunto de molinos harineros encajonados en la dramática hoz excavada por el río. Activos desde el siglo XVI, fueron vitales para la supervivencia económica de la comarca norteña. Lo más destacable de estos ingenios es su compleja red de presas, cazes y cárcavos; una verdadera clase magistral de ingeniería tradicional diseñada para exprimir hasta la última gota del escaso caudal de agua disponible durante los tórridos meses de verano castellano." },
    { id: 35, name: "MURALLA Y CASTILLO", category: "Historia", coords: "41°26'21.0\"N 3°58'40.6\"W", address: "FUENTIDUEÑA", note: "Importante conjunto defensivo medieval sobre el cerro.", image: "https://lh3.googleusercontent.com/d/1SbMn-jo5QWY_zgqpWk-MEH_FF1Xw2Tnk", history: "Coronando un escarpado espolón rocoso, esta inexpugnable fortaleza fue erigida entre los siglos XII y XIII bajo el impulso de Alfonso VIII para afianzar la línea defensiva del Duero frente al poder almohade. Fue un enclave estratégico de primer orden y residencia del rey Alfonso X el Sabio. Más tarde pasó a manos de la poderosa Casa de Luna. A pesar del incesante expolio, aún conserva gruesos muros de mampostería, restos de sus formidables torres de homenaje y misteriosas bóvedas de cañón." },
    { id: 36, name: "LINARES DEL ARROYO", category: "Ruinas", coords: "41°31'24.9\"N 3°33'23.9\"W", address: "MADERUELO", note: "Pueblo sumergido bajo las aguas del embalse de Linares.", image: "https://lh3.googleusercontent.com/d/1iwQkBBFxP1mvGeL0F3M3NRxaJ-rW6pAd", history: "La trágica historia del progreso del siglo XX. Linares del Arroyo fue un próspero pueblo agrícola que quedó sepultado para siempre en 1951 bajo las oscuras aguas del pantano de Linares (construido en la dictadura para el regadío y producción eléctrica). Cuando las duras sequías estivales bajan el nivel del embalse, el esqueleto del viejo caserío, el puente medieval y la torre descarnada de su iglesia emergen a la superficie, dibujando uno de los paisajes más fantasmagóricos y sobrecogedores de Segovia." },
    { id: 37, name: "IGLESIA DE SAN MARTÍN", category: "Historia", coords: "41°26'21.3\"N 3°58'39.7\"W", address: "FUENTIDUEÑA", note: "Templo románico exento situado en la zona alta de la villa.", image: "https://lh3.googleusercontent.com/d/1sUPIYmdTZnbI7mAaBUXNR-6M9hQKaHH_", history: "Joya sin parangón del románico segoviano (s. XII). Su historia es digna de película: en 1957, en pleno franquismo, el Estado Español autorizó que la monumental cabecera y el ábside de la iglesia fueran desmontados piedra a piedra y trasladados a Estados Unidos, donde hoy se exhiben en el prestigioso museo 'The Cloisters' de Nueva York. A cambio, España recibió frescos medievales. Hoy, los solitarios y melancólicos restos que quedaron en Fuentidueña dominan una impresionante necrópolis de tumbas antropomorfas." },
    { id: 38, name: "HOSPITAL DE SANTA MARÍA MAGDALENA", category: "Historia", coords: "41°26'30.5\"N 3°58'52.2\"W", address: "FUENTIDUEÑA", note: "Fundación benéfica medieval de gran interés histórico.", image: "https://lh3.googleusercontent.com/d/1EyshGj6Ms_HU6RoZBkdTk-OXwiV6n1VH",  history: "Fundado en 1540 gracias al patrocinio de doña Mencía de Mendoza, Condesa de Fuentidueña, este hospital fue una avanzada institución benéfica renacentista. Su función principal era atender a los incontables pobres, huérfanos, enfermos y peregrinos que transitaban los escarpados caminos del Valle del Duratón. Sus restos consolidados son un testimonio vivo del inmenso poder económico, nobiliario y de la caridad cristiana que la villa de Fuentidueña ostentó durante la Edad de Oro española." },
    { id: 39, name: "ERMITA DE SAN MIGUEL", category: "Historia", coords: "41°29'48.6\"N 3°57'55.2\"W", address: "SACRAMENIA", note: "Joya del románico rural segoviano en un paraje solitario.", image: "https://lh3.googleusercontent.com/d/1lbhTCSL2t76zDiQ5z3c3Yb3CzUL6bZiY", history: "Ubicada en lo alto de un teso vigía, esta ermita románica del siglo XII domina imponente el caserío de Sacramenia. Destaca enormemente por sus rudos y enigmáticos canecillos esculpidos en el alero, que muestran figuras de animales, demonios y escenas profanas. Históricamente, su titularidad a San Miguel Arcángel nos habla de las costumbres de los guerreros y repobladores fronterizos, que encomendaban a este santo batallador la protección del territorio frente a las invasiones musulmanas." },
    { id: 40, name: "PALACIO DE LOS CONTRERAS", category: "Historia", coords: "41°29'38.0\"N 4°01'42.0\"W", address: "LAGUNA DE CONTRERAS", note: "Palacio fortificado que conserva su aire de dominio medieval.", image: "https://lh3.googleusercontent.com/d/1LfppuKioxZiimm32lN045zKBs6DQkcgs", history: "Formidable casona fortificada erigida a finales del siglo XV. Fue construida por don Fernán González de Contreras, representante de uno de los linajes más poderosos y temidos del norte de Segovia. Con su fiero aspecto de fortaleza palaciega, sus torres defensivas truncadas y sus blasones tallados, el edificio escenifica perfectamente el férreo control político y económico que la alta nobleza ejercía sobre los vasallos del valle inferior del río Duratón durante el final de la Baja Edad Media." },
    { id: 41, name: "IGLESIA CONVENTO DE SAN MARTÍN DEL CASUAR", category: "Ruinas", coords: "41°32'44.7\"N 3°35'59.6\"W", address: "MONTEJO DE LA VEGA", note: "Restos del monasterio románico en las Hoces del Riaza.", image: "https://lh3.googleusercontent.com/d/1ywsiybCQi2PzLeXzXmiSxd0-pNKKecx0", history: "Declarado Monumento Nacional en 1931, estas misteriosas y bellísimas ruinas pertenecen a un priorato fundado en el siglo XI. Estuvo bajo la protección directa de Alfonso VI y posteriormente dependió del poderoso Monasterio de San Pedro de Arlanza (Burgos). Oculto en la agreste y sublime soledad de las Hoces del Riaza, el monasterio fue abandonado mucho antes de la Desamortización. Hoy, sus gigantescos arcos románicos descarnados son un espectáculo sobrecogedor y el refugio predilecto de las colonias de buitres leonados." },
    { id: 42, name: "CASTILLO Y MURALLAS", category: "Historia", coords: "41°33'03.9\"N 3°39'16.6\"W", address: "MONTEJO DE LA VEGA", note: "Antigua fortificación defensiva del nordeste segoviano.", image: "https://lh3.googleusercontent.com/d/1CKuRQa2vOhZ-iPQidh_Cy3hZGJmxoLde", history: "Ubicado sobre un farallón natural asomado a la vega del río Riaza, este castillo fue erigido entre los siglos XIII y XIV. Formó un baluarte inexpugnable perteneciente a la inmensa Comunidad de Villa y Tierra de Maderuelo. Su función era frenar posibles penetraciones bélicas y asegurar la ruta ganadera hacia Burgos. Aunque el implacable expolio de sus sillares y el abandono lo han reducido a apenas un esqueleto ciclópeo de cal y canto, su rotunda silueta domina el valle infundiendo un profundo respeto." },
    { id: 43, name: "CASERÍO DE MALUQUE", category: "Ruinas", coords: "41°33'08.3\"N 3°33'17.3\"W", address: "MADERUELO", note: "Asentamiento abandonado que conserva la structure tradicional.", image: "https://lh3.googleusercontent.com/d/1FfAATGf-09Y5ecwlaH5IE2LPDsJJK5-w", history: "Maluque fue una minúscula aldea medieval, un anexo vital de las tierras de pastoreo entre Maderuelo y Montejo. Las hipótesis arqueológicas e históricas sugieren que su trágico abandono comenzó con la atroz epidemia de Peste Negra (s. XIV), que diezmó a la población europea, forzando a los supervivientes a huir y concentrarse en villas amuralladas mayores. En la actualidad, cubiertos por tomillos y encinas, aún se pueden distinguir perfectamente los cimientos de sus rudimentarias viviendas campesinas y corrales." },
    { id: 44, name: "IGLESIA DE NUESTRA SEÑORA DE LA NATIVIDAD", category: "Historia", coords: "41°17'54.8\"N 3°20'22.0\"W", address: "SERRACÍN", note: "Templo emblemático de los pueblos rojos y negros de Segovia.", image: "https://lh3.googleusercontent.com/d/1Z2-jho4K6lBNNUkAjPCkDwjfdQi6AUXd", history: "Este templo es el buque insignia de la fascinante arquitectura de los 'pueblos rojos y negros' de la sierra de Ayllón. De robusto origen románico, fue ampliada a lo largo de los siglos XVI y XVII. Lo verdaderamente insólito es su construcción material: una vibrante mezcla cromática de oscuras lajas de pizarra negra entrelazadas con las pesadas y rústicas piedras ferruginosas (brechas rojas) locales. Históricamente, albergó las asambleas del Concejo y fue el faro espiritual de estas duras y gélidas tierras serranas." },
    { id: 45, name: "LOS PAREDONES", category: "Ruinas", coords: "41°25'16.0\"N 3°22'23.9\"W", address: "AYLLÓN", note: "Vestigios de antiguas construcciones defensivas de tierra batida.", image: "https://lh3.googleusercontent.com/d/1A7aToJgyRJmR-TU2UbMnD4YdKDduXBUg", history: "Llamados así popularmente, 'Los Paredones' son unos enigmáticos y ciclópeos muros levantados en puro 'tapial' (tierra y arcilla fuertemente apisonada en encofrados). Según las investigaciones, datan de la etapa islámica o altomedieval. Constituyen uno de los escasísimos y más valiosos ejemplos de esta cruda arquitectura defensiva musulmana en la provincia, ideada para proteger a gran velocidad los indefensos arrabales y zonas de huertas de la siempre asediada e ilustre villa de Ayllón." },
    { id: 46, name: "IGLESIA DE SAN MIGUEL ARCÁNGEL", category: "Historia", coords: "41°20'53.2\"N 3°24'31.7\"W", address: "ALDEA LÁZARO RIBOTA", note: "Parroquia medieval destacada en su entorno rural.", image: "https://lh3.googleusercontent.com/d/1Jc-7YhCcP3ylaz8AjL_oM4bEICSp9RAz", history: "Aislada en los confines orientales de Segovia, esta humilde parroquia encierra un bellísimo pasado. Su fábrica original del siglo XII conserva intacta su portada románica, exquisitamente esculpida con motivos geométricos y rosetas vegetales por maestros canteros anónimos. Durante generaciones sirvió ininterrumpidamente de asilo y centro cívico para la aldea, cuyas paupérrimas familias basaban toda su subsistencia en la implacable maderería forestal y el duro pastoreo del somontano." },
    { id: 47, name: "IGLESIA DE SAN CRISTÓBAL", category: "Historia", coords: "41°19'56.4\"N 3°27'12.5\"W", address: "CINCO VILLAS", note: "Templo románico de gran sobriedad en la campiña.", image: "https://lh3.googleusercontent.com/d/15U-9xWOrtcy8rLGefLXDtoORCNj5_17V", history: "Pequeño y sobrio templo románico construido a base de sillería rojiza local, situado justo en la abrupta zona de transición entre el Macizo de Ayllón y la extensa meseta. Posee una portada arquivoltada desprovista de excesos, pero de una elegancia rústica aplastante. Es el último testigo mudo de la rápida y desesperada repoblación de las Tierras del Fresno de Cantespino promovida durante los siglos XI y XII para solidificar las fronteras reconquistadas de la Corona." },
    { id: 48, name: "IGLESIA DE SAN JUAN", category: "Historia", coords: "41°23'06.5\"N 3°31'53.6\"W", address: "CASTILTIERRA", note: "Iglesia ligada a la famosa necrópolis visigoda de Castiltierra.", image: "https://lh3.googleusercontent.com/d/1C2hX5H2DYkw09-MZ9LesJ2kp0vfxbBlj", history: "Su tremenda importancia histórica no radica solo en sus propios muros románicos, sino en el suelo que pisa. Castiltierra es mundialmente famosa por albergar a sus afueras una de las mayores y más ricas necrópolis visigodas de Europa (siglos V al VII). Excavada intensamente en los años 30 por Pelayo Quintero y Santa Olalla, se desenterraron joyas de oro y ajuares bárbaros de incalculable valor. La iglesia, construida siglos después, simplemente heredó la ancestral sacralidad de este magnético terreno." },
    { id: 49, name: "IGLESIA DE SAN ANTONIO", category: "Historia", coords: "41°20'12.7\"N 3°32'39.4\"W", address: "ALDEANUEVA DEL MONTE", note: "Muestra arquitectónica religiosa del área de influencia de Riaza.", image: "https://lh3.googleusercontent.com/d/1lTjM9mSWXreZpGxWflIifU6LGy1nTMXr", history: "Austerísima y modesta construcción religiosa enclavada en las frías tierras del nordeste provincial. Su historia está inevitablemente hilada a las grandes vías pecuarias: en sus inmediaciones transitaban anualmente, entre gigantescas nubes de polvo, los inmensos rebaños del Honrado Concejo de la Mesta que subían a los pastos de verano de la cercana sierra de Riaza y Ayllón. Sus toscos muros de piedra conservan la memoria del implacable frío y el absoluto aislamiento histórico de la comarca." },
    { id: 50, name: "LA MOLINILLA Y ERMITA DE LA VIRGEN DE LA CALLEJA", category: "Historia", coords: "41°17'52.6\"N 3°51'59.6\"W", address: "VILLASECA", note: "Paraje místico cercano a las hoces del río Duratón.", image: "https://lh3.googleusercontent.com/d/1JQVETziB4Xc5S_BQI_rKCoGQkcy6L4JB", history: "Lugar tocado por una magia indescriptible, enclavado en la misma garganta de entrada al formidable cañón de las Hoces del Duratón. El viejo molino harinero ('La Molinilla') de arquitectura serrana y recia mampostería, y su ermita compañera, levantada a costa de donativos de los devotos, forman una estampa inamovible. Era y sigue siendo parada obligada y reconfortante de los romeros hacia el templo de San Frutos. Todo el lugar rezuma la espiritualidad y el sobrecogedor misticismo de los siglos medievales." },
    { id: 51, name: "MONASTERIO DE SANTO TOMÉ DEL PUERTO", category: "Ruinas", coords: "41°11'56.8\"N 3°35'24.7\"W", address: "VILLAREJO", note: "Restos monásticos situados estratégicamente en el puerto.", image: "https://lh3.googleusercontent.com/d/1xnG9rFZoqzc_5cm1aqMHH6-7ywaVLt9D", history: "Grandiosas e imponentes ruinas de lo que fue en el medievo un importantísimo priorato de monjes canónigos premostratenses y, posteriormente, agustinos. Fundado en el remoto siglo XII, su emplazamiento no era casual: el monasterio actuaba como guardián y benefactor en el estratégico embudo geográfico del Puerto de Somosierra. Controlaba las aduanas, brindaba asistencia vital a las comitivas de reyes o mercaderes atrapados en las severas ventiscas y recaudaba el lucrativo y fundamental 'portazgo' ganadero." },
    { id: 52, name: "IGLESIA DE NUESTRA SEÑORA DE LA SERNA", category: "Historia", coords: "41°16'02.5\"N 3°43'05.9\"W", address: "VELOSILLO", note: "Edificación románica de gran encanto en el altiplano segoviano.", image: "https://lh3.googleusercontent.com/d/163iWMzqlS-X6KBnJh48UO-0tTcgfWuRg", history: "Verdadera e intacta joya románica, célebre por exhibir una espléndida y armoniosa galería porticada, la aportación arquitectónica más genial y genuina del románico segoviano al arte universal. Sus formidables capiteles esculpidos funcionaban en la Edad Media como una 'Biblia de piedra', adoctrinando visualmente a los fieles campesinos completamente analfabetos con bestiarios exóticos y duras escenas del Nuevo Testamento. Salvada del olvido gracias al empeño de sus escasos pero heroicos vecinos." },
    { id: 53, name: "MOLINO DE SAN JUAN", category: "Historia", coords: "41°15'52.9\"N 3°50'53.2\"W", address: "VALDESIMONTE", note: "Molino harinero restaurado que aprovecha el cauce del San Juan.", image: "https://lh3.googleusercontent.com/d/1edd3MOzUimD7S20ZvTGhkRomxZiPEMOG", history: "Fantástico ejemplo del patrimonio preindustrial que alimentaba la provincia. Durante varios siglos de esplendor cerealístico, este sólido molino de río aprovechó infatigablemente el modesto pero vital y constante caudal del arroyo del Valle de San Juan. Recientemente restaurado con un primor absoluto, hoy permite al visitante comprender in situ la ingeniosa mecánica de rodeznos horizontales, ejes y el lento girar de las enormes y estriadas piedras volanderas de moler grano." },
    { id: 54, name: "LAVADERO DE LANAS DE LA ALDEA LA PEÑA", category: "Industrial", coords: "41°12'17.8\"N 3°37'20.7\"W", address: "SIGUERO", note: "Muestra de la antigua importancia de la trashumancia y el esquileo.", image: "https://lh3.googleusercontent.com/d/1MLaScPwj4KYMxV4P0_avJqWvqoH4nmxA", history: "Vestigio antropológico fascinante y colosal de la época dorada de la Mesta castellana y del incalculable poder de la ciudad de Segovia. En estas intrincadas infraestructuras de pilas de granito y acequias se escaldaban y lavaban afanosamente millones de vellones de pura oveja merina, dejándolos listos para su exportación marítima a las codiciosas fábricas de la lejana Flandes. Un recuerdo físico vivo de cuando la exceptional lana segoviana sostenía financieramente al gigantesco Imperio Español de los Austrias." },
    { id: 55, name: "MOLINO DE LA OCECILLA", category: "Industrial", coords: "41°18'37.0\"N 3°43'45.2\"W", address: "SEPÚLVEDA", note: "Maquinaria hidráulica tradicional en el entorno de la villa sepulvedana.", image: "https://lh3.googleusercontent.com/d/1-qBgKwHaTeho3jys8ZLHj9HJlGQ5nt6T", history: "Este molino yace encajonado inverosímilmente en las entrañas de uno de los parajes calizos más dramáticos y verticales del río Caslilla, a un suspiro de su desembocadura en el majestuoso Duratón. Durante toda la Edad Media y el Renacimiento, sus estoicos dueños debían lidiar diariamente con este entorno salvaje e indómito, sufriendo espantosas avenidas de agua para poder abastecer puntualmente del ansiado pan a los numerosos y exigentes habitantes de la vecina y populosa villa fortificada de Sepúlveda." },
    { id: 56, name: "IGLESIA DE SAN MILLÁN", category: "Historia", coords: "41°18'03.3\"N 3°44'57.0\"W", address: "SEPÚLVEDA", note: "Antiguo templo que forma parte del conjunto monumental de Sepúlveda.", image: "https://lh3.googleusercontent.com/d/1X1pHpX6gCtgCgxIufWHIymtRDEkK25x4", history: "Pura y cruda historia militar convertida en piedra. Es una imponente iglesia románica fechada en el bravo siglo XII y declarada, por su tremenda valía, Monumento Nacional. En su momento de máximo apogeo demográfico, sirvió como epicentro religioso a uno de los bulliciosos barrios extramuros de la amurallada villa. Su arquitectura de fortísima mampostería, unida a sus gastados capiteles, evocan las durísimas y sangrientas batallas reconquistadoras de los repobladores que dictaron los célebres Fueros de Sepúlveda." },
    { id: 57, name: "PALACIO Y DESPOBLADO DE SAN MIGUEL DE NEGUERA", category: "Ruinas", coords: "41°16'49.5\"N 3°50'32.9\"W", address: "SEBÚLCOR", note: "Villa señorial abandonada a orillas del Duratón.", image: "https://lh3.googleusercontent.com/d/14HiCAZwiaZslTGjmH-MfMMDAw7VZ55uz", history: "Las melancólicas ruinas del caserío y el desvencijado palacete de San Miguel de Neguera (que gozó de gran preeminencia, situado a orillas del cristalino Duratón), son un recuerdo intensamente romántico de señoríos terratenientes pasados y de la gloria nobiliaria que se desvaneció. Asolada paulatinamente y abandonada por las paupérrimas condiciones de vida de sus labriegos, hoy sus aristocráticos blasones caídos en la tierra son un absoluto remanso de paz engullido inexorablemente por el espeso bosque de ribera." },
    { id: 58, name: "CONVENTO DE LA HOZ", category: "Ruinas", coords: "41°18'49.5\"N 3°52'19.5\"W", address: "SEBÚLCOR", note: "Monasterio rupestre místico sobre el Duratón.", image: "https://lh3.googleusercontent.com/d/1RhrTJr924L9fqy1vt6oSe4bOBTmZNy4k", history: "Convento de Nuestra Señora de la Hoz, fundado en 1231 en un entorno de sublime belleza y peligrosidad: encajonado en el fondo del cañón del Duratón y accesible sólo en barca o por senderos infernales. Acogió a monjes franciscanos eremitas, e incluso la Reina Isabel la Católica lo visitó, atraída por la venerada Virgen y los milagros documentados allí. Tras la feroz desamortización de 1835, fue abandonado y hoy sus ruinas góticas colgadas en el precipicio ofrecen la imagen más abrumadora y mágica de Segovia." },
    { id: 59, name: "ERMITA DE SANTIAGO DE REBOLLO", category: "Historia", coords: "41°12'30.7\"N 3°48'46.6\"W", address: "SAN PEDRO DE GAÍLLOS", note: "Santuario rural de devoción popular local.", image: "https://lh3.googleusercontent.com/d/187gB6opmiO9vtxvzV8NbCVhT_xoxCVEM", history: "Santuario rural inquebrantablemente enraizado en la más íntima y supersticiosa piedad popular castellana. Su titularidad a Santiago Apóstol sugiere con muchísima fuerza a los arqueólogos que la zona era una transitada ruta secundaria, o ramal olvidado, de antiquísimos y extenuantes peregrinajes peninsulares. Construida en su totalidad con humildísima mampostería local, sigue custodiando la memoria de las viejas y desgarradoras rogativas que clamaban piedad a los cielos por unas buenas cosechas." },
    { id: 60, name: "PALACIO DEL MARQUÉS REVILLA", category: "Historia", coords: "41°24'49.5\"N 3°45'03.6\"W", address: "NAVARES DE LAS CUEVAS", note: "Grandeza señorial en una de las comarcas más auténticas de Segovia.", image: "https://lh3.googleusercontent.com/d/12uKyhI3ErQP10GR2XErSRT_csZReiAPW", history: "Imponente mole señorial y palaciega construida a finales del brillante siglo XVI. El enorme edificio refleja sin pudor la supremacía de los formidables Marqueses de Revilla, que poseían inmensas e inabarcables extensiones de prósperas tierras agrícolas y pastos de la Mesta por todo el norte. Su desmesurado y arrogante escudo heráldico de la fachada, sumado a las gruesas e impenetrables rejas de forja, hablan del despótico e incontestable poder feudal que persistió sin oposición en el agreste nordeste segoviano." },
    { id: 61, name: "DESPOBLADO DE MATANDRINO", category: "Ruinas", coords: "41°09'00.5\"N 3°42'37.0\"W", address: "PRÁDENA", note: "Pueblo deshabitado místico que conserva el alma medieval.", image: "https://lh3.googleusercontent.com/d/1XPVZN6TAuTo--zY4FC2dTCx4Fk7j1TDw", history: "Matandrino es uno de los símbolos más sobrecogedores de la despoblación en la provincia. Aunque sus orígenes se remontan a las repoblaciones medievales, fue a mediados del siglo XX cuando sus últimos habitantes, asfixiados por la falta de recursos y el aislamiento, cerraron sus puertas para siempre. Hoy, pasear entre los escombros de sus casas de piedra caliza y sus calles invadidas por la naturaleza es un viaje melancólico al duro pasado rural de Castilla." },
    { id: 62, name: "IGLESIA DE SAN MIGUEL", category: "Historia", coords: "41°20'37.6\"N 3°51'58.6\"W", address: "FRESNEDA DE SEPÚLVEDA", note: "Parroquia rural de origen medieval en la tierra de Sepúlveda.", image: "https://lh3.googleusercontent.com/d/1Rg7F2ZgWqBPWwi7rTTGljSm2gWI1O9Es", history: "Perteneciente históricamente a la poderosa Comunidad de Villa y Tierra de Sepúlveda, esta iglesia parroquial es un bello ejemplo del románico tardío. Sus muros, levantados con el esfuerzo y las donaciones de humildes agricultores y ganaderos locales, sirvieron no solo como centro de culto sino como núcleo de reunión para el concejo. Su arquitectura austera refleja la sobriedad de las gentes que habitaron este somontano segoviano." },
    { id: 63, name: "DESPOBLADO DE VILLAREJO", category: "Ruinas", coords: "41°17'54.7\"N 3°40'32.6\"W", address: "EL OLMO", note: "Vestigios de un antiguo núcleo de población hoy desaparecido.", image: "https://lh3.googleusercontent.com/d/1xEgzzG9q8rzw0Sn3gZMDgGRd32SvqZtY", history: "Las escasas ruinas del despoblado de Villarejo son el último suspiro de una pequeña comunidad agrícola que no logró sobrevivir a los embates de la historia. Las crisis demográficas del siglo XVII, sumadas a las duras sequías y presiones fiscales, obligaron a sus habitantes a integrarse en núcleos mayores como El Olmo. Apenas quedan montículos de piedras que marcan el lugar donde antaño hubo hogares y corrales familiares." },
    { id: 64, name: "DESPOBLADO DE CORRALEJO", category: "Ruinas", coords: "41°17'46.5\"N 3°38'34.4\"W", address: "EL OLMO", note: "Huellas de la historia rural en el campo segoviano.", image: "https://lh3.googleusercontent.com/d/1MBHc6_84V_F6W7RSM0QxvZZm6gwqP_As", history: "Hermano en infortunio de Villarejo, el despoblado de Corralejo comparte la misma historia de abandono. Sus habitantes, dedicados a una agricultura de pura subsistencia y al pastoreo, dejaron atrás sus tierras, que finalmente fueron absorbidas por terratenientes o pueblos cercanos. Estos vestigios semienterrados nos recuerdan la extrema fragilidad de los asentamientos fronterizos en los ásperos inviernos de la meseta castellana." },
    { id: 65, name: "ERMITA DE SAN LORENZO", category: "Historia", coords: "41°19'25.0\"N 3°42'12.3\"W", address: "EL OLMILLO", note: "Pequeño templo románico de gran sencillez y belleza.", image: "https://lh3.googleusercontent.com/d/1kraCFHblo2uPaOLB7TYKGLwk1V7TKQWJ", history: "Joya escondida del románico rural, la ermita de San Lorenzo destaca por su pureza de líneas y la modestia de sus proporciones. Construida durante los siglos XII-XIII, cuenta con una delicada cabecera semicircular y un sencillo pórtico. En su época dorada, era el lugar donde los campesinos acudían a bendecir los campos cada 10 de agosto, rogando a San Lorenzo protección contra los temidos incendios de la siega." },
    { id: 66, name: "CASA PALACIO DE LOS MARQUESES DE CASTROSERNA", category: "Historia", coords: "41°11'23.5\"N 3°42'54.2\"W", address: "CASTROSERNA DE ARRIBA", note: "Edificio señorial representativo de la nobleza segoviana.", image: "https://lh3.googleusercontent.com/d/1gs6tn-KJmGW0TeHxrecWuuX_24IjrNho", history: "Este imponente edificio palaciego, que domina la plaza del pueblo, atestigua el inmenso poder señorial que la nobleza ostentaba sobre las zonas rurales. Perteneció a los Marqueses de Castroserna, un título concedido en el siglo XVIII que consolidó el dominio aristocrático de estos valles. Su fachada blasonada, amplios patios y gruesos muros de sillería eran el símbolo palpable de la autoridad feudal y la recaudación de rentas a los vasallos." },
    { id: 67, name: "ERMITA DE SAN JULIÁN", category: "Historia", coords: "41°17'51.6\"N 3°47'00.3\"W", address: "CASTRILLO DE SEPÚLVEDA", note: "Lugar de culto tradicional en un entorno paisajístico privilegiado.", image: "https://lh3.googleusercontent.com/d/1ebjt4Y8QadYQK3Yfnx7QSGee9kk1TT7L", history: "Enclavada en un paraje de extraordinaria paz, la ermita de San Julián ha sido secularmente un faro de devoción para los lugareños. Su sencilla estructura de mampostería acoge una profunda espiritualidad rural. A lo largo de la historia, fue meta de romerías donde se entrelazaban ritos cristianos con antiquísimas costumbres agrarias, buscando la intercesión del santo para obtener años de abundantes lluvias y prosperidad." },
    { id: 68, name: "MOLINO HARINERO", category: "Industrial", coords: "41°21'52.2\"N 3°53'57.7\"W", address: "CARRASCAL DEL RÍO", note: "Ejemplo de la industria molinera fluvial del Duratón.", image: "https://lh3.googleusercontent.com/d/1LdVD8qcco91D7zXALmDyXK-BGl4b6eBt", history: "Construido en las mismas márgenes del emblemático río Duratón, este histórico molino es una obra maestra de ingeniería popular. Durante siglos, sus dueños encauzaron las aguas mediante rudimentarias presas para hacer girar las enormes piedras que molían el grano de toda la comarca. La vida del molinero, a menudo solitaria y dura, era el engranaje fundamental para transformar el cereal castellano en el pan que alimentaba a los campesinos." },
    { id: 69, name: "FÁBRICA DE RESINA", category: "Industrial", coords: "41°14'12.5\"N 3°55'35.4\"W", address: "CABEZUELA", note: "Patrimonio industrial ligado a la explotación de los pinos.", image: "https://lh3.googleusercontent.com/d/12zGLhYL7f6P0DH-ghZypw4T-UbIYw1lm", history: "Monumento vivo al 'oro líquido' de Segovia: la resina. Durante el siglo XIX y gran parte del XX, la extracción y destilación de resina de los infinitos pinares negrales fue el gran motor económico de la región. Esta fábrica industrializaba el proceso, hirviendo y destilando la miera recolectada a mano por los heroicos resineros para obtener colofonia y aguarrás, productos exportados nacional e internacionalmente." },
    { id: 70, name: "MOLINO DE LA CERQUILLA", category: "Industrial", coords: "41°21'48.4\"N 3°49'38.3\"W", address: "BARRIO DE ARRIBA", note: "Ingenio harinero situado en un paraje de gran valor geológico.", image: "https://lh3.googleusercontent.com/d/1n2cZcRTeuiRj4w-iCWD_KbVJfJsgPxXq", history: "Escondido en un tramo espectacularmente encajonado del río, este molino aprovechaba con astucia los desniveles naturales del cauce. Documentado desde la Edad Moderna, su labor incesante fue vital para el suministro de harina en una geografía muy quebrada y difícil. Las piedras de afilar, las compuertas y el azud de madera formaban un complejo sistema donde la fuerza de la naturaleza se domaba al servicio de la subsistencia comunal." },
    { id: 71, name: "DESPOBLADO DE ALDEARRASO", category: "Ruinas", coords: "41°14'06.7\"N 3°48'12.7\"W", address: "SAN PEDRO DE GAÍLLOS", note: "Restos de población en una zona de pastos tradicionales.", image: "https://lh3.googleusercontent.com/d/1K8wtIa_B9tIH1C-7-7V1Ez74y4_nHGuT", history: "Aldearraso es el eco fantasmagórico de un tiempo en que el territorio segoviano estaba salpicado de diminutas aldeas pastoriles. Su propio nombre, que significa 'aldea llana o arrasada', presagiaba su destino. Despoblada probablemente entre los siglos XVI y XVII por pestes y malas cosechas, hoy apenas unos montículos de escombros calizos entre enebros y sabinas nos señalan dónde hubo vida, risas y fuego." },
    { id: 72, name: "ERMITA DE SAN PEDRO", category: "Historia", coords: "41°07'54.4\"N 3°54'39.0\"W", address: "VALDEVACAS Y GUIJAR", note: "Antiguo oratorio rural en un entorno de naturaleza virgen.", image: "https://lh3.googleusercontent.com/d/14R3Yyc3SZI2VZbaPMEGw76EYHdTe3rFn", history: "Humilde y venerable oratorio que sirvió como epicentro espiritual a las comunidades que poblaban los escarpados valles circundantes. Levantada con materiales toscos de la propia zona, esta ermita fue testigo de juramentos, bautizos y rogativas. Es un reflejo fiel de la 'arquitectura pobre' de Segovia, diseñada no para impresionar, sino para resistir la rudeza del clima y cobijar la inmensa fe de pastores y labradores." },
    { id: 73, name: "IGLESIA DE SAN JUSTO Y PASTOR", category: "Historia", coords: "41°05'10.9\"N 3°52'45.0\"W", address: "SANTIUSTE DE PEDRAZA", note: "Parroquia románica destacada por su torre-atalaya.", image: "https://lh3.googleusercontent.com/d/1c0dIR6jzipoKpw3sWqRqpl8mrxDl8smI", history: "Esta fabulosa iglesia, erigida en el siglo XII, domina visualmente el horizonte con su altiva y robusta torre campanario. Esta estructura, casi militar, no solo llamaba a misa, sino que sirvió como inexpugnable atalaya de vigilancia y refugio ante posibles incursiones durante la época de la Reconquista. Es uno de los ejemplos más puros del románico segoviano, guardando entre sus muros el espíritu defensivo y piadoso de los pobladores de la Tierra de Pedraza." },
    { id: 74, name: "ERMITA DE NUESTRA SEÑORA EL ESPINO", category: "Historia", coords: "41°11'32.9\"N 3°50'58.0\"W", address: "REBOLLO", note: "Santuario rodeado de robles y leyendas locales.", history: "Rodeada de frondosos bosques de rebollos y encinas, la ermita de Nuestra Señora del Espino hunde sus raíces en leyendas de apariciones marianas sobre arbustos espinosos, un mito muy recurrente en la geografía castellana para sacralizar antiguos lugares de culto pagano ligados a la naturaleza. Ha sido, y sigue siendo, destino de emotivas romerías donde el fervor religioso se funde con la celebración comunitaria y el folclore más puro." },
    { id: 75, name: "IGLESIA DE SANTA MARÍA", category: "Historia", coords: "41°07'55.0\"N 3°48'45.6\"W", address: "PEDRAZA", note: "Iglesia que preside la famosa plaza mayor de la villa de Pedraza.", image: "https://lh3.googleusercontent.com/d/17OhloPs5OmchYOdBfyeWuyPnutFyi_oD", history: "Con su inconfundible torre románica que preside majestuosamente la célebre y porticada Plaza Mayor de Pedraza, este templo fue el epicentro eclesiástico de la villa medieval. En su interior conviven vestigios del románico original con profundas reformas barrocas y neoclásicas financiadas por las ricas familias ganaderas y pañeras locales. Ha presenciado desde ejecuciones públicas hasta mercados de lana bajo el cobijo de su imponente sombra." },
    { id: 76, name: "IGLESIA DEL ESPÍRITU SANTO", category: "Historia", coords: "41°10'09.1\"N 3°46'56.9\"W", address: "OREJANILLA", note: "Templo característico del románico de porticada segoviano.",image: "https://lh3.googleusercontent.com/d/19zfoS3lLli_qGnakt_INGyz3nN3L-lrV", history: "Una auténtica delicia del arte románico rural (s. XII-XIII). Su mayor tesoro es su elegante galería porticada, concebida arquitectónicamente para proteger a los fieles de las inclemencias del tiempo antes de entrar, y utilizada a menudo como lugar de reuniones para los concejos locales o tribunales abiertos. Sus capiteles esculpidos con motivos rústicos nos hablan del imaginario medieval que impregnaba la vida de estos recónditos pueblos." },
    { id: 77, name: "DESPOBLADO DE la ALAMEDA", category: "Ruinas", coords: "41°10'09.1\"N 3°46'56.9\"W", address: "LA ALAMEDA", note: "Lugar abandonado que evoca el pasado místico de la zona.", image: "https://lh3.googleusercontent.com/d/17EpvO-gA79FIeScl9jqcfkACfq3KV1Ei", history: "El despoblado de La Alameda es una cicatriz en el paisaje de la vertiente segoviana de la sierra. Su abandono progresivo, agudizado por la industrialización de las capitales y el éxodo rural del siglo XX, dejó tras de sí un caserío fantasma. Recorrer sus calles yertas y sus casas con techos hundidos es una profunda lección de historia sobre la agonía del mundo rural tradicional frente al imparable avance de la modernidad urbana." },
    { id: 78, name: "TORREGIL", category: "Historia", coords: "41°04'57.5\"N 3°47'23.0\"W", address: "GALLEGOS", note: "Atalaya defensiva estratégica con amplias vistas de la sierra.", image: "https://lh3.googleusercontent.com/d/1LftSR0G1S5QH6i1_xzs5ucr5cG0A-_nK", history: "Emplazada en un altozano estratégico a los pies del Guadarrama, Torregil es un antiguo bastión de vigilancia cuyo origen se remonta a las repoblaciones de la extrema frontera del Duero (s. XI). Desde su cumbre se controlaban visualmente los pasos de la Cañada Real Soriana Occidental y se emitían señales de humo o espejos para alertar a la capital segoviana de movimientos de tropas o cuatreros. Hoy es un mirador excepcional de pura historia viva." },
    { id: 79, name: "MONASTERIO DE SANTA MARÍA DE LA SIERRA", category: "Ruinas", coords: "41°01'37.1\"N 3°54'46.2\"W", address: "COLLADO HERMOSO", note: "Restos cistercienses integrados en el paisaje montañoso.", image: "https://lh3.googleusercontent.com/d/1YxwyU7e_muR1Y90_8hn2opDNuQoe2gI-", history: "Fundado en 1133 por monjes benedictinos y adscrito luego a la austera Orden del Císter, estas majestuosas e imponentes ruinas góticas emergen de forma casi mágica entre los densos bosques de la sierra. Gozó del favor de reyes como Alfonso VIII, siendo un foco de inmenso poder económico y cultural. Tras la Desamortización de 1835 fue brutalmente expoliado. Sus arcos apuntados, desafiando a la gravedad rodeados de pinos, son el paradigma del romanticismo en Segovia." },
    { id: 80, name: "ESTACIÓN DE TREN", category: "Industrial", coords: "41°04'28.1\"N 4°16'15.8\"W", address: "YANGUAS DE ERESMA", note: "Arquitectura ferroviaria de principios del siglo XX.", image: "https://lh3.googleusercontent.com/d/1pbt2vAQ5Xw4A1Ll11LwnCJL8iSZ00tVZ", history: "Inaugurada en 1884, esta encantadora estación formó parte de la histórica línea de ferrocarril que conectó Segovia con Medina del Campo. Representó el ansiado abrazo de la Revolución Industrial, permitiendo dar salida rápida y barata a las ingentes toneladas de trigo y resina de la comarca. Su clásica arquitectura de ladrillo visto, tejados a dos aguas y marquesinas de hierro es un romántico testimonio del esplendor ferroviario ya desaparecido." },
    { id: 81, name: "ERMITA DE SAN ANDRÉS", category: "Historia", coords: "40°48'54.8\"N 4°26'47.0\"W", address: "VILLACASTÍN", note: "Templo histórico situado en el cruce de caminos reales.", image: "https://lh3.googleusercontent.com/d/1aiUHlGNtfQiA4bIiWvmwQ_8Z8rSdDdw0", history: "Majestuosa iglesia-catedral proyectada por fray Antonio de Villacastín (y atribuida al genio herreriano) a mediados del siglo XVI, coincidiendo con la asombrosa riqueza que la villa amasó gracias al esquileo y a ser nudo crucial de las cañadas mesteñas. Su monumentalidad, con bóvedas de crucería y colosales proporciones, rivalizaba directamente con las catedrales castellanas, demostrando el inabarcable poderío económico y político de los ganaderos de la Mesta." },
    { id: 82, name: "ERMITA DE SANMEDEL", category: "Historia", coords: "41°00'03.8\"N 4°08'27.4\"W", address: "VALSECA", note: "Santuario rural representativo de la devoción agraria.", image: "https://lh3.googleusercontent.com/d/1C3dHCUz1CAZVtNv4OMr-G-IIx1-1nRxZ", history: "Ubicada en pleno 'mar de pinares' y trigales de Valseca, la ermita de San Medel custodia una de las devociones rurales más arraigadas del llano segoviano. El templo románico ha sufrido innumerables modificaciones. Cada mes de mayo, sus prados aledaños son escenario de intensas y coloridas romerías donde el pueblo pide la bendición de los inmensos campos de cereal que han dado sustento y fama a la comarca desde tiempos inmemoriales." },
    { id: 83, name: "CASERÍO DE COVATILLAS", category: "Historia", coords: "41°05'28.2\"N 4°04'17.5\"W", address: "TORREIGLESIAS", note: "Conjunto arquitectónico tradicional de la campiña segoviana.", image: "https://lh3.googleusercontent.com/d/1bKS81RsDwNt1nPmMz6oaWxfGfuOAiMuC", history: "Enclavado en los cortados del río Pirón, este histórico y bellísimo caserío ha sido desde la Edad Media una próspera finca agropecuaria. Contaba con molinos, batanes, hornos e iglesia propia. Fue señorío eclesiástico y propiedad de nobles familias. Pasear hoy por Covatillas, con su entramado de piedra labrada asomado al abismo calcáreo, es retroceder siglos en el tiempo y comprender cómo funcionaba la autarquía de los grandes latifundios segovianos." },
    { id: 84, name: "MOLINO DE CAVILA", category: "Industrial", coords: "40°57'16.0\"N 4°06'48.1\"W", address: "SEGOVIA", note: "Ingenio harinero a las afueras de la capital.", image: "https://lh3.googleusercontent.com/d/1eiUAfj-UgPrSl7h2X7P5rTlPGGVUa-i0", history: "Uno de los ingenios hidráulicos preindustriales más importantes que aprovechaban el impetuoso cauce del río Eresma a su paso por los arrabales de la ciudad amurallada. Durante los siglos XVIII y XIX, la actividad en el Molino de Cavila era febril, transformando el cereal local en harina para abastecer a la voraz capital. Hoy en día es un romántico rincón del cinturón verde segoviano donde el agua y la piedra narran historias de antiguos molineros y arrieros." },
    { id: 85, name: "FÁBRICA DE TEJAS Y LADRILLOS", category: "Industrial", coords: "40°55'17.6\"N 4°07'31.9\"W", address: "SEGOVIA", note: "Muestra de la industria cerámica tradicional segoviana.", image: "https://lh3.googleusercontent.com/d/1Mc9pW1cYD7eVLUrlMgNr7qNXcG_G7XIC", history: "Ubicada estratégicamente en zonas de abundantes arcillas y tierras rojizas, esta antigua fábrica proveyó de tejas árabes y macizos ladrillos a gran parte de la provincia durante el auge de la construcción de finales del XIX y principios del XX. Sus enormes chimeneas humeantes y larguísimos hornos túnel ('tipo Hoffmann') supusieron un brutal salto tecnológico frente a las artesanales tejeras rurales, dejando una profunda e inconfundible huella en el patrimonio industrial." },
    { id: 86, name: "CONVENTO DE SAN AGUSTÍN", category: "Ruinas", coords: "40°57'03.2\"N 4°07'08.2\"W", address: "SEGOVIA", note: "Restos del antiguo convector extramuros de la ciudad.", image: "https://lh3.googleusercontent.com/d/1HmMcKxYYkAYYu19lIpo7ocwkMVzNnwTW", history: "Fundado en la primera mitad del siglo XVI en los arrabales de Segovia, este vasto monasterio agustino fue un potentísimo centro de influencia teológica y educativa. Por desgracia, durante la convulsa Guerra de la Independencia, las tropas francesas lo ocuparon, fortificaron y saquearon sin piedad. La Desamortización de 1835 le dio la estocada final. Sus ruinosos pero nobles muros y pórticos siguen siendo un melancólico símbolo del expolio patrimonial español." },
    { id: 87, name: "PALACIO DE LOS MARQUESES DE CASABLANCA", category: "Historia", coords: "41°11'43.3\"N 4°04'01.4\"W", address: "SAUQUILLO DE CABEZAS", note: "Gran residencia nobiliaria en medio de las tierras de cereal.", image: "https://lh3.googleusercontent.com/d/1LNFWA7YIjy8-K4cw7oFPmj5ZW_6MTkr8", history: "El soberbio Palacio de los Marqueses de Casablanca (o 'Casa Blanca') es un inesperado oasis de poder señorial varado en mitad de la inabarcable y polvorienta llanura cerealista. Construido entre los siglos XVII y XVIII, este enorme latifundio centralizaba la recolección de diezmos, trigos y lanas de los vasallos circundantes. Su monumental heráldica labrada en granito atestigua el orgullo de una nobleza agraria que dominaba férreamente los destinos de la Castilla profunda." },
    { id: 88, name: "RANCHO DE ALFARO", category: "Industrial", coords: "41°00'16.5\"N 3°57'25.1\"W", address: "SANTO DOMINGO DE PIRÓN", note: "Esquileo tradicional y finca ganadera histórica.", image: "https://lh3.googleusercontent.com/d/1lopQOZzR1ZkMsyY09XjxdeXAcinFUkqw", history: "El 'Rancho de Alfaro' es uno de los máximos exponentes de la potentísima industria mesteña que hizo rica a Segovia. Construido en el siglo XVIII, era un gigantesco complejo casi industrial donde, en apenas un mes, cientos de esquiladores profesionales rapaban a miles de ovejas merinas trashumantes. Albergaba lonjas ('bache'), inmensos patios, oratorio propio y viviendas, siendo el latido económico que bombeaba la prestigiosa lana fina hacia los telares de toda Europa." },
    { id: 89, name: "ESQUILEO DE SANTILLANA", category: "Industrial", coords: "40°53'17.2\"N 4°04'04.3\"W", address: "REVENGA", note: "Centro neurálgico de la industria de la industria de la lana en el siglo XVIII.", image: "https://lh3.googleusercontent.com/d/1Ee0njmL4MlvCQoEmNOob7i0Crq3qvIzj", history: "Construido en el fabuloso siglo XVIII por aristócratas ganaderos vinculados al Honrado Concejo de la Mesta, el Esquileo de Santillana es un mastodóntico complejo de sillería al pie de la sierra de Guadarrama. Era una verdadera 'fábrica' preindustrial de procesamiento lanero. Aquí se alojaba a cientos de trabajadores estacionales en un ambiente febril de tijeras, sudores y balidos. Su rotunda portada monumental da fe de la riqueza incalculable que movía el 'oro blanco' castellano." },
    { id: 90, name: "PALACIO DE LOS OSORIO PARADINAS", category: "Historia", coords: "41°00'42.0\"N 4°23'22.7\"W", address: "SANTA MARÍA LA REAL DE NIEVA", note: "Edificación señorial con gran escudo heráldico.", image: "https://lh3.googleusercontent.com/d/1u67w9UuQolSzXSft7Y5ar9eWE334-yqY", history: "Ubicado en la vecina Paradinas, este sobrio palacio blasonado de estilo renacentista (s. XVI) perteneció al ilustre linaje de los Osorio. La familia ejerció un aplastante control sobre extensos territorios en torno al poderoso monasterio dominico de Santa María la Real de Nieva (fundado por la reina Catalina de Lancaster). El palacio, con su inconfundible alfiz sobre la puerta y sillería, impone el respeto debido a la antigua y altiva aristocracia castellana." },
    { id: 91, name: "FÁBRICA DE PASTA DE PAPEL", category: "Industrial", coords: "40°55'58.0\"N 4°04'19.0\"W", address: "PALAZUELOS DE ERESMA", note: "Complejo industrial movido por las aguas del río Eresma.", image: "https://lh3.googleusercontent.com/d/1EnHXy2niQy1tK6H9iYbrXgBtJhb6SQrH", history: "Impresionante vestigio de la potentísima e histórica industria papelera de Segovia. Aprovechando el vigoroso y constante caudal del río Eresma a su salida de la sierra, esta fábrica continuó el legado de los molinos de trapos del siglo XVI que abastecieron de papel a las más prestigiosas imprentas de Castilla. En el siglo XIX y principios del XX, el complejo se modernizó para fabricar pasta de celulosa a nivel industrial, compitiendo hasta que la masiva competencia del norte forzó su melancólico cierre y abandono." },
    { id: 92, name: "ERMITA DE SAN PEDRO DE ACEDOS Y CASERÍO", category: "Ruinas", coords: "40°55'43.9\"N 4°29'30.0\"W", address: "MUÑOPEDRO", note: "Poblado abandonado que conserva la structure eclesial.", image: "https://lh3.googleusercontent.com/d/1KGOi6_mRZjRvq4hi0-28qrpgCiX6GW7E", history: "Estas ruinas eclesiales de inconfundible origen románico-mudéjar son el único esqueleto superviviente de la aldea medieval de San Pedro de Acedos. Sometida a la severa e implacable crisis demográfica del siglo XVII y a las devastadoras plagas de langosta y sequías, la población campesina tuvo que claudicar y buscar refugio en Muñopedro. Hoy, el espectro de su recia torre y los arcos caídos emergen como un sobrecogedor poema de piedra en medio de los infinitos y solitarios campos de cultivo." },
    { id: 93, name: "ESTACIÓN DE TREN", category: "Industrial", coords: "41°05'04.1\"N 4°23'44.2\"W", address: "ORTIGOSA DE PESTAÑO", note: "Antigua parada ferroviaria de la línea Segovia-Medina.", image: "https://lh3.googleusercontent.com/d/1jy9RMkwCpXqfj8MQ0CezilfH8lVxcBdW", history: "Inaugurada con gran júbilo el 1 de junio de 1884, esta encantadora estación formó parte de la mítica línea férrea Segovia-Medina del Campo. Supuso la gran arteria aorta del desarrollo económico local, permitiendo por fin la exportación masiva y barata de trigo, lana y productos resineros hacia los grandes centros industriales. Su clásica arquitectura ferroviaria de ladrillo visto, tejado a dos aguas y marquesinas forjadas languideció hasta el cierre definitivo de la línea de pasajeros en el aciago año 1993." },
    { id: 94, name: "FÁBRICA DE ACHICORIA LA MAESTRA", category: "Industrial", coords: "41°11'13.6\"N 4°26'09.6\"W", address: "NAVAS DE ORO", note: "Emblemática fábrica de la industria resinera.", image: "https://lh3.googleusercontent.com/d/1pewFZOJGGXfCkqShLT9HFxdkNEGBDA_H", history: "Auténtico bastión del ingenio e industria de la posguerra y la autarquía española. Aunque su fama regional provino inicialmente de los derivados del pino y la resina (el 'oro líquido' de Navas de Oro), esta emblemática fábrica diversificó audazmente su producción hacia el tostado y molienda de la raíz de achicoria, el célebre e inevitable sucedáneo del carísimo café durante los durísimos y restrictivos años de la dictadura. Es un testimonio colosal de la supervivencia y adaptación rural del siglo XX." },
    { id: 95, name: "RANCHO DE ESQUILEO Y LAVADERO", category: "Industrial", coords: "40°50'37.7\"N 4°10'25.9\"W", address: "ORTIGOSA DEL MONTE", note: "Importante complejo lanero del patrimonio industrial serrano.", image: "https://lh3.googleusercontent.com/d/1vkaUuqZsa7jwVjZteZFYdSu3pU6IgHfq", history: "Bajo la atenta e inmensa mirada del pico de la 'Mujer Muerta', este rancho preindustrial fue una prodigiosa máquina de generar riqueza para la nobleza mesteña del siglo XVIII. Cada primavera, acogía a ruidosas cuadrillas de centenares de esquiladores. Inmediatamente después, en sus extensas pilas de sillares de granito, se lavaban toneladas de pura lana merina aprovechando las gélidas e impolutas aguas de los arroyos serranos, dejándolas listas y resplandecientes para su exportación marítima a las codiciosas hilaturas de Flandes." },
    { id: 96, name: "ERMITA Y CASERÍO DE BERNUY DE PÁRRACES", category: "Historia", coords: "40°54'56.5\"N 4°23'27.3\"W", address: "MARUGÁN", note: "Santuario y asentamiento tradicional segoviano.", image: "https://lh3.googleusercontent.com/d/1M7rXLT_chf5GFEZUG9FAzig65Y2fpU5f", history: "Un latifundio histórico de primer orden, originado como granja y señorío jurisdiccional de la poderosa y temida Abadía de los Monjes Jerónimos del Monasterio de Santa María del Parral (Segovia). Durante cuatrocientos años, los abades dominaron estas tierras cobrando cuantiosos diezmos. Tras las implacables expropiaciones de la Desamortización de Mendizábal (1836), el caserío con su bella ermita y sus riquísimas dehesas fueron adquiridos por la alta burguesía, transformándose en una próspera finca agroganadera privada." },
    { id: 97, name: "MOLINO DE LA IRVIENZA Y PUENTE DEL NARANJO", category: "Industrial", coords: "40°59'52.4\"N 4°32'17.2\"W", address: "MARTÍN MUÑOZ DE LAS POSADAS", note: "Conjunto hidráulico sobre el río Voltoya.", history: "Este soberbio y enigmático conjunto civil y preindustrial se abraza al tortuoso curso del río Voltoya. El vetusto puente, esencial paso medieval para las insaciables recuas de mulas y carretas que transitaban entre las tierras de Arévalo y la vertiente segoviana de la sierra, servía de antesala a un sólido molino de enormes sillares. El rugir de las aguas canalizadas para golpear los rodeznos y moler el trigo fue, durante siglos, la banda sonora inseparable de este recóndito y fronterizo enclave castellano." },
    { id: 98, name: "VENTA DE LUMBRERAS", category: "Historia", coords: "40°53'30.1\"N 4°19'22.1\"W", address: "LASTRAS DEL POZO", note: "Antiguo parador de viajeros en la vía real.", image: "https://lh3.googleusercontent.com/d/1zAdU0SchqpZsCgsx90rKzd2Wmk8jMdoE", history: "Mítica y monumental construcción que encapsula la pura esencia de los caminos reales españoles antes de la llegada del asfalto y el ferrocarril. Documentada desde el siglo XVII, esta imponente 'Venta' dotada de enormes patios, rústicas alcobas y cuadras, era puerto de salvación para mayorales, pícaros, diligencias, arrieros maragatos y viajeros fatigados. Era el cruce neurálgico donde se pernoctaba y se intercambiaban las más sabrosas (y a menudo dudosas) noticias de todo el inmenso reino de Castilla." },
    { id: 99, name: "ERMITA DE SANTA INÉS", category: "Historia", coords: "41°06'46.5\"N 4°19'26.3\"W", address: "BERNARDOS", note: "Capilla románica rodeada de las famosas canteras de pizarra.", image: "https://lh3.googleusercontent.com/d/14kKobz3f-1LhpckmOcQzeXbzxtkKO3nC", history: "Singular y fascinante ermita románica enclavada en las faldas del mítico Cerro del Castillo. Su existencia está entrelazada con la piedra negra de Bernardos: las mundialmente famosas canteras de pizarra que Felipe II mandó explotar a escala colosal para techar el Monasterio de San Lorenzo de El Escorial y los Palacios Reales de Madrid. Generaciones de rudos canteros y picapedreros han rogado en esta humilde capilla protección frente a los mortales desprendimientos y derrumbes de las oscuras explotaciones." },
    { id: 100, name: "IGLESIA DE NUESTRA SEÑORA DE LA ASUNCIÓN Y DESPOBLADO", category: "Ruinas", coords: "41°07'34.7\"N 4°17'35.6\"W", address: "FUENTES", note: "Restos del nucleus primitivo de población de Fuentes.", image: "https://lh3.googleusercontent.com/d/1L07ZNk3Zoez8JNXJebEalX-9vO2L5eKP", history: "Un paisaje que congela el corazón. La rotunda y esquelética torre renacentista de esta iglesia es todo lo que la historia ha perdonado del despoblado de Fuentes. Como ocurrió con decenas de pequeñas aldeas segovianas a finales de la Edad Moderna, un cóctel letal de continuadas malas cosechas de cereal, brotes epidémicos, una insoportable asfixia fiscal impuesta por la corona y una agricultura de pura subsistencia forzó a sus moradores a abandonar sus hogares de barro para siempre, integrándose en Carbonero." },
    { id: 101, name: "ERMITA DE NUESTRA SEÑORA EL LOSA", category: "Historia", coords: "40°46'20.0\"N 4°15'02.1\"W", address: "EL ESPINAR", note: "Lugar de peregrinación tradicional en la sierra.", image: "https://lh3.googleusercontent.com/d/1OIwxkTCDR0wEf_2iMIuu3ceGKh8JOiyr", history: "Enclavada casi místicamente en las abruptas estribaciones serranas del inmenso término de El Espinar, esta ermita encarna una fervorosísima y antigua devoción mariana. Durante los siglos XVI y XVII, coincidiendo con la insaciable demanda de la corte madrileña, las gigantescas montañas aledañas hervían de gabarreros, hacheros, pastores trashumantes y leñadores, quienes buscaron y encontraron en la Virgen de El Losa su indiscutible refugio, auxilio y esperanza ante los crueles y perpetuos peligros del monte profundo." },
    { id: 102, name: "CASA PALACIO DEL MARQUÉS DE PERALES", category: "Historia", coords: "40°43'12.1\"N 4°14'50.1\"W", address: "EL ESPINAR", note: "Ejemplo destacado de arquitectura civil nobiliaria.", image: "https://lh3.googleusercontent.com/d/1iH8R0IFLeIWvD-602qcIDQV24eAFG5pw", history: "Construida a principios del brillante siglo XVIII, esta soberbia mansión porticada de granito es el paradigma indiscutible del escandaloso poder, ostentación y riqueza incalculable que amasaron los nobles titulados a través del Concejo de la Mesta. El marquesado de Perales, de arraigada lealtad y enorme influencia en las altas esferas de la política borbónica de la Corte de Madrid, erigió este palacio de veraneo y recaudación dominando altivamente la pintoresca arquitectura civil y la plaza de la señorial villa de El Espinar." },
    { id: 103, name: "FÁBRICA DE MADERA", category: "Industrial", coords: "40°44'26.8\"N 4°11'24.1\"W", address: "LA ESTACIÓN DEL ESPINAR", note: "Arquitectura industrial maderera del entorno de la sierra.", image: "https://lh3.googleusercontent.com/d/13F9oPNX3joxwcxzrPXb4tzwIqkQxUFBN", history: "Nacida y auspiciada tras el fundamental trazado de la línea ferroviaria de Villalba a Segovia a mediados del revolucionario siglo XIX. Esta inmensa explotación e instalación forestal mecanizada transformó la tala y la saca de pinos tradicional en una vigorosa industria moderna. Aserró y produjo frenéticamente millones de traviesas de madera para la expansión implacable del propio ferrocarril, así como vigas, puertas y encofrados cruciales para alimentar la insaciable y galopante especulación y construcción del ensanche urbano de Madrid." },
    { id: 104, name: "LA VENTA GRANDE", category: "Historia", coords: "40°44'35.0\"N 4°16'19.7\"W", address: "EL ESPINAR", note: "Histórico establecimiento de hospedaje en el puerto del Guadarrama.", image: "https://lh3.googleusercontent.com/d/11CHiLR9mjRIGeDJBwQUG39SjO0VYwiCM", history: "Un enclave absolutamente legendario y literario. Parada, posta y fonda mítica a escasa distancia del temible y temido paso del Alto del León. Documentada exhaustivamente desde el siglo XVI por eruditos y viajeros ilustrados extranjeros, La Venta Grande ofreció reparo, estufas, caldos calientes y lechos a los suntuosos y colosales cortejos de la realeza que se dirigían, a través de peligrosas ventiscas y nieves, a sus palacios de verano de Riofrío y el Real Sitio de La Granja de San Ildefonso." },
    { id: 105, name: "CASA ARMADA DEL MARQUÉS DEL ARCO", category: "Historia", coords: "41°04'41.0\"N 4°19'05.1\"W", address: "ARMUÑA", note: "Finca señorial con torre de vigilancia histórica.", image: "https://lh3.googleusercontent.com/d/13nJp2Z4RHjK9fB45XlcxQqsufq-oC1T7", history: "Imponente y hermético caserón fortificado abrazado a la fértil y deseada ribera del río Eresma. Erigida entre los siglos XV y XVI y propiedad de la influyente familia aristocrática de los Marqueses del Arco, la casa está flanqueada por una recia e incuestionable torre de vigilancia coronada por sombrías almenas. Constituía el centro de control fiscal y dominio de uno de los mayores y más ricos latifundios terratenientes de la campiña segoviana, dominando las fértiles vegas y pastizales colindantes de Armuña y Añe." },
    { id: 106, name: "IGLESIA DE LA VIRGEN DE AGEJAS", category: "Ruinas", coords: "41°03'19.7\"N 4°05'47.8\"W", address: "CABAÑA DE POLENDOS", note: "Restos de la iglesia del antiguo despoblado de Agejas.", image: "https://lh3.googleusercontent.com/d/1KFUnGHPblt2zLnp3hDuyJeFgPQsBIK7V", history: "Una de las visiones más impactantes y descarnadas del románico rural peninsular (s. XII). La imponente y esbelta portada de esta ruina es el testamento, solitario y exento en medio de un inmenso y amarillo secarral, del primitivo y olvidado núcleo medieval de Agejas. Este pequeño enclave repoblador cristiano sucumbió sin remedio, devorado literalmente por las plagas, el paso avasallador de los siglos y el progresivo y natural agrupamiento demográfico en la vecina Cabañas de Polendos. Hoy es un romántico escenario de película." },
    { id: 107, name: "MOLINO DEL PUENTE", category: "Industrial", coords: "41°08'56.7\"N 4°20'02.1\"W", address: "BERNARDOS", note: "Antiguo ingenio hidráulico para molienda de cereal.", image: "https://lh3.googleusercontent.com/d/1b5-hkFe-2pRcpXBl5FxC2GRpNzsKz8hA", history: "Asentado imperturbablemente a la vera del histórico puente de piedra sobre el cauce constante del río Eresma, este sólido molino harinero estuvo dotado históricamente de tres o cuatro potentes muelas de piedra. Económicamente, formó parte integral de las complejas, intrincadas e influyentes posesiones de los poderosos marquesados locales, sirviendo como engranaje esencial para transformar el copioso cereal recolectado en las vastas y fértiles llanuras de toda la Tierra de Segovia que rodea Bernardos." },
    { id: 108, name: "ERMITA DE SANTA ÁGUEDA", category: "Historia", coords: "41°10'10.4\"N 4°18'14.4\"W", address: "CARBONERO EL MAYOR", note: "Santuario de gran devoción popular en la comarca.",image: "https://lh3.googleusercontent.com/d/1ZnINbiNGcXZxurKnbsBt87289XhiRYoT", history: "Modesta en su arquitectura rural pero colosal en su enorme e inapelable peso sociológico e inmaterial. En todo Carbonero el Mayor y en la Tierra de Pinares, las antiquísimas celebraciones de Santa Águeda (en febrero) ostentan un carácter folclórico y matriarcal único e insustituible. En torno a este santuario pivotan centenarias e irreductibles tradiciones de rebelión controlada, donde las venerables 'Alcaldesas de las Águedas' toman solemnemente el bastón de mando y el control absoluto del municipio con espectaculares manteos y castañuelas." },
    { id: 109, name: "ERMITA DE SAN ISIDRO", category: "Historia", coords: "41°06'26.3\"N 4°22'07.0\"W", address: "DOMINGO GARCÍA", note: "Templo situado cerca de la zona de los grabados rupestres.", history: "Pequeño templo cristiano que posee un significado abismal por su magnético emplazamiento. Está asombrosamente ubicado a los pies del espectacular Cerro de San Isidro, famoso a nivel mundial por su inconmensurable y críptica estación de petroglifos. Estos grabados esgrafiados en la roca al aire libre abarcan desde el asombroso Paleolítico Superior (representando uros y caballos de hace más de 15.000 años) hasta la cruda etapa bajomedieval, evidenciando que este cerro rocoso ha sido un lugar ininterrumpido de pavorosa sacralidad y rito místico para la humanidad." },
    { id: 110, name: "ERMITA DE SAN MIGUEL DE QUINTANAS", category: "Historia", coords: "41°10'43.1\"N 4°15'22.8\"W", address: "CARBONERO EL MAYOR", note: "Vestigio religioso de antiguos asentamientos.",image: "https://lh3.googleusercontent.com/d/1W5p6G8bP9dbJL_BH1HIbE4xRw3uKBYmk", history: "Este hermoso y humilde edificio románico-mudéjar de recio ladrillo cocido y esmerada mampostería es el postrer y solitario rastro del trágico despoblado medieval de Quintanas. Resguardada heroicamente del olvido y de la frenética y voraz concentración parcelaria contemporánea (que arrasó los cimientos del caserío adyacente para meter gigantescos tractores), la ermita sigue custodiando en su interior la imborrable memoria cristiana de aquellas durísimas primeras generaciones de pioneros y aguerridos colonos castellanos que pacificaron el sur del Duero." },
    { id: 111, name: "ESTACIÓN DE TREN", category: "Industrial", coords: "40°59'21.1\"N 4°12'31.0\"W", address: "HONTANARES DE ERESMA", note: "Edificación típica de la red ferroviaria histórica.", image: "https://lh3.googleusercontent.com/d/1lMcYYAjOWE-nBRPwAlw1czyrpTo6smNb", history: "Otra joya de la corona de incalculable valor patrimonial, rescatada de la mítica e histórica línea de ferrocarril Segovia-Medina del Campo (1884). Esta inconfundible y coqueta estación sirvió durante más de un intenso siglo para el vertiginoso transporte mixto de entusiasmados viajeros y el vital tráfico masivo de cereales en sacos y resina. Hoy, reconvertida en un evocador, nostálgico y pintoresco centro cívico cultural gracias al esfuerzo de sus vecinos, conserva con un amor reverencial sus viejas marquesinas, agujas, su depósito de aguas de vapor y el silencioso e inamovible andén." },
    { id: 112, name: "DESPOBLADO DE GUIJASALBAS", category: "Ruinas", coords: "40°49'09.4\"N 4°16'47.8\"W", address: "VALDEPRADOS", note: "Aldea abandonada que conserva el trazado de sus calles y cimientos.", image: "https://lh3.googleusercontent.com/d/1VHOmX3ezEjP804qIesnWHGbcpAWxVZef", history: "Ubicado sobre una imponente y sombría terraza natural que domina el espectacular e indómito desfiladero rocoso del río Moros. La pequeña y ruda aldea de Guijasalbas fue despoblada en unas dramáticas y oscuras circunstancias, provocadas casi con toda certeza por la extremada y legendaria crudeza del clima en este somontano y las letales y continuadas pandemias y pestes del fatídico siglo XVII. En un sobrecogedor y mudo testimonio de su precipitado abandono, aún se adivinan con nitidez, petrificadas en el suelo, la trazada original de sus calles y las duras peñas de sus cimientos." },
    { id: 113, name: "ERMITA DE SANTA JUSTA Y SANTA RUFINA", category: "Historia", coords: "41°09'54.8\"N 3°50'38.7\"W", address: "PAJARES DE PEDRAZA", note: "Pequeña iglesia de piedra en un entorno natural.", image: "https://lh3.googleusercontent.com/d/174YYjhwWqLJy7iUQbJ-uNaNuFcJyiZ3Z", history: "Un precioso e inusual templo de profunda raigambre románica, dedicado sorpresivamente a las santas patronas sevillanas. Los eruditos e historiadores apuntan a que esta particular e inusual advocación hispanovisigoda o mozárabe en la zona, pudo ser importada devotamente hasta estas gélidas tierras serranas por pioneros colonos mozárabes o clérigos repobladores que huían del Al-Ándalus califal. Enclavada en un bellísimo, abrupto y florido entorno a un paso de las recónditas hoces del río Cega, encarna la devoción más entrañable, auténtica y rural del piedemonte." },
    { id: 114, name: "MOLINO ALDEASÁS", category: "Industrial", coords: "41°03'44.1\"N 3°57'15.1\"W", address: "TURÉGANO", note: "Maquinaria hidráulica tradicional de la zona de Turégano.", image: "https://lh3.googleusercontent.com/d/18__ASs3ubvjgxXuJNY8r8hGCzGpikTVZ", history: "Situado bajo los sotos y en los dominios del modesto pero perenne y traicionero curso del río Pirón. El Molino de Aldeasás constituyó un enclave vital y de enorme conflictividad legal, ya que muchos campesinos locales, teóricamente y férreamente dependientes de la implacable, omnipotente y voraz mitra eclesiástica de Segovia (señora feudal de la importante y amurallada villa de Turégano y su castillo), llevaban furtiva y desesperadamente allí sus abultados granos a moler, buscando a toda costa eludir astutamente los asfixiantes e indignantes tributos feudales y las prohibitivas maquilas obispales." },
    { id: 115, name: "MOLINO DE CALDILLAS", category: "Industrial", coords: "41°05'23.1\"N 4°17'21.9\"W", address: "ARMUÑA", note: "Molino harinero situado en la ribera del río Eresma.", image: "https://lh3.googleusercontent.com/d/1cIC_uXm9alrPNsSDCtjGCEN17xKkPmWY", history: "Magnífico y asombroso testimonio en pie de la avanzada e ingeniosa tecnología preindustrial del pleno y glorioso Renacimiento y la floreciente Edad Moderna. Una colosal, laberíntica y faraónica red de intrincadas compuertas, tajamares y una larguísima canalización del agua domaban y encauzaban con maestría el enorme y peligroso caudal salvaje del río Eresma para nutrir y alimentar a toda potencia el vigoroso y ruidoso motor de este gigantesco centro agroindustrial rural, sosteniendo así las opulentas arcas y los vastos graneros de las encumbradas familias patricias locales de Armuña." },
    { id: 116, name: "FÁBRICA DE MANTAS LA CONSTANZA", category: "Industrial", coords: "41°08'01.7\"N 4°20'57.9\"W", address: "BERNARDOS", note: "Referente del patrimonio industrial textil de Segovia.", image: "https://lh3.googleusercontent.com/d/1VdlhsqOsY-SVxZHXOkvbjcpZw1BuBR48", history: "Testigo directo, insobornable y majestuoso de los épicos y heroicos y desesperados esfuerzos del arriesgado e incipiente empresariado local segoviano del vertiginoso siglo XIX. Ante la fulminante y arrolladora decadencia irremediable de los tradicionales e ineficaces y ruidosos batanes fluviales, esta colosal y moderna fábrica intentó valientemente, a base de importadas máquinas de vapor, grandes chimeneas y febriles husos mecanizados, competir y resurgir industrialmente frente a las colosales potencias textiles y pañeras emergentes e imbatibles de Béjar, Alcoy o la todopoderosa industria lanera de Cataluña." },
    { id: 117, name: "MOLINO BERROCAL", category: "Industrial", coords: "41°04'17.5\"N 3°58'20.1\"W", address: "TURÉGANO", note: "Construcción fabril rodeada de leyendas de molineros.", history: "Este pintoresco, bucólico y sombrío molino, medio engullido y devorado literalmente por los recios fresnos, el hiedra y los musgos milenarios que abrazan amorosamente el curso del viejo río, es otro enclave crucial y fascinante del amplísimo e insondable patrimonio preindustrial de las fértiles riberas. Un oscuro rincón fuertemente sumido, como en los mejores cuentos, en ancestrales y tétricas leyendas orales que hablaban susurrando a los niños sobre la existencia de duendes acuáticos robando sacos o sobre los famosos, temibles y legendariamente desconfiados y presuntamente usureros molineros que engañaban con falsas pesas castellanas." },
    { id: 118, name: "FÁBRICAS DE HARINAS Y DE LUZ", category: "Industrial", coords: "41°10'09.1\"N 3°46'56.9\"W", address: "CARBONERO EL MAYOR", note: "Instalaciones que proveyeron de luz y harina a la villa.", image: "https://lh3.googleusercontent.com/d/1hT2JtEn9GVkz9l5ht9r8XtjNCc-z5Qoo", history: "Estas vetustas, mágicas e imponentes instalaciones simbolizan y encarnan a la perfección uno de los mayores, más espectaculares y sorprendentes saltos y milagros tecnológicos experimentados por la Segovia más profunda e incomunicada en las prometedoras y electrizantes postrimerías del avanzado siglo XIX: 'El milagroso salto de la rústica harina a la fascinante luz'. Con una astucia sin igual, acoplando vertiginosas, ruidosas e importadas y carísimas turbinas hidráulicas de fundición a los antiguos y obsoletos ejes trituradores de molienda triguera, los visionarios industriales generaron y llevaron en rudimentarios cables la primera y milagrosa luz eléctrica a las incrédulas, maravilladas y boquiabiertas calles de la próspera villa de Carbonero." },
    { id: 119, name: "EL MOLINO DE LA VILLA", category: "Industrial", coords: "40°44'54.4\"N 4°13'44.9\"W", address: "EL ESPINAR", note: "Molino histórico de titularidad municipal.", image: "https://lh3.googleusercontent.com/d/1X41tPEUdNZ__wRiVVqLMYAIUFU2e-YI3", history: "A enorme y contrastada diferencia de la gran y abrumadora mayoría de instalaciones y fábricas harineras y preindustriales castellanas que pertenecían y enriquecían las insaciables arcas de monasterios, abadías o duques avariciosos, esta sólida construcción e instalación hidráulica serrana, de excelente factura de cantería granítica y bien cuidada, era de rigurosa y celosa titularidad, gestión y propiedad cien por cien del orgulloso Ayuntamiento y 'Concejo' municipal de El Espinar. Garantizar y controlar esto, de manera autónoma e independiente, permitía y facultaba maravillosamente al honrado concejo para asegurar a precios bajos y tasados la vital e indispensable producción del pan para sus numerosos, humildes y trabajadores habitantes madereros, así como recaudar jugosísimas rentas en especie, evitando los temidos, abusivos y asfixiantes e infames monopolios eclesiásticos y de los engreídos marqueses." },
    { id: 120, name: "MOLINO DE LOS FRAILES", category: "Industrial", coords: "41°06'21.4\"N 4°08'46.0\"W", address: "ESCOBAR DE POLENDOS", note: "Antiguo molino propiedad de estamentos religiosos.", image: "https://lh3.googleusercontent.com/d/1ftRj-0-XjrZ-Vk1qbPXR1YKaV_d8lyi6", history: "El inconfundible y explícito nombre de este vetusto y sombrío molino, de fuertes paredes de tosca mampostería, revela e indica prístinamente y con claridad meridiana su antigua, poderosa y feudal propiedad monástica histórica. Es muy plausible y probable que en su momento de máximo y abrumador esplendor dependiera feudalmente, tributara religiosamente y enriqueciera abundantemente las arcas del fastuoso e influyente convento jerónimo o dominico de la cercanísima y opulenta ciudad de Segovia. Representa e ilustra a la perfección y como ningún otro, un clásico y dominante patrón económico y político feudal inquebrantable, donde, durante toda la Edad Media y la Edad Moderna, un reducido puñado de ricos e intocables monjes orantes poseían, dirigían y monopolizaban de facto todos y cada uno de los medios de producción agroalimentarios más importantes y estratégicos y vitales para la población del riquísimo, fértil y verde valle del río Polendos." },
    { id: 121, name: "ERMITA DE SAN MIGUEL", category: "Historia", coords: "40°53'47.3\"N 4°12'45.2\"W", address: "FUENTEMILANOS", note: "Lugar místico de oración en el llano segoviano.", image: "https://lh3.googleusercontent.com/d/1OLdr5WzoEar8D83RYY1mzX-gozlj5HLT", history: "Erigida en la vasta e inabarcable llanura cerealista de Fuentemilanos, esta antiquísima ermita dedicada al arcángel guerrero es un fiel y pétreo reflejo de la dura repoblación militar y religiosa de las tierras al sur del Duero (s. XI). Sus pesados y toscos muros de mampostería y argamasa han acogido de forma ininterrumpida durante centurias las fervorosas y desesperadas preces de los humildes labradores y pastores locales, quienes acudían a San Miguel Arcángel para conjurar apocalípticas tormentas estivales, pedriscos letales y las bíblicas plagas de langosta que periódicamente asolaban la economía de subsistencia de la Castilla profunda." },
    { id: 122, name: "MOLINO", category: "Industrial", coords: "41°00'36.7\"N 4°28'33.0\"W", address: "HOYUELOS", note: "Importante muestra de ingeniería hidráulica rural.", image: "https://lh3.googleusercontent.com/d/1lF4dAtkMgsspQxn5rULP5C2fFDT00VPL", history: "Este rotundo y hermético ingenio hidráulico es un magnífico vestigio de la tenaz, incesante y heroica lucha campesina por domar las irregulares e imprevisibles corrientes de los arroyos castellanos. Propiedad de opulentos linajes locales y élites agrarias durante la floreciente Edad Moderna, el solitario molino de Hoyuelos monopolizaba férreamente la vital molienda del trigo en todo el entorno. Durante los asfixiantes meses de estío, tras la siega, sus inmediaciones se convertían en un bullicioso, tenso y polvoriento hervidero de arrieros, recuas de mulas y pesados costales aguardando pacientemente su turno para moler." },
    { id: 123, name: "ERMITA DE SANTA ELENA", category: "Historia", coords: "40°48'43.6\"N 4°21'50.4\"W", address: "ITUERO Y LAMA", note: "Santuario románico con excelentes vistas a la sierra.", image: "https://lh3.googleusercontent.com/d/1toIBvL_H6jIDCoxzwUGeUSLeq8ePKuOD", history: "Impresionantemente erigida sobre un altozano calizo que domina visualmente de forma estratégica y absoluta las lejanas y nevadas cumbres de la sierra de Guadarrama y las principales vías de paso ganadero. Esta rústica ermita, de indudable traza y resonancias románico-mudéjares, fue un auténtico y vital faro espiritual y físico para los incontables pastores trashumantes del Honrado Concejo de la Mesta. Las hermosas y melancólicas leyendas locales narran que, durante siglos, el incesante y salvador tañer de su pequeña campana sirvió para orientar y rescatar a los viajeros perdidos en las implacables y mortales ventiscas invernales del somontano." },
    { id: 124, name: "CASERÍO EL SALVADOR", category: "Ruinas", coords: "40°57'16.9\"N 4°31'45.1\"W", address: "JEMENUÑO", note: "Antigua finca ganadera de gran extensión.", image: "https://lh3.googleusercontent.com/d/15aM8WBxLXKJ3mzAVmHedYNc3TqeXbo3D", history: "Inmenso, laberíntico y rotundo latifundio que ejemplifica a la perfección la colosal y polémica concentración de la propiedad de la tierra tras las brutales Desamortizaciones civiles y eclesiásticas del siglo XIX en España. Este gigantesco complejo agroganadero, dotado de enormes patios empedrados, interminables paneras para almacenar cereal, palomares, hornos y abrigados corrales, funcionaba a todos a los efectos como un ecosistema autónomo y feudal. Daba extenuante empleo a decenas de paupérrimos jornaleros y braceros estacionales, perpetuando el férreo modelo de granja señorial terrateniente hasta bien entrado y avanzado el siglo XX." },
    { id: 125, name: "ERMITA DE LA VIRGEN DE CEPONES", category: "Historia", coords: "40°50'25.1\"N 4°08'47.9\"W", address: "LA LOSA", note: "Lugar de culto situado en las faldas de la sierra.", image: "https://lh3.googleusercontent.com/d/1WA-wSfrXp8lC8Lerb3pIOxiihPgo4NFN", history: "Bucólicamente enclavada en las frescas, umbrías y boscosas faldas del imponente pico montañoso de la Mujer Muerta. Esta histórica ermita mariana ha sido venerada, respetada y sostenida durante siglos casi en exclusiva por las durísimas cofradías de intrépidos gabarreros (leñadores) y canteros locales. Su popular y bulliciosa festividad anual convocaba a todas las curtidas gentes de la sierra en emotivas y coloridas romerías, donde el más estricto fervor religioso cristiano se mezclaba de forma inseparable con antiquísimos ritos paganos de celebración, danza y festejo del renacer primaveral de los pinares y robledales." },
    { id: 126, name: "CASERÍO DE REDONDA EL NUEVO", category: "Historia", coords: "40°55'41.6\"N 4°21'54.1\"W", address: "MARAZOLEJA", note: "Finca de labranza tradicional con arquitectura típica de ladrillo.", image: "https://lh3.googleusercontent.com/d/1YRqeULAuVe5KXR-UKxtgNUGEdqxhsX1q", history: "Una grandiosa, austera e imponente granja señorial erigida en la plenitud de la Edad Moderna. Fue construida con los materiales nobles y característicos de la maestría del mudéjar campesino y utilitario: formidables y gruesos paños de arcilloso ladrillo macizo, sillarejos en las esquinas y extensos lienzos de tapial apisonado. Históricamente, este caserío operó como una potentísima, eficaz y lucrativa unidad de producción agrícola, amasando e ingiriendo ingentes diezmos, primicias y rentas en trigo y cebada destinados al poderoso y gordo clero catedralicio segoviano o a la ausente y refinada nobleza latifundista asentada en la capital del reino." },
    { id: 127, name: "ERMITA DE NUESTRA SEÑORA EL ESPINO", category: "Historia", coords: "40°58'07.9\"N 4°33'23.5\"W", address: "MARTÍN MUÑOZ DE LAS POSADAS", note: "Santuario de gran tradición mística y literaria.", image: "https://lh3.googleusercontent.com/d/1Cx3TrFq9ZGtZpX6QZ5gyeaatvoHwMXbe", history: "Majestuoso santuario renacentista profundamente ligado al mecenazgo y a la colosal figura del todopoderoso e implacable Cardenal Diego de Espinosa, eclesiástico inquisidor y mano derecha del mismísimo rey Felipe II. Cuenta la arraigada y piadosa tradición inmemorial que en este bellísimo paraje se apareció resplandeciente la Virgen María suspendida sobre un frondoso y florido arbusto espinoso (un mito celtíbero cristianizado). Gracias a su influencia real, se convirtió fulgurantemente en un epicentro de masiva peregrinación, enriquecido con bulas papales y milagros celosamente documentados y avalados por la alta jerarquía eclesiástica del fabuloso siglo XVI." },
    { id: 128, name: "TEJARES", category: "Industrial", coords: "41°03'08.5\"N 4°27'59.0\"W", address: "MELQUE DE CERCOS", note: "Instalaciones artesanales para la fabricación de tejas.", image: "https://lh3.googleusercontent.com/d/16ue4pA-YZ5NdwCUpMSmLdPVYy7veeE9b", history: "Fascinantes, ahumados y melancólicos restos calcinados de la antiquísima e intensa industria de barro cocido que, durante generaciones, abasteció de las inconfundibles, rústicas e impermeables tejas árabes (la tradicional 'teja vana') a casi toda la llanura pinariega de la comarca. Estos rudimentarios y enormes hornos morunos de leña, semienterrados y hoy asfixiados trágicamente por la maleza y el olvido, fueron operados infatigablemente durante siglos por sacrificados maestros tejeros que amasaban, moldeaban sobre sus muslos y cocían la arcilla rojiza local con el sudor de toda su extensa familia." },
    { id: 129, name: "TELÉGRAFO ÓPTICO", category: "Industrial", coords: "40°44'34.0\"N 4°18'01.0\"W", address: "NAVAS DE SAN ANTONIO", note: "Torre vigía de la antigua red de comunicaciones.", image: "https://lh3.googleusercontent.com/d/11u0Lfdb3L22kdLg5rh3gOhh7ep_ealqt", history: "Esqueléticas, formidables y desoladas ruinas de una torre fuertemente fortificada y almenada perteneciente a la vital e innovadora 'Línea de Castilla' de telégrafos ópticos (inaugurada en 1846). Diseñada con precisión militar por el célebre ingeniero José María Mathé, esta carísima red de espionaje y rapidísima communication estatal permitía a la corte de la reina Isabel II enviar órdenes cifradas secretas desde Madrid hasta Irún en escasas horas. Sus rudos y solitarios 'torreros' vivían penosamente aislados, oteando incesantemente el horizonte con pesados catalejos entre el gélido frío serrano y la constante amenaza de ataques guerrilleros de las facciones carlistas." },
    { id: 130, name: "DESPOBLADO DE HERREROS", category: "Ruinas", coords: "40°48'25.4\"N 4°13'51.4\"W", address: "OTERO DE HERREROS", note: "Restos de población de tradición metalúrgica.", image: "https://lh3.googleusercontent.com/d/1Ds1eF3cZgglwSjXUhtRruERYN_7JYTmU", history: "El dramático y silencioso espectro arquitectónico de un antiquísimo y legendario asentamiento de pura tradición minera y febril metalurgia, cuyos recónditos orígenes históricos se remontan, sin asomo de duda, a las intensísimas y esclavas explotaciones de cobre, plomo y plata del mismísimo y voraz Imperio Romano. Los inmensos y tóxicos escoriales de ceniza negra muy cercanos al caserío atestiguan y confirman el incesante fuego de más de dos milenios de fundiciones rústicas. Definitivamente abandonado y despoblado en la Edad Moderna, hoy la inerte tierra cobriza y los ciclópeos muros derruidos relatan la áspera y tóxica vida de los antiguos forjadores segovianos." },
    { id: 131, name: "MOLINO DE GAMONES", category: "Industrial", coords: "40°55'39.2\"N 4°01'40.4\"W", address: "PALAZUELOS DE ERESMA", note: "Molino que aprovechaba la fuerza del río Eresma.", image: "https://lh3.googleusercontent.com/d/1qBHpcjkxhW7COik2i45KbjY5FAQvFwnH", history: "Una de las más robustas, célebres y potentes fábricas harineras preindustriales impulsadas por las siempre bravas, indómitas y frías aguas del naciente y joven río Eresma. Formó parte integral y esencial del denso, rico y envidiado cinturón industrial periférico de la ciudad de Segovia. Su misión era aprovechar al límite la formidable energía hidráulica del deshielo de la sierra para abastecer la insaciable, creciente y populosa demanda de pan de calidad de la corte itinerante y la capital. Sus gruesas piedras de molienda de granito y sus pesados ejes de hierro resistieron heroicamente riadas memorables a lo largo del turbulento siglo XIX." },
    { id: 132, name: "VENTA DE LOBONES", category: "Historia", coords: "40°57'59.7\"N 4°12'17.1\"W", address: "VALVERDE DEL MAJANO", note: "Histórico alto en el camino del río Eresma.", image: "https://lh3.googleusercontent.com/d/1G0TnraPppiwawiFYAxo2sZwPCfwuFlBZ", history: "Legendaria, histórica y bulliciosa parada de rudimentarias postas, carruajes nobles, pesadas diligencias y endurecidos arrieros maragatos. Estaba ubicada de forma muy estratégica e inteligente en las congestionadas encrucijadas de las principales y multimillonarias cañadas ganaderas y caminos reales. La monumental Venta de Lobones ofreció sin descanso, durante los siglos XVIII y XIX, calor y refugio seguro de asaltantes, abundante paja de cebada para las exhaustas caballerías, camas de chinches y vino oscuro para los comerciantes; siendo escenario recurrente y literario de sospechosos tratos, sangrientas emboscadas, amoríos furtivos y el fluir incesante de la variopinta vida castellana de la época." },
    { id: 133, name: "CASA DEL TÍO GITANO", category: "Naturaleza", coords: "41°11'24.0\"N 4°12'28.6\"W", address: "PINAR NEGRILLO", note: "Lugar singular envuelto en mitos y leyendas locales.", image: "https://lh3.googleusercontent.com/d/1DkPHLPoa2gpRJI4Kbikmy45kxiChhrHO", history: "Un rincón verdaderamente bucólico, asombrosamente pintoresco y profundamente misterioso, que yace escondido y casi ahogado en las oscuras entrañas de los inmensos, laberínticos y silenciosos pinares resineros de Segovia. El frondoso folclore local y la vívida memoria oral de los mayores han tejido y exagerado a su alrededor decenas de fascinantes, tétricas y novelescas leyendas. Se habla en susurros de antiguos y huraños ermitaños, forasteros nómadas o extraños curanderos (de ahí su apelativo) que vivían al margen de las leyes de los hombres, conociendo y dominando los secretos arcanos, curativos y alucinógenos de la miera, la resina y las recónditas hierbas curativas del monte espeso." },
    { id: 134, name: "ESQUILEO DE BURGOS Y PUENTE", category: "Industrial", coords: "40°52'12.8\"N 4°06'20.1\"W", address: "REVENGA", note: "Importante infraestructura de la Mesta.", image: "https://lh3.googleusercontent.com/d/1SqQcSSoTL2Emm0egx7Z5DR7yR-s1nw4j", history: "Ciclópeo, soberbio y despampanante centro logístico y de vertiginosas operaciones de las gigantescas e inabarcables cabañas de dóciles ovejas merinas pertenecientes a los riquísimos y Grandes de España del Concejo de la Mesta. En sus vastísimas naves ('baches') y calurosos patios adoquinados con colosales losas de granito, se inmovilizaba y rapaba a miles de reses trashumantes al unísono. Esta actividad frenética generaba en primavera una estruendosa, polvorienta y febril explosión económica y humana estacional que nutrió y exportó la más cara y exquisita lana fina, de incontestable calidad mundial, hacia los ávidos y todopoderosos telares reales de toda Europa." },
    { id: 135, name: "CASA DE LOS BUITRAGO", category: "Historia", coords: "40°56'39.0\"N 4°06'55.6\"W", address: "SEGOVIA", note: "Palacio urbano de gran relevancia histórica.", image: "https://lh3.googleusercontent.com/d/1vIuF7rbr0q91bhRtHR5jrBUkWsDk6ZNQ", history: "Solemne, altivo y bellísimo palacio fortificado de rancio carácter urbano perteneciente al antiquísimo, belicoso y enormemente poderoso linaje noble de la familia de los Buitrago (ilustres Caballeros de Segovia), cuyas sangrientas y heroicas raíces se hunden profundamente en las feroces crónicas de la reconquista y repoblación de la ciudad en el lejano siglo XI. Sus recios y despóticos blasones heráldicos labrados con primor, sus frescos patios columnados típicamente renacentistas y su austera pero amenazante fachada son el puro y nítido eco pétreo del férreo poder aristocrático que, durante siglos, dictaba sin piedad las leyes, imponía las aduanas y gobernaba con mano de hierro los destinos absolutos del vasto Concejo segoviano." },
    { id: 136, name: "CASERÍO DEL TERMINILLO", category: "Historia", coords: "40°57'39.5\"N 4°06'29.6\"W", address: "SEGOVIA", note: "Complejo rural típico de las cercanías de la ciudad.", image: "https://lh3.googleusercontent.com/d/1NtiB9p3fwjpGPHa0MzVgbnvF4FuK6Gw4", history: "Antigua, monumental y extensísima posesión agraria fortificada (una alquería) estratégicamente situada en la rica llanura extramuros de la capital del Acueducto. Históricamente vinculada a las opulentas, intocables y libres de impuestos rentas de altos estamentos eclesiásticos locales y ricos aristócratas absentistas que residían en Madrid. Este colosal caserío dirigía y organizaba la explotación agraria, intensiva e implacable, de los fertilísimos campos trigueros colindantes a la depresión del río Clamores, empleando para ello a un verdadero ejército de míseros jornaleros estacionales y guardando celosamente la fabulosa cosecha, año tras año, en monumentales e inexpugnables paneras y soberbios silos de sillería." },
    { id: 137, name: "PUENTE DEL TESORO", category: "Naturaleza", coords: "40°55'45.0\"N 4°10'54.9\"W", address: "TORREDONDO", note: "Puente envuelto en leyendas de ocultamientos históricos.", image: "https://lh3.googleusercontent.com/d/1DbN2pXwitOz3fpluHD23W7cg08kTOnV-", history: "Viejo, estrecho, evocador y recio paso de piedra ojival, tendido acrobáticamente sobre la profunda y angosta garganta horadada pacientemente por el río a lo largo de milenios. Su pintoresca figura ha estado permanentemente asediada y magnificada por oscuras y misteriosísimas leyendas. La persistente y ensoñadora tradición oral campesina asegura fervientemente que en lo más profundo de sus ciclópeos cimientos, o bajo sus arcos húmedos, se sepultó apresuradamente un fabuloso y pesado tesoro de oro y joyas eclesiásticas durante la sangrienta y desesperada invasión napoleónica de 1808 (o quizás en las sombrías Guerras Carlistas), atrayendo infructuosamente, hasta hoy, a codiciosos buscadores furtivos y encendiendo sin remedio la imaginación poética de románticos, pastores y gentes del lugar." },
    { id: 138, name: "ESQUILEO DEL PAULAR", category: "Industrial", coords: "40°57'54.3\"N 4°02'15.6\"W", address: "TRESCASAS", note: "Uno de los complejos de esquileo más grandes de la sierra.", image: "https://lh3.googleusercontent.com/d/1gKqTdwLJWGPW4UxSSDv7R6BjqYuxM5n6", history: "Una de las auténticas, mayúsculas y más gloriosas 'catedrales de la lana' de la sierra segoviana y de toda la península ibérica. Edificado con proporciones vaticanas y propiedad original de los inmensamente ricos, austeros pero astutamente capitalistas monjes cartujos del Monasterio de El Paular (al otro lado de las cumbres). Este descomunal complejo preindustrial de finísima sillería albergaba, organizaba y alimentaba a una jerarquía militarizada de trabajadores: cientos de veloces esquiladores ('tijederos'), recibidores, maestros pesadores, velloneros y empaquetadores. Era, sin lugar a dudas, la piedra angular insustituible de la macroeconomía española de los siglos XVII y XVIII, registrando de forma asombrosa cómo un solo rebaño monacal operando aquí superaba anualmente la delirante cifra de las treinta mil cabezas de ovejas puras merinas." },
    { id: 139, name: "MOLINO DE LOBONES", category: "Industrial", coords: "40°58'12.5\"N 4°12'00.5\"W", address: "VALVERDE DEL MAJANO", note: "Molino situado cerca de la emblemática Quinta de Lobones.", image: "https://lh3.googleusercontent.com/d/1HrFwM3y8tIjsmT8klGrqq7UO9InkbGq5", history: "Espléndido, armónico y bellísimo ingenio harinero de la ribera, íntima y legalmente vinculado a la historia y fortuna de la opulenta, afrancesada y majestuosa finca de recreo de la Quinta de Lobones. Su audaz, larga y profunda acequia medieval, tallada heroicamente a mano directamente en la propia roca caliza, desviaba con fuerza titánica gran parte del impetuoso cauce principal del río Eresma para precipitarlo violentamente y hacer bramar ensordecedoramente las precisas y finas muelas de piedra, muchas de ellas talladas e importadas directamente de afamadas canteras de Francia (las célebres 'piedras francesas'). Fue un absoluto prodigio deslumbrante de la ingeniería civil renacentista, puesto al servicio y capricho de las ilustradas, refinadas e inmensamente ricas élites agrarias cortesanas de la época." },
    { id: 140, name: "VENTA DE LOBONES", category: "Historia", coords: "40°57'59.7\"N 4°12'17.1\"W", address: "VALVERDE DEL MAJANO", note: "Histórico alto en el camino del río Eresma.", image: "https://lh3.googleusercontent.com/d/1G0TnraPppiwawiFYAxo2sZwPCfwuFlBZ", history: "Estructura histórica y genuina posada rural complementaria del gran y noble complejo terrateniente de Lobones. Ubicada en un paso de ineludible peaje, funcionaba de facto como una estricta aduana informal, abrevadero y un temido puesto de recaudación ('portazgo') en el intensísimo, rentable y bullicioso tráfico de todo tipo de mercancías (lana, vino, trigo, paños) entre la rica ciudad amurallada de Segovia y la fundamental ruta norteña hacia las ferias de Valladolid o Medina del Campo. Sus recios portones de madera de roble, tachonados en forja, y sus amplias corralizas cerradas protegieron heroicamente, noche tras noche durante centurias, a incontables e incautos mercaderes, clérigos y densos rebaños frente a las mortales acechanzas y asaltos de los crueles bandoleros de caminos y los hambrientos, audaces y enormes lobos ibéricos de los espesos sotos fluviales." },
    { id: 141, name: "HORNOS DE CAL DEL ZANCAO", category: "Industrial", coords: "40°47'22.4\"N 4°16'40.0\"W", address: "VEGAS DE MATUTE", note: "Instalaciones para la producción artesanal de cal.", image: "https://lh3.googleusercontent.com/d/1KA3cP8XZHou-Wwi67XJOVehDnhUJ6nGV", history: "Extraordinario, espectacular e impresionante complejo preindustrial y casi lunar de antiquísimos hornos de calcinación (las afamadas 'caleras'), cuyos rudimentarios orígenes se hunden probablemente en la Baja Edad Media. Estas enormes, vertiginosas y aterradoras oquedades cilíndricas, forradas expertamente de piedra resistente al fuego, calcinaban ininterrumpidamente las rocas calizas locales a altísimas e infernales temperaturas, siendo alimentadas de forma suicida día y noche con inmensos e insaciables haces de leña y monte bajo. La finísima y blanca cal pura, producida artesanalmente aquí con un sudor agotador, enlució y blanqueó las hermosas fachadas de los palacios madrileños, desinfectó con urgencia las calles de terribles y apocalípticas epidemias de peste y cimentó de forma indisoluble las más colosales, admiradas y gigantescas obras civiles y arquitectónicas de todo el Renacimiento en la Meseta Central española." },
    { id: 142, name: "DESPOBLADO DE NAVALAVIGA", category: "Ruinas", coords: "40°41'20.7\"N 4°24'29.5\"W", address: "VILLACASTÍN", note: "Punto de paso clave en las cañadas reales de la Mesta.", image: "https://lh3.googleusercontent.com/d/1Jo-d_dn2fAKabykUHn-xg_R_beSmemAP", history: "Evocadora, silenciosa, fantasmagórica y crudamente romántica aldea arruinada, situada antaño en un punto logístico, topográfico y fiscal absolutamente clave del inabarcable entramado y laberinto de las Cañadas Reales mesteñas (las autopistas de ovejas de la corona). Al igual que aconteció con otros muchísimos poblados y aldeas satélites dependientes política y económicamente de la entonces archipoderosa, acaudalada e influyente villa noble de Villacastín; este lugar sucumbió lenta y dolorosamente. Se asfixió cuando el abrupto, traumático e irreversible hundimiento del monopolio mundial de la exclusiva lana merina española asestó el letal golpe de gracia a la macroeconomía provincial en el trágico y convulso siglo XIX, dejando sus humildes muros de berroqueño a total merced del cortante viento serrano y engullidos lentamente por la zarza y el implacable paso de las estaciones." },
    { id: 143, name: "LAS FALSAS", category: "Industrial", coords: "40°46'32.1\"N 4°24'32.3\"W", address: "VILLACASTÍN", note: "Infraestructura lanera fundamental para la comarca.", image: "https://lh3.googleusercontent.com/d/1IKcIfEjdjs0Gff5Z339ePganprS6s1L9", history: "Misteriosas, herméticas, sombrías y colosales infraestructuras civiles de pura y gruesa sillería de piedra granítica. Fueron concebidas y erigidas originalmente con ostentoso derroche de capital como enormes lavaderos, sudaderos ('baches') de calor, clasificadores y blindados almacenes de seguridad para el exigente y lucrativo tratamiento industrial masivo del carísimo vellón de la apreciada lana segoviana (casi tan valiosa como el oro en las pujantes bolsas europeas de comercio). El hundimiento internacional del imperio de la Mesta condenó implacablemente a estos soberbios y caros edificios al más absoluto, ingrato y rotundo de los silencios. Sus imponentes arquerías, sólidas vigas y pesadas e inamovibles losas de suelo encierran hoy un melancólico y mudo eco de los luminosos y soberbios días dorados en que la espléndida villa de Villacastín deslumbraba y actuaba dictatorialmente como uno de los mercados financieros e industriales laneros más ricos, envidiados, boyantes e influyentes de todo el planeta." },
    { id: 144, name: "CASA DEL ZORRO KLIM", category: "Historia", coords: "40°57'14.4\"N 4°10'45.2\"W", address: "ZAMARRAMALA", note: "Lugar ligado a personajes históricos del siglo XX.", image: "https://lh3.googleusercontent.com/d/1Epvuoirgfu8J9tMult2hFzpt38DYmdU0", history: "Finca de descanso verdaderamente singular, coqueta y pintoresca, cuyo curioso, excéntrico y literario apelativo contemporáneo ha alimentado incansablemente las más variopintas y sabrosas tertulias, mitos y chascarrillos en las tabernas locales durante gran parte del bullicioso siglo XX. Intimamente ligada a refugios de artistas, coloridos personajes bohemios, forasteros adinerados de la capital madrileña o intelectuales ilustrados que buscaban ansiosamente un romántico y apacible retiro de desconexión en el inmenso y amarillo llano segoviano. Esta peculiar casa, dotada de unas envidiables, privilegiadas, únicas y frontales vistas a la imponente y mágica silueta almenada del Alcázar de Segovia y la Catedral, es un fidedigno e irrepetible microcosmos que resume brillantemente la vertiginosa evolución sociológica, recreativa y residencial de los arrabales y del histórico pueblo matriarcal y aguerrido de Zamarramala." },
    { id: 145, name: "CHOZO DE LA PORTERA DE LA DEHESA", category: "Historia", coords: "41°02'35.4\"N 3°47'43.4\"W", address: "ALDEALENGUA DE PEDRAZA", note: "Arquitectura tradicional de pastores perfectamente conservada.", image: "https://lh3.googleusercontent.com/d/1Kbcm1V9hwljV5vFOvLJa-SM1mY3KwnJe", history: "Espectacular, sobrecogedor y excepcionalísimo ejemplo vivo de la arquitectura más pura, efímera, humilde e increíblemente milenaria de los sufridos pastores trashumantes de la alta montaña castellana. Levantado ingeniosamente por sabios canteros de forma exclusiva y escrupulosa con rústica 'piedra seca' (bloques de campo toscamente labrados y encajados a presión sin usar absolutamente nada de argamasa ni cemento mediante la complicada técnica de aproximación de hiladas o 'falsa cúpula'), y rematado antaño con pesados y aislantes ramajes y piornos de la sierra. Este claustrofóbico y primitivo chozo con forma de ojiva ofrecía un minúsculo, ahumado, asfixiante pero providencial y vital refugio contra los salvajes y letales temporales, heladas y lobos de la gélida sierra a aquellos rudos y curtidos hombres que vivían, pasaban la vida entera, nacían y a menudo morían en la más absoluta soledad junto a su manso rebaño merinal." },
    { id: 146, name: "MOLINO DE LOS GORICHES", category: "Industrial", coords: "41°10'43.1\"N 3°53'10.3\"W", address: "ARVALILLO DE CEGA", note: "Molino que dominaba el cauce del río Cega en su zona media.", image: "https://lh3.googleusercontent.com/d/1f0-KL5hpGziqxW6l2G4EaC_ZXA0L8nEc", history: "Muy robusto, fotogénico, romántico y sumamente solitario ingenio hidráulico, enclavado y maravillosamente camuflado en la umbría, húmeda, profunda e impenetrable y verde fronda ribereña de la zona media del impetuoso e irregular curso y cañón del río Cega. A lo largo de los siglos, protagonizó en los enrevesados tribunales de la Real Chancillería incontables, encarnizadas, violentas e infinitas rencillas legales y larguísimos 'pleitos de aguas' (relativos a los valiosísimos derechos sobre las presas y 'las pesqueras' de truchas) entre los desesperados labriegos aldeanos y los codiciosos terratenientes monopolizadores de la molienda del trigo. Su vieja y desvencijada maquinaria rural, compuesta de ejes de dura madera de negrillo y forjados de viejo y herrumbroso hierro, yace hoy poética y enteramente devorada, tapizada y estrangulada por las voraces y salvajes enredaderas, sirviendo como un conmovedor, inolvidable y magistral tributo a la silenciosa arqueología y ruina preindustrial de los valles periféricos segovianos." },
    { id: 147, name: "FÁBRICA DE LUZ", category: "Industrial", coords: "41°02'18.1\"N 3°49'29.7\"W", address: "NAVAFRÍA", note: "Antigua central hidroeléctrica que modernizó la zona.", image: "https://lh3.googleusercontent.com/d/1iPCIPe6V83krbCH5f0oUguYuB0eyQFMo", history: "Pionera, deslumbrante, revolucionaria y atrevida micro-central hidroeléctrica rural. Construida y financiada con el enorme arrojo de la burguesía a finales del efervescente siglo XIX, esta soberbia instalación fabril obró el auténtico, aplaudido e indescriptible 'milagro' del progreso y la vida moderna en las profundidades incomunicadas de la más escarpada, aislada y arcaica montaña. Aprovechando audazmente la espectacular y atronadora caída natural y el abismal salto de agua del famoso Chorro y las purísimas e inagotables escorrentías de los glaciares y ríos serranos colindantes, sus pesadas e importadas turbinas de hierro fundido extranjero y sus ruidosas dinamos generaron, para pasmo de los aldeanos, la primera, débil y parpadeante corriente eléctrica continua. Una increíble energía que, conducida por frágiles y oxidados cables de cobre sobre palos rústicos, iluminó asombrosa y festivamente las hasta entonces lúgubres, tétricas y humildes callejuelas ganaderas de Navafría y de otras pequeñísimas e impactadas aldeas colindantes." },
    { id: 148, name: "PRESA Y MOLINO CASTELLANOS", category: "Industrial", coords: "41°04'36.6\"N 3°50'11.0\"W", address: "NAVAFRÍA", note: "Complejo hidráulico de gran importancia local.", image: "https://lh3.googleusercontent.com/d/1iN-hLQdj_WV1tqKKzwB7oDVukX1x6DME", history: "Fabulosa, hercúlea y ciclópea obra civil, arquitectónica y fabril que retaba y domaba magistralmente las terribles, traicioneras, gélidas e impetuosas y devastadoras corrientes incontroladas del violento deshielo y riadas serranas. Este formidable e imprescindible molino harinero de la zona montañosa, motor de la subsistencia del pan centenero de muchos kilómetros a la redonda, requería indiscutiblemente de un azud o presa colosal y de impecable fábrica de sillería y durísima mampostería granítica para frenar, contener y garantizar la imprescindible reserva de agua durante el implacable, asfixiante y tacaño verano castellano. Las increíbles crónicas y las exageradas historias que glosan sobre sus valientes, tozudos y recios molineros, lidiando con palancas y compuertas a altas horas de la madrugada contra los gruesos troncos caídos y combatiendo las capas de hielo puro y cortante durante las brutales crecidas y tormentas invernales de agua nieve, son hasta hoy pura y cantada materia legendaria, respetada y transmitida de padres a hijos en toda la comarca maderera." },
    { id: 149, name: "ERMITA DE SAN NICOLÁS", category: "Historia", coords: "41°09'03.2\"N 3°47'10.5\"W", address: "OREJANA", note: "Templo románico rodeado de misterios de la zona mística.", image: "https://lh3.googleusercontent.com/d/132V6RM00LCS639kowAsXTR11_dRG26wE", history: "Pequeñísimo, puro, modesto, bellísimo y profundamente solitario templo de rancio sabor románico pleno (s. XII y XIII). Está compuesto y asentado sobre formidables lienzos de rústica mampostería del terreno y robustos e inconfundibles sillares de arenisca y piedra caliza ferruginosa de un intenso color rojizo y ocre. Es el último, estoico, desafiante y melancólico vestigio y mudo testigo de un antiquísimo, inseguro y pobrísimo patrón de poblamiento campesino sumamente disperso que desapareció hace cientos de años. Su ábside semicircular, sobrio y elegantemente proporcionado sin pretensiones ostentosas, guarda celosa y herméticamente la verdadera e incontaminada esencia sociológica de las primitivas fundaciones religiosas rurales; aquellas impulsadas a punta de lanza, sudor y espada por los aguerridos Concejos Militares y Caballeros Nobles de la villa de Sepúlveda para cristianizar con firmeza, explotar económicamente y fijar para siempre una mínima y sacrificada población cristiana colona y labriega en los áridos, despoblados y peligrosos límites montañosos del sur de su entonces enorme e ingobernable territorio o Alfoz medieval." },
    { id: 150, name: "LA TEJERA DE RAMÓN MARTÍN", category: "Industrial", coords: "41°05'24.5\"N 3°51'18.1\"W", address: "VALLE de SAN PEDRO", note: "Instalaciones artesanales de elaboración de tejas.", image: "https://lh3.googleusercontent.com/d/1Adqxlpsb1FI9MeB99wM0CUCCs7TjQOOw", history: "Rústico, ancestral e interesantísimo complejo de gran horno ('la calera' u horno moruno semicircular) y tejar artesanal que funcionó febril, agotadora y periódicamente al altísimo y asfixiante calor del fuego provocado a base de montañas y fardos inmensos de humeante retama, enebro y fuerte piorno de los montes aledaños. En estas austeras, sucias y calurosísimas instalaciones al aire libre, los humildes pero muy experimentados maestros tejeros (una estirpe que transmitía sus trucos de padres a hijos), con una inigualable pericia manual heredada y perfeccionada por incontables generaciones de artesanos del barro, extraían y amasaban tenazmente con el agua del arroyo la finísima y densa arcilla rojiza local ('la greda'). Tras su decantación, moldeaban sudorosamente la pegajosa pasta, a menudo utilizando directamente y como rústico, eficaz e inmejorable molde ergonómico y natural el curvo contorno de su propio y ancho muslo campesino. Todo ello para fabricar a destajo las célebres, pesadísimas, porosas y maravillosamente imperfectas y musicales tejas curvas tradicionales, así como los macizos e indestructibles ladrillos de era (las llamadas 'galletas'), que terminaban por techar con primor, resguardar sin fallos de las torrenciales lluvias y abrigar cálidamente del implacable hielo de enero a los caseríos y las grandes casonas señoriales de todo el florido, alargado, pintoresco y protegido Valle de San Pedro y el somontano de la cordillera." },
    { id: 151, name: "DESPOBLADO DE ALDEALAFUENTE", category: "Ruinas", coords: "41°14'19.8\"N 3°48'45.5\"W", address: "ALDEALAFUENTE", note: "Huellas de la vida rural medieval desaparecida.", image: "https://lh3.googleusercontent.com/d/1QX6R5uUSqg3ZqC0z9aCvlQ-T39U6Bfvm", history: "Un trágico y silenciado ejemplo de las demoledoras crisis demográficas bajomedievales y modernas. Aldealafuente sucumbió inexorablemente al letal cóctel de epidemias recurrentes, años de hambruna y a la implacable centralización de tierras y diezmos por parte de los grandes señoríos y ricos monasterios de la diócesis. Hoy en día, los sutiles y melancólicos desniveles en el terreno, esparcidos entre matorrales y encinas, junto con algunas tenadas semiderruidas de mampostería, son el único y postrer testimonio de las sufridas y anónimas familias que lograron labrar y arrancar el sustento a estos durísimos y castigados páramos castellanos." },
    { id: 152, name: "ERMITA DE SAN VALENTÍN", category: "Historia", coords: "41°19'31.7\"N 3°52'49.4\"W", address: "BURGOMILLODO", note: "Capilla aislada en el espectacular paisaje del Duratón.", image: "https://lh3.googleusercontent.com/d/18drPYSc4F3E8zsJg39SYYcPcMK4J2J6Y", history: "Sabiamente oculta en uno de los recodos y parajes más inaccesibles, vertiginosos y dramáticos de las formidables Hoces del río Duratón. Esta rústica, tosca y humilde capilla de piedra fue concebida y utilizada como asilo inexpugnable por eremitas y monjes altomedievales que buscaban encontrar la voz de Dios en el aislamiento más absoluto, el silencio de la roca y la majestuosidad de la naturaleza virgen. Sus antiquísimos y fríos muros de cantería rezuman aún todo el inalterable misticismo de los primeros e intrépidos cristianos repobladores de la Extremadura castellana." },
    { id: 153, name: "ERMITA DE SANTA ENGRACIA", category: "Historia", coords: "41°19'15.9\"N 3°52'17.7\"W", address: "BURGOMILLODO", note: "Santuario románico con el que soñaban los reyes.", image: "https://lh3.googleusercontent.com/d/1_u9xVs_M4U9YnxB3yKD26-a-TWcM-PT-", history: "Desafiando de manera soberbia y romántica las mismísimas leyes de la gravedad, esta bellísima ermita románica está erigida sobre un colosal e impresionante promontorio calizo que se asoma a los insondables abismos del cauce del río Duratón. Según atestiguan las viejas y sabrosas crónicas locales, esta iglesia fue soñada por monarcas medievales y albergó continuas, fervorosas y desesperadas rogativas de pastores para proteger a los caminantes y rebaños de los peligrosos, oscuros y mortales vados del río y de las despiadadas manadas de lobos ibéricos en las frías noches de invierno." },
    { id: 154, name: "MOLINO DE MESA", category: "Industrial", coords: "41°12'21.1\"N 3°58'55.3\"W", address: "CABEZUELA", note: "Ingenio harinero del Cega rodeado de frondosa vegetación.", image: "https://lh3.googleusercontent.com/d/11jnhbuh5odHT8GhxYXGHBRltUGR2krwY", history: "Un poderoso, ruidoso e incombustible ingenio fluvial que exprimía hasta la saciedad el caudal del esmeralda y truchero río Cega. Durante el intenso proceso de modernización preindustrial de finales del siglo XIX, la acaudalada e influyente familia propietaria de los Mesa lo dotó de modernísimos, eficaces y carísimos mecanismos de molienda que desbancaron para siempre a los viejos molinos de represa vecinales. Era un vital punto de encuentro ineludible donde arrieros, panaderos y rudos campesinos aguardaban pacientemente con sus mulas para obtener la preciada harina blanca, el vital y sacrosanto alimento base de toda la llanura de Castilla." },
    { id: 155, name: "CASILLA DE PEÓN CAMINERO 3", category: "Historia", coords: "41°16'56.8\"N 3°36'09.5\"W", address: "CASTILLEJO DE MESLEÓN", note: "Legado arquitectónico de la red de carreteras del siglo XIX.", image: "https://lh3.googleusercontent.com/d/10VbCmZkcEHRgRazo0caN8C06whywVPfz", history: "Una muestra absolutamente fascinante, humilde y fotogénica del monumental e histórico plan de infraestructuras estatales impulsado por el Estado liberal en el siglo XIX para vertebrar la accidentada geografía de España. Los estoicos, solitarios y esforzados 'peones camineros' vivían estoicamente en estas inconfundibles, recias y pequeñas casas de sillería al pie mismo de la calzada junto a todas sus familias. Eran los máximos encargados, bajo cualquier inclemencia meteorológica y armados únicamente de rudos picos y palas, del durísimo, asfixiante e infinito mantenimiento del firme de las estratégicas leguas de carretera real que se les asignaban." },
    { id: 156, name: "TENADAS DE SAN GREGORIO", category: "Historia", coords: "41°24'09.3\"N 3°46'59.0\"W", address: "CASTRO SERRACÍN", note: "Arquitectura pastoril característica del nordeste de la provincia.", image: "https://lh3.googleusercontent.com/d/1aCYtiDBp2buAJeLRFUTkURgu8JfWszxx", history: "Auténticos, primitivos e inviolables santuarios de la más pura, eficaz y arcaica arquitectura pastoril de la escarpada sierra de Ayllón. Estas formidables, alargadas e imponentes estructuras construidas exclusivamente a base de robusta 'piedra seca' y de un increíble y rústico entramado de durísima madera de sabina, protegían de noche a los inmensos, valiosísimos y rentables rebaños de ovejas merinas de la Mesta frente a los letales, gélidos e interminables inviernos serranos y de las afiladas e implacables mandíbulas de los numerosos lobos. Reflejan nítidamente una durísima forma de vida y economía milenaria hoy, tristemente, en extremo e irreversible peligro de extinción." },
    { id: 157, name: "ERMITA", category: "Historia", coords: "41°13'12.4\"N 3°35'45.7\"W", address: "CEREZO DE ABAJO", note: "Edificación religiosa sencilla pero de gran valor etnográfico.", image: "https://lh3.googleusercontent.com/d/18K071v4xqITszZoJzeCz0VlpiVdmLRQZ", history: "Pequeña, conmovedora y solitaria joya de la piedad y la devoción popular construida estratégicamente a un palmo de la polvorienta y ruidosa ruta de la histórica Cañada Real. Su rústico y modesto ábside de mampostería y su sencilla pero robusta espadaña han cobijado, consolado y abrigado a infatigables pastores trashumantes, rebaños y ganaderos locales durante siglos de tránsito incesante. El rítmico, salvador y resonante repique de su diminuta campana sirvió en infinitas y aterradoras ocasiones como una invaluable guía acústica de salvación en los oscuros y crueles días de ventisca y niebla impenetrable que descendía como un manto del macizo de Somosierra." },
    { id: 158, name: "DESPOBLADO DE CORRAL DE DURATÓN", category: "Ruinas", coords: "41°17'17.5\"N 3°41'45.0\"W", address: "CORRAL DE DURATÓN", note: "Restos de población cercanos al cauce del río místico.", image: "https://lh3.googleusercontent.com/d/1DjbqOZiZXsL8wczZ3EOjCdU-rYR2Zv61", history: "El trágico, sordo y desolador eco de una prometedora aldea medieval que fue asolada y sentenciada a muerte en las postrimerías del siglo XVII. Corral de Duratón claudicó brutalmente ante las apocalípticas y seguidas sequías, las recurrentes plagas y la implacable e inasumible presión fiscal y diezmera impuesta por los ausentes y ricos latifundistas y la Corona. En la actualidad, sus rústicos y derruidos cimientos de piedra rojiza, casi engullidos por completo por la voraz maleza, las sabinas y los aromáticos romeros, conforman la olvidada y lúgubre tumba de una próspera comunidad campesina que no pudo sobrevivir a la ferocidad del clima mesetario y del agonizante sistema feudal tardío." },
    { id: 159, name: "ERMITA DE SAN ROQUE", category: "Historia", coords: "41°22'24.6\"N 3°39'56.1\"W", address: "ENCINAS", note: "Oratorio místico rodeado de encinas centenarias.", image: "https://lh3.googleusercontent.com/d/1ynWOp3R2B1VFcvvvna-X3kwDXobOLDkh", history: "Venerable, hermético y apartado oratorio rural levantado con devoción y terror a partes iguales. Fue dedicado expresamente a San Roque, el sacrosanto patrón intercesor y protector infalible contra las apocalípticas y temibles epidemias de peste bubónica y cólera que esquilmaron, aterrorizaron y diezmaron demográficamente a la corona de Castilla a lo largo de toda la Edad Moderna. Situada con gran precaución a las afueras de los muros del pueblo, funcionó en épocas lúgubres para mantener a los enfermos en estricta y desoladora cuarentena (haciendo las funciones de rudimentarios lazaretos). Hoy se encuentra pacíficamente abrazada por centenarias, sabias y gigantescas encinas que le confieren un sobrecogedor aire de profunda paz y ancestral misticismo." },
    { id: 160, name: "FÁBRICA DE HARINAS Y VIVIENDA", category: "Industrial", coords: "41°17'49.5\"N 3°55'56.5\"W", address: "FUENTEREBOLLO", note: "Complejo fabril harinero muy bien conservado.",image: "https://lh3.googleusercontent.com/d/1DL88F1Gh-K2jH3xlGa9Kf4_QzPVW95LW", history: "Soberbio, ambicioso y espectacular complejo que simboliza e ilustra magistralmente la histórica, drástica y fundamental transición de la lenta molienda tradicional a pequeña escala a los inicios de la verdadera, pujante y capitalista Revolución Industrial en el campo de Segovia. Sus sólidos y enormes paredones de ladrillo cocido de innegable influencia mudéjar y la elegante y cómoda vivienda burguesa adosada, atestiguan el enorme poder económico, estatus y visión de futuro del propietario. Este valiente empresario introdujo en el valle máquinas y complejos sistemas de cilindros austrohúngaros y cernedoras mecánicas de última generación para devorar y procesar incesantemente el ingente mar de cereal que ofrecía toda la ubérrima comarca." },
    { id: 161, name: "LA CASETA DEL VAQUERO", category: "Naturaleza", coords: "41°20'26.6\"N 3°58'05.7\"W", address: "NAVALILLA", note: "Pequeño refugio de pastores en el entorno natural de Navalilla.", image: "https://lh3.googleusercontent.com/d/1Hk58veH6EgXtQSRQL9VzNqilKRkNsklR", history: "Inhóspito, diminuto, pero absolutamente vital y sagrado refugio pastoril enclavado literalmente en medio de la nada más absoluta del páramo estepario de Navalilla. Fue construido a lo largo de incontables jornadas con la arcaica, exigente y complejísima técnica de la 'piedra seca' y rematado con una asombrosa 'falsa cúpula' de aproximación de hiladas sin argamasa (herencia casi prehistórica). Este resistente, oscuro y ahumado chozo salvó in extremis innumerables vidas de recios pastores locales que quedaban mortalmente atrapados por cegadoras, gélidas y repentinas ventiscas de nieve mientras pastoreaban, aislados de todo, a los formidables rebaños de vacas y ovejas en los más agrestes, escarpados y desolados límites del municipio." },
    { id: 162, name: "MOLINOS", category: "Industrial", coords: "41°24'05.6\"N 3°44'25.0\"W", address: "NAVARES DE ENMEDIO", note: "Ingenios hidráulicos muy relevante.", image: "https://lh3.googleusercontent.com/d/1pjz8IrXpgAfww1yvSrD1boYz0JTJ85ig", history: "Intrincado, fascinante y fabuloso complejo preindustrial compuesto de sucesivos molinos escalonados que, en una magistral y asombrosa lección de ingeniería y aprovechamiento ecológico, exprimían y rentabilizaban al máximo cada microscópica gota de los escasísimos y valiosos arroyos estacionales del sediento norte segoviano. Documentados exhaustivamente en protocolos desde el remoto siglo XVI, la lucrativa y codiciada posesión de estas presas y molinos generó interminables, costosos, violentos y encarnizados pleitos de agua y sangre en la ilustre Real Chancillería de Valladolid, enfrentando durante generaciones enteras a los empobrecidos concejos aldeanos contra los altivos, ricos y monopolizadores marqueses y señoríos eclesiásticos." },
    { id: 163, name: "COLMENARES", category: "Industrial", coords: "41°24'26.7\"N 3°44'47.4\"W", address: "NAVARES DE LAS CUEVAS", note: "Arquitectura tradicional para la explotación de la miel.", image: "https://lh3.googleusercontent.com/d/1uLXPYib7OrGgS1Jl8g1Ukagz77DLiKCW", history: "Vestigios de un patrimonio arquitectónico y etnográfico puramente rupestre de verdaderamente incalculable y singularísimo valor histórico y antropológico. Estas inusuales y robustas estructuras, cercas y nichos de dura mampostería al abrigo de la roca caliza fueron concebidas y erigidas pacientemente para acoger y blindar a los primitivos 'dujos' (rústicas e ingeniosas colmenas fabricadas artesanalmente con troncos vaciados de corcho o gruesa encina). Su misión prioritaria y vital era blindar la miel frente a los destrozos y la voracidad de los golosos y temibles osos pardos cantábricos que antiguamente merodeaban libremente la comarca, además de proporcionar a los monjes y nobles la sacrosanta e indispensable cera pura de abeja, necesaria e imprescindible para la iluminación litúrgica de altares e iglesias." },
    { id: 164, name: "DESPOBLADO DE CABRERIZOS", category: "Ruinas", coords: "41°12'55.6\"N 3°39'58.3\"W", address: "SANTA MARTA DEL CERRO", note: "Aldea mística que hoy permanece en el recuerdo.", image: "https://lh3.googleusercontent.com/d/165FoofgPTA-zbaGiNuPZC3jIdoO98mBO", history: "Una próspera y modesta aldea comunal cruelmente arrasada, sepultada y finalmente abandonada. Fue víctima directa, silenciada e impotente de la avasalladora concentración y especulación de pastos, así como de las feroces hambrunas que castigaron el siglo XVIII. Cabrerizos, cuyo propio y rotundo topónimo medieval evidencia inconfundiblemente su inmemorial, recia y exclusiva vocación ganadera y pastoril, es a día de hoy un triste y fantasmagórico montón de sillares y piedras cubiertas de argamasa deshecha, donde resuena en la imaginación del viajero el lejano eco de los cencerros mesteños, el humo de las chimeneas y el humilde ajetreo de las grandes y curtidas familias ganaderas que una vez lo habitaron." },
    { id: 165, name: "ESTACIÓN DE TREN", category: "Industrial", coords: "41°10'50.4\"N 3°33'48.3\"W", address: "SANTO TOMÉ DEL PUERTO", note: "Estructura ferroviaria en la falda de Somosierra.", image: "https://lh3.googleusercontent.com/d/1btse1Lg9DLTbawQL0u0Vx6tmpNWVFlNb", history: "Fabuloso y sobrecogedor monumento de arquitectura civil perteneciente a la histórica y épica línea ferroviaria Madrid-Burgos (conocida popularmente en los años sesenta como el Ferrocarril Directo). Esta monumental, extensa y sólida estación, edificada en piedra, ladrillo visto y dotada de grandiosas marquesinas de fundición y muelles de carga, desafió tecnológica y heróicamente la compleja, infernal e inestable orografía de los túneles del puerto de Somosierra. Fue el latido, el salvavidas y el indiscutible motor del comercio moderno local de resinas, lanas y cereales hasta el trágico, oscuro y polémico cierre definitivo de la línea a finales del siglo XX, quedando hoy petrificada como un imponente y romántico esqueleto herrumbroso del viejo progreso estatal." },
    { id: 166, name: "DESPOBLADO DE CASABLANCA", category: "Ruinas", coords: "41°17'36.1\"N 3°50'43.9\"W", address: "SEBÚLCOR", note: "Lugar inhóspito que guarda secretos de antiguos pobladores.", image: "https://lh3.googleusercontent.com/d/1B79S4fUQXkHhbIqkAWz8Htim0soLr9x5", history: "Un espléndido caserío comunal devorado por la inclemente vorágine de la naturaleza salvaje del río Duratón y por el implacable, imparable y letal fenómeno de la sangrante emigración rural de los años cincuenta. En el esplendor de la Edad Media y Moderna, fue un sumamente próspero y boyante núcleo agropecuario que orbitaba y dependía feudadmente de las inabarcables, ricas y temidas posesiones de las altas dignidades eclesiásticas y del cercano y mágico priorato rupestre de la Hoz. Pasear hoy por sus inmensos corrales de piedra, tejados derruidos por las nevadas y callejuelas fantasmales, constituye un viaje absolutamente inmersivo, crudo y doloroso a la trágica realidad del éxodo campesino que desangró demográficamente a la Castilla del interior a mediados del siglo XX." },
    { id: 167, name: "FÁBRICA DE LUZ", category: "Industrial", coords: "41°17'42.8\"N 3°45'47.9\"W", address: "SEPÚLVEDA", note: "Importante obra de ingeniería industrial para la villa.", image: "https://lh3.googleusercontent.com/d/1xhiYYoztBIqJ2So6IrnPsc3zFxDd57cN", history: "En el interior de estas ciclópeas, oscuras y majestuosas ruinas de ladrillo y hormigón situadas en el fondo del imponente cañón calcáreo, se fraguó la asombrosa, milagrosa y espectacular llegada, casi mágica, de la primera electricidad y energía a la antigua villa medieval de Sepúlveda a finales del siglo XIX. Aprovechando sin contemplaciones la sobrecogedora e indomable fuerza del atronador y furioso salto de agua estacional del río Duratón, intrépidos e iluminados empresarios industriales instalaron aquí ruidosas, carísimas y modernísimas turbinas alemanas que, al girar, transformaron para siempre la histórica y tenebrosa oscuridad medieval de las estrechas calles de la villa en un fulgurante, envidiado y festivo faro de incipiente progreso y bienestar; desterrando en una sola noche y para toda la eternidad los sucios, apestosos y viejos faroles de aceite, las velas y los precarios candiles de toda la noble población sepulvedana." },
    { id: 168, name: "MOLINO DE LAS CANALEJAS", category: "Industrial", coords: "41°18'14.0\"N 3°45'44.7\"W", address: "SEPÚLVEDA", note: "Molino que aprovechaba las aguas del río Caslilla.", image: "https://lh3.googleusercontent.com/d/1xfJ19fWs1mQ3U55TCljPfy8sVKOFREZD", history: "Soberbia, inaccesible y maravillosa obra de la ingeniería hidráulica e industrial tradicional, soberanamente encajonada en los imposibles, estrechos y laberínticos desfiladeros del profundo cañón calizo del río Caslilla (afluente directo del gran Duratón). Sus larguísimos, perfectos y potentísimos canales artificiales ('las canalejas'), tallados y picados asombrosa, heroica y literalmente a mano en la durísima roca viva por cuadrillas de canteros durante generaciones, dirigían astutamente el furioso y salvaje caudal hídrico hacia las entrañas y los oscuros rodeznos del edificio. Históricamente, y para amargura del pueblo llano, este colosal y vital molino perteneció íntegramente a ricos, privilegiados e intocables estamentos eclesiásticos que cobraban incesantes y gravosos diezmos y maquilas en fina harina blanca a todos los hambrientos, dependientes y atribulados campesinos sepulvedanos." },
    { id: 169, name: "PUENTE DE TALCANO", category: "Historia", coords: "41°17'42.9\"N 3°45'53.8\"W", address: "SEPÚLVEDA", note: "Puente medieval icónico en la entrada de las Hoces del Duratón.", image: "https://lh3.googleusercontent.com/d/1vstfA7Yx4Y1A15olNsVwDyD-Ds-_KLTZ", history: "Formidable, bellísimo y absolutamente legendario puente de cantería y sillería romana o medieval, caracterizado inconfundiblemente por un monumental, peraltado y colosal ojo único. Fue erigido magistral y estratégicamente en la mismísima, angosta y tenebrosa garganta de entrada que abre de forma dramática el espectacular y mundialmente famoso cañón de las Hoces del Duratón. Durante la Edad Media y el Renacimiento, este paso fue un cuello de botella logístico esencial, un vital y temido punto aduanero de cobro ineludible de 'pontazgo' y portazgo; siendo a su vez el paso seguro, necesario e indiscutible de las inmensas, baladoras y polvorientas manadas de la histórica Cañada Real que buscaban las verdes cañadas y pastos sorianos. Su magnífica bóveda de cañón ha resistido incólume e impasible, durante más de ochocientos años de historia, las furiosas, devastadoras y monumentales riadas y avenidas de deshielo que a menudo asolaban sin piedad el angosto fondo del verde valle sepulvedano." },
    { id: 170, name: "APEADERO DE TREN", category: "Industrial", coords: "41°19'54.3\"N 3°36'00.3\"W", address: "TURRUBUELO", note: "Antigua parada de la línea ferroviaria hoy en desuso.", image: "https://lh3.googleusercontent.com/d/1lC9OLqTQVmKlwmroee-rfcX0zg2PmWaP", history: "Pequeña, humilde y hoy lánguida y oxidada parada ferroviaria perdida en el inmenso paisaje del nordeste segoviano. A pesar de su actual y triste aspecto esquelético devorado por las hierbas, esta minúscula estación fue un milagroso, ansiado y vital cordón umbilical que conectó y salvó de la más absoluta y atroz miseria y aislamiento histórico a este alejado e ignorado rincón mesetario con la modernidad del Estado y el flujo febril del comercio nacional y la ciudad de Madrid. Durante las ásperas décadas de la mitad del siglo XX, su frío andén fue el emocionantísimo y lacrimógeno escenario recurrente de las innumerables, amargas y masivas despedidas y escasas llegadas del dramático éxodo de emigrantes rurales; siendo también, en tiempos de cosecha, el principal y ensordecedor punto de carga y acopio mercantil del finísimo y abundante trigo candeal producido a raudales en los pelados y gélidos páramos cerealistas de la abrupta Serrezuela." },
    { id: 171, name: "DESPOBLADO DE BÁLSAMOS", category: "Ruinas", coords: "41°21'28.1\"N 3°43'44.0\"W", address: "URUEÑAS", note: "Asentamiento rural del pasado místico segoviano.", image: "https://lh3.googleusercontent.com/d/130Gl1Y5xbdIJpIWjUHefVHdRh-ITXPTz", history: "Las escasísimas, derruidas y melancólicas piedras mampuestas que, a duras penas, aún afloran entre las aliagas y espartos del Despoblado de Bálsamos, cuentan y custodian la fascinante historia de una pequeña encomienda o de una diminuta y efímera villa rural medieval, nacida pujantemente al fragor y al amparo colonizador de las exitosas e inciertas campañas militares de la Reconquista al sur del Sistema Central. No obstante, por causas no del todo desveladas por los legajos pero indudablemente relacionadas con plagas, endémicas sequías o asfixia feudal, fue abandonada en masa y misteriosamente a finales de la cruda Edad Moderna por sus arruinados habitantes. Este escondido, olvidado y silencioso rincón paramero, dueño de un magnetismo y belleza paisajística y arqueológica singular, invita profundamente al viajero errante a detenerse y reflexionar, in situ, sobre lo tremendamente fútil y efímero que resulta el empeño humano de domesticar el entorno frente a la inmensa, reconquistadora e invencible fuerza del clima y la hostil naturaleza castellana." },
    { id: 172, name: "LA CASITA ALTA", category: "Naturaleza", coords: "41°21'20.3\"N 3°49'23.2\"W", address: "VALLE DEL TABLADILLO", note: "Lugar de retiro y vistas privilegiadas al valle segoviano.", image: "https://lh3.googleusercontent.com/d/13D8Zoo6fnn0hELq1wRWs02A_MMj6qCM_", history: "Pintoresca, singular e icónica construcción forestal, ingeniosa y maravillosamente elevada y enclavada de forma estratégica, casi acrobática, sobre la inestable cúspide de un afilado y vertiginoso peñasco calcáreo que domina de forma dictatorial, imponente y panóptica absolutamente todos los vientos del silencioso y frondoso valle. En el esplendor de las masivas explotaciones forestales resineras del siglo XIX y XX, este pequeño y sólido refugio servía como puesto de vigilancia militar inmejorable y atalaya omnisciente para los duros y curtidos guardas jurados rurales y los representantes de los grandes terratenientes madereros, quienes controlaban con prismáticos y mano de hierro los furtivismos, las vitales extracciones y destilaciones de la rica resina (el oro de los pinares) y prevenían, detectaban y alertaban velozmente con humos de los destructivos, aterradores e incontrolables incendios de verano que amenazaban con devastar por completo y asolar para siempre los inabarcables, oscuros y densos bosques negrales. Hoy, su abandonado torreón funciona como un privilegiadísimo mirador de inigualable pureza y paz inmensa." },
    { id: 173, name: "TEJERAS", category: "Industrial", coords: "41°21'28.3\"N 3°29'22.0\"W", address: "FRESNO DE CANTESPINO", note: "Legado de la producción cerámica artesanal.", image: "https://lh3.googleusercontent.com/d/11jT_F-pcbP3rLk1kf1RzvkbSbuI2eJav", history: "Grandiosos, descomunales, ahumados y monumentales vestigios de un espectacular complejo de antiguos y formidables hornos 'cocederos' circulares de clara influencia morisco-mudéjar, astutamente semienterrados y resguardados en las profundas faldas de la ubérrima tierra arcillosa ('barreras') y férrica de los históricos dominios del Fresno de Cantespino. La penosísima, sucia, asfixiante y durísima labor de las familias y gremios cerrados de los artesanos tejeros, horneando y amasando infatigablemente el pesado barro rojo crudo con sus propias manos y pies en las ardientes bocas de estos infernales hornos de leña y piorno serrano, proveyó durante incontables y prósperos siglos, de inconfundibles e impermeables tejas árabes y fortísimos ladrillos o adobes a la práctica totalidad de los impresionantes, recios y hermosos pueblos y casonas de inconfundible 'arquitectura negra y roja' que hoy asombran y salpican magistralmente el somontano de toda la colorida y serrana comarca de la noble e ilustre villa de Riaza." },
    { id: 174, name: "CONVENTO DE SAN FRANCISCO", category: "Ruinas", coords: "41°25'37.8\"N 3°22'52.3\"W", address: "AYLLÓN", note: "Ruinas majestuosas del convector que visitó San Francisco.", image: "https://lh3.googleusercontent.com/d/1zwZPRX3SyYBKknp3baoGXz_vaSbER3jI", history: "Según atestigua la piadosa, riquísima e inquebrantable tradición y las leyendas locales milenarias más arraigadas en Ayllón, este bellísimo cenobio mendicante fue fundado en persona por el mismísimo santo patrón de los pobres, San Francisco de Asís, durante su mítico, exhaustivo y agotador peregrinaje y tránsito por las desoladas calzadas ibéricas en el ya remoto y documentado año del Señor de 1214. Sus hoy inmensas, asombrosas y descarnadas y majestuosas ruinas pétreas de puro y elegantísimo estilo gótico tardío, entre las que aún sobreviven altivos e imponentes restos y arcos nervados de su otrora riquísima y desmesurada cabecera de la capilla mayor, naves y valiosos altares expoliados sin piedad, atestiguan y confirman arqueológicamente la increíble, aplastante y prolongada influencia teológica, moral, social y económica que tuvo este amurallado cenobio franciscano en la vida diaria, el control feudal y el desarrollo de la noble y siempre aguerrida e inexpugnable e ilustrísima villa, Corte y señorío de Ayllón." },
    { id: 175, name: "MOLINO SERNA Y DEL VADO", category: "Industrial", coords: "41°27'19.4\"N 3°27'59.0\"W", address: "ALDEALENGUA DE SANTA MARÍA", note: "Complejo de molienda en el noreste de la provincia.", image: "https://lh3.googleusercontent.com/d/1DvXQh9e-LOIF5u2_yBGVvN7DCRz_MwRQ", history: "Colosal, laberíntico, estratégico y gigantesco complejo de molienda medieval y preindustrial, compuesto sabiamente por varios módulos escalonados, que en su época dorada atesoraba en su oscuro y polvoriento interior varias presas y eficientes piedras 'volanderas' rotando al unísono; lo cual suponía todo un apabullante y envidiado lujo de tecnología punta e ingeniería hidráulica que dejaba pasmados y boquiabiertos a los campesinos de la época. Por su descomunal tamaño y su privilegiada posición, el Molino de la Serna y el Molino del Vado dominaron durante siglos y de manera despótica e indiscutible todo el curso principal y la ribera fluvial norteña, acaparando e imponiendo un duro y lucrativo monopolio en el monopolizado y obligatorio procesamiento masivo del cereal, maíz y cebada de todas las abundantes e indefensas villas y aldeas limítrofes, a las que se les obligaba a acudir allí bajo el amparo legal de la avariciosa y recia nobleza y el obispado local que detentaba sus derechos y que, como era natural en la Edad Moderna, imponía severos tributos ('maquilas') que esquilmaban el pan y el humilde sustento de las clases más bajas y jornaleras." },
    { id: 176, name: "ESTACIÓN DE TREN", category: "Industrial", coords: "41°25'49.6\"N 3°32'34.9\"W", address: "CAMPO DE SAN PEDRO", note: "Punto de conexión fundamental de la línea de Castilla.", image: "https://lh3.googleusercontent.com/d/1MUIRJyA67EyYrL9YK99rQi0t4GOHDsap", history: "Fundamental, modernísimo y estratégico enclave y nudo logístico de primerísimo orden de la colosal y muy controvertida obra del Ferrocarril Directo Madrid-Burgos (concebida a principios del siglo XX y finalmente materializada y finalizada por el dictador Francisco Franco). Esta enorme, sólida y hermosísima e inmensa estación, construida con unos claros, sobrios, bellos e inconfundibles aires de funcional e imponente arquitectura de ladrillo visto de tipología industrial norteña y vasca, canalizó y despachó frenéticamente en inmensos convoyes todo el inmenso, rico y abrumador flujo agrícola, remolachero y ganadero de toda la abandonada comarca del nordeste de la provincia segoviana, conectando la vida rural directamente con los grandes emporios y mercados bursátiles de trigo nacionales. Representó, sin duda alguna, el verdadero y vibrante corazón que bombeó riqueza y la salvación económica regional durante unas frenéticas y felices décadas, hasta el triste, cruel, opaco y sistemático abandono, inactividad y posterior y trágico desmantelamiento de la emblemática línea en el postrer y letárgico cuarto del siglo XX." },
    { id: 177, name: "MOLINO DE ARRIBA Y ABAJO", category: "Industrial", coords: "41°26'01.3\"N 3°40'28.5\"W", address: "CARABIAS", note: "Dos molinos históricos situados en el mismo arroyo.", history: "Excepcional, curiosísimo y asombroso y sumamente inteligente conjunto o red escalonada y concadenada de ingenios e históricos molinos harineros ubicados inverosímil y casi milagrosamente en el modesto, pedregoso y pobrísimo curso de un mismo, y a veces yermo, arroyo estacional secundario. Esta asombrosa y audaz muestra y obra de extrema ingeniería, optimización y pasmosa eficiencia hídrica e hidráulica rústica de la Alta Edad Moderna reutilizaba audazmente la mermada y exacta misma escasísima corriente y gota de agua dos o tres veces seguidas mediante ingeniosos embudos para mover y propulsar distintas y colosales piedras de rodeno y ejes de madera maciza, una magistral y desesperada obra de supervivencia y pura astucia campesina tradicional ideada y forjada brillantemente por las familias molineras para no parar la vital industria harinera y poder así rentabilizar, triturar y sobrevivir produciendo pan hasta de la última y agónica gota de rocío caída en tiempos de las frecuentes, brutales y asfixiantes o trágicas sequías y pertinaces 'años de la hambruna' del duro y agreste secano de las mesetas interiores." },
    { id: 178, name: "ERMITA DE SAN JUAN", category: "Historia", coords: "41°25'03.5\"N 3°35'56.4\"W", address: "CEDILLO DE LA TORRE", note: "Templo románico con elementos defensivos singulares.", image: "https://lh3.googleusercontent.com/d/1ENP40s_cqRtAolUerSqLD6EZ1wFSm2ZF", history: "Hermoso, encantador, enigmático y sumamente recio, tosco y pesado templo parroquial edificado en sillería y levantado íntegramente bajo las austeras normas y los estrictos y primitivos canones del más sobrio, primitivo, hermoso y puro y rústico estilo románico segoviano y castellano (siglos XII y XIII). Además de sus indudables y obvias funciones litúrgicas, sacramentales y profundamente piadosas para implorar a Dios mediante procesiones pidiendo fecundidad ganadera y abundantes buenas cosechas de centeno para toda la indefensa aldea circundante, su robusta arquitectura presenta y exhibe de forma sorprendentemente inconfundible y clara, unos inusuales, inquietantes y brutales elementos arquitectónicos defensivos de marcada influencia militar e islámica (muros colosalmente ciclópeos y pesados, matacanes, gruesas cornisas y minúsculos y altísimos vanos o aspilleras que simulaban fortificaciones) que a los arqueólogos e historiadores insinúan con tremenda fuerza y bastante precisión que la nave de la ermita también fue expresamente diseñada, costeada, concebida y utilizada en su tiempo como pequeño e inexpugnable bastión de contingencia o asilo y refugio urgente vecinal para albergar al valioso ganado, cosechas y a las asustadas y desesperadas familias durante las constantes, sangrientas, impredecibles y devastadoras incursiones y batallas de la siempre inestable y peligrosísima frontera medieval con las hordas musulmanas de las cercanas líneas califales de Medinaceli o las siempre traicioneras guerras señoriales civiles que ensangrentaron a la nobleza del norte ibérico." },
    { id: 179, name: "CANTERAS", category: "Industrial", coords: "41°32'22.8\"N 3°33'29.7\"W", address: "MADERUELO", note: "Explotación histórica de piedra para la villa.", image: "https://lh3.googleusercontent.com/d/1i6UXv1GLsitfLMdMf70FESrh_7CKTP6b", history: "Impresionantes, silenciosas, vastísimas y escarpadas heridas, frentes e inmensas explotaciones históricas mineras y arqueológicas a cielo abierto, labradas a pico durante milenios y poseedoras de un intrínseco e incalculable y apabullante valor arqueológico, arquitectónico, mineral y puramente histórico medieval. Del inagotable vientre oscuro de estas dramáticas, sangrantes y heroicas cicatrices en el terreno calcáreo perimetral, los afamados y rudos gremios y cuadrillas medievales locales de recios y heroicos picapedreros, asfixiados de polvo blanco de sol a sol, arrancaron y extrajeron metódica, peligrosa e infatigablemente durante siglos enteros los formidables e indestructibles y blanquecinos sillares tallados de resistente piedra y durísima roca caliza compacta. Fue con el inmenso fruto extraído de aquí que se fundaron y se elevaron vertiginosamente hacia los cielos las formidables e imponentes, legendarias, famosas y colosalmente herméticas y orgullosas murallas circulares, todos los majestuosos, nobles y arrogantes palacios fuertes, lienzos, bastiones almenados y los bellísimos, sagrados y decorados capiteles, naves, altares e iglesias románicas que dieron grandeza e identidad eterna a la antigua, orgullosísima y rica jurisdicción, Alfoz y noble Comunidad de la célebre, fronteriza y militarizada Villa y Tierra de Maderuelo." },
    { id: 180, name: "ERMITA DE SANTA COLOMA", category: "Historia", coords: "41°29'18.2\"N 3°31'22.4\"W", address: "MADERUELO", note: "Joya mística situada junto al embalse de Linares.", image: "https://lh3.googleusercontent.com/d/1OMfy9tuYT80hoiMNnRWRAVjAr5CK_ecZ", history: "Una milagrosa, misteriosa, bellísima, intensamente mágica y sobrecogedoramente solitaria y humilde capilla rústica de purísimo e inalterado e incontaminado románico temprano y visigótico rural. Se halla enclavada y anclada de manera inverosímil, ensoñadora y poética en un minúsculo altozano que linda a escasísimos centímetros con las mismísimas, silenciosas, lúgubres e insondables aguas y oscuras orillas de la espectacular masa de agua regulada que forma la inmensidad del vasto y sombrío pantano, dique y moderno y amenazante embalse hidroeléctrico de Linares del Arroyo. Mucho antes del apocalíptico y destructivo siglo XX, e infinidad de centurias antes de la gigantesca, impuesta y colosal sumersión del valle entero y de los fértiles pueblos por la faraónica construcción hidráulica del régimen y la presa de hormigón en la década de los cincuenta; esta ermita milagrosamente salvada del ahogo y bendecida y cuidada devotamente, controlaba el paso y protegía con su campana a las temerosas recuas, buhoneros, arrieros y rebaños de ovejas de caminantes desorientados que debían bajar a transitar el traicionero e imprevisible fondo del profundo valle frondoso del bravío, salvaje e indomable y frío río Riaza, a veces muy letal en sus intempestivas crecidas. Hoy en día, contemplar en primavera la inmaculada estampa de sus venerables, toscos y desgastados viejos muros de argamasa y piedra caliza y las rudas y ciegas ventanas ojivales que, de forma insólita y poética en época estacional de abundantes aguaceros, tempestades y furiosas y copiosas y amenazantes crecidas niveladas del aliviadero y embalse artificial, casi llegan hasta lamer, besar y acariciar peligrosamente las frías y tranquilas aguas superficiales que reflejan la luz invernal, infunde un paz y misticismo incomparable, haciendo respirar y evocando potentemente a quien la descubre, la más profunda y genuina devoción austera y pura de la mística Edad Media campesina castellana." },
    { id: 181, name: "ERMITA DE VALDEPERAL", category: "Historia", coords: "41°30'46.2\"N 3°25'39.4\"W", address: "MADERUELO", note: "Lugar de culto y peregrinación mística en el nordeste.", image: "https://lh3.googleusercontent.com/d/1UNukZnFAeMSoJYJEtf7hJYVoFZ5VDtYK", history: "Silencio. Un páramo inmenso y silencio. Eso es lo que se siente cuando llegas allí. Unas paredes que se mantienen orgullosas y desafiantes a pesar del sol, la lluvia y la nieve, el aire... Pero sobre todo el silencio. Uno piensa en que aquello en algún tiempo debió de ser un pueblo y cuesta entender lo inhóspito del lugar y lo lejano de cualquier otro punto habitado. Sobre todo en los tiempos, en que mulas y caballos eran lo más rápido para trasladarse." },
    { id: 182, name: "CASILLA DE PEÓN CAMINERO 8", category: "Historia", coords: "41°30'31.8\"N 3°42'50.6\"W", address: "HONRUBIA DE LA CUESTA", note: "Casa de servicio de carreteras del siglo XIX.", image:"https://lh3.googleusercontent.com/d/1UxUalvG6EkH9u-edBs_8bantU4gkZZCn", history: "La casilla de peones camineros número 8 en Honrubia de la Cuesta (Segovia) es una antigua vivienda de servicio situada en la autovía A-1 (Autovía del Norte), específicamente en el kilómetro 139. Esta edificación histórica se encuentra actualmente en estado ruinoso y formaba parte de la red de casillas construidas para los encargados del mantenimiento de carreteras. " },
    { id: 183, name: "MOLINO DE ARRIBA DE LOS REGUEROS", category: "Industrial", coords: "41°28'22.9\"N 3°47'11.0\"W", address: "ALDEANUEVA DE LA SERREZUELA", note: "Ingenio harinero en un entorno agreste.", image: "https://lh3.googleusercontent.com/d/17orqcqQbA1eo8t6-a9k2dyofrf0Z296Y", history: "Se trata de dos molinos próximos entre ellos que se localizan entorno al cauce del Arroyo de Serrezuela. Ubicados entorno a 1,5 km al N de la población, fueron construidos a lo largo del siglo XVIII y abandonados a mediados del XX. Actualmente se encuentran en un ruinas. No se ha podido acceder al interior pero las informaciones recogidas apuntan que en ninguno de los dos casos se conservan partes originales de la maquinaria de molienda." },
    { id: 184, name: "EL PAREDÓN DE SAN FÉLIX", category: "Ruinas", coords: "41°29'56.8\"N 3°46'43.0\"W", address: "ALDEHORNO", note: "Restos legendarios de un antiguo santuario medieval.", image: "https://lh3.googleusercontent.com/d/1XoZdBcB0ueBpyMdF5YrV7wxEcvaX5zIf", history: "El Paredón de San Félix es un grueso y curioso paredón de calicanto, hendido en el centro, como partido en su mitad por un rayo, vestigio de la existencia de un antiguo centro religioso. Según la tradición, dependía del Monasterio de Santa María la Real, de Sacramenia. Lo encontraremos sobre la margen derecha del arroyo de la Serrezuela, a un kilómetro y medio de distancia de Aldehorno y su aspecto coincidiría  un importante centro eremítico, focalizado en torno a un centro de culto  bajo la advocación de San Félix, y formado por numerosos habitáculos, la mayoría de los cuales se hallan cegados. Llama la atención el topónimo con el que se conoce al paraje situado enfrente de los habitáculos: La Abadía. Podría tratarse de un monasterio o cenobio, de donde pudo proceder un capitel localizado en el núcleo urbano. " },
    { id: 185, name: "LAGARES", category: "Industrial", coords: "41°30'57.1\"N 3°46'46.2\"W", address: "ALDEHORNO", note: "Prensas tradicionales para la elaboración del vino.", image: "https://lh3.googleusercontent.com/d/1-0DHlprXsTh92KGHpYkV7mX_esEwzOLz", history: "En 1919, la filoxera devastó los viñedos de Aldehorno, provocando una emigración masiva. Sin embargo, la creación de la Denominación de Origen Ribera del Duero impulsó la modernización y expansión de los viñedos. Hoy, Aldehorno cuenta con más de 200 hectáreas de viñedo, principalmente de la variedad tempranillo." },
    { id: 186, name: "ERMITA DEL SANTO CRISTO", category: "Historia", coords: "41°23'03.5\"N 3°55'39.8\"W", address: "COBOS DE FUENTIDUEÑA", note: "Lugar de devoción mística segoviana auténtica.", image: "https://lh3.googleusercontent.com/d/1k715IC7GRggdj_STDehqS9Ir7UMH3B1Q", history: "Se desconoce la antigüedad de esta ermita, que pudo incluso ser románica en origen. Las últimas noticias de ella son del siglo XIX, momento en que decayó. Se mantienen  aún en pie parte de sus muros en mampostería, sin sillares ya, reusados en otros edificios o desaparecidos. La nave, rectangular, y la apariencia sencilla hacen de la ruina un elemento casi prescindible, pero su porte imponente en su atalaya sobre el pueblo desmienten la primera impresión." },
    { id: 187, name: "CASTILLO", category: "Historia", coords: "41°32'36.1\"N 3°57'41.0\"W", address: "CUEVAS DE PROVANCO", note: "Fortaleza defensiva con vistas estratégicas al valle.", image: "https://lh3.googleusercontent.com/d/1wMyzDFRc4qK-5NHssypwlFyS2r_5oyRV", history: "En el municipio nace el río Botijas, afluente del Duero, cerca de Corrales de Valdeperniega y pasa por el lado oeste el pueblo. El pueblo está en la ladera de un cerro en cuya cima se encuentra la iglesia parroquial. Sus calles son estrechas y empinadas y algunas de sus casas todavía muestran un cierto aire medieval. Conserva los restos de un castillo. En arquitectura religiosa cuenta con dos ermitas, la de San Roque y la de San Adrián más la iglesia dedicada a la Vera Cruz o Invención de la Cruz." },
    { id: 188, name: "LAGARES", category: "Industrial", coords: "41°32'40.5\"N 3°57'39.7\"W", address: "CUEVAS DE PROVANCO", note: "Complejo de bodegas y prensas históricas.", image: "https://lh3.googleusercontent.com/d/1z3ITYeaqHa91hGQDai8KkMNTarAcSGyv", history: "Los lagares y bodegas subterráneas de Cuevas de Provanco (Segovia) forman parte de su arquitectura tradicional, reflejando su pasado vinícola con estructuras excavadas en la ladera. Aunque muchos lagares en la zona están en ruinas o abandonados, el municipio destaca por conservar bodegas de 25 a 100 metros de longitud." },
    { id: 189, name: "ERMITA DE SAN MIGUEL", category: "Historia", coords: "41°22'48.0\"N 3°59'37.4\"W", address: "FUENTE EL OLMO", note: "Capilla románica muy querida por la población.", image: "https://lh3.googleusercontent.com/d/1ynWOp3R2B1VFcvvvna-X3kwDXobOLDkh" , history: "De estilo románico. Funcionó como capilla del cementerio, aunque actualmente solo se conservan las ruinas del ábside. Se encuentra junto al cementerio, en dirección San Miguel de Bernuy, por la carretera sale un camino a la derecha. Le acompaña un vía crucis de piedra." },
    { id: 190, name: "MONASTERIO DE FRAILES", category: "Ruinas", coords: "41°25'30.1\"N 4°03'46.0\"W", address: "FUENTESAÚCO", note: "Restos monásticos rodeados de tierras de labor.", image: "https://lh3.googleusercontent.com/d/1hfLjWG1gOMskEz3ql-6_Tfa0iKMv5mTu" , history: "El antiguo monasterio de frailes en Fuentesaúco de Fuentidueña (Segovia) es un conjunto histórico que conserva su fachada, situado junto a la iglesia local. Construido en el siglo XVII, funcionó también como hospital para pobres y actualmente es una propiedad privada, destacando por su valor arquitectónico y leyendas sobre pasadizos." },
    { id: 191, name: "ERMITA DE SAN GREGORIO", category: "Historia", coords: "41°27'21.4\"N 3°55'10.0\"W", address: "FUENTESOTO", note: "Lugar místico de culto popular de origen románico.", image: "https://lh3.googleusercontent.com/d/1Dd24CtPXoxaWnWUzQghHtA5_IMaQbzH4", history: "Lugar que aún conserva restos románicos como la cabecera. Destacan las estelas que hay por el cementerio, también conserva elementos góticos como el arco apuntado del ábside. Anteriormente fue la antigua iglesia de Fuentesoto, aunque se convirtió en cementerio el s. XVIII. Esta se conoce con el nombre de la Torre. La ermita se reconstruyó en 2005 y tenía un carácter defensivo. Como se encuentra en la parte más alta del pueblo es un estupendo mirador." },
    { id: 192, name: "CONVENTO DE SAN JUAN", category: "Ruinas", coords: "41°26'58.1\"N 3°58'32.4\"W", address: "FUENTIDUEÑA", note: "Huellas de la espléndida vida religiosa del pasado.", image: "https://lh3.googleusercontent.com/d/1iW_ZHhS6wdiCv66OVIliQdD7-FKYMZfp", history: "El Convento Franciscano de San Juan de la Penitencia en Fuentidueña, Segovia, es una construcción histórica cuyos orígenes se remontan al siglo VI, aunque con modificaciones posteriores. Actualmente, gran parte de su estructura está en ruinas, destacando la conservación de elementos de interés arquitectónico, siendo la portada plateresca trasladada a Calabazas de Fuentidueña. " },
    { id: 193, name: "ERMITA DE LA SANTA CRUZ", category: "Historia", coords: "41°26'20.9\"N 3°56'52.8\"W", address: "FUENTIDUEÑA", note: "Santuario de gran encanto e historia milenaria.", image: "https://lh3.googleusercontent.com/d/1SIr0gbKhvp5dclA6_S5WsfIWGTQ3MG8E" , history: "A menos de tres kilómetros de la villa de Fuentidueña, en dirección al cerro de San Blas, divisaremos las ruinas de la Santa Cruz, en tiempos iglesia de una aldea del mismo nombre. La aldea de Santa Cruz tardó en despoblarse, y, como tantas otras, lo hizo, esta vez en el siglo XVIII." },
    { id: 194, name: "ERMITA DE VALCALBADO", category: "Historia", coords: "41°27'59.7\"N 3°58'25.8\"W", address: "VALTIENDAS", note: "Famosa ermita que da nombre al paraje místico.", image: "https://lh3.googleusercontent.com/d/1MMgdgrg1-4-mc7dHSCAI15p63ZZQT2At", history: "Erigida en plena soledad del páramo, es un faro espiritual en el extremo norte de la provincia. Su arquitectura humilde refleja la devoción rural sin artificios, y durante siglos fue el punto de encuentro de romeros y pastores que pedían protección para las viñas y campos de cereal de la dura meseta. Es un testimonio vivo del patrimonio románico menor." },
    { id: 195, name: "MOLINO DE LOS REYES", category: "Industrial", coords: "41°29'42.6\"N 3°58'08.3\"W", address: "SACRAMENIA", note: "Importante molinos del entorno cisterciense.", image: "https://lh3.googleusercontent.com/d/1a8As1NYkgQ6YktvI69AN_kS9f6THbjrz", history: "Ubicado a poca distancia de las ruinas cistercienses, este molino fue uno de los ingenios hidráulicos más rentables y productivos de la comarca. Controlado históricamente por la Iglesia, sus enormes muelas de piedra giraban día y noche aprovechando el abundante caudal del valle para garantizar el vital suministro de pan a monjes y campesinos." },
    { id: 196, name: "LAGARES", category: "Industrial", coords: "41°28'46.8\"N 3°54'47.0\"W", address: "VALTIENDAS", note: "Corazón de la cultura vitivinícola del norte.", history: "Estos arcaicos e impresionantes lagares rupestres excavados en la ladera representan la pura esencia de la viticultura en Valtiendas. A lo largo de la Edad Moderna, familias enteras pisaban la uva en sus gruesas pilas de piedra, extrayendo el preciado mosto que luego fermentaba en profundas e interminables galerías subterráneas, cimentando la reputación de sus robustos vinos." },
    { id: 197, name: "IGLESIA DE SANTIAGO", category: "Historia", coords: "41°24'02.1\"N 4°18'54.8\"W", address: "CUÉLLAR", note: "Ejemplo del impresionante arte mudéjar de Cuéllar.", image: "https://lh3.googleusercontent.com/d/1ZqVPbs19idpFWEM9mYxzrvxO0lV8K9Ch", history: "Considerada uno de los templos mudéjares más antiguos y sobresalientes de Cuéllar, esta iglesia combina su robusta mampostería con espectaculares arquerías ciegas de ladrillo. Sirvió no solo como centro de culto para su populoso barrio, sino también como imponente bastión defensivo de los arrabales durante las convulsas guerras civiles de la nobleza en la Baja Edad Media." },
    { id: 198, name: "MOLINO DE VIENTO EL CUBO", category: "Industrial", coords: "41°23'51.4\"N 4°19'05.9\"W", address: "CUÉLLAR", note: "Molino de viento restaurado que preside la loma.", image: "https://lh3.googleusercontent.com/d/1Gxa0IZYmcbnWi1Xz5xsZsPMIEgnjY11Y", history: "Desafiando los vientos de la extensa llanura pinariega, este imponente molino de viento cilíndrico es una rareza arquitectónica en una provincia dominada por molinos de agua. Restaurado recientemente, recuerda a los ingenios manchegos y atestigua el ingenio de los molineros locales para aprovechar cada racha de viento en épocas de sequía extrema." },
    { id: 199, name: "PUENTE DE BARRANCALES", category: "Historia", coords: "41°22'30.3\"N 4°22'00.0\"W", address: "CUÉLLAR", note: "Antiguo puente de piedra que cruza el río Cega.", image: "https://lh3.googleusercontent.com/d/1dA0qvbVU7DRWh2JYhOeFlYdg6DGuBuN2", history: "Estratégico y centenario puente de sillería que salvaba el caudaloso y traicionero río Cega. Fue un eslabón fundamental en la incesante ruta comercial entre la Tierra de Pinares y las ferias de Valladolid. Sus desgastados tajamares han resistido imponentes riadas históricas, y sus arcos han cobijado a incontables mercaderes y rebaños trashumantes." },
    { id: 200, name: "TORRE DE SANTA MARINA", category: "Historia", coords: "41°24'00.1\"N 4°18'50.6\"W", address: "CUÉLLAR", note: "Único resto visible de la antigua iglesia.", image: "https://lh3.googleusercontent.com/d/1Hbu19_Lj_Q4YPPAWlDJzDL1FpUD6xLBI", history: "La esbelta y solitaria torre de ladrillo de Santa Marina es el único superviviente de una otrora magnífica parroquia mudéjar asolada por el abandono. Su campanario, que antaño organizaba la jornada de artesanos y labriegos, se erige hoy como un silencioso y nostálgico faro de ladrillo en el perfil urbano de Cuéllar, evocando el inmenso esplendor religioso del pasado." },
    { id: 201, name: "PEGUERAS", category: "Industrial", coords: "41°20'04.5\"N 4°25'36.4\"W", address: "CHAÑE", note: "Antiguos hornos para la obtención de pez.", image: "https://lh3.googleusercontent.com/d/164wQq2hpcUlPBd1bQQz_wc5-0e4GEsRl", history: "Arqueología industrial en estado puro. Estos vetustos e impresionantes hornos semienterrados en la arena ('pegueras') se utilizaban para calcinar raíces de pino y extraer 'pez' (alquitrán). Esta brea era fundamental para impermeabilizar barcos, botas de vino y curar heridas del ganado, conformando una industria vital que complementaba a la resinera en el corazón de los inmensos pinares." },
    { id: 202, name: "MOLINO DEL BOTILLER", category: "Industrial", coords: "41°23'07.5\"N 4°16'55.2\"W", address: "ESCARABAJOSA", note: "Ingenio hidráulico muy relevante.", image: "https://lh3.googleusercontent.com/d/1GvgsROpFYhcAFvYA7jc2F1nzEI50PU8h", history: "Robusto y célebre molino situado en la fértil vega, que canalizaba hábilmente las aguas para accionar su pesada y costosa maquinaria. Las crónicas relatan que fue un centro neurálgico donde los labradores pagaban en especies ('la maquila') a cambio de la finísima harina que sustentaba económicamente a varias generaciones de familias molineras locales." },
    { id: 203, name: "TEJERAS DE LOS SERAFINES", category: "Industrial", coords: "41°18'05.7\"N 4°06'06.4\"W", address: "LASTRAS DE CUÉLLAR", note: "Centenarias instalaciones cerámicas ya en desuso.", image: "https://lh3.googleusercontent.com/d/11jT_F-pcbP3rLk1kf1RzvkbSbuI2eJav", history: "Excepcionales e inmensos hornos de leña donde los maestros tejeros, en jornadas extenuantes bajo el asfixiante sol estival, cocían miles de tejas y ladrillos. Esta materia prima rojiza y porosa, extraída de los prados circundantes, modeló la inconfundible y cálida arquitectura rural mudéjar de toda la comarca de Cuéllar." },
    { id: 204, name: "POCIEGUILLO", category: "Naturaleza", coords: "41°25'49.8\"N 4°15'48.7\"W", address: "LOVINGOS", note: "Lugar de agua y vida en el secano cuellarano.", image: "https://lh3.googleusercontent.com/d/1GBtU8jrJSFG1EMH1JauDrkYAhyghsQl8", history: "Un oasis diminuto, refrescante y fundamental en la sedienta inmensidad de los páramos cuellaranos. Este pequeño manantial y abrevadero ha sido parada obligatoria e insustituible para los inmensos rebaños de ovejas de la Mesta y para los exhaustos segadores durante siglos. En su entorno se han forjado incontables y misteriosas leyendas orales campesinas sobre duendes y encuentros nocturnos." },
    { id: 205, name: "FÁBRICA DE RESINAS", category: "Industrial", coords: "41°12'50.5\"N 4°14'59.9\"W", address: "NAVALMANZANO", note: "Patrimonio industrial vivo de la Tierra de Pinares.", image: "https://lh3.googleusercontent.com/d/1PRsVsFBDrSd8Cu2NdkyWeT7eWB9J9WrP", history: "El palpitante corazón industrial de Navalmanzano. Durante todo el siglo XX, esta enorme fábrica destiló incansablemente la miera recolectada por los rudos resineros de la comarca, produciendo aguarrás y colofonia a gran escala. Su imponente chimenea de ladrillo y el fuerte olor a pino impregnaron la vida de cientos de familias que dependieron directamente del 'oro líquido' segoviano." },
    { id: 206, name: "FÁBRICA BAUDILIO MESA", category: "Industrial", coords: "41°11'53.0\"N 4°26'09.6\"W", address: "NAVAS DE ORO", note: "Emblemática fábrica de la industria resinera.", image: "https://lh3.googleusercontent.com/d/1eFZgtDWFrrw-pPYMNaguNrefvC95XMOV",  history: "Otra 'catedral' de la resina. Esta gigantesca instalación fabril no solo modernizó la química forestal de Segovia introduciendo grandes alambiques y calderas de vapor, sino que también fue pionera en generar empleo estable. Sus propietarios, prohombres de la comarca, tejieron un imperio económico que exportaba las apreciadas resinas de Navas de Oro a los mercados internacionales de Europa." },
    { id: 207, name: "PALACIO DE BUEN GRADO", category: "Historia", coords: "41°22'51.1\"N 4°09'29.9\"W", address: "PEROSILLO", note: "Antigua residencia señorial de gran importancia.", image: "https://lh3.googleusercontent.com/d/167D1qZIgvIQQ9HW3XMg9aHokKsPlw2qM", history: "Este señorial caserón de imponente planta cuadrangular y soberbios blasones esculpidos en la dura cantería, fue el indiscutible centro del poder feudal y económico local. Sus vastas tierras de labranza y rebaños reportaron suculentas fortunas a los marqueses absentistas que, desde la Corte de Madrid, dictaban el futuro de las cientos de humildes familias arrendatarias que trabajaban de sol a sol en Perosillo." },
    { id: 208, name: "FÁBRICA DE HARINA", category: "Industrial", coords: "41°15'32.3\"N 4°25'09.2\"W", address: "SAMBOAL", note: "Complejo harinero representative de la zona mística.", image: "https://lh3.googleusercontent.com/d/1u4Ghyu5r4jCN8muxNX4iJpaz8_vyTdOp", history: "Ubicada en una comarca de profundas raíces mudéjares, esta inmensa y sólida fábrica de ladrillo cocido protagonizó la auténtica revolución tecnológica agraria. Sepultando a los románticos pero ineficientes molinos de arroyo, sus modernas y veloces turbinas permitieron moler trigo candeal a escala industrial, logrando dar salida a la colosal producción cerealista de toda la ribera del Pirón." },
    { id: 209, name: "FÁBRICAS ATILANO GILSANZ", category: "Industrial", coords: "41°19'28.3\"N 4°18'12.5\"W", address: "SANCHONUÑO", note: "Doble industria que modernizó el sector agrario.", history: "Atilano Gilsanz, emprendedor y visionario de la comarca, erigió este pujante complejo combinando hábilmente aserraderos madereros y molienda harinera. Estas instalaciones mecanizadas trajeron prosperidad, ruidosas poleas de hierro y jornales continuados a un pueblo eminentemente agrario, sentando las bases del dinámico tejido industrial que caracteriza hoy a Sanchonuño." },
    { id: 210, name: "APARTADERO DE TREN", category: "Industrial", coords: "41°13'32.3\"N 4°34'53.6\"W", address: "CIRUELOS DE COCA", note: "Estación mística de la Segovia NO Garleada.", image: "https://lh3.googleusercontent.com/d/19NBbdhEgqpD8UcbHBGunmeZTJsr5_DoB", history: "Humilde y hoy desolado apeadero ferroviario que conectó la inmensidad de Tierra de Pinares con los mercados estatales. Sus vías exportaron sin tregua miles de toneladas de madera y resina desde finales del siglo XIX. Hoy, el andén devorado por la maleza y las silenciadas traviesas son un poema de hierro y melancolía que evoca la pérdida de pulso del mundo rural tradicional." },
    { id: 211, name: "ESTACIÓN DE TREN", category: "Industrial", coords: "41°12'11.4\"N 4°32'33.7\"W", address: "COCA", note: "Punto de transporte vital para la villa ducal.", image: "https://lh3.googleusercontent.com/d/1NNRCr6E5UAaLSYyaENKSZqrCHk5KF6hL", history: "Importante y bulliciosa estación que prestó un servicio invaluable a la monumental villa de Coca y a los inmensos señoríos de la Casa de Alba. No solo transportó a pasajeros y soldados, sino que fue el principal punto de carga mercantil de los extensísimos bosques resineros locales. Su arquitectura de ladrillo visto es el mudo testimonio de los nostálgicos trenes de vapor que cruzaban la estepa." },
    { id: 212, name: "FÁBRICAS JUAN GARCÍA", category: "Industrial", coords: "41°09'38.1\"N 4°29'35.4\"W", address: "NAVA DE LA ASUNCIÓN", note: "Grandes instalaciones fabriles de relevancia provincial.", history: "Colosal complejo harinero y eléctrico impulsado a principios de siglo por la visión industrial de Juan García. Introduciendo motores modernos y líneas de transmisión, no solo revolucionó la molienda a gran escala del cereal, sino que alumbró, casi de manera milagrosa, con la primera luz eléctrica a todo el vecindario de La Nava, transformando la oscuridad de la villa en deslumbrante progreso." },
    { id: 213, name: "MOLINO DE LA PEÑA", category: "Industrial", coords: "41°16'28.7\"N 4°06'23.7\"W", address: "AGUILAFUENTE", note: "Molino de piedra que aprovechaba la energía del agua.", image: "https://lh3.googleusercontent.com/d/1AZr6naE5fnrBJaFn7jV8hj4phrdJffsJ", history: "Secreta y soberbia obra de recia cantería anclada firmemente en un paradisíaco paraje fluvial. Este molino de rodeznos aprovechaba la implacable corriente para mover sus colosales piedras volanderas. Históricamente envuelto en los típicos y costosos pleitos por los derechos de presas y aguajes entre los campesinos locales y el siempre ávido e insaciable Obispado de Segovia." },
    { id: 214, name: "MOLINO", category: "Industrial", coords: "41°07'36.7\"N 3°58'33.0\"W", address: "CABALLAR", note: "Ingenio harinero rural situado en un entorno pintoresco.", history: "Oculto en un barranco calcáreo de sobrecogedora belleza, este ingenio harinero fue durante incontables generaciones el epicentro social de Caballar. Sus dueños canalizaban con precisión las fuentes y manantiales sagrados locales (vinculados a la leyenda de San Valentín y Santa Engracia) para mantener operativa su maquinaria, proveyendo del indispensable pan a toda la comarca circundante." },
    { id: 215, name: "FORTINES DE CABEZA GRANDE", category: "Historia", coords: "40°52'11.2\"N 4°04'47.8\"W", address: "LA GRANJA", note: "Defensas militares místicas del siglo XX.", image: "https://lh3.googleusercontent.com/d/13P-9Wbe59eRc3mxiIXoSF5vYYfCjZAm0", history: "Asentados en una colina de inmensurable valor táctico que vigila el Palacio Real y la carretera de Segovia, estos crudos nidos de ametralladoras y fortines de hormigón armado fueron construidos durante la sangrienta Batalla de La Granja (1937) en la Guerra Civil Española. Hoy son impresionantes cicatrices bélicas en plena naturaleza, testimonios del atroz conflicto que asoló la sierra de Guadarrama." },
    { id: 216, name: "FÁBRICA DE LUZ SANTA ISABEL", category: "Industrial", coords: "40°53'13.9\"N 4°00'49.1\"W", address: "VALSAÍN", note: "Importante patrimonio industrial hidroeléctrico.", image: "https://lh3.googleusercontent.com/d/1c_-Yv_QE70m5_aNK3zVzL5MI4j2-OUPI", history: "Un prodigio pionero de la ingeniería hidroeléctrica en pleno bosque real. Acondicionando las vigorosas corrientes del río Eresma mediante presas y largos canales, esta ruidosa y fundamental fábrica de turbinas generó la milagrosa electricidad necesaria no solo para el aserradero de Valsaín, sino para dotar de lujosa luz a las propias fuentes, jardines y dependencias del Palacio de La Granja de San Ildefonso." },
    { id: 217, name: "FORTINES DEL CERRO DEL PUERCO", category: "Historia", coords: "40°52'24.1\"N 4°00'23.0\"W", address: "VALSAÍN", note: "Fortines militares místicas preservados entre los pinos.", image: "https://lh3.googleusercontent.com/d/118JaN1Y3kVnqThIZzmr-Np09dpbSHWIw", history: "Oculto bajo la umbría de los esbeltos y oscuros pinos de Valsaín, este extenso y laberíntico complejo de búnkeres de grueso hormigón, parapetos y estrechas trincheras excavadas en granito, fue el dramático epicentro de la cruenta ofensiva republicana sobre Segovia. Conservados en un estado sorprendentemente íntegro, son un escalofriante museo al aire libre que rinde tributo a la desolación de la guerra contemporánea en España." },
    { id: 218, name: "LAGUNAS DE CANTALEJO", category: "Naturaleza", coords: "41°16'32.0\"N 3°55'21.0\"W", address: "CANTALEJO", note: "Humedal de gran interés por su importancia ornitológica", image: "https://lh3.googleusercontent.com/d/1uODRDzelsfascBC9Oj6qmUWwl-m0fnci", mapUrl: "https://maps.app.goo.gl/mNFoKSuRUpNkH8Lm7", history: "Un verdadero y exótico milagro acuático en mitad del interminable páramo arenoso de la Tierra de Pinares. Este valiosísimo sistema de humedales dunares (navajos) se originó durante el Cuaternario. Es un paraíso biológico y ornitológico de primer nivel, cobijando de forma vital el paso y la nidificación de miles de aves migratorias, cigüeñas negras y anfibios amenazados. Un ecosistema puro e intocable, joya absoluta del patrimonio natural de toda Segovia." }
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
      <div id="ethno-modal" className="fixed inset-0 z-[4000] bg-[#fcfcfd] overflow-y-auto animate-fade-in">
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