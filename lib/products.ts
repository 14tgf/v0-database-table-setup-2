export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  fullDescription?: string;
  features: string[];
  range?: string;
  acceleration?: string;
  charging?: string;
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  transmission?: string;
  drive?: string;
  seating?: string;
  display?: string;
  topSpeed?: string;
  images?: string[];
  purchasePrice?: number;
  leasePrice?: number;
  leaseTerms?: string;
  financePrice?: number;
  variants?: Array<{ name: string; price: number }>;
}

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Tesla Model S Plaid',
    price: 104990,
    image: '/products/model-3.jpeg',
    description: 'Ultimate performance electric sedan with tri-motor power',
    fullDescription: 'The Tesla Model S 2024 is a luxury all-electric sedan that delivers exceptional performance, advanced technology, and refined comfort. Built with dual motor all-wheel drive, it offers breathtaking acceleration, extended driving range, and a smooth, quiet ride. With its minimalist interior, massive touchscreen display, and cutting-edge driver assistance features, the Model S provides a premium driving experience for both city and long-distance travel.',
    features: [
      '200+ mph top speed',
      '1.99s 0-60 acceleration',
      '405 mile range',
      'Autopilot included'
    ],
    range: '405 miles',
    acceleration: '1.99s 0-60',
    charging: '10-80% in 25 min',
    make: 'Tesla',
    model: 'Model S Plaid',
    year: 2024,
    color: 'Pearl White Multi-Coat',
    transmission: 'Automatic',
    drive: 'Tri-Motor AWD',
    seating: '5 adults',
    display: '17-inch touchscreen',
    topSpeed: '200+ mph',
    images: [
      '/products/model-3.jpeg',
      '/products/model-3.jpeg',
      '/products/model-3.jpeg',
      '/products/model-3.jpeg',
      '/products/model-3.jpeg'
    ],
    purchasePrice: 104990,
    leasePrice: 2083,
    leaseTerms: '$7,500 down, 36 months, 10,000 miles',
    financePrice: 2195,
    variants: [
      { name: 'All-Wheel Drive', price: 2083 },
      { name: 'Plaid Tri-Motor', price: 2639 }
    ]
  },
  {
    id: '2',
    name: 'Cyber Cab',
    price: 85500,
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_7798-aurDyqsUEQeKV26eH7ynhDsLY4Dprk.png',
    description: 'Futuristic autonomous electric vehicle with minimalist design',
    fullDescription: 'The Cyber Cab represents the future of autonomous transportation. Featuring an innovative minimalist interior with a steering wheel-optional design, advanced autonomous driving capabilities, and sleek aerodynamic styling, the Cyber Cab offers an unparalleled driving experience with premium materials and cutting-edge technology integration.',
    features: [
      'Autonomous driving ready',
      '0-60 in 3.2s',
      '320 mile range',
      'Gull-wing doors'
    ],
    range: '320 miles',
    acceleration: '3.2s 0-60',
    charging: '10-80% in 28 min',
    make: 'Tesla',
    model: 'Cyber Cab',
    year: 2024,
    color: 'Gold Metallic',
    transmission: 'Automatic',
    drive: 'Front-Wheel Drive',
    seating: '5 adults',
    display: '15-inch touchscreen',
    topSpeed: '125 mph',
    images: [
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_7798-aurDyqsUEQeKV26eH7ynhDsLY4Dprk.png',
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_7836-d7e4eYGBJEshzdfezZ4Zg5KGU7V14E.png',
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_7837-HvgBNemAZorbOgCCQ8HTqsL3J9nayd.png',
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_7838-dDHwtAbQy7ibC0hC1vY24mg9CyZ8kK.png'
    ],
    purchasePrice: 85500,
    leasePrice: 1299,
    leaseTerms: '$5,000 down, 36 months, 10,000 miles',
    financePrice: 1395,
    variants: [
      { name: 'Standard Edition', price: 1299 },
      { name: 'Premium Edition', price: 1599 }
    ]
  },
  {
    id: '3',
    name: 'Mansory Performance Sedan',
    price: 125000,
    image: '/products/mansory-sedan.png',
    description: 'Bespoke performance sedan with MANSORY customization',
    fullDescription: 'The Mansory Performance Sedan represents the pinnacle of automotive luxury and performance. With bespoke customization options, advanced pixel LED technology, and extraordinary acceleration capabilities, this vehicle is designed for those who demand excellence in every detail.',
    features: [
      'Pixel LED headlights',
      '0-60 in 2.8s',
      '380 mile range',
      'Custom MANSORY design'
    ],
    range: '380 miles',
    acceleration: '2.8s 0-60',
    charging: '10-80% in 22 min',
    make: 'MANSORY',
    model: 'Performance Sedan',
    year: 2024,
    color: 'Obsidian Black',
    transmission: 'Automatic',
    drive: 'All-Wheel Drive',
    seating: '5 adults',
    display: '16-inch touchscreen',
    topSpeed: '155 mph',
    images: [
      '/products/mansory-sedan.png',
      '/products/mansory-sedan.png',
      '/products/mansory-sedan.png',
      '/products/mansory-sedan.png'
    ],
    purchasePrice: 125000,
    leasePrice: 2799,
    leaseTerms: '$10,000 down, 36 months, 10,000 miles',
    financePrice: 2899,
    variants: [
      { name: 'Standard Edition', price: 2799 },
      { name: 'Exclusive Edition', price: 3299 }
    ]
  },
  {
    id: '4',
    name: 'Tesla Humanoid Robot',
    price: 25000,
    image: '/products/tesla-robot.png',
    description: 'Advanced AI-powered humanoid robot for automation',
    fullDescription: 'The Tesla Humanoid Robot represents the future of automation and assistance technology. Powered by advanced AI systems, this robot is designed to handle complex tasks, learn from interactions, and adapt to various environments.',
    features: [
      'Advanced AI integration',
      '5-hour battery life',
      'Autonomous task completion',
      'Real-time learning capability'
    ],
    range: 'N/A',
    acceleration: 'N/A',
    charging: '8 hours',
    make: 'Tesla',
    model: 'Humanoid Robot',
    year: 2024,
    color: 'Gunmetal Gray',
    transmission: 'N/A',
    drive: 'N/A',
    seating: 'N/A',
    display: 'Integrated display',
    topSpeed: 'N/A',
    images: [
      '/products/tesla-robot.png',
      '/products/tesla-robot.png',
      '/products/tesla-robot.png'
    ],
    purchasePrice: 25000,
    leasePrice: 599,
    leaseTerms: '$3,000 down, 24 months',
    financePrice: 699,
    variants: [
      { name: 'Standard Model', price: 599 },
      { name: 'Professional Model', price: 799 }
    ]
  },
  {
    id: '5',
    name: 'Tesla Model 3',
    price: 46990,
    image: '/products/model-3.jpeg',
    description: 'Practical and efficient electric sedan for everyday driving',
    fullDescription: 'The Tesla Model 3 is the perfect blend of efficiency, performance, and value. Designed for everyday driving, it offers impressive range, quick acceleration, and access to the extensive Supercharger network for convenient long-distance travel.',
    features: [
      'Dual motor AWD',
      '0-60 in 3.1s',
      '358 mile range',
      'Supercharger network access'
    ],
    range: '358 miles',
    acceleration: '3.1s 0-60',
    charging: '10-80% in 27 min',
    make: 'Tesla',
    model: 'Model 3',
    year: 2024,
    color: 'Solid Black',
    transmission: 'Automatic',
    drive: 'Dual Motor AWD',
    seating: '5 adults',
    display: '15.4-inch touchscreen',
    topSpeed: '145 mph',
    images: [
      '/products/model-3.jpeg',
      '/products/model-3.jpeg',
      '/products/model-3.jpeg',
      '/products/model-3.jpeg'
    ],
    purchasePrice: 46990,
    leasePrice: 429,
    leaseTerms: '$3,500 down, 36 months, 12,000 miles',
    financePrice: 529,
    variants: [
      { name: 'Standard Range Plus', price: 429 },
      { name: 'Long Range', price: 529 }
    ]
  },
  {
    id: '6',
    name: 'Tesla Roadster',
    price: 250000,
    image: '/products/roadster.jpeg',
    description: 'Ultra-high performance electric supercar with incredible acceleration',
    fullDescription: 'The Tesla Roadster is the ultimate electric supercar, combining mind-bending performance with stunning design. With exceptional acceleration, extended range, and cutting-edge technology, it represents the future of high-performance automotive engineering.',
    features: [
      '250 mph top speed',
      '1.9s 0-60 acceleration',
      '620 mile range',
      'Next-gen technology'
    ],
    range: '620 miles',
    acceleration: '1.9s 0-60',
    charging: '10-80% in 15 min',
    make: 'Tesla',
    model: 'Roadster',
    year: 2024,
    color: 'Midnight Silver',
    transmission: 'Automatic',
    drive: 'Tri-Motor AWD',
    seating: '4 adults',
    display: '18-inch touchscreen',
    topSpeed: '250 mph',
    images: [
      '/products/roadster.jpeg',
      '/products/roadster.jpeg',
      '/products/roadster.jpeg',
      '/products/roadster.jpeg',
      '/products/roadster.jpeg'
    ],
    purchasePrice: 250000,
    leasePrice: 5999,
    leaseTerms: '$25,000 down, 36 months, 10,000 miles',
    financePrice: 6499,
    variants: [
      { name: 'Standard', price: 5999 },
      { name: 'Founder Series', price: 7999 }
    ]
  }
];
