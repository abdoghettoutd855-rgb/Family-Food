'use strict';



/**
 * PRELOAD
 *
 * loading will be end after document is loaded
 * (a 5s safety timer makes sure the loader can never get stuck)
 */

const preloader = document.querySelector("[data-preaload]");
let preloaderDone = false;

const hidePreloader = function () {
  if (preloaderDone) return;
  preloaderDone = true;
  preloader.classList.add("loaded");
  document.body.classList.add("loaded");
}

window.addEventListener("load", hidePreloader);
setTimeout(hidePreloader, 5000);



/**
 * add event listener on multiple elements
 */

const addEventOnElements = function (elements, eventType, callback) {
  for (let i = 0, len = elements.length; i < len; i++) {
    elements[i].addEventListener(eventType, callback);
  }
}



/**
 * NAVBAR
 */

const navbar = document.querySelector("[data-navbar]");
const navTogglers = document.querySelectorAll("[data-nav-toggler]");
const overlay = document.querySelector("[data-overlay]");

const toggleNavbar = function () {
  navbar.classList.toggle("active");
  overlay.classList.toggle("active");
  document.body.classList.toggle("nav-active");
}

addEventOnElements(navTogglers, "click", toggleNavbar);



/**
 * HEADER & BACK TOP BTN
 */

const header = document.querySelector("[data-header]");
const backTopBtn = document.querySelector("[data-back-top-btn]");

let lastScrollPos = 0;

const hideHeader = function () {
  const isScrollBottom = lastScrollPos < window.scrollY;
  if (isScrollBottom) {
    header.classList.add("hide");
  } else {
    header.classList.remove("hide");
  }

  lastScrollPos = window.scrollY;
}

window.addEventListener("scroll", function () {
  if (window.scrollY >= 50) {
    header.classList.add("active");
    if (backTopBtn) backTopBtn.classList.add("active");
    hideHeader();
  } else {
    header.classList.remove("active");
    if (backTopBtn) backTopBtn.classList.remove("active");
  }
});



/**
 * KEEP CONTENT BELOW THE FIXED HEADER (menu / about / reservation pages)
 *
 * The header is position:fixed, so it would cover the top of those pages.
 * Its real height depends on the logo size and the screen width, so it is
 * measured here and given to the CSS as --header-space
 * (used by .menu, .about and .reservation at the end of style.css).
 */

const headerContainer = document.querySelector(".header .container");

const updateHeaderSpace = function () {
  if (!headerContainer) return;

  // same value as ".header { top: 51px }" (the top bar is hidden under 575px)
  const topbarOffset = window.matchMedia("(min-width: 575px)").matches ? 51 : 0;

  // header padding (40px above + 40px below) + its content + a little breathing room
  const space = topbarOffset + 40 + headerContainer.offsetHeight + 40 + 24;

  document.documentElement.style.setProperty("--header-space", space + "px");
}

updateHeaderSpace();
window.addEventListener("resize", updateHeaderSpace);
window.addEventListener("load", updateHeaderSpace);

if (window.ResizeObserver && headerContainer) {
  new ResizeObserver(updateHeaderSpace).observe(headerContainer);
}



/**
 * HERO SLIDER
 *
 * Only present on the home page (index.html). Everything in this block is
 * guarded so pages without a hero slider (menu.html, about.html,
 * reservation.html) simply skip it instead of throwing errors.
 */

const heroSlider = document.querySelector("[data-hero-slider]");

