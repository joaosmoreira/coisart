import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User.js';
import { Seller } from './models/Seller.js';
import { Category } from './models/Category.js';
import { Product } from './models/Product.js';
import { Order } from './models/Order.js';

dotenv.config();
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/coisart';

// Fotos com dimensões/aspect ratios dinâmicos (verticais longas, quadradas, horizontais, retratos)
const photoCatalog = [
  { url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&h=1100&fit=crop', aspect: 'portrait-tall' },
  { url: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=800&h=800&fit=crop', aspect: 'square' },
  { url: 'https://images.unsplash.com/photo-1612196808214-b7e239e5f6b7?w=800&h=1200&fit=crop', aspect: 'portrait-extra-tall' },
  { url: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=800&h=600&fit=crop', aspect: 'landscape' },
  { url: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?w=800&h=1000&fit=crop', aspect: 'portrait' },
  { url: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&h=1200&fit=crop', aspect: 'portrait-extra-tall' },
  { url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&h=750&fit=crop', aspect: 'portrait' },
  { url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&h=1100&fit=crop', aspect: 'portrait-tall' },
  { url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&h=600&fit=crop', aspect: 'landscape' },
  { url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&h=1000&fit=crop', aspect: 'portrait' },
  { url: 'https://images.unsplash.com/photo-1578926375605-eaf7559b1458?w=800&h=800&fit=crop', aspect: 'square' },
  { url: 'https://images.unsplash.com/photo-1569172122301-bc5008bc09c5?w=800&h=1150&fit=crop', aspect: 'portrait-tall' },
  { url: 'https://images.unsplash.com/photo-1584727638096-042c45049ebe?w=800&h=650&fit=crop', aspect: 'landscape' }
];

const catalogDetails = [
  { title: 'Aguarela Botânica Flor de Laranjeira', mat: 'Papel Algodão 300g, Pigmentos Minerais Sennelier', desc: 'Pintada originalmente à mão no atelier com pigmentos naturais sustentáveis. Edição única com assinatura e certificado de autenticidade.' },
  { title: 'Jarra Escultural Orgânica em Cerâmica Fria', mat: 'Gesso Acrílico, Pasta de Cerâmica, Verniz Mate Ecológico', desc: 'Moldada manualmente sem molde industrial. Apresenta textura tátil suave e acabamento protetor contra humidade.' },
  { title: 'Bastidor Bordado Flor de Lótus em Seda', mat: 'Linha de Seda Gutermann, Tecido de Linho Cru, Bastidor de Bambu', desc: 'Ponto de bordado livre tradicional executado durante mais de 18 horas de trabalho artesanal paciente.' },
  { title: 'Tábua de Servir em Madeira de Nogueira', mat: 'Madeira de Nogueira Portuguesa Maciça, Óleo Mineral Alimentar', desc: 'Trabalhada à mão a partir de madeira recuperada de desbaste sustentável. Tratada com óleos 100% seguros para alimentos.' },
  { title: 'Ukulele Soprano de Autor em Acácia', mat: 'Madeira de Acácia das Ilhas, Escala em Ébano, Cordas Aquila', desc: 'Construído artesanalmente pelo luthier com afinação precisa, ressonância quente e acabamento acetinado.' },
  { title: 'Figura Escultórica Guardião da Floresta', mat: 'Resina Ecológica de Origem Vegetal, Pintura Acrílica de Autor', desc: 'Escultura colecionável modelada manualmente com pormenores em relevo e pintura de minúcia artesanal.' },
  { title: 'Tapeçaria em Macramé Nó de Algodão Cru', mat: 'Cordão de Algodão 100% Reciclado, Ramo de Oliveira Tratado', desc: 'Tapeçaria de parede urdida com nós complexos de macramé, criando relevações e franjas orgânicas.' },
  { title: 'Brincos Escultóricos de Obsidiana e Prata', mat: 'Pedra Obsidiana Natural, Prata de Lei 925 Reciclada', desc: 'Design exclusivo de joalharia contemporânea, combinando pedras vulcânicas lapidadas à mão.' },
  { title: 'Caderno de Notas Encadernação Manual em Couro', mat: 'Papel Reciclado de 100g, Couro Vegetal com Pátina Manual', desc: 'Costurado à mão com ponto copta e capa flexível em couro para registos e esboços diários.' },
  { title: 'Ilustração Artística Impressão Giclée Limitada', mat: 'Papel Fine Art Cotton Smooth 300g, Tintas de Pigmento', desc: 'Impressão de alta fidelidade com pigmentos resistentes à luz, assinada e numerada pelo ilustrador.' },
  { title: 'Vaso Suspenso em Macramé de Juta Natural', mat: 'Fibra de Juta Trançada, Anel de Latão Maciço', desc: 'Suporte artesanal para plantas com estrutura reforçada para vasos de cerâmica ou barro.' },
  { title: 'Retrato em Grafite e Carvão sobre Papel Canson', mat: 'Grafite Faber-Castell, Carvão Vegetal, Papel Canson 200g', desc: 'Desenho expressivo de autor captando sombras e luzes com grande minúcia de detalhes.' },
  { title: 'Pintura em Tela Relevos de Argila e Pigmentos', mat: 'Tela de Linho, Argila Natural, Tinta Acrílica e Pigmentos', desc: 'Obra abstrata com pátina tridimensional, inspirada nas falésias e no mar da costa portuguesa.' },
  { title: 'Caixa de Joias em Marcenaria de Carvalho', mat: 'Madeira de Carvalho Nacional, Forro de Veludo de Algodão', desc: 'Caixa feita à mão com encaixes tradicionais em rabo de andorinha e fecho magnético.' },
  { title: 'Suporte para Livros em Gesso Mineral Esculpido', mat: 'Gesso Mineral Alta Densidade, Pigmentos Orgânicos', desc: 'Peça decorativa pesada com geometria contemporânea para organizar a sua biblioteca com estilo.' },
  { title: 'Apanhador de Sonhos Pena de Grou e Quartzo', mat: 'Aro de Salgueiro Flexível, Penas Naturais, Pedra Quartzo', desc: 'Adorno feito à mão com entrelaçado minucioso e pedras naturais carregadas de boas vibrações.' }
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

export const seedDatabase = async () => {
  console.log(`[Seed] Conectando ao MongoDB Community (${mongoURI})...`);
  await mongoose.connect(mongoURI);

  // PRESERVAÇÃO DE AVATARES DE ARTESÃOS EXISTENTES
  const existingSellers = await Seller.find().lean();
  const avatarMap: Record<string, string> = {};
  existingSellers.forEach((s) => {
    if (s.slug && s.avatarUrl && s.avatarUrl.trim()) {
      avatarMap[s.slug] = s.avatarUrl;
    }
  });

  await Promise.all([User.deleteMany({}), Seller.deleteMany({}), Category.deleteMany({}), Product.deleteMany({}), Order.deleteMany({})]);
  const defaultPasswordHash = await bcrypt.hash('Coisart#123', 10);

  await User.create({ email: 'admin@coisart.pt', passwordHash: defaultPasswordHash, role: 'admin' });

  const categories = await Promise.all([
    Category.create({ name: 'Pintura', slug: 'pintura' }),
    Category.create({ name: 'Ilustração', slug: 'ilustracao' }),
    Category.create({ name: 'Bordados', slug: 'bordados' }),
    Category.create({ name: 'Gesso & Cerâmica', slug: 'gesso' }),
    Category.create({ name: 'Alfarrabista / Livros', slug: 'livros' }),
    Category.create({ name: 'Marcenaria', slug: 'marcenaria' }),
    Category.create({ name: 'Instrumentos Musicais', slug: 'instrumentos-musicais' }),
    Category.create({ name: 'Bijuteria & Joalharia', slug: 'bijuteria' }),
    Category.create({ name: 'Macramé & Crochet', slug: 'macrame' }),
    Category.create({ name: 'Papelaria Personalizada', slug: 'papelaria' }),
    Category.create({ name: 'Desenho & Retrato', slug: 'desenho' }),
    Category.create({ name: 'Fotografia (Sem artigos)', slug: 'fotografia' }),
    Category.create({ name: 'Vidro & Arte Tridimensional (Sem artigos)', slug: 'vidro-escultura' })
  ]);

  const defaultAvatars: Record<string, string> = {
    'sofia-pimenta': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
    'joao-costa': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
    'olga': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500',
    'aurora': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500',
    'mafalda-ribeiro': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500',
    'daniela-fernandes': 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500',
    'beatriz-rodrigues': 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500',
    'filipa-martins': 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=500',
    'jessica-costa': 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=500',
    'catia-machado': 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=500',
    'dora-calcada': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500',
    'joana-ferreira': 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=500',
    'filipa-oliveira': 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500',
    'jose-neto': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500',
    'ju-moura': 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=500',
    'lilia-coutinho': 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=500',
    'matilde-marques': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500',
    'francisco-lima': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500',
    'rafaela': 'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=500',
    'fabio-ribeiro': 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500',
    'rita-carvalho': 'https://images.unsplash.com/photo-1534751516642-a171e2614927?w=500',
    'filipa-sobral': 'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=500',
    'macedo': 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=500',
    'raquel-silva': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500',
    'daniela-martins': 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=500'
  };

  const artistsData = [
    { name: 'Sofia Pimenta', slug: 'sofia-pimenta', email: 'sofia.pimenta@coisart.pt', disciplines: ['Bijuteria', 'Pintura'], instagram: ['black.obsidian.art'], bio: 'Exploradora de formas e texturas, combina a sensibilidade da pintura com a delicadeza de peças de bijuteria inspiradas pela pedra obsidiana e tonalidades orgânicas.' },
    { name: 'João Costa', slug: 'joao-costa', email: 'joao.costa@coisart.pt', disciplines: ['Pintura', 'Ilustração'], instagram: ['disco_samurai_'], bio: 'Com um estilo vibrante e ritmado, mistura paletas ousadas na pintura e ilustração contemporânea cheia de movimento e atitude.' },
    { name: 'Olga', slug: 'olga', email: 'olga@coisart.pt', disciplines: ['Crochet'], instagram: ['alma_em_fio_by_olga'], bio: 'Dá vida a fios de algodão com peças tecidas à mão, transformando pontos clássicos em objetos cheios de afeto e aconchego.' },
    { name: 'Aurora', slug: 'aurora', email: 'aurora@coisart.pt', disciplines: ['Cerâmica', 'Pintura'], instagram: ['aurora__artstudio'], bio: 'Criadora de cerâmica artesanal e pinturas expressivas, onde a luz natural e a matéria crua se fundem em criações poéticas.' },
    { name: 'Mafalda Ribeiro', slug: 'mafalda-ribeiro', email: 'mafalda.ribeiro@coisart.pt', disciplines: ['Ilustração', 'Pintura'], instagram: ['purple.rose_____'], bio: 'Ilustradora e pintora fascinada por narrativas visuais, tons mofados e detalhes botânicos e românticos em cada pincelada.' },
    { name: 'Daniela Fernandes', slug: 'daniela-fernandes', email: 'daniela.fernandes@coisart.pt', disciplines: ['Pintura', 'Cerâmica'], instagram: ['danielaplf'], bio: 'Trabalha o encontro entre a fluidez da pintura e a plasticidade da cerâmica, criando peças utilitárias e decorativas repletas de alma.' },
    { name: 'Beatriz Rodrigues', slug: 'beatriz-rodrigues', email: 'beatriz.rodrigues@coisart.pt', disciplines: ['Ilustração', 'Joalharia'], instagram: ['sallybones_ph'], bio: 'Combina o traço gráfico da ilustração com a minúcia da joalharia de autor, esculpindo adornos únicos com toque alternativo e elegante.' },
    { name: 'Filipa Martins', slug: 'filipa-martins', email: 'filipa.martins@coisart.pt', disciplines: ['Cerâmica'], instagram: ['orca.ceramica.7'], bio: 'Dedicada à arte do barro, molda peças cerâmicas com linhas suaves, inspiradas no oceano, na fauna marinha e na simplicidade da natureza.' },
    { name: 'Jéssica Costa', slug: 'jessica-costa', email: 'jessica.costa@coisart.pt', disciplines: ['Bordados'], instagram: ['os.bordados.da.jessica'], bio: 'Bordadeira apaixonada pelo trabalho minucioso de agulha e linha em bastidores, celebrando a arte tradicional portuguesa com frescura.' },
    { name: 'Cátia Machado', slug: 'catia-machado', email: 'catia.machado@coisart.pt', disciplines: ['Artesanato', 'Bijuteria'], instagram: ['by.haiaco'], bio: 'Criadora de bijuteria artesanal e pequenas peças decorativas, utilizando materiais diversificados para criar combinações leves e originais.' },
    { name: 'Dora Calçada', slug: 'dora-calcada', email: 'dora.calcada@coisart.pt', disciplines: ['Macramé'], instagram: ['a_doramacrame'], bio: 'Mestre nos nós do macramé, cria tapeçarias de parede, suportes de plantas e acessórios têxteis que trazem aconchego boho a qualquer espaço.' },
    { name: 'Joana Ferreira', slug: 'joana-ferreira', email: 'joana.ferreira@coisart.pt', disciplines: ['Peças Decorativas'], instagram: ['arte_bug'], bio: 'Exploradora de elementos decorativos únicos, dando vida a objetos artesanais repletos de imaginação, cor e detalhes minuciosos.' },
    { name: 'Filipa Oliveira', slug: 'filipa-oliveira', email: 'filipa.oliveira@coisart.pt', disciplines: ['Pintura', 'Desenho'], instagram: ['ficostaoliveira'], bio: 'Artista plástica focada no desenho expressivo e na pintura figurativa, captando momentos, expressões e sentimentos no papel e na tela.' },
    { name: 'José Neto', slug: 'jose-neto', email: 'jose-neto@coisart.pt', disciplines: ['Desenho', 'Retrato'], instagram: ['artbykonkuer', 'konkuer'], bio: 'Especialista em desenho realista e retratos detalhados a grafite e carvão, eternizando olhares e emoções com enorme precisão técnica.' },
    { name: 'Ju Moura', slug: 'ju-moura', email: 'ju.moura@coisart.pt', disciplines: ['Artesanato', 'Peças Decorativas'], instagram: ['dream.catcher.by.ju'], bio: 'Cria apanhadores de sonhos artesanais e adornos decorativos feitos com penas, pedras e nós carregados de boas energias.' },
    { name: 'Lília Coutinho', slug: 'lilia-coutinho', email: 'lilia.coutinho@coisart.pt', disciplines: ['Papelaria Personalizada'], instagram: ['bindli_pt'], bio: 'Encadernadora e designer de papelaria artesanal, desenvolvendo cadernos, diários e artigos em papel feitos para guardar memórias especiais.' },
    { name: 'Matilde Marques', slug: 'matilde-marques', email: 'matilde.marques@coisart.pt', disciplines: ['Ilustração', 'Desenho'], instagram: ['mmarques333'], bio: 'Ilustradora com estilo delicado e lúdico, dando vida a personagens encantadoras e ilustrações poéticas para todas as idades.' },
    { name: 'Francisco Lima', slug: 'francisco-lima', email: 'francisco.lima@coisart.pt', disciplines: ['Ilustração'], instagram: ['um.qualquer.francisco'], bio: 'Ilustrador e artista gráfico focado em arte urbana, sátira visual e traço dinâmico impresso em serigrafia e papel de alta gramagem.' },
    { name: 'Rafaela', slug: 'rafaela', email: 'rafaela@coisart.pt', disciplines: ['Ilustração'], instagram: ['um.tom.de.rafa'], bio: 'Explora gradientes de cor suaves e tons acolhedores na ilustração digital e tradicional, desenhando momentos do quotidiano com ternura.' },
    { name: 'Fábio Ribeiro', slug: 'fabio-ribeiro', email: 'fabio.ribeiro@coisart.pt', disciplines: ['Pintura'], instagram: ['fabioribeirocanvas__'], bio: 'Pintor contemporâneo especializado em grandes telas acrílicas abstratas, onde a textura espessa da tinta ganha vida própria.' },
    { name: 'Rita Carvalho', slug: 'rita-carvalho', email: 'rita.carvalho@coisart.pt', disciplines: ['Pintura', 'Escultura'], instagram: ['ritacativarte'], bio: 'Artista tridimensional que une a pintura à escultura, explorando materiais mistos para cativar o olhar com relevos e formas orgânicas.' },
    { name: 'Filipa Sobral', slug: 'filipa-sobral', email: 'filipa.sobral@coisart.pt', disciplines: ['Ilustração', 'Arte 3D'], instagram: ['art.by.filli'], bio: 'Criadora multidisciplinar que interliga a ilustração tradicional à arte 3D e modelação tridimensional com um toque lúdico e futurista.' },
    { name: 'Macedo', slug: 'macedo', email: 'macedo@coisart.pt', disciplines: ['Bordados', 'Artesanato'], instagram: ['blackjackatnipp'], bio: 'Artesão irreverente que recria o bordado e o artesanato urbano com grafismos fortes, estética alternativa e grande mestria.' },
    { name: 'Raquel Silva', slug: 'raquel-silva', email: 'raquel.silva@coisart.pt', disciplines: ['Ilustração', 'Cerâmica'], instagram: ['silvasmraquel'], bio: 'Ilustradora e ceramista, aplica o seu universo ilustrado em superfícies cerâmicas moldadas à mão, unindo utilidade e poesia visual.' },
    { name: 'Daniela Martins', slug: 'daniela-martins', email: 'daniela.martins@coisart.pt', disciplines: ['Fotografia'], instagram: ['danielamartins_fotografia'], bio: 'Fotógrafa focada na captura da luz natural, retratos de pessoas e momentos espontâneos da feira, eternizados em impressões de alta qualidade.' }
  ];

  const sellers = [];
  for (let idx = 0; idx < artistsData.length; idx++) {
    const a = artistsData[idx];
    const user = await User.create({ email: a.email, passwordHash: defaultPasswordHash, role: 'seller' });
    const sellerLinks = a.instagram.map(handle => ({
      platform: 'Instagram',
      url: `https://instagram.com/${handle.replace(/^@/, '')}`
    }));

    // Se já existia uma foto guardada no banco pelo utilizador, preserva-a! Caso contrário, usa a foto padrão.
    const preservedAvatar = avatarMap[a.slug];
    const finalAvatarUrl = (preservedAvatar && preservedAvatar.trim()) ? preservedAvatar : (defaultAvatars[a.slug] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500');

    const seller = await Seller.create({
      userId: user._id,
      name: a.name,
      slug: a.slug,
      bio: a.bio,
      avatarUrl: finalAvatarUrl,
      links: sellerLinks,
      disciplines: a.disciplines,
      isFeatured: ['sofia-pimenta', 'joao-costa', 'jessica-costa'].includes(a.slug),
      isActive: true
    });
    sellers.push(seller);
  }

  const productTypes: ('physical_unique' | 'physical_multiple' | 'digital')[] = ['physical_unique', 'physical_multiple', 'digital'];
  const createdProducts = [];

  for (let i = 1; i <= 80; i++) {
    const seller = sellers[i % sellers.length];
    const category = categories[i % categories.length];
    const type = productTypes[i % productTypes.length];
    const itemInfo = catalogDetails[i % catalogDetails.length];
    const photo = photoCatalog[i % photoCatalog.length];
    const photoAlt = photoCatalog[(i + 4) % photoCatalog.length];

    const title = `${itemInfo.title} #${i}`;
    const productSlug = slugify(title);

    const prod = await Product.create({
      sellerId: seller._id,
      categoryId: category._id,
      title,
      slug: productSlug,
      description: `${itemInfo.desc} Criada à mão no atelier de ${seller.name} com inspiração nas tradições artesanais portuguesas.`,
      materials: itemInfo.mat,
      price: Number((16 + (i * 4.15) % 140).toFixed(2)),
      type,
      digitalFileUrl: type === 'digital' ? 'https://coisart.pt/downloads/pacote-arte.zip' : undefined,
      images: [photo.url, photoAlt.url],
      stock: type === 'physical_unique' ? 1 : 12,
      isActive: true,
      isFeatured: i <= 30
    });
    createdProducts.push(prod);
  }

  // Encomendas de Teste
  await Order.create({ customerEmail: 'mariana.silva@exemplo.pt', customerName: 'Mariana Silva', customerPhone: '912 345 678', customerNif: '234567890', customerAddress: { street: 'Rua de Santa Catarina, nº 120', city: 'Porto', postalCode: '4000-442', country: 'Portugal' }, deliveryMethod: 'cafe_pickup', items: [{ productId: createdProducts[0]._id, sellerId: createdProducts[0].sellerId, title: createdProducts[0].title, price: createdProducts[0].price, quantity: 1, type: createdProducts[0].type }], totalAmount: createdProducts[0].price, paymentStatus: 'completed' });
  await Order.create({ customerEmail: 'beatriz.lopes@exemplo.pt', customerName: 'Beatriz Lopes', customerPhone: '918 273 645', customerNif: '289012345', customerAddress: { street: 'Rua das Flores, nº 42', city: 'Porto', postalCode: '4000-123', country: 'Portugal' }, deliveryMethod: 'shipping', shippingAddress: { street: 'Rua das Flores, nº 42', city: 'Porto', postalCode: '4000-123', country: 'Portugal' }, items: [{ productId: createdProducts[1]._id, sellerId: createdProducts[1].sellerId, title: createdProducts[1].title, price: createdProducts[1].price, quantity: 1, type: createdProducts[1].type }], totalAmount: createdProducts[1].price, paymentStatus: 'pending' });

  console.log(`[Seed] Concluído com SUCESSO! 80 artigos com materiais, descrições ricas e slugs perfeitamente coincidentes no MongoDB Community.`);
  await mongoose.disconnect();
};

if (process.argv[1].endsWith('seed.ts')) {
  seedDatabase().catch(err => { console.error('[Seed] Erro:', err); process.exit(1); });
}
