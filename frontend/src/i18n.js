import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Auth
      welcome: 'Welcome to Farmer Marketplace',
      enterPhone: 'Enter your phone number',
      phoneNumber: 'Phone Number',
      sendOTP: 'Send OTP',
      verifyOTP: 'Verify OTP',
      enterOTP: 'Enter the OTP sent to your phone',
      otpCode: 'OTP Code',
      selectRole: 'I am a',
      farmer: 'Farmer',
      consumer: 'Consumer',
      yourName: 'Your Name',
      register: 'Register',
      login: 'Login',

      // Farmer Dashboard
      dashboard: 'Dashboard',
      myProducts: 'My Products',
      orders: 'Orders',
      profile: 'Profile',
      settings: 'Settings',
      addProduct: 'Add Product',
      editProduct: 'Edit Product',
      productName: 'Product Name',
      description: 'Description',
      category: 'Category',
      price: 'Price',
      unit: 'Unit',
      quantity: 'Quantity Available',
      harvestDate: 'Harvest Date',
      availabilityDate: 'Availability Date',
      organic: 'Organic',
      uploadPhotos: 'Upload Photos',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',

      // Farm Profile
      farmName: 'Farm Name',
      bio: 'Bio',
      location: 'Location',
      deliveryRadius: 'Delivery Radius (km)',
      supportsPickup: 'Supports Pickup',
      supportsDelivery: 'Supports Delivery',
      language: 'Preferred Language',

      // Consumer
      marketplace: 'Marketplace',
      cart: 'Cart',
      myOrders: 'My Orders',
      search: 'Search products...',
      filterByCategory: 'Filter by Category',
      sortBy: 'Sort By',
      addToCart: 'Add to Cart',
      checkout: 'Checkout',

      // Orders
      orderNumber: 'Order #',
      status: 'Status',
      placed: 'Placed',
      confirmed: 'Confirmed',
      ready: 'Ready',
      completed: 'Completed',
      cancelled: 'Cancelled',
      total: 'Total',
      subtotal: 'Subtotal',
      platformFee: 'Platform Fee',
      fulfillmentType: 'Fulfillment Type',
      pickup: 'Pickup',
      delivery: 'Delivery',

      // Common
      logout: 'Logout',
      back: 'Back',
      next: 'Next',
      submit: 'Submit',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      confirm: 'Confirm',

      // Units
      kg: 'kg',
      lb: 'lb',
      each: 'each',
      bunch: 'bunch',
      dozen: 'dozen',

      // Categories
      vegetables: 'Vegetables',
      fruits: 'Fruits',
      grains: 'Grains',
      dairy: 'Dairy',
      eggs: 'Eggs',
      honey: 'Honey',
      herbs: 'Herbs',
      flowers: 'Flowers',
      other: 'Other',
    }
  },
  hi: {
    translation: {
      // Auth
      welcome: 'किसान बाजार में आपका स्वागत है',
      enterPhone: 'अपना फ़ोन नंबर दर्ज करें',
      phoneNumber: 'फ़ोन नंबर',
      sendOTP: 'OTP भेजें',
      verifyOTP: 'OTP सत्यापित करें',
      enterOTP: 'अपने फ़ोन पर भेजा गया OTP दर्ज करें',
      otpCode: 'OTP कोड',
      selectRole: 'मैं हूँ',
      farmer: 'किसान',
      consumer: 'उपभोक्ता',
      yourName: 'आपका नाम',
      register: 'पंजीकरण करें',
      login: 'लॉग इन करें',

      // Farmer Dashboard
      dashboard: 'डैशबोर्ड',
      myProducts: 'मेरे उत्पाद',
      orders: 'ऑर्डर',
      profile: 'प्रोफ़ाइल',
      settings: 'सेटिंग्स',
      addProduct: 'उत्पाद जोड़ें',
      editProduct: 'उत्पाद संपादित करें',
      productName: 'उत्पाद का नाम',
      description: 'विवरण',
      category: 'श्रेणी',
      price: 'मूल्य',
      unit: 'इकाई',
      quantity: 'उपलब्ध मात्रा',
      harvestDate: 'फसल की तारीख',
      availabilityDate: 'उपलब्धता तिथि',
      organic: 'जैविक',
      uploadPhotos: 'फ़ोटो अपलोड करें',
      save: 'सहेजें',
      cancel: 'रद्द करें',
      delete: 'हटाएं',

      // Farm Profile
      farmName: 'खेत का नाम',
      bio: 'परिचय',
      location: 'स्थान',
      deliveryRadius: 'डिलीवरी त्रिज्या (किमी)',
      supportsPickup: 'पिकअप समर्थित',
      supportsDelivery: 'डिलीवरी समर्थित',
      language: 'पसंदीदा भाषा',

      // Consumer
      marketplace: 'बाज़ार',
      cart: 'कार्ट',
      myOrders: 'मेरे ऑर्डर',
      search: 'उत्पाद खोजें...',
      filterByCategory: 'श्रेणी के अनुसार फ़िल्टर करें',
      sortBy: 'इसके अनुसार क्रमबद्ध करें',
      addToCart: 'कार्ट में जोड़ें',
      checkout: 'चेकआउट',

      // Orders
      orderNumber: 'ऑर्डर #',
      status: 'स्थिति',
      placed: 'रखा गया',
      confirmed: 'पुष्टि की गई',
      ready: 'तैयार',
      completed: 'पूर्ण',
      cancelled: 'रद्द',
      total: 'कुल',
      subtotal: 'उप योग',
      platformFee: 'प्लेटफ़ॉर्म शुल्क',
      fulfillmentType: 'पूर्ति प्रकार',
      pickup: 'पिकअप',
      delivery: 'डिलीवरी',

      // Common
      logout: 'लॉग आउट',
      back: 'वापस',
      next: 'अगला',
      submit: 'जमा करें',
      loading: 'लोड हो रहा है...',
      error: 'त्रुटि',
      success: 'सफलता',
      confirm: 'पुष्टि करें',

      // Units
      kg: 'किलो',
      lb: 'पाउंड',
      each: 'प्रत्येक',
      bunch: 'गुच्छा',
      dozen: 'दर्जन',

      // Categories
      vegetables: 'सब्जियाँ',
      fruits: 'फल',
      grains: 'अनाज',
      dairy: 'डेयरी',
      eggs: 'अंडे',
      honey: 'शहद',
      herbs: 'जड़ी बूटी',
      flowers: 'फूल',
      other: 'अन्य',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