if (heroSlider) {
  const heroSliderItems = document.querySelectorAll("[data-hero-slider-item]");
  const heroSliderPrevBtn = document.querySelector("[data-prev-btn]");
  const heroSliderNextBtn = document.querySelector("[data-next-btn]");

  let currentSlidePos = 0;
  let lastActiveSliderItem = heroSliderItems[0];

  const updateSliderPos = function () {
    lastActiveSliderItem.classList.remove("active");
    heroSliderItems[currentSlidePos].classList.add("active");
    lastActiveSliderItem = heroSliderItems[currentSlidePos];
  }

  const slideNext = function () {
    if (currentSlidePos >= heroSliderItems.length - 1) {
      currentSlidePos = 0;
    } else {
      currentSlidePos++;
    }

    updateSliderPos();
  }

  heroSliderNextBtn.addEventListener("click", slideNext);

  const slidePrev = function () {
    if (currentSlidePos <= 0) {
      currentSlidePos = heroSliderItems.length - 1;
    } else {
      currentSlidePos--;
    }

    updateSliderPos();
  }

  heroSliderPrevBtn.addEventListener("click", slidePrev);

  /**
   * auto slide
   */

  let autoSlideInterval;

  const autoSlide = function () {
    autoSlideInterval = setInterval(function () {
      slideNext();
    }, 7000);
  }

  addEventOnElements([heroSliderNextBtn, heroSliderPrevBtn], "mouseover", function () {
    clearInterval(autoSlideInterval);
  });

  addEventOnElements([heroSliderNextBtn, heroSliderPrevBtn], "mouseout", autoSlide);

  window.addEventListener("load", autoSlide);
}



/**
 * PARALLAX EFFECT
 */

const parallaxItems = document.querySelectorAll("[data-parallax-item]");

let x, y;

window.addEventListener("mousemove", function (event) {

  x = (event.clientX / window.innerWidth * 10) - 5;
  y = (event.clientY / window.innerHeight * 10) - 5;

  // reverse the number eg. 20 -> -20, -5 -> 5
  x = x - (x * 2);
  y = y - (y * 2);

  for (let i = 0, len = parallaxItems.length; i < len; i++) {
    x = x * Number(parallaxItems[i].dataset.parallaxSpeed);
    y = y * Number(parallaxItems[i].dataset.parallaxSpeed);
    parallaxItems[i].style.transform = `translate3d(${x}px, ${y}px, 0px)`;
  }

});



/**
 * LANGUAGE SWITCHER (English / Arabic)
 *
 * - Translates every element marked with [data-i18n] (text content)
 *   and every element marked with [data-i18n-placeholder] (placeholder attribute).
 * - Persists the chosen language in localStorage so it survives a page refresh.
 * - Toggles the <html> lang/dir attributes for correct RTL/LTR rendering.
 * - Original English wording is kept exactly as authored (including any
 *   pre-existing spelling/spacing quirks) - only the displayed language changes.
 */

const languageBtn = document.querySelector("#languageBtn");

