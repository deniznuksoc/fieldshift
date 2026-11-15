(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const STORE_KEY = "fieldshift-farm-v1";
  const MONTH_KEYS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const MODIS_TILE_COLUMNS = 128;
  const MODIS_TILE_ROWS = 64;
  const MODIS_TILE_ZOOM = 6;
  const MODIS_TILE_SIZE = 5;
  const MODIS_TILE_HEIGHT = 2;
  const MONTH_NAMES = {
    tr: ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"],
    en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  };
  const DEMO_CLIMATE = {
    temperature: [0.2, 2.1, 6.7, 11.6, 16.3, 20.4, 23.5, 23.4, 18.8, 12.6, 6.2, 1.8],
    rainfall: [39, 32, 36, 44, 48, 34, 15, 10, 15, 30, 34, 47],
    firstYear: 2015,
    lastYear: 2024,
    source: "demo"
  };
  const CROPS = {
    durum: { tr: "Makarnalık buğday", en: "Durum wheat", water: 55, soil: 45, income: 73, heat: 61, drought: 56 },
    barley: { tr: "Arpa", en: "Barley", water: 71, soil: 57, income: 61, heat: 77, drought: 73 },
    chickpea: { tr: "Nohut", en: "Chickpea", water: 84, soil: 85, income: 63, heat: 82, drought: 86 },
    lentil: { tr: "Mercimek", en: "Lentil", water: 89, soil: 81, income: 57, heat: 78, drought: 85 },
    vetch: { tr: "Fiğ / örtü bitkisi", en: "Vetch / cover crop", water: 92, soil: 94, income: 35, heat: 53, drought: 69 },
    sunflower: { tr: "Ayçiçeği", en: "Sunflower", water: 47, soil: 50, income: 69, heat: 72, drought: 50 },
    fieldPea: { tr: "Yem bezelyesi", en: "Field pea", water: 74, soil: 87, income: 49, heat: 49, drought: 59 },
    oats: { tr: "Yulaf", en: "Oats", water: 61, soil: 61, income: 54, heat: 48, drought: 53 }
  };
  const CROP_FAMILY = {
    durum: "cereal", barley: "cereal", oats: "cereal", chickpea: "legume",
    lentil: "legume", vetch: "legume", fieldPea: "legume", sunflower: "oilseed"
  };
  const STRATEGIES = [
    { id: "water", icon: "i-water", name: { tr: "Su odaklı", en: "Water-wise" }, description: { tr: "Daha düşük su ihtiyacına sahip ürünleri, baklagil arasıyla dönüşümlü değerlendirir.", en: "Alternates lower water-demand crops with a pulse break." }, crops: ["barley", "chickpea", "lentil", "barley", "vetch"], rationale: { tr: "Kuraklığa toleranslı baklagiller, su önceliği yüksek bir başlangıç noktası sunar.", en: "Drought-tolerant pulses offer a starting point for high water-priority plans." } },
    { id: "soil", icon: "i-soil", name: { tr: "Toprak onarıcı", en: "Soil builder" }, description: { tr: "Baklagillerin ve kök çeşitliliğinin toprağa olası katkısını öne çıkarır.", en: "Puts potential pulse and root-diversity benefits first." }, crops: ["chickpea", "barley", "fieldPea", "durum", "vetch"], rationale: { tr: "Baklagil ve örtü bitkisi oranı görece yüksek; toprak analiziyle değerlendirin.", en: "A relatively higher share of pulses and cover crop; pair with a soil test." } },
    { id: "balanced", icon: "i-rotate", name: { tr: "Dengeli çeşitlilik", en: "Balanced diversity" }, description: { tr: "Ürün çeşitliliği, farklı gelir kaynakları ve mevsimsel seçenekleri dengeler.", en: "Balances crop diversity with a range of seasonal income options." }, crops: ["durum", "chickpea", "sunflower", "barley", "lentil"], rationale: { tr: "Farklı ürün türleri olası bir denge sunar; yerel pazar ve ekim takvimini hesaba katın.", en: "A mix of crop types offers a possible balance; consider local markets and planting dates." } }
  ];

  const TEXT = {
    en: {
      workspace: "FARM WORKSPACE", mainNavigation: "Main navigation", farmLocationAria: "Farm location", openFarmProfile: "Open farm profile", closeDialog: "Close dialog", navOverview: "Overview", navPlanner: "Rotation planner", navSoil: "Soil profile", navData: "Data & method",
      quote: "A small choice each season. Living soil for generations.", quoteSource: "RESILIENT FARMING, TOGETHER.", farmLocation: "Working farm",
      statusDemo: "Sample climate data", statusLoading: "Connecting · showing Konya sample", statusLive: "NASA POWER data · live", statusError: "NASA unavailable · Konya sample", sampleNotice: "Fixed illustrative values for the Konya area; NASA POWER will be requested when the app loads.",
      greeting: "FARM CLIMATE BRIEFING", welcomeLine1: "Your soil is changing.", welcomeLine2: "Your rotation can adapt.",
      welcomeCopy: "Bring NASA climate data together with your local soil knowledge. Explore more resilient rotations for your farm, season by season.",
      exploreStrategies: "Explore rotations", refreshData: "Refresh NASA data", earthObservations: "EARTH OBSERVATIONS, LOCAL ACTION",
      locationLabel: "FARM LOCATION", locationDescription: "Climate context is based on your selected coordinates.", changeLocation: "Change location",
      localSnapshot: "LOCAL SNAPSHOT", weatherHeading: "A pulse check for your farm", periodNote: "Monthly climate summary · last 10 years",
      rainfallMetric: "AVERAGE ANNUAL RAINFALL", temperatureMetric: "AVERAGE ANNUAL TEMPERATURE", dryMetric: "DRY-SEASON INDICATOR",
      monthsSuffix: "mo", dataLoading: "Loading location profile", rainClimateNote: "long-term monthly average", heatClimateNote: "long-term monthly average", dryClimateNote: "months with less than 20 mm of rain",
      lowRainNote: "comparatively low annual rainfall", highRainNote: "comparatively higher annual rainfall", mildHeatNote: "annual temperature average", warmHeatNote: "annual temperature average", drySeasonNote: "relatively dry months", wetSeasonNote: "relatively dry months",
      farmLocationEyebrow: "FARM LOCATION", fieldContext: "Your farm's environmental context", clickMap: "Select on map",
      mapViewAria: "Map view", schematicViewAria: "Schematic map", satelliteViewAria: "NASA satellite imagery",
      schematicView: "Map", satelliteView: "Satellite",
      mapDisclaimer: "Schematic world view; click the map to set coordinates.",
      mapSatelliteDisclaimer: "NASA MODIS Terra true-color imagery is visual context only; it does not measure crop health or field boundaries. Click to set coordinates.",
      modisMapAria: "NASA MODIS Terra true-color satellite imagery around {name}; image date {date}.",
      modisLoading: "Loading NASA MODIS Terra imagery · {date}…",
      modisReady: "NASA MODIS Terra · image date {date}",
      modisPartial: "NASA MODIS image {date} · {failed} of {total} tiles unavailable",
      modisError: "NASA MODIS imagery for {date} is unavailable. Check your connection.",
      satelliteSource: "SATELLITE IMAGERY",
      modisDescription: "MODIS Terra True Color image tiles for the selected map area are loaded through NASA GIBS. They provide visual context only; they are not crop-health or field-boundary analysis and do not feed rotation scores.",
      dailySatelliteTiles: "Daily image tiles",
      satelliteLimitsTitle: "Imagery is not a measurement",
      satelliteLimitsCopy: "MODIS True Color provides visual context only; clouds may obscure the surface, and it does not measure crop health, soil moisture or field boundaries. It is not used in rotation scores.",
      enterCoordinates: "Enter coordinates",
      climatePattern: "CLIMATE PATTERN", seasonalRainfall: "Seasonal rainfall pattern", averageRain: "Average monthly rainfall",
      insightPlaceholder: "A location-based rainfall pattern will appear here.", insightText: "Rainfall peaks in {wet} and is lowest in {dry}. Use the pattern as context when comparing rotations — not as a seasonal forecast.",
      ctaTitle: "Plan the coming season with intention.", ctaCopy: "Compare rotations against your priorities. The final choice is yours.", buildRotation: "Build a rotation",
      methodFootnote: "Regional climate indicators are not parcel-level measurements or yield predictions.",
      plannerEyebrow: "EXPLORE, DON'T PREDICT", plannerTitle: "Rotation planner", plannerDescription: "Compare three approaches against your climate context and priorities. These are starting points; your local experience leads.",
      planningFor: "PLANNING LOCATION", planningHorizon: "PLANNING HORIZON", threeSeasons: "3 seasons", fourSeasons: "4 seasons", fiveSeasons: "5 seasons", exportPlan: "Export plan",
      yourPriorities: "YOUR PRIORITIES", weightPriorities: "What matters to you", priorityHint: "Adjust the weights to re-rank scenarios.",
      waterPriority: "Water conservation", soilPriority: "Soil health", stabilityPriority: "Income stability",
      rotationScenarios: "ROTATION SCENARIOS", compareStrategies: "Compare approaches", weightedForYou: "Ranked for your priorities",
      recommended: "Best fit for your priorities", yearLabel: "Season {n}", waterMetric: "Water fit", soilMetric: "Soil potential", incomeMetric: "Income mix",
      plannerDisclaimer: "<strong>These are not yield forecasts.</strong> Scenario scores are heuristic comparisons of general crop traits weighted by your priorities. They are not a validated agronomic model. A local agronomist and soil test can offer advice tailored to your field.",
      nextStepSoil: "Complete your soil profile", nextStepSoilCopy: "Add local observations to your plans.", editProfile: "Edit profile",
      yourField: "YOUR FIELD, YOUR KNOWLEDGE", soilTitle: "Get to know your soil", soilDescription: "This profile is not a laboratory analysis. Add what you know to give your rotation scenarios local context.",
      fieldProfile: "FIELD PROFILE", whatYouKnow: "What you know about your field", autoSaved: "Saved on this device",
      soilTexture: "Soil texture", textureUnknown: "Not sure yet", textureSandy: "Sandy", textureLoamy: "Loamy", textureClay: "Clay", textureSilty: "Silty",
      soilTextureHelp: "Check a nearby soil test or ask your local agricultural adviser.", organicMatter: "Organic matter observation",
      matterUnknown: "Not measured yet", matterLow: "Low — soil looks depleted", matterMedium: "Medium — room to improve", matterHigh: "High — dark, lively topsoil",
      matterHelp: "Visual observations are approximate; this is not a laboratory measurement.",
      irrigationAccess: "Irrigation access", noIrrigation: "No irrigation / rain-fed", limitedIrrigation: "Limited irrigation", reliableIrrigation: "Reliable irrigation",
      irrigationHelp: "Irrigation access may influence crop and water priorities.",
      currentCrop: "Most recent crop", cropCereal: "Cereal (wheat, barley, etc.)", cropLegume: "Pulse (chickpea, lentil, etc.)",
      cropOilseed: "Oilseed (sunflower, etc.)", cropOther: "Other / not sure", fieldNotes: "Notes about your field",
      optional: "— optional", notesPlaceholder: "e.g. Late spring frost is common; the northern field has erosion…", notesPrivacy: "Notes stay in this browser on this device.",
      livingSystems: "LIVING SYSTEMS", soilCareTitle: "Soil is a living partner.", soilCareCopy: "Pulses, cover crops and diverse root systems may contribute to soil cycles. Their effects depend on climate, soil and management.",
      profileUseTitle: "How is this profile used?", profileUseCopy: "Soil texture, an organic-matter observation, irrigation access and your previous crop add context to heuristic comparisons. None are satellite data or a soil test.", viewScenarios: "View scenarios",
      openEarthData: "OPEN EARTH DATA", dataTitle: "Data, method & limits",
      dataDescription: "Helpful decision support is clear about what it knows — and what it doesn't. FieldShift makes that distinction visible.",
      primarySource: "PRIMARY DATA SOURCE",
      powerDescription: "NASA Langley's POWER API provides historical monthly summaries of agrometeorological parameters at selected coordinates. This app requests temperature and corrected precipitation directly from NASA POWER. These meteorological fields are based on MERRA-2 reanalysis, not a sensor at the farm.",
      methodAndBoundaries: "METHOD & BOUNDARIES", whatThisMeans: "What does this mean for your decision?",
      regionalCoverage: "Regional climate, not field measurements", regionalCopy: "NASA POWER provides gridded climate data. It cannot precisely represent microclimates, field sensors or rainfall at your particular farm.",
      historicalNotForecast: "Historical context, not a forecast", historicalCopy: "Past monthly data summarize climate patterns. This tool does not forecast next season's weather, project future climate or predict yields.",
      transparentScores: "Heuristic scores", scoreCopy: "Rotation comparisons combine general crop traits with your priorities. They are not a validated agronomic model or a substitute for expert advice.",
      complementaryDatasets: "COMPLEMENTARY NASA DATA", moreDataTitle: "Earth observation sources to explore",
      moreDataCopy: "These sources are not live-connected in this prototype.",
      smapNote: "Satellite soil-moisture observations · integration not yet available", gpmNote: "Global precipitation measurements · integration not yet available",
      landsatNote: "Land and vegetation observations · not connected in this prototype",
      sourceFootnote: "Sources open in a new tab. Use of the NASA name does not imply NASA endorses this application.",
      footerCredit: "FARMER KNOWLEDGE + NASA EARTH OBSERVATIONS", footerMethods: "Data & methods",
      locationDialogTitle: "Find your farm", locationDialogCopy: "Search for a place or enter coordinates directly. Your location is saved on this device.",
      searchPlace: "SEARCH A PLACE", placePlaceholder: "e.g. Konya, Turkey", latitude: "LATITUDE", longitude: "LONGITUDE",
      farmName: "FARM / PLACE NAME", farmNamePlaceholder: "Konya, Turkey", saveLocation: "Use this location",
      privacyNote: "Place search uses OpenStreetMap Nominatim. Coordinates go to NASA POWER for climate data and, when satellite view is selected, NASA GIBS for map tiles.",
      searching: "Searching OpenStreetMap…", searchError: "Could not find that place. Try a more specific name or enter coordinates.", searchNoResults: "No places found. Try a nearby city or enter coordinates.",
      powerError: "NASA POWER is not reachable right now. Showing clearly labeled example data; try again later.", powerLoading: "Requesting NASA POWER data for this location…",
      invalidCoordinates: "Please enter a valid latitude (−90 to 90) and longitude (−180 to 180).",
      locationSaved: "Farm location updated. Refreshing climate context…", dataUpdated: "NASA POWER data loaded for {place}.",
      profileSaved: "Soil profile saved on this device.", csvDownloaded: "Rotation plan exported as a CSV file.",
      refreshFailed: "Could not load NASA POWER data. Check your connection and try again.",
      fetchNotice: "NASA POWER data is unavailable. The fixed Konya-area example is clearly labeled until a connection succeeds.",
      noRainfall: "Precipitation data was not returned for this location. Example values are shown instead.",
      searchRateLimit: "Place search is temporarily limited. You can enter coordinates directly.",
      cropDisclaimer: "Indicative crop sequence only — confirm planting windows and local suitability with an agricultural adviser.",
      noRotationData: "No rotation scenarios are available.",
      textureEffect: "Soil type selected: {texture}. Use a local test to refine this profile."
    },
    tr: {
      workspace: "TARLA ÇALIŞMA ALANI", mainNavigation: "Ana gezinme", farmLocationAria: "Tarla konumu", openFarmProfile: "Tarla profilini aç", closeDialog: "Pencereyi kapat", navOverview: "Genel bakış", navPlanner: "Rotasyon planlayıcı", navSoil: "Toprak profili", navData: "Veri ve yöntem",
      quote: "Her sezon küçük bir seçim. Nesiller boyu yaşayan bir toprak.", quoteSource: "DAYANIKLI TARIM, BİRLİKTE.", farmLocation: "Çalışma alanı",
      statusDemo: "Örnek iklim verisi", statusLoading: "Bağlanıyor · Konya örneği gösteriliyor", statusLive: "NASA POWER verisi · canlı", statusError: "NASA'ya ulaşılamıyor · Konya örneği", sampleNotice: "Konya bölgesi için sabit örnek değerler; uygulama açıldığında NASA POWER'dan veri istenir.",
      greeting: "TARLA İKLİM ÖZETİ", welcomeLine1: "Toprağınız değişiyor.", welcomeLine2: "Rotanız uyum sağlayabilir.",
      welcomeCopy: "NASA iklim verilerini yerel toprak bilginizle birleştirin. Tarlanız için mevsim mevsim daha dayanıklı rotasyonları keşfedin.",
      exploreStrategies: "Rotasyonları keşfet", refreshData: "NASA verisini yenile", earthObservations: "DÜNYA GÖZLEMLERİ, YEREL EYLEM",
      locationLabel: "TARLA KONUMU", locationDescription: "İklim profili seçili koordinata göre oluşturulur.", changeLocation: "Konumu değiştir",
      localSnapshot: "YEREL ÖZET", weatherHeading: "Tarlanızın iklim nabzı", periodNote: "Aylık iklim özeti · son 10 yıl",
      rainfallMetric: "YILLIK YAĞIŞ ORTALAMASI", temperatureMetric: "YILLIK ORTALAMA SICAKLIK", dryMetric: "KURU DÖNEM GÖSTERGESİ",
      monthsSuffix: "ay", dataLoading: "Konum profili yükleniyor", rainClimateNote: "uzun dönem aylık ortalama", heatClimateNote: "uzun dönem aylık ortalama", dryClimateNote: "ayda 20 mm'den az yağış",
      lowRainNote: "görece düşük yıllık yağış", highRainNote: "görece yüksek yıllık yağış", mildHeatNote: "yıllık sıcaklık ortalaması", warmHeatNote: "yıllık sıcaklık ortalaması", drySeasonNote: "görece kurak ay", wetSeasonNote: "görece kurak ay",
      farmLocationEyebrow: "TARLA KONUMU", fieldContext: "Tarlanızın çevresel bağlamı", clickMap: "Haritada seçin",
      mapViewAria: "Harita görünümü", schematicViewAria: "Şematik harita", satelliteViewAria: "NASA uydu görüntüsü",
      schematicView: "Harita", satelliteView: "Uydu",
      mapDisclaimer: "Dünya görünümü şematiktir; haritaya tıklayarak koordinat seçin.",
      mapSatelliteDisclaimer: "NASA MODIS Terra gerçek renkli görüntüsü yalnızca görsel bağlam sağlar; ürün sağlığını veya tarla sınırını ölçmez. Koordinat seçmek için tıklayın.",
      modisMapAria: "{name} çevresinde NASA MODIS Terra gerçek renkli uydu görüntüsü; görüntü tarihi {date}.",
      modisLoading: "NASA MODIS Terra görüntüsü yükleniyor · {date}…",
      modisReady: "NASA MODIS Terra · görüntü tarihi {date}",
      modisPartial: "NASA MODIS görüntüsü {date} · {total} kutucuktan {failed} tanesi yüklenemedi",
      modisError: "{date} tarihli NASA MODIS görüntüsü yüklenemedi. Bağlantınızı kontrol edin.",
      satelliteSource: "UYDU GÖRÜNTÜSÜ",
      modisDescription: "Seçili harita alanının MODIS Terra True Color görüntü kutucukları NASA GIBS üzerinden yüklenir. Yalnızca görsel bağlam sağlar; ürün sağlığı veya tarla sınırı analizi değildir ve rotasyon puanlarına girdi oluşturmaz.",
      dailySatelliteTiles: "Günlük görüntü kutucukları",
      satelliteLimitsTitle: "Görüntü, ölçüm değildir",
      satelliteLimitsCopy: "MODIS True Color yalnızca görsel bağlam sağlar; bulutlar yeryüzünü örtebilir ve görüntü ürün sağlığını, toprak nemini veya tarla sınırını ölçmez. Rotasyon puanlarında kullanılmaz.",
      enterCoordinates: "Koordinat gir",
      climatePattern: "İKLİM ÖRÜNTÜSÜ", seasonalRainfall: "Mevsimsel yağış örüntüsü", averageRain: "Ortalama aylık yağış",
      insightPlaceholder: "Konumunuza göre yağış örüntüsü burada gösterilir.", insightText: "Yağış en çok {wet} ayında, en az {dry} ayında görülüyor. Rotasyonları karşılaştırırken bu örüntüyü iklim bağlamı olarak kullanın — sezonluk tahmin olarak değil.",
      ctaTitle: "Gelecek sezonu bilinçle planlayın.", ctaCopy: "Rotasyonları önceliklerinize göre karşılaştırın; son karar sizin.", buildRotation: "Rotasyon oluştur",
      methodFootnote: "Bölgesel iklim göstergeleri parsel ölçümü veya verim tahmini değildir.",
      plannerEyebrow: "KEŞFEDİN, TAHMİN DEĞİL", plannerTitle: "Rotasyon planlayıcı", plannerDescription: "İklim koşullarınız ve önceliklerinize göre üç farklı yaklaşımı karşılaştırın. Öneriler başlangıç noktasıdır; yerel deneyiminiz yol gösterir.",
      planningFor: "PLANLAMA KONUMU", planningHorizon: "PLANLAMA UFUKU", threeSeasons: "3 sezon", fourSeasons: "4 sezon", fiveSeasons: "5 sezon", exportPlan: "Planı dışa aktar",
      yourPriorities: "ÖNCELİKLERİNİZ", weightPriorities: "Sizin için önemli olanlar", priorityHint: "Ağırlıkları değiştirin; senaryolar yeniden sıralansın.",
      waterPriority: "Su tasarrufu", soilPriority: "Toprak sağlığı", stabilityPriority: "Gelir istikrarı",
      rotationScenarios: "ROTASYON SENARYOLARI", compareStrategies: "Yaklaşımları karşılaştırın", weightedForYou: "Önceliklerinize göre sıralandı",
      recommended: "Önceliklerinize en uygun", yearLabel: "{n}. sezon", waterMetric: "Su uyumu", soilMetric: "Toprak potansiyeli", incomeMetric: "Gelir dengesi",
      plannerDisclaimer: "<strong>Verim tahmini değildir.</strong> Senaryo puanları, seçtiğiniz önceliklere göre ağırlıklandırılmış genel ürün özelliklerinin sezgisel karşılaştırmalarıdır. Doğrulanmış bir agronomik model değildir. Yerel ziraat uzmanı ve toprak analizi tarlanıza özel bilgi sağlayabilir.",
      nextStepSoil: "Toprak profilinizi tamamlayın", nextStepSoilCopy: "Planlarınıza yerel gözlemlerinizi ekleyin.", editProfile: "Profili düzenle",
      yourField: "TARLANIZ, BİLGİNİZ", soilTitle: "Toprağınızı tanıyın", soilDescription: "Bu profil laboratuvar analizinin yerini tutmaz. Bildiklerinizi ekleyerek rotasyon senaryolarına yerel bağlam katın.",
      fieldProfile: "TARLA PROFİLİ", whatYouKnow: "Tarlanız hakkında bildikleriniz", autoSaved: "Bu cihaza kaydedilir",
      soilTexture: "Toprak dokusu", textureUnknown: "Henüz bilmiyorum", textureSandy: "Kumlu", textureLoamy: "Tınlı", textureClay: "Killi", textureSilty: "Siltli",
      soilTextureHelp: "Yakınınızdaki analiz veya tarımsal danışmanlık bilgilerine bakabilirsiniz.", organicMatter: "Organik madde gözlemi",
      matterUnknown: "Henüz ölçülmedi", matterLow: "Düşük — toprak yorulmuş görünüyor", matterMedium: "Orta — iyileştirme alanı var", matterHigh: "Yüksek — koyu, canlı üst toprak",
      matterHelp: "Görsel gözlem yaklaşık bir göstergedir; laboratuvar ölçümü değildir.",
      irrigationAccess: "Sulama erişimi", noIrrigation: "Sulama yok / kuru tarım", limitedIrrigation: "Sınırlı sulama", reliableIrrigation: "Düzenli sulama",
      irrigationHelp: "Sulama durumu, ürün tercihini ve su önceliğini etkileyebilir.",
      currentCrop: "Son ekilen ürün", cropCereal: "Tahıl (buğday, arpa vb.)", cropLegume: "Baklagil (nohut, mercimek vb.)",
      cropOilseed: "Yağlı tohum (ayçiçeği vb.)", cropOther: "Diğer / bilinmiyor", fieldNotes: "Tarlanız için notlar",
      optional: "— isteğe bağlı", notesPlaceholder: "Örneğin: İlkbaharda geç don görülüyor, kuzey parselde erozyon var…", notesPrivacy: "Notlar yalnızca bu tarayıcıda saklanır.",
      livingSystems: "CANLI SİSTEMLER", soilCareTitle: "Toprak, yaşayan bir ortak.", soilCareCopy: "Baklagiller, örtü bitkileri ve farklı kök yapıları toprağın döngüsüne katkı sunabilir. Etki; iklim, toprak ve yönetimle değişir.",
      profileUseTitle: "Bu profil nasıl kullanılır?", profileUseCopy: "Toprak dokusu, organik madde gözlemi, sulama erişimi ve son ekilen ürün sezgisel karşılaştırmalara yerel bağlam katar. Bunların hiçbiri uydu verisi ya da toprak analizi değildir.", viewScenarios: "Senaryoları gör",
      openEarthData: "AÇIK DÜNYA VERİLERİ", dataTitle: "Veri, yöntem ve sınırlar",
      dataDescription: "Yararlı karar desteği ne bildiğini ve ne bilmediğini açıkça söyler. FieldShift bu ayrımı görünür kılar.",
      primarySource: "BİRİNCİL VERİ KAYNAĞI",
      powerDescription: "NASA Langley POWER API, seçilen koordinatlar için tarımsal meteoroloji parametrelerinin aylık tarihsel özetlerini sağlar. Bu uygulama sıcaklık ve düzeltilmiş yağış verilerini doğrudan NASA POWER'dan ister. Bu meteoroloji alanları, tarladaki bir sensör ölçümü değil MERRA-2 yeniden analizine dayanır.",
      methodAndBoundaries: "YÖNTEM VE SINIRLAR", whatThisMeans: "Bu, kararınız için ne anlama gelir?",
      regionalCoverage: "Bölgesel iklim, parsel ölçümü değil", regionalCopy: "NASA POWER ızgara tabanlı iklim verisi sağlar. Mikroiklimi, tarla sensörlerini veya belirli tarladaki yağışı kusursuz biçimde temsil edemez.",
      historicalNotForecast: "Tarihsel bağlam, gelecek tahmini değil", historicalCopy: "Geçmiş aylık veriler iklim örüntülerini özetler. Gelecek sezon hava tahmini, iklim projeksiyonu veya ürün verimi öngörüsü sunulmaz.",
      transparentScores: "Puanlar sezgiseldir", scoreCopy: "Rotasyon karşılaştırmaları genel ürün özellikleri ile önceliklerinizi bir araya getirir; doğrulanmış bir agronomik model veya uzman tavsiyesi değildir.",
      complementaryDatasets: "TAMAMLAYICI NASA VERİLERİ", moreDataTitle: "Genişleyebilecek Dünya gözlemi kaynakları",
      moreDataCopy: "Bu veri kümeleri prototipte canlı bağlı değildir.",
      smapNote: "Uydu tabanlı toprak nemi gözlemleri · bu prototipe bağlı değil", gpmNote: "Küresel yağış ölçümleri · bu prototipe bağlı değil",
      landsatNote: "Arazi ve bitki gözlemleri · bu prototipe bağlı değil",
      sourceFootnote: "Kaynaklar yeni sekmede açılır. NASA adının kullanımı NASA'nın bu uygulamayı onayladığı anlamına gelmez.",
      footerCredit: "ÇİFTÇİ BİLGİSİ + NASA DÜNYA GÖZLEMLERİ", footerMethods: "Veri ve yöntem",
      locationDialogTitle: "Tarlanızı bulun", locationDialogCopy: "Bir yer arayın ya da koordinatları doğrudan girin. Konumunuz bu cihaza kaydedilir.",
      searchPlace: "YER ARA", placePlaceholder: "Örn. Konya, Türkiye", latitude: "ENLEM", longitude: "BOYLAM",
      farmName: "TARLA / KONUM ADI", farmNamePlaceholder: "Konya, Türkiye", saveLocation: "Konumu uygula",
      privacyNote: "Yer araması OpenStreetMap Nominatim ile yapılır. Koordinatlar iklim verisi için NASA POWER'a; uydu görünümü seçildiğinde harita kutucukları için NASA GIBS'e gönderilir.",
      searching: "OpenStreetMap'te aranıyor…", searchError: "Yer bulunamadı. Daha belirgin bir ad deneyin veya koordinatları girin.", searchNoResults: "Yer bulunamadı. Yakındaki bir şehri deneyin veya koordinatları girin.",
      powerError: "NASA POWER'a şu anda ulaşılamıyor. Örnek veri açıkça etiketlendi; daha sonra tekrar deneyin.", powerLoading: "Bu konum için NASA POWER verisi isteniyor…",
      invalidCoordinates: "Geçerli bir enlem (−90 ile 90) ve boylam (−180 ile 180) girin.",
      locationSaved: "Tarla konumu güncellendi. İklim bağlamı yenileniyor…", dataUpdated: "{place} için NASA POWER verisi yüklendi.",
      profileSaved: "Toprak profili bu cihaza kaydedildi.", csvDownloaded: "Rotasyon planı CSV olarak dışa aktarıldı.",
      refreshFailed: "NASA POWER verileri yüklenemedi. Bağlantınızı kontrol edip tekrar deneyin.",
      fetchNotice: "NASA POWER verisine şu anda ulaşılamıyor. Bağlantı sağlanana dek Konya bölgesi için sabit örnek değerler gösterilir.",
      noRainfall: "Bu konum için yağış verisi dönmedi. Bunun yerine örnek değerler gösteriliyor.",
      searchRateLimit: "Yer araması geçici olarak kısıtlandı. Koordinatları doğrudan girebilirsiniz.",
      cropDisclaimer: "Yalnızca örnek ürün sıralaması — ekim takvimini ve yerel uygunluğu tarım uzmanıyla doğrulayın.",
      noRotationData: "Rotasyon senaryosu bulunmuyor.",
      textureEffect: "Seçilen toprak dokusu: {texture}. Profili geliştirmek için yerel analiz kullanın."
    }
  };

  const initialFarm = { latitude: 37.87, longitude: 32.48, name: "Konya, Türkiye", soil: "unknown", organicMatter: "unknown", irrigation: "none", currentCrop: "cereal", notes: "", weights: { water: 70, soil: 80, income: 50 }, seasons: 3 };
  let savedState = readStore();
  let farm = { ...initialFarm, ...(savedState && savedState.farm ? savedState.farm : {}) };
  farm.weights = { ...initialFarm.weights, ...(farm.weights || {}) };
  let language = savedState && savedState.language === "en" ? "en" : "tr";
  let climate = { ...DEMO_CLIMATE, temperature: [...DEMO_CLIMATE.temperature], rainfall: [...DEMO_CLIMATE.rainfall] };
  let powerRequest = null;
  let searchTimer = null;
  let toastTimer = null;
  let currentPage = "overview";
  let currentMapView = "world";
  let satelliteDate = "";
  let satelliteRequestKey = "";
  let satelliteLoadState = "idle";
  let satelliteGeneration = 0;
  let satelliteTileStats = { loaded: 0, failed: 0, total: MODIS_TILE_SIZE * MODIS_TILE_HEIGHT };
  let satelliteBounds = null;

  function readStore() {
    try {
      const value = localStorage.getItem(STORE_KEY);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.warn("FieldShift could not read saved preferences from this browser.", error);
      return null;
    }
  }

  function saveStore() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ farm, language }));
      return true;
    } catch (error) {
      console.error("FieldShift could not save preferences to this browser.", error);
      notify(language === "tr" ? "Bu tarayıcı ayarları kaydedemedi; depolama alanı kullanılamıyor." : "This browser could not save your settings; local storage is unavailable.");
      return false;
    }
  }

  function t(key, values = {}) {
    const dict = TEXT[language];
    let value = dict[key] || TEXT.en[key] || key;
    for (const [name, replacement] of Object.entries(values)) value = value.replaceAll(`{${name}}`, replacement);
    return value;
  }

  function applyLanguage() {
    document.documentElement.lang = language;
    $$("[data-i18n]").forEach((element) => {
      const translation = t(element.dataset.i18n);
      if (translation.includes("<strong>")) element.innerHTML = translation;
      else element.textContent = translation;
    });
    $$("[data-aria-i18n]").forEach((element) => {
      element.setAttribute("aria-label", t(element.dataset.ariaI18n));
    });
    $$("[data-i18n-placeholder]").forEach((element) => {
      element.placeholder = t(element.dataset.i18nPlaceholder);
    });
    $("#language-button").textContent = language === "tr" ? "EN" : "TR";
    $("#language-button").setAttribute("aria-label", language === "tr" ? "Switch to English" : "Türkçe'ye geç");
    $("#page-title").textContent = t(`nav${currentPage[0].toUpperCase()}${currentPage.slice(1)}`);
    const locale = language === "tr" ? "tr-TR" : "en-US";
    $("#today-date").textContent = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(new Date());
    document.title = language === "tr" ? "FieldShift — Tarlan için iklim dayanıklılığı" : "FieldShift — Climate resilience for your farm";
    updateStatus();
    renderAll();
    updateMapViewUI();
  }

  function saveFarm() {
    saveStore();
    updateLocationLabels();
    renderScenarios();
    renderMap();
  }

  function notify(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("visible"), 3900);
  }

  function localizeLocation(latitude = farm.latitude, longitude = farm.longitude) {
    return `${Math.abs(latitude).toFixed(2)}° ${latitude < 0 ? (language === "tr" ? "G" : "S") : (language === "tr" ? "K" : "N")}, ${Math.abs(longitude).toFixed(2)}° ${longitude < 0 ? "W" : "E"}`;
  }

  function updateLocationLabels() {
    $("#farm-title").textContent = farm.name;
    $("#sidebar-location").textContent = farm.name;
    $("#planner-location").textContent = farm.name;
    $("#coordinate-label").textContent = localizeLocation();
    $("#map-place-name").textContent = `${farm.name} · ${language === "tr" ? "çalışma alanı" : "farm location"}`;
    $("#satellite-location-name").textContent = farm.name;
    $("#latitude-input").value = Number(farm.latitude).toFixed(4);
    $("#longitude-input").value = Number(farm.longitude).toFixed(4);
    $("#location-name").value = farm.name;
    $("#soil-texture").value = farm.soil;
    $("#organic-matter").value = farm.organicMatter;
    $("#irrigation").value = farm.irrigation;
    $("#current-crop").value = farm.currentCrop;
    $("#farmer-note").value = farm.notes;
    $("#planning-season").value = String(farm.seasons);
    for (const category of ["water", "soil", "income"]) {
      const slider = $(`#${category}-weight`);
      slider.value = String(farm.weights[category]);
      $(`#${category}-weight-value`).textContent = `${farm.weights[category]}%`;
    }
  }

  function updateStatus(error = false, loading = false) {
    const status = $("#data-status");
    const label = $("#status-label");
    status.classList.toggle("status-is-error", error);
    status.querySelector(".status-dot").classList.toggle("status-live", climate.source === "nasa" && !loading);
    label.textContent = loading ? t("statusLoading") : climate.source === "nasa" ? t("statusLive") : error ? t("statusError") : t("statusDemo");
    const message = loading ? t("powerLoading") : climate.source === "nasa" ? t("dataUpdated", { place: farm.name }) : error ? t("fetchNotice") : t("sampleNotice");
    status.title = message;
    status.setAttribute("aria-label", message);
  }

  function renderAll() {
    updateLocationLabels();
    renderClimate();
    renderMap();
    renderScenarios();
  }

  function updateClimateSummary() {
    const avgRain = climate.rainfall.reduce((sum, value) => sum + value, 0);
    const avgTemp = climate.temperature.reduce((sum, value) => sum + value, 0) / climate.temperature.length;
    const dryMonths = climate.rainfall.filter((value) => value < 20).length;
    const wetIndex = climate.rainfall.indexOf(Math.max(...climate.rainfall));
    const dryIndex = climate.rainfall.indexOf(Math.min(...climate.rainfall));
    return { avgRain, avgTemp, dryMonths, wetIndex, dryIndex };
  }

  function renderClimate() {
    const { avgRain, avgTemp, dryMonths, wetIndex, dryIndex } = updateClimateSummary();
    $("#rainfall-value").textContent = Number.isFinite(avgRain) ? String(Math.round(avgRain)) : "—";
    $("#temperature-value").textContent = Number.isFinite(avgTemp) ? avgTemp.toFixed(1) : "—";
    $("#dry-value").textContent = String(dryMonths);
    $("#rainfall-note").textContent = avgRain < 400 ? t("lowRainNote") : avgRain > 800 ? t("highRainNote") : t("rainClimateNote");
    $("#temperature-note").textContent = avgTemp >= 18 ? t("warmHeatNote") : t("heatClimateNote");
    $("#dry-note").textContent = `${dryMonths} ${t("dryClimateNote")}`;
    const monthName = MONTH_NAMES[language];
    $("#climate-insight").textContent = t("insightText", { wet: monthName[wetIndex], dry: monthName[dryIndex] });
    $("#chart-period").textContent = `${climate.firstYear} — ${climate.lastYear}`;
    renderChart();
  }

  function renderChart() {
    const width = 380;
    const height = 145;
    const left = 25;
    const right = 6;
    const top = 7;
    const bottom = 25;
    const plotHeight = height - top - bottom;
    const plotWidth = width - left - right;
    const maxRain = Math.max(50, Math.ceil(Math.max(...climate.rainfall) / 50) * 50);
    const barGap = 5;
    const barWidth = (plotWidth - barGap * 11) / 12;
    const midValue = Math.round(maxRain / 2);
    const gridValues = [0, midValue, maxRain];
    const grid = gridValues.map((value) => {
      const y = top + plotHeight - (value / maxRain) * plotHeight;
      return `<line class="chart-grid" x1="${left}" y1="${y.toFixed(1)}" x2="${width - right}" y2="${y.toFixed(1)}"/><text class="chart-axis-label" x="${left - 6}" y="${(y + 3).toFixed(1)}" text-anchor="end">${value}</text>`;
    }).join("");
    const bars = climate.rainfall.map((value, index) => {
      const x = left + index * (barWidth + barGap);
      const barHeight = Math.max(value > 0 ? 2 : 0, (value / maxRain) * plotHeight);
      const y = top + plotHeight - barHeight;
      const month = MONTH_NAMES[language][index];
      return `<g><rect class="chart-bar${index === climate.rainfall.indexOf(Math.max(...climate.rainfall)) ? " chart-high" : ""}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barWidth.toFixed(1)}" height="${barHeight.toFixed(1)}" rx="2"><title>${month}: ${Math.round(value)} mm</title></rect><text class="chart-axis-label" x="${(x + barWidth / 2).toFixed(1)}" y="${height - 7}" text-anchor="middle">${month}</text></g>`;
    }).join("");
    $("#rain-chart").innerHTML = `<svg viewBox="0 0 ${width} ${height}" aria-hidden="true">${grid}${bars}</svg>`;
  }

  const landShapes = [
    [[-168, 70], [-151, 70], [-142, 64], [-130, 57], [-124, 48], [-125, 40], [-118, 33], [-111, 28], [-106, 23], [-98, 18], [-91, 18], [-88, 14], [-82, 9], [-78, 9], [-80, 19], [-85, 23], [-82, 30], [-78, 35], [-75, 43], [-68, 47], [-61, 51], [-57, 57], [-65, 62], [-74, 66], [-87, 67], [-102, 72], [-118, 75], [-138, 72], [-154, 72]],
    [[-74, 10], [-65, 12], [-55, 8], [-48, 2], [-44, -7], [-42, -17], [-47, -24], [-51, -32], [-56, -36], [-61, -46], [-68, -54], [-74, -49], [-72, -37], [-77, -26], [-80, -13], [-77, -3]],
    [[-52, 83], [-39, 78], [-25, 73], [-21, 65], [-32, 59], [-45, 59], [-54, 64]],
    [[-10, 36], [-9, 44], [-5, 51], [-6, 57], [1, 60], [3, 70], [20, 72], [30, 69], [42, 72], [57, 69], [67, 73], [78, 72], [92, 75], [107, 72], [119, 68], [132, 66], [143, 59], [154, 58], [163, 63], [177, 57], [171, 49], [156, 47], [146, 43], [139, 37], [128, 34], [122, 25], [111, 21], [107, 9], [99, 6], [95, 14], [87, 21], [81, 8], [75, 8], [69, 25], [61, 24], [56, 25], [51, 30], [44, 28], [40, 35], [33, 37], [27, 35], [20, 33], [15, 38], [9, 42], [2, 42], [-1, 37]],
    [[-17, 36], [-1, 37], [10, 34], [18, 30], [24, 21], [34, 11], [42, 12], [51, 12], [47, 5], [42, -1], [41, -11], [37, -18], [32, -26], [27, -34], [18, -35], [12, -28], [9, -17], [3, -9], [-1, 4], [-7, 10], [-12, 19], [-16, 25]],
    [[-11, 58], [-3, 58], [0, 54], [-5, 51], [-9, 54]],
    [[112, -11], [125, -12], [136, -15], [151, -24], [154, -31], [146, -39], [136, -35], [128, -33], [116, -25], [113, -18]],
    [[47, -13], [50, -17], [49, -25], [45, -25], [43, -18]],
    [[-8, 60], [-4, 59], [-3, 55], [-6, 54], [-9, 57]],
    [[129, 32], [135, 35], [140, 42], [145, 44], [144, 37], [138, 34]],
    [[96, -2], [104, 0], [112, -4], [115, -8], [108, -10], [102, -7]],
    [[-180, -68], [-130, -70], [-80, -69], [-30, -73], [20, -69], [70, -71], [120, -68], [180, -71], [180, -90], [-180, -90]]
  ];

  function project(longitude, latitude) {
    return { x: (longitude + 180) / 360 * 800, y: (90 - latitude) / 180 * 340 };
  }

  function renderMap() {
    const svg = $("#world-map");
    const paths = landShapes.map((shape) => {
      const points = shape.map(([longitude, latitude]) => project(longitude, latitude));
      const path = points.map(({ x, y }, index) => `${index ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ") + " Z";
      return `<path d="${path}"/>`;
    }).join("");
    const pin = project(Number(farm.longitude), Number(farm.latitude));
    const field = `<ellipse class="field-overlay" cx="${pin.x.toFixed(1)}" cy="${pin.y.toFixed(1)}" rx="13" ry="7" transform="rotate(-30 ${pin.x.toFixed(1)} ${pin.y.toFixed(1)})"/>`;
    $("#map-land").innerHTML = paths + field;
    $("#map-pin").setAttribute("transform", `translate(${pin.x.toFixed(1)} ${pin.y.toFixed(1)})`);
    svg.setAttribute("aria-label", `${t("farmLocationEyebrow")}: ${farm.name}. ${t("mapDisclaimer")}`);
  }

  function getModisObservationDate() {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - 7);
    return date.toISOString().slice(0, 10);
  }

  function updateSatelliteStatus() {
    if (!satelliteDate) return;
    const statusKey = satelliteLoadState === "loading" ? "modisLoading"
      : satelliteLoadState === "ready" ? "modisReady"
        : satelliteLoadState === "partial" ? "modisPartial"
          : "modisError";
    $("#satellite-status").textContent = t(statusKey, {
      date: satelliteDate,
      failed: satelliteTileStats.failed,
      total: satelliteTileStats.total
    });
    $("#satellite-map").setAttribute("aria-label", t("modisMapAria", {
      name: farm.name,
      date: satelliteDate
    }));
    $("#satellite-attribution").classList.toggle("satellite-unavailable", satelliteLoadState === "error");
  }

  function updateMapViewUI() {
    const satellite = currentMapView === "satellite";
    $("#map-wrap").hidden = satellite;
    $("#satellite-map").hidden = !satellite;
    $("#satellite-attribution").hidden = !satellite;
    $("#world-view-button").classList.toggle("active", !satellite);
    $("#world-view-button").setAttribute("aria-pressed", String(!satellite));
    $("#satellite-view-button").classList.toggle("active", satellite);
    $("#satellite-view-button").setAttribute("aria-pressed", String(satellite));
    $("#map-guidance").textContent = t(satellite ? "mapSatelliteDisclaimer" : "mapDisclaimer");
    if (satellite) {
      const requestKey = `${farm.latitude},${farm.longitude},${getModisObservationDate()}`;
      if (requestKey !== satelliteRequestKey || satelliteLoadState === "error") renderSatelliteMap(requestKey);
      else updateSatelliteStatus();
    }
  }

  function renderSatelliteMap(requestKey) {
    satelliteGeneration += 1;
    const generation = satelliteGeneration;
    const date = requestKey.slice(requestKey.lastIndexOf(",") + 1);
    satelliteDate = date;
    satelliteRequestKey = requestKey;
    satelliteLoadState = "loading";
    satelliteTileStats = { loaded: 0, failed: 0, total: MODIS_TILE_SIZE * MODIS_TILE_HEIGHT };

    const latitude = clamp(Number(farm.latitude), -90, 90);
    const longitude = clamp(Number(farm.longitude), -179.999999, 179.999999);
    const longitudePosition = (longitude + 180) / 360 * MODIS_TILE_COLUMNS;
    const latitudePosition = (90 - latitude) / 180 * MODIS_TILE_ROWS;
    const centerColumn = Math.min(MODIS_TILE_COLUMNS - 1, Math.floor(longitudePosition));
    const centerRow = Math.min(MODIS_TILE_ROWS - 1, Math.floor(latitudePosition));
    const startColumn = centerColumn - Math.floor(MODIS_TILE_SIZE / 2);
    const startRow = clamp(centerRow - 1, 0, MODIS_TILE_ROWS - MODIS_TILE_HEIGHT);
    satelliteBounds = { startColumn, startRow };
    $("#satellite-marker").style.left = `${(longitudePosition - startColumn) / MODIS_TILE_SIZE * 100}%`;
    $("#satellite-marker").style.top = `${(latitudePosition - startRow) / MODIS_TILE_HEIGHT * 100}%`;
    updateSatelliteStatus();

    const tiles = document.createDocumentFragment();
    for (let row = 0; row < MODIS_TILE_HEIGHT; row += 1) {
      for (let column = 0; column < MODIS_TILE_SIZE; column += 1) {
        const tileColumn = ((startColumn + column) % MODIS_TILE_COLUMNS + MODIS_TILE_COLUMNS) % MODIS_TILE_COLUMNS;
        const tileRow = startRow + row;
        const image = document.createElement("img");
        image.alt = "";
        image.draggable = false;
        image.decoding = "async";
        const finishTile = (loaded) => {
          if (generation !== satelliteGeneration) return;
          if (loaded) satelliteTileStats.loaded += 1;
          else satelliteTileStats.failed += 1;
          if (satelliteTileStats.loaded + satelliteTileStats.failed < satelliteTileStats.total) return;
          satelliteLoadState = satelliteTileStats.loaded === 0 ? "error"
            : satelliteTileStats.failed > 0 ? "partial" : "ready";
          updateSatelliteStatus();
        };
        image.addEventListener("load", () => finishTile(true), { once: true });
        image.addEventListener("error", () => finishTile(false), { once: true });
        image.src = `https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${date}/250m/${MODIS_TILE_ZOOM}/${tileRow}/${tileColumn}.jpg`;
        tiles.append(image);
      }
    }
    $("#satellite-tiles").replaceChildren(tiles);
  }

  function setMapView(view) {
    currentMapView = view === "satellite" ? "satellite" : "world";
    updateMapViewUI();
  }

  function selectSatelliteMapLocation(event) {
    if (!satelliteBounds) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = clamp((event.clientX - bounds.left) / bounds.width, 0, 1);
    const y = clamp((event.clientY - bounds.top) / bounds.height, 0, 1);
    const tileColumn = satelliteBounds.startColumn + x * MODIS_TILE_SIZE;
    const tileRow = satelliteBounds.startRow + y * MODIS_TILE_HEIGHT;
    const longitude = (((tileColumn % MODIS_TILE_COLUMNS) + MODIS_TILE_COLUMNS) % MODIS_TILE_COLUMNS) / MODIS_TILE_COLUMNS * 360 - 180;
    const latitude = clamp(90 - tileRow / MODIS_TILE_ROWS * 180, -90, 90);
    setFarmLocation(latitude, longitude, `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`);
  }

  function scoreStrategy(strategy) {
    const crops = strategy.crops;
    const average = (property) => crops.reduce((sum, key) => sum + CROPS[key][property], 0) / crops.length;
    const dryness = updateClimateSummary().dryMonths / 12;
    const heatStress = Math.min(1, Math.max(0, updateClimateSummary().avgTemp - 15) / 12);
    const soilBoost = farm.organicMatter === "low" ? 7 : farm.organicMatter === "high" ? -3 : 0;
    const textureAdjustment = farm.soil === "sandy" ? -6 : farm.soil === "loamy" ? 2 : farm.soil === "clay" ? 1 : 0;
    const priorCropFamily = farm.currentCrop === "cereal" ? "cereal" : farm.currentCrop === "legume" ? "legume" : farm.currentCrop === "oilseed" ? "oilseed" : "";
    const firstCropFamily = CROP_FAMILY[crops[0]];
    const sequenceAdjustment = priorCropFamily ? (priorCropFamily === firstCropFamily ? -5 : 3) : 0;
    const irrigationAdjustment = farm.irrigation === "none" ? 8 : farm.irrigation === "reliable" ? -4 : 0;
    const waterScore = clamp(average("water") * 0.72 + average("drought") * dryness * 0.28 + irrigationAdjustment + textureAdjustment, 0, 100);
    const soilScore = clamp(average("soil") + soilBoost + sequenceAdjustment, 0, 100);
    const cropDiversity = new Set(crops.slice(0, Number(farm.seasons)).map((crop) => crop)).size / Math.min(crops.length, Number(farm.seasons));
    const incomeScore = clamp(average("income") * 0.82 + cropDiversity * 18, 0, 100);
    const heatScore = clamp(average("heat") * (1 - heatStress * 0.22) + average("drought") * dryness * 0.12, 0, 100);
    const weights = farm.weights;
    const weightTotal = Math.max(1, weights.water + weights.soil + weights.income);
    const overall = Math.round((waterScore * weights.water + soilScore * weights.soil + incomeScore * weights.income) / weightTotal);
    return { water: Math.round(waterScore), soil: Math.round(soilScore), income: Math.round(incomeScore), heat: Math.round(heatScore), overall, diversity: Math.round(cropDiversity * 100) };
  }

  function renderScenarios() {
    const seasons = clamp(Number(farm.seasons) || 3, 3, 5);
    const scenarios = STRATEGIES.map((strategy) => ({ strategy, scores: scoreStrategy(strategy) }));
    scenarios.sort((a, b) => b.scores.overall - a.scores.overall);
    const grid = $("#scenario-grid");
    grid.innerHTML = scenarios.map(({ strategy, scores }, rank) => {
      const crops = strategy.crops.slice(0, seasons);
      const cropRows = crops.map((cropKey, index) => {
        const crop = CROPS[cropKey][language];
        return `<div class="rotation-season"><small>${escapeHtml(t("yearLabel", { n: index + 1 }))}</small><strong>${escapeHtml(crop)}</strong></div>`;
      }).join("");
      const metric = (label, score) => `<div class="scenario-metric"><span>${escapeHtml(label)}</span><div class="scenario-metric-track"><div class="scenario-metric-fill" style="width:${score}%"></div></div><strong>${score}</strong></div>`;
      return `<article class="scenario-card${rank === 0 ? " recommended" : ""}" data-kind="${strategy.id}" style="--score:${scores.overall}">
        <div class="recommended-label"><svg class="icon"><use href="#i-spark"/></svg>${escapeHtml(t("recommended"))}</div>
        <div class="scenario-top"><div class="scenario-icon"><svg class="icon"><use href="#${strategy.icon}"/></svg></div><span class="score-ring" role="img" aria-label="${language === "tr" ? "Göreli uyum puanı" : "Relative fit score"}: ${scores.overall}"><span>${scores.overall}</span></span></div>
        <h3>${escapeHtml(strategy.name[language])}</h3>
        <p class="scenario-description">${escapeHtml(strategy.description[language])}</p>
        <div class="rotation-track" style="--seasons:${seasons}">${cropRows}</div>
        <div class="scenario-metrics">${metric(escapeHtml(t("waterMetric")), scores.water)}${metric(escapeHtml(t("soilMetric")), scores.soil)}${metric(escapeHtml(t("incomeMetric")), scores.income)}</div>
        <p class="scenario-rationale">${escapeHtml(strategy.rationale[language])}</p>
      </article>`;
    }).join("");
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
  }

  function parsePowerData(payload, firstYear, lastYear) {
    const parameters = payload && payload.properties && payload.properties.parameter;
    if (!parameters || !parameters.T2M || !parameters.PRECTOTCORR) throw new Error("NASA POWER response did not contain T2M and PRECTOTCORR.");
    const temperatureBuckets = Array.from({ length: 12 }, () => []);
    const rainfallBuckets = Array.from({ length: 12 }, () => []);
    const temperatures = parameters.T2M;
    const precipitation = parameters.PRECTOTCORR;
    for (const [dateKey, temperatureValue] of Object.entries(temperatures)) {
      if (!/^\d{6}$/.test(dateKey)) continue;
      const year = Number(dateKey.slice(0, 4));
      const month = Number(dateKey.slice(4, 6)) - 1;
      const temperature = Number(temperatureValue);
      const dailyRain = Number(precipitation[dateKey]);
      if (year < firstYear || year > lastYear || month < 0 || month > 11 || !Number.isFinite(temperature) || temperature <= -90) continue;
      temperatureBuckets[month].push(temperature);
      if (Number.isFinite(dailyRain) && dailyRain >= 0) {
        rainfallBuckets[month].push(dailyRain * new Date(Date.UTC(year, month + 1, 0)).getUTCDate());
      }
    }
    if (temperatureBuckets.some((bucket) => bucket.length === 0) || rainfallBuckets.some((bucket) => bucket.length === 0)) {
      throw new Error("NASA POWER returned incomplete monthly temperature or precipitation data.");
    }
    const temperature = temperatureBuckets.map((bucket) => bucket.reduce((sum, value) => sum + value, 0) / bucket.length);
    const rainfall = rainfallBuckets.map((bucket) => bucket.reduce((sum, value) => sum + value, 0) / bucket.length);
    return {
      temperature,
      rainfall,
      firstYear,
      lastYear,
      source: "nasa"
    };
  }

  function updateLocationStatus(error = false, loading = false) {
    updateStatus(error, loading);
  }

  async function loadNasaData() {
    if (powerRequest) powerRequest.abort();
    const controller = new AbortController();
    powerRequest = controller;
    const timeout = setTimeout(() => controller.abort(), 20000);
    const now = new Date();
    const lastYear = now.getUTCFullYear() - 1;
    const firstYear = lastYear - 9;
    const start = String(firstYear);
    const end = String(lastYear);
    const query = new URLSearchParams({
      parameters: "T2M,PRECTOTCORR",
      community: "AG",
      longitude: Number(farm.longitude).toFixed(4),
      latitude: Number(farm.latitude).toFixed(4),
      start,
      end,
      format: "JSON",
      header: "true"
    });
    updateLocationStatus(false, true);
    try {
      const response = await fetch(`https://power.larc.nasa.gov/api/temporal/monthly/point?${query}`, {
        signal: controller.signal,
        headers: { Accept: "application/json" }
      });
      if (!response.ok) throw new Error(`NASA POWER responded with HTTP ${response.status}.`);
      const payload = await response.json();
      const result = parsePowerData(payload, firstYear, lastYear);
      if (controller.signal.aborted) return;
      climate = result;
      updateLocationStatus();
      renderClimate();
      renderScenarios();
      notify(t("dataUpdated", { place: farm.name }));
    } catch (error) {
      if (controller.signal.aborted && powerRequest !== controller) return;
      if (controller.signal.aborted) console.warn("NASA POWER request timed out or was cancelled.", error);
      else console.warn("NASA POWER data is unavailable; clearly labeled sample data remains active.", error);
      if (powerRequest !== controller) return;
      climate = { ...DEMO_CLIMATE, temperature: [...DEMO_CLIMATE.temperature], rainfall: [...DEMO_CLIMATE.rainfall] };
      updateLocationStatus(true);
      renderClimate();
      renderScenarios();
      notify(t("powerError"));
    } finally {
      clearTimeout(timeout);
      if (powerRequest === controller) powerRequest = null;
    }
  }

  function openLocationDialog() {
    $("#location-form").reset();
    updateLocationLabels();
    $("#search-result").textContent = "";
    $("#location-dialog").showModal();
    setTimeout(() => $("#place-search").focus(), 0);
  }

  function setFarmLocation(latitude, longitude, name) {
    const lat = Number(latitude);
    const lon = Number(longitude);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lon) || lon < -180 || lon > 180) {
      notify(t("invalidCoordinates"));
      return false;
    }
    farm.latitude = lat;
    farm.longitude = lon;
    farm.name = (name || `${Math.abs(lat).toFixed(2)}°, ${Math.abs(lon).toFixed(2)}°`).trim().slice(0, 60);
    if (!farm.name) farm.name = `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
    saveFarm();
    if (currentMapView === "satellite") updateMapViewUI();
    climate = { ...DEMO_CLIMATE, temperature: [...DEMO_CLIMATE.temperature], rainfall: [...DEMO_CLIMATE.rainfall] };
    renderClimate();
    renderScenarios();
    notify(t("locationSaved"));
    loadNasaData();
    return true;
  }

  async function searchPlaces(query) {
    const result = $("#search-result");
    result.textContent = t("searching");
    try {
      const params = new URLSearchParams({ q: query, format: "jsonv2", limit: "4", addressdetails: "1" });
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
        headers: { Accept: "application/json" }
      });
      if (response.status === 429) throw new Error("rate_limit");
      if (!response.ok) throw new Error(`OpenStreetMap Nominatim returned HTTP ${response.status}.`);
      const places = await response.json();
      if (!places.length) {
        result.textContent = t("searchNoResults");
        return;
      }
      result.innerHTML = places.map((place, index) =>
        `<button type="button" class="search-suggestion" data-result-index="${index}">${escapeHtml(place.display_name)}</button>`
      ).join("");
      result.querySelectorAll(".search-suggestion").forEach((button) => {
        button.addEventListener("click", () => {
          const place = places[Number(button.dataset.resultIndex)];
          $("#latitude-input").value = Number(place.lat).toFixed(4);
          $("#longitude-input").value = Number(place.lon).toFixed(4);
          $("#location-name").value = place.display_name.split(",").slice(0, 2).join(",").trim();
          $("#place-search").value = place.display_name;
          result.textContent = "";
        });
      });
    } catch (error) {
      console.warn("OpenStreetMap place search failed.", error);
      result.textContent = error.message === "rate_limit" ? t("searchRateLimit") : t("searchError");
    }
  }

  function downloadPlan() {
    const scenarios = STRATEGIES.map((strategy) => ({ strategy, scores: scoreStrategy(strategy) }))
      .sort((a, b) => b.scores.overall - a.scores.overall);
    const separator = ",";
    const source = climate.source === "nasa"
      ? `NASA POWER ${climate.firstYear}–${climate.lastYear}`
      : (language === "tr" ? "Konya için sabit örnek değerler; seçilen konumun verisi değil" : "Fixed Konya-area example; not data for the selected location");
    const rows = [
      [language === "tr" ? "Tarla konumu" : "Farm location", `${farm.name} (${localizeLocation()})`],
      [language === "tr" ? "İklim kaynağı" : "Climate source", source],
      [language === "tr" ? "Not" : "Note", language === "tr" ? "Rotasyon puanları sezgiseldir; verim veya hava tahmini değildir." : "Rotation scores are heuristic; they are not yield or weather forecasts."],
      [],
      [language === "tr" ? "Rotasyon senaryosu" : "Rotation scenario", language === "tr" ? "Sezon" : "Season", language === "tr" ? "Ürün" : "Crop", language === "tr" ? "Öncelik uyumu (sezgisel)" : "Priority fit (heuristic)", language === "tr" ? "Su uyumu" : "Water fit", language === "tr" ? "Toprak potansiyeli" : "Soil potential", language === "tr" ? "Gelir dengesi" : "Income mix"],
      ...scenarios.flatMap(({ strategy, scores }) => strategy.crops.slice(0, Number(farm.seasons)).map((cropKey, index) => [
        strategy.name[language], `${index + 1}`, CROPS[cropKey][language], `${scores.overall}/100`, `${scores.water}/100`, `${scores.soil}/100`, `${scores.income}/100`
      ]))
    ];
    const csv = "\uFEFF" + rows.map((row) => row.map((field) => `"${String(field).replaceAll('"', '""')}"`).join(separator)).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fieldshift-rotation-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify(t("csvDownloaded"));
  }

  function goToPage(page) {
    const validPages = ["overview", "planner", "soil", "data"];
    if (!validPages.includes(page)) page = "overview";
    currentPage = page;
    $$(".page-section").forEach((section) => {
      const active = section.id === `page-${page}`;
      section.hidden = !active;
      section.classList.toggle("active", active);
    });
    $$(".nav-link").forEach((link) => {
      const active = link.dataset.page === page;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    $("#page-title").textContent = t(`nav${page[0].toUpperCase()}${page.slice(1)}`);
    if (location.hash !== `#${page}`) history.replaceState(null, "", `#${page}`);
    renderScenarios();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function attachEvents() {
    $$(".nav-link").forEach((link) => link.addEventListener("click", (event) => {
      event.preventDefault();
      goToPage(link.dataset.page);
    }));
    $$('a[href="#planner"], a[href="#soil"], a[href="#data"], a[href="#overview"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        goToPage(link.getAttribute("href").slice(1));
      });
    });
    $("#language-button").addEventListener("click", () => {
      language = language === "tr" ? "en" : "tr";
      saveStore();
      applyLanguage();
    });
    $("#refresh-data").addEventListener("click", () => {
      climate = { ...DEMO_CLIMATE, temperature: [...DEMO_CLIMATE.temperature], rainfall: [...DEMO_CLIMATE.rainfall] };
      loadNasaData();
    });
    $("#edit-location").addEventListener("click", openLocationDialog);
    $("#coordinates-button").addEventListener("click", openLocationDialog);
    $("#farm-switcher").addEventListener("click", openLocationDialog);
    $("#profile-shortcut").addEventListener("click", () => goToPage("soil"));
    $("#world-map").addEventListener("click", (event) => {
      const bounds = event.currentTarget.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      const longitude = clamp(x * 360 - 180, -180, 180);
      const latitude = clamp(90 - y * 180, -90, 90);
      setFarmLocation(latitude, longitude, `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`);
    });
    $("#world-view-button").addEventListener("click", () => setMapView("world"));
    $("#satellite-view-button").addEventListener("click", () => setMapView("satellite"));
    $("#satellite-map").addEventListener("click", selectSatelliteMapLocation);
    $("#location-form").addEventListener("submit", (event) => {
      event.preventDefault();
      setFarmLocation($("#latitude-input").value, $("#longitude-input").value, $("#location-name").value);
      if (Number($("#latitude-input").value) >= -90 && Number($("#latitude-input").value) <= 90 && Number($("#longitude-input").value) >= -180 && Number($("#longitude-input").value) <= 180) {
        $("#location-dialog").close();
      }
    });
    $("#place-search").addEventListener("input", (event) => {
      const query = event.target.value.trim();
      clearTimeout(searchTimer);
      if (query.length < 3) {
        $("#search-result").textContent = "";
        return;
      }
      searchTimer = setTimeout(() => searchPlaces(query), 700);
    });
    $("#place-search").addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        clearTimeout(searchTimer);
        const query = event.currentTarget.value.trim();
        if (query.length >= 3) searchPlaces(query);
      }
    });
    $("#soil-form").addEventListener("change", (event) => {
      const element = event.target;
      if (element.id === "soil-texture") farm.soil = element.value;
      if (element.id === "organic-matter") farm.organicMatter = element.value;
      if (element.id === "irrigation") farm.irrigation = element.value;
      if (element.id === "current-crop") farm.currentCrop = element.value;
      saveFarm();
    });
    $("#farmer-note").addEventListener("input", (event) => {
      farm.notes = event.target.value;
      saveStore();
    });
    for (const category of ["water", "soil", "income"]) {
      $(`#${category}-weight`).addEventListener("input", (event) => {
        farm.weights[category] = Number(event.target.value);
        $(`#${category}-weight-value`).textContent = `${farm.weights[category]}%`;
        saveStore();
        renderScenarios();
      });
    }
    $("#planning-season").addEventListener("change", (event) => {
      farm.seasons = clamp(Number(event.target.value), 3, 5);
      saveStore();
      renderScenarios();
    });
    $("#export-plan").addEventListener("click", downloadPlan);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && $("#location-dialog").open) $("#location-dialog").close();
    });
    window.addEventListener("hashchange", () => goToPage(location.hash.slice(1)));
  }

  function start() {
    attachEvents();
    const page = location.hash.slice(1);
    if (["overview", "planner", "soil", "data"].includes(page)) currentPage = page;
    applyLanguage();
    goToPage(currentPage);
    loadNasaData();
  }

  start();
})();
