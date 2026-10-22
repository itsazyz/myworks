-- Do not insert into public.owner. Create that row manually after the user exists.

insert into public.site_settings (
  id,
  name_ar,
  name_en,
  title_ar,
  title_en,
  intro_ar,
  intro_en,
  footer_ar,
  footer_en,
  email,
  linkedin,
  github
) values (
  1,
  'عبدالعزيز',
  'Abdulaziz',
  'مبرمج',
  'Software developer',
  'هذه الأعمال التي بنيتها أو أبنيها الآن.',
  'Work I have built, or am building now.',
  'الرياض',
  'Riyadh',
  '',
  '',
  ''
);

insert into public.projects (
  slug,
  name_ar,
  name_en,
  desc_ar,
  desc_en,
  url,
  tags,
  shots,
  position,
  published
) values
(
  'qualia54',
  'Qualia54',
  'Qualia54',
  'أدوات جودة وفق ISO 10009. صف مشكلة في الورشة أو افتح أداة، ارفع البيانات، نفّذ التحليل، واحتفظ بمسار الحالة.',
  'Quality tools for ISO 10009. Describe a shop-floor problem or open a tool, upload data, run the analysis, and keep a case trail.',
  'https://qualia54.vercel.app',
  array['ISO 10009', 'Quality tools', 'Vercel'],
  '{}',
  0,
  true
),
(
  'orbit',
  'ORBIT',
  'ORBIT',
  'واجهة مبنية بـ Next.js 14 وSupabase، مع رسوم SVG واتجاه من اليمين إلى اليسار.',
  'Interface built with Next.js 14 and Supabase, SVG graphics, and a right-to-left layout.',
  null,
  array['Next.js 14', 'Supabase', 'SVG', 'RTL'],
  '{}',
  1,
  true
),
(
  'pro-express-network',
  'Pro Express Network',
  'Pro Express Network',
  'سجلات لوجستية بين الشركات على PostgreSQL: الشركاء والشحنات وما يربطهم.',
  'B2B logistics records on PostgreSQL: partners, shipments, and the links between them.',
  null,
  array['PostgreSQL', 'Logistics', 'B2B'],
  '{}',
  2,
  true
);