const translations = {
  en: {
    // header / navbar / topbar
    topbarAddress: "Fast food restaurant elmilia jijel algeria",
    topbarHours: "Daily : 8.00 am to 10.00 pm",
    home: "Home",
    menus: "Menus",
    about: "About Us",
    chefs: "Our Chefs",
    contact: "Contact",
    visitAlgeria: "Visit Algeria",
    navbarAddress: "Fast food restaurant, <br>\n            elmilia jijel algeria",
    navbarOpen: "Open: 9.30 am - 2.30pm",
    bookingRequest: "Booking Request",
    findTable: "Find A Table",

    // hero
    heroSubtitle1: "Tradational & Hygine",
    heroTitle1: "For the love of <br>\n              delicious food",
    heroText: "Come with family & feel the joy of mouthwatering food",
    viewMenu: "View Our Menu",
    heroSubtitle2: "delightful experience",
    heroTitle2: "Flavors Inspired by <br>\n              the Seasons",
    heroSubtitle3: "amazing & delicious",
    heroTitle3: "Where every flavor <br>\n              tells a story",
    bookATable: "Book A Table",

    // service
    flavorsForRoyalty: "Flavors For Royalty",
    weOfferTopNotch: "We Offer Top Notch",
    serviceLorem: "Lorem Ipsum is simply dummy text of the printing and typesetting industry lorem Ipsum has been the industrys standard dummy text ever.",
    serviceBreakfast: "Breakfast",
    serviceAppetizers: "Appetizers",
    serviceDrinks: "Drinks",
    viewMenuSmall: "View Menu",

    // about
    ourStorySubtitle: "Our Story",
    everyFlavorTellsStory: "Every Fla vor Tells a Story",
    aboutParagraph: "Our Story\n\nAt Family Food, we believe that food is more than just a meal — it is a moment that brings family and friends together.\n\nWe started with a simple dream: to serve delicious, fresh dishes prepared with care, in a warm atmosphere that makes you feel right at home.\n\nFrom the first bite to the last, we are committed to quality, great taste, and friendly service, because your satisfaction is the most important part of our story.\n\nFamily Food — A Taste That Brings Us Together. ❤️.",
    bookThroughCall: "Book Through Call",
    readMore: "Read More",

    // special dish
    specialDishSubtitle: "Special Dish",
    lobsterTortellini: "Lobster Tortellini",
    specialDishLorem: "Lorem Ipsum is simply dummy text of the printingand typesetting industry lorem Ipsum has been the industrys standard dummy text ever since the when an unknown printer took a galley of type.",
    viewAllMenu: "View All Menu",

    // menu
    specialSelection: "Special Selection",
    deliciousMenu: "Delicious Menu",
    menuGreekSalad: "Greek Salad",
    menuGreekSaladText: "Tomatoes, green bell pepper, sliced cucumber onion, olives, and feta cheese.",
    seasonal: "Seasonal",
    menuLasagne: "Lasagne",
    menuLasagneText: "Vegetables, cheeses, ground meats, tomato sauce, seasonings and spices",
    menuButternutPumpkin: "Butternut Pumpkin",
    menuButternutPumpkinText: "Typesetting industry lorem Lorem Ipsum is simply dummy text of the priand.",
    menuTokusenWagyu: "Tokusen Wagyu",
    newBadge: "New",
    menuTokusenWagyuText: "Vegetables, cheeses, ground meats, tomato sauce, seasonings and spices.",
    menuOlivasRellenas: "Olivas Rellenas",
    menuOlivasRellenasText: "Avocados with crab meat, red onion, crab salad stuffed red bell pepper and green bell pepper.",
    menuOpuFish: "Opu Fish",
    menuOpuFishText: "Vegetables, cheeses, ground meats, tomato sauce, seasonings and spices",
    menuWinterText1: "During winter daily from",
    menuWinterText2: "to",

    // testimonials
    testimonialText: "I wanted to thank you for inviting me down for that amazing dinner the other night. The food was extraordinary.",

    // reservation
    onlineReservation: "Online Reservation",
    bookingRequestText: "Booking request",
    orFillForm: "or fill out the order form",
    yourName: "Your Name",
    phoneNumber: "Phone Number",
    messagePlaceholder: "Message",
    person1: "1 Person",
    person2: "2 Person",
    person3: "3 Person",
    person4: "4 Person",
    person5: "5 Person",
    person6: "6 Person",
    person7: "7 Person",
    contactUs: "Contact Us",
    location: "Location",
    reservationAddress: "Fast Food Restaurant, <br>\n                elmilia jijel algeria",
    lunchTime: "Lunch Time",
    lunchTimeText: "Monday to Sunday <br>\n                11.00 am - 2.30pm",
    dinnerTime: "Dinner Time",
    dinnerTimeText: "Monday to Sunday <br>\n                05.00 pm - 10.00pm",

    // features
    whyChooseUs: "Why Choose Us",
    ourStrength: "Our Strength",
    hygienicFoodTitle: "Hygienic Food",
    hygienicFoodText: "We carefully prepare every dish using fresh, quality ingredients while maintaining high standards of cleanliness.",
    freshEnvironmentTitle: "Fresh Environment",
    freshEnvironmentText: "A welcoming place where families and friends can enjoy delicious food and create memorable moments together.",
    skilledChefsTitle: "Skilled Chefs",
    skilledChefsText: "Our chefs put passion and care into every dish to deliver great taste and a satisfying experience.",
    eventPartyTitle: "Event & Party",
    eventPartyText: "Whether it’s a family meal, a celebration, or a gathering with friends, Family Food is the perfect place to enjoy good food together.",

    // event
    recentUpdates: "Recent Updates",
    upcomingEvent: "Upcoming Event",
    foodFlavour: "Food, Flavour",
    healthyFood: "Healthy Food",
    recipie: "Recipie",
    flavourQuote: "Flavour so good you’ll try to eat with your eyes.",
    viewOurBlog: "View Our Blog",

    // footer
    footerAddress: "Fast Food Restaurant Elmilia jijel algeria",
    footerBookingLabel: "Booking Request :",
    openLabel: "Open :",
    getNewsOffers: "Get News & Offers",
    subscribeUsGet: "Subscribe us & Get",
    offPercent: "25% Off.",
    yourEmail: "Your email",
    subscribeBtn: "Subscribe",
    allRightsReserved: "All Rights Reserved",
    craftedBy: "Crafted by",

    // table reservation form feedback
    reservationSuccess: "Your reservation request has been received. We'll contact you shortly to confirm.",
    reservationError: "Something went wrong while sending your reservation. Please try again or call us.",
    reservationMissingFields: "Please fill in your name, phone number, and date.",
    reservationPastDate: "Please choose a date and time that have not passed yet.",
    reservationTimeout: "The connection is too slow and we could not confirm your request. Please call us to make sure.",
    reservationTooFast: "You just sent a request. Please wait a moment before sending another one."
  },

  ar: {
    // header / navbar / topbar
    topbarAddress: "مطعم وجبات سريعة، الميلية، جيجل، الجزائر",
    topbarHours: "يوميًا: من 8.00 صباحًا إلى 10.00 مساءً",
    home: "الرئيسية",
    menus: "القائمة",
    about: "من نحن",
    chefs: "طهاتنا",
    contact: "اتصل بنا",
    visitAlgeria: "زوروا الجزائر",
    navbarAddress: "مطعم وجبات سريعة، <br>\n            الميلية، جيجل، الجزائر",
    navbarOpen: "أوقات العمل: 9.30 صباحًا - 2.30 مساءً",
    bookingRequest: "طلب حجز",
    findTable: "إحجز طاولة",

    // hero
    heroSubtitle1: "تقليدي وصحي",
    heroTitle1: "من أجل حب <br>\n              الطعام اللذيذ",
    heroText: "تعال مع عائلتك وإستمتع بمتعة الطعام الشهي",
    viewMenu: "عرض قائمتنا",
    heroSubtitle2: "تجربة رائعة",
    heroTitle2: "نكهات مستوحاة <br>\n              من الفصول",
    heroSubtitle3: "مذهل ولذيذ",
    heroTitle3: "حيث كل نكهة <br>\n              تحكي قصة",
    bookATable: "إحجز طاولة",

    // service
    flavorsForRoyalty: "نكهات تليق بالملوك",
    weOfferTopNotch: "نقدم لكم الأفضل",
    serviceLorem: "لوريم إيبسوم هو ببساطة نص شكلي يستخدم في صناعة الطباعة والتنضيد، وهو النص الشكلي القياسي في هذه الصناعة منذ العصور القديمة.",
    serviceBreakfast: "فطور",
    serviceAppetizers: "مقبلات",
    serviceDrinks: "مشروبات",
    viewMenuSmall: "عرض القائمة",

    // about
    ourStorySubtitle: "قصتنا",
    everyFlavorTellsStory: "كل نكهة تحكي قصة",
    aboutParagraph: "قصتنا\n\nفي فاميلي فود، نؤمن بأن الطعام هو أكثر من مجرد وجبة — إنه لحظة تجمع العائلة والأصدقاء معًا.\n\nبدأنا بحلم بسيط: تقديم أطباق لذيذة وطازجة مُعدة بعناية، في أجواء دافئة تجعلك تشعر وكأنك في بيتك.\n\nمن أول لقمة إلى آخرها، نحن ملتزمون بالجودة والمذاق الرائع والخدمة الودية، لأن رضاكم هو أهم جزء في قصتنا.\n\nفاميلي فود — نكهة تجمعنا معًا. ❤️.",
    bookThroughCall: "احجز عبر الهاتف",
    readMore: "اقرأ المزيد",

    // special dish
    specialDishSubtitle: "طبق مميز",
    lobsterTortellini: "تورتيليني بالكركند",
    specialDishLorem: "لوريم إيبسوم هو ببساطة نص شكلي يستخدم في صناعة الطباعة والتنضيد، وهو النص الشكلي القياسي في هذه الصناعة منذ أن قام طابع مجهول بجمع نموذج من الحروف.",
    viewAllMenu: "عرض كل القائمة",

    // menu
    specialSelection: "تشكيلة مميزة",
    deliciousMenu: "قائمة لذيذة",
    menuGreekSalad: "سلطة يونانية",
    menuGreekSaladText: "طماطم، فلفل أخضر، خيار مقطع، بصل، زيتون، وجبنة فيتا.",
    seasonal: "موسمي",
    menuLasagne: "لازانيا",
    menuLasagneText: "خضروات، أجبان، لحم مفروم، صلصة طماطم، توابل وبهارات",
    menuButternutPumpkin: "يقطين بتلي",
    menuButternutPumpkinText: "صناعة التنضيد لوريم إيبسوم هو ببساطة نص شكلي.",
    menuTokusenWagyu: "واغيو توكوسين",
    newBadge: "جديد",
    menuTokusenWagyuText: "خضروات، أجبان، لحم مفروم، صلصة طماطم، توابل وبهارات.",
    menuOlivasRellenas: "زيتون محشو",
    menuOlivasRellenasText: "أفوكادو مع لحم السلطعون، بصل أحمر، سلطة سلطعون محشوة في فلفل أحمر وفلفل أخضر.",
    menuOpuFish: "سمك أوبو",
    menuOpuFishText: "خضروات، أجبان، لحم مفروم، صلصة طماطم، توابل وبهارات",
    menuWinterText1: "خلال الشتاء يوميًا من",
    menuWinterText2: "إلى",

    // testimonials
    testimonialText: "أردت أن أشكركم على دعوتي لتلك العشاء الرائع في الليلة الماضية. كان الطعام استثنائيًا.",

    // reservation
    onlineReservation: "حجز عبر الإنترنت",
    bookingRequestText: "طلب حجز",
    orFillForm: "أو قم بملء استمارة الطلب",
    yourName: "اسمك",
    phoneNumber: "رقم الهاتف",
    messagePlaceholder: "الرسالة",
    person1: "شخص واحد",
    person2: "شخصان",
    person3: "3 أشخاص",
    person4: "4 أشخاص",
    person5: "5 أشخاص",
    person6: "6 أشخاص",
    person7: "7 أشخاص",
    contactUs: "اتصل بنا",
    location: "الموقع",
    reservationAddress: "مطعم وجبات سريعة، <br>\n                الميلية، جيجل، الجزائر",
    lunchTime: "وقت الغداء",
    lunchTimeText: "من الإثنين إلى الأحد <br>\n                11.00 صباحًا - 2.30 مساءً",
    dinnerTime: "وقت العشاء",
    dinnerTimeText: "من الإثنين إلى الأحد <br>\n                05.00 مساءً - 10.00 مساءً",

    // features
    whyChooseUs: "لماذا تختارنا",
    ourStrength: "قوتنا",
    hygienicFoodTitle: "طعام صحي",
    hygienicFoodText: "نحرص على تحضير كل طبق باستخدام مكونات طازجة وعالية الجودة مع الحفاظ على أعلى معايير النظافة.",
    freshEnvironmentTitle: "أجواء منعشة",
    freshEnvironmentText: "مكان مرحب حيث يمكن للعائلات والأصدقاء الاستمتاع بطعام لذيذ وخلق لحظات لا تُنسى معًا.",
    skilledChefsTitle: "طهاة ماهرون",
    skilledChefsText: "يضع طهاتنا الشغف والعناية في كل طبق لتقديم مذاق رائع وتجربة مُرضية.",
    eventPartyTitle: "المناسبات والحفلات",
    eventPartyText: "سواء كانت وجبة عائلية، احتفالًا، أو لقاءً مع الأصدقاء، فاميلي فود هو المكان المثالي للاستمتاع بطعام جيد معًا.",

    // event
    recentUpdates: "آخر التحديثات",
    upcomingEvent: "الفعالية القادمة",
    foodFlavour: "طعام، نكهة",
    healthyFood: "طعام صحي",
    recipie: "وصفة",
    flavourQuote: "نكهة رائعة لدرجة أنك ستحاول تذوقها بعينيك.",
    viewOurBlog: "تصفح مدونتنا",

    // footer
    footerAddress: "مطعم وجبات سريعة، الميلية، جيجل، الجزائر",
    footerBookingLabel: "طلب حجز :",
    openLabel: "أوقات العمل :",
    getNewsOffers: "احصل على الأخبار والعروض",
    subscribeUsGet: "اشترك معنا واحصل على",
    offPercent: "خصم 25%.",
    yourEmail: "بريدك الإلكتروني",
    subscribeBtn: "اشترك",
    allRightsReserved: "جميع الحقوق محفوظة",
    craftedBy: "تصميم",

    // رسائل نموذج الحجز
    reservationSuccess: "تم استلام طلب حجزك بنجاح. سنتصل بك قريبًا للتأكيد.",
    reservationError: "حدث خطأ أثناء إرسال الحجز. حاول مرة أخرى أو اتصل بنا مباشرة.",
    reservationMissingFields: "الرجاء تعبئة الاسم ورقم الهاتف والتاريخ.",
    reservationPastDate: "يرجى اختيار تاريخ ووقت لم يفوتا بعد.",
    reservationTimeout: "الاتصال ضعيف ولم نتمكن من تأكيد وصول طلبك. يرجى الاتصال بنا للتأكد.",
    reservationTooFast: "لقد أرسلت طلبًا للتو، يرجى الانتظار قليلًا قبل إرسال طلب آخر."
  }
};



