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
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_7843-HizCVvB7xZlVurYSNVGObc1EkhG1Lz.png',
    description: 'Bespoke performance sedan with MANSORY customization and advanced aerodynamics',
    fullDescription: 'The Mansory Performance Sedan represents the pinnacle of automotive luxury and performance engineering. Featuring a striking two-tone design with custom MANSORY specifications, advanced LED lighting technology, and premium hand-stitched interior with yellow accent detailing, this vehicle delivers extraordinary acceleration with a sculptural design that turns heads. Built with precision craftsmanship and innovative materials, it offers an uncompromising driving experience for discerning enthusiasts.',
    features: [
      'Pixel LED headlights and taillights',
      '0-60 in 2.8s',
      '380 mile range',
      'Premium hand-stitched interior'
    ],
    range: '380 miles',
    acceleration: '2.8s 0-60',
    charging: '10-80% in 22 min',
    make: 'MANSORY',
    model: 'Performance Sedan',
    year: 2024,
    color: 'Two-Tone Black & Silver',
    transmission: 'Automatic',
    drive: 'All-Wheel Drive',
    seating: '5 adults',
    display: '16-inch touchscreen',
    topSpeed: '155 mph',
    images: [
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_7843-HizCVvB7xZlVurYSNVGObc1EkhG1Lz.png',
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_7847-GpRENW6zWaneLxHoM8CWtDsjcrpesb.png',
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_7848-5QuDVsmXM13HdwKn1EU9SaYDRgD6lF.png',
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_7844-cxTojzHgHmsPoPMtUxMANs2ZXuQKDY.png',
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_7845-xXHujEhfwdxXShaZsBpJEMnRqEnmjY.png',
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_7842-TKw73c5H6JuepaqYdTBri8UjkvzVlE.png'
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
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_7839-1wZY4L58WilHz821lktr72actL80BR.png',
    description: 'Advanced AI-powered humanoid robot for automation and task assistance',
    fullDescription: 'The Tesla Humanoid Robot represents the future of automation and assistance technology. Powered by advanced AI systems and cutting-edge neural processors, this robot features articulated metal limbs, an integrated display interface, and sophisticated vision systems. Designed to handle complex tasks, learn from interactions, and adapt to various environments, the Tesla robot combines innovative engineering with premium materials for reliable, long-term operation in professional and personal settings.',
    features: [
      'Advanced AI integration with neural processing',
      '5-hour battery life with fast charging',
      'Autonomous task completion and learning',
      'Articulated metal limbs with precision control'
    ],
    range: 'N/A',
    acceleration: 'N/A',
    charging: '8 hours',
    make: 'Tesla',
    model: 'Humanoid Robot',
    year: 2024,
    color: 'Gunmetal Gray & White',
    transmission: 'N/A',
    drive: 'N/A',
    seating: 'N/A',
    display: 'Integrated OLED display interface',
    topSpeed: 'N/A',
    images: [
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_7839-1wZY4L58WilHz821lktr72actL80BR.png',
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_7840-SamIoBws3yJ8swCHvfa9t4NvsdFgxO.png',
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_7846-2hqCBPxQYNqOAVlVoB1JxX23dw2ydt.png',
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_7841-YzXfWhG6vVuON9F378kCz7RAgwuwtv.png'
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
  },
  {
    id: '7',
    name: 'Tesla Model S 2024 – Dual Motor AWD',
    price: 94990,
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_7821-2l6HHhvQzgkyqswKh7Og4ci8mmzftd.png',
    description: 'Luxury electric sedan with dual motor performance and advanced technology',
    fullDescription: 'The Tesla Model S 2024 is a luxury all-electric sedan that delivers exceptional performance, advanced technology, and refined comfort. Built with dual motor all-wheel drive, it offers breathtaking acceleration, extended driving range, and a smooth, quiet ride. With its minimalist interior featuring a massive touchscreen display, premium quilted leather seating, and cutting-edge driver assistance features, the Model S provides an uncompromising premium driving experience for discerning enthusiasts.',
    features: [
      'Dual motor all-wheel drive',
      '0-60 in 3.1s',
      '420 mile range',
      'Premium leather interior'
    ],
    range: '420 miles',
    acceleration: '3.1s 0-60',
    charging: '10-80% in 20 min',
    make: 'Tesla',
    model: 'Model S',
    year: 2024,
    color: 'Pearl White Multi-Coat',
    transmission: 'Automatic',
    drive: 'Dual Motor AWD',
    seating: '5 adults',
    display: '17-inch touchscreen',
    topSpeed: '163 mph',
    images: [
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_7821-2l6HHhvQzgkyqswKh7Og4ci8mmzftd.png',
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_7822-vDI76C7LAw0fAASmnYIaMcMxU1AZ9d.png',
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_7823-RSTeYE9lqKkgUdVhyFHYYwWVdyMSQd.png',
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_7824-EUbMynb4nDM08HKMAGOcU8D3usempM.png',
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_7825-qPDqqp5EMSlj9vRDVZX9I5yXwRnRFO.png'
    ],
    purchasePrice: 94990,
    leasePrice: 1899,
    leaseTerms: '$6,500 down, 36 months, 10,000 miles',
    financePrice: 1999,
    variants: [
      { name: 'Dual Motor AWD', price: 1899 },
      { name: 'Plaid Performance', price: 2399 }
    ]
  },
  {
    id: '8',
    name: 'Tesla Model X Plaid 2024 – Tri Motor AWD',
    price: 108990,
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_7851-SmH9b4czhPBgS9B05EqGrOcDN1CWRp.png',
    description: 'Ultra-performance electric SUV with iconic gull-wing doors and tri-motor power',
    fullDescription: 'The Tesla Model X Plaid 2024 is an ultra-performance electric SUV that sets the standard for luxury and speed. Featuring iconic falcon-wing gull-wing doors, tri-motor all-wheel drive with exceptional acceleration, a spacious seven-seat interior, and a premium quilted leather cabin with advanced technology integration, the Model X Plaid delivers thrilling performance with uncompromising comfort. The sophisticated control center offers intuitive vehicle management and entertainment across multiple touchscreen displays.',
    features: [
      'Tri-motor all-wheel drive',
      '0-60 in 2.5s',
      '348 mile range',
      'Iconic gull-wing doors'
    ],
    range: '348 miles',
    acceleration: '2.5s 0-60',
    charging: '10-80% in 18 min',
    make: 'Tesla',
    model: 'Model X Plaid',
    year: 2024,
    color: 'Pearl White Multi-Coat',
    transmission: 'Automatic',
    drive: 'Tri-Motor AWD',
    seating: '7 adults',
    display: '17-inch + 8-inch touchscreens',
    topSpeed: '163 mph',
    images: [
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_7851-SmH9b4czhPBgS9B05EqGrOcDN1CWRp.png',
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_7850-rCzdxDibiZiSdUZQvpABJ53nP4czYK.png',
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_7854-SiZlxHFDlZ9HwOjSW6UtngZ7CM85pT.png',
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_7852-stTkNg68Um7wbUWrcc0dS4rDfqRUAY.png',
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_7853-Gba4tOIwNhPwcohUAl0gYlsesGC2wg.png',
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_7849-4HlSdewB7bE1pDifuWE27LtKE3inja.png'
    ],
    purchasePrice: 108990,
    leasePrice: 2499,
    leaseTerms: '$8,000 down, 36 months, 10,000 miles',
    financePrice: 2699,
    variants: [
      { name: 'Plaid Tri-Motor', price: 2499 },
      { name: 'Plaid Plus Performance', price: 2999 }
    ]
  }
];
