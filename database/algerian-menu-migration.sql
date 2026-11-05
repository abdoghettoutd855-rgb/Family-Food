-- Optional one-time migration for the six original sample menu rows.
-- Run in Supabase SQL Editor only if these original English names still exist.
-- Prices are provisional DZD display values and must be approved by the restaurant owner.
-- Local image paths are used by the public menu; admin preview resolves them from /admin/.

begin;

update public.menu_items
set name_ar = 'حميس بالفلفل المشوي',
    name_en = 'Hmiss - Grilled Pepper Salad',
    description_ar = 'فلفل أخضر وطماطم مشوية مع الثوم وزيت الزيتون ورشة كمون.',
    description_en = 'Roasted green peppers and tomatoes with garlic, olive oil and cumin.',
    price = 450,
    image_url = './assets/images/menu-1.jpg'
where lower(trim(name_en)) = 'greek salad';

update public.menu_items
set name_ar = 'شخشوخة',
    name_en = 'Chakhchoukha',
    description_ar = 'رقائق عجين تقليدية مع مرق أحمر غني بالحمص وقطع اللحم الطري.',
    description_en = 'Traditional torn flatbread served with rich red sauce, chickpeas and tender meat.',
    price = 650,
    image_url = './assets/images/menu-2.png'
where lower(trim(name_en)) = 'lasagne';

update public.menu_items
set name_ar = 'طاجين الزيتون',
    name_en = 'Tajine Zitoun',
    description_ar = 'دجاج مع الزيتون الأخضر والجزر والليمون وصلصة معطرة بالتوابل.',
    description_en = 'Chicken with green olives, carrots, lemon and a fragrant spiced sauce.',
    price = 500,
    image_url = './assets/images/menu-3.jpg'
where lower(trim(name_en)) = 'butternut pumpkin';

update public.menu_items
set name_ar = 'كسكس جزائري',
    name_en = 'Algerian Couscous',
    description_ar = 'كسكس مفور مع خضروات موسمية ومرق تقليدي غني بالنكهة.',
    description_en = 'Steamed semolina with seasonal vegetables and traditional broth.',
    price = 900,
    image_url = './assets/images/menu-4.jpg'
where lower(trim(name_en)) = 'tokusen wagyu';

update public.menu_items
set name_ar = 'بوراك',
    name_en = 'Bourek',
    description_ar = 'ورقات مقرمشة محشوة باللحم المفروم والبصل والمعدنوس والبطاطا.',
    description_en = 'Crispy pastry rolls filled with minced meat, onion, parsley and potato.',
    price = 350,
    image_url = './assets/images/menu-5.jpg'
where lower(trim(name_en)) = 'olivas rellenas';

update public.menu_items
set name_ar = 'محاجب',
    name_en = 'Mahajeb',
    description_ar = 'عجين سميد رقيق محشو بمزيج الطماطم والبصل والتوابل.',
    description_en = 'Thin handmade semolina pastry filled with spiced tomato and onion.',
    price = 600,
    image_url = './assets/images/menu-6.jpg'
where lower(trim(name_en)) = 'opu fish';

commit;