let currentLanguage =
  localStorage.getItem("familyFoodLanguage") || "en";

function setLanguage(language) {
  currentLanguage = language;

  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";

  localStorage.setItem("familyFoodLanguage", language);

  // translate text content (innerHTML is used so that translations
  // containing a line-break <br> keep working exactly like the original)
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;

    if (translations[language][key] !== undefined) {
      element.innerHTML = translations[language][key];
    }
  });

  // translate placeholder attributes (inputs / textareas)
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    const key = element.dataset.i18nPlaceholder;

    if (translations[language][key] !== undefined) {
      element.setAttribute("placeholder", translations[language][key]);
    }
  });

  // the button shows the language you can switch TO
  const activeLanguage = languageBtn.querySelector(".lang-active");

  activeLanguage.textContent =
    language === "ar" ? "English" : "العربية";

  // keep the live menu (loaded from the admin dashboard) in sync with the
  // currently selected language every time it changes
  renderLiveMenu(language);
}

languageBtn.addEventListener("click", () => {
  const newLanguage = currentLanguage === "en" ? "ar" : "en";

  setLanguage(newLanguage);
});

// NOTE: setLanguage(currentLanguage) is called at the very END of this file.
// It must run after "liveDishes" (below) has been declared, otherwise the
// whole script crashes here and neither the live menu nor the reservation
// form would ever start.



/**
 * FIREBASE (same project as admin.html)
 */

const firebaseConfig = {
  apiKey: "AIzaSyBFJygYBGyD2KeMj97ScKj4If1_CwV61vY",
  authDomain: "family-food-953e8.firebaseapp.com",
  projectId: "family-food-953e8",
  storageBucket: "family-food-953e8.firebasestorage.app",
  messagingSenderId: "649395221737",
  appId: "1:649395221737:web:6e22a396e38ad85e1e6c78"
};

// Firebase is initialized once and shared by both the live menu (below)
// and the table-reservation form, regardless of which page loads.
let firestoreDb = null;

function getDb() {
  if (firestoreDb) return firestoreDb;

  if (typeof firebase === "undefined") {
    throw new Error("Firebase scripts did not load");
  }

  if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

  firestoreDb = firebase.firestore();

  // Long-polling works on connections where the default streaming
  // connection to Firestore hangs (the usual reason a save never finishes).
  // Must be called once, before the first Firestore request.
  firestoreDb.settings({ experimentalForceLongPolling: true });

  return firestoreDb;
}

// gives up waiting after a while instead of hanging forever
function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then(
      (value) => { clearTimeout(timer); resolve(value); },
      (error) => { clearTimeout(timer); reject(error); }
    );
  });
}

// today's date as YYYY-MM-DD in the visitor's own time zone
function localISODate(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
}



/**
 * LIVE MENU (loaded from Firebase — same database used by the admin
 * dashboard). Dishes added/edited/removed from admin.html appear here
 * automatically and in real time, in the language currently selected.
 * If no dishes have been added yet (or the connection fails), the
 * original static menu cards already in the HTML stay untouched.
 */

let liveDishes = null; // null = not loaded yet, [] = loaded but empty

function escapeHtmlForMenu(str) {
  if (str === undefined || str === null) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function liveBadgeLabel(code, language) {
  if (code === "new") return translations[language].newBadge;
  if (code === "seasonal") return translations[language].seasonal;
  return "";
}

function buildLiveMenuCard(dish, language) {
  const name = language === "ar"
    ? (dish.name_ar || dish.name_en || "")
    : (dish.name_en || dish.name_ar || "");

  const description = language === "ar"
    ? (dish.description_ar || dish.description_en || "")
    : (dish.description_en || dish.description_ar || "");

  const badgeText = dish.badge ? liveBadgeLabel(dish.badge, language) : "";
  const badgeHtml = badgeText
    ? `<span class="badge label-1">${escapeHtmlForMenu(badgeText)}</span>`
    : "";

  const image = dish.image || "./assets/images/menu-1.png";
  const price = Number(dish.price) || 0;

  return `
    <li>
      <div class="menu-card hover:card">

        <figure class="card-banner img-holder" style="--width: 100; --height: 100;">
          <img src="${escapeHtmlForMenu(image)}" width="100" height="100" loading="lazy"
            alt="${escapeHtmlForMenu(name)}" class="img-cover">
        </figure>

        <div>

          <div class="title-wrapper">
            <h3 class="title-3">
              <a href="#" class="card-title">${escapeHtmlForMenu(name)}</a>
            </h3>

            ${badgeHtml}

            <span class="span title-2">${price.toLocaleString("ar-DZ")} دج</span>
          </div>

          <p class="card-text label-1">${escapeHtmlForMenu(description)}</p>

        </div>

      </div>
    </li>
  `;
}

function renderLiveMenu(language) {
  if (!liveDishes || liveDishes.length === 0) return; // keep static fallback

  const menuGrid = document.getElementById("menuGridList");
  if (!menuGrid) return;

  menuGrid.removeAttribute("data-static-fallback");
  menuGrid.innerHTML = liveDishes
    .map((dish) => buildLiveMenuCard(dish, language))
    .join("");
}

function startLiveMenu() {
  const menuGrid = document.getElementById("menuGridList");
  if (!menuGrid) return; // this page has no menu grid (not menu.html) — skip entirely

  try {
    const db = getDb();

    db.collection("dishes")
      .where("available", "==", true)
      .onSnapshot(
        (snapshot) => {
          liveDishes = snapshot.docs
            .map((doc) => doc.data())
            // newest dish first
            .sort((a, b) => {
              const sec = (d) => (d.createdAt && d.createdAt.seconds) ? d.createdAt.seconds : 0;
              return sec(b) - sec(a);
            });
          renderLiveMenu(currentLanguage);
        },
        (error) => {
          // connection/permission issue: silently keep the static menu
          console.warn("Live menu unavailable, showing static menu.", error.code, error.message);
        }
      );
  } catch (error) {
    console.warn("Live menu unavailable, showing static menu.", error);
  }
}



/**
 * TABLE RESERVATIONS (reservation.html)
 *
 * Submits the existing "Online Reservation" form straight to Firebase —
 * the same database the admin dashboard reads from, so every booking a
 * visitor makes appears there automatically and in real time.
 * Guarded so pages without this form (every page except reservation.html)
 * simply skip it.
 */

function showReservationFeedback(message, isError) {
  const feedback = document.getElementById("reservationFeedback");
  if (!feedback) return;
  feedback.textContent = message;
  feedback.style.display = "block";
  feedback.style.color = isError ? "hsl(4, 70%, 58%)" : "hsl(38, 61%, 73%)";
}

// "07 : 00 pm" (the text shown in the time list) -> "19:00"
function readSelectedTime(selectEl) {
  const label = selectEl.options[selectEl.selectedIndex].textContent;
  const match = label.match(/(\d{1,2})\s*:\s*(\d{2})\s*(am|pm)/i);
  if (!match) return selectEl.value;

  let hours = parseInt(match[1], 10);
  const isPm = match[3].toLowerCase() === "pm";
  if (isPm && hours < 12) hours += 12; // 12 stays 12 (the list uses "12 : 00 am" for noon)

  return String(hours).padStart(2, "0") + ":" + match[2];
}

function startReservationForm() {
  const form = document.getElementById("reservationForm");
  if (!form) return; // not on this page

  const dateInput = form.elements["reservation-date"];
  if (dateInput) dateInput.min = localISODate();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitBtn = document.getElementById("reservationSubmitBtn");

    const name = form.elements["name"].value.trim();
    const phone = form.elements["phone"].value.trim();
    const persons = parseInt(form.elements["person"].value, 10) || 1;
    const date = form.elements["reservation-date"].value;
    const time = readSelectedTime(form.elements["time"]);
    const message = form.elements["message"].value.trim();

    if (!name || !phone || !date) {
      showReservationFeedback(translations[currentLanguage].reservationMissingFields, true);
      return;
    }

    // the date/time must not be in the past
    const now = new Date();
    const today = localISODate(now);
    const [hours, minutes] = time.split(":").map(Number);
    if (date < today || (date === today && hours * 60 + minutes < now.getHours() * 60 + now.getMinutes())) {
      showReservationFeedback(translations[currentLanguage].reservationPastDate, true);
      return;
    }

    // one request every 30 seconds per browser
    try {
      const last = Number(localStorage.getItem("familyFoodLastReservation")) || 0;
      if (Date.now() - last < 30000) {
        showReservationFeedback(translations[currentLanguage].reservationTooFast, true);
        return;
      }
    } catch (e) { /* private mode: skip */ }

    if (submitBtn) submitBtn.setAttribute("disabled", "true");

    try {
      const db = getDb();

      await withTimeout(
        db.collection("reservations").add({
          name: name,
          phone: phone,
          persons: persons,
          date: date,
          time: time,
          message: message,
          status: "pending",
          lang: currentLanguage,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }),
        20000
      );

      try { localStorage.setItem("familyFoodLastReservation", String(Date.now())); } catch (e) { /* ignore */ }

      form.reset();
      showReservationFeedback(translations[currentLanguage].reservationSuccess, false);

    } catch (error) {
      console.warn("Reservation submit failed.", error);
      showReservationFeedback(
        error && error.message === "timeout"
          ? translations[currentLanguage].reservationTimeout
          : translations[currentLanguage].reservationError,
        true
      );

    } finally {
      if (submitBtn) submitBtn.removeAttribute("disabled");
    }
  });
}



/**
 * START
 * (order matters: everything above is declared before these calls)
 */

setLanguage(currentLanguage);
startLiveMenu();
startReservationForm();